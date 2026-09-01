# 11 — Testing and Acceptance Criteria

## 1. Purpose

This document defines the mandatory quality, testing, performance, and release criteria for Apoindar.

Claude Code must not consider a phase, feature set, or release complete unless the applicable criteria in this document have been satisfied.

This document is the source of truth for:

- unit testing
- integration testing
- end-to-end testing
- button/action verification
- page-by-page functional verification
- web testing
- iOS testing
- Android testing
- responsive testing
- performance testing
- security/authorization testing
- payment/commission testing
- Free/Premium entitlement testing
- loading/empty/error/success state testing
- accessibility checks
- production-readiness checks
- release gates

It must be read together with:

- `01-vision-scope-target-audience.md`
- `02-features-and-roadmap.md`
- `03-revenue-model-and-marketplace-monetization.md`
- `04-technical-architecture-and-stack.md`
- `05-integration-plan.md`
- `06-decision-log.md`
- `07-design-system-and-visual-language.md`
- `08-web-pages-and-ux-spec.md`
- `09-mobile-app-ux-spec.md`
- `10-business-rules-and-premium.md`

## 2. Global Completion Rule

Claude Code must not say:

- “done”
- “complete”
- “ready”
- “finished”
- “phase completed”
- “release-ready”

unless all applicable required tests have been run and the acceptance criteria have passed.

If anything remains untested, partially tested, mocked, skipped, or blocked, Claude must state that explicitly.

## 3. Required Test Layers

Every meaningful feature must be covered at the correct levels:

1. Unit tests
2. Integration tests
3. End-to-end tests
4. Page-by-page interaction tests
5. Platform-specific tests
6. Performance checks
7. Security/authorization checks
8. Visual/UX acceptance checks

No single test layer replaces the others.

## 4. Unit Testing

Unit tests must cover business logic that can fail independently.

Mandatory areas include:

- commission calculation
- Free/Premium commission selection
- Premium price logic
- entitlement checks
- package limits
- active-student limits
- recurring lesson rules
- booking state transitions
- payment state transitions
- refund calculations
- payout calculations
- package-credit calculations
- recurring lesson generation
- trial expiration rules
- downgrade rules
- commission-effective-time rules
- date/time logic
- validation schemas
- utility functions used in critical flows

### Required Locked Business Assertions

At minimum:

- Free commission = 12%
- Premium commission = 7%
- Free active lesson/package limit = 1
- Premium active lesson/package limit = unlimited
- Free active students = 3
- Premium active students = unlimited
- recurring lessons = Premium only
- student service fee in V1 = 0%
- Premium monthly price = 299 TRY
- Premium annual price = 2,990 TRY
- Premium trial = 14 days

## 5. Integration Testing

Integration tests must verify that multiple parts of the system work correctly together.

Mandatory areas:

- Auth.js + user persistence
- provider onboarding + database
- listing/package creation + entitlement checks
- student creation + provider entitlement limits
- booking + payment state
- payment + commission calculation
- payment + provider net amount
- payment + payout state
- refund + booking/payment state
- subscription + entitlement activation
- subscription downgrade + data retention
- calendar + recurring lessons
- package purchase + package-credit tracking
- admin inspection of payments/subscriptions
- storage + provider image upload
- server authorization + database ownership rules

Payment tests may use sandbox/mock providers until production credentials are explicitly enabled.

## 6. Mandatory End-to-End Scenarios

The following flows are mandatory before the applicable web marketplace phase is considered complete.

### Student Marketplace Flow

1. Student opens Apoindar.
2. Searches for a provider.
3. Applies at least one filter.
4. Opens provider profile.
5. Selects a lesson/package.
6. Selects date/time when required.
7. Creates/signs into an account if required.
8. Completes test/sandbox checkout.
9. Successful payment state is recorded.
10. Booking is confirmed.
11. Student sees confirmation and booking details.
12. Provider sees the new booking/payment state.

