# BARTENDER SYSTEM — ARCHITECTURE AUDIT
**Fecha:** Septiembre 2026  
**Alcance:** Backend · Cliente Web (Next.js) · Bartender Desktop (Electron)  
**Estado:** Pre-modernización

---

## 1. MAPA DEL ECOSISTEMA

```
CLIENTE WEB (Next.js 16 · React 19 · TypeScript · Tailwind v4)
    │
    ├── /cliente/cuenta     → Autenticación + Perfil
    ├── /cliente/carta      → Menú público
    ├── /cliente/pedido     → Carrito + Pedidos
    ├── /cliente/reservas   → Reservas
    ├── /cliente/ruleta     → Ruleta
    ├── /cliente/home       → Welcome page
    │
    ├── STORES (Zustand persist)
    │   ├── useClienteStore  → token, user, tableId, sessionId, tableCode, cart
    │   └── useOrdersStore   → Map<orderId, {status, updatedAt}>
    │
    ├── HOOKS
    │   ├── useAuth          → Login/Register/Logout/OAuth/SSO
    │   ├── useMenu          → Menú público
    │   ├── usePromotions    → Promociones públicas
    │   ├── useReservationLogic → Reservas
    │   ├── useRoulette      → Ruleta
    │   └── useSocketReconnection → Fallback polling
    │
    └── LIB
        ├── api/client.ts    → Axios con interceptor refresh token automático
        ├── api/bartender.ts → Todos los endpoints tipados
        ├── auth/tokenStorage→ localStorage access/refresh token
        ├── realtime/socket.ts → Socket.IO cliente
        └── types/api.ts     → DTOs TypeScript
    │
    ↓  HTTP/WS
    │
BACKEND (Node.js · Express 5 · MongoDB · Mongoose · Socket.IO)
    │
    ├── ROUTES REGISTRADAS
    │   ├── /api/auth        → Login · Register · Profile · Refresh · Sessions · Logout · OAuth · SSO
    │   ├── /api/users       → CRUD empleados (admin only)
    │   ├── /api/products    → CRUD + public endpoint
    │   ├── /api/orders      → CRUD + status changes
    │   ├── /api/promotions  → GET public · GET admin · POST · DELETE
    │   ├── /api/reservations→ CRUD + available tables
    │   ├── /api/tables      → CRUD + open/close + code lookup
    │   ├── /api/menus       → Menú público
    │   ├── /api/inventory   → CRUD + stock adjust
    │   ├── /api/roulette    → Ruleta pública
    │   └── ... (25 rutas adicionales)
    │
    ├── SOCKET.IO
    │   ├── Namespace default con auth middleware (token opcional)
    │   ├── Room: user:{userId}        → individual
    │   ├── Room: orders:global        → solo empleados/admin
    │   ├── Room: table:{id}           → clientes de esa mesa
    │   ├── Events emitidos: order:update · order:created · table:update
    │   └── /tracking namespace        → KPIs internos del Dashboard
    │
    ├── AUTENTICACIÓN
    │   ├── JWT access token: 30 min
    │   ├── Refresh token: rotación automática vía Session model
    │   ├── Refresh automático en Axios interceptor del cliente
    │   ├── SSO token: en memoria (Map), TTL 90s, single-use
    │   ├── Identity Decision Engine: evalúa rol, turno, estado
    │   └── OAuth Google: redirect flow con state param
    │
    └── MODELS
        ├── User         → name, email, password, role, isEmployee, shift, permissions,
        │                  isActive, avatar, googleId, provider, schedule, performance, compliance, attendance
        ├── Order        → items[], status, table, sessionId, discounts[], total, subtotal, payment
        ├── Promotion    → name, type (PERCENT/FLAT/2X1/CUSTOM), value, schedule, applicableProducts, isActive
        ├── Reservation  → customerName, phone, email, guests, startTime, endTime, status, guestDietaryRestrictions
        ├── Table        → number, capacity, status, currentSessionId, tableCode, isLocked
        ├── Session      → userId, refreshToken (hashed), platform, status, expiresAt
        └── Product      → name, price, dynamicPrice, category, type, featured, available
    │
    ↓
MONGODB (Mongoose)
    │
BARTENDER DESKTOP (Electron 41 · React 19 · Vite 8 · TypeScript)
    │
    ├── MÓDULOS
    │   ├── auth         → Login Electron + SSO redeem
    │   ├── dashboard    → KPIs (página no encontrada en disco — puede estar vacía)
    │   ├── orders       → OrdersPage completa con Socket.IO
    │   ├── products     → CRUD productos con imagen Cloudinary
    │   ├── inventory    → CRUD inventario 3 niveles
    │   ├── tables       → FloorPlan + TableInspector + TableNode con tableCode
    │   ├── reservations → ReservationsPage + ReservationForm + ReservationCard + ActionModal
    │   ├── menus        → Gestión de menús
    │   ├── discounts    → Descuentos
    │   ├── recipes      → Recetas
    │   ├── roulette     → Ruleta admin
    │   ├── salon        → Vista de salón
    │   └── admin        → Empleados + Usuarios (EmployeesPage)
    │
    └── SIN MÓDULO: promotions  ← NO EXISTE en /modules
        La PromotionsPage no fue creada nunca.
```

