# 12 — Mobile & Cross-Platform Implementation Guardrails

## Purpose
This document is a high-priority implementation reminder for Apoindar. It ensures iOS and Android are built as first-class products, not compressed copies of the web app, and that cross-platform product rules remain aligned across Web, iOS, and Android.

Read together with `CLAUDE.md` and `01`–`11`. Where this document captures a newer explicit decision, treat it as the newer decision.

## 1. Mobile must be first-class
- React Native + Expo.
- Same backend/domain/business rules as web.
- Not a WebView.
- Native interaction patterns.
- iOS and Android tested separately.
- Same Apoindar identity, but platform-specific UX is allowed where useful.

## 2. Approved visual direction is locked
Do not redesign the approved Apoindar visual system. Mobile must preserve:
- warm cream/off-white surfaces,
- soft/mid purple,
- warm yellow CTAs,
- subtle education/sport motifs,
- characterful headings,
- clean UI typography,
- rounded premium cards,
- soft depth,
- branded skeletons/loaders,
- smooth page transitions,
- card reveals,
- subtle success motion,
- tasteful haptics,
- premium empty/error states.
The result should feel playful and alive without becoming childish or noisy.

## 3. Branding
Use the final approved Apoindar logo consistently:
- iOS app icon,
- Android app icon/adaptive icon,
- splash/launch experience,
- auth branding,
- loading/reveal experience,
- app metadata.
Do not replace the approved logo without explicit approval.

## 4. Authentication must be complete and secure across web + mobile
Both web and mobile must support:
- sign up,
- login,
- logout,
- email confirmation,
- forgot password,
- password reset,
- in-app password change,
- validation,
- session persistence,
- session expiration handling,
- role handling,
- safe redirects/deep links,
- meaningful error states.

### 4.1 Password policy
Enforce at minimum:
- 8+ characters,
- 1 lowercase,
- 1 uppercase,
- 1 number,
- 1 symbol such as `.`, `!`, `?`, `@`, `#`.
Enforce the same policy server-side and on:
- sign-up,
- reset password,
- in-app password change.
Password inputs require show/hide eye control, accessible labels, visible criteria, and useful validation feedback.

### 4.2 Email confirmation
When an account is created:
1. send confirmation email,
2. confirmation link safely redirects into Apoindar,
3. mobile opens the app when installed,
4. otherwise safe web fallback,
5. user lands in the correct post-confirmation state.

### 4.3 Forgot/reset password
1. request reset,
2. send email,
3. link opens Apoindar,
4. mobile deep-links to app when installed,
5. web fallback works,
6. user enters new password,
7. password policy enforced,
8. reset token/session handled securely,
9. clear success state,
10. appropriate return to login/session.
Never dump valid reset links onto a generic login screen.

### 4.4 In-app password change
Authenticated users can change password from Settings/Security with proper session validation and clear success/error states.

## 5. One product, two languages
- Turkish is default.
- English fully supported.
- One codebase.
- No mixed-language UI.
- All user-facing states/screens localizable.

## 6. Mobile navigation and required screens
Baseline bottom navigation:
- Home
- Search/Discovery
- Bookings
- Messages
- Profile

Favorites must exist as a first-class screen even if not a permanent tab.

Required flows/screens include where relevant:
- splash/logo reveal,
- onboarding,
- role selection,
- signup/login,
- forgot/reset password,
- email confirmation result,
- home,
- discovery,
- professional search,
- city/category filters,
- search results,
- provider profile,
- listing detail,
- lesson/package detail,
- favorites,
- booking flow,
- date/time selection,
- checkout,
- payment status/success,
- booking history,
- active packages/package progress,
- messages,
- purchased-provider workspace,
- notifications,
- profile/edit profile,
- settings/security/language,
- premium/subscription state,
- provider onboarding/dashboard,
- provider calendar/availability,
- provider listings,
- provider CRM,
- provider earnings/payout history,
- admin/support where required,
- loading/empty/offline/network/access-denied/Premium-gate states.

Do not omit screens necessary to complete an end-to-end flow.

## 7. Swipe-based mobile discovery
Use a distinctive card-based mobile discovery interaction.

