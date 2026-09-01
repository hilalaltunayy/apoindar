# CLAUDE.md — Autonomous Development Instructions

## 0. Status

**Autonomous implementation is now allowed.**

The product-definition gate is open because the core source-of-truth documents for product scope, monetization, design, web UX, mobile UX, Premium rules, and testing/acceptance criteria are now defined.

Claude Code must still stop at the explicit approval boundaries in this file, especially for real billable integrations, production payment credentials, destructive production operations, and production deployment.

## 1. Source-of-Truth Documents

Before doing any implementation work, read all of these files completely:

1. `01-vision-scope-target-audience.md`
2. `02-features-and-roadmap.md`
3. `03-revenue-model-and-marketplace-monetization.md`
4. `04-technical-architecture-and-stack.md`
5. `05-integration-plan.md`
6. `06-decision-log.md`
7. `07-design-system-and-visual-language.md`
8. `08-web-pages-and-ux-spec.md`
9. `09-mobile-app-ux-spec.md`
10. `10-business-rules-and-premium.md`
11. `11-testing-and-acceptance-criteria.md`

Priority when documents conflict:

1. latest approved decision in `06-decision-log.md`
2. `10-business-rules-and-premium.md` for monetization, entitlements, limits, Premium/Free behavior
3. `07-design-system-and-visual-language.md` for visual/motion decisions
4. `08-web-pages-and-ux-spec.md` for web page behavior
5. `09-mobile-app-ux-spec.md` for iOS/Android behavior
6. `11-testing-and-acceptance-criteria.md` for quality/release rules

If an older document conflicts with a newer approved decision, update the older document rather than carrying a hidden contradiction.

## 2. Locked Engineering Decisions

- Web: Next.js + React + TypeScript
- Styling: Tailwind CSS governed by the Apoindar design system
- Database: PostgreSQL
- ORM: Prisma
- Production database: Supabase PostgreSQL
- Storage: Supabase Storage
- Web hosting: Vercel
- Mobile: React Native + Expo
- Production must never depend on the developer's personal computer remaining online
- Payment architecture is part of the core marketplace domain
- Production payment provider must support the marketplace/submerchant/settlement model required by the product
- Payment-provider SDKs must be isolated behind adapters/interfaces
- Free/Premium entitlements must be enforced server-side
- Commercial values must be configuration-driven rather than scattered as hardcoded constants

## 3. Locked Business Decisions

- Product model: Marketplace + SaaS Hybrid
- Student subscription: Free
- Student service/platform fee in V1: 0%
- Free provider subscription: 0 TRY/month
- Free provider commission: 12%
- Premium provider commission: 7%
- Premium monthly price: 299 TRY
- Premium annual price: 2,990 TRY
- Premium trial: 14 days
- Trial card requirement: No
- Free active lesson/package limit: 1
- Premium active lesson/package limit: Unlimited
- Free active-student limit: 3
- Premium active-student limit: Unlimited
- Free calendar: Basic
- Premium calendar: Advanced
- Recurring lessons: Premium only
- Premium advanced student management: Enabled
- Paid student–provider workspace: Future feature, unlocked only after an eligible successful in-platform payment

## 4. Locked Visual and UX Direction

Brand: **Apoindar**

Apoindar must not look like a generic AI-generated SaaS template.

The approved visual direction is:

- warm cream / off-white base instead of plain white-heavy pages
- soft purple structural color
- warm yellow CTA/accent color
- light lavender support tones
- modern serif headlines
- clean sans-serif body/UI text
- subtle education/sports themed wallpaper motifs across the product
- motifs more visible on landing/public pages and much lighter on dashboards/inner pages
- real provider photos presented with branded, layered, editorial card treatment where practical
- minimal-premium dashboards with slight gamified warmth
- smooth, connected, “buttery” transitions
- branded logo reveal
- animated search placeholder typing effect
- branded skeletons/loaders rather than generic gray blocks/spinners
- subtle scroll reveals
- shared provider-card → provider-profile transitions
- restrained micro-parallax
- branded success motion
- yellow↔purple brush/paint-style button transition in selected interactions
- light-first design; dark mode is not required for V1

All UI work must follow `07`, `08`, and `09` instead of default framework aesthetics.

## 5. Autonomous Development Rules

Claude Code should work autonomously within the approved scope.

Do not ask the user for approval for normal reversible implementation work.

Examples that should proceed without asking:

- repository setup
- project scaffolding
- database schema design aligned with approved docs
- Prisma migrations in development
- components/pages/screens
- mock/sandbox payment adapters
- Auth integration in development
- Supabase development integration
- tests
- refactors
- bug fixes
- responsive implementation
- animations/micro-interactions
- local/staging builds
- lint/typecheck/test fixes
- README/docs updates

When a minor implementation detail is not explicitly specified:

1. choose the most reasonable reversible option,
2. keep it consistent with the approved design/product system,
3. document the assumption briefly,
4. continue without blocking progress.

## 6. Required Implementation Order

Use the roadmap documents as the main phase plan, but follow this practical execution order:

### Phase A — Foundation

- initialize/verify Next.js + TypeScript project
- configure Tailwind
- configure ESLint + Prettier
- establish project folder structure
- configure Prisma
- establish development environment
- create `.env.example`
- implement shared domain types/services
- implement design tokens and reusable UI primitives from `07`

### Phase B — Core Data / Auth / Marketplace Domain

- users
- providers
- listings / lessons / packages
- availability
- students/clients
- bookings
- payments
- payment attempts
- refunds
- payouts
- commission rules
- subscriptions
- entitlements
- Auth.js
- server-side authorization
- server-side entitlement enforcement

### Phase C — Web Experience

