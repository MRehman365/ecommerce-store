import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminOrNull } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { formatMoney } from "@/lib/money";
import { getStoreSettings } from "@/lib/settings";

export const instant = false;

type Props = PageProps<"/admin/invoice/[id]">;

export default async function InvoicePage({ params }: Props) {
  await connection();
  const admin = await getAdminOrNull();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  await connectDB();
  const [order, settings] = await Promise.all([
    Order.findById(id).lean(),
    getStoreSettings(),
  ]);
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-3xl bg-white p-8 text-black print:p-0">
      <h1 className="text-3xl font-bold">{settings.storeName} invoice</h1>
      <p className="mt-2">{order.orderNumber}</p>
      <p>{new Date(order.createdAt).toLocaleString()}</p>
      <hr className="my-6" />
      <p>
        <strong>Bill to:</strong> {order.customer.fullName}
      </p>
      <p>
        {order.customer.address}, {order.customer.city}, {order.customer.country}
      </p>
      <p>{order.customer.phone}</p>
      <table className="mt-6 w-full border-collapse text-left">
        <thead>
          <tr>
            <th className="border-b py-2">Item</th>
            <th className="border-b py-2">Qty</th>
            <th className="border-b py-2">Price</th>
            <th className="border-b py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map(
            (
              item: {
                name: string;
                quantity: number;
                unitPrice: number;
                lineTotal: number;
                imageId: string;
              },
              index: number
            ) => (
              <tr key={`${item.imageId}-${index}`}>
                <td className="py-2">{item.name}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">{formatMoney(item.unitPrice, settings.currency)}</td>
                <td className="py-2">{formatMoney(item.lineTotal, settings.currency)}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
      <div className="mt-6 text-right">
        <p>Subtotal: {formatMoney(order.subtotal, settings.currency)}</p>
        <p>Discount: {formatMoney(order.discountAmount, settings.currency)}</p>
        <p>Shipping: {formatMoney(order.shippingCharges, settings.currency)}</p>
        <p className="text-xl font-bold">
          Total: {formatMoney(order.total, settings.currency)}
        </p>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: "window.print();",
        }}
      />
    </main>
  );
}
