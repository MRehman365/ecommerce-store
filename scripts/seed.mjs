import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ecommerce-store";

const AdminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    regularPrice: Number,
    salePrice: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    sku: String,
    stock: Number,
    images: [
      {
        id: String,
        url: String,
        publicId: String,
        alt: String,
        isDefault: Boolean,
        sortOrder: Number,
      },
    ],
    featured: Boolean,
    bestSeller: Boolean,
    newArrival: Boolean,
    published: Boolean,
    seoTitle: String,
    seoDescription: String,
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PromoSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    type: String,
    value: Number,
    minOrderAmount: Number,
    maxDiscount: Number,
    usageLimit: Number,
    perCustomerLimit: Number,
    usedCount: { type: Number, default: 0 },
    active: Boolean,
  },
  { timestamps: true }
);

const BannerSchema = new mongoose.Schema(
  {
    heading: String,
    description: String,
    ctaText: String,
    ctaHref: String,
    desktopImage: { url: String, publicId: String },
    mobileImage: { url: String, publicId: String },
    placement: String,
    sortOrder: Number,
    enabled: Boolean,
  },
  { timestamps: true }
);

const SettingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, unique: true },
    storeName: String,
    storeDescription: String,
    contactEmail: String,
    contactPhone: String,
    contactAddress: String,
    currency: String,
    shipping: Object,
    paymentMethods: Object,
    announcement: Object,
    policies: Object,
    seo: Object,
    socialLinks: Object,
  },
  { timestamps: true }
);

function img(url, label, index) {
  return {
    id: nanoid(),
    url,
    publicId: `seed/${label}-${index}`,
    alt: label,
    isDefault: index === 0,
    sortOrder: index,
  };
}

