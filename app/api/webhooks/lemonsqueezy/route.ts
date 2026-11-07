import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { reserveStock } from "@/lib/commerce";
import { verifyLemonWebhookSignature } from "@/lib/lemonsqueezy";
import { notifyOrderCreated } from "@/lib/email";
import { jsonError, jsonOk } from "@/lib/api";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  const valid = await verifyLemonWebhookSignature(rawBody, signature);
  if (!valid) {
    return jsonError("Invalid signature", 401);
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta?.event_name as string | undefined;
  const eventId = String(payload.meta?.event_id || payload.data?.id || "");
  const custom = payload.meta?.custom_data || {};
  const orderNumber =
    custom.order_number ||
    payload.data?.attributes?.checkout_data?.custom?.order_number;

  if (!orderNumber) {
    return jsonError("Missing order_number in webhook", 400);
  }

  await connectDB();
  const order = await Order.findOne({ orderNumber });
  if (!order) {
    return jsonError("Order not found", 404);
  }

  // Idempotent event processing
  if (eventId && order.lemonSqueezy?.eventIds?.includes(eventId)) {
    return jsonOk({ ok: true, duplicate: true });
  }

  if (eventId) {
    order.lemonSqueezy = {
      ...(order.lemonSqueezy || {}),
      eventIds: [...(order.lemonSqueezy?.eventIds || []), eventId],
      orderId: String(payload.data?.id || order.lemonSqueezy?.orderId || ""),
      checkoutId: order.lemonSqueezy?.checkoutId || "",
    };
  }

  if (
    eventName === "order_created" ||
    eventName === "subscription_payment_success"
  ) {
    const status = payload.data?.attributes?.status;
    if (status === "paid" || eventName === "order_created") {
      if (order.paymentStatus !== "paid") {
        if (!order.stockReserved) {
          await reserveStock(
            order.items.map((item: { productId: string; quantity: number }) => ({
              productId: String(item.productId),
              quantity: item.quantity,
            }))
          );
          order.stockReserved = true;
        }
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        await order.save();
        await notifyOrderCreated({
          orderNumber: order.orderNumber,
          customer: order.customer,
          total: order.total,
          paymentMethod: order.paymentMethod,
        });
      } else {
        await order.save();
      }
    }
  } else if (
    eventName === "order_refunded" ||
    eventName === "subscription_payment_failed"
  ) {
    order.paymentStatus =
      eventName === "order_refunded" ? "refunded" : "failed";
    if (eventName === "order_refunded") {
      order.orderStatus = "refunded";
    }
    await order.save();
  } else {
    await order.save();
  }

  return jsonOk({ ok: true });
}
