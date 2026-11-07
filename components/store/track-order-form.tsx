"use client";

import { FormEvent, useState } from "react";
import { formatMoney } from "@/lib/money";

export function TrackOrderForm({ currency }: { currency: string }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<null | {
    orderNumber: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    total: number;
    items: { name: string; quantity: number; unitPrice: number }[];
    customer: { fullName: string; city: string; country: string };
  }>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);
    const res = await fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Order not found");
      return;
    }
    setOrder(data);
  }

  return (
    <div className="store-shell max-w-2xl py-12">
      <form onSubmit={onSubmit} className="clay-tray p-6 md:p-8">
        <h1 className="text-4xl font-bold tracking-tight">Track order</h1>
        <p className="mt-2 text-ink-secondary">
          Enter your order number and phone. We only return your own order.
        </p>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="clay-label" htmlFor="orderNumber">
              Order number
            </label>
            <input
              id="orderNumber"
              className="clay-input"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="clay-label" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              className="clay-input"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        {error ? (
          <p className="mt-4 clay-cushion clay-cushion-warm p-3" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="clay-btn mt-5">
          Look up
        </button>
      </form>

      {order ? (
        <div className="clay-cushion clay-cushion-support mt-6 p-6">
          <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
          <p className="mt-2">
            {order.customer.fullName} · {order.customer.city}, {order.customer.country}
          </p>
          <p className="mt-1">
            Status: {order.orderStatus} · Payment: {order.paymentStatus} ({order.paymentMethod})
          </p>
          <p className="mt-1 font-bold">{formatMoney(order.total, currency)}</p>
          <ul className="mt-4 space-y-1 text-sm">
            {order.items.map((item, i) => (
              <li key={`${item.name}-${i}`}>
                {item.quantity} × {item.name} — {formatMoney(item.unitPrice, currency)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
