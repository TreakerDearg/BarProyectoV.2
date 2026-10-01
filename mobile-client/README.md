# Nebula Bar — Mobile Client

App nativa para clientes del bar/restaurante Nebula. Construida con **Expo 52 + React Native 0.76**, implementa el design system **Nocturne Gastronomy** y se conecta al backend de producción en Render.

---

## Arquitectura

```
App.tsx                         ← Punto de entrada: fuentes, splash, navigator
src/
  navigation/
    AppNavigator.tsx            ← BottomTabNavigator de 5 tabs (Nocturne)
    CuentaNavigator.tsx         ← Muestra AuthScreen o AccountScreen según token
    types.ts                    ← RootTabParamList

  screens/
    HomeScreen.tsx              ← Home dinámica: mesa, pedido activo, promo, sommelier
    CartaScreen.tsx             ← Catálogo: SommelierCard + CompactProductRow
    PedidoScreen.tsx            ← Carrito → gate de mesa → tracking tiempo real
    ReservasScreen.tsx          ← Formulario de reserva + mis reservas
    AuthScreen.tsx              ← Login / Register
    AccountScreen.tsx           ← Perfil, historial, favoritos, logout
    RouletteScreen.tsx          ← Ruleta Nebula (gamificación)
    QRScannerScreen.tsx         ← Teclado numérico para código de mesa

  components/
    shared/
      NButton.tsx               ← Botón (primary/ghost/text/danger)
      NInput.tsx                ← Input con label exterior, foco gold
      NToast.tsx                ← Toast ligero con auto-dismiss
      NSkeleton.tsx             ← Shimmer animado para loading states
      NEmptyState.tsx           ← Estado vacío con icono + CTA
      SommelierCard.tsx         ← Card hero 16:10 (featured products)
      CompactProductRow.tsx     ← Fila horizontal 80px (catalog row)
      MesaCard.tsx              ← Card de mesa activa (HomeScreen)
      PedidoActivoBanner.tsx    ← Banner de pedido en curso (HomeScreen)
      PromoBanner.tsx           ← Banner de promoción destacada (HomeScreen)
    CategoryPills.tsx           ← Chips de categoría (Nocturne tokens)
    FloatingCartBar.tsx         ← Barra flotante del carrito
    HeaderContext.tsx           ← Header con estado de mesa
    DealsCarousel.tsx           ← Carrusel de promociones
    ModifierModal.tsx           ← Bottom sheet de personalización de producto
    ProductCard.tsx             ← Card de producto (legado, compatible)

  api/
    client.ts                   ← Axios base + interceptor de token
    authApi.ts                  ← login, register, perfil, historial, favoritos
    menuApi.ts                  ← Productos y menús públicos
    orderApi.ts                 ← Crear/consultar órdenes
    promoApi.ts                 ← Promociones públicas
    tableApi.ts                 ← Lookup por código de mesa
    reservationApi.ts           ← Disponibilidad + crear reserva + mis reservas
    rouletteApi.ts              ← Ruleta pública

  stores/
    useAuthStore.ts             ← JWT en SecureStore, login/register/logout
    useCartStore.ts             ← Carrito persistido en AsyncStorage
    useSessionStore.ts          ← Mesa activa persistida
    useFavoritesStore.ts        ← Favoritos locales + sync backend

  theme/
    colors.ts                   ← Tokens Nocturne Gastronomy + aliases
    typography.ts               ← Escala Outfit (headings) + Inter (body)
    spacing.ts                  ← Grid 8pt + Radius
    elevation.ts                ← 4 niveles de sombra
    index.ts                    ← Re-exporta todo

  socket/
    socketService.ts            ← Socket.IO client: connect, joinTable, onOrderUpdate

  types/
    api.ts                      ← Todos los DTOs del sistema
```

---

## Design System — Nocturne Gastronomy

