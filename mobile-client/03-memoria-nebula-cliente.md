# NEBULA FOOD & BEVERAGE — MEMORIA DEL PROYECTO CLIENTE

## Propósito del archivo

Este archivo funciona como memoria de diseño y producto.
Debe mantenerse actualizado durante la evolución de la aplicación cliente.
Su objetivo es evitar que futuras iteraciones pierdan decisiones importantes ya tomadas.

---

# 1. IDENTIDAD

Nombre: **Nebula Food & Beverage**

Producto: **Aplicación Cliente Nebula — Mobile (React Native / Expo)**

Tipo: Aplicación nativa Android/iOS orientada al consumidor gastronómico.

Concepto: Restaurante/bar moderno con experiencia digital integrada.
El cliente puede descubrir, reservar, pedir y seguir su experiencia desde un solo lugar.

---

# 2. DESIGN SYSTEM ACTIVO

## [2025-10-01] — MIGRACIÓN A NOCTURNE GASTRONOMY

### Cambio
Se reemplazó el sistema de colores anterior (Background `#08090C`, Gold `#D4A340`) por el design system **Nocturne Gastronomy**.

### Motivo
El nuevo sistema fue definido con mayor precisión semántica, tipografía material-scale, paleta de roles completa y guía de componentes. Es la fuente de verdad visual para la app mobile.

### Impacto
Todos los archivos de `src/theme/` fueron reescritos. Los componentes existentes mantienen compatibilidad vía aliases en `colors.ts`.

---

# 3. PALETA ACTUAL — NOCTURNE GASTRONOMY

> Fuente de verdad: `src/theme/colors.ts`

## Backgrounds (tonal stacking)

| Token | Hex | Uso |
|-------|-----|-----|
| `background` | `#10131a` | Canvas base, fondo de todas las pantallas |
| `surfaceContainerLowest` | `#0b0e15` | Nivel más profundo |
| `surfaceContainerLow` | `#191c23` | CategoryPills resting |
| `surfaceContainer` | `#1d2027` | Cards estándar |
| `surfaceContainerHigh` | `#272a31` | Cards destacadas, steppers, chips |
| `surfaceContainerHighest` | `#32353c` | Inputs, chips seleccionados, botón tab activo |

## Primary — Oro gastronómico

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#f3be59` | Tab activo, acción principal, gold highlight |
| `primaryContainer` | `#d4a340` | Botones CTA, FloatingCartBar, bordes gold |
| `onPrimary` | `#412d00` | Texto sobre fondo dorado |

## Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `onSurface` | `#e0e2ec` | Texto principal |
| `onSurfaceVariant` | `#d3c5b1` | Texto secundario, tabs inactivos, labels |
| `outline` | `#9b8f7d` | Placeholders, textos muted, bordes neutros |
| `outlineVariant` | `#4f4536` | Bordes sutiles |

## Semánticos

| Token | Hex | Uso |
|-------|-----|-----|
| `success` | `#34B964` | Completado, mesa activa, confirmado |
| `warning` | `#E07828` | Pendiente, límite de disponibilidad |
| `error` | `#ffb4ab` | Error, cancelación (en dark mode) |
| `errorContainer` | `#93000a` | Fondo de badges de error |
| `info` | `#38BDF8` | Notas informativas, reservas |

## Aliases de compatibilidad (no usar directamente en nuevos archivos)

`background`, `card`, `cardSecondary`, `border`, `primary`, `textPrimary`, `textSecondary`, `textMuted`, `textInverse`, `dealRed`, `dealGreen` — todos mapeados a Nocturne en `colors.ts`.

---

# 4. TIPOGRAFÍA

> Fuente de verdad: `src/theme/typography.ts`

## Familias

- **Outfit** (400, 500, 600, 700): Display, Headlines, Titles, Precios
- **Inter** (400, 500, 600, 700): Body, Labels, Formularios, Navegación

Cargadas con `@expo-google-fonts/outfit` y `@expo-google-fonts/inter` via `useFonts` en `App.tsx`.

## Escala tipográfica

