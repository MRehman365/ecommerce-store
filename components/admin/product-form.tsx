"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/image-uploader";

type Category = { id: string; name: string };

type ProductFormValues = {
  id?: string;
  name: string;
  description: string;
  regularPrice: number;
  salePrice: number | null;
  category: string;
  sku: string;
  stock: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  images: UploadedImage[];
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>(
    initial || {
      name: "",
      description: "",
      regularPrice: 0,
      salePrice: null,
      category: "",
      sku: "",
      stock: 0,
      featured: false,
      bestSeller: false,
      newArrival: false,
      published: true,
      seoTitle: "",
      seoDescription: "",
      images: [],
    }
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        category: form.category || null,
        salePrice: form.salePrice === null || Number.isNaN(form.salePrice) ? null : form.salePrice,
      };
      const res = await fetch(
        form.id ? `/api/admin/products/${form.id}` : "/api/admin/products",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="clay-tray space-y-5 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="clay-label" htmlFor="name">
            Product name
          </label>
          <input
            id="name"
            className="clay-input"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="clay-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="clay-textarea"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div>
          <label className="clay-label" htmlFor="regularPrice">
            Regular price
          </label>
          <input
            id="regularPrice"
            type="number"
            min="0"
            step="0.01"
            className="clay-input"
            required
            value={form.regularPrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, regularPrice: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <label className="clay-label" htmlFor="salePrice">
            Sale price
          </label>
          <input
            id="salePrice"
            type="number"
            min="0"
            step="0.01"
            className="clay-input"
            value={form.salePrice ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                salePrice: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />
        </div>
        <div>
          <label className="clay-label" htmlFor="stock">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            min="0"
            className="clay-input"
            required
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="clay-label" htmlFor="sku">
            SKU
          </label>
          <input
            id="sku"
            className="clay-input"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
          />
        </div>
        <div>
          <label className="clay-label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className="clay-select"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {(
          [
            ["featured", "Featured"],
            ["bestSeller", "Best seller"],
            ["newArrival", "New arrival"],
            ["published", "Published"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="inline-flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
            />
            {label}
          </label>
        ))}
      </div>

      <ImageUploader
        images={form.images}
        onChange={(images) => setForm((f) => ({ ...f, images }))}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="clay-label" htmlFor="seoTitle">
            SEO title
          </label>
          <input
            id="seoTitle"
            className="clay-input"
            value={form.seoTitle}
            onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
          />
        </div>
        <div>
          <label className="clay-label" htmlFor="seoDescription">
            SEO description
          </label>
          <input
            id="seoDescription"
            className="clay-input"
            value={form.seoDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, seoDescription: e.target.value }))
            }
          />
        </div>
      </div>

      {error ? (
        <p className="clay-cushion clay-cushion-warm p-3" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="clay-btn" disabled={loading}>
        {loading ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