### Free Provider Limit — Lesson/Package

1. Free provider creates first active lesson/package.
2. First offer succeeds.
3. Free provider attempts to activate a second offer.
4. System blocks the action server-side.
5. UI shows a clear Premium-related explanation.

### Free Provider Limit — Students

1. Free provider has 3 active students.
2. System attempts to add/activate a fourth.
3. Action is blocked server-side.
4. Existing student data remains safe.
5. Upgrade path is shown appropriately.

### Premium Recurring Lesson Flow

1. Premium provider opens calendar.
2. Creates a recurring lesson.
3. Example recurrence: every Saturday at 14:00 for 8 weeks.
4. Recurring instances are generated correctly.
5. Conflicts are handled correctly.
6. Student sees applicable lessons/bookings.

### Commission Flow

Test the same booking amount with both plans.

Verify:

- Free → 12%
- Premium → 7%
- gross amount correct
- platform commission correct
- provider net correct
- payment-provider cost tracked separately
- student does not see provider commission as a service fee

### Premium Upgrade Flow

1. Free provider upgrades.
2. Subscription becomes active.
3. Premium entitlements activate.
4. Commission behavior switches according to the locked effective-time rule.
5. Premium features become available.
6. Existing data remains intact.

### Premium Downgrade Flow

1. Premium provider cancels.
2. Premium remains active until paid period end.
3. Provider downgrades to Free.
4. Data is not deleted.
5. Excess package/student data is retained.
6. Premium-only actions become inaccessible/read-only as specified.
7. Re-upgrade restores eligible access.

### Payment Failure Flow

1. Payment attempt fails.
2. Booking is not falsely confirmed.
3. User receives a clear recovery state.
4. Retry is possible where supported.
5. No duplicate payment/booking is created.

### Refund Flow

1. Existing paid booking is refunded in test environment.
2. Payment/refund state updates correctly.
3. Booking state updates according to policy.
4. Provider net/payout values adjust correctly.
5. Admin can inspect the result.

### Authorization Flow

Verify that:

- student cannot access provider-only actions
- provider cannot access another provider’s private student data
- provider cannot edit another provider’s listing
- provider cannot change commission rules
- normal users cannot access admin endpoints
- admin access follows role rules
- hidden UI is never treated as sufficient authorization

## 7. Page-by-Page Functional Verification

Every implemented page must be manually or automatically walked through before release.

For **every page**, Claude Code must:

1. open the page
2. confirm it renders
3. confirm there are no runtime errors
4. identify every visible actionable control
5. test every button
6. test every link
7. test every tab
8. test every menu item
9. test every form
10. test every input
11. test every dropdown/select
12. test every modal/sheet
13. test every primary CTA
14. test every secondary CTA
15. verify navigation destination
16. verify expected state change
17. verify error handling
18. verify loading state
19. verify empty state where applicable
20. verify back/close/cancel behavior

A page is not considered tested merely because it renders.

## 8. Button and Action Audit

Before completion, create an interaction inventory for the implemented product.

For each actionable element record:

- page
- element/action name
- expected behavior
- actual behavior
- pass/fail
- related test if automated

All visible buttons must either:

- work correctly,
- be intentionally disabled with a clear reason,
- or be explicitly marked as future/not implemented.

There must be no decorative button that appears functional but does nothing.

## 9. Web Platform Testing

Web must be tested independently.

### Required Browsers

At minimum:

- current Chrome
- current Edge
- current Safari where test environment permits
- current Firefox where practical

### Required Viewports

At minimum test representative sizes for:

- small mobile web
- large mobile web
- tablet portrait
- tablet landscape where relevant
- laptop
- standard desktop
- large desktop

Recommended representative widths:

- 360 px
- 390 px
- 430 px
- 768 px
- 1024 px
- 1366 px
- 1440 px

### Web Checks

