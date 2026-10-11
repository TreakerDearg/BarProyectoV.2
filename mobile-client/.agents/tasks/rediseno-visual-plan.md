# Steps — Rediseño Visual Completo «NEBULA EMBER» v3 (mobile-client)

> **REGLA DE SESIÓN**: antes de implementar, leer `mobile-client/03-memoria-nebula-cliente.md` (secciones 2, 4-6, 16-17, 20-23) y `mobile-client/.agents/tasks/rediseno-visual-plan.md` (este archivo). Al cerrar cada fase, actualizar ambos archivos. Comentarios, docs y mensajes de UI en español rioplatense con voseo; identificadores en inglés. Ningún cambio puede aumentar la deuda técnica (skill sin-deuda-tecnica).

## Contexto

- **App**: `bartender-system/mobile-client` — Expo SDK 57, RN 0.86.3, TS 6.0.3, React 19.2.3. Sin test runner: verificación = `npx tsc --noEmit` + revisión visual en Expo Go.
- **Decisiones del usuario (2026-10-11)**:
  1. **Identidad**: «nueva paleta, mismo mood» — se mantiene el ADN nocturno premium (resto-bar); se reemplazan paleta de acentos y tipografía.
  2. **Alcance**: total — tokens, componentes, pantallas, motion, anatomía de pantallas y UX donde convenga. Se mantienen la navegación de 5 tabs y los flujos funcionales.
  3. **Dependencias**: se permiten paquetes justificados: `expo-image`, `expo-linear-gradient`, `@expo-google-fonts/fraunces`.
