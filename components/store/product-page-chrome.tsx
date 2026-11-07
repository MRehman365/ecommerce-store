"use client";

import { useRouter } from "next/navigation";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { StoreHeader } from "@/components/store/header";
import { CartDrawer } from "@/components/store/cart-drawer";
import { StoreFooter } from "@/components/store/footer";

export function ProductPageChrome({
  children,
  storeName,
  logoUrl,
  announcement,
  currency,
  freeShippingThreshold,
  standardShipping,
  footerSettings,
}: {
  children: React.ReactNode;
  storeName: string;
  logoUrl?: string;
  announcement: { text: string; enabled: boolean };
  currency: string;
  freeShippingThreshold: number;
  standardShipping: number;
  footerSettings: {
    storeName: string;
    storeDescription: string;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    socialLinks: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      tiktok?: string;
    };
    policies: {
      shipping: string;
      returns: string;
      privacy: string;
      terms: string;
    };
  };
}) {
  const router = useRouter();

  return (
    <div className="min-h-full">
      <AnnouncementBar
        text={announcement.text}
        enabled={announcement.enabled}
      />
      <StoreHeader
        storeName={storeName}
        logoUrl={logoUrl}
        onSearchOpen={() => router.push("/#products")}
      />
      {children}
      <StoreFooter settings={footerSettings} />
      <CartDrawer
        currency={currency}
        freeShippingThreshold={freeShippingThreshold}
        standardShipping={standardShipping}
      />
    </div>
  );
}
