import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/validations";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id).lean();
    if (!product) return jsonError("Not found", 404);
    return jsonOk({ product: { ...product, id: String(product._id) } });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const { id } = await params;
    const body = productSchema.partial().parse(await request.json());
    await connectDB();
    const product = await Product.findByIdAndUpdate(
      id,
      { ...body, category: body.category || null },
      { new: true }
    );
    if (!product) return jsonError("Not found", 404);
    return jsonOk({ product: { ...product.toObject(), id: String(product._id) } });
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
    const product = await Product.findByIdAndDelete(id);
    if (!product) return jsonError("Not found", 404);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
