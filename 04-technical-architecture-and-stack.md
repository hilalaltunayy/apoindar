# 04 — Technical Architecture and Stack

## 1. Architecture Decision

The MVP technical stack is approved and locked unless a documented blocker requires reconsideration.

### Web

- Next.js — current stable App Router release at implementation time
- React
- TypeScript
- TypeScript `strict: true`
- Tailwind CSS, governed by the project design system rather than default template aesthetics

### Backend / API

- Next.js server capabilities and route handlers for MVP
- explicit domain/service boundaries
- Zod or equivalent validation
- payment and subscription logic isolated behind service interfaces/adapters

### Database

- PostgreSQL
- Prisma ORM
- shared core + education module architecture

### Authentication

- Auth.js for web authentication
- production providers/OTP configuration finalized when credentials are available

### Storage

- Supabase Storage

### Production Hosting

- Vercel for web
- Supabase managed PostgreSQL for production database
- Supabase Storage for production file/image storage

The developer's computer is **never** the production server.

## 2. Environment Strategy

### Development

Use either:

- local PostgreSQL through Docker, or
- dedicated non-production Supabase project.

Payment development must use:

- mock payment adapter and/or
- selected provider sandbox/test environment.

### Production

- Vercel web runtime
- Supabase PostgreSQL
- Supabase Storage
- real marketplace-capable payment provider after explicit activation approval

Development and production data must be separated.

## 3. Mobile

- React Native + Expo in Phase 3
- same backend/API/database
- separate mobile UX
- not a wrapper around the website

## 4. High-Level Architecture

```text
[ Next.js Web ]                [ React Native / Expo — Phase 3 ]
       \                                  /
        \                                /
          [ Shared Backend / API Contract ]
                       |
                [ Domain Services ]
                       |
     +-----------------+------------------+
     |                 |                  |
[ Booking ]       [ Payments ]      [ Subscriptions ]
     |                 |                  |
     +-----------------+------------------+
                       |
                    [ Prisma ]
                       |
             [ Supabase PostgreSQL ]
```

External services:

- Supabase Storage
- marketplace-capable payment provider
- email provider
- Google Calendar integration for Premium
- location provider
- product analytics
- push notification provider for mobile

## 5. Core Domain Entities

Core entities should remain sector-neutral where practical:

- `users`
- `providers`
- `listings`
- `bookings`
- `payments`
- `payment_attempts`
- `refunds`
- `provider_payouts`
- `commission_rules`
- `subscriptions`
- `subscription_entitlements`
- `contacts`
- `availability`
- `students_or_clients`

Education module entities may include:

- `education_categories`
- `packages`
- `lesson_instances`
- `recurring_lesson_rules`
- `availability_templates`
- `student_notes`
- future `student_provider_workspaces`
- future `assignments`
- future `workspace_messages`
- future `progress_entries`

## 6. Payment Architecture Principles

Payment logic must:

- support marketplace/submerchant style settlement,
- represent gross amount,
- platform commission,
- payment-provider cost,
- provider net amount,
- refund amount,
- payout state,
- payment state,
- dispute/reference metadata.

Do not couple business logic directly to a single payment-provider SDK.

Use an adapter/service boundary so the provider can be replaced if commercial or technical requirements change.

## 7. Entitlement Architecture

Free/Premium limits must be enforced server-side.

Examples:

- Free package limit: 1
- Free active-student limit: 3
- recurring lessons: Premium only
- advanced calendar: Premium only
- advanced CRM/analytics: Premium only

The UI may hide unavailable actions, but server-side authorization/entitlement checks are required.

## 8. Engineering Standards

- TypeScript strict mode
- ESLint + Prettier
- validate untrusted input
- server-side authorization
- tracked Prisma migrations
- no secrets in repository
- separate dev/prod config
- unit tests for domain logic
- integration tests for payment/entitlement flows
- Playwright E2E for critical web flows
- README setup documentation
- configuration-driven commission/entitlement values

## 9. Production Availability Principle

The application must continue working when the developer's computer is off.

Production runtime:

- web: Vercel
- DB: Supabase
- storage: Supabase Storage
- payment provider: hosted third-party service
- mobile: App Store / Google Play builds consuming hosted backend

## 10. Decisions Locked in This Document

- Next.js + React + TypeScript
- PostgreSQL + Prisma
- Supabase production DB/storage
- Vercel web hosting
- React Native + Expo mobile
- payment domain included in core architecture
- marketplace-capable payment provider required for production
- provider SDK isolated behind an adapter
- production never depends on developer PC
