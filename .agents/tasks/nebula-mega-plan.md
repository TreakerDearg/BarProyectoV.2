# Implementation Plan — Nebula Mega Plan

This plan covers all 21 tasks in 6 phases. It is structured into 5 separable
features (FEATs) that are implemented sequentially. Each FEAT leaves the
codebase buildable and testable.

The FEAT artifacts live under `.agents/tasks/nebula-mega-plan/`. Coder steps
read `context.json` first to avoid re-exploring the project.

---

## Phase 0 — Bug Fix

- [ ] **T0** — Fix `spinPublicRoulette()` in `mobile-client/src/api/rouletteApi.ts`.
  The backend `POST /roulette/public/spin` response wraps the result in
  `data.result` (not `data.selected`). See `roulette.controller.js` lines
  "payload = { result: enriched, meta: … }" and the return `ok(res, payload)`.
  Replace the function signature to return
  `{ selected: RouletteDrinkDTO; probability: number; pointsEarned?: number }`
  and map: `selected = res.data.data.result`, `probability = res.data.data.meta.totalWeight`
  (actually probability is on the drink itself via `selected.probability`),
  `pointsEarned = res.data.data.meta?.pointsEarned ?? 0`.

  **Files:** `mobile-client/src/api/rouletteApi.ts`
  **Verify:** `cd mobile-client && npx expo export --platform android --dev` must
  complete without TypeScript errors on that file.

---

## Phase 1 — Design System Tokens

- [ ] **T1a** — Extend `NocturneColors` in `mobile-client/src/theme/colors.ts`
  with: `surfaceElevated`, `goldSubtle`, `cardBorderActive`, `overlayDark`,
  `badgeRed`, `casinoBackground`, `casinoPurple`, `casinoGold`, `infoMuted`.
  Add matching aliases to the `Colors` export object. Existing keys must
  **not** be removed or renamed.

  **Files:** `mobile-client/src/theme/colors.ts`
  **Verify:** TypeScript compilation — `cd mobile-client && npx tsc --noEmit`

- [ ] **T1b** — Add new spacing tokens to `Spacing` in
  `mobile-client/src/theme/spacing.ts`:
  `heroCarouselHeight: 220`, `categoryPillSize: 72`, `gridGap: 10`,
  `tabBarHeightNew: 72`.

  **Files:** `mobile-client/src/theme/spacing.ts`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

---

## Phase 2 — New Base Components

