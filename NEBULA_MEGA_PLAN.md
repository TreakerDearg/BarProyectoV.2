# NEBULA Mega Plan — Complete Implementation Documentation

> **Bartender System** · Full Redesign & Rewards Engine
> Last updated after FEAT-005 completion.

---

## Executive Summary

### Vision & Goals

The Nebula redesign transforms a functional bar management platform into a **cinematic, mobile-first experience** inspired by premium nightlife. The core design language — deep dark backgrounds, gold accents, Outfit typography, and micro-animations — creates the "Nocturne Gastronomy" aesthetic: a bar that feels alive at midnight.

### Scope & Architecture

The project touches three platforms simultaneously: the **mobile client** (React Native / Expo) for guests at the bar, the **backend API** (Express 5 + MongoDB, ES Modules) for business logic and data persistence, and the **desktop app** (Electron + React + Vite) for bartenders and managers. All 21 tasks are organized across 6 phases, from design-system tokens and component rewrites to a full rewards/points engine and cinematic roulette.

### Points & Rewards System

The centerpiece of FEAT-005 is a loyalty loop: guests earn points automatically when they spin the roulette or place orders, see their balance on a tier-based LoyaltyCard, and can redeem points for real rewards (free drinks, experiences, discounts) via an in-app catalog. Points are optimistically updated on the mobile client with Zustand + AsyncStorage, and durably persisted on the backend in MongoDB's `UserPoints` collection.

---

## Task Table

