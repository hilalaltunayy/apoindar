# 05 — Integration Plan

## 1. Integration Principle

The MVP must support the real product architecture without requiring every paid production integration to be activated during local development.

Claude Code may create:

- adapters,
- interfaces,
- mocks,
- sandbox integrations,
- environment placeholders,
- test flows.

Claude Code must stop before activating a real billable production integration unless credentials and explicit approval are available.

## 2. Phase 1 — Required Integrations / Foundations

| Area | Purpose | Decision |
|---|---|---|
| Authentication | Registration/login | Auth.js |
| Location | Provider discovery | Static Turkish city/district dataset and/or OSM-compatible approach first |
| Storage | Profile/media files | Supabase Storage |
| Database | Core marketplace data | Supabase PostgreSQL in production |
| Payments | Booking/package checkout | Marketplace-capable payment provider architecture required; sandbox/mock allowed until provider is selected/activated |
| Subscription | Premium subscription | Same payment architecture where supported, otherwise compatible recurring-payment capability |
| Analytics | Basic product measurement | Optional in earliest local milestone, required before real growth experiments |

## 3. Payment Provider Requirements

The selected production provider must support the marketplace model needed by the product, including as applicable:

- customer payment,
- marketplace/submerchant/provider structure,
- platform commission,
- provider settlement/payout,
- refund,
- payment status/webhooks,
- test/sandbox environment,
- recurring Premium subscription or compatible subscription flow,
- Turkish market/legal compatibility.

The exact provider is not locked in this document.

Provider selection requires a dedicated comparison before real activation.

## 4. Phase 2 Integrations

Candidates:

- transactional email: Resend or SendGrid
- SMS/phone verification: Netgsm or Twilio if needed
- Google Calendar API for Premium calendar sync
- PostHog or equivalent product analytics
- richer payment operational tooling
- verification services if later required

## 5. Phase 3 — Mobile

- Expo Notifications / FCM
- Apple App Store distribution
- Google Play distribution
- same hosted backend/payment domain

## 6. Future Workspace Integrations

The paid student–provider workspace may later require:

- real-time or near-real-time messaging infrastructure,
- file storage,
- notification delivery,
- assignment/task state,
- media/document preview.

No provider is selected yet for real-time chat.

## 7. Approval Required Before Real Activation

Claude Code must ask before:

- activating real paid payment-provider credentials,
- creating/changing production marketplace merchant/submerchant configuration,
- enabling billable Google Maps/Places,
- enabling paid SMS,
- configuring production email domain,
- changing production DNS/domain,
- deploying to production when not explicitly requested,
- executing irreversible financial operations.

## 8. Locked Decisions

- Payment architecture is now **core**, not Phase 4.
- Local/test payment implementation may use mock/sandbox.
- Production requires a marketplace-capable provider.
- Student checkout is the primary paid-booking path.
- Supabase Storage remains the default storage.
- Google Calendar sync is a Premium capability when enabled.
- Exact payment provider remains pending until provider comparison/activation.
