import "server-only";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { getAdminSession } from "@/lib/session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function getAdminOrNull() {
  return getAdminSession();
}

export async function authenticateAdmin(email: string, password: string) {
  await connectDB();
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) return null;
  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) return null;
  return {
    adminId: String(admin._id),
    email: admin.email,
    name: admin.name,
  };
}
