# Implementation Plan — Nebula Mobile Client: Visual Phase 2 + Product Customizer

> Prepared by: Planning Agent  
> Scope: `mobile-client/` only — no backend, desktop, or web changes.  
> Stack confirmed: Expo SDK 57, React Native 0.86.3, TypeScript 6.0.3  
> Animation constraint: **Only `Animated` + `Easing` from `react-native`** — no Reanimated, no Skia.  
> `expo-haptics` ✅ installed (~57.0.3) · `expo-camera` ✅ installed (~57.0.6) · `expo-linear-gradient` ❌ NOT installed → simulate with stacked Views.  
> Named exports (`RouletteScreen`, `QRScannerScreen`, etc.) must remain named exports.  
> `FloatingCartBar` — do not touch (already updated in a prior pass).

---

## Pre-read findings (ground truth from actual files)

### Colors / aliases confirmed
`Colors.card` = `surfaceContainer` `#1d2027` · `Colors.border` = `outlineVariant` `#4f4536` · `Colors.dealRed` = `errorContainer` `#93000a` · `Colors.textPrimary` = `onSurface` `#e0e2ec` · `Colors.textSecondary` = `onSurfaceVariant` `#d3c5b1` · `Colors.textMuted` = `outline` `#9b8f7d` · `Colors.textInverse` = `onPrimary` `#412d00`

### Files that use legacy aliases (tasks 1a–1c)
`DealsCarousel.tsx`, `ModifierModal.tsx`, `ProductCard.tsx` — all import `Colors` and use alias tokens + hardcoded `fontSize`/`fontWeight` instead of `Typography`.

### NToast API (confirmed from source)
`<NToast visible={bool} message={string} variant="success|error|info" duration={ms} onHide={() => void} />` — renders at `position: 'absolute', top: 20, zIndex: 999`. Must be a sibling in the component tree (not a portal). Pattern: `const [toast, setToast] = useState<{msg:string;variant:ToastVariant}|null>(null)`.

### MesaCard props (confirmed from source)
Current props: `tableNumber`, `zone`, `status`, `totalAmount`, `onViewConsumos`, `onCallWaiter`. Adding `onRepeatRound` prop is a backward-compatible addition.

### CartaScreen (confirmed from source)
Uses `ModifierModal` for both SommelierCard and CompactProductRow. State: `modalProduct`, `showModal`. Adding `showCustomizer`/`customizerProduct` state alongside existing modal state is additive — no breakage.

### QRScannerScreen (confirmed from source)
Currently keyboard-only. `expo-camera` is installed — use `CameraView` (Expo 57 API, not deprecated `Camera`).

### useCartStore (confirmed from source)
Has `addToCart`, `removeFromCart`, `setLineQty`, `setLineNotes`, `clearCart`, `getTotalItems`, `getTotalPrice`. `CartLine` has `productId, name, price, quantity, image?, notes`. Adding new computed methods and `appliedCoupon`/`tipPercent` state is purely additive.

---

## Execution order

```
1a → 1b → 1c → 1d → 2 → 3 → 4 → 5 → 6 → 7 → 8 → A → B → C → D → E → 9
```

Tasks 1a–1c and 2 are independent component migrations.  
Task 1d (QRScanner redesign + camera mode) is independent.  
Tasks 3, 4, 5 are independent screen animation passes.  
Task 6 (RouletteScreen) depends on `useCartStore.addToCart` and `useSessionStore.tableId` — both confirmed compatible.  
Task 7 (AppNavigator) is independent.  
Task 8 (AccountScreen hero) is independent of 1d.  
Tasks A–B are data-layer only (types + store) — must precede C.  
Task C (ProductCustomizerSheet) depends on A (types).  
Task D (CartaScreen + HomeScreen integration) depends on C.  
Task E (CartView notes display) depends on B (coupon/tip in store).  
Task 9 (memory) always last.

---

## Task 1: Migrate legacy components to Nocturne design system

### Task 1a — DealsCarousel.tsx

- [ ] **1. Migrate `DealsCarousel.tsx` to full Nocturne tokens + Typography**

  **Current state:**  
  All text uses hardcoded `fontSize`/`fontWeight` (not Typography tokens). Colors use aliases `Colors.card`, `Colors.border`, `Colors.dealRed`, `Colors.textPrimary`, `Colors.textSecondary`, `Colors.textMuted`. `borderRadius: 16` is hardcoded.

  **Changes:**
  1. Add imports: `{ Typography, Spacing, Radius }` from `../theme/`
  2. `sectionTitle`: `...Typography.headlineSm, color: Colors.onSurface` (was `fontSize:15, fontWeight:'700'`)
  3. `card`: `backgroundColor: Colors.surfaceContainer, borderColor: Colors.outlineVariant, borderRadius: Radius.xl` (values identical via aliases, now semantic)
  4. `dealBadge`: `backgroundColor: Colors.errorContainer, borderWidth: 1, borderColor: 'rgba(255,180,171,0.20)'`
  5. `dealBadgeText`: `...Typography.labelSm, color: Colors.error`
  6. `appOnlyText`: `...Typography.labelSm, color: Colors.outline`
  7. `cardTitle`: `...Typography.titleMd, color: Colors.onSurface`
  8. `cardDesc`: `...Typography.bodySm, color: Colors.onSurfaceVariant`
  9. `singleBanner`: same card tokens
  10. `dealTitle`: `...Typography.headlineSm, color: Colors.onSurface`
  11. `dealSubtitle`: `...Typography.bodyMd, color: Colors.onSurfaceVariant`

  **TypeScript:** No type changes. StyleSheet values only.

  **Files:** `src/components/DealsCarousel.tsx`

  **Verify:** `npx tsc --noEmit` — no errors. Visual: deal cards render with Nocturne palette.

---

### Task 1b — ModifierModal.tsx

- [ ] **2. Migrate `ModifierModal.tsx` to Nocturne tokens + animated selected chip state**

  **Current state:**  
  Overlay `rgba(0,0,0,0.75)`. `Colors.card/cardSecondary/border/textPrimary/textSecondary/textMuted/textInverse/primary` — all aliases. Hardcoded font sizes. Preset chips have no visual selected state (only `+` prefix in text). Confirm button uses `Colors.primary` (gold, not CTA dark).

  **Changes:**
  1. Add imports: `{ Typography, Spacing, Radius, Elevation }` from `../theme/`
  2. Overlay: `rgba(0,0,0,0.85)`
  3. `sheet`: `backgroundColor: Colors.surfaceContainer`, `borderTopColor: Colors.outlineVariant`
  4. `header borderBottomColor: Colors.outlineVariant`
  5. `productName`: `...Typography.headlineSm, color: Colors.onSurface`
  6. `productCategory`: `...Typography.labelMd, color: Colors.primary, textTransform: 'uppercase' as const`
  7. `description`: `...Typography.bodyMd, color: Colors.onSurfaceVariant`
  8. `sectionLabel`: `...Typography.labelMd, color: Colors.onSurface`
  9. **Chip selected state**: Add `selectedPresets: Set<string>` via `useState<Set<string>>(new Set())`. Update `handlePresetNote`: toggle preset in/out of Set and rebuild `notes` string. Chip resting: `backgroundColor: Colors.surfaceContainerHigh, borderColor: Colors.outlineVariant`. Chip selected: `borderColor: Colors.primaryContainer, backgroundColor: Colors.goldMuted`. Chip text resting: `...Typography.labelMd, color: Colors.onSurfaceVariant`. Chip text selected: `color: Colors.primary`. Reset `selectedPresets` in `handleAdd` (alongside existing resets).
  10. `input`: `backgroundColor: Colors.surfaceContainerHigh, color: Colors.onSurface, borderColor: Colors.outlineVariant`; add `onFocus`/`onBlur` state `inputFocused` → `borderColor: inputFocused ? Colors.primary : Colors.outlineVariant`
  11. `stepper`: `backgroundColor: Colors.surfaceContainerHigh, borderRadius: Radius.lg, borderColor: Colors.outlineVariant`
  12. `stepperCount`: `...Typography.titleMd, color: Colors.onSurface`
  13. `confirmBtn`: `backgroundColor: Colors.primaryContainer, borderRadius: Radius.lg, ...(Elevation.goldCTA as object)`
  14. `confirmBtnText`: `...Typography.labelLg, color: Colors.onPrimary`

  **TypeScript:** `useState<Set<string>>(new Set())` — TS6 supports `Set<string>` generics. `selectedPresets` replaces the `notes.includes(preset)` logic. Named export `ModifierModal` preserved.

  **Files:** `src/components/ModifierModal.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: chips light up with gold border when selected. Confirm button has CTA gold glow.

---

### Task 1c — ProductCard.tsx

- [ ] **3. Migrate `ProductCard.tsx` to Nocturne tokens + Typography**

  **Current state:**  
  `Colors.card`, `Colors.cardSecondary`, `Colors.border`, `Colors.dealRed`, `Colors.primaryMuted`, `Colors.textPrimary`, `Colors.textSecondary`, `Colors.textMuted`, `Colors.textInverse`. Hardcoded font sizes/weights. `addButton` uses `Colors.primary` (highlight gold) instead of `Colors.primaryContainer` (CTA gold).

  **Changes:**
  1. Add imports: `{ Typography, Spacing, Radius }` from `../theme/`
  2. `card`: `backgroundColor: Colors.surfaceContainer, borderColor: Colors.outlineVariant, borderRadius: Radius.xl`
  3. `imageContainer`: `backgroundColor: Colors.surfaceContainerHigh`
  4. `discountBadge`: `backgroundColor: Colors.errorContainer, borderWidth: 1, borderColor: 'rgba(255,180,171,0.20)'`
  5. `discountBadgeText`: `...Typography.labelSm, color: Colors.error`
  6. `authorBadge`: `backgroundColor: Colors.goldMuted, borderWidth: 1, borderColor: Colors.goldBorder`
  7. `authorBadgeText`: `...Typography.labelSm, color: Colors.primary`
  8. `title`: `...Typography.titleMd, color: Colors.onSurface`
  9. `description`: `...Typography.bodySm, color: Colors.onSurfaceVariant`
  10. `price`: `...Typography.price, color: Colors.primary`
  11. `originalPrice`: `...Typography.bodySm, color: Colors.outline, textDecorationLine: 'line-through' as const`
  12. `addButton`: `backgroundColor: Colors.primaryContainer, borderRadius: Radius.full` (was `Colors.primary`)

  **TypeScript:** No interface changes.

  **Files:** `src/components/ProductCard.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: product cards display Nocturne palette with gold CTA button.

