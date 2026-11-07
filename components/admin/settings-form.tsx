"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  currency: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  shipping: {
    standardCharge: number;
    freeShippingThreshold: number;
    enabled: boolean;
  };
  paymentMethods: {
    cod: boolean;
    lemonsqueezy: boolean;
  };
  announcement: {
    text: string;
    enabled: boolean;
  };
  policies: {
    shipping: string;
    returns: string;
    privacy: string;
    terms: string;
  };
  seo: {
    title: string;
    description: string;
  };
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Save failed");
      return;
    }
    setMessage("Settings saved");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="clay-tray space-y-5 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="clay-label">Store name</label>
          <input
            className="clay-input"
            value={form.storeName}
            onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
          />
        </div>
        <div>
          <label className="clay-label">Currency</label>
          <input
            className="clay-input"
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="clay-label">Description</label>
          <textarea
            className="clay-textarea"
            value={form.storeDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, storeDescription: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="clay-label">Contact email</label>
          <input
            className="clay-input"
            value={form.contactEmail}
            onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
          />
        </div>
        <div>
          <label className="clay-label">Contact phone</label>
          <input
            className="clay-input"
            value={form.contactPhone}
            onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="clay-label">Address</label>
          <input
            className="clay-input"
            value={form.contactAddress}
            onChange={(e) =>
              setForm((f) => ({ ...f, contactAddress: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="clay-label">Standard shipping</label>
          <input
            type="number"
            min="0"
            className="clay-input"
            value={form.shipping.standardCharge}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                shipping: { ...f.shipping, standardCharge: Number(e.target.value) },
              }))
            }
          />
        </div>
        <div>
          <label className="clay-label">Free shipping threshold</label>
          <input
            type="number"
            min="0"
            className="clay-input"
            value={form.shipping.freeShippingThreshold}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                shipping: {
                  ...f.shipping,
                  freeShippingThreshold: Number(e.target.value),
                },
              }))
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={form.paymentMethods.cod}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                paymentMethods: { ...f.paymentMethods, cod: e.target.checked },
              }))
            }
          />
          Enable COD
        </label>
        <label className="inline-flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={form.paymentMethods.lemonsqueezy}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                paymentMethods: {
                  ...f.paymentMethods,
                  lemonsqueezy: e.target.checked,
                },
              }))
            }
          />
          Enable Lemon Squeezy
        </label>
        <label className="inline-flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={form.announcement.enabled}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                announcement: { ...f.announcement, enabled: e.target.checked },
              }))
            }
          />
          Announcement enabled
        </label>
      </div>

      <div>
        <label className="clay-label">Announcement text</label>
        <input
          className="clay-input"
          value={form.announcement.text}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              announcement: { ...f.announcement, text: e.target.value },
            }))
          }
        />
      </div>

      {(
        [
          ["shipping", "Shipping policy"],
          ["returns", "Return policy"],
          ["privacy", "Privacy policy"],
          ["terms", "Terms"],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <label className="clay-label">{label}</label>
          <textarea
            className="clay-textarea"
            value={form.policies[key]}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                policies: { ...f.policies, [key]: e.target.value },
              }))
            }
          />
        </div>
      ))}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="clay-label">SEO title</label>
          <input
            className="clay-input"
            value={form.seo.title}
            onChange={(e) =>
              setForm((f) => ({ ...f, seo: { ...f.seo, title: e.target.value } }))
            }
          />
        </div>
        <div>
          <label className="clay-label">SEO description</label>
          <input
            className="clay-input"
            value={form.seo.description}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                seo: { ...f.seo, description: e.target.value },
              }))
            }
          />
        </div>
      </div>

      {message ? <p role="status">{message}</p> : null}
      <button type="submit" className="clay-btn">
        Save settings
      </button>
    </form>
  );
}