- [ ] **T2** — Modify `mobile-client/src/navigation/AppNavigator.tsx`:
  - Import `useCartStore` from `../stores/useCartStore`.
  - `tabBarStyle`: change `backgroundColor` to `Colors.surfaceElevated` (new token),
    `borderTopColor` to `Colors.goldBorder`, add `elevation: 16`, iOS shadows
    (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`),
    `height` to `Spacing.tabBarHeightNew + insets.bottom`.
  - Active indicator pill: change `width: 20, height: 4` → `width: 40, height: 3`.
  - Add `tabBarLabelStyle` with font size 10 and letter-spacing.
  - On the `Pedidos` tab item, render a red badge when
    `useCartStore(s => s.cart.length) > 0`.

  **Files:** `mobile-client/src/navigation/AppNavigator.tsx`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T3** — Create `mobile-client/src/components/HeroCarousel.tsx`.
  - `FlatList` with `horizontal`, `pagingEnabled`, `showsHorizontalScrollIndicator={false}`.
  - `useRef` + `setInterval` at 3200 ms calls `flatListRef.current?.scrollToIndex`.
  - Animated dot row below the carousel (opacity/scale on active dot).
  - Fallback single slide rendered when `slides` prop is empty.
  - Props interface: `slides: Array<{ id: string; imageUri?: string; title: string; subtitle?: string; onPress?: () => void }>`.

  **Files:** `mobile-client/src/components/HeroCarousel.tsx` (create)
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T4** — Create `mobile-client/src/components/CategoryHeroRow.tsx`.
  - `ScrollView` horizontal, no scroll indicator.
  - Each pill: 72×72 dp, `borderRadius: Radius.full`, category-specific background
    color (define a `CATEGORY_COLORS` map keyed by category string).
  - Active pill: `borderWidth: 2, borderColor: Colors.goldBorder`, `scale: 1.08`
    via `Animated.spring`.
  - Last pill is always the "Ruleta" pill (special gold color).
  - Props: `categories`, `activeCategory`, `onSelect`, `onRuletaPress`.

  **Files:** `mobile-client/src/components/CategoryHeroRow.tsx` (create)
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T5** — Create `mobile-client/src/components/shared/ProductGridCard.tsx`.
  - Grid card for 2-column `FlatList`. Image aspect ratio 4:3 using `aspectRatio`.
  - Heart/favorite button top-right via `useFavoritesStore`.
  - Qty +/− stepper in bottom-right corner; press animation via `Animated.spring`.
  - Props: `product: ProductPublicDTO`, `isFavorite: boolean`, `cartQty: number`,
    `onAdd`, `onRemove`, `onFavorite`, `onPress`.

  **Files:** `mobile-client/src/components/shared/ProductGridCard.tsx` (create)
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T6** — Create `mobile-client/src/components/shared/CartItemRow.tsx`.
  - Horizontal row: 56×56 image thumbnail, product name + notes, qty stepper.
  - When qty becomes 1 and user presses `−`, show trash icon instead (calls
    `onRemove`). Swipe-to-delete not required.
  - Props: `item: CartLine`, `onIncrement`, `onDecrement`, `onRemove`.

  **Files:** `mobile-client/src/components/shared/CartItemRow.tsx` (create)
  **Verify:** `cd mobile-client && npx tsc --noEmit`

---

## Phase 3 — Screen Redesigns

- [ ] **T10** — Rewrite `mobile-client/src/screens/CartaScreen.tsx`:
  - Replace `ScrollView` with `FlatList numColumns={2}`.
  - `ListHeaderComponent` renders: search bar + `CategoryHeroRow`.
  - `renderItem` uses the new `ProductGridCard`.
  - Keep existing `FloatingCartBar`, `ModifierModal`, `ProductCustomizerSheet`,
    `NToast`, and `NEmptyState` usage intact.
  - Remove the old `SommelierCard` + `CompactProductRow` pattern from inside
    the list (keep them available as imports for header/special sections).

  **Files:** `mobile-client/src/screens/CartaScreen.tsx`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T11** — Modify `mobile-client/src/screens/PedidoScreen.tsx`:
  - In `CartView`, replace the current inline item rendering with `CartItemRow`
    from `../components/shared/CartItemRow`.
  - Add a `~15 min` delivery-time badge in the `CartView` header row.
  - After the main cart items, render an `UpsellRow` — horizontal `FlatList` of
    2-3 featured products (fetched from `getPublicProducts`, filtered
    `featured && available`, sliced to 3). Use a compact card style.
  - Update the submit button label:
    `submitting ? 'Enviando comanda...' : `Confirmar Pedido · ${fmtPrice(total)}``.

  **Files:** `mobile-client/src/screens/PedidoScreen.tsx`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T12a** — Create `mobile-client/src/components/shared/LoyaltyCard.tsx`:
  - Full-width card with a diagonal color overlay (use `transform: [{ rotate: '-15deg' }]`
    on an absolutely positioned `View`).
  - Level system: map `balance` to `Bronze (<500) / Silver (500-1999) / Gold (2000-4999) / Platinum (5000+)`.
  - Animated `ProgressBar` showing progress to next level.
  - Last 4 chars of user ID shown as card number: `**** **** ${userId.slice(-4)}`.
  - Props: `balance: number`, `totalEarned: number`, `userId: string`.

  **Files:** `mobile-client/src/components/shared/LoyaltyCard.tsx` (create)
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T12b** — Modify `mobile-client/src/screens/AccountScreen.tsx`:
  - Import `LoyaltyCard` and `usePointsStore` (created in T18b).
  - In the logged-in `ScrollView`, insert `<LoyaltyCard ...>` at the top,
    after the hero section, before `liveOrderBanner`.
  - Load points via `usePointsStore.getState().loadPoints()` in `useEffect`
    alongside the existing `fetchHistory()` call.
  - Pass `balance` and `totalEarned` from `usePointsStore` to `LoyaltyCard`.

  **Files:** `mobile-client/src/screens/AccountScreen.tsx`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T13** — Modify `mobile-client/src/screens/HomeScreen.tsx`:
  - `topBar`: set `backgroundColor: NocturneColors.surfaceElevated` (new token).
  - Replace `<PromoBanner>` / `<PromoBannerFallback>` with `<HeroCarousel>`
    (imported from `../components/HeroCarousel`), passing `promos` mapped to
    the `slides` prop shape.
  - Replace `<CategoryPills>` in the "Explorar la carta" section with
    `<CategoryHeroRow>`.
  - Remove the `QuickActionCard` row; its navigation functions remain.
  - Add "Lo más pedido" section: render featured products (`featuredProducts`)
    limited to 4, using `ProductGridCard` in a 2-col layout.
  - Limit Sommelier cards to 2 (`featuredProducts.slice(0, 2)`).
  - Redesign Roulette CTA card: render an idle `<MobileWheel>` decoration
    (size=80, static `spinAnim` value = `new Animated.Value(0)`) on the right
    side instead of the `RotateCw` button.

  **Files:** `mobile-client/src/screens/HomeScreen.tsx`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

---

## Phase 4 — Cinematic Roulette

- [ ] **T7** — Modify `mobile-client/src/screens/RouletteScreen.tsx`:
  - Add `countdown` state: `number | null`. On `handleSpin()`, set `countdown = 3`,
    then use `setTimeout` chain to decrement to 2, 1, then `null` (each 900 ms),
    after which the API call proceeds.
  - Render a full-screen semi-transparent overlay with the countdown digit when
    `countdown !== null`. Animate scale+opacity with `Animated.spring`.
  - For EPIC/LEGENDARY results: after `setSpinState('result')`, run a
    `Animated.sequence` that pulses `backgroundColor` of the safe area to a
    tinted color (EPIC → purple tint; LEGENDARY → gold tint) via
    `Animated.timing` on a separate `bgTintAnim` value.
  - Set `safe` background to `NocturneColors.casinoBackground` when in
    spinning/revealing/result states for EPIC+.
  - Update all new styles referencing the new tokens from T1a/T1b.

  **Files:** `mobile-client/src/screens/RouletteScreen.tsx`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T8** — Modify `mobile-client/src/components/roulette/MobileWheel.tsx`:
  - Add **triple gold ring**: three `<Circle>` elements with radii at `r`, `r+3`,
    `r+6`, strokes `#D4A340`, `rgba(212,163,64,0.5)`, `rgba(212,163,64,0.2)`,
    `strokeWidth` 1.5, 1, 0.5 respectively. Placed outside the `AnimatedG`.
  - Add **24 gold rivets**: evenly spaced `<Circle r={3}>` elements at radius
    `r + 2`, fill `#D4A340`, placed after the ring circles.
  - Add **shimmer overlay path** per segment: a second `<Path>` using the same
    `arcPath()` but with `fill="url(#shimmer)"` and opacity 0.18. Define a
    `<LinearGradient id="shimmer">` inside `<Defs>`.
  - Improve **hub**: increase `hubR` to `size / 7`, add a concentric inner
    circle, render an "N" `<SvgText>` isotipo in the center (`fontSize: size*0.07`).
  - Improve **pointer**: use a `<Path>` for a diamond-tip shape instead of
    `<Polygon>`; add a shadow via a slightly offset darker copy behind it.

  **Files:** `mobile-client/src/components/roulette/MobileWheel.tsx`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T9a** — Create `mobile-client/src/components/roulette/RevealExplosion.tsx`:
  - Particle burst: spawn N circles (N = 12 COMMON, 18 RARE, 24 EPIC, 36 LEGENDARY)
    using `useRef` array of `Animated.ValueXY`. On mount, run
    `Animated.stagger(30, particles.map(p => Animated.parallel([...]))).start()`.
  - LEGENDARY only: additionally render 3 SVG concentric `<Circle>` rings
    (using `react-native-svg`) that expand outward via `Animated.timing`, and
    8 radial `<Line>` rays emanating from center.
  - Props: `rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'`, `visible: boolean`.
  - Rendered as an absolutely-positioned overlay over the wheel area in
    `RouletteScreen` when `spinState === 'result'`.

  **Files:** `mobile-client/src/components/roulette/RevealExplosion.tsx` (create)
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T9b** — Modify `mobile-client/src/components/roulette/GoldenTicket.tsx`:
  - Add slide-up spring animation: on mount, run
    `Animated.spring(slideAnim, { toValue: 0, friction: 7 }).start()` where
    `slideAnim` starts at `100` and the card uses
    `transform: [{ translateY: slideAnim }]`.
  - Add shimmer loop: a `LinearGradient` overlay (import from
    `expo-linear-gradient` if available, else use RN `View` with opacity) that
    slides right continuously via `Animated.loop(Animated.timing(...))`.
  - Countdown turns red when `remainingMs < 300_000` (5 minutes).

  **Files:** `mobile-client/src/components/roulette/GoldenTicket.tsx`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

---

## Phase 5 — Rewards System

### Backend

- [ ] **T14a** — Create `backend/src/models/Reward.js`:
  ```
  Fields: name(String,req), description(String), image(String),
  pointsCost(Number,req,min:1), category(String,enum:[drink,food,experience,discount]),
  product(ObjectId ref Product), discountPercent(Number,min:0,max:100),
  stock(Number,default:-1 = unlimited), active(Boolean,default:true),
  validFrom(Date), validUntil(Date),
  redemptions:[{user:ObjectId,redeemedAt:Date,orderId:ObjectId}],
  deleted(Boolean,default:false)
  ```
  Use ES Module `export default`.

  **Files:** `backend/src/models/Reward.js` (create)
  **Verify:** `cd backend && node --input-type=module --eval "import './src/models/Reward.js'; console.log('ok')"` exits 0.

- [ ] **T14b** — Create `backend/src/models/UserPoints.js`:
  ```
  Fields: user(ObjectId ref User, unique, req),
  balance(Number,default:0,min:0), totalEarned(Number,default:0),
  totalRedeemed(Number,default:0),
  movements:[{type:String enum[earn,redeem,expire,adjust],
              amount:Number, description:String, ref:ObjectId,
              refModel:String, createdAt:Date}]
  ```
  Movements array capped at 100 entries (use pre-save hook: if > 100, shift oldest).

  **Files:** `backend/src/models/UserPoints.js` (create)
  **Verify:** `cd backend && node --input-type=module --eval "import './src/models/UserPoints.js'; console.log('ok')"` exits 0.

- [ ] **T14c** — Create `backend/src/utils/points.js`:
  ```js
  export async function addPoints(userId, amount, description, refId, refModel)
  export async function deductPoints(userId, amount, description, refId, refModel)
  ```
  `addPoints` upserts the `UserPoints` doc (findOneAndUpdate with upsert:true),
  increments `balance` and `totalEarned`, pushes a movement, trims to 100.
  `deductPoints` checks `balance >= amount`, decrements, increments `totalRedeemed`,
  pushes movement. Both return the updated `UserPoints` doc.
  Import `UserPoints` with `.js` extension (ES Modules).

  **Files:** `backend/src/utils/points.js` (create)
  **Verify:** `cd backend && node --input-type=module --eval "import './src/utils/points.js'; console.log('ok')"` exits 0.

- [ ] **T15a** — Create `backend/src/controllers/reward.controller.js`:
  Seven handlers using `asyncHandler` from `../middlewares/asyncHandler.js` and
  response helpers from `../utils/response.js`:
  - `getPublicRewards`: `Reward.find({ active:true, deleted:false })`, filter
    by date validity, do not expose `redemptions`.
  - `getRewards` (admin): full list including inactive/deleted.
  - `createReward` / `updateReward` / `deleteReward` (soft): standard CRUD.
  - `getMyPoints`: requires `req.user.id`; calls
    `UserPoints.findOne({ user: req.user.id })`, returns `balance, totalEarned, totalRedeemed, movements`.
  - `redeemReward`: validate stock, balance ≥ pointsCost, call `deductPoints`,
    push redemption entry, return `{ reward, pointsEarned: -reward.pointsCost, balance }`.

  **Files:** `backend/src/controllers/reward.controller.js` (create)
  **Verify:** `cd backend && node --input-type=module --eval "import './src/controllers/reward.controller.js'; console.log('ok')"` exits 0.

- [ ] **T15b** — Create `backend/src/routes/reward.routes.js`:
  ```
  GET  /public          → getPublicRewards        (no auth)
  GET  /my-points       → getMyPoints             (protect)
  POST /redeem/:id      → redeemReward            (protect)
  GET  /                → getRewards              (adminOnly)
  POST /                → createReward            (adminOnly)
  PATCH/:id             → updateReward            (adminOnly)
  DELETE/:id            → deleteReward            (adminOnly)
  ```
  Import `protect`, `authorizeRoles` from `../middlewares/auth.middleware.js`.
  `adminOnly = [protect, authorizeRoles('admin', 'manager')]`.

  **Files:** `backend/src/routes/reward.routes.js` (create)
  **Verify:** `cd backend && node --input-type=module --eval "import './src/routes/reward.routes.js'; console.log('ok')"` exits 0.

- [ ] **T15c** — Register rewards routes in `backend/src/routes/index.js`:
  Add `import rewardRoutes from './reward.routes.js'` and
  `router.use('/rewards', rewardRoutes)` after the existing `roulette` entry.

  **Files:** `backend/src/routes/index.js`
  **Verify:** `cd backend && node --input-type=module --eval "import './src/routes/index.js'; console.log('ok')"` exits 0.

- [ ] **T16a** — Modify `backend/src/controllers/roulette.controller.js`:
  - Import `addPoints` from `../utils/points.js`.
  - Define `RARITY_POINTS = { COMMON: 5, RARE: 15, EPIC: 40, LEGENDARY: 100 }`.
  - After `await createLog(...)` in `spinRoulette`, add:
    ```js
    let pointsEarned = 0;
    if (userId) {
      pointsEarned = RARITY_POINTS[selected.rarity] ?? 5;
      await addPoints(userId, pointsEarned, `Ruleta: ${selected.name} [${selected.rarity}]`,
                      selected._id, 'RouletteDrink');
    }
    ```
  - Set `payload.meta.pointsEarned = pointsEarned` before `return ok(res, payload)`.

  **Files:** `backend/src/controllers/roulette.controller.js`
  **Verify:** `cd backend && node --input-type=module --eval "import './src/controllers/roulette.controller.js'; console.log('ok')"` exits 0.

- [ ] **T16b** — Modify `backend/src/controllers/order.controller.js`:
  - Import `addPoints` from `../utils/points.js`.
  - After the order is created (after `emitOrderCreate(order)`), add:
    ```js
    if (order.userId) {
      const qty = order.items?.length ?? 1;
      addPoints(order.userId, qty * 5, `Pedido #${order._id}`, order._id, 'Order')
        .catch(err => logger.warn('[Points] Error adding order points:', err));
    }
    ```
  - Use fire-and-forget (no `await`) to avoid delaying the order response.

  **Files:** `backend/src/controllers/order.controller.js`
  **Verify:** `cd backend && node --input-type=module --eval "import './src/controllers/order.controller.js'; console.log('ok')"` exits 0.

### Desktop

- [ ] **T17a–T17g** — Create the Rewards module in the desktop app:

  **T17a** — `bartender-desktop/src/modules/rewards/types/reward.ts`:
  ```ts
  export interface Reward { _id: string; name: string; description?: string;
    image?: string; pointsCost: number; category: string; active: boolean;
    stock: number; validFrom?: string; validUntil?: string;
    redemptions?: number; deleted?: boolean; }
  export interface UserPointsSummary { balance: number; totalEarned: number;
    totalRedeemed: number; movements: MovementEntry[]; }
  export interface MovementEntry { type: string; amount: number;
    description: string; createdAt: string; }
  ```

  **T17b** — `bartender-desktop/src/modules/rewards/services/rewardService.ts`:
  Follow `rouletteService.ts` pattern. Use `api` from `../../../services/api`.
  Functions: `getRewards()`, `getPublicRewards()`, `createReward(data)`,
  `updateReward(id, data)`, `deleteReward(id)`, `getMyPoints()`,
  `redeemReward(rewardId)`. Base path `/rewards`.

  **T17c** — `bartender-desktop/src/modules/rewards/hooks/useRewards.ts`:
  `useState` + `useEffect` pattern like roulette's `useRoulette.ts`. Expose
  `rewards, loading, error, refetch, createReward, updateReward, deleteReward`.

  **T17d** — `bartender-desktop/src/modules/rewards/components/RewardCard.tsx`:
  Glass card (`className="glass-royale"`) showing name, pointsCost badge
  (`text-grad-gold`), stock indicator, active/inactive toggle button.
  Props: `reward: Reward`, `onEdit`, `onDelete`.

  **T17e** — `bartender-desktop/src/modules/rewards/components/RewardForm.tsx`:
  Form with fields: name, description, pointsCost, category (select), stock,
  validFrom, validUntil, active checkbox. Submit calls `createReward` or
  `updateReward`. Style follows the existing form pattern in
  `roulette/components/` (dark inputs, gold labels).

  **T17f** — `bartender-desktop/src/modules/rewards/components/RedemptionsLog.tsx`:
  Table of last redemptions. Fetched via `getRewards()` (redemption counts are
  on each reward doc). Columns: reward name, redemption count, last redeemed.
  Same table style as `RouletteLogs.tsx`.

  **T17g** — `bartender-desktop/src/modules/rewards/pages/RewardsPage.tsx`:
  3-panel layout identical to `RoulettePage.tsx` structure:
  left panel (reward list + RewardCard), center panel (RewardForm),
  right panel (RedemptionsLog + stats).

  **Files:** All 7 files listed above (create)
  **Verify:** `cd bartender-desktop && npm run build` exits 0.

- [ ] **T17h** — Add Rewards entry to `bartender-desktop/src/components/ui/Sidebar.tsx`:
  - Import `Gift` from `lucide-react`.
  - Add `REWARDS: '/rewards'` to the `PATHS` object.
  - Add `{ name: 'Recompensas', path: PATHS.REWARDS, icon: Gift }` to the
    "Sistema" section, after the Ruleta entry.
  - Add the route in `bartender-desktop/src/router/AppRouter.tsx`:
    import `RewardsPage`, add
    `<Route element={<RoleRoute path="/rewards" />}> <Route path="/rewards" element={<RewardsPage />} /> </Route>`.

  **Files:** `bartender-desktop/src/components/ui/Sidebar.tsx`,
  `bartender-desktop/src/router/AppRouter.tsx`
  **Verify:** `cd bartender-desktop && npm run build` exits 0.

### Mobile

- [ ] **T18a** — Create `mobile-client/src/api/rewardApi.ts`:
  ```ts
  getPublicRewards(): Promise<Reward[]>
  getMyPoints(): Promise<UserPointsSummary>
  redeemReward(rewardId: string): Promise<RedeemResult>
  ```
  Use `api` from `./client`, return `res.data.data`.
  Define `Reward`, `UserPointsSummary`, `RedeemResult` interfaces inline
  (can be simple — they will be used in T19a).

  **Files:** `mobile-client/src/api/rewardApi.ts` (create)
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T18b** — Create `mobile-client/src/stores/usePointsStore.ts`:
  Zustand store (with `persist` to `AsyncStorage`, key `nebula-points-storage`):
  ```ts
  state: { balance: number; totalEarned: number; movements: MovementEntry[] }
  actions:
    loadPoints(): Promise<void> — calls getMyPoints(), updates state
    addLocal(amount: number, description: string): void — optimistic update
  ```

  **Files:** `mobile-client/src/stores/usePointsStore.ts` (create)
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T19a** — Create `mobile-client/src/components/shared/RewardsCatalog.tsx`:
  - Modal-style bottom sheet (use `Modal` with `animationType="slide"` from RN).
  - On open, calls `getPublicRewards()` and shows balance from `usePointsStore`.
  - Grid of reward cards: each shows name, pointsCost, an image (or placeholder).
  - "Canjear" button: calls `redeemReward(id)`, on success calls
    `usePointsStore.getState().addLocal(-reward.pointsCost, '...')`, shows toast.
  - Disabled when `balance < pointsCost`.

  **Files:** `mobile-client/src/components/shared/RewardsCatalog.tsx` (create)
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T19b** — Finish `mobile-client/src/screens/AccountScreen.tsx`:
  - Add `showCatalog` state (`useState(false)`).
  - Add "Mis Recompensas" `TouchableOpacity` button (gold outlined pill) after
    the `LoyaltyCard` (T12b). On press: `setShowCatalog(true)`.
  - Render `<RewardsCatalog visible={showCatalog} onClose={() => setShowCatalog(false)} />`.
  - Add mini movements log: last 5 entries from `usePointsStore(s => s.movements)`,
    rendered as simple rows below the "Historial de pedidos" section.

  **Files:** `mobile-client/src/screens/AccountScreen.tsx`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T20a** — Modify `mobile-client/src/screens/RouletteScreen.tsx`:
  - After `triggerReveal(res.selected)`, call:
    ```ts
    if (res.pointsEarned && res.pointsEarned > 0) {
      usePointsStore.getState().addLocal(res.pointsEarned, `Ruleta: ${res.selected.name}`);
      // animate +pts toast
      setToastMsg(`+${res.pointsEarned} pts ganados`);
    }
    ```
  - The `+pts toast` uses the existing `NToast` component.
  - Import `usePointsStore` from `../stores/usePointsStore`.

  **Files:** `mobile-client/src/screens/RouletteScreen.tsx`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

- [ ] **T20b** — Modify `mobile-client/src/screens/PedidoScreen.tsx`:
  - In `CartView.handleSubmit`, after `clearCart()` and `onSubmitSuccess(order)`:
    ```ts
    const pts = cart.length * 5;
    usePointsStore.getState().addLocal(pts, `Pedido enviado (${cart.length} items)`);
    ```
  - Import `usePointsStore` from `../../stores/usePointsStore`.
  - Note: `cart` must be captured before `clearCart()`.

  **Files:** `mobile-client/src/screens/PedidoScreen.tsx`
  **Verify:** `cd mobile-client && npx tsc --noEmit`

---

## Phase 6 — Documentation

- [ ] **T21** — Create `NEBULA_MEGA_PLAN.md` at the workspace root
  (`c:\Users\Usuario\OneDrive\Escuela\Proyecto bartender\bartender-system\NEBULA_MEGA_PLAN.md`):
  - Executive summary of the full plan.
  - 21-task table with columns: Task, Phase, Platform, Key Files, Status.
  - Points system diagram (ASCII/text): Earn sources → UserPoints.balance → Redeem.
  - Example rewards table (10 rows, realistic for a bar: "Free Cocktail 200pts",
    "2x1 on Shots 150pts", etc.).
  - Technical decisions: why Zustand for points store; why ES Modules in backend;
    why `fire-and-forget` for order points; why `usePointsStore` not persisted to
    backend (optimistic, syncs on next `loadPoints()`).
  - Category color guide for `CategoryHeroRow`: Cócteles→purple, Vinos→red,
    Cervezas→amber, Comida→green, Sin Alcohol→cyan, Shots→orange, Especiales→gold.

  **Files:** `c:\Users\Usuario\OneDrive\Escuela\Proyecto bartender\bartender-system\NEBULA_MEGA_PLAN.md` (create)
  **Verify:** File exists and is valid Markdown (`Test-Path` → true).

---

## Dependency Order Summary

```
T0  (standalone — fixes broken API)
T1a → T1b (tokens needed by all Phase 2+ components)
T2 (needs T1a/T1b tokens)
T3 → T4 → T5 → T6 (base components, independent of each other, depend on T1)
T10 (needs T4, T5)
T11 (needs T6)
T12a → T12b (T12b needs T12a + T18b)
T13 (needs T3, T4, T5)
T7 (needs T1a)
T8 (standalone SVG improvement)
T9a → T9b (T9a standalone; T9b standalone)
T14a → T14b → T14c (sequential Mongoose models, T14c needs T14b)
T15a (needs T14a, T14b, T14c) → T15b (needs T15a) → T15c (needs T15b)
T16a (needs T14c, modifies existing roulette controller)
T16b (needs T14c, modifies existing order controller)
T17a → T17b → T17c → T17d → T17e → T17f → T17g (sequential desktop module)
T17h (needs T17g)
T18a → T18b (T18b needs T18a)
T19a (needs T18a, T18b) → T19b (needs T19a, T12a, T12b)
T20a (needs T18b, T7)
T20b (needs T18b)
T21 (last — documents the completed work)
```
