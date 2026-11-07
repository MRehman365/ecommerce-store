import { Schema, models, model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    imageId: { type: String, required: true },
    imageUrl: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true, index: true },
      email: { type: String, default: "" },
      country: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      notes: { type: String, default: "" },
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    shippingCharges: { type: Number, default: 0 },
    total: { type: Number, required: true },
    promoCode: { type: String, default: "" },
    paymentMethod: {
      type: String,
      enum: ["cod", "lemonsqueezy"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "refunded"],
      default: "unpaid",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },
    lemonSqueezy: {
      checkoutId: String,
      orderId: String,
      eventIds: { type: [String], default: [] },
    },
    stockReserved: { type: Boolean, default: false },
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "customer.fullName": "text" });

export const Order = models.Order || model("Order", OrderSchema);
