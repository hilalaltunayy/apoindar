# 09 — Mobile App UX Specification

## 1. Purpose

This document defines the mobile application UX for Apoindar across:

- iOS
- Android

The mobile app is a dedicated native client built with React Native + Expo.

It must share Apoindar’s product logic, brand identity, business rules, payment model, and visual language with the web product, but it must **not** behave like a compressed copy of the website.

This document is the source of truth for:

- mobile navigation
- mobile screen hierarchy
- student flows
- provider flows
- booking/payment flows
- mobile-specific interactions
- gesture behavior
- bottom navigation
- loading/success/empty states
- motion expectations
- native platform adaptation

It must be read together with:

- `01-vision-scope-target-audience.md`
- `02-features-and-roadmap.md`
- `03-revenue-model-and-marketplace-monetization.md`
- `07-design-system-and-visual-language.md`
- `08-web-pages-and-ux-spec.md`
- `10-business-rules-and-premium.md`

## 2. Shared Mobile Design Direction

The mobile app must preserve the approved Apoindar identity:

- warm cream background
- soft purple structural color
- yellow CTA accent
- light lavender decorative support
- serif headlines
- sans-serif UI/body text
- soft educational background motifs
- real provider photos with branded framing
- premium cards
- smooth motion
- no generic app-template appearance

The same visual language must feel coherent on both iOS and Android.

## 3. Native Platform Principle

The product should respect native interaction expectations while keeping one brand identity.

### iOS

May use:

- slightly softer transitions
- native-feeling sheets
- gesture-friendly navigation
- subtle haptic feedback
- smooth shared transitions

### Android

May use:

- platform-appropriate back behavior
- clear touch targets
- native-safe modal/sheet patterns
- haptic feedback where supported

The UI should not visibly split into two unrelated products.

## 4. Mobile Bottom Navigation

Initial approved tab structure:

1. Home
2. Search
3. Bookings
4. Messages
5. Profile

### Visual Style

- bottom bar uses Apoindar purple as the main structural tone
- active tab uses a warm yellow/purple emphasis
- icons are minimal and refined
- labels remain readable
- bar should feel premium, not playful-toy-like

### Behavior

- transitions between tabs must be smooth
- tab state is preserved where reasonable
- avoid full-screen hard reloads
- haptic feedback may be used lightly on tab selection

## 5. App Launch Experience

### 5.1 Brand Reveal

Apoindar should open with a short branded reveal.

Goals:

- memorable
- elegant
- fluid
- premium
- fast enough not to frustrate users

The exact motion may use:

- logo shape construction
- soft yellow-to-purple reveal
- subtle masked motion
- brush-like transition
- layered reveal

The emotional direction should match the reveal reference previously approved by the user.

### 5.2 Loading State After Reveal

Do not show a generic spinner.

Use the Apoindar branded loader:

- educational motifs change in sequence
- pale lavender gradually deepens toward the active purple tone
- motion is subtle
- loader may sit inside a circular or organic soft container

## 6. Student Home Screen

### Goal

Show the student what matters now and make discovery effortless.

### Recommended Structure

1. greeting
2. search field
3. current journey / active package card
4. upcoming lesson
5. recommended providers
6. categories
7. recent activity
8. future workspace shortcut when available

### Greeting Area

Example direction:

> Good morning, Zeynep.

Use a light, human tone.

### Search

The search field uses the approved typing-placeholder interaction when idle.

Possible rotating examples:

- Mathematics
- Tennis
- Swimming
- English
- Pilates
- Physics
- French

The effect disappears instantly on focus.

## 7. Search / Discovery Screen

### Goal

Enable fast teacher/provider discovery.

### Core Elements

- search field
- category chips
- filter button
- online / in-person toggle
- location
- provider cards

### Mobile Provider Cards

Cards should feel richer than simple list rows.

Show:

- provider image
- name
- category
- location
- price
- rating when available
- availability preview
- favorite action
- view / book CTA

### Card Motion

As cards enter the viewport:

- soft fade/translate reveal
- small stagger
- no dramatic bouncing

### Future Swipe Discovery

A swipe/card discovery mode may be introduced later.

This should not replace conventional search entirely.

## 8. Provider Profile Screen

### Goal

Convert profile interest into booking.

### Structure

1. large provider visual
2. name + category
3. trust indicators
4. location / online status
5. short about
6. lesson/package options
7. availability
8. reviews
9. sticky booking CTA

### Visual Treatment

The provider image should feel layered and editorial.

