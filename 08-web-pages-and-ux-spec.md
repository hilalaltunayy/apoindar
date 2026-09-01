# 08 — Web Pages and UX Specification

## 1. Purpose

This document defines the page-by-page web experience for Apoindar.

It translates the approved product, business, and design decisions into a concrete web UX structure.

This document is the source of truth for:

- web page hierarchy
- navigation
- user flows
- page-level content priorities
- primary/secondary CTAs
- Free/Premium visibility
- booking/payment flow
- provider dashboard structure
- responsive behavior
- page-specific motion expectations

It must be read together with:

- `01-vision-scope-target-audience.md`
- `02-features-and-roadmap.md`
- `03-revenue-model-and-marketplace-monetization.md`
- `07-design-system-and-visual-language.md`
- `10-business-rules-and-premium.md`

## 2. Global Web Navigation

### Public Header

Recommended structure:

- Apoindar logo
- Find a Teacher
- Categories
- How It Works
- For Teachers
- Premium
- Log In
- Sign Up

### Logged-In Student Header

- Apoindar logo
- Search
- My Bookings
- My Packages
- Messages / Workspace entry when available
- Profile
- Notifications

### Logged-In Provider Header / Shell

Provider pages use a dashboard shell with:

- Dashboard
- Calendar
- Students
- Lessons & Packages
- Bookings
- Earnings
- Analytics / Growth
- Premium
- Profile
- Settings

The desktop provider experience may use a left sidebar.

The mobile web responsive version collapses this structure into a compact navigation pattern without copying the native mobile-app layout exactly.

## 3. Home / Landing Page

### Goal

Convert a visitor into one of two actions:

1. find/book a provider,
2. become a provider.

### Above-the-Fold Structure

1. brand/header
2. main serif headline
3. short supporting statement
4. large search interaction
5. real human visual with soft illustrative treatment
6. subtle trust indicators

### Hero Copy Direction

The hero should focus on finding the right provider and safely planning lessons.

Example direction:

> Find the right teacher.  
> Achieve your goals.

Do not hardcode this exact copy if later brand copywriting improves it.

### Search Module

Inputs:

- What do you want to learn?
- Where?

Primary CTA:

- Search / Find a Teacher

Idle search field uses the approved typing-placeholder animation with rotating examples such as:

- Physics
- Swimming
- Pilates
- Mathematics
- English
- French
- Kindergarten Activities

The animation stops immediately on focus.

### Hero Motion

- subtle logo/reveal entry
- micro-parallax decorative shapes
- provider imagery enters softly
- search module fades/slides into place
- no aggressive motion

### Home Sections

Recommended order:

1. Hero/Search
2. Popular Categories
3. Featured / Recommended Providers
4. How Apoindar Works
5. Why Book Through Apoindar
6. For Teachers / Provider Value
7. Premium provider teaser
8. Future student–provider continuity/workspace teaser
9. Trust / FAQ / footer

### Popular Categories

Card examples:

- Academic
- Languages
- Sports
- Music
- Art & Design
- Exam Preparation

Cards should use the approved yellow/purple/cream design language.

### Featured Providers

Provider cards show:

- image
- name
- category
- location / online availability
- rating placeholder if ratings are live
- starting price
- next availability if available
- CTA: View Profile / Book

Cards enter with soft staggered reveal on scroll.

### “Why Book Through Apoindar”

Communicate platform value:

- secure booking/payment
- booking history
- package tracking
- cancellation/refund handling
- future learning workspace benefits

This section helps reduce off-platform leakage.

## 4. Search / Provider Results Page

### Goal

Help users quickly narrow down and compare suitable providers.

### Structure

Desktop:

- filter sidebar
- main result area
- optional sticky search bar
- result count / sort control

### Core Filters

- category
- city/district
- price
- online / in-person
- availability

Phase 2 filters may add:

- experience
- rating
- distance
- lesson type
- individual / group

### Provider Result Card

Required:

- provider image
- provider name
- category
- short credibility summary
- location
- online/in-person indicator
- price
- next available time where available
- one primary CTA
- optional favorite action

The image treatment should follow the branded card system and may use soft cutout/depth styling when technically suitable.

### Search Results Motion

When results load or filters change:

- avoid hard replacement
- use short fade/translate transitions
- new cards may stagger into view
- skeletons use cream/lavender branded placeholders

## 5. Provider Profile Page

### Goal

Give enough confidence and clarity for a student to book/pay.

### Page Structure

1. provider hero
2. core profile information
3. lesson/package options
4. availability
5. about
6. experience / credentials
7. reviews when available
8. booking CTA
9. similar providers