Latest explicit behavior:
- swipe LEFT = interested/liked → reveal/open additional information path,
- swipe RIGHT = skip → continue to next provider/education card.

Do not reverse this silently. Teach the gesture clearly in UI.

Cards may include:
- provider image,
- name,
- category/service,
- city,
- short credential line,
- rating when available,
- starting price,
- next availability,
- brief tags,
- favorite action,
- more-info action.

Provide tappable alternatives for accessibility.

## 8. Recommendation-system foundation
Architect for future recommendation signals from:
- liked/interested swipes,
- skips,
- favorites,
- profile opens,
- searches,
- categories,
- city,
- bookings,
- purchased packages,
- repeated provider interactions.

Do not build a complex ML recommender now. Create clean event/domain boundaries so this data can be used later.

## 9. Future paid provider promotion
Architecture should allow future paid exposure:
- promoted discovery cards,
- sponsored placement,
- category boost,
- city boost,
- time-limited featured placement.

Do not enable or charge for this now.
Organic and paid placement must be technically distinguishable and paid placements must be labelable.

## 10. Professional search
Users must be able to search/filter at minimum by:
- education/service type,
- category,
- city/location.

Architecture should support:
- online/in-person,
- price range,
- availability,
- rating,
- provider experience,
- lesson/package type,
- language,
- Premium/featured where strategy requires it.

Mobile UX should use polished native patterns such as bottom sheets, chips, segmented controls, applied-filter state, reset, and result count.

## 11. Favorites
Users can persistently favorite/save:
- providers,
- relevant lessons/packages where supported.

Favorites must be backend-persisted and available as a recommendation signal.
A dedicated Favorites screen must exist.

## 12. Paid package → private provider/student workspace
After a successful eligible lesson/package purchase, Apoindar can unlock a private provider-student workspace.

Initial architecture should support:
- direct private messaging,
- provider-shared resources/files,
- tasks/assignments,
- simple exercises/tests later,
- due dates,
- provider feedback,
- progress notes,
- lesson-to-lesson goals,
- package credit/progress,
- milestones,
- booking context.

Example:
Student buys an 8-lesson package → payment succeeds → private workspace unlocks.

Do not silently build a full LMS.
Keep it modular and purchase/eligibility-gated.
The same access logic must work on web, iOS, Android.

## 13. Messaging
- Anonymous users must not freely bypass the marketplace.
- Direct provider/student communication unlocks only when business rules allow.
- Eligible paid relationships can unlock richer workspace communication.
- Enforce access server-side.
- Phone/WhatsApp must not be the primary paid-booking route.

## 14. Student experience
At minimum:
- discovery,
- search/filters,
- provider details,
- favorites,
- lessons/packages,
- booking,
- checkout,
- upcoming/history,
- package progress,
- purchased-provider workspace,
- messages,
- profile,
- settings,
- notifications.

## 15. Provider experience
At minimum:
- onboarding,
- profile management,
- listings,
- lesson/package creation,
- availability,
- calendar,
- one-time bookings,
- Premium recurring lessons,
- student CRM,
- package tracking,
- private student workspaces,
- messages,
- earnings,
- payout history,
- Premium state,
- settings/security,
- notifications.

This must feel purpose-built for tutors/service providers, not like a generic CRM.

## 16. Premium rules remain centralized
Same backend entitlement source of truth for web/iOS/Android.

Free provider:
- 0 TRY/month
- 12% commission
- max 1 active lesson/package
- max 3 active students
- basic calendar

Premium provider:
- 299 TRY/month
- 2,990 TRY/year
- 14-day trial
- 7% commission
- unlimited active students
- unlimited active lessons/packages subject to anti-abuse limits
- recurring lessons
- advanced calendar
- advanced student management.

RevenueCat is for mobile Premium subscription handling.
Marketplace lesson/package payments are separate and must not use RevenueCat.

## 17. Payments are two distinct domains
A) Apoindar Premium subscription
- Mobile: RevenueCat/App Store/Google Play where applicable.
- Web: separate web subscription/payment strategy.
- Final entitlement must be consistent in Apoindar backend.

B) Marketplace lesson/package payments
- Separate marketplace payment provider.
- Future student payment, commission, provider payout/submerchant, refunds, payment attempts, booking/payment linkage.

