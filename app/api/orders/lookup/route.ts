import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { orderLookupSchema } from "@/lib/validations";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = orderLookupSchema.parse(await request.json());
    await connectDB();
    const order = await Order.findOne({
      orderNumber: body.orderNumber.trim().toUpperCase(),
      "customer.phone": body.phone.trim(),
    }).lean();

    if (!order) {
      return jsonError("Order not found", 404);
    }

    return jsonOk({
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      items: order.items,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      shippingCharges: order.shippingCharges,
      total: order.total,
      promoCode: order.promoCode,
      customer: {
        fullName: order.customer.fullName,
        city: order.customer.city,
        country: order.customer.country,
      },
      createdAt: order.createdAt,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
