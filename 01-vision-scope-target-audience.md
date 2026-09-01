# 01 — Vision, Scope, and Target Audience

## 1. Core Vision

The product is a modular **service marketplace + provider business platform** built on a reusable core that can later expand into multiple service sectors.

The first launch sector is **education**.

The platform is not designed as a simple tutor-listing website. It should:

- help students discover suitable providers,
- enable booking and in-platform payment,
- help providers manage their students, schedule, packages, and business activity,
- generate marketplace revenue from transactions,
- generate SaaS revenue from Premium provider subscriptions,
- create enough platform value that users prefer to complete bookings and payments inside the product.

The long-term architecture may later support sectors such as health, coaching, fitness, and other independent service professions.

## 2. Initial Target Sector: Education

The initial market includes:

- private tutors for academic subjects,
- university students and independent specialists who teach,
- language tutors,
- sports instructors such as tennis, swimming, fitness, basketball, and football trainers,
- skill-based instructors and coaches,
- certified or non-certified providers who can legitimately teach a specific subject or skill.

**Shared definition:** a provider who sells knowledge, coaching, instruction, or expertise by lesson, hour, package, or recurring schedule.

## 3. Core Value Proposition

### For Students

> **Find the right instructor, book securely, and continue the learning relationship in one place.**

The platform should help students:

- discover suitable providers,
- compare price, location, availability, and profile quality,
- book lessons or packages,
- pay inside the platform,
- keep booking/payment history,
- later access a paid student–provider workspace when an eligible booking/package has been purchased.

### For Providers

> **Turn your empty hours into income, manage your students, and keep more of what you earn.**

The platform should help providers:

- become discoverable,
- receive real student demand,
- sell single lessons and packages,
- receive platform-managed payments,
- manage availability and bookings,
- manage active students,
- track business performance,
- reduce commission by upgrading to Premium,
- use advanced business tools without leaving the platform.

## 4. Business Model

The product uses a **Marketplace + SaaS Hybrid** model.

Revenue comes from:

1. transaction commission on in-platform bookings/payments,
2. Premium provider subscriptions.

Locked V1 commercial rules:

- Student subscription fee: **0 TRY**
- Student service/platform fee: **0% in V1**
- Free provider subscription: **0 TRY/month**
- Free provider transaction commission: **12%**
- Premium provider transaction commission: **7%**
- Premium monthly subscription: **299 TRY/month**
- Premium annual subscription: **2,990 TRY/year**
- Premium trial: **14 days**
- Trial card requirement: **no card required**

Detailed provider entitlement rules are defined in `10-business-rules-and-premium.md`.

## 5. User Segments

| Segment | Description | Primary Need |
|---|---|---|
| Student / Parent / Service Seeker | Person looking for lessons or coaching | Find, book, pay, and continue the learning relationship |
| Provider — Free | Provider starting or testing the platform | Be discoverable, receive bookings, and use essential tools |
| Provider — Premium | Provider with recurring business activity | Lower commission, advanced calendar, student management, analytics, automation |
| Platform Admin | Marketplace operations role | Moderation, payments, disputes, categories, subscriptions, quality control |

## 6. Marketplace Principle

The product must guide paid activity toward the platform.

Direct phone/WhatsApp communication may exist where useful, but it must **not** be the primary paid-booking flow.

The platform should make in-platform payment valuable through:

- secure payment records,
- booking confirmation,
- cancellation/refund handling,
- package tracking,
- reminders,
- transaction history,
- provider payout records,
- future student–provider workspace access,
- support/dispute evidence.

The strategy is to make staying on-platform more useful than bypassing it.

## 7. Scope of the First Web MVP

The Web MVP must include the marketplace foundation:

- discovery/search,
- provider profiles,
- lesson/package presentation,
- provider availability,
- booking flow,
- in-platform checkout architecture,
- payment/booking state tracking,
- provider dashboard,
- basic student management,
- Free/Premium entitlement foundation,
- admin moderation,
- marketplace transaction records,
- testable commission logic.

Real production payment activation still requires explicit user approval, production credentials, and the selected payment-provider account.

## 8. Explicitly Out of Scope for the First Web MVP

The following are not required for the initial Web MVP:

- full real-time in-app chat,
- full LMS/course-management functionality,
- AI-powered personalized ranking,
- dynamic pricing or auction mechanics,
- multi-sector UI,
- mobile swipe experience,
- advanced student–provider mentorship workspace implementation,
- complex CRM pipeline tooling,
- enterprise/provider-team accounts.

## 9. Future Paid Student–Provider Workspace

After a successful in-platform lesson or package purchase, a private student–provider workspace may become available.

Future capabilities may include:

- private messaging,
- assignments/tasks,
- tests/exercises,
- file/resource sharing,
- due dates,
- student completion status,
- provider feedback,
- progress notes,
- package progress,
- lesson-to-lesson goals,
- mentorship-style follow-up.

This feature is strategically important because it strengthens the relationship after payment and gives users another reason to remain inside the platform.

It must remain a lightweight mentorship workspace rather than becoming a full LMS unless a later product decision explicitly changes that direction.

## 10. Long-Term Sector Expansion

The shared platform core should remain sector-neutral where practical:

- users,
- providers,
- listings/services,
- bookings,
- payments,
- subscriptions,
- scheduling,
- reviews/moderation,
- communications/workspaces,
- analytics,
- admin.

Sector-specific modules are added on top.

The first UI remains education-only.

## 11. Decisions Locked in This Document

- Initial sector: **Education**
- Initial channel: **Web-first**
- Business model: **Marketplace + SaaS Hybrid**
- Student side: **free**
- Paid bookings: **intended to complete inside the platform**
- Free provider commission: **12%**
- Premium provider commission: **7%**
- Premium monthly price: **299 TRY**
- Premium annual price: **2,990 TRY**
- Mobile: later phase, separate client
- Multi-sector architecture: required, but not exposed in first MVP
- Future paid student–provider workspace: strategically planned, not required in V1
