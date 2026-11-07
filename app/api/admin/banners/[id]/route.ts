import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { Banner } from "@/models/Banner";
import { bannerSchema } from "@/lib/validations";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const { id } = await params;
    const body = bannerSchema.partial().parse(await request.json());
    await connectDB();
    const banner = await Banner.findByIdAndUpdate(
      id,
      {
        ...body,
        startsAt:
          body.startsAt === undefined
            ? undefined
            : body.startsAt
              ? new Date(body.startsAt)
              : null,
        endsAt:
          body.endsAt === undefined
            ? undefined
            : body.endsAt
              ? new Date(body.endsAt)
              : null,
      },
      { new: true }
    );
    if (!banner) return jsonError("Not found", 404);
    return jsonOk({ banner: { ...banner.toObject(), id: String(banner._id) } });
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
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return jsonError("Not found", 404);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