---

### Task 1d — QRScannerScreen.tsx

- [ ] **4. Redesign `QRScannerScreen.tsx` — Nocturne style + camera mode + success animation**

  **Current state:**  
  Keyboard-only. Legacy aliases + hardcoded fonts. Code boxes are plain Views. OK key same style as digits. No success animation. `expo-camera` (~57.0.6) is installed.

  **Changes:**

  **A. Imports:** Add `Animated`, `Easing` from `react-native`; `CameraView, useCameraPermissions` from `expo-camera`; `Typography, Spacing, Radius, Elevation` from `../theme/`.

  **B. Camera mode toggle:** Add `mode: 'camera' | 'keyboard'` state, default `'camera'`. On first render call `useCameraPermissions()` hook — if permission not granted, switch to `'keyboard'` mode automatically. Add toggle button in header (icon: `Keyboard` when in camera mode, `QrCode` when in keyboard mode).

  **C. Camera view (when mode === 'camera'):** Render `<CameraView style={styles.cameraView} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={handleBarcodeScanned} />`. Overlay: dark translucent frame with a centered gold-bordered square (220×220, `borderColor: Colors.primaryContainer, borderWidth: 2, borderRadius: Radius.xl`). Instructions: "Apuntá al código QR de tu mesa". On QR scan: if the scanned data is 3 digits, auto-call `handleValidateCode(scannedData)`. If not 3 digits, show error toast.

  **D. Keyboard view redesign (when mode === 'keyboard'):**
  - Header: `borderBottomColor: Colors.outlineVariant`. Title `...Typography.headlineSm, color: Colors.onSurface`.
  - Instructions: `...Typography.bodyMd, color: Colors.onSurfaceVariant`
  - Code boxes: each becomes `Animated.View`. Create `boxScaleAnims = useRef(Array.from({length:3}, () => new Animated.Value(1))).current` and `successAnim = useRef(new Animated.Value(0)).current`.
    - Resting: `backgroundColor: Colors.surfaceContainer, borderColor: Colors.outlineVariant, width: 72, height: 84, borderRadius: Radius.xl`
    - Filled (has digit): `borderColor: Colors.primary, backgroundColor: Colors.surfaceContainerHigh`
    - Success: overlay a success-tinted View (`borderColor: Colors.success, backgroundColor: 'rgba(52,185,100,0.08)'`) with `opacity: successAnim`
  - `codeText`: `...Typography.displayLg, color: Colors.onSurface`
  - Keypad keys: `backgroundColor: Colors.surfaceContainer, borderColor: Colors.outlineVariant, borderRadius: Radius.lg`. `keyText`: `...Typography.headlineSm, color: Colors.onSurface`.
  - **C (backspace) key**: `backgroundColor: Colors.surfaceContainerHigh`
  - **OK button**: `backgroundColor: Colors.primaryContainer, borderRadius: Radius.lg, ...(Elevation.goldCTA as object)`. `okText`: `...Typography.labelLg, color: Colors.onPrimary`

  **E. Success animation** (triggered inside `handleValidateCode` on the success path, before calling `onSuccess`):
  ```ts
  Animated.stagger(80, boxScaleAnims.map(anim =>
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ])
  )).start();
  Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  ```

  **TypeScript:** `useCameraPermissions` returns `[permission, requestPermission]`. `CameraView.onBarcodeScanned` receives `{ type, data }`. `handleBarcodeScanned = ({ data }: { data: string }) => { if (/^\d{3}$/.test(data)) handleValidateCode(data); }`. Named export `QRScannerScreen` preserved.

  **Files:** `src/screens/QRScannerScreen.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: camera frame shows gold border overlay, QR scan auto-validates. Keyboard mode shows redesigned boxes + success animation.

---

## Task 2: SommelierCard — simulated gradient

- [ ] **5. Replace flat image overlay in `SommelierCard.tsx` with simulated 2-layer gradient**

  **Current state:**  
  `imageOverlay`: single View, `backgroundColor: Colors.surfaceContainer, opacity: 0.6` — covers bottom 40%, flat tone.

  **expo-linear-gradient is NOT installed** (confirmed in package.json).

  **Changes:**  
  Replace `imageOverlay` with two absolutely-positioned Views:
  1. `gradientSolid`: `position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundColor: '#1d2027'` — solid base matching `surfaceContainer`
  2. `gradientFade`: `position: 'absolute', bottom: '20%', left: 0, right: 0, height: '30%', backgroundColor: 'rgba(29, 32, 39, 0.75)'` — mid fade layer

  Remove `imageOverlay` style. `featureBadge` and `addBtn` are already correct — no changes.

  **TypeScript:** No changes. Pure StyleSheet replacement.

  **Files:** `src/components/shared/SommelierCard.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: HomeScreen SommelierCard has visible dark gradient at image bottom, not a hard block.

---

## Task 3: AuthScreen — entry animations + animated tab pill

