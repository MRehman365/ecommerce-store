import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { getStoreSettings, serializeSettings } from "@/lib/settings";
import { settingsSchema } from "@/lib/validations";
import { handleRouteError, jsonOk } from "@/lib/api";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const settings = await getStoreSettings();
    return jsonOk({ settings: serializeSettings(settings) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PUT(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const body = settingsSchema.parse(await request.json());
    const settings = await getStoreSettings();
    Object.assign(settings, body);
    await settings.save();
    return jsonOk({ settings: serializeSettings(settings) });
  } catch (err) {
    return handleRouteError(err);
  }
}
