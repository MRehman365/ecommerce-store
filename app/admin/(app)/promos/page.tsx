import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { PromoCode } from "@/models/PromoCode";
import { PromoManager } from "@/components/admin/promo-manager";

export const instant = false;

export default async function AdminPromosPage() {
  await connection();
  await connectDB();
  const promos = await PromoCode.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Promo codes</h1>
      <PromoManager
        initial={promos.map((p) => ({
          id: String(p._id),
          code: p.code,
          type: p.type,
          value: p.value,
          minOrderAmount: p.minOrderAmount || 0,
          maxDiscount: p.maxDiscount,
          usageLimit: p.usageLimit,
          usedCount: p.usedCount || 0,
          active: Boolean(p.active),
          expiresAt: p.expiresAt ? new Date(p.expiresAt).toISOString().slice(0, 10) : "",
        }))}
      />
    </div>
  );
}