- [ ] **6. Add hero entrance animations and sliding tab pill to `AuthScreen.tsx`**

  **Current state:**  
  All static. No `Animated` usage. Tab selector uses `tabBtnActive: { backgroundColor: Colors.surfaceContainerHighest }` static style.

  **Changes:**
  1. Add `Animated` import from `react-native`.
  2. Animation refs (inside component with `useRef`):
     - `heroOpacity = useRef(new Animated.Value(0)).current`
     - `heroScale = useRef(new Animated.Value(0.85)).current`
     - `cardOpacity = useRef(new Animated.Value(0)).current`
     - `cardTranslateY = useRef(new Animated.Value(30)).current`
     - `tabIndicatorX = useRef(new Animated.Value(0)).current`
     - `tabContainerWidth = useRef(0)` (plain ref, not Animated)
  3. `useEffect(() => { Animated.parallel([ Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }), Animated.timing(heroScale, { toValue: 1, duration: 600, useNativeDriver: true }), Animated.sequence([ Animated.delay(200), Animated.parallel([ Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }), Animated.timing(cardTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }) ]) ]) ]).start(); }, [])`
  4. Wrap `brand` View → `Animated.View` with `style={[styles.brand, { opacity: heroOpacity, transform: [{ scale: heroScale }] }]}`.
  5. Wrap `card` View → `Animated.View` with `style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}`.
  6. **Hero background glow**: Inside `brand`, add a View before `brandMark` (or using absolute positioning): `style={{ position: 'absolute', top: -8, width: 110, height: 110, borderRadius: 55, backgroundColor: Colors.goldMuted }}`. This creates a soft gold orb behind the icon circle.
  7. **Animated tab pill**: Inside `tabRow`, add before the two `TouchableOpacity` buttons an `Animated.View` with `position: 'absolute', left: tabIndicatorX, width: '50%', height: '100%', backgroundColor: Colors.surfaceContainerHighest, borderRadius: Radius.md - 2`. Capture width: `onLayout={e => tabContainerWidth.current = e.nativeEvent.layout.width}` on `tabRow`. Update `switchTab`: after setting tab state, `Animated.spring(tabIndicatorX, { toValue: t === 'login' ? 0 : tabContainerWidth.current / 2, useNativeDriver: true, friction: 8, tension: 80 }).start()`.
  8. Remove `tabBtnActive: { backgroundColor: ... }` style (replaced by animated pill). Keep `tabLabelActive` color.

  **TypeScript:** `tabContainerWidth` is `useRef<number>(0)` — `.current` is a plain number. `Animated.spring` with `useNativeDriver: true` only works for `transform/opacity` — `left` is a transform offset here since we use it as translateX (cast: set `left: 0` as base, animate via `transform: [{ translateX: tabIndicatorX }]`). Correction: the absolute View has `left: 0, width: '50%'` as base style, and `transform: [{ translateX: tabIndicatorX }]` — `useNativeDriver: true` works.

  **Files:** `src/screens/AuthScreen.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: brand section fades+scales in, card slides up. Tab selector pill slides on switch.

---

## Task 4: PedidoScreen — animations + kiosk tracker improvements

- [ ] **7. Add animations + improve CartView display + upgrade TrackingView to kiosk-grade**

  **Current state:**  
  State transitions are instant. Cart items render statically. Progress bar is `width: stepIndex===0?'33%':...` static string. Step circles are static. Order number shows `id.slice(-5)` in small `labelSm`. No estimated time. No quick actions in tracking.

  ### A. State transition fade (PedidoScreen main component)
  1. Add `Animated` import.
  2. `const contentOpacity = useRef(new Animated.Value(1)).current`
  3. Extract `handleStateChange(newState: ScreenState)`: `Animated.timing(contentOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => { setScreenState(newState); Animated.timing(contentOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start(); })`
  4. Replace all `setScreenState(...)` calls with `handleStateChange(...)`. Use in `handleOrderSuccess`, `handleNewOrder`, and the `useEffect` sync.
  5. Wrap main content area in `<Animated.View style={{ flex: 1, opacity: contentOpacity }}>`.

  ### B. CartView improvements
  6. **Item stagger animation**: Add inside `CartView`: `const itemAnims = useRef(Array.from({ length: 5 }, () => ({ opacity: new Animated.Value(0), translateX: new Animated.Value(20) }))).current`. On mount (empty dep array): `Animated.stagger(50, itemAnims.slice(0, Math.min(cart.length, 5)).map((a, i) => Animated.parallel([ Animated.timing(a.opacity, { toValue: 1, duration: 300, useNativeDriver: true }), Animated.timing(a.translateX, { toValue: 0, duration: 300, useNativeDriver: true }) ]))).start()`. Wrap the first 5 item cards in `Animated.View` with matching transforms. Items beyond index 4 render with plain `View` (no animation).
  7. **Destination selector (top of CartView)**: Above the mesa status bar, add a `destinationRow` View with two chip-style buttons: "Mesa #X" (if `hasMesa`) and "Retiro en Barra". Use `destinationMode: 'mesa' | 'bar'` state initialized to `hasMesa ? 'mesa' : 'bar'`. Style: same as `tipChip`/`tipChipActive` pattern. If `hasMesa`, "Mesa #X" chip is active by default. If not, "Retiro en Barra" is active and only "Retiro en Barra" is selectable (plus the connect mesa option). Pass `destinationMode` to `handleSubmit` to set `table`/`sessionId` or empty strings accordingly.
  8. **Add 5% tip option**: Change tip options from `[0, 10, 15, 20]` to `[0, 5, 10, 15, 20]`. Initial state remains `10`.
  9. **Notes display as mini-badges**: In item rendering, if `item.notes` matches `/\[.+\]/`, parse the bracket content by splitting on ` | ` and render each part as a `View` with `labelSm` text inside `surfaceContainerHigh` background, `Radius.xs`, horizontal scroll or wrap. If no bracket format, show plain text as before.

  ### C. TrackingView — kiosk upgrade
  10. **Giant order number**: Change `orderNum` style from `labelSm` to `{ ...Typography.displayLg, color: Colors.primary, textAlign: 'center', fontWeight: '700' as const }`. Change the text to `#${currentOrder.id.slice(-3).toUpperCase()}`.
  11. **Estimated time**: Below the order number, add: `const ESTIMATE: Record<string, number> = { pending: 15, 'in-progress': 8, completed: 0, cancelled: 0 }`. Render `<Text style={styles.estimatedTime}>⏱ Listo en aprox. {ESTIMATE[currentOrder.status] ?? 15} min</Text>` (only when status is `pending` or `in-progress`). Style: `...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center'`.
  12. **Animated progress bar**: Replace static `width` string with `Animated.Value`. `const progressAnim = useRef(new Animated.Value(stepIndex >= 0 ? (stepIndex + 1) / ORDER_STATUS_STEPS.length : 0.33)).current`. Progress bar `View` → `Animated.View` with `style={[styles.progressBar, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}`. When status changes: `Animated.timing(progressAnim, { toValue: (newStepIndex + 1) / 3, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start()`. **Note:** `useNativeDriver: false` required for layout `width`.
  13. **Step circle scale springs**: `const stepScaleAnims = useRef(ORDER_STATUS_STEPS.map((_, i) => new Animated.Value(i <= stepIndex ? 1 : 0))).current`. On mount + status change: `ORDER_STATUS_STEPS.forEach((_, i) => { if (i <= stepIndex) Animated.spring(stepScaleAnims[i], { toValue: 1, friction: 6, useNativeDriver: true }).start(); })`. Wrap step icon box in `Animated.View` with `transform: [{ scale: stepScaleAnims[idx] }]`.
  14. **Quick actions (always visible in tracking)**: After `trackingActions` section, add two more NButton rows — always visible regardless of order status:
      - `NButton label="Pedir algo más" variant="ghost" icon={<ChefHat size={16}/>} onPress={() => navigation.navigate('Carta')} fullWidth`
      - `NButton label="Llamar al Mozo" variant="ghost" icon={<PhoneCall size={16}/>} onPress={handleCallWaiter} fullWidth`
      Where `handleCallWaiter = () => { try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {} setToastMsg('Se notificó al personal. En breve se acercan a tu mesa.'); }`.
      Add `NToast` at the top of `TrackingView`'s return: `<NToast visible={!!toastMsg} message={toastMsg ?? ''} variant="info" onHide={() => setToastMsg(null)} />`.
      Add state `const [toastMsg, setToastMsg] = useState<string | null>(null)` inside `TrackingView`.
  15. **Navigation in TrackingView**: `TrackingView` needs navigation access. Add `const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>()` inside the function component. Import `useNavigation` and required types.

  **TypeScript:** Add `Easing` import from `react-native`. `useNativeDriver: false` for width. `navigation` typed as `BottomTabNavigationProp<RootTabParamList>` — same pattern as outer `PedidoScreen`. Import `PhoneCall, ChefHat` from `lucide-react-native`.

  **Files:** `src/screens/PedidoScreen.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: fade between states, giant `#042`-style order number, progress bar animates, quick action buttons always visible.

---

## Task 5: HomeScreen — stagger animations + pulsing dot + MesaCard session hub

- [ ] **8. Add stagger animations + micro-interactions + session hub actions to `HomeScreen.tsx`**

  **Current state:**  
  No animations. `mesaDot` is a static `View`. `MesaCard` receives only `onViewConsumos` and `onCallWaiter` (no repeat round). `QuickActionCard` has `activeOpacity={0.80}` but no spring.

  ### A. Section stagger animations
  1. Add `Animated` import.
  2. Stagger refs (inside component):
     ```ts
     const anim = useRef({
       header:     new Animated.Value(0),
       greeting:   { o: new Animated.Value(0), y: new Animated.Value(16) },
       mesa:       { o: new Animated.Value(0), y: new Animated.Value(16) },
       promo:      { o: new Animated.Value(0), y: new Animated.Value(16) },
       quick:      { o: new Animated.Value(0), s: new Animated.Value(0.95) },
       sommelier:  Array.from({ length: 4 }, () => ({ o: new Animated.Value(0), y: new Animated.Value(16) })),
     }).current;
     ```
  3. After `setLoading(false)` in `fetchData` (inside `.finally()`), run stagger sequence with delays: header 0ms, greeting 100ms, mesa 200ms, promo 300ms, quick access 400ms (scale 0.95→1), each sommelier 500ms + (index × 80ms). All use `duration: 350, useNativeDriver: true`.
  4. Wrap each section in matching `Animated.View` with opacity + translateY (or scale for quick access).

  ### B. Pulsing mesa dot
  5. `const pulseAnim = useRef(new Animated.Value(1)).current`
  6. In a `useEffect([tableNumber])`: if `tableNumber != null`, start `Animated.loop(Animated.sequence([ Animated.timing(pulseAnim, { toValue: 1.5, duration: 800, useNativeDriver: true }), Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }) ]))`. Return cleanup that stops the loop. The `mesaDot` inside `MesaCard` is a separate component — instead, add an `Animated.View` wrapper in HomeScreen's MesaCard rendering area: a green dot overlay badge on the mesa section, or pass `pulseAnim` as a prop. **Simpler approach**: In the `topBar` View next to the `brandDot`, when `tableNumber != null` show a small `Animated.View` with `transform: [{ scale: pulseAnim }]`, `width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success`.

  ### C. Quick access spring
  7. Modify `QuickActionCard` to use `Animated`: Add `const pressAnim = useRef(new Animated.Value(1)).current` inside `QuickActionCard`. Wrap outer `TouchableOpacity` content in `Animated.View` with `transform: [{ scale: pressAnim }]`. Add `onPressIn` → `Animated.spring(pressAnim, { toValue: 0.92, useNativeDriver: true, friction: 8 })` and `onPressOut` → `Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, friction: 6 })`.

  ### D. MesaCard session hub — "Repetir Ronda" + "Llamar Mozo" toast
  8. Add `onRepeatRound?: () => void` prop to `MesaCard` interface. Add a third action button in `MesaCard`'s actions row: "Repetir Ronda" with `RotateCw size={14}` icon, calls `onRepeatRound`. Add a second `actionDivider` between "Llamar mozo" and "Repetir Ronda". Style same as existing `actionBtn`.
  9. In `HomeScreen`: implement `handleRepeatRound`: read `useAuthStore.getState()` for order history (already fetched in `orderHistory` state if available, or use a local `useRef` to the last cart contents). Practical implementation: read `useCartStore.getState().cart` — if cart has items from a previous session, re-add them. Since cart persists between sessions, if `cart.length === 0` show `Alert` "No hay ronda anterior en el carrito". If `cart.length > 0`, show `Alert.alert('Repetir Ronda', 'Se agregarán los mismos productos al carrito', [{text:'Confirmar', onPress: () => { cart.forEach(item => useCartStore.getState().addToCart(item)); navigation.navigate('Pedidos'); }}])`.
  10. Add `NToast` state in `HomeScreen` for the "Llamar Mozo" action from `MesaCard.onCallWaiter`: `const [homeToast, setHomeToast] = useState<string|null>(null)`. Pass `onCallWaiter={() => { try { Haptics.selectionAsync(); } catch {} setHomeToast('Se notificó al personal. En breve se acercan.'); }}`. Render `<NToast visible={!!homeToast} message={homeToast??''} variant="info" onHide={() => setHomeToast(null)} />` inside `SafeAreaView` (not inside `ScrollView` — it's `position: absolute`).

  **TypeScript:** `MesaCard` props interface extended with optional `onRepeatRound?: () => void`. `NToast` import added to `HomeScreen`. `Haptics` already imported.

  **Files:** `src/screens/HomeScreen.tsx`, `src/components/shared/MesaCard.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: sections animate in sequence on load. Green dot pulses in top bar when mesa connected. Quick access cards spring on press. MesaCard has 3 action buttons. Toast appears on "Llamar Mozo".

---

## Task 6: RouletteScreen — full redesign

- [ ] **9. Full rewrite of `RouletteScreen.tsx`**

  **Current state:**  
  Simple 170px circle, `Colors.dealGreen` CTA button, no rarity system, no recipe, no history, no cart integration. Simple haptic interval. Imports `getPublicRouletteDrinks` + `spinPublicRoulette` — keep both. `RouletteDrinkDTO._id` field confirmed.

  **Complete new implementation:**

  ### Types
  ```ts
  type SpinState = 'idle' | 'spinning' | 'result';
  interface SpinHistoryItem { id: string; name: string; rarity: string; timestamp: Date; }
  ```

  ### Rarity config
  ```ts
  const RARITY_CONFIG = {
    COMMON:    { border: '#9b8f7d', label: Colors.outline,       glow: 'rgba(155,143,125,0.25)', emoji: '⚪', badgeBg: Colors.surfaceContainerHigh, badgeText: Colors.outline    },
    RARE:      { border: '#38BDF8', label: Colors.info,          glow: 'rgba(56,189,248,0.25)',  emoji: '🔵', badgeBg: NocturneColors.infoMuted,     badgeText: Colors.info       },
    EPIC:      { border: '#a855f7', label: '#a855f7',            glow: 'rgba(168,85,247,0.25)',  emoji: '🟣', badgeBg: 'rgba(168,85,247,0.12)',       badgeText: '#a855f7'         },
    LEGENDARY: { border: Colors.primary, label: Colors.primary, glow: NocturneColors.goldGlowStrong, emoji: '⭐', badgeBg: Colors.goldMuted, badgeText: Colors.primary },
  } as const;
  ```
  Import `{ Colors, NocturneColors }` from `../theme/colors`.

  ### Animations (all `useRef`)
  - `rotateAnim = new Animated.Value(0)` — border spin (loop)
  - `scaleAnim = new Animated.Value(0.7)` — result circle expand (spring)
  - `opacityAnim = new Animated.Value(0)` — result card fade
  - `chevronAnim = new Animated.Value(0)` — recipe toggle
  - `rotLoopRef = useRef<Animated.CompositeAnimation | null>(null)` — loop handle for stop
  - `cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)`
  - `hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)`

  ### State
  ```ts
  const [spinState, setSpinState] = useState<SpinState>('idle');
  const [drinks, setDrinks] = useState<RouletteDrinkDTO[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<RouletteDrinkDTO | null>(null);
  const [cyclingName, setCyclingName] = useState('');
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [history, setHistory] = useState<SpinHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  ```

  ### Spin logic
  ```ts
  const handleSpin = async () => {
    if (spinState === 'spinning') return;
    // Reset
    rotateAnim.setValue(0); scaleAnim.setValue(0.7); opacityAnim.setValue(0);
    setSelectedDrink(null); setSpinState('spinning'); setIsRecipeOpen(false);
    // Start haptics
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
    let hapticCount = 0;
    hapticIntervalRef.current = setInterval(() => {
      if (hapticCount >= 20) { clearInterval(hapticIntervalRef.current!); return; }
      hapticCount++;
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    }, 80);
    // Start border rotation loop
    rotLoopRef.current = Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
    );
    rotLoopRef.current.start();
    // Start drink name cycling (every 80ms pick random from drinks)
    if (drinks.length > 0) {
      cycleIntervalRef.current = setInterval(() => {
        setCyclingName(drinks[Math.floor(Math.random() * drinks.length)].name);
      }, 80);
    }
    try {
      const res = await spinPublicRoulette();
      // Stop all intervals
      rotLoopRef.current?.stop();
      clearInterval(cycleIntervalRef.current!);
      clearInterval(hapticIntervalRef.current!);
      // Set result
      setSelectedDrink(res.selected);
      setSpinState('result');
      // Animate reveal
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
      // Haptics per rarity
      const isSpecial = res.selected.rarity === 'LEGENDARY' || res.selected.rarity === 'EPIC';
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      // Add to history (max 5)
      setHistory(prev => [
        { id: res.selected._id + Date.now(), name: res.selected.name, rarity: res.selected.rarity, timestamp: new Date() },
        ...prev,
      ].slice(0, 5));
    } catch (err) {
      rotLoopRef.current?.stop();
      clearInterval(cycleIntervalRef.current!);
      clearInterval(hapticIntervalRef.current!);
      setSpinState('idle');
      Alert.alert('Error en la Ruleta', getErrorMessage(err));
    }
  };
  ```

  ### Circle rendering
  ```ts
  const rarityConf = selectedDrink
    ? RARITY_CONFIG[selectedDrink.rarity as keyof typeof RARITY_CONFIG] ?? RARITY_CONFIG.COMMON
    : RARITY_CONFIG.COMMON;
  const rotateDeg = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  ```
  The outer `Animated.View` (220px circle) applies `borderColor` based on spinState:
  - `idle`: `Colors.primary`
  - `spinning`: animated (loop), border color stays gold — the visual rotation is via `transform: [{ rotate: rotateDeg }]`
  - `result`: `rarityConf.border`
  Shadow `shadowColor` based on rarity in result state for glow effect.

  ### Result card (Animated.View with `opacity: opacityAnim`)
  Contains:
  - Rarity badge: pill with `rarityConf.badgeBg` background, `rarityConf.badgeText` color, emoji + rarity text
  - Drink name: `...Typography.displaySm, color: rarityConf.label`
  - Description (if `recipe` exists): `...Typography.bodyMd`
  - **RecipeSection toggle**: `TouchableOpacity` showing "Ver receta del bartender" with animated `Animated.View` rotating chevron. `Animated.timing(chevronAnim, { toValue: isRecipeOpen ? 1 : 0, duration: 250, useNativeDriver: true })`. Chevron rotation: `chevronAnim.interpolate({ inputRange: [0,1], outputRange: ['0deg','180deg'] })`. If open: ingredient list rows + `drinkStyle` badge if exists.
  - **Action buttons**:
    - Primary gold NButton: "🎲 Volver a tirar" → `handleSpin()`
    - Ghost NButton (only if `tableId`): "🍸 Pedir este trago" → `handleAddToCart()`
    - Text-style button: "Ver historial" → `setIsHistoryOpen(!isHistoryOpen)`

  ### "Pedir este trago" logic
  ```ts
  const { tableId } = useSessionStore();
  const handleAddToCart = () => {
    if (!tableId) {
      Alert.alert('Conectá tu mesa', 'Necesitás una mesa para pedir. Podés hacerlo desde Pedidos.',
        [{ text: 'Cancelar', style: 'cancel' },
         { text: 'Ir a Pedidos', onPress: () => { onClose(); navigation.navigate('Pedidos'); } }]);
      return;
    }
    useCartStore.getState().addToCart({
      productId: selectedDrink!._id,
      name: selectedDrink!.name,
      price: 0,
      image: undefined,
      notes: `Ruleta Nebula — ${selectedDrink!.rarity}`,
      quantity: 1,
    });
    setToastMsg('Agregado al pedido');
    navigation.navigate('Pedidos'); // navigate after adding
  };
  ```

  ### Pool preview (below circle)
  A horizontal `ScrollView` showing small rarity preview chips (from `drinks` array):
  - Show counts per rarity: `COMMON: X · RARE: Y · EPIC: Z · LEGENDARY: W`
  - Or simple label: `${drinks.length} tragos en el pool`
  - Both work — use the count label for simplicity.

  ### History section (collapsable)
  ```tsx
  <TouchableOpacity onPress={() => setIsHistoryOpen(!isHistoryOpen)}>
    <Text>Historial de tiradas ({history.length})</Text>
    <ChevronDown />
  </TouchableOpacity>
  {isHistoryOpen && history.map(item => (
    <View key={item.id}>
      <Text>{item.name}</Text>
      <View><Text>{RARITY_CONFIG[item.rarity].emoji} {item.rarity}</Text></View>
      <Text>{fmtTime(item.timestamp)}</Text>
    </View>
  ))}
  ```

  ### Footer
  - `idle`: `NButton label="GIRAR AHORA" icon={<RotateCw/>} fullWidth size="lg"`
  - `spinning`: `NButton label="Girando..." loading={true} disabled fullWidth size="lg"`
  - `result`: hidden footer (`null`)

  ### Layout structure
  ```
  SafeAreaView
    NToast (absolute, top)
    Header [Ruleta Nebula · PREMIO AL INSTANTE badge · X close]
    ScrollView
      HeroSection
        circleOuter (Animated.View, 220px)
        poolCount
      ResultCard (Animated.View, opacity: opacityAnim)
      HistorialSection
    StickyFooter
  ```

  **Navigation**: `const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>()`. Import `useNavigation`, `BottomTabNavigationProp`, `RootTabParamList`, `navigation/types`.

  **TypeScript notes:**
  - `RouletteDrinkDTO._id` — confirmed field name
  - `rotLoopRef.current?.stop()` — `Animated.CompositeAnimation | null` with optional chaining
  - `clearInterval(ref.current!)` — non-null assertion after `if (ref.current)` guard
  - `useNativeDriver: true` for all roulette animations (only opacity/transform)

  **Files:** `src/screens/RouletteScreen.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: spin animates border rotation + name cycling → result reveals with scale spring. Rarity badge colors correct. Recipe toggle works. History accumulates.

