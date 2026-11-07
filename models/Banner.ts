import { Schema, models, model } from "mongoose";

const BannerSchema = new Schema(
  {
    heading: { type: String, default: "" },
    description: { type: String, default: "" },
    ctaText: { type: String, default: "" },
    ctaHref: { type: String, default: "#products" },
    desktopImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    mobileImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    placement: {
      type: String,
      enum: ["hero", "mid", "promo"],
      default: "hero",
      index: true,
    },
    sortOrder: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Banner = models.Banner || model("Banner", BannerSchema);
