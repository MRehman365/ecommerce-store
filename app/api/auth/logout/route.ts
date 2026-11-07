import { destroyAdminSession } from "@/lib/session";
import { jsonOk } from "@/lib/api";

export async function POST() {
  await destroyAdminSession();
  return jsonOk({ ok: true });
}