- no horizontal overflow
- nav works
- sticky CTAs behave correctly
- forms remain usable
- dialogs fit viewport
- cards do not break
- provider images remain correctly framed
- patterned background does not reduce readability
- animations do not cause layout jump
- keyboard navigation works for critical flows
- payment flow works in test environment

## 10. iOS Testing

The iOS app must be tested separately from Android.

Test at minimum:

- launch/reveal
- authentication
- Home
- Search
- Provider Profile
- Booking
- Checkout sandbox/test flow
- Bookings
- Profile
- provider mode/dashboard
- provider calendar
- provider students
- Premium flows
- back navigation
- sheets/modals
- keyboard behavior
- safe areas
- haptics where used
- push notification behavior when implemented
- app background/foreground restoration
- deep links when implemented

### iOS Device Coverage

At minimum test:

- one smaller iPhone layout
- one current standard/large iPhone layout

Simulator is acceptable during development, but real-device validation is required before production release where possible.

## 11. Android Testing

Android must be tested independently.

Test at minimum:

- launch/reveal
- authentication
- Home
- Search
- Provider Profile
- Booking
- Checkout sandbox/test flow
- Bookings
- Profile
- provider dashboard
- provider calendar
- provider students
- Premium flows
- Android back behavior
- bottom sheets/modals
- keyboard behavior
- different navigation-bar/safe-area conditions
- app background/foreground restoration
- deep links when implemented
- push notification behavior when implemented

### Android Device Coverage

At minimum test:

- one smaller/average Android phone layout
- one larger Android phone layout
- at least one physical Android device before production release where possible

## 12. Cross-Platform Behavior Matrix

Critical flows must be verified separately on:

- Web
- iOS
- Android

A flow passing on one platform does not automatically count as passing on the others.

Maintain a matrix such as:

| Flow | Web | iOS | Android |
|---|---|---|---|
| Login | Pass/Fail | Pass/Fail | Pass/Fail |
| Search | Pass/Fail | Pass/Fail | Pass/Fail |
| Provider Profile | Pass/Fail | Pass/Fail | Pass/Fail |
| Booking | Pass/Fail | Pass/Fail | Pass/Fail |
| Payment | Pass/Fail | Pass/Fail | Pass/Fail |
| Package purchase | Pass/Fail | Pass/Fail | Pass/Fail |
| Premium upgrade | Pass/Fail | Pass/Fail | Pass/Fail |
| Calendar | Pass/Fail | Pass/Fail | Pass/Fail |
| Student management | Pass/Fail | Pass/Fail | Pass/Fail |

## 13. Performance Testing

Performance is a release requirement.

The application must feel fast in normal use.

### Web Performance Targets

Target, under realistic test conditions:

- Core Web Vitals should be in acceptable/good ranges where feasible
- LCP target: approximately <= 2.5 s
- INP target: approximately <= 200 ms
- CLS target: <= 0.1
- primary navigation should feel immediate
- avoid blocking page transitions with unnecessary full reloads

### API / Backend Targets

For normal non-heavy operations in test/staging conditions:

- common reads should typically respond within ~500 ms server-side when infrastructure conditions allow
- common writes should typically complete within ~1 s excluding third-party payment latency
- slow queries must be identified and investigated
- N+1 query problems should be avoided

These are performance targets, not guarantees against external service latency.

### Mobile Performance

Verify:

- launch time is acceptable
- reveal animation does not unnecessarily delay usability
- lists scroll smoothly
- provider cards do not jank
- shared transitions remain smooth
- image loading is optimized
- large lists remain responsive
- bottom navigation reacts immediately

### Performance Regression

If a change materially slows a previously fast flow, investigate before release.

## 14. Page Transition Speed

Every major navigation path must be checked for perceived speed.

Verify:

- Home → Search
- Search → Provider Profile
- Provider Profile → Booking
- Booking → Checkout
- Checkout → Success
- Student Dashboard → Booking detail
- Provider Dashboard → Calendar
- Provider Dashboard → Students
- Provider Dashboard → Earnings

