# Apoindar Mobile (Phase 3 — not yet implemented)

The mobile app is a **dedicated** React Native + Expo client (iOS + Android),
not a wrapper around the website (`09-mobile-app-ux-spec.md`). It is scheduled
for Phase E and is **not built yet**.

## What already makes the backend mobile-ready

The web app was structured so the mobile client can reuse the same backend and
business logic without a rewrite:

| Shared thing | Location | Portable? |
| --- | --- | --- |
| Commercial rules (commission, limits, pricing, trial) | `lib/config/commerce.ts` | ✅ pure TS, zero deps — copy or extract to a shared package |
| Domain logic (commission split, entitlements, state machines, recurrence, subscription, package credits, workspace gate) | `lib/domain/**` | ✅ pure TS, no Next/Prisma imports |
| Money helpers | `lib/money.ts` | ✅ pure TS |
| Validation schemas | `lib/validation/schemas.ts` | ✅ Zod, shareable |
| Payment adapter contract | `lib/payments/types.ts` | ✅ interface only |
| Data contracts | Prisma types in `lib/generated/prisma` | ✅ types shareable; client is server-only |

Server-side authorization and entitlement enforcement live in `lib/authz.ts` +
`lib/services/**` and run on the server, so a mobile client gets the same
guarantees by calling the same endpoints.

## Planned API surface for mobile

Today the web app talks to the server via **server actions** (`lib/actions/**`)
and a few route handlers (`app/api/**`). Before the mobile client is built, the
booking / auth / provider actions should be mirrored as a versioned REST/JSON
API under `app/api/v1/**` that both clients consume. The action functions
already delegate to `lib/services/**`, so this is a thin transport layer, not a
logic rewrite.

## Recommended structure when work starts

```
mobile/
  app/               expo-router screens (Home, Search, Bookings, Messages, Profile)
  components/         RN port of the Apoindar design system (same tokens as 07)
  lib/               thin API client + re-exported shared domain/config
  app.json           Expo config
```

Subscription entitlement management on mobile may use RevenueCat for App
Store / Play IAP — **separate** from the marketplace payment provider used for
student → teacher payments (`CLAUDE.md` §10). Do not mix the two domains.