async function main() {
  await mongoose.connect(uri);
  const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
  const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
  const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
  const PromoCode = mongoose.models.PromoCode || mongoose.model("PromoCode", PromoSchema);
  const Banner = mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
  const StoreSettings =
    mongoose.models.StoreSettings || mongoose.model("StoreSettings", SettingsSchema);

  // Admin credentials live in MongoDB only (not env).
  const email = "admin@gmail.com";
  const password = "123456";
  const passwordHash = await bcrypt.hash(password, 12);

  await Admin.deleteMany({ email: { $ne: email } });
  await Admin.findOneAndUpdate(
    { email },
    {
      name: "Store Admin",
      email,
      passwordHash,
    },
    { upsert: true, returnDocument: "after" }
  );

  await StoreSettings.findOneAndUpdate(
    { singletonKey: "default" },
    {
      singletonKey: "default",
      storeName: "Clay Market",
      storeDescription: "Winter hoodies and zip hoodies — pick the color photo you want shipped.",
      contactEmail: "hello@claymarket.store",
      contactPhone: "+1 (555) 010-2030",
      contactAddress: "120 Soft Street, Cream City",
      currency: "USD",
      shipping: {
        standardCharge: 8,
        freeShippingThreshold: 75,
        enabled: true,
        cityRates: [],
      },
      paymentMethods: { cod: true, lemonsqueezy: false },
      announcement: {
        text: "Winter drop · Hoodies & zip hoodies · Free shipping over $75 · Code WINTER15",
        enabled: true,
      },
      socialLinks: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        twitter: "",
        tiktok: "",
      },
      policies: {
        shipping: "Orders ship within 2–4 business days.",
        returns: "Unused items may be returned within 14 days.",
        privacy: "We never sell personal data.",
        terms: "By ordering you agree to our policies.",
      },
      seo: {
        title: "Clay Market — Soft goods, guest checkout",
        description: "Browse image-based styles and checkout as a guest.",
      },
    },
    { upsert: true }
  );

  // Winter-only catalog: Hoodies + Zip Hoodies
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Banner.deleteMany({});

  const categoryDefs = [
    {
      slug: "hoodies",
      name: "Hoodies",
      description: "Pullover hoodies for cold weather — pick color by photo.",
    },
    {
      slug: "zip-hoodies",
      name: "Zip Hoodies",
      description: "Full-zip and quarter-zip winter layers — select style by image.",
    },
  ];

  const categoriesBySlug = {};
  for (const def of categoryDefs) {
    const doc = await Category.findOneAndUpdate(
      { slug: def.slug },
      { ...def, isActive: true },
      { upsert: true, returnDocument: "after" }
    );
    categoriesBySlug[def.slug] = doc;
  }

  const productDefs = [
    {
      name: "City Pullover Hoodie",
      slug: "city-pullover-hoodie",
      sku: "WIN-HOOD-CITY",
      category: "hoodies",
      description:
        "Heavyweight fleece pullover for winter walks. Soft kangaroo pocket and rib cuffs. Choose the color from the product photos — that exact hoodie ships with your order.",
      regularPrice: 58,
      salePrice: 49,
      stock: 45,
      featured: true,
      bestSeller: true,
      newArrival: true,
      seoTitle: "City Pullover Hoodie — winter fleece",
      seoDescription: "Warm pullover hoodie with image-based color selection.",
      images: [
        ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80", "Black hoodie"],
        ["https://images.unsplash.com/photo-1578768079052-aa76e52c5c28?auto=format&fit=crop&w=900&q=80", "Grey hoodie"],
        ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80", "Cream hoodie"],
      ],
    },
    {
      name: "Alpine Oversized Hoodie",
      slug: "alpine-oversized-hoodie",
      sku: "WIN-HOOD-ALPINE",
      category: "hoodies",
      description:
        "Oversized winter hoodie with a deep hood and brushed interior. Ideal as a mid-layer under coats. Select your shade by tapping the gallery images.",
      regularPrice: 64,
      salePrice: null,
      stock: 32,
      featured: true,
      bestSeller: false,
      newArrival: true,
      images: [
        ["https://images.unsplash.com/photo-1509942774463-acf333db4d1b?auto=format&fit=crop&w=900&q=80", "Charcoal oversized"],
        ["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80", "Navy oversized"],
      ],
    },
    {
      name: "Frost Essential Hoodie",
      slug: "frost-essential-hoodie",
      sku: "WIN-HOOD-FROST",
      category: "hoodies",
      description:
        "Everyday winter essential with a clean silhouette and thick fleece. Image selection is the color variant — no color dropdowns.",
      regularPrice: 52,
      salePrice: 44,
      stock: 60,
      featured: false,
      bestSeller: true,
      newArrival: false,
      images: [
        ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80", "Burgundy hoodie"],
        ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", "White hoodie"],
        ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80", "Red hoodie"],
      ],
    },
    {
      name: "Summit Full-Zip Hoodie",
      slug: "summit-full-zip-hoodie",
      sku: "WIN-ZIP-SUMMIT",
      category: "zip-hoodies",
      description:
        "Full-zip winter hoodie with metal zipper and lined hood. Easy on/off for cold mornings. Pick the color photo you want delivered.",
      regularPrice: 72,
      salePrice: 62,
      stock: 38,
      featured: true,
      bestSeller: true,
      newArrival: true,
      seoTitle: "Summit Full-Zip Hoodie",
      seoDescription: "Winter zip hoodie with photo-based color variants.",
      images: [
        ["https://images.unsplash.com/photo-1620799139834-6b8f844fbb38?auto=format&fit=crop&w=900&q=80", "Black zip hoodie"],
        ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80", "Olive zip hoodie"],
        ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80", "Heather zip hoodie"],
      ],
    },
    {
      name: "Trail Quarter-Zip Hoodie",
      slug: "trail-quarter-zip-hoodie",
      sku: "WIN-ZIP-TRAIL",
      category: "zip-hoodies",
      description:
        "Quarter-zip winter layer with a fitted hood and stretch fleece. Great under jackets. Choose style from the uploaded images.",
      regularPrice: 66,
      salePrice: null,
      stock: 40,
      featured: true,
      bestSeller: false,
      newArrival: true,
      images: [
        ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80", "Navy quarter-zip"],
        ["https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=900&q=80", "Grey quarter-zip"],
      ],
    },
    {
      name: "Harbor Tech Zip Hoodie",
      slug: "harbor-tech-zip-hoodie",
      sku: "WIN-ZIP-HARBOR",
      category: "zip-hoodies",
      description:
        "Water-resistant outer face with a warm fleece lining and full zipper. Built for wet winter days. Select the exact look via product images.",
      regularPrice: 88,
      salePrice: 79,
      stock: 24,
      featured: false,
      bestSeller: true,
      newArrival: false,
      images: [
        ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80", "Black tech zip"],
        ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80", "Forest tech zip"],
      ],
    },
    {
      name: "Cabin Sherpa Zip Hoodie",
      slug: "cabin-sherpa-zip-hoodie",
      sku: "WIN-ZIP-CABIN",
      category: "zip-hoodies",
      description:
        "Sherpa-lined zip hoodie for deep cold. Soft pile inside, durable shell outside. Colorways are the gallery photos.",
      regularPrice: 94,
      salePrice: null,
      stock: 20,
      featured: true,
      bestSeller: false,
      newArrival: true,
      images: [
        ["https://images.unsplash.com/photo-1544923246-77307dd628fd?auto=format&fit=crop&w=900&q=80", "Tan sherpa zip"],
        ["https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=900&q=80", "Brown sherpa zip"],
      ],
    },
    {
      name: "Metro Classic Hoodie",
      slug: "metro-classic-hoodie",
      sku: "WIN-HOOD-METRO",
      category: "hoodies",
      description:
        "Classic winter pullover with double-lined hood and roomy sleeves. Guest checkout friendly — pick the photo, add to cart, done.",
      regularPrice: 55,
      salePrice: 48,
      stock: 50,
      featured: false,
      bestSeller: true,
      newArrival: false,
      images: [
        ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80", "Jet black"],
        ["https://images.unsplash.com/photo-1618354691634-ae55e2f9c8c0?auto=format&fit=crop&w=900&q=80", "Stone grey"],
      ],
    },
  ];

  await Product.create(
    productDefs.map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      regularPrice: p.regularPrice,
      salePrice: p.salePrice,
      category: categoriesBySlug[p.category]._id,
      sku: p.sku,
      stock: p.stock,
      featured: p.featured,
      bestSeller: p.bestSeller,
      newArrival: p.newArrival,
      published: true,
      seoTitle: p.seoTitle || p.name,
      seoDescription: p.seoDescription || p.description,
      images: p.images.map(([url, label], index) => img(url, label, index)),
    }))
  );

  await PromoCode.findOneAndUpdate(
    { code: "SOFT10" },
    {
      code: "SOFT10",
      type: "percentage",
      value: 10,
      minOrderAmount: 30,
      maxDiscount: 25,
      usageLimit: 500,
      perCustomerLimit: 3,
      active: true,
    },
    { upsert: true }
  );

  await PromoCode.findOneAndUpdate(
    { code: "WINTER15" },
    {
      code: "WINTER15",
      type: "percentage",
      value: 15,
      minOrderAmount: 50,
      maxDiscount: 40,
      usageLimit: 300,
      perCustomerLimit: 2,
      active: true,
    },
    { upsert: true }
  );

  await Banner.create([
    {
      heading: "Winter hoodies & zips",
      description:
        "Pullover and zip hoodies for cold weather. Pick the color photo — that style is what you get.",
      ctaText: "Shop winter",
      ctaHref: "#products",
      placement: "hero",
      sortOrder: 0,
      enabled: true,
      desktopImage: {
        url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1400&q=80",
        publicId: "seed/winter-hero-desktop",
      },
      mobileImage: {
        url: "https://images.unsplash.com/photo-1578768079052-aa76e52c5c28?auto=format&fit=crop&w=900&q=80",
        publicId: "seed/winter-hero-mobile",
      },
    },
    {
      heading: "Zip up for the cold",
      description: "Full-zip and quarter-zip hoodies — select the image variant you want shipped.",
      ctaText: "Browse zip hoodies",
      ctaHref: "#products",
      placement: "mid",
      sortOrder: 1,
      enabled: true,
      desktopImage: {
        url: "https://images.unsplash.com/photo-1620799139834-6b8f844fbb38?auto=format&fit=crop&w=1400&q=80",
        publicId: "seed/winter-mid-desktop",
      },
      mobileImage: {
        url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80",
        publicId: "seed/winter-mid-mobile",
      },
    },
    {
      heading: "WINTER15 — 15% off",
      description: "Save on orders over $50 this season. Apply WINTER15 in cart.",
      ctaText: "Shop the drop",
      ctaHref: "#products",
      placement: "promo",
      sortOrder: 2,
      enabled: true,
      desktopImage: {
        url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1400&q=80",
        publicId: "seed/winter-promo-desktop",
      },
      mobileImage: {
        url: "https://images.unsplash.com/photo-1509942774463-acf333db4d1b?auto=format&fit=crop&w=900&q=80",
        publicId: "seed/winter-promo-mobile",
      },
    },
  ]);

  console.log("Seed complete — winter hoodies & zip hoodies only.");
  console.log(`Categories: ${categoryDefs.length}`);
  console.log(`Products: ${productDefs.length}`);
  console.log(`Admin: ${email} / ${password}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