| Task ID | Description | Platform | Key Files | Status |
|---------|-------------|----------|-----------|--------|
| T0 | Fix `spinPublicRoulette()` response mapping | Mobile | `mobile-client/src/api/rouletteApi.ts` | ✅ DONE |
| T1a | Extend `NocturneColors` with new tokens | Mobile | `mobile-client/src/theme/colors.ts` | ✅ DONE |
| T1b | Add spacing tokens to `Spacing` | Mobile | `mobile-client/src/theme/spacing.ts` | ✅ DONE |
| T2 | Redesign `AppNavigator` tab bar + cart badge | Mobile | `mobile-client/src/navigation/AppNavigator.tsx` | ✅ DONE |
| T3 | Create `HeroCarousel` component | Mobile | `mobile-client/src/components/HeroCarousel.tsx` | ✅ DONE |
| T4 | Create `CategoryHeroRow` component | Mobile | `mobile-client/src/components/CategoryHeroRow.tsx` | ✅ DONE |
| T5 | Create `ProductGridCard` component | Mobile | `mobile-client/src/components/shared/ProductGridCard.tsx` | ✅ DONE |
| T6 | Create `CartItemRow` component | Mobile | `mobile-client/src/components/shared/CartItemRow.tsx` | ✅ DONE |
| T7 | Add countdown + EPIC/LEGENDARY tint to RouletteScreen | Mobile | `mobile-client/src/screens/RouletteScreen.tsx` | ✅ DONE |
| T8 | Improve `MobileWheel` SVG (rings, rivets, shimmer, hub) | Mobile | `mobile-client/src/components/roulette/MobileWheel.tsx` | ✅ DONE |
| T9a | Create `RevealExplosion` particle component | Mobile | `mobile-client/src/components/roulette/RevealExplosion.tsx` | ✅ DONE |
| T9b | Add slide-up + shimmer + countdown color to `GoldenTicket` | Mobile | `mobile-client/src/components/roulette/GoldenTicket.tsx` | ✅ DONE |
| T10 | Rewrite `CartaScreen` to FlatList 2-col grid | Mobile | `mobile-client/src/screens/CartaScreen.tsx` | ✅ DONE |
| T11 | Update `PedidoScreen` with CartItemRow + UpsellRow | Mobile | `mobile-client/src/screens/PedidoScreen.tsx` | ✅ DONE |
| T12a | Create `LoyaltyCard` component | Mobile | `mobile-client/src/components/shared/LoyaltyCard.tsx` | ✅ DONE |
| T12b | Add LoyaltyCard to `AccountScreen` | Mobile | `mobile-client/src/screens/AccountScreen.tsx` | ✅ DONE |
| T13 | Redesign `HomeScreen` with HeroCarousel + CategoryHeroRow | Mobile | `mobile-client/src/screens/HomeScreen.tsx` | ✅ DONE |
| T14a | Create `Reward` Mongoose model | Backend | `backend/src/models/Reward.js` | ✅ DONE |
| T14b | Create `UserPoints` Mongoose model | Backend | `backend/src/models/UserPoints.js` | ✅ DONE |
| T14c | Create `points.js` utility (addPoints / deductPoints) | Backend | `backend/src/utils/points.js` | ✅ DONE |
| T15a | Create `reward.controller.js` (7 handlers) | Backend | `backend/src/controllers/reward.controller.js` | ✅ DONE |
| T15b | Create `reward.routes.js` | Backend | `backend/src/routes/reward.routes.js` | ✅ DONE |
| T15c | Register rewards routes in `routes/index.js` | Backend | `backend/src/routes/index.js` | ✅ DONE |
| T16a | Add points to roulette spin | Backend | `backend/src/controllers/roulette.controller.js` | ✅ DONE |
| T16b | Add points to order creation (fire-and-forget) | Backend | `backend/src/controllers/order.controller.js` | ✅ DONE |
| T17a | Desktop rewards types | Desktop | `bartender-desktop/src/modules/rewards/types/reward.ts` | ✅ DONE |
| T17b | Desktop rewards service | Desktop | `bartender-desktop/src/modules/rewards/services/rewardService.ts` | ✅ DONE |
| T17c | Desktop `useRewards` hook | Desktop | `bartender-desktop/src/modules/rewards/hooks/useRewards.ts` | ✅ DONE |
| T17d | Desktop `RewardCard` component | Desktop | `bartender-desktop/src/modules/rewards/components/RewardCard.tsx` | ✅ DONE |
| T17e | Desktop `RewardForm` component | Desktop | `bartender-desktop/src/modules/rewards/components/RewardForm.tsx` | ✅ DONE |
| T17f | Desktop `RedemptionsLog` component | Desktop | `bartender-desktop/src/modules/rewards/components/RedemptionsLog.tsx` | ✅ DONE |
| T17g | Desktop `RewardsPage` | Desktop | `bartender-desktop/src/modules/rewards/pages/RewardsPage.tsx` | ✅ DONE |
| T17h | Register rewards in Sidebar + AppRouter | Desktop | `bartender-desktop/src/components/ui/Sidebar.tsx`, `AppRouter.tsx` | ✅ DONE |
| T18a | Create `rewardApi.ts` in mobile | Mobile | `mobile-client/src/api/rewardApi.ts` | ✅ DONE |
| T18b | Create/update `usePointsStore` with movements | Mobile | `mobile-client/src/stores/usePointsStore.ts` | ✅ DONE |
| T19a | Create `RewardsCatalog` modal component | Mobile | `mobile-client/src/components/shared/RewardsCatalog.tsx` | ✅ DONE |
| T19b | Finish `AccountScreen` with catalog + movements log | Mobile | `mobile-client/src/screens/AccountScreen.tsx` | ✅ DONE |
| T20a | RouletteScreen: add points toast after spin | Mobile | `mobile-client/src/screens/RouletteScreen.tsx` | ✅ DONE |
| T20b | PedidoScreen: add points after order submission | Mobile | `mobile-client/src/screens/PedidoScreen.tsx` | ✅ DONE |
| T21 | Create this documentation file | Docs | `NEBULA_MEGA_PLAN.md` | ✅ DONE |

---