Where technically possible:

- portrait separated softly from background
- decorative color shape behind image
- subtle depth
- selective object overlap

The effect must stay premium and natural.

### Sticky CTA

Primary action:

- Book a Lesson
- Buy Package

The CTA remains easily accessible without covering content.

## 9. Booking Flow

### Mobile Booking Steps

1. select lesson/package
2. select date
3. select time
4. review booking
5. payment
6. success

### Interaction Style

Use mobile-native patterns:

- bottom sheets
- compact step cards
- swipe-safe gestures
- sticky CTA area

Avoid long vertically dense forms.

## 10. Checkout / Payment

### Goal

Create trust and minimize abandonment.

Show:

- provider
- lesson/package
- selected time
- amount
- payment method
- cancellation/refund summary
- primary pay CTA

### Motion

Checkout motion must be restrained.

No distracting animation during payment entry.

### Success

After successful payment:

- Apoindar branded success animation
- yellow/purple transformation
- mini celebration
- clear next step

Show:

- booking confirmed
- provider
- date/time
- package progress if relevant
- future workspace access if enabled

Success should feel rewarding for both student and provider.

## 11. Student Bookings Tab

### Sections

- Upcoming
- Completed
- Cancelled

Each booking card shows:

- provider
- lesson/package
- date/time
- location / online
- payment state
- booking state

Possible actions:

- view details
- cancel if allowed
- book again
- open workspace later

## 12. Student Package Experience

Package card shows:

- provider
- package title
- lessons purchased
- completed lessons
- remaining lessons
- next lesson
- visual progress indicator

The page should feel motivational, not accounting-heavy.

## 13. Messages Tab

### V1

If real-time messaging is not yet active:

- show an informative placeholder or limited supported communication surface
- do not fake a full messaging system

### Future

When the paid student–provider workspace launches, Messages may become a gateway into:

- provider conversations
- assignments
- files
- progress
- package continuity

## 14. Student Profile

Areas:

- profile
- account
- saved providers
- payment methods if supported
- notifications
- language
- privacy
- support
- logout

The profile should feel clean and calm.

## 15. Provider Mobile Home / Dashboard

Provider mode should prioritize immediate action.

### Main Sections

- today’s lessons
- next booking
- active students
- pending actions
- recent payments
- payout summary
- plan + commission rate

### Free Provider

Show:

- 12% commission
- 1 active lesson/package limit
- 3 active students
- basic calendar
- basic earnings

### Premium Provider

Show:

- 7% commission
- unlimited students
- unlimited packages
- recurring lessons
- advanced calendar
- Growth Dashboard entry
- reminders/automation
- advanced student management

### Dashboard Tone

Must not feel like enterprise software.

Use:

- varied card sizes
- one dominant “today” module
- soft visual hierarchy
- warm progress blocks
- limited tasteful gamification

## 16. Provider Calendar

### Free

- day/week view
- availability
- bookings
- one-time lesson management
- basic conflict prevention

### Premium

Adds:

- recurring lessons
- bulk availability
- weekly templates
- student colors/labels
- no-show/cancellation tracking
- reminders
- package-credit view
- advanced conflict warnings
- Google Calendar sync when enabled

### Mobile Calendar Interaction

Use:

- swipe between days/weeks
- tap slot to inspect
- bottom sheet for create/edit
- strong selected-time feedback
- minimal clutter

## 17. Provider Students

### Free

Maximum 3 active students.

Card shows:

- student
- current lesson/package
- next lesson
- basic history

### Premium

Unlimited students plus:

- search
- filters
- status
- package credits
- payment history
- notes
- no-show history
- next lesson
- lesson totals
- revenue summary

### UX Style

Avoid spreadsheet-style CRM.

Use human-centered student cards and compact detail screens.

## 18. Provider Lessons & Packages

### Free

- maximum 1 active lesson/package

### Premium

- unlimited

### Screen Structure

- active
- draft/inactive
- add new
- edit
- pricing
- duration
- package size
- online/in-person
- availability

## 19. Provider Earnings / Payouts

Show:

- gross sales
- platform commission
- net amount
- pending payout
- paid payout
- refunds
- transaction history

### Premium Conversion Opportunity

Clearly show:

- current 12% vs 7% commission
- estimated savings with Premium

This should be informative, not aggressively sales-oriented.

## 20. Premium Screen

### Goal

Explain Premium simply.

Show:

