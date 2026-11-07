import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { Banner } from "@/models/Banner";
import { bannerSchema } from "@/lib/validations";
import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    await connectDB();
    const banners = await Banner.find().sort({ sortOrder: 1 }).lean();
    return jsonOk({
      banners: banners.map((b) => ({ ...b, id: String(b._id) })),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const body = bannerSchema.parse(await request.json());
    await connectDB();
    const banner = await Banner.create({
      ...body,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
    });
    return jsonCreated({ banner: { ...banner.toObject(), id: String(banner._id) } });
  } catch (err) {
    return handleRouteError(err);
  }
}