---

## Task 7: AppNavigator — tab bar polish

- [ ] **10. Improve `AppNavigator.tsx` tab bar**

  **Current state:**  
  No `tabBarHideOnKeyboard`. Android paddingBottom same as iOS. No active indicator dot.

  **Changes:**
  1. Add `tabBarHideOnKeyboard: true` to `screenOptions`.
  2. `paddingBottom`: `Platform.OS === 'android' ? 8 : insets.bottom > 0 ? insets.bottom : 8`
  3. `tabBarIcon` return:
     ```tsx
     <View style={{ alignItems: 'center', gap: 2 }}>
       <IconComponent size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
       {focused && (
         <View style={{ width: 20, height: 4, borderRadius: 2, backgroundColor: Colors.primaryContainer }} />
       )}
     </View>
     ```
  4. Adjust `tabBarLabelStyle marginTop: -2` (compensates for indicator height, keeps total tab height consistent).

  **TypeScript:** No type changes.

  **Files:** `src/navigation/AppNavigator.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: active tab shows small gold bar beneath icon. Keyboard dismiss hides tab bar.

---

## Task 8: AccountScreen hero + QRScanner (covered by 1d)

- [ ] **11. AccountScreen — simulated hero gradient background**

  **Current state:**  
  `hero` style is `flexDirection: 'row', alignItems: 'center', gap: Spacing.md` — plain View on `Colors.background`. No card wrapper.

  **Changes:**
  1. Wrap `hero` View in new `heroContainer` View: `backgroundColor: Colors.surfaceContainerHigh, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(224,226,236,0.08)', overflow: 'hidden', padding: Spacing.md`
  2. Inside `heroContainer`, as the first child (before the existing `hero` row), add two absolutely-positioned Views:
     - `heroBg`: `position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: Colors.surfaceContainerHigh`
     - `heroOrb`: `position: 'absolute', left: -24, top: -24, width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.goldMuted`
  3. Remove the background from the existing `hero` View (it was inheriting from `SafeAreaView` `Colors.background`). No other change to `hero` layout.
  4. `avatarWrap` already has `borderWidth: 2, borderColor: Colors.goldBorder` ✅ — keep.

  Note: QRScanner success animation is covered by Task 1d (item 4 above) — no separate action needed.

  **TypeScript:** No type changes.

  **Files:** `src/screens/AccountScreen.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: hero section has dark card background with soft gold orb in upper-left. Avatar ring visible.

---

## Task A: Extend `src/types/api.ts`

- [ ] **12. Add new product customizer and coupon types to `api.ts`**

  **Current state:**  
  `CartLine` interface exists with `productId, name, price, quantity, image?, notes`. `AppliedCoupon` and `CartModifierSelected` do not exist.

  **Changes:**  
  After the existing `CartLine` interface (line ~130 of file), append these new interfaces — do NOT modify `CartLine`:

  ```ts
  // ── Product Customizer types ───────────────────────────────────
  export interface ProductVariantOption {
    id: string;
    name: string;
    priceDelta: number;
    isDefault?: boolean;
  }

  export interface ProductVariantGroup {
    id: string;
    title: string;
    required: boolean;
    minSelect: number;
    maxSelect: number;
    options: ProductVariantOption[];
  }

  export interface PreparationOption {
    id: string;
    label: string;
    options: string[];
    defaultValue: string;
  }

  export interface ProductModifierItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: 'garnish' | 'ingredient' | 'upsell';
  }

  export interface CartModifierSelected {
    id: string;
    name: string;
    priceDelta: number;
  }

  // ── Coupon ─────────────────────────────────────────────────────
  export interface AppliedCoupon {
    code: string;
    type: 'PERCENT' | 'FLAT' | '2X1';
    value: number;
    discountAmount: number;
    description: string;
  }
  ```

  **TypeScript:** Pure additions — no existing interface modified. No breaking changes.

  **Files:** `src/types/api.ts`

  **Verify:** `npx tsc --noEmit` — no errors.

---

## Task B: Extend `src/stores/useCartStore.ts`

- [ ] **13. Add coupon, tip, and smart totals to `useCartStore.ts`**

  **Current state:**  
  `CartState` has `cart, addToCart, removeFromCart, setLineQty, setLineNotes, clearCart, getTotalItems, getTotalPrice`. `getTotalPrice` returns `sum of price × qty`.

  **Changes:**
  1. Add `import type { AppliedCoupon } from '../types/api'` at top.
  2. Extend `CartState` interface — add fields:
     ```ts
     appliedCoupon: AppliedCoupon | null;
     tipPercent: number;
     applyCoupon: (coupon: AppliedCoupon) => void;
     removeCoupon: () => void;
     setTipPercent: (percent: number) => void;
     getSubtotal: () => number;
     getDiscountAmount: () => number;
     getTipAmount: () => number;
     getTotalWithTipAndDiscount: () => number;
     ```
  3. Add initial state: `appliedCoupon: null, tipPercent: 10`
  4. Implement new methods:
     - `applyCoupon`: `set({ appliedCoupon: coupon })`
     - `removeCoupon`: `set({ appliedCoupon: null })`
     - `setTipPercent`: `set({ tipPercent: percent })`
     - `getSubtotal`: `() => get().cart.reduce((s, i) => s + i.price * i.quantity, 0)` — same as `getTotalPrice`, semantic alias
     - `getDiscountAmount`: ```ts
       () => {
         const { appliedCoupon, getSubtotal } = get();
         if (!appliedCoupon) return 0;
         const subtotal = getSubtotal();
         if (appliedCoupon.type === 'PERCENT') return Math.round(subtotal * appliedCoupon.value / 100);
         if (appliedCoupon.type === 'FLAT') return Math.min(appliedCoupon.value, subtotal);
         return 0; // 2X1 handled at item level in future
       }
       ```
     - `getTipAmount`: `() => { const base = get().getSubtotal() - get().getDiscountAmount(); return Math.round(base * get().tipPercent / 100); }`
     - `getTotalWithTipAndDiscount`: `() => get().getSubtotal() - get().getDiscountAmount() + get().getTipAmount()`
  5. `getTotalPrice` remains unchanged (keeps FloatingCartBar working).
  6. `appliedCoupon` and `tipPercent` are included in persist (they are part of the state object passed to `set` — Zustand persist serializes the whole state by default).

  **TypeScript:** `CartState` interface extended — no removal of existing fields. `AppliedCoupon` import from `../types/api`.

  **Files:** `src/stores/useCartStore.ts`

  **Verify:** `npx tsc --noEmit` — no errors.

---

## Task C: Create `src/components/ProductCustomizerSheet.tsx`

- [ ] **14. Create new `ProductCustomizerSheet.tsx` component (parallel to ModifierModal)**

  **This is a new file.** Does not replace `ModifierModal` — both coexist. SommelierCards in CartaScreen and HomeScreen will use this; CompactProductRow continues using `ModifierModal`.

  **Props (drop-in compatible with ModifierModal):**
  ```ts
  interface ProductCustomizerSheetProps {
    visible: boolean;
    product: ProductPublicDTO | null;
    onClose: () => void;
    onConfirm: (product: ProductPublicDTO, quantity: number, notes: string) => void;
  }
  ```

  **Internal state:**
  ```ts
  const [quantity, setQuantity] = useState(1);
  const [iceChoice, setIceChoice] = useState<string>('Normal');
  const [citrusChoice, setCitrusChoice] = useState<string>('Limón');
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [freeText, setFreeText] = useState('');
  ```

  **ADDON_OPTIONS (hardcoded for Phase 1):**
  ```ts
  const ADDON_OPTIONS = [
    { id: 'papas', label: 'Papas Rústicas con Alioli', price: 4200 },
    { id: 'pinchos', label: 'Pinchos de Aceitunas', price: 3800 },
  ] as const;
  ```

  **Computed notes string:**
  ```ts
  const buildNotes = (): string => {
    const parts: string[] = [];
    if (product?.type === 'drink') {
      parts.push(iceChoice !== 'Normal' ? iceChoice : '');
      parts.push(citrusChoice !== 'Limón' ? citrusChoice : '');
    }
    selectedAddons.forEach(id => {
      const a = ADDON_OPTIONS.find(o => o.id === id);
      if (a) parts.push(`+${a.label.split(' con')[0].split(' de ')[0].trim()}`);
    });
    const bracketContent = parts.filter(Boolean).join(' | ');
    const bracket = bracketContent ? `[${bracketContent}]` : '';
    return [bracket, freeText].filter(Boolean).join(' ');
  };
  ```

  **Computed total:**
  ```ts
  const addonTotal = Array.from(selectedAddons).reduce((sum, id) => {
    const a = ADDON_OPTIONS.find(o => o.id === id);
    return sum + (a?.price ?? 0);
  }, 0);
  const unitPrice = (product?.dynamicPrice ?? product?.price ?? 0) + addonTotal;
  const totalPrice = unitPrice * quantity;
  ```

  **Layout:**
  1. `Modal animationType="slide" transparent onRequestClose={onClose}`
  2. Overlay: `rgba(0,0,0,0.85)`
  3. Sheet: `backgroundColor: Colors.surfaceContainer, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, maxHeight: '92%'`
  4. **Hero header** (if `product.image`): `View height: 200, overflow: 'hidden'`. `Image` full-bleed with `resizeMode="cover"`. Gradient simulation: 2 absolute Views (solid bottom 40% + fade 30%). X button: `position: 'absolute', top: 12, right: 12` — `backgroundColor: 'rgba(16,19,26,0.70)', borderRadius: Radius.full`. Heart button: `position: 'absolute', top: 12, left: 12`.
  5. **Info area** below hero (padding `Spacing.md`):
     - `Typography.headlineLg, color: Colors.onSurface` — product name
     - `Typography.priceLg, color: Colors.primary` — base price
     - `Typography.bodyMd, color: Colors.onSurfaceVariant` — description (max 2 lines)
     - Badge row: drink badge `🍸 Trago` (gold), author badge `✦ De Autor` (purple `#8B5CF6`), vegan badge `🌱 Vegano` (success) — conditional per product fields
  6. **Drink options** (only if `product.type === 'drink'`):
     - Section label: "Hielo" — exclusive chips: ["Normal", "Poco Hielo", "Sin Hielo"]
     - Section label: "Cítrico" — exclusive chips: ["Limón", "Naranja", "Pomelo", "Sin Cítrico"]
     - Chip style: `paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1`. Resting: `backgroundColor: Colors.surfaceContainerHigh, borderColor: Colors.outlineVariant`. Selected: `backgroundColor: Colors.goldMuted, borderColor: Colors.primaryContainer`. Text: `...Typography.labelMd`. Selected text: `color: Colors.primary`.
  7. **Addon upsell section**: "Acompañamientos". Each option: row with name + price badge + checkbox. Checkbox visual: `width: 20, height: 20, borderRadius: Radius.xs, borderWidth: 1`. Unchecked: `borderColor: Colors.outlineVariant`. Checked: `backgroundColor: Colors.goldMuted, borderColor: Colors.primaryContainer` with ✓ character `color: Colors.primary`.
  8. **Notes input**: same as ModifierModal but placeholder "Alergias, instrucciones especiales...". Below: suggestion chips ["Sin azúcar", "Sin gluten", "Poco hielo extra"] (additive, same as ModifierModal preset pattern).
  9. **Sticky footer** (not inside ScrollView — rendered after): `flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.outlineVariant, backgroundColor: Colors.surfaceContainer`.
     - Stepper: same as ModifierModal
     - CTA button: `flex: 1, backgroundColor: Colors.primaryContainer, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: Radius.lg, ...(Elevation.goldCTA as object)`
     - CTA text: `AGREGAR AL PEDIDO · $${totalPrice.toLocaleString('es-AR')}`
  10. On confirm: `Haptics.notificationAsync(Success)`, `onConfirm(product, quantity, buildNotes())`, reset state, `onClose()`.

  **Export:** `export const ProductCustomizerSheet: React.FC<ProductCustomizerSheetProps> = ...` (named export)

  **Files:** `src/components/ProductCustomizerSheet.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: open from CartaScreen SommelierCard → hero image + options sections render. Total updates in real time when addons selected.

---

## Task D: Integrate `ProductCustomizerSheet` in CartaScreen + HomeScreen

- [ ] **15. Wire `ProductCustomizerSheet` into `CartaScreen.tsx` and `HomeScreen.tsx`**

  ### CartaScreen
  1. Import `ProductCustomizerSheet` from `../components/ProductCustomizerSheet`.
  2. Add state: `const [customizerProduct, setCustomizerProduct] = useState<ProductPublicDTO | null>(null)`.
  3. `showCustomizer` = `customizerProduct !== null`.
  4. Find the `SommelierCard` render call (currently passes `onAdd` which opens `ModifierModal`). Change `onAdd` for `SommelierCard` to: `(p) => setCustomizerProduct(p)` — this opens the customizer instead.
  5. `CompactProductRow.onAdd` continues using `ModifierModal` via existing `handleOpenModal` — no change.
  6. Render `<ProductCustomizerSheet visible={!!customizerProduct} product={customizerProduct} onClose={() => setCustomizerProduct(null)} onConfirm={handleConfirm} />` where `handleConfirm` is the same function already used for `ModifierModal.onConfirm` (adds to cart + shows NToast).

  ### HomeScreen
  1. Import `ProductCustomizerSheet`.
  2. Add state: `const [customizerProduct, setCustomizerProduct] = useState<ProductPublicDTO | null>(null)`.
  3. In the `SommelierCard` `onAdd` call inside the sommelier list: `(p) => setCustomizerProduct(p)`.
  4. Add `handleCustomizerConfirm`: same cart-add logic as the existing inline `addToCart` call, then navigate to `Pedidos` or show toast.
  5. Render `<ProductCustomizerSheet visible={!!customizerProduct} product={customizerProduct} onClose={() => setCustomizerProduct(null)} onConfirm={handleCustomizerConfirm} />` inside the `SafeAreaView` (alongside the existing RouletteScreen Modal).

  **TypeScript:** `customizerProduct` typed as `ProductPublicDTO | null`. No new imports beyond what each screen already has.

  **Files:** `src/screens/CartaScreen.tsx`, `src/screens/HomeScreen.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: tapping `+` on a SommelierCard opens the full customizer sheet. CompactProductRow still opens ModifierModal.

