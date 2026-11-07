"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { discountPercent, formatMoney, unitPrice } from "@/lib/money";
import { flyImageToCart } from "@/lib/fly-to-cart";
import type { ProductImage } from "@/types";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  regularPrice: number;
  salePrice?: number | null;
  stock: number;
  images: ProductImage[];
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  category?: string | null;
  createdAt?: string;
};

export function ProductCard({
  product,
  currency,
}: {
  product: StoreProduct;
  currency: string;
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
  const selected =
    sorted.find((img) => img.id === selectedId) || defaultImage;
  const price = unitPrice(product.regularPrice, product.salePrice);
  const pct = discountPercent(product.regularPrice, product.salePrice);
  const outOfStock = product.stock <= 0;
  const href = `/product/${product.slug}`;

  function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!selected?.url || outOfStock || adding) return;

    setAdding(true);
    try {
      flyImageToCart(selected.url, imageRef.current);
      addItem({
        productId: product.id,
        imageId: selected.id,
        imageUrl: selected.url,
        name: product.name,
        unitPrice: price,
        stock: product.stock,
      });
    } finally {
      window.setTimeout(() => setAdding(false), 500);
    }
  }

  return (
    <article className="flex h-full flex-col bg-ground p-4">
      <div ref={imageRef} className="clay-well relative aspect-[3/4]">
        <Link href={href} className="absolute inset-0 block">
          {selected?.url ? (
            <Image
              src={selected.url}
              alt={selected.alt || product.name}
              fill
              sizes="(max-width:700px) 100vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-secondary">
              No image
            </div>
          )}
        </Link>
        {outOfStock ? (
          <span className="clay-chip absolute left-0 top-0 z-10">
            Out of stock
          </span>
        ) : pct ? (
          <span className="clay-chip clay-cushion-accent absolute left-0 top-0 z-10">
            −{pct}%
          </span>
        ) : null}
      </div>

      {sorted.length > 1 ? (
        <div
          className="mt-3 flex flex-wrap gap-2"
          role="listbox"
          aria-label={`${product.name} styles`}
        >
          {sorted.map((img) => {
            const active = img.id === selected?.id;
            return (
              <button
                key={img.id}
                type="button"
                role="option"
                aria-selected={active}
                className={`relative h-12 w-12 overflow-hidden border-[length:var(--dp-border-rule)] ${
                  active ? "border-accent" : "border-ink"
                }`}
                onClick={() => setSelectedId(img.id)}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="text-[length:var(--dp-typography-item-title)] font-bold tracking-tight">
          <Link href={href}>{product.name}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[length:var(--dp-typography-metadata)] text-ink-secondary">
          {product.description}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold">
            {formatMoney(price, currency)}
          </span>
          {product.salePrice != null &&
          product.salePrice > 0 &&
          product.salePrice < product.regularPrice ? (
            <span className="text-sm text-ink-secondary line-through">
              {formatMoney(product.regularPrice, currency)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 swiss-label text-ink-secondary">
          {outOfStock ? "Unavailable" : `${product.stock} in stock`}
        </p>
        <div className="mt-4 grid gap-2">
          <Link href={href} className="clay-btn clay-btn-ghost w-fit">
            View details
          </Link>
          <button
            type="button"
            className={`clay-btn w-full ${adding ? "is-adding" : ""}`}
            disabled={outOfStock || !selected?.url || adding}
            onClick={handleAdd}
          >
            {adding ? "Added!" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
