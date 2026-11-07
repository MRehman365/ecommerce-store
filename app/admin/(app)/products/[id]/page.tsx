import { notFound } from "next/navigation";
import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { ProductForm } from "@/components/admin/product-form";

export const instant = false;

type Props = PageProps<"/admin/products/[id]">;

export default async function EditProductPage({ params }: Props) {
  await connection();
  const { id } = await params;
  await connectDB();
  const [product, categories] = await Promise.all([
    Product.findById(id).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Edit product</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: String(c._id), name: c.name }))}
        initial={{
          id: String(product._id),
          name: product.name,
          description: product.description || "",
          regularPrice: product.regularPrice,
          salePrice: product.salePrice ?? null,
          category: product.category ? String(product.category) : "",
          sku: product.sku || "",
          stock: product.stock,
          featured: Boolean(product.featured),
          bestSeller: Boolean(product.bestSeller),
          newArrival: Boolean(product.newArrival),
          published: Boolean(product.published),
          seoTitle: product.seoTitle || "",
          seoDescription: product.seoDescription || "",
          images: product.images || [],
        }}
      />
    </div>
  );
}
