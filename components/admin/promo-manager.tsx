"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type PromoRow = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string;
};

export function PromoManager({ initial }: { initial: PromoRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 10,
    minOrderAmount: 0,
    maxDiscount: "",
    usageLimit: "",
    expiresAt: "",
  });

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
        usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
        expiresAt: form.expiresAt || null,
        active: true,
      }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="clay-tray grid gap-3 p-5 md:grid-cols-3">
        <input
          className="clay-input"
          placeholder="CODE"
          required
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
        />
        <select
          className="clay-select"
          value={form.type}
          onChange={(e) =>
            setForm((f) => ({ ...f, type: e.target.value as "percentage" | "fixed" }))
          }
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed amount</option>
        </select>
        <input
          className="clay-input"
          type="number"
          min="0"
          required
          value={form.value}
          onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
        />
        <input
          className="clay-input"
          type="number"
          min="0"
          placeholder="Min order"
          value={form.minOrderAmount}
          onChange={(e) =>
            setForm((f) => ({ ...f, minOrderAmount: Number(e.target.value) }))
          }
        />
        <input
          className="clay-input"
          type="number"
          min="0"
          placeholder="Max discount"
          value={form.maxDiscount}
          onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
        />
        <input
          className="clay-input"
          type="number"
          min="1"
          placeholder="Usage limit"
          value={form.usageLimit}
          onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
        />
        <input
          className="clay-input"
          type="date"
          value={form.expiresAt}
          onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
        />
        <button type="submit" className="clay-btn md:col-span-2">
          Create promo
        </button>
      </form>

      <div className="clay-tray table-wrap p-4">
        <table className="clay-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Value</th>
              <th>Used</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {initial.map((promo) => (
              <tr key={promo.id}>
                <td className="font-semibold">{promo.code}</td>
                <td>
                  {promo.type === "percentage" ? `${promo.value}%` : promo.value}
                </td>
                <td>
                  {promo.usedCount}
                  {promo.usageLimit != null ? ` / ${promo.usageLimit}` : ""}
                </td>
                <td>{promo.active ? "Active" : "Inactive"}</td>
                <td className="space-x-2">
                  <button
                    type="button"
                    className="clay-btn !min-h-9 !px-3"
                    onClick={async () => {
                      await fetch(`/api/admin/promos/${promo.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ active: !promo.active }),
                      });
                      router.refresh();
                    }}
                  >
                    Toggle
                  </button>
                  <button
                    type="button"
                    className="clay-btn clay-btn-ghost"
                    onClick={async () => {
                      if (!confirm("Delete promo?")) return;
                      await fetch(`/api/admin/promos/${promo.id}`, { method: "DELETE" });
                      router.refresh();
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
