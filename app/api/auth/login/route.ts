import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateAdmin } from "@/lib/auth";
import { createAdminSession } from "@/lib/session";
import { handleRouteError, jsonOk, jsonError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const limited = rateLimit(`login:${ip}`, 8, 60_000);
    if (!limited.ok) {
      return jsonError("Too many login attempts. Try again shortly.", 429);
    }

    const body = schema.parse(await request.json());
    const admin = await authenticateAdmin(body.email, body.password);
    if (!admin) {
      return jsonError("Invalid email or password", 401);
    }
    await createAdminSession(admin);
    return jsonOk({ ok: true, admin: { name: admin.name, email: admin.email } });
  } catch (error) {
    return handleRouteError(error);
  }
}