## Points System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER ACTIONS (earn points)                  │
│                                                                  │
│  🎡 Spin Roulette          🛒 Place Order                       │
│  COMMON: +5 pts            +5 pts per item                      │
│  RARE: +15 pts                                                   │
│  EPIC: +40 pts                                                   │
│  LEGENDARY: +100 pts                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + MongoDB)                   │
│                                                                  │
│  addPoints(userId, amount, description)                         │
│       ↓                                                          │
│  UserPoints.findOneAndUpdate({ user }, {                        │
│    $inc: { balance, totalEarned },                              │
│    $push: { movements: { type:'earn', amount, ... } }           │
│  }, { upsert: true })                                            │
│                                                                  │
│  ┌──────────────────────────────────────┐                       │
│  │  UserPoints (MongoDB)                │                       │
│  │  ─────────────────────────────────   │                       │
│  │  user:         ObjectId (ref User)   │                       │
│  │  balance:      Number (≥ 0)          │                       │
│  │  totalEarned:  Number                │                       │
│  │  totalRedeemed: Number               │                       │
│  │  movements:    Array (max 100)       │                       │
│  └──────────────────────────────────────┘                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │  GET /rewards/my-points
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                 MOBILE CLIENT (Zustand + AsyncStorage)           │
│                                                                  │
│  usePointsStore                                                  │
│  ─────────────────────────────────                              │
│  balance, totalEarned, totalRedeemed, movements[]               │
│                                                                  │
│  addLocal(amount, description)  ← optimistic, immediate         │
│  loadPoints()                   ← syncs from backend            │
│                                                                  │
│  persisted to AsyncStorage key: 'nebula-points-storage'         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        UI DISPLAY                               │
│                                                                  │
│  LoyaltyCard     — balance + tier + progress bar                │
│  AccountScreen   — movements log (last 3)                       │
│  RewardsCatalog  — browse & redeem rewards                      │
│  RouletteScreen  — "+N pts ganados" toast after spin            │
│  PedidoScreen    — silent points add after order                │
└─────────────────────────────────────────────────────────────────┘
                           │  REDEEM
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              REDEEM FLOW                                        │
│                                                                  │
│  User selects reward → POST /rewards/redeem/:id                 │
│  Backend: validates balance ≥ cost, deductPoints(),             │
│           pushes redemption record on Reward doc                │
│  Mobile:  addLocal(-cost, ...) → optimistic balance update      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sample Rewards Catalog

| Name | Description | Points Cost | Category |
|------|-------------|-------------|----------|
| Cóctel de la Casa | Un cóctel signature elegido por el bartender | 150 | drink |
| Gin Tónico Premium | Gin artesanal con tónica premium y botánicos | 200 | drink |
| Tabla de Snacks | Selección de picadas para 2 personas | 180 | food |
| Postre del Chef | Postre de temporada elegido por cocina | 120 | food |
| Clase de Mixología | 45 min con el head bartender aprendiendo técnicas | 500 | experience |
| Bar Tour Privado | Recorrido privado de los destilados de la casa | 400 | experience |
| 20% Off en tu próxima visita | Descuento aplicado automáticamente en barra | 100 | discount |
| 2x1 en Shots | Comprá 1 shot y llevate 2 en cualquier opción | 80 | discount |
| Botella de Vino de Temporada | Vino seleccionado por el sommelier del mes | 350 | special |
| Cumpleaños Nebula | Decoración + shot + postre para tu mesa | 300 | special |

---

## Technical Decisions

### Why Zustand persist with AsyncStorage

React Native doesn't have `localStorage`. Zustand's `persist` middleware with `createJSONStorage(() => AsyncStorage)` provides the same DX as web persist but writes to the device's async key-value store. This means points and movements survive app restarts without a network call, and the UI feels instant.

### Why soft delete on Rewards

Admin-deleted rewards may still appear in redemption history. Using `deleted: Boolean` (default `false`) lets us keep the data integrity of historical redemptions while hiding the reward from active catalogs (`Reward.find({ active: true, deleted: false })`). Hard deletes would orphan redemption records.

### Points capped at 100 movements

MongoDB documents have a practical 16 MB size limit. An unbounded movements array could grow indefinitely for active users. The `pre-save` hook trims `movements` to the last 100 entries. On the mobile client, `addLocal` slices to 50 — a smaller cap since only recent activity is relevant for the UI.

