import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { ProductForm } from "@/components/admin/product-form";

export const instant = false;

export default async function NewProductPage() {
  await connection();
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Add product</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: String(c._id), name: c.name }))}
      />
    </div>
  );
}
