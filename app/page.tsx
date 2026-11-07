import type { Metadata } from "next";
import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Banner } from "@/models/Banner";
import { getStoreSettings, serializeSettings } from "@/lib/settings";
import { Storefront } from "@/components/store/storefront";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await getStoreSettings();
  return {
    title: settings.seo?.title || settings.storeName,
    description: settings.seo?.description || settings.storeDescription,
    openGraph: {
      title: settings.seo?.title || settings.storeName,
      description: settings.seo?.description || settings.storeDescription,
      type: "website",
    },
  };
}

export default async function HomePage() {
  await connection();
  await connectDB();

  const now = new Date();
  const [settingsDoc, products, categories, banners] = await Promise.all([
    getStoreSettings(),
    Product.find({ published: true }).sort({ createdAt: -1 }).lean(),
    Category.find({ isActive: true }).sort({ name: 1 }).lean(),
    Banner.find({
      enabled: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
      ],
    })
      .sort({ sortOrder: 1 })
      .lean(),
  ]);

  const settings = serializeSettings(settingsDoc);

  return (
    <Storefront
      settings={settings}
      products={products.map((p) => ({
        id: String(p._id),
        name: String(p.name),
        slug: String(p.slug),
        description: String(p.description ?? ""),
        regularPrice: Number(p.regularPrice),
        salePrice: p.salePrice == null ? null : Number(p.salePrice),
        stock: Number(p.stock),
        images: (p.images || []).map(
          (img: {
            id: string;
            url: string;
            publicId: string;
            alt?: string;
            isDefault?: boolean;
            sortOrder?: number;
          }) => ({
            id: String(img.id),
            url: String(img.url),
            publicId: String(img.publicId ?? ""),
            alt: String(img.alt ?? ""),
            isDefault: Boolean(img.isDefault),
            sortOrder: Number(img.sortOrder ?? 0),
          })
        ),
        featured: Boolean(p.featured),
        bestSeller: Boolean(p.bestSeller),
        newArrival: Boolean(p.newArrival),
        category: p.category ? String(p.category) : null,
        createdAt: p.createdAt
          ? new Date(p.createdAt as Date).toISOString()
          : "",
      }))}
      categories={categories.map((c) => ({
        id: String(c._id),
        name: String(c.name),
        slug: String(c.slug),
      }))}
      banners={banners.map((b) => ({
        id: String(b._id),
        heading: String(b.heading ?? ""),
        description: String(b.description ?? ""),
        ctaText: String(b.ctaText ?? ""),
        ctaHref: String(b.ctaHref ?? "#products"),
        desktopImage: {
          url: String(b.desktopImage?.url ?? ""),
          publicId: String(b.desktopImage?.publicId ?? ""),
        },
        mobileImage: {
          url: String(b.mobileImage?.url ?? ""),
          publicId: String(b.mobileImage?.publicId ?? ""),
        },
        placement: String(b.placement ?? "hero"),
      }))}
    />
  );
}