| Token | Familia | Size | Weight | Uso |
|-------|---------|------|--------|-----|
| `displayLg` | Outfit | 32 | 600 | Saludos hero, títulos de pantalla |
| `displaySm` | Outfit | 26 | 600 | Nombres de platos, producto destacado |
| `headlineLg` | Outfit | 22 | 600 | Títulos de sección |
| `headlineSm` | Outfit | 18 | 500 | Sub-títulos, nombres de mesa |
| `titleMd` | Outfit | 16 | 500 | Nombres de productos en lista |
| `bodyLg` | Inter | 16 | 400 | Texto de descripción principal |
| `bodyMd` | Inter | 14 | 400 | Descripciones, formularios |
| `bodySm` | Inter | 12 | 400 | Metadata, notas, subtítulos |
| `labelLg` | Inter | 14 | 600 | Botones, precios secundarios |
| `labelMd` | Inter | 12 | 500 | Tab labels, chips resting |
| `labelSm` | Inter | 10 | 600 uppercase | Badges, categorías, section labels |
| `price` | Outfit | 18 | 600 | Precios en cards |
| `priceLg` | Outfit | 22 | 600 | Totales del carrito |

No cambiar la tipografía sin una decisión explícita de rediseño.

---

# 5. ESPACIADO Y RADIOS

> Fuente de verdad: `src/theme/spacing.ts`

## Grid 8pt

| Token | px | Uso |
|-------|----|-----|
| `xs` | 4 | Micro separación, gap entre iconos |
| `sm` | 8 | Entre elementos relacionados |
| `smMd` | 12 | Carruseles horizontales |
| `md` | 16 | Padding interno de cards, gap entre cards |
| `gutter` | 20 | Margen horizontal de pantalla |
| `lg` | 24 | Entre secciones |
| `xl` | 32 | Entre bloques mayores |

## Radios

| Token | px | Uso |
|-------|----|-----|
| `xs` | 4 | Badges, tags, micro-chips |
| `sm` | 6 | Badges de dieta, vintage tags |
| `md` | 10 | Inputs, dropdowns, rows de lista |
| `lg` | 12 | Secondary containers, cards menores |
| `xl` | 16 | Cards principales, hero cards |
| `xxl` | 24 | Modales, bottom sheets |
| `full` | 9999 | Pills, chips de categoría, avatares |

---

# 6. ELEVACIÓN

> Fuente de verdad: `src/theme/elevation.ts`

4 niveles de stacking tonal (sin blurred glass):

| Nivel | Uso |
|-------|-----|
| `none` | Canvas. Sin sombra. |
| `card` | Cards estándar. Sombra ligera. |
| `sheet` | Active sheets, navbars, menús. Sombra ambiental. |
| `modal` | Modales, alertas, bottom sheets. Dual shadow. |
| `goldCTA` | Solo para CTA primarios. Gold glow difuso. |

---

# 7. NAVEGACIÓN

> Fuente de verdad: `src/navigation/AppNavigator.tsx`

## Bottom Tab Navigator — 5 tabs

| # | Pantalla | Icono Lucide | Descripción |
|---|----------|--------------|-------------|
| 1 | **Inicio** | Home | HomeScreen dinámica |
| 2 | **Carta** | UtensilsCrossed | Catálogo completo |
| 3 | **Pedidos** | ShoppingBag | Carrito + tracking |
| 4 | **Reservas** | CalendarDays | Formulario + mis reservas |
| 5 | **Cuenta** | UserCircle | Auth / Perfil |

Estilo del tab bar:
- Fondo: `#10131a`
- Borde superior: `rgba(224, 226, 236, 0.08)`
- Tab activo: icono y label en `#f3be59` (primary)
- Tab inactivo: icono y label en `#d3c5b1` (onSurfaceVariant)
- Altura: 64px + safe area insets

**No reemplazar por sidebar.**
**No convertir en drawer.**

---

# 8. ARQUITECTURA DE PANTALLAS

```
App.tsx (fuentes + providers + navigator)
  └── NavigationContainer (theme Nocturne)
        └── AppNavigator (BottomTabNavigator)
              ├── Inicio   → HomeScreen
              ├── Carta    → CartaScreen
              ├── Pedidos  → PedidoScreen
              ├── Reservas → ReservasScreen
              └── Cuenta   → CuentaNavigator
                    ├── sin token → AuthScreen
                    └── con token → AccountScreen
```

---

# 9. PANTALLAS IMPLEMENTADAS

## HomeScreen (`src/screens/HomeScreen.tsx`)

Pantalla principal dinámica. Fiel al diseño Nocturne Gastronomy.

