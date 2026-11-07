import { connectDB } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { handleRouteError, jsonOk } from "@/lib/api";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    await connectDB();
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalProducts,
      lowStockProducts,
      paidOrders,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.countDocuments({ orderStatus: { $in: ["delivered", "confirmed"] } }),
      Product.countDocuments(),
      Product.find({ stock: { $lte: 5 } })
        .select("name stock sku")
        .limit(10)
        .lean(),
      Order.find({ paymentStatus: "paid" }).select("total createdAt").lean(),
      Order.find().sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    const totalRevenue = paidOrders.reduce(
      (sum, o) => sum + (o.total || 0),
      0
    );

    const days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, revenue: 0, orders: 0 });
    }

    for (const order of paidOrders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      const bucket = days.find((day) => day.date === key);
      if (bucket) {
        bucket.revenue += order.total || 0;
        bucket.orders += 1;
      }
    }

    return jsonOk({
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalProducts,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts: lowStockProducts.map((p) => ({
        id: String(p._id),
        name: p.name,
        stock: p.stock,
        sku: p.sku,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: String(o._id),
        orderNumber: o.orderNumber,
        customer: o.customer.fullName,
        total: o.total,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      })),
      revenueChart: days,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
