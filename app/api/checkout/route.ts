import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations";
import { quoteOrder, reserveStock, restockItems } from "@/lib/commerce";
import { createOrderNumber } from "@/lib/order-number";
import { Order } from "@/models/Order";
import { PromoCode } from "@/models/PromoCode";
import { getStoreSettings } from "@/lib/settings";
import { createLemonCheckout, isLemonConfigured } from "@/lib/lemonsqueezy";
import { notifyOrderCreated } from "@/lib/email";
import { handleRouteError, jsonCreated, jsonError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const limited = rateLimit(`checkout:${ip}`, 10, 60_000);
    if (!limited.ok) {
      return jsonError("Too many checkout attempts. Try again shortly.", 429);
    }

    const body = checkoutSchema.parse(await request.json());
    await connectDB();
    const settings = await getStoreSettings();

    if (body.paymentMethod === "cod" && !settings.paymentMethods.cod) {
      return jsonError("Cash on delivery is disabled", 400);
    }
    if (body.paymentMethod === "lemonsqueezy") {
      if (!settings.paymentMethods.lemonsqueezy || !isLemonConfigured()) {
        return jsonError(
          "Online payment is not available. Configure Lemon Squeezy and enable it in settings.",
          400
        );
      }
      if (!body.customer.email) {
        return jsonError("Email is required for online payment", 400);
      }
    }

    if (body.idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey: body.idempotencyKey });
      if (existing) {
        return jsonCreated({
          order: serializeOrder(existing),
          checkoutUrl: null,
          reused: true,
        });
      }
    }

    const customerKey = body.customer.email || body.customer.phone;
    const quote = await quoteOrder({
      lines: body.lines,
      promoCode: body.promoCode,
      city: body.customer.city,
      customerKey,
    });

    const orderNumber = createOrderNumber();
    const paymentStatus =
      body.paymentMethod === "cod" ? "unpaid" : "pending";
    const orderStatus =
      body.paymentMethod === "cod" ? "pending" : "pending";

    // COD: reserve stock immediately. Online: reserve only after paid webhook
    // (hold none permanently for unpaid). Soft-check stock now, reserve on COD.
    let stockReserved = false;
    if (body.paymentMethod === "cod") {
      await reserveStock(
        quote.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );
      stockReserved = true;
    } else {
      // Ensure stock exists at checkout time without decrementing yet.
      for (const item of quote.items) {
        if (item.stock < item.quantity) {
          return jsonError(`Insufficient stock for ${item.name}`, 400);
        }
      }
    }

    let order;
    try {
      order = await Order.create({
        orderNumber,
        customer: {
          fullName: body.customer.fullName,
          phone: body.customer.phone,
          email: body.customer.email || "",
          country: body.customer.country,
          city: body.customer.city,
          address: body.customer.address,
          notes: body.customer.notes || "",
        },
        items: quote.items,
        subtotal: quote.subtotal,
        discountAmount: quote.discountAmount,
        shippingCharges: quote.shippingCharges,
        total: quote.total,
        promoCode: quote.promoCode,
        paymentMethod: body.paymentMethod,
        paymentStatus,
        orderStatus,
        stockReserved,
        idempotencyKey: body.idempotencyKey,
      });
    } catch (error) {
      if (stockReserved) {
        await restockItems(
          quote.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }))
        );
      }
      throw error;
    }

    if (quote.promoCode) {
      await PromoCode.findOneAndUpdate(
        { code: quote.promoCode },
        { $inc: { usedCount: 1 } }
      );
    }

    let checkoutUrl: string | null = null;
    if (body.paymentMethod === "lemonsqueezy") {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
      const checkout = await createLemonCheckout({
        orderNumber: order.orderNumber,
        email: body.customer.email,
        name: body.customer.fullName,
        amount: order.total,
        redirectUrl: `${appUrl}/order/${order.orderNumber}?paid=1`,
      });
      order.lemonSqueezy = {
        checkoutId: checkout.id,
        orderId: "",
        eventIds: [],
      };
      await order.save();
      checkoutUrl = checkout.url;
    } else {
      await notifyOrderCreated({
        orderNumber: order.orderNumber,
        customer: order.customer,
        total: order.total,
        paymentMethod: order.paymentMethod,
      });
    }

    return jsonCreated({
      order: serializeOrder(order),
      checkoutUrl,
      reused: false,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

function serializeOrder(order: {
  orderNumber: string;
  customer: unknown;
  items: unknown;
  subtotal: number;
  discountAmount: number;
  shippingCharges: number;
  total: number;
  promoCode: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt?: Date;
}) {
  return {
    orderNumber: order.orderNumber,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    shippingCharges: order.shippingCharges,
    total: order.total,
    promoCode: order.promoCode,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
  };
}
