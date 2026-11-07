import Image from "next/image";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { formatMoney } from "@/lib/money";
import { getStoreSettings } from "@/lib/settings";
import { OrderStatusForm } from "@/components/admin/order-status-form";

export const instant = false;

type Props = PageProps<"/admin/orders/[id]">;

export default async function AdminOrderDetailPage({ params }: Props) {
  await connection();
  const { id } = await params;
  await connectDB();
  const [order, settings] = await Promise.all([
    Order.findById(id).lean(),
    getStoreSettings(),
  ]);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{order.orderNumber}</h1>
          <p className="mt-2 text-ink-secondary">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <a
          href={`/admin/invoice/${order._id}`}
          className="clay-btn"
          target="_blank"
          rel="noreferrer"
        >
          Print invoice
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="clay-tray p-5">
          <h2 className="text-xl font-bold">Customer</h2>
          <p className="mt-3">{order.customer.fullName}</p>
          <p>{order.customer.phone}</p>
          <p>{order.customer.email}</p>
          <p className="mt-2 text-ink-secondary">
            {order.customer.address}, {order.customer.city}, {order.customer.country}
          </p>
          {order.customer.notes ? (
            <p className="mt-2 text-sm">Notes: {order.customer.notes}</p>
          ) : null}
        </section>
        <OrderStatusForm
          id={String(order._id)}
          orderStatus={order.orderStatus}
          paymentStatus={order.paymentStatus}
        />
      </div>

      <section className="clay-tray p-5">
        <h2 className="text-xl font-bold">Items</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map(
            (
              item: {
                imageId: string;
                imageUrl: string;
                name: string;
                quantity: number;
                unitPrice: number;
                lineTotal: number;
              },
              index: number
            ) => (
              <li key={`${item.imageId}-${index}`} className="flex gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl clay-well">
                  <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-ink-secondary">
                    {item.quantity} × {formatMoney(item.unitPrice, settings.currency)} ={" "}
                    {formatMoney(item.lineTotal, settings.currency)}
                  </p>
                </div>
              </li>
            )
          )}
        </ul>
        <dl className="mt-5 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.subtotal, settings.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Discount {order.promoCode ? `(${order.promoCode})` : ""}</dt>
            <dd>−{formatMoney(order.discountAmount, settings.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{formatMoney(order.shippingCharges, settings.currency)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Total</dt>
            <dd>{formatMoney(order.total, settings.currency)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
