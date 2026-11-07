import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { getStoreSettings, serializeSettings } from "@/lib/settings";
import { ProductDetail } from "@/components/store/product-detail";
import { ProductPageChrome } from "@/components/store/product-page-chrome";

export const instant = false;

type Props = PageProps<"/product/[slug]">;

function mapImages(
  images: {
    id: string;
    url: string;
    publicId?: string;
    alt?: string;
    isDefault?: boolean;
    sortOrder?: number;
  }[] = []
) {
  return images.map((img, index) => ({
    id: String(img.id),
    url: String(img.url),
    publicId: String(img.publicId ?? ""),
    alt: String(img.alt ?? ""),
    isDefault: Boolean(img.isDefault),
    sortOrder: Number(img.sortOrder ?? index),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug, published: true }).lean();
  if (!product) return { title: "Product" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description,
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  await connectDB();

  const [product, settingsDoc] = await Promise.all([
    Product.findOne({ slug, published: true }).lean(),
    getStoreSettings(),
  ]);

  if (!product) notFound();

  const settings = serializeSettings(settingsDoc);

  let categoryName: string | null = null;
  if (product.category) {
    const category = await Category.findById(product.category).lean();
    categoryName = category?.name || null;
  }

  let related = await Product.find({
    published: true,
    _id: { $ne: product._id },
    ...(product.category ? { category: product.category } : {}),
  })
    .limit(4)
    .lean();

  if (related.length === 0) {
    related = await Product.find({
      published: true,
      _id: { $ne: product._id },
    })
      .limit(4)
      .lean();
  }

  return (
    <ProductPageChrome
      storeName={settings.storeName}
      logoUrl={settings.storeLogo?.url}
      announcement={settings.announcement}
      currency={settings.currency}
      freeShippingThreshold={settings.shipping.freeShippingThreshold}
      standardShipping={settings.shipping.standardCharge}
      footerSettings={{
        storeName: settings.storeName,
        storeDescription: settings.storeDescription,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        contactAddress: settings.contactAddress,
        socialLinks: settings.socialLinks,
        policies: settings.policies,
      }}
    >
      <ProductDetail
        currency={settings.currency}
        product={{
          id: String(product._id),
          name: String(product.name),
          slug: String(product.slug),
          description: String(product.description ?? ""),
          regularPrice: Number(product.regularPrice),
          salePrice:
            product.salePrice == null ? null : Number(product.salePrice),
          stock: Number(product.stock),
          sku: String(product.sku ?? ""),
          images: mapImages(product.images),
          featured: Boolean(product.featured),
          bestSeller: Boolean(product.bestSeller),
          newArrival: Boolean(product.newArrival),
          categoryName,
          seoTitle: String(product.seoTitle ?? ""),
          seoDescription: String(product.seoDescription ?? ""),
        }}
        related={related.map((item) => ({
          id: String(item._id),
          name: String(item.name),
          slug: String(item.slug),
          regularPrice: Number(item.regularPrice),
          salePrice: item.salePrice == null ? null : Number(item.salePrice),
          images: mapImages(item.images),
        }))}
      />
    </ProductPageChrome>
  );
}
