# WashBook — Multi-Tenant Car Wash Booking SaaS

A complete, ready-to-run booking platform for car wash businesses. Car wash
owners sign up, get their own public booking page, and manage services,
hours, and bookings from a dashboard. A platform admin panel lets you
(the operator) oversee every business on the platform.

Built with Next.js (App Router, TypeScript), Prisma + PostgreSQL, and
Auth.js. No paid third-party services are required to run it.

## Features

- **Self-serve business signup** — a car wash owner signs up and instantly
  gets a public booking page at `/your-business-slug`
- **Public booking page** — customers pick a service, see live availability
  (computed from operating hours, service duration, and bay capacity), and
  book in a few clicks — no account needed
- **Business dashboard** — manage services, weekly operating hours, and
  view/search/filter upcoming and past bookings
- **Platform admin panel** — a separate login sees every tenant on the
  platform: edit business details, manage their services, update booking
  statuses, and view platform-wide reports (tenant/booking counts, status
  breakdowns, busiest tenants)
- **Editable branding** — the admin can rename the app from Settings; it
  updates the site title and headers everywhere immediately
- **Search, filters, and pagination** on every list that can grow
  (tenants, bookings, services)
- **Light/dark theme**, responsive layout, no external UI library required
- Tenant isolation is enforced in the data-access layer (every query is
  scoped by the authenticated session's tenant, never by client input)

## Requirements

- Node.js 20+
- A PostgreSQL database (any provider — [Neon](https://neon.com) and
  [Railway](https://railway.app) both have free tiers and work well)

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — your PostgreSQL connection string
   - `AUTH_SECRET` — a random secret used to sign sessions. Generate one with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```

3. Apply the database schema:

   ```bash
   npx prisma migrate deploy
   ```

4. Create your platform admin account (this is the login that manages every
   tenant on the platform):

   ```bash
   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=a-strong-password npm run db:create-admin
   ```

5. Build and run:

   ```bash
   npm run build
   npm run start
   ```

6. Log in at `/login` with the admin account you just created — you'll land
   on `/admin`. From there you can either create tenants for your own
   customers, or point car wash owners to `/signup` to create their own.

### Local development

`npm run dev` runs the app with hot reload. `prisma/seed.ts` creates a demo
tenant, a demo business-owner login, and a demo platform admin — it's a
convenience for local development only and **refuses to run when
`NODE_ENV=production`**, so it can never seed demo/test data into a real
deployment by accident:

```bash
npm run db:seed
```

## Deploying

This app deploys cleanly to any Node.js host. [Vercel](https://vercel.com)
is the simplest option for Next.js specifically — connect the repo, set the
same environment variables from `.env`, and it builds and deploys
automatically on every push. Run `npx prisma migrate deploy` against your
production database once before your first deploy.

## Project structure

- `src/app/[slug]` — the public, per-tenant booking page
- `src/app/dashboard` — the business owner's tenant-scoped dashboard
- `src/app/admin` — the platform admin panel (cross-tenant)
- `src/app/api` — API routes, mirroring the pages above plus auth/signup
- `src/lib` — shared logic: Prisma client, Auth.js config, availability/slot
  calculation, session helpers, app settings
- `prisma/schema.prisma` — the full data model

## Roadmap

Stripe-based subscription billing (charging tenants for platform access) is
planned for a future update.

## Support

If you purchased this item, please refer to the support terms on your
marketplace listing page.
