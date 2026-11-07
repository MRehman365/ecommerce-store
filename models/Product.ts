import { Schema, models, model } from "mongoose";

const ProductImageSchema = new Schema(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    regularPrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    sku: { type: String, default: "", index: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [ProductImageSchema], default: [] },
    featured: { type: Boolean, default: false, index: true },
    bestSeller: { type: Boolean, default: false, index: true },
    newArrival: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true, index: true },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text" });

export const Product = models.Product || model("Product", ProductSchema);