Transitions must not:

- freeze
- flash blank white unnecessarily
- show generic spinner unnecessarily
- lose user state
- take visibly excessive time without feedback

## 15. Animation Acceptance

Animations are part of the product quality bar.

Verify:

- logo reveal is smooth
- search typing-placeholder effect stops on focus
- scroll reveals do not lag
- shared transitions do not glitch
- brush-fill button effect works consistently
- skeletons match brand styling
- success motion triggers correctly
- micro-parallax remains subtle
- page transitions feel connected
- animations do not block user actions
- reduced-motion settings are respected

## 16. Loading State Acceptance

Every async page/section must have an intentional loading state.

Do not leave:

- blank white screens
- unexplained frozen controls
- default ugly spinners
- layout-breaking placeholders

Use:

- branded loader
- cream/lavender skeleton
- local progress feedback

## 17. Empty State Acceptance

Required examples include:

- no bookings
- no active students
- no packages
- no search results
- no messages/workspace
- no availability
- no payout history
- no analytics data

Each empty state must:

- explain the situation
- provide a next action where possible
- use brand-consistent visual treatment

## 18. Error State Acceptance

Test:

- network failure
- server error
- invalid form
- payment failure
- image upload failure
- unauthorized access
- expired session
- not found
- malformed URL/ID
- unavailable provider
- booking conflict

Every error state should:

- be understandable
- avoid exposing technical internals
- provide recovery where possible

## 19. Forms and Validation

For every form:

- required fields enforced
- invalid input rejected
- errors shown near relevant fields
- duplicate submission prevented
- submit button state clear
- loading state clear
- server validation mirrors critical client validation
- whitespace and edge cases handled
- unsafe values sanitized/validated appropriately

## 20. Payment and Financial Integrity Testing

Financial flows require strict testing.

Verify:

- idempotency where required
- duplicate webhook handling
- duplicate checkout protection
- gross amount accuracy
- commission accuracy
- provider net accuracy
- refund amount accuracy
- payout state accuracy
- plan effective time
- currency handling
- failed payment behavior
- pending payment behavior
- canceled payment behavior
- webhook retry behavior once provider is selected

No financial value should rely only on client-side calculations.

## 21. Subscription Testing

Test:

- start 14-day trial
- trial entitlement activation
- trial expiry
- upgrade during trial
- monthly Premium purchase
- annual Premium purchase
- cancellation
- billing-period end
- downgrade
- re-upgrade
- failed payment
- grace/retry behavior once finalized
- entitlement restoration
- data retention

## 22. Security and Authorization

Mandatory checks:

- authentication required where expected
- server-side role enforcement
- server-side entitlement enforcement
- object ownership validation
- no privilege escalation
- no insecure direct object references
- sensitive data not exposed in client payloads unnecessarily
- secrets never sent to client
- admin endpoints protected
- payment webhook authenticity verified when provider is integrated

## 23. Data Integrity

Test:

- deleting/deactivating records does not orphan critical payment history
- downgrade does not delete retained student/package data
- booking/payment links remain consistent
- payout references remain auditable
- refunds do not corrupt totals
- recurring lessons do not duplicate unexpectedly
- timezone handling remains consistent
- migrations do not silently destroy data

## 24. Accessibility

At minimum verify:

- text contrast
- keyboard navigation on web
- accessible labels
- semantic controls
- focus visibility
- touch target sizes
- screen-reader-friendly labels where practical
- reduced-motion support
- no critical action dependent on color alone

## 25. Visual Regression / Design Acceptance

The implemented UI must be checked against `07-design-system-and-visual-language.md`.

Reject implementation if it drifts into:

- generic AI SaaS appearance
- plain white-heavy layout
- incorrect purple/yellow balance
- generic gray skeletons
- flat/default Tailwind cards
- inconsistent typography
- abrupt transitions
- unbranded loaders
- visually boring provider dashboard
- childish over-animation

## 26. Production Build Checks

Before release:

### Web

- production build passes
- lint passes
- typecheck passes
- tests pass
- no critical console errors
- no unresolved dependency errors
- no accidental dev-only URLs
- no exposed secrets

### Mobile

- iOS production build succeeds
- Android production build succeeds
- required environment variables present
- production API endpoint correct
- release versioning correct
- no debug-only feature accidentally enabled

## 27. TODO / Mock / Placeholder Audit

Before release, search for and review:

- TODO
- FIXME
- mock
- fake
- placeholder
- test-only
- localhost
- temporary
- hardcoded
- sample data

Every occurrence must be classified as:

- safe/intended,
- removed,
- or explicitly deferred.

No critical payment/auth/business behavior may remain silently mocked in production.

## 28. Logging and Observability

Before real release, critical flows should have enough logging/monitoring to diagnose failures.

At minimum consider:

- auth failures
- booking failures
- payment failures
- webhook failures
- refund failures
- payout failures
- server errors
- important subscription transitions

Do not log secrets or sensitive payment data.

## 29. Regression Testing

When a bug is fixed:

- add a regression test where practical
- rerun the affected flow
- rerun dependent critical flows if risk exists
- verify other platforms if shared logic changed

## 30. Release Gate

A release/phase may be declared complete only if all applicable items below pass:

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Mandatory E2E tests pass
- [ ] Page-by-page functional audit complete
- [ ] Every visible button/action audited
- [ ] Web tests pass
- [ ] iOS tests pass for implemented iOS scope
- [ ] Android tests pass for implemented Android scope
- [ ] Cross-platform matrix complete
- [ ] Performance checks pass or documented blockers accepted
- [ ] Payment/commission tests pass
- [ ] Free/Premium entitlement tests pass
- [ ] Security/authorization checks pass
- [ ] Responsive checks pass
- [ ] Loading states verified
- [ ] Empty states verified
- [ ] Error states verified
- [ ] Animation/motion acceptance verified
- [ ] Accessibility baseline verified
- [ ] Production build passes
- [ ] TODO/mock/placeholder audit complete
- [ ] No Critical or High-severity known bug remains unresolved
- [ ] Any remaining Medium/Low issue is explicitly documented

## 31. Severity Rules

### Critical

Examples:

- incorrect financial calculation
- payment charged without valid booking
- unauthorized access to private data
- production crash in core flow
- data loss
- security vulnerability

Release is blocked.

### High

Examples:

- core booking flow broken
- login unusable
- Premium entitlement wrong
- major platform-specific crash
- refund flow broken

Release is blocked.

### Medium

Examples:

- secondary flow bug
- layout issue on uncommon viewport
- degraded but usable animation
- non-critical analytics issue

May release only if explicitly accepted/documented.

### Low

Examples:

- minor visual polish issue
- tiny spacing inconsistency
- non-blocking copy issue

May be deferred.

## 32. Final Test Report

At the end of each major phase, Claude Code must produce a concise report containing:

- test suites run
- number passed/failed
- pages audited
- actions/buttons audited
- Web status
- iOS status
- Android status
- performance summary
- payment/commission status
- entitlement status
- known issues by severity
- mocks/placeholders still present
- release gate result: PASS / BLOCKED

## 33. Locked Decisions in This Document

- every page must be functionally tested, not merely rendered
- every visible button/action must be tested
- Web, iOS, and Android are tested separately
- a pass on one platform does not imply a pass on another
- performance is part of release acceptance
- payment and commission logic require dedicated tests
- Free/Premium limits require server-side tests
- no generic spinner-only loading experience
- animation quality is testable product behavior
- production build is mandatory
- Critical/High bugs block release
- Claude cannot declare completion before the release gate passes
