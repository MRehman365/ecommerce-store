import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { Banner } from "@/models/Banner";
import { BannerManager } from "@/components/admin/banner-manager";

export const instant = false;

export default async function AdminBannersPage() {
  await connection();
  await connectDB();
  const banners = await Banner.find().sort({ sortOrder: 1 }).lean();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Banners</h1>
      <BannerManager
        initial={banners.map((b) => ({
          id: String(b._id),
          heading: b.heading || "",
          description: b.description || "",
          ctaText: b.ctaText || "",
          ctaHref: b.ctaHref || "#products",
          placement: b.placement || "hero",
          enabled: Boolean(b.enabled),
          sortOrder: b.sortOrder || 0,
          desktopImage: b.desktopImage || {},
          mobileImage: b.mobileImage || {},
        }))}
      />
    </div>
  );
}