### Provider Hero

Show:

- large branded provider image
- name
- category
- location
- online/in-person
- credibility indicators
- starting price
- primary CTA: Book a Lesson

The provider image should feel slightly layered, not trapped in a flat rectangular card.

### Lesson / Package Section

Each offer shows:

- title
- price
- lesson count / duration
- short description
- online/in-person
- package terms
- CTA

Free provider:

- maximum 1 active offer

Premium:

- multiple offers

### Sticky Booking CTA

On long pages, a desktop sticky booking panel may remain visible.

## 6. Booking Flow

### Goal

Move the user from provider interest to confirmed paid booking with minimal friction.

### Recommended Steps

1. choose lesson/package
2. choose date/time
3. review booking
4. sign in / create account if needed
5. payment
6. success

### Booking UX Principle

Use a multi-step experience, but avoid making it feel like a long form.

Progress should be visually clear.

### Booking Review

Show:

- provider
- service/package
- selected time
- gross amount
- cancellation/refund summary
- payment CTA

Do not expose provider commission to the student.

## 7. Checkout / Payment Page

### Goal

Create trust and reduce checkout abandonment.

### Structure

- booking summary
- price
- payment method
- secure-payment messaging
- terms/cancellation summary
- pay button

### Success State

After successful payment:

- custom Apoindar success motion
- no generic spinner/check-only experience
- show:
  - booking confirmed
  - provider
  - time
  - package status
  - next steps

If the paid student–provider workspace feature is active in the future, this is where access may be introduced.

## 8. Student Dashboard

### Goal

Give the student one clear overview of their learning activity.

### Main Areas

- next lesson
- active packages
- upcoming bookings
- recent providers
- progress / continuity area
- notifications
- future workspace shortcuts

### Dashboard Style

Must follow the approved:

> minimal premium + slight gamified warmth

Avoid a generic admin dashboard appearance.

### Suggested Top Cards

- Next Lesson
- Active Package
- Upcoming Bookings
- Learning Streak / Progress when relevant

These should feel more like an education product than an enterprise reporting tool.

## 9. Student Bookings Page

### Tabs

- Upcoming
- Completed
- Cancelled

Each booking item shows:

- provider
- lesson/package
- date/time
- payment status
- status
- actions

Possible actions:

- view details
- cancel if policy allows
- book again
- open workspace if eligible in future

## 10. Student Packages Page

Show:

- provider
- package name
- lessons purchased
- lessons completed
- lessons remaining
- next scheduled lesson
- progress visualization
- workspace access when enabled

This page should feel motivating rather than financial.

## 11. Provider Dashboard

### Goal

Give the provider an immediate view of today’s business.

### Top-Level Information

Recommended top section:

- today’s lessons
- upcoming bookings
- active students
- current plan
- current commission rate
- pending/next payout summary
- recent revenue summary

### Dashboard Differentiation

Do not use a standard grid of identical business cards.

Use a more editorial layout with:

- varied visual hierarchy
- one dominant “today” or “next action” module
- smaller supporting data blocks
- calendar preview
- growth/progress visualization
- soft illustrations where appropriate

### Free Dashboard

Shows:

- basic activity
- basic student count
- bookings
- basic earnings
- current 12% commission
- Premium teaser where contextually useful

### Premium Dashboard

Adds:

- 7% commission status
- advanced calendar previews
- Growth Dashboard entry
- student-management insights
- automation/reminder status
- deeper earnings/conversion insight

## 12. Provider Calendar

### Free

- day/week view
- add availability
- view bookings
- one-time lessons
- accept/reject where applicable
- basic overlap prevention

### Premium

Adds:

- recurring lessons
- weekly templates
- bulk availability
- student labels/colors
- no-show/cancellation tracking
- reminders
- package-credit view
- advanced conflict warnings
- Google Calendar sync when enabled
- historical lesson analysis

### Calendar UX

The calendar must feel visual and easy, not like spreadsheet software.

Drag/drop may be added where reliable.

## 13. Provider Students / CRM

### Free

Maximum 3 active students.

Show:

- student card
- basic lesson history
- package relationship

### Premium

Unlimited students plus:

- search
- filters
- active/inactive/former status
- lesson history
- package credits
- payment history
- private notes
- no-show history
- next lesson
- lesson totals
- revenue summary

### UX Principle

This is a teacher-specific CRM.

It must remain simple and visually approachable.

## 14. Provider Lessons & Packages

### Free

- create/manage 1 active lesson/package

### Premium

- unlimited lesson/package listings

### Page Structure

