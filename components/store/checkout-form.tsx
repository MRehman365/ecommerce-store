"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { formatMoney, roundMoney } from "@/lib/money";
import { nanoid } from "nanoid";

export function CheckoutForm({
  currency,
  paymentMethods,
}: {
  currency: string;
  paymentMethods: { cod: boolean; lemonsqueezy: boolean };
}) {
  const router = useRouter();
  const { items, subtotal, promoCode, discountAmount, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "lemonsqueezy">(
    paymentMethods.cod ? "cod" : "lemonsqueezy"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    country: "United States",
    city: "",
    address: "",
    notes: "",
  });

  const shippingHint = useMemo(() => "Calculated on the server at submit", []);

  if (items.length === 0) {
    return (
      <div className="clay-tray mx-auto max-w-xl p-8 text-center">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <Link href="/" className="clay-btn mt-6 inline-flex">
          Return to store
        </Link>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((item) => ({
            productId: item.productId,
            imageId: item.imageId,
            quantity: item.quantity,
          })),
          promoCode: promoCode || undefined,
          paymentMethod,
          idempotencyKey: nanoid(),
          customer: form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.checkoutUrl) {
        clearCart();
        window.location.href = data.checkoutUrl;
        return;
      }

      clearCart();
      router.push(`/order/${data.order.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="store-shell grid gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="clay-tray p-6 md:p-8">
        <h1 className="text-4xl font-bold tracking-tight">Guest checkout</h1>
        <p className="mt-2 text-ink-secondary">No account required.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["fullName", "Full name", "text"],
              ["phone", "Phone", "tel"],
              ["email", "Email (optional for COD)", "email"],
              ["country", "Country", "text"],
              ["city", "City", "text"],
            ] as const
          ).map(([key, label, type]) => (
            <div key={key} className={key === "email" || key === "country" ? "sm:col-span-2" : ""}>
              <label className="clay-label" htmlFor={key}>
                {label}
              </label>
              <input
                id={key}
                type={type}
                className="clay-input"
                required={key !== "email" || paymentMethod === "lemonsqueezy"}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="clay-label" htmlFor="address">
              Delivery address
            </label>
            <textarea
              id="address"
              className="clay-textarea"
              required
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="clay-label" htmlFor="notes">
              Order notes (optional)
            </label>
            <textarea
              id="notes"
              className="clay-textarea"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="clay-label">Payment method</legend>
          <div className="mt-2 space-y-3">
            {paymentMethods.cod ? (
              <label className="clay-cushion clay-cushion-support flex cursor-pointer items-center gap-3 p-4">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span>
                  <strong>Cash on delivery</strong>
                  <span className="block text-sm text-ink-secondary">
                    Pay when your order arrives. Stock is reserved now.
                  </span>
                </span>
              </label>
            ) : null}
            {paymentMethods.lemonsqueezy ? (
              <label className="clay-cushion clay-cushion-cool flex cursor-pointer items-center gap-3 p-4">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "lemonsqueezy"}
                  onChange={() => setPaymentMethod("lemonsqueezy")}
                />
                <span>
                  <strong>Pay online (Lemon Squeezy)</strong>
                  <span className="block text-sm text-ink-secondary">
                    Hosted checkout. Inventory reserves after verified payment.
                  </span>
                </span>
              </label>
            ) : null}
          </div>
        </fieldset>

        {error ? (
          <p className="mt-4 clay-cushion clay-cushion-warm p-3" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" className="clay-btn" disabled={loading}>
            {loading ? "Placing order…" : "Place order"}
          </button>
          <Link href="/" className="clay-btn clay-btn-ghost">
            Back to cart / store
          </Link>
        </div>
      </div>

      <aside className="clay-cushion clay-cushion-compare h-fit p-6">
        <h2 className="text-2xl font-bold">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={`${item.productId}-${item.imageId}`} className="flex gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl clay-well">
                <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-ink-secondary">
                  {item.quantity} × {formatMoney(item.unitPrice, currency)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatMoney(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Discount {promoCode ? `(${promoCode})` : ""}</dt>
            <dd>−{formatMoney(discountAmount, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{shippingHint}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Payable now (before shipping finalize)</dt>
            <dd>{formatMoney(roundMoney(Math.max(0, subtotal - discountAmount)), currency)}</dd>
          </div>
        </dl>
      </aside>
    </form>
  );
}