---

## 2. INCONSISTENCIAS CRÍTICAS DETECTADAS

### 2.1 PERFIL DEL CLIENTE — SIN ENDPOINT DE EDICIÓN

**Problema:**  
El modelo `User` tiene `name`, `email`, pero NO tiene `phone`. El campo `avatar` existe pero solo se puebla vía OAuth Google.  
No existe ningún endpoint `PATCH /auth/profile` o `PUT /users/me` que el **cliente** pueda usar para editar su propio perfil.

El endpoint `PUT /users/:id` existe pero es **admin only** (`adminOnly`).

**Impacto:**  
- `AccountView.tsx` en el cliente web muestra nombre y email pero no hay forma de editarlos.
- Un cliente no puede cambiar su contraseña desde la web.
- No hay teléfono ni avatar editable.

**Riesgo:** Alto — UX bloqueada.

---

### 2.2 HISTORIAL DE PEDIDOS DEL CLIENTE — SIN ENDPOINT DEDICADO

**Problema:**  
`GET /orders` no tiene filtro por usuario (`userId`). Solo filtra por `status`, `sessionId`, `table`.  
El cliente no puede consultar su historial de pedidos propios sin pasar un `sessionId` manual.

El `AccountView.tsx` llama a `api.get('/orders?sessionId=...')` — solo funciona mientras hay sesión activa. Cuando la sesión cierra, la historia desaparece.

**Impacto:**  
- Sin historial persistente por usuario.
- Un cliente que abre una nueva sesión no puede ver pedidos de sesiones anteriores.

**Riesgo:** Alto — funcionalidad prometida sin implementación real.

---

### 2.3 PROMOCIONES — SIN MÓDULO DESKTOP

**Problema:**  
El directorio `bartender-desktop/src/modules/promotions/` **no existe**.  
El backend tiene `GET /promotions`, `POST /promotions`, `DELETE /promotions/:id` pero ningún operador del bar puede gestionarlos desde el Desktop sin acceder a la API manualmente.

Además, el controller de promotion **no tiene** `PUT /promotions/:id` (editar) ni `PATCH /promotions/:id/toggle` (activar/desactivar sin eliminar).

**Impacto:**  
- Los operadores no pueden gestionar promociones en producción.
- No hay forma de activar/desactivar sin eliminar y recrear.
- Datos ficticio/inexistente en la welcome page cuando no hay promociones reales cargadas.

**Riesgo:** Alto — bloqueante para operaciones del negocio.

---

### 2.4 TIPOS TYPESCRIPT DUPLICADOS / INCONSISTENTES