---

## Task E: CartView — smart notes display + coupon line + tip sync

- [ ] **16. Enhance `CartView` in `PedidoScreen.tsx` for smart notes and store-synced totals**

  **Current state:**  
  `item.notes` shown as plain italic text. Totals computed inline in `CartView` (not from store). Tip state is local to `CartView`.

  **Changes:**
  1. **Smart notes display**: In each cart item, replace:
     ```tsx
     {item.notes ? <Text style={subStyles.itemNotes}>Nota: "{item.notes}"</Text> : null}
     ```
     With a function:
     ```ts
     function renderNotes(notes: string | undefined) {
       if (!notes) return null;
       const bracketMatch = notes.match(/\[(.+?)\]/);
       if (bracketMatch) {
         const parts = bracketMatch[1].split(' | ').filter(Boolean);
         const remainder = notes.replace(/\[.+?\]\s*/, '').trim();
         return (
           <View style={subStyles.notesRow}>
             {parts.map((p, i) => (
               <View key={i} style={subStyles.noteBadge}>
                 <Text style={subStyles.noteBadgeText}>{p}</Text>
               </View>
             ))}
             {remainder ? <Text style={subStyles.itemNotes}>{remainder}</Text> : null}
           </View>
         );
       }
       return <Text style={subStyles.itemNotes}>"{notes}"</Text>;
     }
     ```
     Add styles: `notesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 }`, `noteBadge: { backgroundColor: Colors.surfaceContainerHigh, borderRadius: Radius.xs, paddingHorizontal: 6, paddingVertical: 2 }`, `noteBadgeText: { ...Typography.labelSm, color: Colors.onSurfaceVariant, textTransform: 'none' as const }`.

  2. **Coupon line in totals**: In the `summaryCard`, after the subtotal row, add:
     ```tsx
     {appliedCoupon && (
       <View style={[subStyles.summaryRow]}>
         <Text style={[subStyles.summaryLabel, { color: Colors.success }]}>
           Cupón {appliedCoupon.code} ({appliedCoupon.type === 'PERCENT' ? `-${appliedCoupon.value}%` : `-$${appliedCoupon.value}`})
         </Text>
         <Text style={[subStyles.summaryValue, { color: Colors.success }]}>
           -{fmtPrice(discountAmount)}
         </Text>
       </View>
     )}
     ```
     Where `const { appliedCoupon, getSubtotal, getDiscountAmount, getTipAmount, getTotalWithTipAndDiscount } = useCartStore()`. Use these computed values for all summary rows.

  3. **Tip sync with store**: Change `const [tipPercent, setTipPercent] = useState(10)` in `CartView` to use the store's `tipPercent` and `setTipPercent`. The 5 tip options (`[0, 5, 10, 15, 20]`) already added in Task 4 are now driven by the store value.

  4. **Total styling**: Update `totalValue` style to use `...Typography.priceLg` which is already `Outfit 22px 600` — matches the spec.

  **TypeScript:** `useCartStore` destructure expanded — all new methods are in the extended interface from Task B. No new imports.

  **Files:** `src/screens/PedidoScreen.tsx`

  **Verify:** `npx tsc --noEmit`. Visual: cart items with `[Sin Hielo | +Papas]` notes display as mini-badges. Subtotal/discount/total rows correct.

