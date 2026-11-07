import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { Order } from "@/models/Order";
import { handleRouteError, jsonOk } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    await connectDB();
    const sp = request.nextUrl.searchParams;
    const filter: Record<string, unknown> = {};

    const q = sp.get("q");
    if (q) {
      filter.$or = [
        { orderNumber: new RegExp(q, "i") },
        { "customer.fullName": new RegExp(q, "i") },
        { "customer.phone": new RegExp(q, "i") },
      ];
    }
    if (sp.get("paymentMethod")) filter.paymentMethod = sp.get("paymentMethod");
    if (sp.get("paymentStatus")) filter.paymentStatus = sp.get("paymentStatus");
    if (sp.get("orderStatus")) filter.orderStatus = sp.get("orderStatus");
    if (sp.get("from") || sp.get("to")) {
      filter.createdAt = {};
      if (sp.get("from")) {
        (filter.createdAt as Record<string, Date>).$gte = new Date(sp.get("from")!);
      }
      if (sp.get("to")) {
        (filter.createdAt as Record<string, Date>).$lte = new Date(sp.get("to")!);
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return jsonOk({
      orders: orders.map((o) => ({ ...o, id: String(o._id) })),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
