import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { formatMoney } from "@/lib/money";
import { getStoreSettings } from "@/lib/settings";
import { OrderFilters } from "@/components/admin/order-filters";

export const instant = false;

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  await connection();
  const sp = await searchParams;
  await connectDB();
  const settings = await getStoreSettings();

  const filter: Record<string, unknown> = {};
  if (sp.q) {
    filter.$or = [
      { orderNumber: new RegExp(sp.q, "i") },
      { "customer.fullName": new RegExp(sp.q, "i") },
      { "customer.phone": new RegExp(sp.q, "i") },
    ];
  }
  if (sp.paymentMethod) filter.paymentMethod = sp.paymentMethod;
  if (sp.paymentStatus) filter.paymentStatus = sp.paymentStatus;
  if (sp.orderStatus) filter.orderStatus = sp.orderStatus;

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Orders</h1>
      <Suspense fallback={<div className="clay-tray p-4">Loading filters…</div>}>
        <OrderFilters />
      </Suspense>
      <div className="clay-tray table-wrap p-4">
        <table className="clay-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={String(order._id)}>
                <td>
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="font-semibold underline-offset-2 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td>
                  <div>{order.customer.fullName}</div>
                  <div className="text-sm text-ink-secondary">{order.customer.phone}</div>
                </td>
                <td>{formatMoney(order.total, settings.currency)}</td>
                <td>
                  {order.paymentMethod} / {order.paymentStatus}
                </td>
                <td>{order.orderStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length ? <p className="p-4">No orders found.</p> : null}
      </div>
    </div>
  );
}
