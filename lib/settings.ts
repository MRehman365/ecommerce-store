import { connectDB } from "@/lib/db";
import { StoreSettings } from "@/models/StoreSettings";

export async function getStoreSettings() {
  await connectDB();
  let settings = await StoreSettings.findOne({ singletonKey: "default" });
  if (!settings) {
    settings = await StoreSettings.create({ singletonKey: "default" });
  }
  return settings;
}

/** Strip Mongoose subdocs so props are safe for Client Components. */
export function serializeSettings(settings: InstanceType<typeof StoreSettings>) {
  const raw =
    typeof settings.toObject === "function"
      ? settings.toObject({ flattenMaps: true })
      : settings;

  return {
    storeName: String(raw.storeName ?? ""),
    storeLogo: {
      url: String(raw.storeLogo?.url ?? ""),
      publicId: String(raw.storeLogo?.publicId ?? ""),
    },
    storeDescription: String(raw.storeDescription ?? ""),
    contactEmail: String(raw.contactEmail ?? ""),
    contactPhone: String(raw.contactPhone ?? ""),
    contactAddress: String(raw.contactAddress ?? ""),
    socialLinks: {
      instagram: String(raw.socialLinks?.instagram ?? ""),
      facebook: String(raw.socialLinks?.facebook ?? ""),
      twitter: String(raw.socialLinks?.twitter ?? ""),
      tiktok: String(raw.socialLinks?.tiktok ?? ""),
    },
    currency: String(raw.currency ?? "USD"),
    shipping: {
      standardCharge: Number(raw.shipping?.standardCharge ?? 0),
      freeShippingThreshold: Number(raw.shipping?.freeShippingThreshold ?? 0),
      enabled: Boolean(raw.shipping?.enabled ?? true),
      cityRates: Array.isArray(raw.shipping?.cityRates)
        ? raw.shipping.cityRates.map(
            (rate: { city?: string; charge?: number }) => ({
              city: String(rate.city ?? ""),
              charge: Number(rate.charge ?? 0),
            })
          )
        : [],
    },
    paymentMethods: {
      cod: Boolean(raw.paymentMethods?.cod ?? true),
      lemonsqueezy: Boolean(raw.paymentMethods?.lemonsqueezy ?? false),
    },
    announcement: {
      text: String(raw.announcement?.text ?? ""),
      enabled: Boolean(raw.announcement?.enabled ?? false),
    },
    policies: {
      shipping: String(raw.policies?.shipping ?? ""),
      returns: String(raw.policies?.returns ?? ""),
      privacy: String(raw.policies?.privacy ?? ""),
      terms: String(raw.policies?.terms ?? ""),
    },
    seo: {
      title: String(raw.seo?.title ?? ""),
      description: String(raw.seo?.description ?? ""),
    },
  };
}