Secciones (de arriba a abajo):
1. **Top bar**: Logo NEBULA + dot gold + badge de zona + avatar circular (navega a Cuenta)
2. **Saludo**: `Hola, [nombre]` (displayLg Outfit) + subtítulo (bodyLg) — greeting dinámico según hora
3. **MesaCard**: visible cuando hay `tableId` en `useSessionStore`
4. **PedidoActivoBanner**: visible cuando hay orden activa — actualizada en tiempo real vía Socket.IO
5. **PromoBanner**: primer promo activa de `/promotions/public` — fallback estático si no hay
6. **Accesos rápidos**: grid 4×1 (Carta, Pedidos, Reservas, Ruleta)
7. **Explorar la carta**: CategoryPills horizontal + navega a CartaScreen con filtro
8. **Selección del Sommelier**: primeros 4 productos featured como SommelierCard
9. **Ruleta CTA**: card especial que abre RouletteScreen como Modal

## CartaScreen (`src/screens/CartaScreen.tsx`)

Catálogo completo de productos con búsqueda y filtros.

Componentes principales:
- SearchBar nativo (TextInput + ícono Search + clear)
- CategoryPills horizontal scrollable
- **SommelierCard** para productos `featured` (hero 16:10, overlay degradado)
- **CompactProductRow** para el resto del catálogo (80×80px)
- **FloatingCartBar** posicionado sobre el tab bar — navega a tab Pedidos
- **ModifierModal** (bottom sheet personalización: preset notes, cantidad)
- **NToast** verde al agregar producto
- RefreshControl dorado
- Estados: SkeletonSommelierCard/SkeletonCompactRow, NEmptyState, ErrorState

## PedidoScreen (`src/screens/PedidoScreen.tsx`)

Orquesta 3 estados internos:

| Estado | Condición | Vista |
|--------|-----------|-------|
| `empty` | cart.length === 0 | NEmptyState + CTA a Carta |
| `cart` | cart.length > 0 | CartView: items + gate de mesa + propina + submit |
| `tracking` | orden enviada | TrackingView: timeline + socket + cuenta de mesa |

**Gate de mesa**: si no hay `tableId`/`sessionId`, muestra MesaGate con opciones conectar QR o skip (retiro en barra).

**Tracking en tiempo real**: Socket.IO events `order:update` e `item:ready` + haptics `NotificationFeedbackType.Success`.

## ReservasScreen (`src/screens/ReservasScreen.tsx`)

Formulario único con scroll:
1. Date picker nativo (iOS: spinner / Android: modal)
2. Stepper de personas (1–20)
3. Chips de slots horarios (fetch a `/reservations/check-availability` al cambiar fecha/personas)
4. NInput: nombre, teléfono, email (opcional), notas (opcional)
5. summaryBox + CTA gold
6. Banner de éxito inline al confirmar
7. Lista "Mis reservas" (solo con token, últimas 5, badge colorizado por estado)

## AuthScreen (`src/screens/AuthScreen.tsx`)

Formulario Login/Register. Visible cuando no hay token.

- Tabs: "Iniciar sesión" / "Crear cuenta"
- NInput con toggle show/hide password
- Validación local + error banner animado
- Haptics Error/Success
- KeyboardAvoidingView

## AccountScreen (`src/screens/AccountScreen.tsx`)

Vista autenticada de la cuenta. Reemplaza AuthScreen cuando hay token.

Secciones:
- Hero: avatar circular (foto o iniciales en `primaryContainer`) + nombre + email + rol badge
- Banner pedido activo en tiempo real (Socket.IO)
- Banner próxima reserva (CTA a Reservas)
- Grid 4 accesos rápidos
- Historial de pedidos (últimas 8, badge de estado colorizado)
- Favoritos preview (count + link a Carta)
- ProfilePanel: edición inline de nombre/teléfono (PATCH `/auth/profile`)
- PasswordPanel: cambio de contraseña colapsable (PATCH `/auth/password`)
- Logout: Alert de confirmación + POST `/auth/logout` + limpia SecureStore

## RouletteScreen (`src/screens/RouletteScreen.tsx`) — existente

Modal de gamificación. Haptic feedback durante el giro.

## QRScannerScreen (`src/screens/QRScannerScreen.tsx`) — existente

Teclado numérico de 3 dígitos para vincular mesa. Lookup en `/tables/code/:code`.

---

# 10. COMPONENTES DEL SISTEMA

