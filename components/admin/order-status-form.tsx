"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderStatusForm({
  id,
  orderStatus,
  paymentStatus,
}: {
  id: string;
  orderStatus: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [order, setOrder] = useState(orderStatus);
  const [payment, setPayment] = useState(paymentStatus);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: order, paymentStatus: payment }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <section className="clay-cushion clay-cushion-compare p-5">
      <h2 className="text-xl font-bold">Update status</h2>
      <div className="mt-4 grid gap-3">
        <div>
          <label className="clay-label" htmlFor="orderStatus">
            Order status
          </label>
          <select
            id="orderStatus"
            className="clay-select"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          >
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
        </div>
        <div>
          <label className="clay-label" htmlFor="paymentStatus">
            Payment status
          </label>
          <select
            id="paymentStatus"
            className="clay-select"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            {["unpaid", "pending", "paid", "failed", "refunded"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="clay-btn" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save status"}
        </button>
      </div>
    </section>
  );
}
