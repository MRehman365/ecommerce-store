import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { PromoCode } from "@/models/PromoCode";
import { promoCodeSchema } from "@/lib/validations";
import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    await connectDB();
    const promos = await PromoCode.find().sort({ createdAt: -1 }).lean();
    return jsonOk({
      promos: promos.map((p) => ({ ...p, id: String(p._id) })),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const body = promoCodeSchema.parse(await request.json());
    await connectDB();
    const promo = await PromoCode.create({
      ...body,
      code: body.code.toUpperCase(),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    });
    return jsonCreated({ promo: { ...promo.toObject(), id: String(promo._id) } });
  } catch (err) {
    return handleRouteError(err);
  }
}