> Carpeta: `src/components/shared/`

## Nuevos (Nocturne Gastronomy)

| Componente | Descripción |
|-----------|-------------|
| `NButton` | primary / ghost / text / danger — sizes sm/md/lg — haptics |
| `NInput` | label exterior, foco gold, toggle password, error inline |
| `NToast` | Toast animado fade+slide — success/error/info — auto-dismiss |
| `NSkeleton` | Shimmer animado (Animated.Value) + SkeletonSommelierCard/SkeletonCompactRow |
| `NEmptyState` | Icono centrado + título + subtítulo + CTA opcional |
| `SommelierCard` | Hero 16:10, overlay degradado, featureBadge, rating, precio gold, favorito |
| `CompactProductRow` | Fila 80×80, badge autor/descuento, qty badge en botón + |
| `MesaCard` | Card de mesa activa: icono, zona, badge activo, acciones |
| `PedidoActivoBanner` | Top accent bar por status, tiempo estimado, preview items, CTA |
| `PromoBanner` | Imagen full-bleed, overlay, badge, título Outfit, validez |
| `PromoBannerFallback` | Banner estático para cuando no hay promos del backend |

## Actualizados (Nocturne tokens)

| Componente | Cambio |
|-----------|--------|
| `CategoryPills` | Resting: `surfaceContainerLow`, selected: `surfaceContainerHighest` + dot gold |
| `FloatingCartBar` | `primaryContainer` fill, ShoppingBag icon, goldCTA elevation |
| `HeaderContext` | CheckCircle2 cuando mesa activa, tokens Nocturne completos |

## Existentes compatibles (sin cambios)

`DealsCarousel`, `ModifierModal`, `ProductCard`

---

# 11. STORES

| Store | Archivo | Persistencia |
|-------|---------|--------------|
| `useAuthStore` | `src/stores/useAuthStore.ts` | SecureStore (token + user) |
| `useCartStore` | `src/stores/useCartStore.ts` | AsyncStorage |
| `useSessionStore` | `src/stores/useSessionStore.ts` | AsyncStorage (tableId, sessionId, tableCode) |
| `useFavoritesStore` | `src/stores/useFavoritesStore.ts` | AsyncStorage + sync con `/auth/favorites` |

---

# 12. API LAYER

> Carpeta: `src/api/`

| Archivo | Endpoints |
|---------|-----------|
| `authApi.ts` | login, register, me, logout, updateProfile, changePassword, getFavorites, addFavorite, removeFavorite, getMyOrderHistory, getMyReservations |
| `menuApi.ts` | getPublicMenus, getPublicProducts, getProductById |
| `orderApi.ts` | createOrder, getOrderById |
| `promoApi.ts` | getPublicPromotions |
| `tableApi.ts` | lookupTableByCode, getTableDetails |
| `reservationApi.ts` | checkAvailability, createReservation, getMyReservationsFromApi |
| `rouletteApi.ts` | getPublicRouletteDrinks, spinPublicRoulette |

Base URL de producción: `https://barproyectov-2.onrender.com/api`

---

# 13. SOCKET.IO

> Archivo: `src/socket/socketService.ts`

La app se conecta automáticamente a `EXPO_PUBLIC_SOCKET_URL` al iniciar.

Rooms activos:
- `join:table` — al conectar una mesa (useSessionStore)
- `join:user` — al autenticar usuario (useAuthStore)

Eventos escuchados:
- `order:update` / `order:updated` → PedidoScreen (tracking) + AccountScreen (banner activo) + HomeScreen (PedidoActivoBanner)
- `item:ready` → haptic Success en PedidoScreen

Reconexión automática: 10 intentos, delay 2000ms.

---

# 14. BUILD APK

> Archivo: `eas.json`

```
eas build -p android --profile preview
```

- **Preview**: genera `.apk` instalable directamente en Android
- **Production**: genera `.aab` para Google Play Store

Variables de entorno del perfil `preview` (ya configuradas en `eas.json`):
```
EXPO_PUBLIC_API_URL=https://barproyectov-2.onrender.com/api
EXPO_PUBLIC_SOCKET_URL=https://barproyectov-2.onrender.com
```

Prerrequisitos:
```bash
npm install -g eas-cli
eas login
```

---

# 15. DEPENDENCIAS INSTALADAS

## Nuevas (agregadas en esta iteración)