- **Referencia QSR** (McDonald's/KFC/Starbucks): referencia de **usabilidad** (claridad, jerarquía, conversión, patrones kiosco), nunca de identidad visual — regla ya fijada en `01-design-system-nebula-cliente.md`. La identidad es propia: **NEBULA EMBER** (brasa cálida sobre noche).
- **Estado de partida**: FASE 0/2 y FEAT-002 ya implementadas (status.ts, StatusBadge, CartaScreen con scroll-spy sticky, tracker kiosk-grade, ProductCustomizerSheet, Roulette rediseñada). El rediseño parte de ese estado; no re-propone trabajo hecho.

## Lenguaje de diseño v3 — NEBULA EMBER

### Paleta (baseline; validar WCAG AA en Fase 1) — `src/theme/colors.ts`

Mantener TODOS los nombres de export (`NocturneColors`, `Colors`) y TODAS las claves existentes (32+ importadores dependen de ellas). Se reescriben valores y se agregan claves nuevas.

**Superficies (escalera cálida):**

| Token | Hex | Uso |
|---|---|---|
| surfaceContainerLowest | `#0C0A0D` | fondo profundo |
| background / surfaceDim | `#131014` | canvas |
| surfaceContainerLow | `#1A1619` | pills resting |
| surfaceContainer | `#201B1F` | cards |
| surfaceContainerHigh | `#2A2328` | cards destacadas |
| surfaceContainerHighest | `#352C31` | inputs, chips activos |

**Texto (crema cálida):** `onSurface` `#F1E8DE` · `onSurfaceVariant` `#D6C6B6` · `outline` `#9E8C7B` · `outlineVariant` `#4D4139`

**Ember (primario, reemplaza al oro):** `primary` `#F08A5A` (highlight/activo) · `primaryContainer` `#D96A3B` (fill CTA) · `onPrimary` `#2A0F04` · `goldGlow`→`emberGlow` `rgba(240,138,90,0.25)` · `goldMuted`→`emberMuted` `rgba(240,138,90,0.12)`

**Wine (secundario):** `secondary` `#A03D52` · `secondaryContainer` `#5E2130` · `onSecondaryContainer` `#FFE3E8`

**Gold (terciario, uso reservado):** se conservan `#F3BE59` / `#D4A340` — solo para: raridad LEGENDARY de la ruleta, niveles de fidelidad VIP y sellos premium. Deja de ser el color de acción.

**Semánticos:** `success` `#3FBF7F` · `warning` `#E5A43D` · `error` `#FF7A6E` / `errorContainer` `#8E1F2C` · `info` `#5AB8E8`

### Tipografía — `src/theme/typography.ts`

Display pasa de Outfit a **Fraunces** (corporativa, cálida, editorial); body/UI queda en **Inter**:

| Token | Familia | Size/Line | Nota |
|---|---|---|---|
| displayLg | Fraunces 600 | 34/40 | saludo, títulos de pantalla |
| displaySm | Fraunces 600 | 27/32 | nombres de producto, resultado ruleta |
| headlineLg | Fraunces 600 | 22/28 | títulos de sección |
| headlineSm | Inter 600 | 18/24 | subtítulos |
| titleMd | Inter 500 | 16/22 | sin cambio |
| body*/label* | Inter (igual) | igual | sin cambio |
| price | Fraunces 600 | 19/24 | precios en cards |
| priceLg | Fraunces 600 | 24/28 | totales |
| orderNumber | Fraunces 700 | 56/60 | NUEVO — número de comanda gigante |

- Carga en `App.tsx`: Inter (4 pesos) + Fraunces (600, 700) = **6 fuentes vs 8 actuales** (mejora de arranque). Eliminar `@expo-google-fonts/outfit` (imports y paquete) al cerrar Fase 1.
- **Regla de fallback**: si las cifras de Fraunces no rinden en precios (verificación visual Fase 1), `price`/`priceLg` pasan a Inter 700 y se registra la decisión en memoria. Alternates de display documentados: Playfair Display / DM Serif Display.

### Gradientes y movimiento (archivos NUEVOS)

- `src/theme/gradients.ts`: pares de color para `expo-linear-gradient` — `heroOverlay` (transparent→background, 55% inferior), `emberCTA` (`#F08A5A`→`#C8551F`), `nightWash` (background→transparent, headers), `cardSheen` (ember 8%→transparent).
- `src/theme/motion.ts`: `fast: 150`, `base: 250`, `slow: 400`; easing estándar; preset `springPress` (friction 8) para micro-interacciones.
- Reglas: transform/opacity → `useNativeDriver: true`; layout (width) → `false`; todo loop con cleanup en `useEffect`.

## Fases de implementación

Dependencias: `0 → 1 → 2 → 3 → 4 → 5 → 6`. Dentro de 3 y 4, por componente/pantalla. Commit de git por fase (rollback).

### Fase 0 — Fundaciones (sin riesgo visual)

- [x] 1. Leer `03-memoria-nebula-cliente.md` y `.agents/tasks/plan.md` (contexto histórico).
- [x] 2. Crear `.agents/tasks/rediseno-visual-plan.md` con este plan (checkboxes por tarea) y la regla de lectura al tope.
- [x] 3. Auditar hardcodeos: `rg "rgba\(|#[0-9A-Fa-f]{6}"` en `src/components` y `src/screens`; catálogo registrado abajo.
- [x] 4. Instalar dependencias: `npx expo install expo-image expo-linear-gradient` + `npm i @expo-google-fonts/fraunces` (todas compatibles Expo Go/EAS).
- [x] 5. Commit: `chore(mobile): fundaciones rediseño v3` (incluye estado de partida FEAT-002/FASE 2 sin commitear + puntos de rollback).

### Fase 1 — Tokens NEBULA EMBER (máxima propagación, mínimo toque)

**Archivos**: `src/theme/colors.ts`, `typography.ts`, `elevation.ts` (nuevo `emberCTA`, `goldCTA` queda como alias deprecated), `spacing.ts` (sin cambios estructurales), NEW `gradients.ts` + `motion.ts`, `index.ts` (exportar nuevos), `App.tsx` (font load 6 fuentes, `NavigationTheme` fonts/colors, splash).

- [x] 6. Reescribir valores de paleta según tabla (keys y nombres de export intactos). `colors.ts`: escalera cálida + ember (primary) + wine (secondary) + gold reservado (`vipGold*`, tertiary); claves nuevas `ember*`/`wine*`/`vipGold*`; los `gold*` de acción quedan apuntando a ember. `statusCompleted` (legacy, sin uso) pasa a `outline` neutro.
- [x] 7. Actualizar tipografía según tabla + `orderNumber`. `FontFamily` = Fraunces 600/700 + Inter (4); `headlineSm`/`titleMd` a Inter; `price`/`priceLg` a Fraunces; `orderNumber` nuevo (56/60). `App.tsx` carga 6 pesos; `@expo-google-fonts/outfit` desinstalado. Fix puntual para no dejar fuente en fallback: `RouletteScreen` tenía 2 `fontFamily: 'Outfit_…'` hardcodeados (L675/L807) → migrados a `displaySm` y `FontFamily.frauncesBold`.
- [x] 8. **Validación WCAG** — 27/29 pares OK, ver tabla abajo. Ajustes aplicados: `emberDeep` `#C8551F`→`#D2602A` (4.09→4.66:1 sobre `onPrimary`); regla de uso: **wine nunca como texto** sobre canvas/superficies (2.95:1) — solo fill con `#FFE3E8` encima.
- [x] 9. Verificación: `npx tsc --noEmit` limpio. Revisión visual en Expo Go **pendiente del usuario** (toda la app cambia de mood vía tokens, sin editar componentes). Los hardcodeos catalogados quedan como pendientes por componente (fases 2-4).

**Nuevos archivos de esta fase**: `gradients.ts` (heroOverlay, emberCTA `#F08A5A→#D2602A`, nightWash, cardSheen + `Direction`), `motion.ts` (`Motion.fast/base/slow`, `Easings`, `SpringPress` fricción 8), `elevation.ts` (`emberCTA`; `goldCTA` queda como alias `@deprecated`), `index.ts` exporta todo.

#### Tabla WCAG (Fase 1 — pares texto/fondo)

| Par (texto sobre fondo) | Ratio | AA |
|---|---|---|
| onSurface `#F1E8DE` / background `#131014` | 15.59 | ✓ |
| onSurface / surfaceContainer `#201B1F` | 14.00 | ✓ |
| onSurface / surfaceContainerHigh `#2A2328` | 12.66 | ✓ |
| onSurfaceVariant `#D6C6B6` / background · / card · / cardHigh | 11.34 · 10.19 · 9.21 | ✓ |
| outline `#9E8C7B` (texto muted) / background · / card | 5.84 · 5.24 | ✓ |
| primary `#F08A5A` / background · / card · / cardHigh | 7.63 · 6.86 · 6.20 | ✓ |
| onPrimary `#2A0F04` / primaryContainer `#D96A3B` · / emberDeep `#D2602A` · / primary | 5.20 · 4.66 · 7.26 | ✓ |
| onSecondaryContainer `#FFE3E8` / secondaryContainer `#5E2130` · / secondary `#A03D52` | 10.02 · 5.30 | ✓ |
| **secondary `#A03D52` como texto / canvas** | **2.95** | **✗ → solo fill** |
| success `#3FBF7F` / background | 8.07 | ✓ |
| warning `#E5A43D` / background · / card | 8.73 · 7.84 | ✓ |
| error `#FF7A6E` / background · / card | 7.43 · 6.67 | ✓ |
| info `#5AB8E8` / background | 8.50 | ✓ |
| vipGold `#F3BE59` / background · / card | 11.08 · 9.95 | ✓ |
| onSurface / errorContainer `#8E1F2C` · onSurfaceVariant / errorContainer | 7.28 · 5.29 | ✓ |
| outline / background (borde UI, min 3:1) | 5.84 | ✓ |

### Fase 2 — Primitivas de identidad

**Archivos**: NEW `src/hooks/usePressScale.ts`, NEW `src/components/shared/NBadge.tsx` (unifica badges repetidos), `NButton.tsx` (fill con LinearGradient ember, press scale, API intacta), `NInput.tsx`, `NToast.tsx`, `NSkeleton.tsx` (shimmer cálido), `NEmptyState.tsx`, `StatusBadge.tsx`, `AppNavigator.tsx` (barra cálida, indicador ember), `FloatingCartBar.tsx` (restyle; lógica intacta).

- [x] 10. Hook `usePressScale` (spring fricción 8, native driver) + `NBadge` (8 tonos tint/solid, icono opcional) creados. Migrados: `NButton` (gradiente `emberCTA` + press scale + `accessibilityState`; API intacta), `NInput` (recessed `surfaceContainerLow` + foco ember), `NToast` (tokens semánticos + `Motion.base/fast`), `NSkeleton` (bordes `borderSubtle`), `NEmptyState` (halo ember), `FloatingCartBar` (pill ember con gradiente + press scale; lógica del carrito intacta). `StatusBadge` ya era 100% token-driven: sin cambios.
- [x] 11. Tab bar: `surfaceContainerLow` + `borderSubtle` + indicador ember de 20 px + badge del carrito con texto `onPrimary`; se conservan safe areas (`insets.bottom`) y `tabBarHideOnKeyboard: true`.
- [x] 12. Verificación: `npx tsc --noEmit` limpio. Revisión visual en Expo Go **pendiente del usuario** (NButton primary con gradiente y press scale; pill del carrito ember; badges NBadge listos para Fase 3).

**Tokens nuevos (aditivos)**: `borderSubtle`, `successBorder`, `warningBorder`, `errorBorder`, `infoBorder` — eliminan literales rgba en NToast/NSkeleton/NEmptyState/AppNavigator.

### Fase 3 — Componentes de flujo (uno por uno, props aditivas únicamente)

**Archivos**: `shared/SommelierCard.tsx` (expo-image + LinearGradient real + NBadge + press), `shared/CompactProductRow.tsx`, `shared/ProductGridCard.tsx` (placeholder con icono en vez de emoji), `HeroCarousel.tsx` (slides 16:9 + gradiente + dots ember), `CategoryPills.tsx`, `CategoryHeroRow.tsx`, `DealsCarousel.tsx`, `shared/PromoBanner.tsx`, `shared/MesaCard.tsx`, `shared/PedidoActivoBanner.tsx`, `shared/CartItemRow.tsx`, `shared/FulfillmentSheet.tsx`, `ModifierModal.tsx`, `ProductCustomizerSheet.tsx` (hero expo-image + gradiente), `shared/LoyaltyCard.tsx`, `shared/RewardsCatalog.tsx`, `roulette/*` (recoloreo ember/wine; LEGENDARY conserva gold).

- [x] 13. Migrados a `expo-image` (`contentFit="cover"` + `cachePolicy="memory-disk"` + `transition={150}`): `SommelierCard`, `CompactProductRow`, `ProductGridCard`, `HeroCarousel`, `PromoBanner`, `CartItemRow`, `ProductCustomizerSheet` (hero) y `RewardsCatalog`. El fallback emoji de `ProductGridCard` pasó a icono `GlassWater`; `CartItemRow` 🍹 → `GlassWater`; en `ProductCustomizerSheet` se eliminaron además el emoji del hero y el `#8B5CF6` literal.
- [x] 14. Cambios aditivos únicamente (API de todos los consumidores intacta; sin props rotas). Hardcodeos eliminados en los 18 componentes: gradientes reales (`heroOverlay`/`emberCTA`/`cardSheen`), badges unificados con `NBadge` (incl. `DealsCarousel`, `HeroCarousel` y `ProductCustomizerSheet`), tintes de categoría rgba → tokens semánticos (`emberMuted`/`wineMuted`/`warningMuted`/`successMuted`/`infoMuted`/`wineGlow`), `casinoBackground`→`surfaceContainerLowest`, `Elevation.goldCTA`→`emberCTA`, y `Colors.goldDark` mal usado como acción → `emberDeep` (`CompactProductRow` `addBtnActive`). Ruleta: `MobileWheel`/`GoldenTicket`/`RevealExplosion` recoloreados a ember/wine con oro reservado solo para LEGENDARY; EPIC pasa de `#a855f7` a `wine` (texto vía `onSecondaryContainer`, respeta la regla «wine nunca como texto»). `SommelierCard` suma press scale (`usePressScale(0.98)`). Únicos rgba restantes en componentes: alphas neutros de efectos de render, centralizados como consts locales documentadas (`SVG_EFFECT` en `MobileWheel`, `SHIMMER_COLOR` en `GoldenTicket`).
- [x] 15. Verificación: `npx tsc --noEmit` limpio. Revisión visual en Expo Go **pendiente del usuario** (press scale en cards, gradientes ember reales, badges consistentes, ruleta recoloreada).

**Tokens nuevos (aditivos)**: `fidelityBronze` `#CD7F32`, `fidelitySilver` `#A8A9AD`, `fidelityPlatinum` `#38BDF8` — escalera VIP de `LoyaltyCard` sin literales (nivel Gold usa `vipGold` reservado). **Cuidado**: `Colors.goldDark` ahora apunta al oro VIP (`vipGoldDark`), NO es color de acción; los estados activos van con `emberDeep`.

### Fase 4 — Pantallas (orden por riesgo; Pedido SIEMPRE última)

- [ ] 16. **Home** (`HomeScreen.tsx`): hero de bienvenida con imagen full-bleed + saludo sobre `nightWash`; chip de fulfillment visible en top bar; reordenar: hero → estado (mesa/pedido) → deals → accesos rápidos (tiles más grandes) → Sommelier (carrusel 80% viewport) → Ruleta CTA. Motion con tokens.
- [ ] 17. **Carta** (`CartaScreen.tsx`): conservar sticky+scroll-spy; hero de sección (primer ítem 16:9); precios protagonistas (`priceLg` ember); pills rediseñadas; imágenes más grandes; FloatingCartBar como pill ember con count + total + «Ver pedido».
- [ ] 18. **Reservas** (`ReservasScreen.tsx`): hero con imagen; steppers y chips más grandes (ember); éxito inline.
- [ ] 19. **Auth** (`AuthScreen.tsx`): fondo con gradiente/glow cálido + marca; card slide-up; CTA gradiente.
- [ ] 20. **Account** (`AccountScreen.tsx`): hero VIP con anillo de nivel (gold reservado); stats row; restyle de listas.
- [ ] 21. **Roulette** (`RouletteScreen.tsx`): wheel y bordes en ember/wine; LEGENDARY conserva gold.
- [ ] 22. **QRScanner** (`QRScannerScreen.tsx`): marco ember + keypad restyle.
- [ ] 23. **Pedido** (`PedidoScreen.tsx` — último): destino más fuerte; propina segmented; resumen con total gigante (Fraunces); CTA «Confirmar pedido · $X» con gradiente; Tracking con `orderNumber` gigante + progress glow ember. **No tocar** lógica de stores, socket ni cálculos; solo presentación.
- [ ] 24. Verificación por pantalla: checklist manual (flujo pedir→carrito→confirmar→tracking; reserva; login; ruleta; QR) + tsc.

### Fase 5 — Performance, accesibilidad y pulido

- [ ] 25. `React.memo` en items de listas (SommelierCard, CompactProductRow, ProductGridCard, CartItemRow, MesaCard).
- [ ] 26. Debounce 300 ms en la búsqueda de CartaScreen; verificar memoización de secciones.
- [ ] 27. Auditoría final: contraste AA, touch targets ≥44 px, estados empty/loading/error en todas las pantallas.
- [ ] 28. Prueba en dispositivo Android gama baja (FPS, arranque con 6 fuentes vs 8) + Expo Go iOS.
- [ ] 29. `scan-debt.mjs` (skill sin-deuda-tecnica): sin aumento de deuda; comentarios en rioplatense.

### Fase 6 — Documentación y cierre

- [ ] 30. `03-memoria-nebula-cliente.md`: nueva **Sección 28 «NEBULA EMBER (v3)»** — decisiones, tablas (paleta/tipografía/motion/gradientes), alternativas rechazadas, catálogo de hardcodeos eliminados, estado por fase; actualizar secciones 2 (design system activo), 4-6 (tipografía/espaciado/elevación), 21-23 (estado/roadmap).
- [ ] 31. `01-design-system-nebula-cliente.md`: revisión v3 de paleta y tipografía + nota «Revisión NEBULA EMBER».
- [ ] 32. `.agents/tasks/rediseno-visual-plan.md` (este archivo): marcar checkboxes, registrar pendientes.
- [ ] 33. Commit final: `feat(mobile): rediseño visual NEBULA EMBER v3`.

## Catálogo de hardcodeos (auditoría Fase 0)

Comando: `rg "rgba\(|#[0-9A-Fa-f]{6}"` en `mobile-client/src/components` y `mobile-client/src/screens` → **171 literales de color en 30 archivos**. Pendiente de eliminar por componente en fases 2-4:

| Archivo | Literales | Nota |
|---|---|---|
| `roulette/MobileWheel.tsx` | 21 | recoloreo ember/wine en Fase 3 |
| `roulette/GoldenTicket.tsx` | 21 | conserva gold (LEGENDARY) + ember |
| `screens/AccountScreen.tsx` | 18 | hero orb — Fase 4 |
| `screens/PedidoScreen.tsx` | 15 | L256 «~15 min» — Fase 4 (último) |
| `screens/ReservasScreen.tsx` | 13 | Fase 4 |
| `components/ProductCustomizerSheet.tsx` | 11 | Fase 3 |
| `screens/RouletteScreen.tsx` | 7 | Fase 4 |
| `shared/LoyaltyCard.tsx` | 6 | gold reservado (VIP) |
| `shared/NToast.tsx` | 6 | Fase 2 |
| `components/CategoryHeroRow.tsx` | 6 | Fase 3 |
| `shared/SommelierCard.tsx` | 5 | L191, L212-227, L232, L272 — Fase 3 |
| `shared/NButton.tsx` | 5 | Fase 2 (gradiente ember) |
| `screens/QRScannerScreen.tsx` | 5 | Fase 4 |
| `shared/RewardsCatalog.tsx` | 4 | Fase 3 |
| `shared/NInput.tsx` | 3 | Fase 2 |
| `screens/AuthScreen.tsx` | 3 | Fase 4 |
| `screens/CartaScreen.tsx` | 3 | Fase 4 |
| `shared/MesaCard.tsx` | 3 | Fase 3 |
| `shared/ProductGridCard.tsx` | 2 | fallback emoji — Fase 3 |
| `shared/PromoBanner.tsx` | 2 | Fase 3 |
| `roulette/RevealExplosion.tsx` | 2 | Fase 3 |
| `shared/NSkeleton.tsx` | 2 | shimmer — Fase 2 |
| `components/DealsCarousel.tsx` | 1 | Fase 3 |
| `shared/CartItemRow.tsx` | 1 | Fase 3 |
| `shared/NEmptyState.tsx` | 1 | Fase 2 |
| `screens/HomeScreen.tsx` | 1 | Fase 4 |
| `components/ModifierModal.tsx` | 1 | Fase 3 |
| `components/FloatingCartBar.tsx` | 1 | Fase 2 |
| `components/CategoryPills.tsx` | 1 | Fase 3 |
| `shared/CompactProductRow.tsx` | 1 | Fase 3 |

Hardcodeos conocidos fuera de components/screens: `navigation/AppNavigator.tsx` L91-103 (tab bar) → **eliminados en Fase 2** (verificado con grep). Objetivo: **0 literales de color en componentes y pantallas** al cerrar Fase 4; todo color sale de `src/theme/colors.ts` (más `gradients.ts` para gradientes).

**Estado tras el cierre de Fase 3**: 0 literales de paleta en `src/components/**` (fases 2-3 completas). Restan solo: alphas neutros de efecto ya documentados como consts locales + `src/screens/*` (Fase 4: `RouletteScreen` L56/685/746/767/798, `PedidoScreen` 15, `CartaScreen` L653/674/702, `HomeScreen` L682, `AccountScreen` L274/297, `ReservasScreen`, `AuthScreen`, `QRScannerScreen`).

## Plan de pruebas

- Por fase: `npx tsc --noEmit` limpio + revisión visual en Expo Go (Android prioritario).
- Contrato de coherencia: nunca dejar una pantalla mitad migrada al cerrar una fase.
- Persistencia: crear carrito → cerrar/abrir app → carrito intacto (protege AsyncStorage/Zustand).
- Socket: verificar `order:update`/`item:ready` durante tracking tras tocar PedidoScreen.
- A11y: contraste AA validado en Fase 1 y revalidado en Fase 5.
- No hay test runner; no se introduce uno en este rediseño.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Romper cálculos del carrito / persistencia | No tocar stores ni schemas (solo presentación); prueba de round-trip de persistencia |
| Regresión en tracking/socket | No modificar `socketService.ts` ni nombres de eventos |
| Incoherencia visual a mitad de migración | Estrategia token-first (Fase 1 propaga todo); commits y verificación por fase |
| Contraste insuficiente con la paleta cálida | Validación WCAG dedicada (Fase 1) con regla de ajuste ±5% registrada |
| Regresión de imágenes al migrar a expo-image | Patrón único (`contentFit="cover"` + cachePolicy) y migración componente por componente |
| Jank por gradientes/sombras/motion | native driver solo transform/opacity; limitar gradientes simultáneos; probar en gama baja |
| Props compartidas rotas | Solo cambios aditivos; grep de consumidores antes de tocar |
| Fuente Fraunces no rinde (cifras/pesos) | Regla de fallback documentada (precios a Inter 700; alternates Playfair/DM Serif) |

## Alternativas rechazadas

1. **Reboot total de identidad (fondos claros)** — el usuario eligió «mismo mood»; el ADN nocturno es el núcleo resto-bar (docs 01/02).
2. **Mantener el oro como primario y solo retocar** — el usuario pidió nueva paleta; el oro queda como acento VIP (ruleta legendaria/fidelidad), preservando continuidad.
3. **react-native-reanimated** — el motion planificado (fade/scale/slide/rotate con native driver) no lo requiere; evita complejidad de configuración/build. Reevaluar solo si se quieren efectos scroll-driven.
4. **Gradientes simulados con Views apiladas como solución definitiva** — banding y direcciones limitadas; `expo-linear-gradient` es oficial, liviano y compatible Expo Go (aprobado por el usuario).
5. **Capa `composed.ts` de estilos compuestos** — abstracción prematura sobre el idioma actual (StyleSheet por componente); solo se comparte lo realmente duplicado (NBadge, hook de press).
6. **Big-bang de una sola pasada / librería de componentes nueva** — riesgo alto; la propagación por tokens logra el salto visual sin romper nada.
7. **FlashList / virtualización avanzada** — prematuro para el volumen actual; se reevalúa en el módulo M8 (offline/perf).
8. **Tocar stores, socket o backend «de paso»** — fuera de alcance: este plan es visual/UX; los módulos M1-M8 siguen siendo trabajo futuro.

## Supuestos

- Desarrollo y QA visual en Expo Go; build EAS solo al cerrar (las 3 dependencias nuevas son compatibles con ambos).
- Sin cambios de backend, navegación de 5 tabs ni flujos funcionales (solo reordenamiento interno de secciones).
- El usuario valida visualmente en dispositivo real; los precios/formato siguen en es-AR.
- `03-memoria-nebula-cliente.md` es la fuente de verdad documental; cualquier desvío del plan se registra ahí primero.
