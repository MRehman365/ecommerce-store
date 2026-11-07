import { getAdminSession } from "@/lib/session";
import { jsonOk, jsonError } from "@/lib/api";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  return jsonOk({ admin: session });
}