| Paquete | Versión | Uso |
|---------|---------|-----|
| `@expo-google-fonts/outfit` | ^0.4.3 | Fuente Outfit |
| `@expo-google-fonts/inter` | ^0.4.2 | Fuente Inter |
| `expo-font` | ~13.0.4 | Carga de fuentes |
| `expo-splash-screen` | ^0.29.24 | Control del splash |
| `@react-native-community/datetimepicker` | ^9.2.1 | Date picker nativo en ReservasScreen |

## Stack completo

Expo 52, React Native 0.76, React Navigation 7 (bottom-tabs, native, native-stack), Zustand 5, Axios, Socket.IO-client 4, lucide-react-native, expo-haptics, expo-secure-store, expo-camera, AsyncStorage.

---

# 16. PRINCIPIOS QUE NO DEBEN ROMPERSE

### Mobile-first
El teléfono es el dispositivo principal. Toda pantalla diseña primero para 390×844.

### Cliente primero
La aplicación habla al consumidor, no al empleado.

### Claridad
Una acción debe ser comprensible sin explicación adicional.

### Gastronomía
La comida, bebida y experiencia del restaurante son protagonistas.

### Premium
El sistema debe verse cuidado sin convertirse en una interfaz inaccesible.

### Tecnología sutil
La tecnología mejora la experiencia, no la domina.

### Consistencia — Regla Nocturne
Una pantalla nueva debe reutilizar los patrones de Nocturne Gastronomy.
Antes de crear un componente nuevo, verificar si puede reutilizarse o extenderse uno existente.

---

# 17. COSAS QUE NO QUEREMOS

No convertir la aplicación en:
- Dashboard / POS / ERP / Panel administrativo
- App gamer / cyberpunk / excesivamente futurista
- Interfaz llena de neón
- Interfaz con glassmorphism excesivo
- Interfaz basada en emojis
- Interfaz sobrecargada

---

# 18. REGLAS PARA NUEVAS PANTALLAS

1. Definir su propósito.
2. Determinar si pertenece a un módulo existente.
3. Reutilizar componentes de `src/components/shared/`.
4. Mantener paleta Nocturne Gastronomy (`src/theme/colors.ts`).
5. Mantener tipografía Outfit/Inter (`src/theme/typography.ts`).
6. Mantener la navegación inferior de 5 tabs.
7. Mantener la jerarquía visual.
8. Diseñar primero para móvil (390×844).
9. Contemplar estados: Loading (NSkeleton), Empty (NEmptyState), Error (con retry), Success.
10. Evitar agregar elementos decorativos sin función.
11. Toda acción táctil importante debe tener haptic feedback.
12. Los formularios deben usar KeyboardAvoidingView.

---

# 19. ESTADOS DINÁMICOS CUBIERTOS

| Estado | Pantalla | Comportamiento |
|--------|----------|----------------|
| Sin sesión | Cuenta | Muestra AuthScreen |
| Con sesión | Cuenta | Muestra AccountScreen |
| Sin mesa | Home, Pedidos | No muestra MesaCard; gate de mesa al pedir |
| Mesa conectada | Home, Pedidos | MesaCard visible; submit directo |
| Sin pedido activo | Home, Pedidos | No muestra PedidoActivoBanner; EmptyState en Pedidos |
| Pedido activo | Home, Pedidos, Cuenta | PedidoActivoBanner; tracking en tiempo real |
| Pedido completed/cancelled | Pedidos | Botón "Hacer otro pedido" visible |
| Sin reservas | Reservas, Cuenta | Lista vacía + CTA reservar |
| Reserva próxima | Cuenta | Banner azul info |
| Sin promociones | Home | PromoBannerFallback estático |
| Promociones activas | Home | PromoBanner con imagen del producto |
| Cargando datos | Todas | NSkeleton con shimmer animado |
| Error de red | Carta, Home | NEmptyState con botón retry |

---

# 20. DECISIONES REGISTRADAS

## [2025-10-01] — ADOPCIÓN DESIGN SYSTEM NOCTURNE GASTRONOMY

### Cambio
Se adoptó el design system Nocturne Gastronomy como fuente de verdad visual única para el mobile client. Reemplaza el sistema anterior basado en `#08090C` / `#D4A340`.

### Motivo
Mayor precisión semántica, paleta de roles completa (on-surface, surface-tint, etc.), tipografía escalada, guía de componentes con elevación tonal. El diseño conceptual de HomeScreen confirmó esta dirección.

