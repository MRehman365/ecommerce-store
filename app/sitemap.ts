import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date() },
    { url: `${base}/checkout`, lastModified: new Date() },
    { url: `${base}/track`, lastModified: new Date() },
  ];

  try {
    await connectDB();
    const products = await Product.find({ published: true })
      .select("slug updatedAt")
      .lean();
    const productRoutes = products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
