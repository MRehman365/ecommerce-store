import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { PromoCode } from "@/models/PromoCode";
import { promoCodeSchema } from "@/lib/validations";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const { id } = await params;
    const body = promoCodeSchema.partial().parse(await request.json());
    await connectDB();
    const update = {
      ...body,
      code: body.code ? body.code.toUpperCase() : undefined,
      expiresAt:
        body.expiresAt === undefined
          ? undefined
          : body.expiresAt
            ? new Date(body.expiresAt)
            : null,
    };
    const promo = await PromoCode.findByIdAndUpdate(id, update, { new: true });
    if (!promo) return jsonError("Not found", 404);
    return jsonOk({ promo: { ...promo.toObject(), id: String(promo._id) } });
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
    const promo = await PromoCode.findByIdAndDelete(id);
    if (!promo) return jsonError("Not found", 404);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
