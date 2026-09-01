# 10 — Business Rules, Free/Premium Entitlements, and Marketplace Rules

## 1. Purpose

This document is the source of truth for:

- Free vs Premium provider rules,
- provider pricing,
- marketplace commission,
- Premium trial,
- entitlement limits,
- calendar differences,
- student-management differences,
- upgrade/downgrade behavior,
- monetization-related product behavior.

If another document conflicts with this document on these topics, this document takes priority until the other file is updated.

## 2. Business Model

The platform uses a **Marketplace + SaaS Hybrid** model.

Revenue comes from:

1. commission on in-platform paid bookings/packages,
2. Premium provider subscriptions.

Students remain free in V1.

## 3. Locked Commercial Rules

### Student

- subscription: **0 TRY**
- separate platform/service fee: **0% in V1**
- pays the displayed lesson/package price at checkout

### Free Provider

- subscription: **0 TRY/month**
- marketplace commission: **12%**
- maximum active lesson/package listings: **1**
- maximum active students: **3**

### Premium Provider

- monthly subscription: **299 TRY/month**
- annual subscription: **2,990 TRY/year**
- marketplace commission: **7%**
- active lesson/package listings: **unlimited**
- active students: **unlimited**

## 4. Premium Trial

- duration: **14 days**
- card required: **No**
- Premium entitlements are temporarily enabled during trial
- trial expiry automatically downgrades the provider to Free
- data is retained
- data above Free limits is not deleted
- Premium-only actions become unavailable after downgrade
- re-upgrade restores access where valid

A user must not receive unlimited repeated trials through trivial account cycling; anti-abuse rules may be added during implementation.

## 5. Free Provider Entitlements

Free is a real usable plan, not a fake demo.

Included:

- public provider profile,
- fair search/discovery eligibility,
- 1 active lesson/package listing,
- basic booking/payment acceptance,
- basic day/week calendar,
- availability entry,
- one-time lesson scheduling,
- booking/request accept/reject where applicable,
- basic conflict prevention,
- up to 3 active students,
- basic student cards,
- basic booking history,
- basic package relationship,
- basic dashboard,
- basic profile/booking analytics,
- 12% marketplace commission.

Free providers must not be deliberately hidden simply because they do not pay.

## 6. Premium Provider Entitlements

Premium includes everything in Free plus:

- 7% marketplace commission,
- unlimited lesson/package listings,
- unlimited active students,
- advanced calendar,
- recurring lessons,
- bulk availability creation,
- weekly availability templates,
- student labels/colors,
- cancellation/no-show tracking,
- automated lesson reminders,
- package/lesson-credit tracking,
- advanced conflict warnings,
- Google Calendar sync when enabled,
- historical lesson analysis,
- advanced student-management tools,
- Growth Dashboard,
- advanced conversion analytics,
- automated recommendations/reminders,
- advanced portfolio/media capability,
- profile improvement recommendations,
- controlled discovery advantage,
- future Premium-only business tools where explicitly approved.

## 7. Recurring Lesson Rule

Recurring lessons are Premium-only.

Example:

> Every Saturday at 14:00 for 8 weeks.

The provider defines the recurrence once and the platform manages the repeated lesson instances.

## 8. Student Management Rules

### Free

Maximum 3 active students.

For each active student, Free may access:

- basic student card,
- lesson/booking history,
- basic package relationship.

### Premium

Unlimited active students.

Premium student management includes:

- student profile card,
- contact details,
- active lesson/package,
- lesson history,
- remaining package credits,
- payment history,
- private provider notes,
- no-show/absence history,
- next lesson,
- active/inactive/former status,
- search and filter,
- total lesson count,
- per-student revenue summary.

This is a lightweight provider CRM designed for teaching/coaching businesses.

It must not expand into a generic enterprise sales CRM without a later decision.

## 9. Package Rules

### Free

- maximum 1 active lesson/package listing.

The listing may represent:

- a single lesson,
- one package,
- or another single active commercial offer.

### Premium

- unlimited active lesson/package listings, subject to quality/anti-abuse limits.

Premium may offer multiple lesson types, package sizes, and recurring options.

## 10. Upgrade Behavior

When a Free provider upgrades:

- Premium entitlements activate after successful subscription activation/payment state,
- commission rate becomes 7% for eligible transactions according to the effective-time rule,
- Premium-only calendar/student tools become available,
- existing retained data becomes fully accessible.

The exact transaction boundary for switching commission rates must be implemented deterministically and documented in code/tests.

Recommended rule:

> commission is determined from the provider plan effective at the time the booking payment is successfully created/authorized.

## 11. Cancellation and Downgrade

When a paid Premium subscription is cancelled:

- Premium remains active until the end of the already-paid billing period,
- then the provider downgrades to Free,
- data is retained,
- data above Free limits is not deleted,
- excess lesson/package listings become inactive/read-only according to a deterministic rule,
- excess students remain retained but Premium-only management becomes unavailable,
- recurring lesson creation stops,
- existing historical records remain preserved.

The product must avoid destructive downgrade behavior.

## 12. Failed Premium Payment

The final production retry/grace policy depends on the selected payment provider and billing flow.

Target product direction:

- do not downgrade immediately on the first technical payment failure,
- allow retry/grace behavior,
- clearly notify the provider,
- downgrade only after the configured grace/retry process fails,
- never delete business data because of billing failure.

The exact grace duration remains to be locked during payment-provider specification.

## 13. Discovery and Visibility

Premium may receive a **controlled discovery advantage**, but:

- Free providers remain discoverable,
- Premium must not automatically dominate all results,
- relevance, quality, location, availability, and user intent must remain important,
- the exact ranking algorithm will be specified later.

Premium visibility is a supporting benefit, not the sole reason to subscribe.

## 14. Growth Dashboard

Growth Dashboard is Premium-only.

Its final detailed specification is still pending, but the intended purpose is to show actionable business value rather than decorative charts.

Candidate metrics:

- search impressions,
- profile views,
- booking conversion,
- paid bookings,
- revenue generated through the platform,
- student acquisition,
- repeat booking rate,
- package sales,
- availability utilization,
- missed demand,
- profile improvement opportunities.

Final metric definitions will be specified before implementation.

## 15. Paid Student–Provider Workspace Relationship

The future private workspace is unlocked only after a successful eligible paid relationship.

Possible triggers:

- paid single lesson,
- paid multi-lesson package.

The workspace may later include:

- messaging,
- assignments,
- exercises/tests,
- files/resources,
- feedback,
- progress tracking,
- mentorship.

This is not required for the first MVP and must not silently become a full LMS.

## 16. Commission Rules

Locked V1 platform commission:

- Free: **12%**
- Premium: **7%**

Commission values must be configuration-driven.

The system must separately represent:

- gross booking amount,
- platform commission,
- payment-provider cost,
- refund amount,
- provider net amount,
- payout status.

Payment-provider cost must not be confused with the advertised marketplace commission.

## 17. Student Fee Rule

V1 student platform/service fee is **0%**.

Do not add a separate student service fee without a later explicit product decision.

## 18. Models Explicitly Not Used in V1

- pay-per-lead
- 100% first/trial lesson commission
- mandatory student subscription
- standalone paid visibility as the primary revenue model

## 19. Server-Side Enforcement

All plan limits must be enforced server-side.

Examples:

- Free cannot activate a second lesson/package,
- Free cannot exceed 3 active students,
- Free cannot create recurring lessons,
- Free cannot access Premium-only advanced CRM/calendar actions,
- commission logic cannot trust client-side plan state.

UI hiding alone is not authorization.

## 20. Locked vs Pending

### Locked

- Marketplace + SaaS Hybrid
- Student free
- Student V1 service fee 0%
- Free 12% commission
- Premium 7% commission
- Premium 299 TRY/month
- Premium 2,990 TRY/year
- 14-day no-card trial
- Free 1 active lesson/package
- Premium unlimited lesson/packages
- Free 3 active students
- Premium unlimited students
- Free basic calendar
- Premium advanced calendar
- recurring lessons Premium-only
- non-destructive downgrade
- future paid student–provider workspace

### Pending Before Production Payment Activation

- exact payment provider
- provider onboarding/submerchant process
- payout timing
- cancellation/refund policy
- dispute process
- exact failed-payment grace duration
- webhook retry policy
- detailed Premium ranking advantage
- final Growth Dashboard metric definitions