**Problema:**  
```typescript
// Existen 3 representaciones del mismo concepto Producto:
ProductBrief       // Legacy — usa _id
ProductPublicDTO   // Nuevo — usa id (sin _)
MenuProductPublicDTO // Wrappea ProductPublicDTO

// User tiene dos formas:
AuthUser           // { _id, name, email, role }
data.user (login)  // { id, name, email, role }  ← usa id sin _
```

El `useAuth.ts` tiene un mapeo manual `_id: data.user.id` para corregir esto. Pero otros componentes pueden recibir IDs incorrectos.

**Impacto:**  
- Bugs silenciosos de undefined al acceder a `user._id` vs `user.id`.
- Tipos duplicados que deben mantenerse en sincronía.

**Riesgo:** Medio — propenso a bugs difíciles de detectar.

---

### 2.5 LOGOUT — LIMPIEZA INCOMPLETA

**Problema:**  
El `logout` en `useAuth.ts` llama correctamente a `clearTokens()` y `storeLogout()`.  
`storeLogout()` en `useClienteStore` limpia `token, user, tableId, sessionId, tableCode, cart`.

**PERO:** El backend no recibe el `refreshToken` en el logout call desde el cliente porque `useAuth.logout()` no hace la llamada HTTP a `POST /auth/logout`. Solo limpia localmente.

El refresh token del servidor **queda activo** hasta su expiración natural.

**Impacto:**  
- Un token robado puede seguir siendo usado para renovar accesos hasta su TTL.
- El logout no invalida la sesión en el servidor.

**Riesgo:** Alto — vulnerabilidad de seguridad.

---

### 2.6 ORDERS:GLOBAL — CLIENTES SIN ACCESO A SUS PROPIAS ÓRDENES EN TIEMPO REAL

**Problema:**  
El Socket.IO solo permite unirse a `orders:global` si el usuario tiene rol `admin/manager/bartender/kitchen`.  
Los clientes pueden unirse a `user:{userId}` pero el backend **no emite nada** a esa room cuando cambia el estado de un pedido del cliente.

El cliente solo recibe actualizaciones si se une a `orders:global` — pero no puede porque el servidor lo rechaza.

**Impacto:**  
- El componente `PedidoPage` del cliente llama a `joinOrdersGlobal()` pero el servidor no lo agrega a la room.
- El estado del pedido en curso **no se actualiza en tiempo real** para el cliente.
- El componente `AccountView.tsx` usa `onOrderStatus()` pero nunca recibe eventos.

**Riesgo:** Alto — funcionalidad core anunciada como "en tiempo real" que no funciona.

---

### 2.7 FAVORITOS — NO EXISTE EN NINGUNA CAPA

**Problema:**  
El modelo `User` no tiene campo `favorites[]`.  
No hay endpoint `/users/me/favorites`.  
No hay hook `useFavorites`.  
La carta del cliente no tiene botón de favorito.

**Impacto:**  
- Funcionalidad inexistente pero mencionada en el diseño del Customer Hub.

**Riesgo:** Medio — feature nueva que requiere trabajo end-to-end.

---

### 2.8 DASHBOARD DESKTOP — PÁGINA VACÍA

**Problema:**  
El directorio `bartender-desktop/src/modules/dashboard/pages/` no existe en disco.  
El módulo `dashboard` está registrado en los módulos pero sin implementación visible.

**Impacto:**  
- Los operadores no tienen un dashboard útil al iniciar.

**Riesgo:** Medio.

---

### 2.9 SOCKET.IO — LISTENERS DUPLICADOS

**Problema:**  
En `OrdersPage.tsx` del Desktop, el socket se subscribe en `useEffect` con:
```js
socket.on("order:created", handleNewOrder);
socket.on("order:update", handleUpdateOrder);
socket.on("order:updated", handleUpdateOrder); // duplicado
```
`order:update` y `order:updated` están registrados para el mismo handler sin verificar cuál emite el backend realmente.