---

## Task 9: Update project memory

- [ ] **17. Update `03-memoria-nebula-cliente.md`**

  **Changes:**
  1. **Section 15 "Stack completo"**: Update `Expo 52, React Native 0.76` → `Expo SDK 57, React Native 0.86.3, TypeScript 6.0.3`.
  2. **Section 10 "Componentes"**: Move `DealsCarousel`, `ModifierModal`, `ProductCard` from "Existentes compatibles (sin cambios)" to "Actualizados (Nocturne tokens)". Add `ProductCustomizerSheet` to "Nuevos".
  3. **Section 11 "Stores"**: Add note that `useCartStore` now includes `appliedCoupon`, `tipPercent`, smart total methods.
  4. **Section 21 "Estado actual"**: Mark `RouletteScreen` as "Rediseño completo Fase 2". Update pending items.
  5. **Add Section 22** before the "OBJETIVO FINAL" section:

     ```markdown
     # 22. MEJORAS VISUALES FASE 2

     ## [2026] — MIGRACIÓN VISUAL COMPLETA + ANIMACIONES + PRODUCT CUSTOMIZER

     ### Componentes migrados (legacy → Nocturne tokens completos)
     - DealsCarousel: Typography scale, Radius.xl, tokens semánticos directos.
     - ModifierModal: overlay 0.85, preset chips con estado seleccionado gold, Typography, goldCTA elevation.
     - ProductCard: Typography scale, badges mejorados con gold border, addButton en primaryContainer.
     - QRScannerScreen: rediseño completo + modo cámara (expo-camera CameraView) + modo teclado + success animation stagger.

     ### Componentes mejorados
     - SommelierCard: gradiente simulado (2 Views: gradientSolid + gradientFade).
     - AccountScreen: heroContainer card con gold orb simulado.
     - MesaCard: tercer botón "Repetir Ronda" en actions row.

     ### Nuevos componentes
     - ProductCustomizerSheet: customizer para SommelierCards — hero 16:9, secciones de hielo/cítrico, upselling hardcodeado, total dinámico. Notas compiladas en formato [Tag1 | Tag2] + texto libre.

     ### Animaciones (solo Animated + Easing de react-native — sin Reanimated, sin Skia)
     - AuthScreen: hero fadeIn + scale (600ms), card slideUp + fadeIn (delay 200ms), sliding pill tab (Animated.spring).
     - PedidoScreen: fade entre estados (150ms/300ms), item stagger CartView (50ms × index), progress bar Animated.timing (500ms ease-out, useNativeDriver: false), step circles scale spring.
     - HomeScreen: stagger de secciones (delays 0/100/200/300/400/500+80×i ms), pulsing dot en topBar (Animated.loop), quick access spring (scale 0.92→1).
     - RouletteScreen: border rotation loop (1200ms linear), result scale spring, result fade in 400ms, recipe chevron rotation 250ms.

     ### RouletteScreen — Rediseño completo
     - Estados: idle → spinning → result
     - Sistema de rareza: COMMON/RARE/EPIC/LEGENDARY con border color, glow, emoji, badges únicos
     - Rueda 220px con borde animado (rotation loop durante spin)
     - Integración useCartStore: "Pedir este trago" requiere tableId; navega a Pedidos post-add
     - Historial local (últimas 5, no persistido)
     - Sección receta expandible con chevron animado
     - Haptics: Heavy en inicio, Light cada 80ms (max 20), Success en resultado

     ### TrackingView — Kiosk-grade
     - Número de comanda gigante: #XXX en Outfit displayLg gold
     - Tiempo estimado dinámico (pending: 15min, in-progress: 8min)
     - Botones siempre visibles: "Pedir algo más" (→ Carta) + "Llamar al Mozo" (→ NToast)

     ### PedidoScreen — CartView mejoras
     - Selector de destino (Mesa / Retiro en Barra) arriba del carrito
     - Opciones de propina: 0/5/10/15/20% (sincronizado con useCartStore.tipPercent)
     - Notas como mini-badges cuando tienen formato [Tag | Tag]
     - Totales desde store (getSubtotal, getDiscountAmount, getTipAmount, getTotalWithTipAndDiscount)
     - Línea de cupón en verde cuando appliedCoupon está activo

     ### AppNavigator
     - tabBarHideOnKeyboard: true
     - Android paddingBottom fijo 8px
     - Indicador activo: barra gold 4×20px debajo del icono

     ### DECISIÓN: expo-linear-gradient no instalado
     Gradientes simulados con Views apiladas en SommelierCard y AccountScreen.
     Si se instala en el futuro: reemplazar con LinearGradient de expo-linear-gradient.

     ### DECISIÓN: solo Animated de react-native
     No se instala react-native-reanimated ni @shopify/react-native-skia.
     Suficiente para todas las animaciones requeridas en esta fase.
     ```

  6. **Add Section 23** — Plan Maestro de Producto (Fase 2):

     ```markdown
     # 23. PLAN MAESTRO DE PRODUCTO — VISIÓN A LARGO PLAZO

     ## Módulos registrados para iteraciones futuras

     ### M1 — Smart Fulfillment Header
     Selector de modo de consumo persistente (Mesa/Barra/Reserva) en el top header como bottom sheet.
     Reemplaza el gate reactivo tardío de PedidoScreen.
     Balance de puntos visible en el saludo.

     ### M2 — Menú de Alta Conversión
     - CategoryPills con scroll-spy real (SectionList + ViewabilityConfig).
     - Carrusel de combos/ofertas del día con ahorro explícito.
     - Filtros rápidos: Vegano, Sin TACC, Sin Alcohol, Favoritos.

     ### M3 — ProductCustomizerSheet Completo
     Fase 1 tiene versión básica con opciones hardcodeadas.
     Fase 2: radio groups para variantes reales del backend (gin/whisky premium con precios),
     upselling con items reales del catálogo, CartLine con id UUID para múltiples
     personalizaciones del mismo producto.

     ### M4 — Nebula Club Rewards
     - useLoyaltyStore: puntos (100 pts/$10.000), barra de nivel Bronce/Plata/Gold.
     - Cupones aplicables al carrito (applyCoupon ya soportado en useCartStore).
     - La ruleta otorga cupones canjeables.
     - Billetera de puntos VIP en AccountScreen.

     ### M5 — Smart Checkout
     - Desglose completo: subtotal, descuentos, propina, total.
     - Selector método de pago: Efectivo/Tarjeta/MercadoPago/Pagar con cuenta de mesa.
     - Split bill.

     ### M6 — Kiosk-Grade Live Tracker (Fase 2 extendida)
     Fase 1 ya tiene: número gigante, tiempo estimado, botones post-pedido.
     Fase 2: tracking independiente por item (línea de progreso por cada OrderItemDTO).

     ### M7 — In-Venue Table Session Hub (Fase 2 extendida)
     Fase 1 ya tiene: MesaCard con "Repetir Ronda" + "Llamar Mozo".
     Fase 2: consumo acumulado completo, "Pedir cuenta" con selector de método de pago.

     ### M8 — Performance
     - Cache offline del menú (AsyncStorage + expo-file-system).
     - Skeleton shimmer (NSkeleton ya implementado).
     - 60 FPS target validado con Flipper/React DevTools.

     ### Reservas — Mejoras
     - Selector de zona del local (Salón/Terraza/Barra).
     - Chips de ocasión especial (Cumpleaños/Aniversario).

     ### Infraestructura
     - expo-linear-gradient: instalar cuando se necesiten gradientes reales.
     - CartLine con campo id UUID para múltiples personalizaciones del mismo producto.
     ```

  **Files:** `mobile-client/03-memoria-nebula-cliente.md`

  **Verify:** Documentation-only. Read file to confirm consistency with implementation.

