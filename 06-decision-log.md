# 06 — Decision Log

This document records approved product decisions.

If another document conflicts with a later decision recorded here, this document wins until the conflicting document is updated.

## 1. Locked Product Decisions

| Topic | Decision |
|---|---|
| Initial sector | Education |
| Initial channel | Web first |
| Mobile | Phase 3, React Native + Expo |
| Web stack | Next.js + React + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Production DB | Supabase PostgreSQL |
| Production hosting | Vercel |
| Storage | Supabase Storage |
| Production dependency on developer PC | Never |
| Business model | Marketplace + SaaS Hybrid |
| Student subscription | Free |
| Student V1 service/platform fee | 0% |
| Free provider subscription | 0 TRY/month |
| Free provider commission | 12% |
| Premium provider commission | 7% |
| Premium monthly price | 299 TRY/month |
| Premium annual price | 2,990 TRY/year |
| Premium trial | 14 days |
| Trial card requirement | No |
| Free active lesson/package limit | 1 |
| Premium active lesson/package limit | Unlimited |
| Free active student limit | 3 |
| Premium active student limit | Unlimited |
| Free calendar | Basic |
| Premium calendar | Advanced |
| Recurring lessons | Premium only |
| Paid booking direction | In-platform checkout/payment |
| Pay-per-lead | Not used in V1 |
| 100% first-lesson commission | Not used |
| Student–provider workspace | Future feature after successful paid relationship |

## 2. Locked Premium Calendar Decisions

Premium calendar includes:

- recurring lessons,
- bulk availability creation,
- weekly availability templates,
- student labels/colors,
- cancellation/no-show tracking,
- automated reminders,
- package/lesson-credit tracking,
- advanced conflict warnings,
- Google Calendar sync when enabled,
- historical lesson analysis.

## 3. Locked Premium Student-Management Direction

Premium student management includes:

- unlimited active students,
- student profile card,
- contact information,
- current lesson/package,
- lesson history,
- package-credit tracking,
- payment history,
- private provider notes,
- no-show/absence history,
- next lesson,
- active/inactive/former status,
- search/filter,
- per-student lesson totals,
- per-student revenue summary.

Free remains limited to 3 active students with basic student cards/history.

## 4. Locked Trial / Downgrade Direction

- Premium trial: 14 days
- no card required
- trial expiry: downgrade to Free
- user data is retained
- data beyond Free limits is not deleted
- unavailable Premium features become inaccessible/read-only as appropriate
- re-upgrade restores eligible access

## 5. Product Direction Still Requiring Dedicated Specification

### Design

Must be finalized in:

- `07-design-system-and-visual-language.md`
- `08-web-pages-and-ux-spec.md`
- `09-mobile-app-ux-spec.md`

The visual goal is explicitly:

- not generic,
- not template-like,
- not obviously AI-generated,
- modern 21st-century product design,
- distinctive but not loud,
- premium but not cold,
- visually memorable,
- supported by purposeful animation and micro-interactions.

### Testing

Must be finalized in:

- `11-testing-and-acceptance-criteria.md`

### Growth Dashboard

Detailed metrics, insight rules, and presentation are not yet fully specified.

### Payment Operations

Before production payment activation, still define:

- exact payment provider,
- provider onboarding/submerchant flow,
- payout timing,
- refund policy,
- cancellation policy,
- dispute process,
- webhook/retry policy,
- failed-payment/grace behavior for real Premium billing.

## 6. Future Student–Provider Workspace

Approved as a future direction.

Unlock principle:

> successful in-platform paid lesson/package relationship

Candidate features:

- private messaging,
- assignments/tasks,
- tests/exercises,
- files/resources,
- due dates,
- completion tracking,
- feedback,
- progress notes,
- package progress,
- mentorship between lessons.

It must not become a full LMS by default.

## 7. Implementation Gate

Full autonomous product implementation must not start until the following are approved:

1. `10-business-rules-and-premium.md`
2. design system
3. web page-by-page UX
4. mobile UX before Phase 3
5. motion/animation system
6. testing/acceptance criteria
7. final `CLAUDE.md` execution update

Technical scaffolding and isolated experiments are allowed earlier when explicitly requested.
