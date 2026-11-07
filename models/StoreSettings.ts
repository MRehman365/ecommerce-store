import { Schema, models, model } from "mongoose";

const StoreSettingsSchema = new Schema(
  {
    singletonKey: { type: String, default: "default", unique: true },
    storeName: { type: String, default: "Clay Market" },
    storeLogo: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    storeDescription: {
      type: String,
      default: "Soft goods molded for everyday comfort.",
    },
    contactEmail: { type: String, default: "hello@claymarket.store" },
    contactPhone: { type: String, default: "+1 (555) 010-2030" },
    contactAddress: {
      type: String,
      default: "120 Soft Street, Cream City",
    },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      tiktok: { type: String, default: "" },
    },
    currency: { type: String, default: "USD" },
    shipping: {
      standardCharge: { type: Number, default: 8 },
      freeShippingThreshold: { type: Number, default: 75 },
      enabled: { type: Boolean, default: true },
      cityRates: [
        {
          city: String,
          charge: Number,
        },
      ],
    },
    paymentMethods: {
      cod: { type: Boolean, default: true },
      lemonsqueezy: { type: Boolean, default: false },
    },
    announcement: {
      text: {
        type: String,
        default: "Free shipping on orders over $75 · Soft drops weekly",
      },
      enabled: { type: Boolean, default: true },
    },
    policies: {
      shipping: {
        type: String,
        default:
          "Orders ship within 2–4 business days. Free shipping applies above the configured threshold.",
      },
      returns: {
        type: String,
        default:
          "Unused items may be returned within 14 days of delivery in original condition.",
      },
      privacy: {
        type: String,
        default:
          "We use your details only to fulfill orders and never sell personal data.",
      },
      terms: {
        type: String,
        default:
          "By placing an order you agree to our pricing, shipping, and return policies.",
      },
    },
    seo: {
      title: { type: String, default: "Clay Market — Soft goods, guest checkout" },
      description: {
        type: String,
        default:
          "Browse image-based product styles, apply promo codes, and checkout as a guest.",
      },
    },
  },
  { timestamps: true }
);

export const StoreSettings =
  models.StoreSettings || model("StoreSettings", StoreSettingsSchema);
