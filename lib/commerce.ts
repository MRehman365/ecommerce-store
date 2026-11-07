import { connectDB } from "@/lib/db";
import { roundMoney, unitPrice } from "@/lib/money";
import { Product } from "@/models/Product";
import { PromoCode } from "@/models/PromoCode";
import { getStoreSettings } from "@/lib/settings";

export type CartLineInput = {
  productId: string;
  imageId: string;
  quantity: number;
};

export async function resolveCartLines(lines: CartLineInput[]) {
  await connectDB();
  const ids = [...new Set(lines.map((l) => l.productId))];
  const products = await Product.find({
    _id: { $in: ids },
    published: true,
  });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const resolved = [];
  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) {
      throw new Error(`Product unavailable: ${line.productId}`);
    }
    const image = product.images.find((img: { id: string }) => img.id === line.imageId);
    if (!image) {
      throw new Error(`Selected image unavailable for ${product.name}`);
    }
    if (line.quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }
    if (product.stock < line.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    const price = unitPrice(product.regularPrice, product.salePrice);
    resolved.push({
      productId: String(product._id),
      name: product.name as string,
      imageId: image.id as string,
      imageUrl: image.url as string,
      unitPrice: price,
      quantity: line.quantity,
      lineTotal: roundMoney(price * line.quantity),
      stock: product.stock as number,
    });
  }
  return resolved;
}

export async function calculateShipping(subtotalAfterDiscount: number, city: string) {
  const settings = await getStoreSettings();
  if (!settings.shipping.enabled) {
    return 0;
  }

  const cityRate = (settings.shipping.cityRates || []).find(
    (rate: { city: string; charge: number }) =>
      rate.city.toLowerCase() === city.trim().toLowerCase()
  );

  if (
    settings.shipping.freeShippingThreshold > 0 &&
    subtotalAfterDiscount >= settings.shipping.freeShippingThreshold
  ) {
    return 0;
  }

  if (cityRate) {
    return roundMoney(cityRate.charge);
  }

  return roundMoney(settings.shipping.standardCharge);
}

export async function validatePromoCode(code: string, subtotal: number, customerKey?: string) {
  await connectDB();
  const promo = await PromoCode.findOne({
    code: code.trim().toUpperCase(),
  });

  if (!promo || !promo.active) {
    throw new Error("Invalid promo code");
  }
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    throw new Error("This promo code has expired");
  }
  if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) {
    throw new Error("This promo code has reached its usage limit");
  }
  if (subtotal < (promo.minOrderAmount || 0)) {
    throw new Error(`Minimum order amount is ${promo.minOrderAmount}`);
  }

  // Per-customer usage is tracked lightly via phone/email on orders when provided.
  if (customerKey && promo.perCustomerLimit != null) {
    const { Order } = await import("@/models/Order");
    const used = await Order.countDocuments({
      promoCode: promo.code,
      $or: [
        { "customer.phone": customerKey },
        { "customer.email": customerKey },
      ],
      orderStatus: { $nin: ["cancelled"] },
    });
    if (used >= promo.perCustomerLimit) {
      throw new Error("You have already used this promo code");
    }
  }

  let discount =
    promo.type === "percentage"
      ? roundMoney((subtotal * promo.value) / 100)
      : roundMoney(promo.value);

  if (promo.maxDiscount != null) {
    discount = Math.min(discount, promo.maxDiscount);
  }
  discount = Math.min(discount, subtotal);

  return {
    code: promo.code as string,
    discountAmount: discount,
    promoId: String(promo._id),
    allowStacking: Boolean(promo.allowStacking),
  };
}

export async function quoteOrder(input: {
  lines: CartLineInput[];
  promoCode?: string;
  city: string;
  customerKey?: string;
}) {
  const items = await resolveCartLines(input.lines);
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));

  let discountAmount = 0;
  let promoCode = "";
  if (input.promoCode?.trim()) {
    const promo = await validatePromoCode(
      input.promoCode,
      subtotal,
      input.customerKey
    );
    discountAmount = promo.discountAmount;
    promoCode = promo.code;
  }

  const afterDiscount = roundMoney(Math.max(0, subtotal - discountAmount));
  const shippingCharges = await calculateShipping(afterDiscount, input.city);
  const total = roundMoney(afterDiscount + shippingCharges);

  return {
    items,
    subtotal,
    discountAmount,
    shippingCharges,
    total,
    promoCode,
  };
}

/** Atomic stock decrement. Returns false if any product lacks stock. */
export async function reserveStock(
  items: { productId: string; quantity: number }[]
) {
  await connectDB();
  const reserved: { productId: string; quantity: number }[] = [];

  try {
    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        {
          $inc: { stock: -item.quantity, salesCount: item.quantity },
        },
        { new: true }
      );
      if (!updated) {
        throw new Error("Stock reservation failed");
      }
      reserved.push(item);
    }
    return true;
  } catch (error) {
    for (const item of reserved) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity, salesCount: -item.quantity },
      });
    }
    throw error;
  }
}

export async function restockItems(
  items: { productId: string; quantity: number }[]
) {
  await connectDB();
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity, salesCount: -item.quantity },
    });
  }
}
