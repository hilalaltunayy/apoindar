# Testing status — Apoindar web

Tracks progress against `11-testing-and-acceptance-criteria.md`. This is a
**PARTIAL** implementation; the release gate is **BLOCKED** (see bottom).

## QA Batch 1 (2026-09-02) — manual browser verification

Dev DB now connected (Supabase apoindar-dev). Verified in the browser against
seeded data, in both TR and EN:

- ✅ Anonymous: home → search (10 seeded teachers) → provider profile
- ✅ Student: signup → auto-login → dashboard; book single lesson → mock
  payment → "Booking confirmed" (branded success) → shows on /bookings as
  `confirmed / paid`
- ✅ Auth: logout; invalid login → "Wrong email or password"; correct login
- ✅ Free entitlements: 2nd listing forced to draft + "Activate" blocked
  server-side; 4th active student blocked with a Premium explanation (TR + EN)
- ✅ Password fields: hidden by default, eye-icon toggle (aria-label, keyboard)
- ✅ TR default (`<html lang="tr">`), TR/EN switch persists across navigation
- ✅ Branded skeleton/loader, search typing-placeholder, scroll reveals,
  success motion, motif wallpaper — all intact after i18n changes

Known: dev feels slow (remote pooled DB + dev compile); production build fine.
Deep admin sub-pages and some service-layer edge errors not exhaustively walked.

## Automated tests

| Layer | Status | Where |
| --- | --- | --- |
| Unit — domain logic | ✅ 67 passing | `tests/unit/**`, `tests/integration/payment-adapter.test.ts` |
| Unit — locked business assertions (11 §4) | ✅ all covered | `tests/unit/commerce-config.test.ts` |
| Integration — DB-backed (Auth+persistence, onboarding, entitlement limits, booking↔payment↔commission↔payout, refund↔state, subscription↔entitlement, calendar↔recurring, package credits, admin inspection, storage upload, ownership authz) | ⛔ not yet run | needs `TEST_DATABASE_URL` (a disposable Postgres/Supabase branch) |
| E2E (Playwright) — mandatory scenarios in 11 §6 | ⛔ not written | `playwright.config.ts` scaffolded; `tests/e2e/` empty |
| Page-by-page functional audit (11 §7) | 🟡 smoke only | every route returns 200 / correct redirect; buttons not yet individually audited |
| Web cross-browser / viewport matrix (11 §9) | ⛔ not run | |
| iOS / Android (11 §10–12) | ⛔ n/a | mobile client not built — see `mobile/README.md` |
| Performance (11 §13) | ⛔ not measured | |
| Accessibility baseline (11 §24) | 🟡 partial | semantic controls, focus-visible ring, reduced-motion media query, labelled inputs; no audit pass |
| Visual/design acceptance (11 §25) | 🟡 self-checked | palette/typography/motifs/loaders verified against `07`; no formal regression |

Run: `npm test` · `npm run typecheck` · `npm run lint` · `npm run build` — all green.

## Covered by unit tests (domain)

- Free 12% / Premium 7% commission; effective-time rule (plan at authorization)
- processor fee tracked separately from marketplace commission
- Free limits: 1 active listing, 3 active students; recurring lessons Premium-only
- deterministic half-up money rounding; over-refund rejection; provider-net-after-refund
- booking + payment state machines (no false confirmation on payment failure)
- 14-day no-card trial; non-destructive downgrade; `effectivePlan` reconciliation
- recurring lesson generation ("every Saturday 14:00 × 8") + conflict skipping
- package credit consume/restore/progress; workspace payment-gate predicate
- mock payment adapter success/decline/fee + signed-webhook verification

## Known gaps blocking the release gate

1. No live database wired (`DATABASE_URL`) → integration + E2E suites unrun.
2. Playwright scenarios from 11 §6 not authored.
3. Per-control interaction audit (11 §7–8) not completed.
4. Mobile clients (iOS/Android) not implemented.
5. Performance, cross-browser, full a11y audits not run.
6. Payment provider is the mock adapter only (production provider needs approval).

## Interaction inventory (11 §8) — to be completed

Each implemented route has been listed; the button-by-button expected/actual
table is not yet filled. Every visible button today either performs a real
server action, is a real navigation link, or is disabled with a visible reason
(e.g. "Free plan — upgrade to activate more"). No decorative dead buttons known.
