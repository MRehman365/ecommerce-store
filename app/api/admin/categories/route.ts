import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { Category } from "@/models/Category";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/slug";
import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return jsonOk({
      categories: categories.map((c) => ({ ...c, id: String(c._id) })),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const body = categorySchema.parse(await request.json());
    await connectDB();
    let slug = slugify(body.name);
    if (await Category.findOne({ slug })) slug = `${slug}-${nanoid(4)}`;
    const category = await Category.create({ ...body, slug });
    return jsonCreated({
      category: { ...category.toObject(), id: String(category._id) },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
