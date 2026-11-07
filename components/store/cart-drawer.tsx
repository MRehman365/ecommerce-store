"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatMoney, roundMoney } from "@/lib/money";

export function CartDrawer({
  currency,
  freeShippingThreshold,
  standardShipping,
}: {
  currency: string;
  freeShippingThreshold: number;
  standardShipping: number;
}) {
  const {
    items,
    isOpen,
    closeCart,
    setQuantity,
    removeItem,
    subtotal,
    promoCode,
    discountAmount,
    setPromo,
    clearPromo,
  } = useCart();
  const [code, setCode] = useState(promoCode);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCode(promoCode);
  }, [promoCode]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  const estimatedShipping =
    freeShippingThreshold > 0 &&
    roundMoney(Math.max(0, subtotal - discountAmount)) >= freeShippingThreshold
      ? 0
      : standardShipping;
  const total = roundMoney(
    Math.max(0, subtotal - discountAmount) + estimatedShipping
  );

  async function applyPromo() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          lines: items.map((item) => ({
            productId: item.productId,
            imageId: item.imageId,
            quantity: item.quantity,
          })),
          city: "Default",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not apply code");
      setPromo(data.code, data.discountAmount);
      setMessage(`Applied ${data.code}`);
    } catch (err) {
      clearPromo();
      setMessage(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="drawer-backdrop"
        data-open={isOpen}
        aria-label="Close cart"
        tabIndex={isOpen ? 0 : -1}
        onClick={closeCart}
      />
      <aside
        className="cart-drawer"
        data-open={isOpen}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="text-xl font-bold">Your cart</h2>
          <button type="button" className="clay-btn clay-btn-ghost" onClick={closeCart}>
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="clay-cushion clay-cushion-cool p-6 text-center">
              <p className="font-semibold">Your cart is soft and empty.</p>
              <button type="button" className="clay-btn mt-4" onClick={closeCart}>
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.imageId}`}
                  className="clay-cushion clay-cushion-surface flex gap-3 p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl clay-well">
                    <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-ink-secondary">
                      {formatMoney(item.unitPrice, currency)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="clay-btn !min-h-9 !px-3"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          setQuantity(item.productId, item.imageId, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        className="clay-btn !min-h-9 !px-3"
                        aria-label="Increase quantity"
                        onClick={() =>
                          setQuantity(item.productId, item.imageId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="clay-btn clay-btn-ghost ml-auto"
                        onClick={() => removeItem(item.productId, item.imageId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-black/5 px-5 py-4">
          <div className="mb-3 flex gap-2">
            <input
              className="clay-input"
              placeholder="Promo code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label="Promo code"
            />
            <button
              type="button"
              className="clay-btn shrink-0"
              disabled={loading || !code || items.length === 0}
              onClick={applyPromo}
            >
              Apply
            </button>
          </div>
          {message ? (
            <p className="mb-3 text-[var(--dp-typography-metadata)]" role="status">
              {message}
            </p>
          ) : null}
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatMoney(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Discount</dt>
              <dd>−{formatMoney(discountAmount, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping (est.)</dt>
              <dd>{formatMoney(estimatedShipping, currency)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd>{formatMoney(total, currency)}</dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className={`clay-btn mt-4 w-full ${items.length === 0 ? "pointer-events-none opacity-50" : ""}`}
            onClick={closeCart}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
