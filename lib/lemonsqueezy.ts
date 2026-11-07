const API_BASE = "https://api.lemonsqueezy.com/v1";

export function isLemonConfigured() {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY &&
      process.env.LEMONSQUEEZY_STORE_ID &&
      process.env.LEMONSQUEEZY_VARIANT_ID
  );
}

export async function createLemonCheckout(input: {
  orderNumber: string;
  email?: string;
  name: string;
  amount: number;
  redirectUrl: string;
}) {
  if (!isLemonConfigured()) {
    throw new Error(
      "Lemon Squeezy is not configured. Set LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID, and LEMONSQUEEZY_VARIANT_ID."
    );
  }

  // Physical goods: use a custom-priced variant / checkout override when available.
  // Amount is passed as custom data + product options for verification on webhook.
  const res = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: input.email || undefined,
            name: input.name,
            custom: {
              order_number: input.orderNumber,
              expected_total: String(input.amount),
            },
          },
          product_options: {
            name: `Order ${input.orderNumber}`,
            description: "Physical merchandise order",
            redirect_url: input.redirectUrl,
          },
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: String(process.env.LEMONSQUEEZY_STORE_ID),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: String(process.env.LEMONSQUEEZY_VARIANT_ID),
            },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lemon Squeezy checkout failed: ${text}`);
  }

  const json = await res.json();
  const url = json?.data?.attributes?.url as string | undefined;
  const id = json?.data?.id as string | undefined;
  if (!url || !id) {
    throw new Error("Lemon Squeezy checkout response missing url/id");
  }
  return { url, id };
}

export async function verifyLemonWebhookSignature(
  rawBody: string,
  signature: string | null
) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const digest = Buffer.from(mac).toString("hex");
  return timingSafeEqual(digest, signature);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}
