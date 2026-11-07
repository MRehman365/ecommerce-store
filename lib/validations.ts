import { z } from "zod";

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  imageId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const quoteSchema = z.object({
  lines: z.array(cartLineSchema).min(1),
  promoCode: z.string().optional(),
  city: z.string().min(1),
  customerKey: z.string().optional(),
});

export const checkoutSchema = z.object({
  lines: z.array(cartLineSchema).min(1),
  promoCode: z.string().optional(),
  paymentMethod: z.enum(["cod", "lemonsqueezy"]),
  idempotencyKey: z.string().min(8).max(100).optional(),
  customer: z.object({
    fullName: z.string().min(2).max(120),
    phone: z.string().min(6).max(40),
    email: z.string().email().optional().or(z.literal("")),
    country: z.string().min(2).max(80),
    city: z.string().min(1).max(80),
    address: z.string().min(5).max(300),
    notes: z.string().max(500).optional(),
  }),
});

export const promoValidateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0).optional(),
  lines: z.array(cartLineSchema).optional(),
  city: z.string().optional(),
  customerKey: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  regularPrice: z.number().min(0),
  salePrice: z.number().min(0).nullable().optional(),
  category: z.string().nullable().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  published: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  images: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().min(1),
        publicId: z.string(),
        alt: z.string().optional(),
        isDefault: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z
    .object({
      url: z.string().optional(),
      publicId: z.string().optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export const bannerSchema = z.object({
  heading: z.string().optional(),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  desktopImage: z
    .object({ url: z.string().optional(), publicId: z.string().optional() })
    .optional(),
  mobileImage: z
    .object({ url: z.string().optional(), publicId: z.string().optional() })
    .optional(),
  placement: z.enum(["hero", "mid", "promo"]).optional(),
  sortOrder: z.number().optional(),
  enabled: z.boolean().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
});

export const promoCodeSchema = z.object({
  code: z.string().min(2),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  perCustomerLimit: z.number().int().min(1).nullable().optional(),
  allowStacking: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const settingsSchema = z.object({
  storeName: z.string().optional(),
  storeLogo: z
    .object({ url: z.string().optional(), publicId: z.string().optional() })
    .optional(),
  storeDescription: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional(),
  currency: z.string().optional(),
  shipping: z
    .object({
      standardCharge: z.number().min(0).optional(),
      freeShippingThreshold: z.number().min(0).optional(),
      enabled: z.boolean().optional(),
      cityRates: z
        .array(z.object({ city: z.string(), charge: z.number().min(0) }))
        .optional(),
    })
    .optional(),
  paymentMethods: z
    .object({
      cod: z.boolean().optional(),
      lemonsqueezy: z.boolean().optional(),
    })
    .optional(),
  announcement: z
    .object({
      text: z.string().optional(),
      enabled: z.boolean().optional(),
    })
    .optional(),
  policies: z
    .object({
      shipping: z.string().optional(),
      returns: z.string().optional(),
      privacy: z.string().optional(),
      terms: z.string().optional(),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export const orderLookupSchema = z.object({
  orderNumber: z.string().min(4),
  phone: z.string().min(6),
});

export const orderStatusSchema = z.object({
  orderStatus: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ])
    .optional(),
  paymentStatus: z
    .enum(["unpaid", "pending", "paid", "failed", "refunded"])
    .optional(),
});
