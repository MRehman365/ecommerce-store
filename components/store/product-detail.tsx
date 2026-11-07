"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { discountPercent, formatMoney, unitPrice } from "@/lib/money";
import { flyImageToCart } from "@/lib/fly-to-cart";
import type { ProductImage } from "@/types";

export type ProductDetailData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  regularPrice: number;
  salePrice?: number | null;
  stock: number;
  sku: string;
  images: ProductImage[];
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  categoryName?: string | null;
  seoTitle?: string;
  seoDescription?: string;
};

export function ProductDetail({
  product,
  currency,
  related,
}: {
  product: ProductDetailData;
  currency: string;
  related: {
    id: string;
    name: string;
    slug: string;
    regularPrice: number;
    salePrice?: number | null;
    images: ProductImage[];
  }[];
}) {
  const { addItem } = useCart();
  const imageRef = useRef<HTMLDivElement>(null);
  const [adding, setAdding] = useState(false);
  const sorted = [...(product.images || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
  const defaultImage =
    sorted.find((img) => img.isDefault) || sorted[0] || null;
  const [selectedId, setSelectedId] = useState(defaultImage?.id || "");
  const [qty, setQty] = useState(1);
  const selected =
    sorted.find((img) => img.id === selectedId) || defaultImage;
  const price = unitPrice(product.regularPrice, product.salePrice);
  const pct = discountPercent(product.regularPrice, product.salePrice);
  const outOfStock = product.stock <= 0;

  return (
    <main className="store-shell py-8 md:py-12">
      <nav className="swiss-label mb-6 text-ink-secondary" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent">
          Store
        </Link>
        <span className="mx-2">/</span>
        <Link href="/#products" className="hover:text-accent">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="swiss-grid items-start gap-y-8">
        <div className="swiss-rail">
          <p className="swiss-index">
            <span className="swiss-mark" aria-hidden="true" />
            Product
          </p>
          {product.categoryName ? (
            <p className="mt-4 text-sm text-ink-secondary">{product.categoryName}</p>
          ) : null}
          {product.sku ? (
            <p className="mt-2 swiss-label text-ink-secondary">SKU {product.sku}</p>
          ) : null}
        </div>

        <div className="swiss-main grid gap-8 lg:grid-cols-2">
          <div>
            <div
              ref={imageRef}
              className="clay-well relative aspect-[3/4] bg-surface"
            >
              {selected?.url ? (
                <Image
                  src={selected.url}
                  alt={selected.alt || product.name}
                  fill
                  priority
                  sizes="(max-width:700px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-ink-secondary">
                  No image
                </div>
              )}
              {outOfStock ? (
                <span className="clay-chip absolute left-0 top-0">Out of stock</span>
              ) : pct ? (
                <span className="clay-chip clay-cushion-accent absolute left-0 top-0">
                  −{pct}%
                </span>
              ) : null}
            </div>

            {sorted.length > 1 ? (
              <div
                className="mt-3 flex flex-wrap gap-2"
                role="listbox"
                aria-label={`${product.name} style images`}
              >
                {sorted.map((img) => {
                  const active = img.id === selected?.id;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`relative h-20 w-20 overflow-hidden border-[length:var(--dp-border-rule)] ${
                        active ? "border-accent" : "border-ink"
                      }`}
                      onClick={() => setSelectedId(img.id)}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || ""}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}
            <p className="mt-3 text-sm text-ink-secondary">
              Select an image to choose the style shipped with your order.
            </p>
          </div>

          <div>
            <h1 className="swiss-section-title">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold">{formatMoney(price, currency)}</span>
              {product.salePrice != null &&
              product.salePrice > 0 &&
              product.salePrice < product.regularPrice ? (
                <span className="text-lg text-ink-secondary line-through">
                  {formatMoney(product.regularPrice, currency)}
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {product.featured ? (
                <span className="clay-chip">Featured</span>
              ) : null}
              {product.bestSeller ? (
                <span className="clay-chip">Best seller</span>
              ) : null}
              {product.newArrival ? (
                <span className="clay-chip">New arrival</span>
              ) : null}
            </div>

            <p className="mt-6 whitespace-pre-wrap text-[length:var(--dp-typography-lead)] leading-[var(--dp-typography-body-leading)] text-ink-secondary">
              {product.description}
            </p>

            <dl className="mt-6 space-y-2 border-t-[length:var(--dp-border-rule)] border-ink pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="swiss-label">Availability</dt>
                <dd>
                  {outOfStock ? "Out of stock" : `${product.stock} in stock`}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="swiss-label">Selected style</dt>
                <dd>{selected?.alt || "Default image"}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="clay-label !mb-0" htmlFor="qty">
                  Qty
                </label>
                <button
                  type="button"
                  className="clay-btn !min-h-10 !px-3"
                  aria-label="Decrease quantity"
                  disabled={outOfStock}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <input
                  id="qty"
                  className="clay-input !w-16 text-center"
                  type="number"
                  min={1}
                  max={product.stock || 1}
                  value={qty}
                  disabled={outOfStock}
                  onChange={(e) =>
                    setQty(
                      Math.max(
                        1,
                        Math.min(product.stock || 1, Number(e.target.value) || 1)
                      )
                    )
                  }
                />
                <button
                  type="button"
                  className="clay-btn !min-h-10 !px-3"
                  aria-label="Increase quantity"
                  disabled={outOfStock}
                  onClick={() =>
                    setQty((q) => Math.min(product.stock || 1, q + 1))
                  }
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className={`clay-btn ${adding ? "is-adding" : ""}`}
                disabled={outOfStock || !selected || adding}
                onClick={() => {
                  if (!selected || adding) return;
                  setAdding(true);
                  flyImageToCart(selected.url, imageRef.current);
                  addItem({
                    productId: product.id,
                    imageId: selected.id,
                    imageUrl: selected.url,
                    name: product.name,
                    unitPrice: price,
                    stock: product.stock,
                    quantity: qty,
                  });
                  window.setTimeout(() => setAdding(false), 520);
                }}
              >
                {adding ? "Added!" : "Add to cart"}
              </button>
              <Link href="/#products" className="clay-btn clay-btn-ghost">
                Back to catalog
              </Link>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-14 border-t-[length:var(--dp-border-rule)] border-ink pt-10">
          <div className="swiss-grid mb-6">
            <div className="swiss-rail">
              <p className="swiss-index">
                <span className="swiss-mark" aria-hidden="true" />
                Related
              </p>
            </div>
            <div className="swiss-main">
              <h2 className="swiss-section-title">More from the catalog</h2>
            </div>
          </div>
          <div className="product-grid">
            {related.map((item) => {
              const cover =
                [...(item.images || [])].sort(
                  (a, b) => a.sortOrder - b.sortOrder
                ).find((img) => img.isDefault) || item.images?.[0];
              const itemPrice = unitPrice(item.regularPrice, item.salePrice);
              return (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className="block bg-ground p-4"
                >
                  <div className="clay-well relative aspect-[3/4]">
                    {cover?.url ? (
                      <Image
                        src={cover.url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width:700px) 100vw, 25vw"
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-3 font-bold tracking-tight">{item.name}</h3>
                  <p className="mt-1">{formatMoney(itemPrice, currency)}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