- 299 TRY/month
- 2,990 TRY/year
- 14-day no-card trial
- 12% → 7% commission
- unlimited students
- unlimited lesson/packages
- advanced calendar
- recurring lessons
- analytics
- Growth Dashboard
- reminders/automation

Use one clear Free vs Premium comparison.

Avoid complex multi-tier pricing.

## 21. Provider Onboarding

Recommended mobile steps:

1. account
2. provider category
3. location / online status
4. profile info
5. price
6. first lesson/package
7. availability
8. photo
9. preview/publish

### Interaction Rules

- one clear task per screen
- visible progress
- save progress
- no forced Premium purchase
- Premium upsell only at natural moments

## 22. Provider Photo Upload Experience

Because provider images strongly affect marketplace quality, upload flow should guide users.

### Guidance

Prompt for:

- clean portrait
- well-lit photo
- simple background where possible
- suitable framing

### Presentation Layer

The app may apply visual presentation treatment such as:

- crop assistance
- background softening
- soft cutout-style framing
- branded decorative backdrop
- subtle object overlap

Do not automatically distort or cartoonize user photos.

## 23. Future Paid Student–Provider Workspace

### Unlock Rule

Only after successful eligible in-platform payment.

### Mobile Workspace Home

May include:

- chat
- assignments
- shared files
- progress
- lesson/package status
- next lesson

### Assignment Flow

Provider:

- create task
- add note
- attach file/link/test
- set due date

Student:

- open task
- submit/mark complete
- attach result/file if supported

Provider:

- review
- leave feedback
- update progress

### Product Boundary

Keep this lightweight and mentorship-focused.

Do not turn the first version into a full LMS.

## 24. Motion Language on Mobile

### 24.1 Screen Transitions

No hard cuts.

Use:

- soft slide
- shared transition
- gentle fade
- short transform

### 24.2 Shared Provider Transition

Provider card → provider profile should feel connected.

The image may visually travel into the detail page when technically stable.

### 24.3 Button Brush Effect

Yellow buttons may transition toward purple with a paint/brush fill effect.

Purple actions may transition toward yellow in selected branded moments.

Keep motion fast enough for usability.

### 24.4 Micro-Parallax

Use only on decorative hero/landing-like mobile surfaces.

Do not use on dense dashboard screens.

## 25. Scroll Behavior

New cards should appear with:

- subtle fade
- short vertical reveal
- slight stagger

Avoid heavy motion during long lists.

## 26. Haptics

Light haptic feedback may be used for:

- successful booking
- payment success
- favorite toggle
- bottom-tab selection
- completed action
- recurring lesson creation

Haptics must remain subtle.

## 27. Loading States

### App-Level Loading

Use branded icon loader.

### Content Loading

Use cream/lavender skeletons.

### Rule

Never rely on a generic spinner as the primary loading language.

## 28. Empty States

Examples:

- no bookings
- no active students
- no packages
- no messages
- no availability

Each empty state should include:

- small premium illustration
- clear explanation
- clear next action

## 29. Error States

Errors should feel calm.

Use:

- concise copy
- recovery action
- retry where appropriate
- support path if needed

Avoid aggressive red-heavy layouts.

## 30. Accessibility

Must support:

- scalable text where practical
- readable contrast
- clear touch targets
- reduced-motion compatibility
- screen-reader labels
- semantic navigation
- safe-area handling
- keyboard/input accessibility

## 31. Performance Principles

Animations must not damage usability.

Prioritize:

- responsive gestures
- fast screen transitions
- optimized images
- lazy loading
- stable list performance
- lightweight decorative effects

Use reduced/disabled animation on low-performance conditions where necessary.

## 32. iOS / Android Common Design Language

The product must feel like **Apoindar first**, platform second.

Shared across both:

- palette
- typography
- cards
- photo treatment
- icons
- background motifs
- motion tone
- success/loading language
- Premium styling

Native differences are used only where they improve usability.

## 33. Locked Mobile UX Decisions

- React Native + Expo
- iOS and Android share one Apoindar design language
- bottom tabs: Home / Search / Bookings / Messages / Profile
- app launch includes branded logo reveal
- no generic spinner
- search typing-placeholder interaction approved
- yellow/purple brush button motion approved
- provider card → profile shared transition approved
- mobile booking/payment is a primary core flow
- provider dashboard is action-first and non-generic
- Free: 1 active package, 3 active students
- Premium: unlimited
- recurring lessons: Premium
- future paid workspace: payment-gated
- light-first visual system
- dark mode not required for V1
- accessibility and reduced-motion support required
