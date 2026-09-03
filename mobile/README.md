# Apoindar Mobile (iOS + Android)

React Native + Expo client for Apoindar. Same backend, domain rules and business
logic as the web app (see `../CLAUDE.md` and docs `01`–`12`). Not a WebView.

## Stack

- Expo SDK 52, React Native 0.76, expo-router (file-based navigation)
- TypeScript strict (`noUncheckedIndexedAccess`, `noImplicitOverride`)
- react-native-reanimated + gesture-handler (swipe discovery)
- expo-secure-store (session token), custom lightweight i18n (TR default / EN)
- Shared zero-dependency modules from the web repo's `../lib` via the `@shared/*`
  alias (password policy, commerce constants) — one source of truth

## Run

```bash
cd mobile
npm install
# start the Apoindar web/API backend first (repo root): npm run dev
npm run ios       # or: npm run android
```

For a real device, set `EXPO_PUBLIC_API_URL` (see `.env.example`) and use
`npx expo start --tunnel`, then open in Expo Go or an EAS dev build.

## Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # jest (pure-logic + guard tests)
npm run doctor      # npx expo-doctor
```

## Structure

```
app/                     expo-router routes
  _layout.tsx            fonts, providers, deep-link stack
  index.tsx              branded logo reveal → route by session/role
  (auth)/                welcome, onboarding, login, signup, forgot-password
  auth/confirm|reset     email deep-link targets (never bounce to login)
  (student)/             tabs: home, search, discover, bookings, messages, profile
  (provider)/            tabs: dashboard, calendar, students, listings, earnings (+premium, more)
  providers/[id]         provider profile (shared)
  book/[listingId]       booking + mock checkout
  workspaces/[id]        purchased-package workspace (chat / tasks / progress / files)
  favorites, packages, edit-profile, provider-onboarding, settings/*
src/
  components/            branded UI kit (Screen, Button, ProviderCard, SwipeDeck, …)
  i18n/                  tr.ts / en.ts (key-parity enforced by a test)
  lib/                   api client, auth context, typed queries, hooks
  theme/                 Apoindar design tokens (mirrors 07-design-system)
```

## Deep links

- Scheme `apoindar://`; iOS Universal Links + Android App Links on `apoindar.app`.
- Backend serves `/.well-known/apple-app-site-association` and
  `/.well-known/assetlinks.json` (fill in `APPLE_TEAM_ID` / `ANDROID_CERT_SHA256`
  once the app is registered / signed).
- Email confirm & password-reset links resolve to `auth/confirm` / `auth/reset`
  which verify the token before routing — they never land on a generic login.

## Not done yet (later phases)

- Real RevenueCat purchasing (Premium UI + entitlement interfaces are in place;
  no billing). Marketplace lesson/package payments stay a separate domain.
- Push notifications (foundation only).
- Simulator/emulator run + real-device verification (no iOS/Android toolchain on
  the build machine).
