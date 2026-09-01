# 03 — Revenue Model and Marketplace Monetization

## 1. Final Monetization Direction

The product uses a **Marketplace + SaaS Hybrid** model.

Revenue sources:

1. transaction commission on lessons/bookings paid through the platform,
2. Premium provider subscriptions.

Students/service seekers remain free in V1.

## 2. Core Marketplace Rule

Paid lessons and packages are intended to complete through the platform payment flow.

The platform must support:

- checkout,
- booking/payment state,
- commission calculation,
- provider payout/settlement state,
- refunds/cancellations,
- payment history,
- payout history,
- failed-payment handling,
- dispute-ready transaction records.

Direct WhatsApp/phone contact must not be the primary paid-booking flow.

## 3. Locked Provider Plans

### Free Provider

- subscription: **0 TRY/month**
- marketplace commission: **12%**
- maximum active lesson/package listings: **1**
- maximum active students: **3**
- basic calendar
- basic analytics
- essential booking/payment tools

### Premium Provider

- monthly subscription: **299 TRY/month**
- annual subscription: **2,990 TRY/year**
- marketplace commission: **7%**
- unlimited active lesson/package listings
- unlimited active students
- advanced calendar
- recurring lessons
- advanced student management
- Growth Dashboard
- advanced conversion analytics
- reminders/automation
- profile improvement tools
- advanced media/portfolio capability
- controlled discovery advantage

## 4. Student Pricing

Students:

- pay **0 TRY subscription**
- pay **0% separate platform service fee in V1**
- pay the displayed lesson/package price at checkout.

A student-side service fee must not be added automatically without a later explicit product decision.

## 5. Premium Trial

Locked policy:

- trial duration: **14 days**
- card required: **No**
- trial expiration: automatically downgrade to Free
- data after downgrade: retained, not deleted
- features above Free limits become unavailable/read-only according to entitlement rules
- re-upgrade restores access where technically valid

## 6. Premium Economic Logic

Commission difference:

- Free: 12%
- Premium: 7%
- difference: 5 percentage points

At 299 TRY/month:

`299 / 0.05 = 5,980 TRY`

A provider processing approximately **5,980 TRY/month** through the platform can recover the monthly Premium price through commission savings alone, before counting Premium product benefits.

## 7. Core Premium Proposition

> **Get more students, manage your teaching business, and keep more of what you earn.**

Premium must not be sold only through cosmetics or a badge.

Its value is built from:

- lower commission,
- advanced scheduling,
- recurring lessons,
- student management,
- automation,
- analytics,
- conversion/growth insight,
- richer profile tools,
- controlled discovery advantages.

## 8. Off-Platform Leakage Principle

The product cannot fully prevent two people from communicating outside the platform.

The strategy is therefore to create better reasons to remain inside:

- secure transaction record,
- booking confirmation,
- refund/cancellation process,
- package tracking,
- reminders,
- payout records,
- support/dispute evidence,
- future paid student–provider workspace,
- future marketplace protections.

## 9. Payment Processing Cost

Payment-provider fees are an infrastructure cost separate from the product's advertised marketplace commission.

Rules:

- do not hardcode assumed provider fees,
- keep platform commission configuration-driven,
- support payment-provider fee fields in transaction accounting,
- final commercial provider rates depend on the selected marketplace payment provider agreement.

## 10. Models Not Used in V1

- Pay-per-lead: **No**
- Student service fee: **No**
- 100% first/trial lesson commission: **No**
- Standalone paid featured listing as primary model: **No**

## 11. Revenue Architecture

```text
                         PLATFORM
                            |
              +-------------+-------------+
              |                           |
       Marketplace Revenue          SaaS Revenue
              |                           |
       Booking commission         Premium subscription
         Free: 12%                  299 TRY/month
       Premium: 7%                 2,990 TRY/year
```

## 12. Required Monetization Entities

At minimum:

- `bookings`
- `payments`
- `payment_attempts`
- `refunds`
- `provider_payouts`
- `commission_rules`
- `subscriptions`
- `subscription_entitlements`

Rules must be configuration-driven.

## 13. Locked Decisions

- Core model: **Marketplace + SaaS Hybrid**
- Student subscription: **Free**
- Student platform fee: **0% in V1**
- Free subscription: **0 TRY**
- Free commission: **12%**
- Premium commission: **7%**
- Premium monthly: **299 TRY**
- Premium annual: **2,990 TRY**
- Trial: **14 days, no card**
- Free package limit: **1**
- Premium package limit: **unlimited**
- Free active-student limit: **3**
- Premium active-student limit: **unlimited**
