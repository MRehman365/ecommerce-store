"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type BannerRow = {
  id: string;
  heading: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  placement: string;
  enabled: boolean;
  sortOrder: number;
  desktopImage: { url?: string; publicId?: string };
  mobileImage: { url?: string; publicId?: string };
};

type BannerForm = {
  heading: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  placement: string;
  sortOrder: number;
  enabled: boolean;
  desktopImage: { url?: string; publicId?: string };
  mobileImage: { url?: string; publicId?: string };
};

const emptyForm: BannerForm = {
  heading: "",
  description: "",
  ctaText: "Shop now",
  ctaHref: "#products",
  placement: "hero",
  sortOrder: 0,
  enabled: true,
  desktopImage: {},
  mobileImage: {},
};

async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return { url: data.url as string, publicId: data.publicId as string };
}

export function BannerManager({ initial }: { initial: BannerRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit(banner: BannerRow) {
    setEditingId(banner.id);
    setForm({
      heading: banner.heading,
      description: banner.description,
      ctaText: banner.ctaText,
      ctaHref: banner.ctaHref,
      placement: banner.placement,
      sortOrder: banner.sortOrder,
      enabled: banner.enabled,
      desktopImage: banner.desktopImage || {},
      mobileImage: banner.mobileImage || {},
    });
    setDesktopFile(null);
    setMobileFile(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setDesktopFile(null);
    setMobileFile(null);
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const desktopImage = desktopFile
        ? await uploadFile(desktopFile)
        : form.desktopImage;
      const mobileImage = mobileFile
        ? await uploadFile(mobileFile)
        : form.mobileImage;

      const payload = {
        heading: form.heading,
        description: form.description,
        ctaText: form.ctaText,
        ctaHref: form.ctaHref,
        placement: form.placement,
        sortOrder: Number(form.sortOrder) || 0,
        enabled: form.enabled,
        desktopImage,
        mobileImage,
      };

      const res = await fetch(
        editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save banner");
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="clay-tray grid gap-3 p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold">
            {editingId ? "Edit banner" : "Create banner"}
          </h2>
        </div>
        <input
          className="clay-input"
          placeholder="Heading"
          value={form.heading}
          onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
        />
        <input
          className="clay-input"
          placeholder="CTA text"
          value={form.ctaText}
          onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
        />
        <input
          className="clay-input md:col-span-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
        <input
          className="clay-input"
          placeholder="CTA href"
          value={form.ctaHref}
          onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
        />
        <select
          className="clay-select"
          value={form.placement}
          onChange={(e) =>
            setForm((f) => ({ ...f, placement: e.target.value }))
          }
        >
          <option value="hero">Hero</option>
          <option value="mid">Mid</option>
          <option value="promo">Promo</option>
        </select>
        <input
          className="clay-input"
          type="number"
          placeholder="Sort order"
          value={form.sortOrder}
          onChange={(e) =>
            setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
          }
        />
        <label className="inline-flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) =>
              setForm((f) => ({ ...f, enabled: e.target.checked }))
            }
          />
          Enabled
        </label>
        <div>
          <label className="clay-label">Desktop image</label>
          {form.desktopImage?.url ? (
            <div className="relative mb-2 h-24 w-40 border-[length:var(--dp-border-rule)] border-ink">
              <Image
                src={form.desktopImage.url}
                alt=""
                fill
                className="object-cover swiss-img"
                sizes="160px"
              />
            </div>
          ) : null}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setDesktopFile(e.target.files?.[0] || null)}
          />
        </div>
        <div>
          <label className="clay-label">Mobile image</label>
          {form.mobileImage?.url ? (
            <div className="relative mb-2 h-24 w-40 border-[length:var(--dp-border-rule)] border-ink">
              <Image
                src={form.mobileImage.url}
                alt=""
                fill
                className="object-cover swiss-img"
                sizes="160px"
              />
            </div>
          ) : null}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMobileFile(e.target.files?.[0] || null)}
          />
        </div>
        {error ? (
          <p className="md:col-span-2 clay-cushion clay-cushion-warm p-3">
            {error}
          </p>
        ) : null}
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button type="submit" className="clay-btn" disabled={saving}>
            {saving
              ? "Saving…"
              : editingId
                ? "Update banner"
                : "Create banner"}
          </button>
          {editingId ? (
            <button
              type="button"
              className="clay-btn clay-btn-ghost"
              onClick={resetForm}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <ul className="space-y-3">
        {initial.map((banner) => (
          <li key={banner.id} className="clay-cushion clay-cushion-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-3">
                {banner.desktopImage?.url ? (
                  <div className="relative h-16 w-24 shrink-0 border-[length:var(--dp-border-rule)] border-ink">
                    <Image
                      src={banner.desktopImage.url}
                      alt=""
                      fill
                      className="object-cover swiss-img"
                      sizes="96px"
                    />
                  </div>
                ) : null}
                <div>
                  <p className="font-bold">
                    {banner.heading || "Untitled banner"}
                  </p>
                  <p className="text-sm text-ink-secondary">
                    {banner.placement} · sort {banner.sortOrder} ·{" "}
                    {banner.enabled ? "Enabled" : "Disabled"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">
                    {banner.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="clay-btn !min-h-10"
                  onClick={() => startEdit(banner)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="clay-btn !min-h-10"
                  onClick={async () => {
                    await fetch(`/api/admin/banners/${banner.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ enabled: !banner.enabled }),
                    });
                    router.refresh();
                  }}
                >
                  {banner.enabled ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  className="clay-btn clay-btn-ghost"
                  onClick={async () => {
                    if (!confirm("Delete banner?")) return;
                    await fetch(`/api/admin/banners/${banner.id}`, {
                      method: "DELETE",
                    });
                    if (editingId === banner.id) resetForm();
                    router.refresh();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