| Token | Valor | Uso |
|-------|-------|-----|
| `background` | `#10131a` | Canvas base |
| `surfaceContainer` | `#1d2027` | Cards |
| `surfaceContainerHigh` | `#272a31` | Cards destacadas |
| `primary` | `#f3be59` | Tab activo, CTA, gold |
| `primaryContainer` | `#d4a340` | Botones primarios |
| `onSurface` | `#e0e2ec` | Texto principal |
| `onSurfaceVariant` | `#d3c5b1` | Texto secundario |

Fuentes: **Outfit** (headings/display/precios) + **Inter** (body/labels/formularios)

---

## Variables de entorno

El perfil `preview` de EAS ya tiene las variables configuradas en `eas.json`:

```
EXPO_PUBLIC_API_URL=https://barproyectov-2.onrender.com/api
EXPO_PUBLIC_SOCKET_URL=https://barproyectov-2.onrender.com
```

Para desarrollo local, crear `mobile-client/.env` (no commitear):
```
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:4000/api
EXPO_PUBLIC_SOCKET_URL=http://TU_IP_LOCAL:4000
```

---

## Desarrollo local

```bash
# Desde la raíz del repo:
cd mobile-client
npm install

# Iniciar servidor de desarrollo (Expo Go en el teléfono)
npm start

# Solo Android
npm run android

# Solo iOS
npm run ios
```

Escanear el QR con la cámara del teléfono (iOS) o con la app Expo Go (Android).

---

## Compilar APK para Android (perfil preview)

El APK instala directamente en cualquier Android sin necesidad de Google Play.

### Paso 1 — Instalar EAS CLI (una sola vez)
```bash
npm install -g eas-cli
```

### Paso 2 — Iniciar sesión en Expo
```bash
eas login
```

### Paso 3 — Compilar APK en la nube
```bash
cd mobile-client
eas build -p android --profile preview
```

Al finalizar (10–20 min), EAS entrega una URL de descarga directa del `.apk`.

> **¿Por qué `preview` y no `production`?**
> El perfil `preview` genera un `.apk` instalable directamente.
> El perfil `production` genera un `.aab` para Google Play Store.

### Paso 4 — Instalar en el dispositivo
Descargar el `.apk` desde el link de EAS y abrir el archivo en el teléfono Android.
Puede ser necesario habilitar "Instalar desde fuentes desconocidas" en Ajustes.

---

## Compilar para iOS (TestFlight)

```bash
eas build -p ios --profile preview
```

Requiere cuenta de Apple Developer y certificados configurados en EAS.

---

## Actualizar versión

1. Incrementar `version` en `app.json` (ej: `"1.0.1"`)
2. Para cambios de código nativo: incrementar `versionCode` (Android) o `buildNumber` (iOS)
3. Recompilar con `eas build`

---

## Arquitectura de navegación

```
BottomTabNavigator
├── Inicio   (HomeScreen)
├── Carta    (CartaScreen)         ← FloatingCartBar navega a Pedidos
├── Pedidos  (PedidoScreen)        ← 3 estados: empty / cart / tracking
├── Reservas (ReservasScreen)
└── Cuenta   (CuentaNavigator)
      ├── sin sesión → AuthScreen  (login / register)
      └── con sesión → AccountScreen
```

---

## Tiempo real (Socket.IO)

La app se conecta automáticamente a `EXPO_PUBLIC_SOCKET_URL` al iniciar.

Eventos escuchados:
- `order:update` / `order:updated` → actualiza estado del pedido en tracking y AccountScreen
- `item:ready` → notificación háptica cuando un item está listo

El socket se reconecta automáticamente con `reconnectionAttempts: 10`.

---

## Pantallas principales

| Pantalla | Descripción |
|---------|-------------|
| **Home** | Saludo dinámico, mesa activa, pedido activo, promo, explorar carta, selección del sommelier, ruleta |
| **Carta** | Búsqueda, categorías, SommelierCard (featured), CompactProductRow, ModifierModal |
| **Pedidos** | Carrito (items, propina, total), gate de mesa (3 dígitos / skip), submit, timeline en vivo |
| **Reservas** | Date picker nativo, personas, slots horarios, datos, confirmar, mis reservas |
| **Cuenta** | Auth (login/register) / Perfil editable, historial, favoritos, cambio de contraseña, logout |
