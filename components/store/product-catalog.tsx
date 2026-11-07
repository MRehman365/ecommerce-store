"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard, type StoreProduct } from "@/components/store/product-card";

type Category = { id: string; name: string; slug: string };

const PAGE_SIZE = 8;

export function ProductCatalog({
  products,
  categories,
  currency,
  searchOpen,
  onSearchClose,
}: {
  products: StoreProduct[];
  categories: Category[];
  currency: string;
  searchOpen: boolean;
  onSearchClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    if (sort === "price-asc") {
      list.sort(
        (a, b) =>
          (a.salePrice && a.salePrice < a.regularPrice
            ? a.salePrice
            : a.regularPrice) -
          (b.salePrice && b.salePrice < b.regularPrice
            ? b.salePrice
            : b.regularPrice)
      );
    } else if (sort === "price-desc") {
      list.sort(
        (a, b) =>
          (b.salePrice && b.salePrice < b.regularPrice
            ? b.salePrice
            : b.regularPrice) -
          (a.salePrice && a.salePrice < a.regularPrice
            ? a.salePrice
            : a.regularPrice)
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }
    return list;
  }, [products, query, category, sort]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category, sort]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remaining = Math.max(0, filtered.length - visibleCount);

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const best = products.filter((p) => p.bestSeller).slice(0, 4);
  const newest = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 4);

  return (
    <>
      {searchOpen ? (
        <div className="store-shell mb-4">
          <div className="clay-tray flex flex-wrap items-end gap-3 p-5">
            <div className="min-w-[220px] flex-1">
              <label className="clay-label" htmlFor="product-search">
                Search products
              </label>
              <input
                id="product-search"
                className="clay-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name"
                autoFocus
              />
            </div>
            <button type="button" className="clay-btn clay-btn-ghost" onClick={onSearchClose}>
              Close search
            </button>
          </div>
        </div>
      ) : null}

      <Section title="Featured" id="featured" products={featured} currency={currency} />
      <Section title="Best selling" id="bestsellers" products={best} currency={currency} />
      <Section title="New arrivals" id="new" products={newest} currency={currency} />

      <section id="products" className="store-shell border-b-[length:var(--dp-border-rule)] border-ink py-8">
        <div className="swiss-grid mb-6">
          <div className="swiss-rail">
            <p className="swiss-index">
              <span className="swiss-mark" aria-hidden="true" />
              08 / Catalog
            </p>
          </div>
          <div className="swiss-main">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="swiss-section-title">All products</h2>
                <p className="mt-2 max-w-xl text-ink-secondary">
                  Filter by category, sort by price or newest, and pick the exact image variation.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="clay-label" htmlFor="category-filter">
                    Category
                  </label>
                  <select
                    id="category-filter"
                    className="clay-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="all">All</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="clay-label" htmlFor="sort-filter">
                    Sort
                  </label>
                  <select
                    id="sort-filter"
                    className="clay-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                  </select>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="border-[length:var(--dp-border-rule)] border-ink bg-surface p-8">
                <p className="font-semibold">No products match these filters.</p>
                <button
                  type="button"
                  className="clay-btn mt-4"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <p className="mb-4 swiss-label text-ink-secondary">
                  Showing {visibleProducts.length} of {filtered.length}
                </p>
                <div className="product-grid">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currency={currency}
                    />
                  ))}
                </div>
                {hasMore ? (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <button
                      type="button"
                      className="clay-btn"
                      onClick={() =>
                        setVisibleCount((count) => count + PAGE_SIZE)
                      }
                    >
                      Load more
                      {remaining > 0
                        ? ` (${Math.min(PAGE_SIZE, remaining)} more)`
                        : ""}
                    </button>
                    <p className="text-sm text-ink-secondary">
                      {remaining} product{remaining === 1 ? "" : "s"} remaining
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Section({
  title,
  id,
  products,
  currency,
}: {
  title: string;
  id: string;
  products: StoreProduct[];
  currency: string;
}) {
  if (!products.length) return null;
  const index =
    id === "featured" ? "05" : id === "bestsellers" ? "06" : "07";
  return (
    <section
      id={id}
      className="store-shell border-b-[length:var(--dp-border-rule)] border-ink py-8"
    >
      <div className="swiss-grid mb-6">
        <div className="swiss-rail">
          <p className="swiss-index">
            <span className="swiss-mark" aria-hidden="true" />
            {index} / {title}
          </p>
        </div>
        <div className="swiss-main flex flex-wrap items-end justify-between gap-3">
          <h2 className="swiss-section-title">{title}</h2>
          <a href="#products" className="clay-btn clay-btn-ghost">
            View all
          </a>
        </div>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={`${id}-${product.id}`}
            product={product}
            currency={currency}
          />
        ))}
      </div>
    </section>
  );
}
