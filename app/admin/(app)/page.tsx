import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { formatMoney } from "@/lib/money";
import { getStoreSettings } from "@/lib/settings";
import Link from "next/link";

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();
  await connectDB();
  const settings = await getStoreSettings();

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
    Product.find({ stock: { $lte: 5 } }).select("name stock sku").limit(8).lean(),
    Order.find({ paymentStatus: "paid" }).select("total createdAt").lean(),
    Order.find().sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString().slice(0, 10), revenue: 0 };
  });
  for (const order of paidOrders) {
    const key = new Date(order.createdAt).toISOString().slice(0, 10);
    const bucket = days.find((day) => day.date === key);
    if (bucket) bucket.revenue += order.total || 0;
  }
  const maxRevenue = Math.max(...days.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Overview</h1>
        <p className="mt-2 text-ink-secondary">Live store metrics from MongoDB.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["Revenue", formatMoney(totalRevenue, settings.currency), "clay-cushion-accent"],
          ["Orders", String(totalOrders), "clay-cushion-support"],
          ["Pending", String(pendingOrders), "clay-cushion-warm"],
          ["Completed", String(completedOrders), "clay-cushion-cool"],
          ["Products", String(totalProducts), "clay-cushion-compare"],
          ["Low stock", String(lowStockProducts.length), "clay-cushion-surface"],
        ].map(([label, value, tone]) => (
          <article key={label} className={`clay-cushion ${tone} p-5`}>
            <p className="text-sm font-semibold text-ink-secondary">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </article>
        ))}
      </div>

      <section className="clay-tray p-6">
        <h2 className="text-2xl font-bold">Revenue (7 days)</h2>
        <div className="mt-6 flex h-40 items-end gap-3">
          {days.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-2xl clay-cushion-accent"
                style={{ height: `${Math.max(8, (day.revenue / maxRevenue) * 100)}%` }}
                title={formatMoney(day.revenue, settings.currency)}
              />
              <span className="text-[11px] text-ink-secondary">{day.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="clay-tray p-6">
          <h2 className="text-2xl font-bold">Recent orders</h2>
          <ul className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <li key={String(order._id)} className="clay-cushion clay-cushion-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="font-bold underline-offset-2 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-sm text-ink-secondary">{order.customer.fullName}</p>
                  </div>
                  <p className="font-semibold">
                    {formatMoney(order.total, settings.currency)}
                  </p>
                </div>
              </li>
            ))}
            {!recentOrders.length ? <p>No orders yet.</p> : null}
          </ul>
        </section>

        <section className="clay-tray p-6">
          <h2 className="text-2xl font-bold">Low stock</h2>
          <ul className="mt-4 space-y-3">
            {lowStockProducts.map((product) => (
              <li key={String(product._id)} className="clay-cushion clay-cushion-warm p-4">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm">Stock: {product.stock}</p>
              </li>
            ))}
            {!lowStockProducts.length ? <p>All products above low-stock threshold.</p> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
