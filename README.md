# scrollerCat

An online store for Ghana that works two ways:

- **Shop**: visitors search the catalogue, add items to a cart, choose a delivery option and pay with mobile money or card through Paystack. Admins see the order, pack it and add courier tracking.
- **Shop-for-me**: if we don't stock something, visitors send a request (a product name or a link from any store). An admin quotes one all-in price (item + shipping + fee). The customer pays it from the tracking page, and the admin then sources and ships it.

Built on the geared.io stack. See [`../TECH_STACK.md`](../TECH_STACK.md) for the stack and conventions it shares with myklesia.

## Setup

```bash
# Create .env.local (the only env file) with MONGODB_URI, MONGODB_DB, BETTER_AUTH_URL,
# BETTER_AUTH_SECRET, NEXT_PUBLIC_HOST, PAYSTACK_SECRET_KEY and SEED_ADMIN_*.
# Next.js and scripts/with-db.mjs (db:push, seed, db:studio) both read it.
npm install
npm run db:push           # creates the MongoDB collections and indexes
npm run seed              # first admin, plus starter categories, products and delivery options
npm run dev
```

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin (sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)

### Paystack

1. Locally, use your **test** secret key (`sk_test_…`). In production, use the live key.
2. In the Paystack dashboard, set the webhook URL to `https://<your-domain>/api/payments/webhook`.
3. To test the webhook locally, expose your dev server with a tunnel (for example ngrok). You don't need the webhook to test locally, though: the `/payment/callback` page confirms each payment through `/api/payments/verify/:reference`.

## Pages

| Path | What |
| --- | --- |
| `/` | Landing page: hero search, categories, featured items, shop-for-me pitch, delivery options |
| `/shop?q=&category=&sort=&inStock=1` | Search results. When nothing matches, it offers to source the item |
| `/product/[slug]` | Product page with add to cart / buy now |
| `/cart`, `/checkout` | Cart (kept in localStorage), then checkout and the Paystack popup |
| `/request` | Shop-for-me request form |
| `/track?code=&email=` | Order or request status. Quoted requests are paid from here |
| `/payment/callback` | Confirms the payment after Paystack |
| `/admin/*` | Dashboard, orders, sourcing requests, products and categories, customers, delivery options, payments |

## How payments work

1. `POST /api/payments/initialize` prices the cart (or a quote) from the **database**, creates a `PENDING_PAYMENT` order (or uses the quoted request) and a `PENDING` payment, then starts the Paystack transaction.
2. The browser opens Paystack's popup. In in-app browsers it falls back to Paystack's hosted page.
3. Both the webhook and `/verify/:reference` call `controllers/payments/fulfill.ts`. This step is idempotent: it moves the payment `PENDING → PROCESSING → SUCCESS`, marks the order or request `PAID`, and takes the items off stock.

## Rebranding

The logo is a cat head shaped like a lowercase "c" with a magnifying-glass handle, on two cart wheels; in the wordmark it is the "c" of "cat". It lives in `src/components/logo` (with its own yellow, `BRAND_YELLOW`), `src/app/icon.svg` (favicon) and `public/logo.svg`. To recolour the rest of the UI, edit `--primary` (and `--brand`/`--ring`) in `src/styles/globals.css`. Store name, tagline and contact details are in `src/data/site.ts`.