- active offers
- draft/inactive offers
- create/edit action
- pricing
- duration
- lesson count
- online/in-person
- package availability

## 15. Provider Earnings / Payouts

### Goal

Make money flow understandable.

Show:

- gross sales
- platform commission
- payment-provider cost if appropriate for provider-facing transparency
- provider net amount
- payout status
- payout history
- refunds

### Free/Premium Awareness

The page should clearly show:

- current plan
- current commission rate
- estimated commission saved by Premium where useful

This is a natural Premium conversion point.

## 16. Premium / Upgrade Page

### Goal

Explain Premium using business value, not decoration.

Primary proposition:

> Get more students, manage your teaching business, and keep more of what you earn.

### Show

- 299 TRY/month
- 2,990 TRY/year
- 14-day no-card trial
- 12% vs 7% commission comparison
- break-even explanation around ~5,980 TRY monthly platform volume
- feature comparison
- advanced calendar
- unlimited students
- unlimited packages
- recurring lessons
- Growth Dashboard
- analytics/automation

Avoid overcomplicated pricing tables.

Use one Free vs one Premium plan comparison.

## 17. Auth Pages

### Pages

- Sign Up
- Log In
- Forgot / Reset Password
- provider onboarding
- student onboarding where needed

### Design

Auth should feel fully branded, not like a generic auth template.

Use:

- warm background
- soft education motifs
- serif title
- minimal form
- subtle animation

## 18. Provider Onboarding

Recommended steps:

1. account
2. provider type/category
3. location / online preference
4. profile details
5. price
6. first lesson/package
7. availability
8. photo
9. review/publish

Free provider should be able to complete onboarding without being forced into Premium.

Premium upsell should appear only at sensible moments.

## 19. Admin Panel

Admin may be visually calmer and more utilitarian than student/provider pages, but should still use Apoindar design tokens.

Core areas:

- users
- providers
- listings/packages
- bookings
- payments
- subscriptions
- commission rules
- refunds
- disputes
- categories
- moderation
- analytics summary

Admin prioritizes clarity over delight.

## 20. Future Paid Student–Provider Workspace

Not required in V1.

When implemented, it may include:

- private messaging
- assignments
- tests/exercises
- file/resource sharing
- due dates
- completion status
- provider feedback
- progress notes
- lesson-to-lesson goals
- package progress

The workspace only opens after a successful eligible paid relationship.

## 21. Responsive Web Principles

### Desktop

- richer multi-column layouts
- sidebars where useful
- sticky contextual controls
- wider dashboards

### Tablet

- reduce columns
- preserve hierarchy
- avoid cramped cards

### Mobile Web

- stack content
- maintain CTA visibility
- use bottom sheets where useful
- do not blindly imitate the native mobile app
- preserve the same brand/motion language

## 22. Motion by Page Type

### Public / Landing

- strongest visual motion
- micro-parallax
- staggered section reveals
- animated search placeholder
- smooth CTA transitions

### Search / Results

- subtle filter/result transitions
- skeletons
- card reveal

### Provider Profile

- shared image transition
- sticky CTA
- soft section entrance

### Checkout

- restrained motion
- trust-first
- no distracting animation

### Dashboards

- data enters smoothly
- avoid excessive animation
- charts and cards may animate lightly on first load

### Success

- branded mini celebration
- yellow/purple transformation
- both student and provider experiences should feel rewarding

## 23. Empty / Loading / Error States

All pages must have designed states.

### Loading

- Apoindar loader / branded skeleton
- no generic spinner-only solution

### Empty

- small premium illustration
- clear next action

### Error

- calm language
- clear recovery action
- do not use aggressive red unless necessary

## 24. Page Transition Principle

The application must feel connected.

Avoid hard page cuts when possible.

Use:

- shared transitions
- short fade/translate
- gentle layout continuity
- provider-card-to-profile continuity
- button state transitions
- soft screen changes

The goal is a “buttery” experience.

## 25. Locked Web UX Decisions

- Home is search-first
- Public navigation includes teacher discovery and provider acquisition
- In-platform booking/payment is the primary paid flow
- Direct contact is secondary
- Provider profile leads directly to booking
- Free provider: 1 active lesson/package
- Free provider: 3 active students
- Premium: unlimited
- Premium calendar is significantly more capable
- Provider dashboard must not look like a generic admin panel
- Premium page focuses on business value and lower commission
- Student dashboard focuses on learning continuity
- Future workspace is tied to successful paid relationship
- All major pages require branded loading/empty/success states
- Web remains responsive but native mobile UX is specified separately
