"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types";
import { roundMoney } from "@/lib/money";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  promoCode: string;
  discountAmount: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, imageId: string) => void;
  setQuantity: (productId: string, imageId: string, quantity: number) => void;
  clearCart: () => void;
  setPromo: (code: string, discount: number) => void;
  clearPromo: () => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "clay-market-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(parsed.items || []);
        setPromoCode(parsed.promoCode || "");
        setDiscountAmount(parsed.discountAmount || 0);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ items, promoCode, discountAmount })
    );
  }, [items, promoCode, discountAmount, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = roundMoney(
      items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      isOpen,
      promoCode,
      discountAmount,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (item) => {
        setItems((prev) => {
          const idx = prev.findIndex(
            (p) => p.productId === item.productId && p.imageId === item.imageId
          );
          if (idx >= 0) {
            const next = [...prev];
            const qty = Math.min(
              next[idx].stock,
              next[idx].quantity + (item.quantity || 1)
            );
            next[idx] = { ...next[idx], quantity: qty };
            return next;
          }
          return [
            ...prev,
            {
              ...item,
              quantity: Math.min(item.stock, item.quantity || 1),
            },
          ];
        });
        window.setTimeout(() => setIsOpen(true), 450);
      },
      removeItem: (productId, imageId) => {
        setItems((prev) =>
          prev.filter(
            (item) => !(item.productId === productId && item.imageId === imageId)
          )
        );
      },
      setQuantity: (productId, imageId, quantity) => {
        setItems((prev) =>
          prev
            .map((item) => {
              if (item.productId !== productId || item.imageId !== imageId) {
                return item;
              }
              return {
                ...item,
                quantity: Math.max(1, Math.min(item.stock, quantity)),
              };
            })
            .filter((item) => item.quantity > 0)
        );
      },
      clearCart: () => {
        setItems([]);
        setPromoCode("");
        setDiscountAmount(0);
      },
      setPromo: (code, discount) => {
        setPromoCode(code);
        setDiscountAmount(discount);
      },
      clearPromo: () => {
        setPromoCode("");
        setDiscountAmount(0);
      },
      subtotal,
      itemCount,
    };
  }, [items, isOpen, promoCode, discountAmount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
