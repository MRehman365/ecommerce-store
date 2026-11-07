# Clay Market — Shopify-style single-page store

Next.js App Router storefront + admin dashboard with Claymorphism UI, MongoDB, Cloudinary uploads, guest checkout, COD, and Lemon Squeezy (optional).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- MongoDB + Mongoose
- Cloudinary (product/banner uploads)
- Lemon Squeezy hosted checkout + signed webhooks
- Cash on Delivery
- Jose-secured admin sessions

## Setup

1. Copy `.env.example` to `.env.local` and fill values.
2. Start MongoDB locally (or set `MONGODB_URI` to Atlas).
3. Install and seed:

```bash
npm install
npm run seed
npm run dev
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Default admin (seeded in MongoDB): `admin@gmail.com` / `123456`
- Sample promo: `SOFT10`

## Customer flow

1. Browse the single-page store.
2. Select a product **image** (visual variation) — not color swatches.
3. Add to cart (drawer, localStorage-persisted). Different images of the same product are separate line items.
4. Apply a promo code (server-validated).
5. Guest checkout with delivery details.
6. Pay with COD or Lemon Squeezy.
7. Track with order number + phone at `/track`.

## Admin

Manage products (multi-image variations), categories, banners, promos, orders, inventory signals, announcement bar, shipping, payments, and policies.

## Environment variables

See `.env.example`. Lemon Squeezy and Cloudinary stay inactive until credentials are set — COD and seeded Unsplash images still work for local demos.

Webhook URL once Lemon Squeezy is enabled:

`POST /api/webhooks/lemonsqueezy`

Confirm Lemon Squeezy supports your physical-goods configuration before enabling online payment in Store Settings.

## Inventory policy

- **COD**: stock reserved when the order is created; restored if admin cancels.
- **Lemon Squeezy**: stock checked at checkout, reserved only after a verified paid webhook.
