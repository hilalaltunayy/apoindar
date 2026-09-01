# 02 — Feature Specification and Roadmap

## 1. Product Priorities

The first MVP is **web-first**.

Priority order:

1. Make providers discoverable.
2. Help students find a suitable provider.
3. Convert discovery into an in-platform booking/payment.
4. Generate measurable business value for providers.
5. Give providers practical tools for schedule and student management.
6. Build the foundation for future mobile and student–provider workspace experiences.

## 2. Phase 1 — Web Marketplace MVP

### 2.1 Student / Visitor Experience

Required capabilities:

- Search form:
  - **What are you looking for?**
  - **Where are you looking?**
- Search by category/service + city/district.
- List-based results.
- Core filters:
  - location
  - price
- Provider profile:
  - name
  - branch/category
  - location
  - price or starting price
  - description
  - profile image
  - lesson/package
  - availability summary
  - verification/review placeholders where future features are not yet live
- Primary CTA:
  - **Book / Buy**
- Secondary contact actions may exist, but must not replace the platform booking/payment path.
- SEO-friendly public pages.

### 2.2 Booking and Payment Flow

The Phase 1 architecture must support:

1. Student selects a provider.
2. Student selects a lesson/package.
3. Student selects an available slot where required.
4. Booking is created.
5. Checkout/payment flow is initiated.
6. Payment status is recorded.
7. Commission is calculated according to provider plan.
8. Provider payout/settlement state is recorded.
9. Booking becomes confirmed after successful payment.
10. Cancellation/refund state can be represented.

Production payment activation requires a real supported marketplace payment provider and explicit approval, but local/test implementation must already support the complete domain flow.

### 2.3 Provider Onboarding and Profile

Required:

- registration/login,
- provider onboarding,
- category/branch,
- location,
- price,
- description,
- profile photo,
- plan/entitlement awareness.

### 2.4 Lesson / Package Rules

#### Free Provider

- maximum **1 active lesson/package listing**.

This allows a provider such as a tennis instructor to offer one clear lesson/package without paying for Premium.

#### Premium Provider

- **unlimited active lesson/package listings**, subject to reasonable anti-abuse and platform-quality limits.

### 2.5 Provider Dashboard

Required V1 areas:

- upcoming bookings,
- recent bookings,
- payment status,
- payout status summary,
- day/week calendar,
- available/unavailable time,
- active students,
- package/lesson overview,
- basic analytics,
- current plan and commission rate.

### 2.6 Calendar — Free

Free calendar capabilities:

- add availability,
- view bookings on calendar,
- create/manage one-time lessons,
- accept/reject requests where applicable,
- day/week calendar view,
- basic overlap prevention.

### 2.7 Calendar — Premium

Premium includes all Free capabilities plus:

- recurring lessons,
- bulk availability creation,
- weekly availability templates,
- student-specific labels/colors,
- cancellation/no-show tracking,
- automatic lesson reminders,
- package/lesson-credit tracking,
- advanced conflict warnings,
- Google Calendar synchronization when the integration is enabled,
- historical lesson analysis.

### 2.8 Recurring Lessons

A recurring lesson is a repeated schedule created once.

Example:

> Every Saturday at 14:00 with the same student for 8 weeks.

The system creates or manages the repeated lesson instances automatically.

Recurring lessons are **Premium-only**.

### 2.9 Student Management

#### Free Provider

- maximum **3 active students**,
- basic student card,
- booking history,
- basic package relationship.

#### Premium Provider

- unlimited active students,
- student profile card,
- contact information,
- current lesson/package,
- lesson history,
- remaining package/lesson credits,
- payment history,
- private provider notes,
- no-show/absence history,
- next lesson date,
- active/inactive/former student status,
- search/filter,
- per-student lesson totals,
- per-student revenue summary.

The goal is a lightweight tutor-specific CRM, not a complex enterprise sales CRM.

### 2.10 Admin Experience

Required:

- user management,
- provider management,
- provider/profile moderation,
- category management,
- complaint queue,
- booking/payment inspection,
- subscription inspection,
- commission-rule inspection,
- refund/dispute state inspection,
- basic metrics.

## 3. Phase 2 — Growth and Marketplace Deepening

Planned:

- advanced filtering/sorting,
- ratings/reviews,
- provider verification,
- Growth Dashboard,
- advanced conversion analytics,
- automated reminders,
- profile improvement recommendations,
- controlled Premium discovery advantage,
- deeper payout/refund operational tools,
- transactional email,
- product analytics.

## 4. Phase 3 — Mobile Applications

Mobile is a **separate client experience**, not a responsive copy of the web application.

Direction:

- React Native + Expo,
- same backend/API/database,
- mobile-specific navigation,
- swipe/card discovery,
- push notifications,
- fast booking/payment flow,
- provider mobile calendar,
- rapid student/booking management.

Detailed mobile UX will be defined in `09-mobile-app-ux-spec.md`.

## 5. Future Feature — Paid Student–Provider Workspace

### Unlock Rule

A private student–provider workspace becomes available **only after a successful in-platform paid booking or package purchase**.

No successful eligible payment → no private workspace.

### Candidate Capabilities

- private messaging,
- task/assignment creation,
- test/exercise sharing,
- files/documents/links/media,
- due dates,
- student completion status,
- provider feedback,
- progress notes,
- lesson-to-lesson goals,
- package progress,
- milestones,
- mentorship-style follow-up.

### Package Lifecycle Example

1. Student buys an 8-lesson package.
2. Payment succeeds.
3. Private workspace is created.
4. Provider can assign tasks and share materials.
5. Student completes work between lessons.
6. Provider tracks progress.
7. Workspace remains linked to that paid relationship/package lifecycle.

### Product Boundary

This must not silently become a full LMS.

The initial future implementation should focus on continuity, mentorship, and progress between paid lessons.

## 6. Later Advanced Capabilities

Potential later capabilities:

- AI-assisted ranking,
- smarter marketplace matching,
- richer messaging,
- loyalty mechanisms,
- advanced BI,
- sector expansion,
- marketplace protections,
- additional monetization experiments only after real usage data exists.

## 7. Decisions Locked in This Document

- Web-first MVP
- In-platform booking/payment architecture is part of the marketplace core
- Free provider: **1 active lesson/package**
- Premium provider: **unlimited lesson/packages**
- Free provider: **3 active students**
- Premium provider: **unlimited active students**
- Free calendar: basic
- Premium calendar: advanced
- Recurring lessons: **Premium**
- Student–provider workspace: future feature unlocked by successful paid relationship
- Mobile: Phase 3 separate client using same backend