En `socket.ts` del cliente web también se registra el handler en `setupSocketListeners()` Y en `onOrderStatus()` — potencialmente dos listeners simultáneos.

**Riesgo:** Bajo-Medio — puede causar doble procesamiento de eventos.

---

### 2.10 IMAGEN EN EL MODELO USER — INCONSISTENCIA

**Problema:**  
El campo `avatar` existe en el User model (se llena vía OAuth).  
Pero no hay endpoint de upload de avatar para usuarios que registraron con email/password.  
El endpoint `/upload` existe (Cloudinary) pero no hay flujo de "actualizar avatar del usuario".

**Riesgo:** Bajo — feature incompleta.

---

## 3. ENDPOINTS FALTANTES (IDENTIFICADOS)

| Endpoint | Método | Descripción | Prioridad |
|---|---|---|---|
| `/auth/profile` | PATCH | Editar propio perfil (nombre, teléfono) | CRÍTICA |
| `/auth/password` | PATCH | Cambiar contraseña (cliente autenticado) | ALTA |
| `/orders/my-history` | GET | Historial del cliente autenticado | ALTA |
| `/promotions/:id` | PUT | Editar promoción existente | ALTA |
| `/promotions/:id/toggle` | PATCH | Activar/desactivar sin eliminar | ALTA |
| `/reservations/my-history` | GET | Reservas del cliente autenticado | MEDIA |
| `/users/me/favorites` | GET/POST/DELETE | Gestión de favoritos | MEDIA |

---

## 4. CAMPOS FALTANTES EN MODELOS

### User
```javascript
phone:     { type: String, default: null }         // Para perfil del cliente
// avatar ya existe pero solo vía OAuth — agregar upload manual
// favorites[] para productos favoritos
favorites: [{ type: ObjectId, ref: "Product" }]    // Nuevo
```

### Order
```javascript
userId:    { type: ObjectId, ref: "User", index: true }  // Para historial por usuario
// Actualmente los pedidos no guardan quién los hizo desde el cliente
// Solo guardan createdBy (empleado que lo creó en el Desktop)
```

---

## 5. INCONSISTENCIAS EN CONTRATOS API

| Capa | Campo | Valor | Esperado por frontend |
|---|---|---|---|
| `POST /auth/login` response | `user.id` | String | `AuthUser._id` |
| `GET /auth/me` response | `_id` | ObjectId | `AuthUser._id` ✓ |
| `GET /orders` | sin filtro `userId` | — | historial del cliente |
| `GET /promotions/public` | `active` | boolean | ✓ |
| `POST /auth/logout` | requiere `refreshToken` en body | — | no se envía desde `useAuth.logout()` |

---

## 6. SEGURIDAD — RIESGOS IDENTIFICADOS

1. **Logout incompleto:** refresh token no invalidado en el servidor.
2. **`orders:global` abierto:** cualquier cliente autenticado que llame `joinOrdersGlobal()` recibe error silencioso del servidor, pero si el middleware fallara, vería todas las órdenes.
3. **`GET /orders` sin auth:** la ruta no requiere `protect`. Cualquiera puede listar órdenes.
4. **`GET /tables` sin auth:** pública. Expone estructura interna de mesas.
5. **Datos de otros clientes:** no hay filtro que aísle pedidos de un cliente de otro. El historial de pedidos de un cliente A podría ser visible por cliente B si conoce el `sessionId`.

---

## 7. PLAN DE ATAQUE — FASES

### FASE 2 — BACKEND FOUNDATION (inmediata)

**2A — Perfil del cliente:**
- `PATCH /auth/profile` → editar `name`, `phone` del propio usuario
- Protegido con `protect` (cualquier rol)
- Aislado: solo puede editar su propio `req.user.id`
- Agregar `phone` al User model

**2B — Cambio de contraseña:**
- `PATCH /auth/password` → `{ currentPassword, newPassword }`
- Verifica `currentPassword` antes de cambiar
- Solo para usuarios con `provider === 'local'`