Implement the web UX from `08`:

- landing/home
- search/results
- provider profile
- booking
- checkout/test payment flow
- student dashboard
- student bookings/packages
- provider dashboard
- provider calendar
- provider students/CRM
- lessons/packages
- earnings/payouts
- Premium/upgrade
- auth/onboarding
- admin

### Phase D — Monetization / Payment Foundation

- Free/Premium rules
- 12% / 7% commission logic
- 299 TRY / 2,990 TRY Premium pricing configuration
- 14-day no-card trial logic
- downgrade/data-retention behavior
- mock/sandbox marketplace payment flow
- payment-provider adapter boundary
- refund/payout state model

Do not activate real production payment credentials without approval.

### Phase E — Mobile

Implement the React Native + Expo client according to `09` using the same hosted backend/API contracts.

Test iOS and Android independently.

### Phase F — Quality / Release Hardening

Apply `11-testing-and-acceptance-criteria.md` completely.

Do not declare completion until the release gate passes.

## 7. Supabase Rules

Supabase is the default production database/storage platform.

When Supabase access is available:

- use the project-specific Apoindar Supabase project
- prefer project-scoped access rather than broad account-wide access
- keep development and production environments separate
- track schema changes through migrations
- never expose Supabase service-role secrets to client code
- use server-side access for privileged operations
- do not perform destructive production schema/data actions without approval

If Supabase access is not yet connected:

- continue with local/dev PostgreSQL or mock-safe setup
- do not block unrelated development
- clearly identify what needs connection later

## 8. Git / GitHub Rules

When GitHub access is available:

- work in the Apoindar repository
- use small focused commits
- use Conventional Commits where practical
- keep generated secrets/config out of version control
- do not rewrite public history without approval
- use branches/PRs when appropriate
- never commit `.env` files containing real credentials

If GitHub remote access is not connected yet, continue local repository work where possible.

## 9. Vercel Rules

Vercel is the target web hosting platform.

Allowed without explicit approval:

- prepare Vercel-compatible configuration
- verify production build locally
- prepare environment-variable documentation

Requires explicit approval:

- production deployment
- production environment-variable changes
- domain/DNS changes

## 10. RevenueCat / Mobile Subscription Rule

RevenueCat may be used for mobile Premium subscription entitlement management if/when it is selected and connected.

Important distinction:

- RevenueCat is for App Store / Google Play subscription/IAP management
- RevenueCat does **not** replace the marketplace lesson/payment provider used for student → provider transactions

Do not silently mix these payment domains.

Before implementing production RevenueCat configuration:

- confirm the selected mobile subscription strategy
- use project-scoped credentials
- keep entitlement identifiers configuration-driven
- do not activate production products/offerings without approval

## 11. Payment Provider Rules

The marketplace payment provider is separate from RevenueCat.

The provider must support the commercial model required by Apoindar, including as applicable:

- student checkout
- marketplace/submerchant structure
- platform commission
- provider settlement/payout
- refunds
- webhooks
- sandbox/test mode
- Turkish-market compatibility

The exact production provider remains an approval point.

Claude may implement:

- provider-neutral domain model
- interfaces/adapters
- mock provider
- sandbox integration after credentials are explicitly supplied

Claude must stop before:

- activating real production payment credentials
- creating/changing real merchant/submerchant production setup
- triggering irreversible financial operations

## 12. Testing Is Mandatory

Follow `11-testing-and-acceptance-criteria.md`.

At minimum:

- unit tests
- integration tests
- E2E tests
- page-by-page functional audit
- every visible button/action audit
- web testing
- iOS testing
- Android testing
- cross-platform matrix
- payment/commission tests
- Free/Premium entitlement tests
- authorization/security tests
- responsive tests
- loading/empty/error/success state tests
- animation acceptance
- performance checks
- production build checks
- TODO/mock/placeholder audit

A page is not considered tested merely because it renders.

Every visible action must be tested for correct behavior.

## 13. Completion and Release Gate

Claude Code must not say the product/phase is complete until all applicable acceptance checks pass.

Critical/High severity issues block completion.

At phase end, report briefly:

- what was implemented
- files changed
- migrations created
- tests run
- tests passed/failed
- Web status
- iOS status
- Android status
- performance summary
- payment/commission status
- entitlement status
- known issues by severity
- remaining mocks/placeholders
- release gate: PASS / BLOCKED

## 14. Situations That Always Require User Approval

Stop and ask before:

1. activating real production payment-provider credentials
2. creating/changing production merchant/submerchant setup
3. activating any paid/billable third-party service
4. production deployment when not explicitly requested
5. production DNS/domain changes
6. destructive/irreversible production data operations
7. deleting production tables/data
8. legal text / Terms / privacy-policy decisions not already approved
9. brand-name/domain changes
10. major architectural decisions that contradict approved documents
11. any financial operation that can move real money

## 15. Target Repository Shape

```text
/
├── app/
├── components/
├── lib/
│   ├── domain/
│   ├── payments/
│   ├── subscriptions/
│   ├── entitlements/
│   └── integrations/
├── prisma/
│   └── schema.prisma
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── .env.example
└── README.md
```

Mobile may live in a separate app/workspace structure if that produces a cleaner architecture, but it must reuse the approved shared backend/domain contracts.

## 16. Final Instruction

Read the complete source-of-truth set first.

Then build Apoindar according to the approved roadmap, design system, business rules, platform-specific UX specifications, and testing criteria.

Proceed autonomously through reversible implementation work.

Do not invent conflicting product decisions.

Do not activate real billable/production financial systems without explicit approval.

Do not declare completion until the release gate in `11-testing-and-acceptance-criteria.md` passes.
