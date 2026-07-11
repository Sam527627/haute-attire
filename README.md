# Haute Attire by NK — Luxury Fashion E-commerce

Modern Indian luxury womenswear store. Next.js 15 · TypeScript · TailwindCSS · Framer Motion · Prisma · PostgreSQL · Razorpay · Resend.

## What's real (no fake buttons)

- **Storefront**: animated hero, mega menu, collections, categories, search, product pages (gallery, size guide, low-stock badges, pincode delivery check, JSON-LD schema), wishlist, reviews.
- **Cart & checkout**: client cart with server-side price/stock re-validation, coupons, gift wrap, COD, and a complete Razorpay flow (order create → checkout.js → HMAC signature verification → stock decrement → confirmation email).
- **Accounts**: JWT (httpOnly cookie) auth, order history, wishlist.
- **Admin** (`/admin`, role-gated by middleware): revenue/orders dashboard, low-stock alerts, order status management, per-size stock editing, product publish toggle, product-create API, coupon management, audit log.
- **SEO**: metadata, OpenGraph, sitemap.xml, robots.txt, Product JSON-LD.
- **Security**: bcrypt (12 rounds), signed JWT sessions, zod validation on every route, rate limiting, security headers, role middleware, Razorpay HMAC verification, audit logging.

## Quick start

```bash
cp .env.example .env          # fill in DATABASE_URL + JWT_SECRET at minimum
npm install
npx prisma db push            # create tables
npm run db:seed               # 12 products, categories, collections, coupons, admin user
npm run dev
```

Or with Docker: `docker compose up` (runs Postgres + the app).

**Admin login**: `admin@hauteattirebynk.com` / `Admin@HauteNK2026` — change immediately in production.
**Coupons seeded**: `WELCOME10` (10% over ₹1,999), `FESTIVE500` (₹500 over ₹3,499).

## Payments

Razorpay works out of the box once you add test keys from dashboard.razorpay.com to `.env` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`). Until then, checkout honestly reports online payment as unconfigured and COD still works end-to-end. Use Razorpay test card `4111 1111 1111 1111` or test UPI `success@razorpay`.

Stripe (international) and Shiprocket have env slots reserved; wire them in `lib/` following the Razorpay pattern.

## Your Instagram photos

1. Create a free Cloudinary account, upload your product photos to a `hauteattire` folder.
2. Replace the Unsplash URLs in `prisma/seed.ts` (or create products via `POST /api/admin/products`).
3. For the homepage Instagram grid: create an Instagram Basic Display app, generate a long-lived token, set `INSTAGRAM_ACCESS_TOKEN` — the grid syncs automatically (cached 1 hour).

## Deploy (Vercel)

1. Push to GitHub, import in Vercel.
2. Add a Postgres database (Neon/Supabase/Vercel Postgres) and set `DATABASE_URL`.
3. Set all env vars from `.env.example`.
4. `npx prisma db push && npm run db:seed` once against the production DB.

## Structure

```
app/                 pages + API routes (App Router)
  admin/             role-gated back office
  api/               auth, checkout, razorpay verify, admin CRUD
components/          UI (Hero, ProductCard, CartDrawer, CheckoutClient…)
lib/                 prisma, auth (JWT), razorpay, currency, cart store, rate limit, email
prisma/              schema + seed
middleware.ts        admin route protection
```

## Currency

Prices are stored in INR paise (source of truth). `lib/currency.ts` renders USD/AED/GBP/EUR/AUD/CAD for display; refresh the FX table via a cron in production. Razorpay charges in INR; route international cards through Stripe when you enable it.
