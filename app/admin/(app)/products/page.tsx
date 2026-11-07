import Link from "next/link";
import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { formatMoney } from "@/lib/money";
import { getStoreSettings } from "@/lib/settings";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const instant = false;

export default async function AdminProductsPage() {
  await connection();
  await connectDB();
  const [products, settings] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).lean(),
    getStoreSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Products</h1>
          <p className="mt-2 text-ink-secondary">
            Manage catalog, stock, and image-based variations.
          </p>
        </div>
        <Link href="/admin/products/new" className="clay-btn">
          Add product
        </Link>
      </div>

      <div className="clay-tray table-wrap p-4">
        <table className="clay-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Images</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={String(product._id)}>
                <td>
                  <Link
                    href={`/admin/products/${product._id}`}
                    className="font-semibold underline-offset-2 hover:underline"
                  >
                    {product.name}
                  </Link>
                </td>
                <td>{formatMoney(product.regularPrice, settings.currency)}</td>
                <td>{product.stock}</td>
                <td>{product.images?.length || 0}</td>
                <td>{product.published ? "Published" : "Draft"}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <Link
                    href={`/admin/products/${product._id}`}
                    className="clay-btn !min-h-9 !px-3 inline-flex"
                  >
                    Edit
                  </Link>
                  <DeleteProductButton id={String(product._id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length ? <p className="p-4">No products yet.</p> : null}
      </div>
    </div>
  );
}
