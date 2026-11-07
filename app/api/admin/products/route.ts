import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/slug";
import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    await connectDB();
    const q = request.nextUrl.searchParams.get("q") || "";
    const filter = q
      ? { $or: [{ name: new RegExp(q, "i") }, { sku: new RegExp(q, "i") }] }
      : {};
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return jsonOk({
      products: products.map((p) => ({
        ...p,
        id: String(p._id),
        _id: undefined,
      })),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = productSchema.parse(await request.json());
    await connectDB();
    let slug = slugify(body.name);
    const exists = await Product.findOne({ slug });
    if (exists) slug = `${slug}-${nanoid(4)}`;

    const images = (body.images || []).map((img, index) => ({
      ...img,
      id: img.id || nanoid(),
      sortOrder: img.sortOrder ?? index,
      isDefault: img.isDefault ?? index === 0,
    }));

    const product = await Product.create({
      ...body,
      slug,
      images,
      category: body.category || null,
    });

    return jsonCreated({ product: { ...product.toObject(), id: String(product._id) } });
  } catch (err) {
    return handleRouteError(err);
  }
}
