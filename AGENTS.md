# AGENTS.md — Commodity Trading App (Expo + React Native)

Single Expo app serving **two roles: Buyer and Seller**. One codebase, role-based routing — not two apps.
Prioritize mobile-first patterns, performance, and cross-platform (iOS / Android / Web) compatibility.

## Source of truth: HTML prototypes — DO NOT EDIT

- `Buyer App.html` and `Seller App.html` are bundled interactive mockups (open in a browser, JS required). They define the UX/flows. **Never edit them.**
- Extract domain knowledge from them into code instead:
  - Buyer flows: Home → Browse (By Commodity / By Seller) → Detail → orderBags → Negotiate (offers you/them) → brokerMode → confirmTrade/buyNow → Trades/Orders/PastTrades; plus Post req / MyRequirements, Freight, BasePrice, Profile.
  - Seller flows: Dashboard → Listings (CRUD) → Bulk price edit → BuyerRequirements → Offers/Negotiation → Broker → Trades/Orders → Earnings → Verification → Profile.
  - Domain entities: `CATEGORIES` (Besan, Dal, Matar, Chana, Rajma, Rice), `LISTINGS { id, category, item, quality, weight, seller, price }`, `ACTIVE_NEGOTIATIONS { offers: [{ by: 'you' | 'them', price }] }`, `BROKERS`, `FIRM_TERMS`, `FIRM_PAYMENT`.
- When implementing a screen, first port its mock data into `src/mocks/` + types into `src/types/domain.ts`, build UI against mocks, then wire API later.

## Expo SDK — do not trust training data

This project is on **Expo SDK ~57** (`package.json`: `expo ~57.0.24`, React 19, `expo-router ~57.0.22`). Expo ships breaking changes every release. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v57.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present). This repo uses npm (`package-lock.json`), so `npx`.

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run **lint + typecheck** before declaring any task done. This template has no `test` script — do not claim tests pass without running them.

## Navigation & Routing (Expo Router)

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, `useLocalSearchParams`, `Redirect` from `expo-router`.
- Role-based route groups (single app, role switches at runtime after login/role-select):
  - `src/app/(auth)/` — login, register, role-select, verify-otp, forgot/reset-password
  - `src/app/(buyer)/(tabs)/` — home, browse, orders (trades), requirements, profile
  - `src/app/(seller)/(tabs)/` — dashboard, listings, orders, earnings, profile
  - `src/app/(shared)/` — chat, notifications, settings, freight, help/terms/privacy
- **Thin routes rule:** route files only compose + guard + parse params. All UI/logic lives in `src/features/<domain>/`. Never put business logic directly in `src/app/`.
- Auth/role guards live in group `_layout.tsx` files (redirect unauthenticated → `/(auth)/login`, wrong role → their home). No guard duplication in individual screens.
- Deep-linkable detail routes use bracket params: `browse/[id].tsx`, `listing/[id].tsx`, `order/[id].tsx`, `chat/[id].tsx`.
- Docs: https://docs.expo.dev/router/introduction.md

## Architecture — lean feature-based (see ARCHITECTURE.md, simplified)

`ARCHITECTURE.md` is the long-term target but is **over-scaffolded** (~200 files upfront: `screens/` + `components/` + `hooks/` + `api/` + `types/` per sub-screen). Do not create all of it at once. Build in this order:

1. `src/types/domain.ts` — Listing, Offer, Negotiation, Requirement, Order, Broker, User/Role (ported from HTML prototypes).
2. `src/mocks/` — `listings.ts`, `negotiations.ts`, `requirements.ts`, `brokers.ts` (ported from `LISTINGS`, `ACTIVE_NEGOTIATIONS`, `REQ_CATEGORIES`, `BROKERS` in the prototypes).
3. `src/features/<domain>/` — one folder per domain (`browse`, `negotiation`, `requirements`, `listings`, `orders`, `auth`, `chat`), each colocating `components/`, `hooks/`, `api.ts`, `schemas.ts` **only as needed**. Start with components + hooks; add `api.ts`/`schemas.ts` when the backend contract exists.
4. `src/components/ui/` + `src/components/common/` — only genuinely shared primitives (Button, Input, Card, EmptyState, BusinessCard, Rating). Feature-specific UI stays in the feature folder.
5. `src/core/` (or `src/lib/`) — `api/client.ts`, `auth/session.ts`, `storage/`, `config/env.ts`, `utils/` (currency/weights/qty formatting, validation). Add files lazily.
6. `src/theme/` — `colors.ts`, `typography.ts`, `spacing.ts` tokens; no hardcoded colors/spacing in screens.

Rules:

- One domain concept = one feature folder. Never duplicate Buyer/Seller copies of the same component (OrderCard, ListingCard) — parameterize by role.
- Mock-first: every screen renders from `src/mocks/` until its API exists. API functions take/return domain types, so swapping mock → fetch is a one-line change in the hook.
- State: server state via fetch hooks (add TanStack Query only when real backend + caching need arises); client/session state (role, bags, offer drafts, broker choice) in a small store; forms with controlled inputs + zod schemas at feature boundaries (auth, listing create/edit, post-requirement, offers).
- Never create `ios/` or `android/` by hand (Continuous Native Generation) — configure native behavior in `app.json` and config plugins.

## UI / Performance best practices

- `expo-image` for all images, `FlashList` (not `FlatList`) for listings/orders/chat, `react-native-reanimated` for animations already in deps.
- Forms: keyboard-aware views, numeric keyboards for price/qty/weight, inline validation errors, optimistic toasts for offer accept/decline/confirm-trade.
- Money/weights: central formatters (`priceLabel`, quintal/kg) in core utils — prototypes show price-per-unit labels everywhere; keep them consistent.
- Safe-area + portrait layout; test on web + one native target. Commodity cards must render at small widths (dense price/qty text).

## Secrets & config

- Tokens in `expo-secure-store`, prefs in AsyncStorage, API base URL in env (`EXPO_PUBLIC_*`). Never hardcode endpoints or commit `.env`.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
- Path alias `@/*` maps to `src/*` — always import via `@/`, never deep relative `../../../`.
- TypeScript strict: no `any` at feature boundaries, validate all backend payloads with schemas.
