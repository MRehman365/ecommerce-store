import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { CategoryManager } from "@/components/admin/category-manager";

export const instant = false;

export default async function AdminCategoriesPage() {
  await connection();
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Categories</h1>
      <CategoryManager
        initial={categories.map((c) => ({
          id: String(c._id),
          name: c.name,
          description: c.description || "",
          isActive: Boolean(c.isActive),
        }))}
      />
    </div>
  );
}
