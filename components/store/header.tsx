"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

const links = [
  { href: "/#featured", label: "Featured" },
  { href: "/#collections", label: "Collections" },
  { href: "/#products", label: "Shop" },
  { href: "/#policies", label: "Policies" },
  { href: "/track", label: "Track order" },
];

export function StoreHeader({
  storeName,
  logoUrl,
  sticky = true,
  onSearchOpen,
}: {
  storeName: string;
  logoUrl?: string;
  sticky?: boolean;
  onSearchOpen: () => void;
}) {
  const { itemCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={`${sticky ? "sticky top-0 z-30" : ""} border-b-[length:var(--dp-border-rule)] border-ink bg-ground/95 backdrop-blur-sm`}
    >
      <div className="store-shell flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3 font-bold tracking-tight">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-9 w-9 object-cover border-[length:var(--dp-border-rule)] border-ink"
            />
          ) : (
            <span
              className="inline-flex h-9 w-9 items-center justify-center border-[length:var(--dp-border-rule)] border-ink bg-ink text-sm font-bold text-ground"
              aria-hidden="true"
            >
              {storeName.slice(0, 1)}
            </span>
          )}
          <span className="text-lg uppercase tracking-[-0.03em] md:text-xl">
            {storeName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-ink-secondary transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="clay-btn !min-h-10 !px-3"
            aria-label="Search products"
            onClick={onSearchOpen}
          >
            Search
          </button>
          <button
            type="button"
            data-cart-trigger
            className="clay-btn !min-h-10 !px-3"
            aria-label={`Open cart, ${itemCount} items`}
            onClick={openCart}
          >
            Cart ({itemCount})
          </button>
          <button
            type="button"
            className="clay-btn !min-h-10 !px-3 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            Menu
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="store-shell flex flex-col border-t-[length:var(--dp-border-rule)] border-ink pb-4 md:hidden"
          aria-label="Mobile"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="border-b border-ink/20 py-3 font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