---

## Cross-cutting TypeScript reference

| Concern | Pattern |
|---------|---------|
| `Animated.Value` in components | `useRef(new Animated.Value(x)).current` |
| Loop animation handle | `useRef<Animated.CompositeAnimation \| null>(null)` |
| `setInterval` return type | `useRef<ReturnType<typeof setInterval> \| null>(null)` |
| Width animation (progress bar) | `useNativeDriver: false` — layout props cannot use native driver |
| All other animations | `useNativeDriver: true` |
| Tab pill translate | `transform: [{ translateX: tabIndicatorX }]` — works with `useNativeDriver: true` |
| `RouletteDrinkDTO._id` | MongoDB `_id` — not `id`. Confirmed in `types/api.ts`. |
| `NocturneColors` in RouletteScreen | `import { Colors, NocturneColors } from '../theme/colors'` |
| Bracket notes format | `[Tag1 \| Tag2] free text` — parseable by `notes.match(/\[(.+?)\]/)` |
| `Set<string>` state | `useState<Set<string>>(new Set())` — TS6 generics supported |

---

## Verification command

```bash
# From mobile-client directory:
npx tsc --noEmit
# Then:
npx expo start
```

No test runner exists in this project. Verification = TypeScript compilation passing + visual inspection in Expo Go.

---

## Fase 2 — Funcionalidades pendientes (documentadas, NO implementar en esta iteración)

- M1: Fulfillment Switcher en header (bottom sheet de selección mesa/barra/reserva)
- M2: Sticky Category Bar con scroll-spy (SectionList + ViewabilityConfig)
- M2: Filtros dietarios rápidos en CartaScreen (Vegano, Sin TACC, Sin Alcohol)
- M3: ProductCustomizerSheet completo (variantes/adicionales del backend reales, CartLine UUID)
- M4: Nebula Club Rewards (useLoyaltyStore, puntos, cupones, canjes, nivel VIP)
- M5: Smart Checkout con selector de método de pago (Efectivo/Tarjeta/MercadoPago)
- M5: Split bill
- M6: Tracking independiente por item
- M8: Offline cache del menú (AsyncStorage + expo-file-system)
- Reservas: Selector de zona (Salón/Terraza/Barra) + ocasión especial
- Cuenta: Billetera de puntos VIP y canjes
- CartLine UUID: múltiples personalizaciones del mismo producto en el carrito
- expo-linear-gradient: instalar cuando se requieran gradientes nativos reales
