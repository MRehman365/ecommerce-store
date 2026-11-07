export type ProductImage = {
  id: string;
  url: string;
  publicId: string;
  alt?: string;
  isDefault?: boolean;
  sortOrder: number;
};

export type CartItem = {
  productId: string;
  imageId: string;
  imageUrl: string;
  name: string;
  unitPrice: number;
  quantity: number;
  stock: number;
};

export type PaymentMethod = "cod" | "lemonsqueezy";
export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "refunded";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type CheckoutCustomer = {
  fullName: string;
  phone: string;
  email?: string;
  country: string;
  city: string;
  address: string;
  notes?: string;
};
