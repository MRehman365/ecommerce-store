"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [paymentMethod, setPaymentMethod] = useState(
    searchParams.get("paymentMethod") || ""
  );
  const [paymentStatus, setPaymentStatus] = useState(
    searchParams.get("paymentStatus") || ""
  );
  const [orderStatus, setOrderStatus] = useState(
    searchParams.get("orderStatus") || ""
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (paymentMethod) params.set("paymentMethod", paymentMethod);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    if (orderStatus) params.set("orderStatus", orderStatus);
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="clay-tray grid gap-3 p-4 md:grid-cols-5">
      <input
        className="clay-input md:col-span-2"
        placeholder="Search order #, name, phone"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        className="clay-select"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="">Payment method</option>
        <option value="cod">COD</option>
        <option value="lemonsqueezy">Lemon Squeezy</option>
      </select>
      <select
        className="clay-select"
        value={paymentStatus}
        onChange={(e) => setPaymentStatus(e.target.value)}
      >
        <option value="">Payment status</option>
        {["unpaid", "pending", "paid", "failed", "refunded"].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        className="clay-select"
        value={orderStatus}
        onChange={(e) => setOrderStatus(e.target.value)}
      >
        <option value="">Order status</option>
        {[
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button type="submit" className="clay-btn md:col-span-5 md:w-fit">
        Filter
      </button>
    </form>
  );
}
