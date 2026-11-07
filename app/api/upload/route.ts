import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { requireAdminApi } from "@/lib/admin-guard";
import { isCloudinaryConfigured, uploadImageBuffer } from "@/lib/cloudinary";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";

export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    if (!isCloudinaryConfigured()) {
      return jsonError(
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        503
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonError("file is required");
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadImageBuffer(bytes);
    return jsonOk({
      id: nanoid(),
      url: uploaded.url,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