### Impacto
`src/theme/` completo reescrito. Componentes existentes compatibles vía aliases.

---

## [2025-10-01] — ARQUITECTURA DE 5 TABS CON BOTTOM NAVIGATOR

### Cambio
Se reemplazó el `App.tsx` monolítico (single-screen con modales) por un `BottomTabNavigator` de 5 tabs con stacks independientes.

### Motivo
El sistema web cliente (`/cliente/*`) ya tenía esta arquitectura. El mobile debe ser su equivalente nativo. El single-screen era un prototipo no escalable.

### Impacto
`App.tsx` reescrito. Creados: `AppNavigator.tsx`, `CuentaNavigator.tsx`, `navigation/types.ts`. Todas las pantallas son independientes y reutilizan los stores.

---

## [2025-10-01] — FLOATINGCARTBAR NAVEGA A TAB PEDIDOS (NO MODAL)

### Cambio
`FloatingCartBar` ya no abre `CartScreen` como Modal. Navega a la tab "Pedidos" via `navigation.navigate('Pedidos')`.

### Motivo
La pantalla de Pedidos tiene sus propios estados (empty/cart/tracking). Abrir un Modal sobre la carta rompía el flujo de navegación natural.

### Impacto
`CartaScreen.tsx` actualizado. `CartScreen` existente fue reemplazado por `CartView` embebida dentro de `PedidoScreen`.

---

## [2025-10-01] — GATE DE MESA CON SKIP (RETIRO EN BARRA)

### Cambio
El gate de código de 3 dígitos permite ser omitido con "Retiro en barra".

### Motivo
Clientes sin mesa asignada deben poder pedir igualmente. Fiel al modelo del sistema web cliente (`gateSkipped`).

### Impacto
`PedidoScreen.tsx` — `MesaGate` component interno con `onSkip` prop.

---

## [2025-10-01] — FORMULARIO ÚNICO EN RESERVAS (SIN WIZARD)

### Cambio
La pantalla de Reservas usa un único `ScrollView` con todos los pasos en lugar de un wizard multi-pantalla.

### Motivo
Simplicidad mobile. Un scroll es más natural y menos cognitivamente exigente para el usuario.

### Impacto
`ReservasScreen.tsx` creado desde cero.

---

# 21. ESTADO ACTUAL DE IMPLEMENTACIÓN

La app está en **estado funcional completo**. Todas las pantallas y flujos principales están implementados.

## ✅ Completado

- Design system Nocturne Gastronomy (`src/theme/`)
- Fuentes Outfit + Inter via expo-google-fonts
- Navegación de 5 tabs con React Navigation 7
- HomeScreen dinámica fiel al diseño conceptual
- CartaScreen con SommelierCard + CompactProductRow + búsqueda + favoritos
- PedidoScreen con 3 estados: empty / cart / tracking tiempo real
- ReservasScreen con date picker nativo + slots + mis reservas
- AuthScreen (login + register)
- AccountScreen completo (historial, favoritos, perfil editable, logout)
- Todos los stores: useAuthStore, useCartStore, useSessionStore, useFavoritesStore
- API layer completo: auth, menu, orders, promos, tables, reservations, roulette
- Socket.IO integrado en Home, Pedidos y Cuenta
- Componentes compartidos: NButton, NInput, NToast, NSkeleton, NEmptyState, SommelierCard, CompactProductRow, MesaCard, PedidoActivoBanner, PromoBanner
- Haptic feedback en acciones clave
- app.json y eas.json configurados para build APK

## 🔲 Pendiente (próximas iteraciones)

- Notificaciones push (expo-notifications)
- Modo offline básico (cache de carta)
- Pantalla de detalle de producto expandida
- Historial de consumo de mesa (durante la sesión activa)
- Integración de pagos (si el sistema lo incorpora)
- Onboarding para nuevos usuarios

---

# 22. OBJETIVO FINAL

La aplicación debe evolucionar como un producto real.

Cada nueva funcionalidad debe integrarse con lo existente.

La pregunta principal antes de diseñar cualquier cosa nueva:

> ¿Esto parece una nueva pieza de Nebula o parece una aplicación diferente?

Si parece una aplicación diferente, debe rediseñarse hasta integrarse con el sistema visual Nocturne Gastronomy existente.
