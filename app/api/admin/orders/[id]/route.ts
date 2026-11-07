import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { Order } from "@/models/Order";
import { orderStatusSchema } from "@/lib/validations";
import { restockItems } from "@/lib/commerce";
import { notifyOrderStatus } from "@/lib/email";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const { id } = await params;
    await connectDB();
    const order = await Order.findById(id).lean();
    if (!order) return jsonError("Not found", 404);
    return jsonOk({ order: { ...order, id: String(order._id) } });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const { id } = await params;
    const body = orderStatusSchema.parse(await request.json());
    await connectDB();
    const order = await Order.findById(id);
    if (!order) return jsonError("Not found", 404);

    const prevStatus = order.orderStatus;
    if (body.orderStatus) order.orderStatus = body.orderStatus;
    if (body.paymentStatus) order.paymentStatus = body.paymentStatus;

    if (
      body.orderStatus === "cancelled" &&
      prevStatus !== "cancelled" &&
      order.stockReserved
    ) {
      await restockItems(
        order.items.map((item: { productId: string; quantity: number }) => ({
          productId: String(item.productId),
          quantity: item.quantity,
        }))
      );
      order.stockReserved = false;
    }

    await order.save();
    await notifyOrderStatus({
      orderNumber: order.orderNumber,
      customer: order.customer,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });

    return jsonOk({ order: { ...order.toObject(), id: String(order._id) } });
  } catch (err) {
    return handleRouteError(err);
  }
}
