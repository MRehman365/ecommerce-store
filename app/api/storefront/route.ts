import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Banner } from "@/models/Banner";
import { getStoreSettings, serializeSettings } from "@/lib/settings";
import { handleRouteError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    await connectDB();
    const now = new Date();
    const [settings, products, categories, banners] = await Promise.all([
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
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean(),
    ]);

    return jsonOk({
      settings: serializeSettings(settings),
      products: products.map((p) => ({
        id: String(p._id),
        name: p.name,
        slug: p.slug,
        description: p.description,
        regularPrice: p.regularPrice,
        salePrice: p.salePrice,
        category: p.category ? String(p.category) : null,
        sku: p.sku,
        stock: p.stock,
        images: p.images,
        featured: p.featured,
        bestSeller: p.bestSeller,
        newArrival: p.newArrival,
        createdAt: p.createdAt,
      })),
      categories: categories.map((c) => ({
        id: String(c._id),
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
      })),
      banners: banners.map((b) => ({
        id: String(b._id),
        heading: b.heading,
        description: b.description,
        ctaText: b.ctaText,
        ctaHref: b.ctaHref,
        desktopImage: b.desktopImage,
        mobileImage: b.mobileImage,
        placement: b.placement,
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