Do not mix these domains.
Do not activate real money movement without explicit approval.

## 18. RevenueCat comes after mobile foundation
First build:
- mobile app,
- navigation,
- auth,
- backend integration,
- core student/provider flows,
- Premium entitlement interface.

Then integrate RevenueCat in a later approved step.
Do not fake a completed RevenueCat integration.

## 19. Backfill web where cross-platform infrastructure is missing
Examples:
- password policy,
- confirmation/reset flows,
- in-app password change,
- favorites persistence,
- search filters,
- purchased-provider workspace foundation,
- recommendation events,
- shared Premium entitlement logic.

Do not allow web/mobile business rules to diverge.

## 20. Deep links / Universal Links / App Links
Support architecture for:
- email confirmation,
- password reset,
- provider profile links,
- booking links,
- purchased-workspace links.

Use Expo linking plus:
- iOS Universal Links,
- Android App Links,
- safe web fallback.

## 21. Notifications foundation
Prepare boundaries for:
- booking reminders,
- booking confirmations,
- cancellations,
- provider responses,
- messages,
- assignment/task reminders,
- payment/subscription events.

Do not overbuild yet.

## 22. Offline/network/loading behavior
Handle:
- slow/no network,
- server error,
- auth expiration,
- empty data,
- loading,
- retry.
Use Apoindar-branded states rather than generic spinners.

## 23. Security
Across web/iOS/Android:
- server-side authorization,
- RLS where appropriate,
- no service-role secrets on clients,
- no committed secrets,
- secure session handling,
- input validation,
- rate-limit-ready auth boundaries,
- server-side password policy enforcement,
- webhook verification,
- server-side entitlement verification,
- purchase-gated workspace access,
- no client-only commercial-rule enforcement.

## 24. Test iOS and Android separately
Do not call mobile complete because Expo starts.

iOS:
- simulator during development,
- real iPhone before production where possible.

Android:
- emulator during development,
- real Android device before production where possible.

Test:
- launch/splash,
- onboarding,
- signup,
- email confirmation,
- login/logout,
- forgot/reset password deep link,
- password change,
- discovery swipe,
- search/city/category filters,
- favorites,
- provider profile,
- booking,
- packages,
- Premium gating,
- provider dashboard,
- calendar,
- CRM,
- messaging/workspace access,
- network errors,
- Turkish/English,
- loading/empty/error,
- accessibility,
- animation performance.

## 25. Performance and motion
- optimize lists/images,
- avoid unnecessary re-renders,
- use native-friendly animations,
- avoid blocking JS thread,
- smooth transitions,
- respect Reduce Motion,
- sparing haptics,
- fast startup.

## 26. Implementation order
1. Inspect repo/shared backend/domain
2. Create Expo/React Native foundation
3. Shared design tokens + branding
4. iOS/Android navigation
5. Auth + deep-link foundation
6. Student home/discovery/search/favorites
7. Swipe discovery
8. Provider/listing/profile
9. Booking/package flows
10. Student bookings/package progress
11. Provider onboarding/dashboard
12. Provider calendar/availability
13. Provider listings
14. Student CRM
15. Messaging/private workspace foundation
16. Settings/security/language
17. Premium UI + entitlement integration
18. RevenueCat later
19. Notifications foundation
20. iOS testing
21. Android testing
22. Cross-platform regression

## 27. Completion rule
Do not claim mobile complete if only screens or mock data exist.

Meaningful completion requires:
- real navigation,
- real backend integration,
- working auth,
- persisted state where applicable,
- critical flows connected,
- iOS and Android verification,
- passing tests,
- no known Critical/High blockers.

Mock payment providers are acceptable until approved real payment integration, but must be clearly labeled as mocks.

## 28. Product principle
Apoindar must not feel like:
- a generic course marketplace,
- a generic admin dashboard,
- a clone,
- a mobile website wrapped as an app.

It should feel recognizably Apoindar:
- warm,
- animated,
- intelligent,
- trustworthy,
- modern,
- enjoyable,
- visually memorable,
- commercially extensible,
- consistent across web, iOS, Android.
