import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getStoreSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";

export const instant = false;

type Props = PageProps<"/order/[orderNumber]">;

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  await connection();
  const { orderNumber } = await params;
  const sp = await searchParams;
  await connectDB();
  const [order, settings] = await Promise.all([
    Order.findOne({ orderNumber: orderNumber.toUpperCase() }).lean(),
    getStoreSettings(),
  ]);

  if (!order) {
    return (
      <main className="store-shell py-16">
        <div className="clay-tray p-8 text-center">
          <h1 className="text-3xl font-bold">Order not found</h1>
          <Link href="/" className="clay-btn mt-6 inline-flex">
            Back to store
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="store-shell py-10">
      <div className="clay-tray p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-secondary">
          Order confirmed
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{order.orderNumber}</h1>
        {sp.paid ? (
          <p className="mt-3 clay-cushion clay-cushion-support inline-block px-4 py-2">
            Returning from online checkout — payment status updates after webhook verification.
          </p>
        ) : null}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="clay-cushion clay-cushion-surface p-5">
            <h2 className="text-xl font-bold">Delivery</h2>
            <p className="mt-2">{order.customer.fullName}</p>
            <p className="text-ink-secondary">{order.customer.phone}</p>
            <p className="text-ink-secondary">{order.customer.email}</p>
            <p className="mt-2 text-ink-secondary">
              {order.customer.address}, {order.customer.city}, {order.customer.country}
            </p>
          </div>
          <div className="clay-cushion clay-cushion-cool p-5">
            <h2 className="text-xl font-bold">Status</h2>
            <p className="mt-2">Order: {order.orderStatus}</p>
            <p>Payment: {order.paymentStatus}</p>
            <p>Method: {order.paymentMethod}</p>
            <p className="mt-2 font-bold">
              Total {formatMoney(order.total, settings.currency)}
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {order.items.map(
            (
              item: {
                imageId: string;
                imageUrl: string;
                name: string;
                quantity: number;
                unitPrice: number;
              },
              index: number
            ) => (
              <li
                key={`${item.imageId}-${index}`}
                className="clay-cushion clay-cushion-surface flex gap-3 p-3"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl clay-well">
                  <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-ink-secondary">
                    {item.quantity} × {formatMoney(item.unitPrice, settings.currency)}
                  </p>
                </div>
              </li>
            )
          )}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="clay-btn">
            Continue shopping
          </Link>
          <Link href="/track" className="clay-btn clay-btn-ghost">
            Track this order
          </Link>
        </div>
      </div>
    </main>
  );
}
