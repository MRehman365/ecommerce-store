import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { Category } from "@/models/Category";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/slug";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const { id } = await params;
    const body = categorySchema.partial().parse(await request.json());
    await connectDB();

    const update: Record<string, unknown> = { ...body };
    if (body.name) {
      let slug = slugify(body.name);
      const clash = await Category.findOne({ slug, _id: { $ne: id } });
      if (clash) slug = `${slug}-${nanoid(4)}`;
      update.slug = slug;
    }

    const category = await Category.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!category) return jsonError("Not found", 404);
    return jsonOk({
      category: { ...category.toObject(), id: String(category._id) },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const { id } = await params;
    await connectDB();
    const category = await Category.findByIdAndDelete(id);
    if (!category) return jsonError("Not found", 404);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
