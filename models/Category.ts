import { Schema, models, model } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    image: {
      url: String,
      publicId: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = models.Category || model("Category", CategorySchema);
