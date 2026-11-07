"use client";

import { useState } from "react";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { StoreHeader } from "@/components/store/header";
import { HeroSection } from "@/components/store/hero";
import { ProductCatalog } from "@/components/store/product-catalog";
import { PromoBanner } from "@/components/store/promo-banner";
import { CartDrawer } from "@/components/store/cart-drawer";
import { StoreFooter } from "@/components/store/footer";
import type { StoreProduct } from "@/components/store/product-card";

type Settings = {
  storeName: string;
  storeLogo?: { url?: string };
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialLinks: Record<string, string>;
  currency: string;
  shipping: {
    standardCharge: number;
    freeShippingThreshold: number;
  };
  announcement: { text: string; enabled: boolean };
  policies: {
    shipping: string;
    returns: string;
    privacy: string;
    terms: string;
  };
};

type Banner = {
  id: string;
  heading: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  desktopImage?: { url?: string };
  mobileImage?: { url?: string };
  placement: string;
};

export function Storefront({
  settings,
  products,
  categories,
  banners,
}: {
  settings: Settings;
  products: StoreProduct[];
  categories: { id: string; name: string; slug: string }[];
  banners: Banner[];
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const hero = banners.find((b) => b.placement === "hero") || banners[0];
  const midBanners = banners.filter(
    (b) => b.placement === "mid" || b.placement === "promo"
  );

  return (
    <div className="min-h-full">
      <AnnouncementBar
        text={settings.announcement.text}
        enabled={settings.announcement.enabled}
      />
      <StoreHeader
        storeName={settings.storeName}
        logoUrl={settings.storeLogo?.url}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <HeroSection banner={hero} storeName={settings.storeName} />
      <div id="collections">
        <ProductCatalog
          products={products}
          categories={categories}
          currency={settings.currency}
          searchOpen={searchOpen}
          onSearchClose={() => setSearchOpen(false)}
        />
      </div>
      {midBanners.map((banner) => (
        <PromoBanner key={banner.id} banner={banner} />
      ))}
      <section className="swiss-field border-y-[length:var(--dp-border-rule)] border-ink">
        <div className="store-shell py-10 md:py-14">
          <div className="hero-grid">
            <div className="swiss-hero-copy">
              <h2 className="swiss-display text-ground">Ready when you are</h2>
              <p className="mt-4 max-w-xl text-[length:var(--dp-typography-lead)] text-ground/80">
                Open the cart, apply a code, and place a guest order with COD or
                online payment.
              </p>
            </div>
            <div className="swiss-hero-aside flex flex-col justify-end gap-3 border-t-[length:var(--dp-border-rule)] border-ground/40 pt-4 md:border-t-0 md:border-l-[length:var(--dp-border-rule)] md:border-ground/40 md:pl-4 md:pt-0">
              <a
                href="#products"
                className="clay-btn w-full !border-ground !bg-ground !text-ink hover:!bg-transparent hover:!text-ground"
              >
                Back to shopping
              </a>
              <a
                href="/track"
                className="clay-btn clay-btn-ghost !border-ground !text-ground"
              >
                Track an order
              </a>
            </div>
          </div>
        </div>
      </section>
      <StoreFooter settings={settings} />
      <CartDrawer
        currency={settings.currency}
        freeShippingThreshold={settings.shipping.freeShippingThreshold}
        standardShipping={settings.shipping.standardCharge}
      />
    </div>
  );
}
