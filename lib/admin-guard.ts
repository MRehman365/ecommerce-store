import "server-only";
import { getAdminSession } from "@/lib/session";
import { jsonError } from "@/lib/api";

export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, error: jsonError("Unauthorized", 401) };
  }
  return { session, error: null };
}