**2C — Promociones completas:**
- `PUT /promotions/:id` → editar
- `PATCH /promotions/:id/toggle` → activar/desactivar
- Permisos: `admin | manager`

**2D — Historial de órdenes del cliente:**
- `GET /orders/my-history` → protegido, filtrado por `req.user.id`
- Requiere agregar `userId` al Order model
- Retornar: id, status, total, items (resumen), createdAt, tableNumber

**2E — Socket.IO para el cliente:**
- Cuando un pedido cambia de estado, emitir también a `user:{userId}` si el Order tiene `userId`
- Así el cliente recibe sus propias actualizaciones sin estar en `orders:global`

**2F — Favoritos:**
- Agregar `favorites: [ObjectId]` al User model
- `GET /users/me/favorites` → lista de productos favoritos populados
- `POST /users/me/favorites` → `{ productId }`
- `DELETE /users/me/favorites/:productId`

### FASE 3 — CLIENTE WEB

**3A — Customer Hub completo** (reemplaza AccountView actual):
- Sección perfil con modo edición (llama a PATCH /auth/profile)
- Historial de pedidos real (GET /orders/my-history)
- Próxima reserva (GET /reservations/my-history — primeras upcoming)
- Promociones activas (GET /promotions/public — ya existe)
- Sección seguridad: cambio de contraseña
- Logout que también llama POST /auth/logout con el refreshToken

**3B — Favoritos** en carta + en cuenta

**3C — Pedido en tiempo real mejorado:**
- Socket.IO emite a `user:{userId}` desde el backend
- El cliente se suscribe correctamente y recibe updates

### FASE 4 — BARTENDER DESKTOP

**PromotionsPage completa:**
- Listar por estado (activas, programadas, expiradas)
- Crear, editar, activar/desactivar
- Conectada al backend via `promotionService.ts` nuevo
- Tipos TypeScript correctos

### FASE 5 — QA

- TypeScript sin errores en ambos proyectos
- Sin datos hardcodeados
- Logout limpia servidor + cliente
- Contratos API documentados

---

## 8. DEPENDENCIAS ENTRE FASES

```
FASE 2E (Socket userId) 
    → requiere FASE 2D (userId en Order)
    → permite FASE 3C (real-time en cliente)

FASE 2A (PATCH /auth/profile)
    → permite FASE 3A (edición de perfil en Customer Hub)

FASE 2F (Favoritos backend)
    → permite FASE 3B (Favoritos en carta)

FASE 2C (Promotion PUT/PATCH)
    → permite FASE 4 (PromotionsPage Desktop)
```

---

## 9. ARCHIVOS QUE NO DEBEN MODIFICARSE DURANTE LA MODERNIZACIÓN

- `.next/` — generado
- `dist-electron/` — generado  
- `release/` — generado
- `backend/logs/` — runtime

---

## 10. FUNCIONALIDADES EXISTENTES A PRESERVAR

| Funcionalidad | Estado | Notas |
|---|---|---|
| Login email/password | ✓ Funciona | No tocar Identity Decision Engine |
| Login Google OAuth | ✓ Funciona | No tocar googleCallback |
| SSO web→desktop | ✓ Funciona | No tocar ssoTokenStore |
| Carrito (Zustand persist) | ✓ Funciona | Cuidar al extender useClienteStore |
| Reservas con restricciones | ✓ Funciona | Recién implementado |
| Inventario 3 niveles | ✓ Funciona | Recién rediseñado |
| Mesas con tableCode | ✓ Funciona | Recién implementado |
| Productos en welcome page | ✓ Funciona | Recién implementado |
| Carrito modal + confirm | ✓ Funciona | Recién implementado |
| OrdersPage Desktop | ✓ Funciona | No reescribir |
| Socket.IO auth middleware | ✓ Funciona | Extender, no reemplazar |
