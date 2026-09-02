# Apoindar

A warm, modern **education marketplace + provider business platform**. Students
discover tutors and coaches, book securely and pay in-platform; providers manage
listings, students, schedule and earnings. Marketplace + SaaS Hybrid model.

Product source of truth: `01`–`11` spec documents and `CLAUDE.md`.

## Stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Web        | Next.js (App Router) · React 19 · TypeScript strict |
| Styling    | Tailwind CSS + the Apoindar design system          |
| DB / ORM   | PostgreSQL (Supabase) · Prisma                      |
| Auth       | Auth.js (NextAuth v5)                               |
| Storage    | Supabase Storage                                    |
| Payments   | Provider-neutral domain + adapter boundary (mock in V1) |
| Hosting    | Vercel (web) · Supabase (DB/storage)               |
| Mobile     | React Native + Expo (Phase 3, `mobile/`)            |

## Getting started

```bash
npm install
cp .env.example .env.local     # fill DATABASE_URL / DIRECT_URL / AUTH_SECRET
npx prisma generate
npx prisma migrate deploy      # applies prisma/migrations to your database
npm run db:seed                # optional dev/demo data (clearly namespaced)
npm run dev
```

`AUTH_SECRET`: `npx auth secret`. `DATABASE_URL` (transaction pooler, port 6543,
`?pgbouncer=true`) + `DIRECT_URL` (session pooler, port 5432): Supabase → Project
Settings → Database → Connection string. The Prisma CLI reads `.env.local` via
`prisma.config.ts`.

Dev database is the Supabase **apoindar-dev** project. Migrations already applied
there; new machines run `npx prisma migrate deploy` then `npm run db:seed`
(`SEED_DEMO=true` for the demo marketplace — all accounts `<name>@demo.apoindar.local`,
password `Apoindar!Demo1`).

## Internationalization

`next-intl` (cookie-based locale, no route prefixes — one app). **Turkish is the
default**; English is fully supported. Messages live in `messages/{tr,en}.json`;
locale config in `i18n/`. UI chrome, validation, metadata and status labels are
localized; user-generated content (provider bios, listing titles) is not.
The TR/EN switch is in the header and footer.

## Architecture

```
app/                Next.js routes  ((marketing) public · (app) authed · admin · api)
components/          UI primitives (ui/), brand system (brand/), marketplace (marketplace/)
lib/
  config/            configuration-driven commercial rules (commission, limits, pricing)
  domain/            pure business logic — commission, entitlements, state machines,
                     recurrence, subscriptions, package credits  (heavily unit-tested)
  services/          orchestration over Prisma (booking, payments, subscriptions)
  payments/          PaymentAdapter interface + mock adapter
  authz.ts           server-side authorization + entitlement resolution
prisma/schema.prisma core + education domain model
tests/               unit · integration · e2e (Playwright)
```

### Non-negotiables

- **Commercial rules live in `lib/config/commerce.ts`** — never hardcoded in UI.
- **Entitlements are resolved server-side** from the DB subscription (`lib/authz.ts`),
  never trusted from the client.
- Money is integer minor units (kuruş); commission split is deterministic.
- Payment SDKs sit behind `lib/payments` adapters. No real billing without approval.

## Scripts

`dev` · `build` · `start` · `lint` · `typecheck` · `test` · `test:e2e` ·
`prisma:generate` · `prisma:migrate` · `db:seed`

## Commercial rules (locked — see `10-business-rules-and-premium.md`)

| | Free | Premium |
| --- | --- | --- |
| Subscription | 0 ₺ | 299 ₺/mo · 2 990 ₺/yr · 14-day no-card trial |
| Commission | 12% | 7% |
| Active listings | 1 | Unlimited |
| Active students | 3 | Unlimited |
| Recurring lessons / advanced calendar / CRM / Growth Dashboard | — | ✓ |

Students pay 0 ₺ subscription and 0% platform fee in V1.