### Frontend-optimistic point updates

When a user earns or redeems points, the UI updates immediately via `addLocal()` without waiting for the next API sync. This eliminates perceived latency. The trade-off is that the mobile count could drift from the backend if a request fails. `loadPoints()` is called on `AccountScreen` mount to re-sync, closing any gap. The roulette and order endpoints award points server-side regardless, so the backend count is always authoritative.

### ES Modules in backend

The project uses `"type": "module"` in `backend/package.json`, requiring `.js` extensions on all imports. This aligns with the Node.js ESM spec and eliminates the CommonJS/ESM interop friction that appears in hybrid setups.

### Fire-and-forget for order points

Order point awards in `order.controller.js` use `.catch(logger.warn)` without `await`. This keeps the order API response fast — the guest gets confirmation immediately — and degrades gracefully if the points service is temporarily unavailable. Points will still appear on the next `loadPoints()` sync if the DB write eventually succeeds.

---

## Category Color Guide for CategoryHeroRow

| Category | Background | Accent | Badge |
|----------|-----------|--------|-------|
| Cócteles | `rgba(168,85,247,0.15)` (purple) | `#a855f7` | `rgba(168,85,247,0.25)` |
| Cervezas | `rgba(245,158,11,0.15)` (amber) | `#f59e0b` | `rgba(245,158,11,0.25)` |
| Shots | `rgba(249,115,22,0.15)` (orange) | `#f97316` | `rgba(249,115,22,0.25)` |
| Vinos | `rgba(239,68,68,0.15)` (red) | `#ef4444` | `rgba(239,68,68,0.25)` |
| Sin Alcohol | `rgba(6,182,212,0.15)` (cyan) | `#06b6d4` | `rgba(6,182,212,0.25)` |
| Snacks | `rgba(34,197,94,0.15)` (green) | `#22c55e` | `rgba(34,197,94,0.25)` |
| Especiales | `rgba(212,163,64,0.15)` (gold) | `#D4A340` | `rgba(212,163,64,0.25)` |
| Temporada | `rgba(236,72,153,0.15)` (pink) | `#ec4899` | `rgba(236,72,153,0.25)` |
| Ruleta ⭐ | `rgba(243,190,89,0.20)` (gold bright) | `#f3be59` | `rgba(243,190,89,0.35)` |

---

## Project Structure Overview

```
bartender-system/
├── backend/                        # Express 5 + MongoDB (ES Modules)
│   └── src/
│       ├── models/
│       │   ├── Reward.js           # Rewards catalog
│       │   └── UserPoints.js       # Per-user points + movements
│       ├── utils/
│       │   └── points.js           # addPoints / deductPoints helpers
│       ├── controllers/
│       │   ├── reward.controller.js
│       │   └── roulette.controller.js  # (modified: awards points)
│       └── routes/
│           └── reward.routes.js
│
├── bartender-desktop/              # Electron + React + Vite
│   └── src/modules/rewards/
│       ├── types/reward.ts
│       ├── services/rewardService.ts
│       ├── hooks/useRewards.ts
│       ├── components/
│       │   ├── RewardCard.tsx
│       │   ├── RewardForm.tsx
│       │   └── RedemptionsLog.tsx
│       └── pages/RewardsPage.tsx
│
└── mobile-client/                  # React Native (Expo)
    └── src/
        ├── api/
        │   └── rewardApi.ts        # getPublicRewards / getMyPoints / redeemReward
        ├── stores/
        │   └── usePointsStore.ts   # Zustand + AsyncStorage
        ├── components/shared/
        │   ├── LoyaltyCard.tsx     # Tier card (Bronze→Platinum)
        │   └── RewardsCatalog.tsx  # Full-screen rewards modal
        └── screens/
            ├── AccountScreen.tsx   # + catalog button + movements log
            ├── RouletteScreen.tsx  # + points toast after spin
            └── PedidoScreen.tsx    # + points after order submission
```
