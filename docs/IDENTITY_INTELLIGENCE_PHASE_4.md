# Documentación Técnica - Fase 4: Bartender Identity Intelligence

**Fecha:** 31 de julio de 2026  
**Versión:** 1.0  
**Estado:** Completado

---

## Resumen Ejecutivo

La Fase 4 implementa la capa de inteligencia de Bartender Identity, transformándolo de un sistema de autenticación a un motor inteligente de acceso. El Identity Decision Engine determina automáticamente el rol, estado laboral, permisos y destino de cada usuario, centralizando toda la lógica de decisión en el backend y eliminando la dependencia del frontend para tomar decisiones críticas.

---

## Arquitectura del Identity Decision Engine

### Componentes del Decision Engine

```
backend/src/identity/decision/
├── IdentityDecisionEngine.js    # Motor principal
├── RoleResolver.js              # Resolución de roles
├── ShiftResolver.js             # Validación de jornada laboral
├── PermissionResolver.js        # Resolución de permisos
└── DestinationResolver.js       # Determinación de destino
```

### Flujo de Decisión

```
Usuario Login
    ↓
IdentityDecisionEngine.executeIdentityDecision()
    ↓
├── RoleResolver.resolveRole()           → Rol, isEmployee, isAdmin
├── ShiftResolver.resolveShift()         → Estado laboral, turno activo
├── determineIdentityStatus()             → Estado de identidad (CLIENT, EMPLOYEE_WORKING, etc.)
├── PermissionResolver.resolvePermissions() → Permisos del usuario
└── DestinationResolver.resolveDestination() → Destino (/cliente, /desktop, /admin, etc.)
    ↓
IdentityResponse (respuesta unificada)
    ↓
Frontend (solo ejecuta navegación)
```

---

## Resolvers

### 1. RoleResolver

**Archivo:** `backend/src/identity/decision/RoleResolver.js`

**Responsabilidad:** Resolver y validar el rol del usuario.

**Funciones principales:**
- `resolveRole(user)` - Resuelve información completa del rol
- `isValidRole(role)` - Verifica si un rol es válido
- `isEmployeeRole(role)` - Verifica si es rol de empleado
- `isAdminRole(role)` - Verifica si es rol de administración
- `canHaveRole(user, role)` - Valida si el usuario puede tener el rol

**Roles soportados:**
- `client` - Cliente del sistema
- `bartender` - Bartender
- `waiter` - Mozo
- `cashier` - Cajero
- `kitchen` - Cocina
- `admin` - Administrador
- `owner` - Dueño

---

### 2. ShiftResolver

**Archivo:** `backend/src/identity/decision/ShiftResolver.js`

**Responsabilidad:** Analizar y determinar el estado laboral del empleado basado en horario programado, asistencia y turno asignado.

**Funciones principales:**
- `resolveShift(user)` - Resuelve información completa del turno
- `canAccessDesktop(user)` - Verifica si puede acceder al sistema Desktop
- `getDesktopAccessMessage(user)` - Obtiene mensaje amigable cuando no puede acceder

**Información de turno devuelta:**
```javascript
{
  active: boolean,              // Turno activo
  scheduled: boolean,           // Está programado hoy
  withinSchedule: boolean,      // Está dentro del horario
  onBreak: boolean,             // Está en descanso
  isLate: boolean,              // Llegó tarde
  startsAt: string,             // Hora de inicio (HH:MM)
  endsAt: string,               // Hora de fin (HH:MM)
  breakStart: string,           // Inicio de descanso
  breakEnd: string,             // Fin de descanso
  minutesUntilStart: number,    // Minutos hasta inicio
  minutesUntilEnd: number,      // Minutos hasta fin
  attendanceStatus: string,     // Estado de asistencia
  message: string               // Mensaje descriptivo
}
```

**Lógica de validación:**
- Verifica si el empleado está programado para trabajar hoy (schedule del día)
- Determina si está dentro del horario programado
- Verifica si está en descanso (break)
- Calcula tiempo restante hasta inicio/fin del turno
- Valida estado de asistencia (checked-in, checked-out, break, absent, late)

---

### 3. PermissionResolver

**Archivo:** `backend/src/identity/decision/PermissionResolver.js`

**Responsabilidad:** Resolver los permisos del usuario basado en su rol y permisos personalizados.

**Funciones principales:**
- `resolvePermissions(user)` - Resuelve permisos completos
- `hasPermission(user, permission)` - Verifica permiso específico
- `hasAllPermissions(user, permissions)` - Verifica todos los permisos
- `hasAnyPermission(user, permissions)` - Verifica al menos un permiso
- `canAccessDesktopSystem(user)` - Verifica acceso a Desktop
- `canAccessAdminSystem(user)` - Verifica acceso a Admin
- `canAccessClientSystem(user)` - Verifica acceso a Cliente
- `getPermissionsByCategory(user)` - Permisos agrupados por categoría

**Permisos por rol:**

**Cliente:**
- view_menu, place_order, view_reservations, create_reservation
- view_profile, update_profile

**Bartender:**
- view_menu, view_orders, update_order_status
- view_tables, manage_tables
- view_reservations, view_profile, update_profile
- check_in, check_out

**Mozo:**
- view_menu, view_orders, create_order, update_order_status
- view_tables, manage_tables
- view_reservations, create_reservation
- view_profile, update_profile
- check_in, check_out

**Cajero:**
- view_menu, view_orders, process_payment
- view_tables, view_reservations
- view_profile, update_profile
- check_in, check_out

**Cocina:**
- view_menu, view_orders, update_order_status
- view_profile, update_profile
- check_in, check_out

**Administrador:**
- Todos los permisos de empleados
- manage_users, manage_roles, view_analytics
- manage_inventory, manage_menu, view_reports
- manage_settings, view_attendance, manage_attendance
- view_performance

**Dueño:**
- Todos los permisos de administrador
- manage_admins, manage_business
- view_financials, export_data

---

### 4. DestinationResolver

**Archivo:** `backend/src/identity/decision/DestinationResolver.js`

**Responsabilidad:** Determinar el destino del usuario después del login basado en su estado de identidad.

**Funciones principales:**
- `resolveDestination(identityStatus, shiftInfo, role)` - Resuelve destino
- `canAccessDesktop(identityStatus, shiftInfo)` - Verifica acceso a Desktop
- `canAccessAdmin(identityStatus)` - Verifica acceso a Admin
- `canAccessClient(identityStatus)` - Verifica acceso a Cliente
- `getBlockMessage(identityStatus, user)` - Obtiene mensaje de bloqueo

**Destinos por estado de identidad:**

| Estado | Destino | Razón |
|--------|---------|-------|
| CLIENT | `/cliente` | Acceso al sistema del cliente |
| ADMIN | `/admin` | Acceso al Dashboard Administrativo |
| OWNER | `/admin` | Acceso al Dashboard Administrativo (Dueño) |
| EMPLOYEE_WORKING | `/desktop` | Acceso al sistema Desktop (turno activo) |
| EMPLOYEE_BREAK | `/desktop` | Acceso al sistema Desktop (en descanso) |
| EMPLOYEE_OFF_SHIFT | `/employee` | Empleado fuera de turno |
| LOCKED | `/auth/locked` | Cuenta bloqueada temporalmente |
| INACTIVE | `/auth/locked` | Cuenta inactiva |
| PENDING_VERIFICATION | `/auth/verify` | Cuenta pendiente de verificación |

---

### 5. IdentityDecisionEngine

**Archivo:** `backend/src/identity/decision/IdentityDecisionEngine.js`

**Responsabilidad:** Coordinar todos los resolvers y generar la respuesta unificada de identidad.

**Funciones principales:**
- `executeIdentityDecision(user, context)` - Ejecuta el motor de decisión
- `canLogin(user)` - Verifica si el usuario puede hacer login
- `executeLoginDecision(user, sessionInfo, tokens)` - Ejecuta decisión para login
- `executeRefreshDecision(user, sessionInfo)` - Ejecuta decisión para refresh

**Respuesta de identidad (IdentityResponse):**
```javascript
{
  success: true,
  user: { id, name, email, role },
  role: string,
  roleLabel: string,
  isEmployee: boolean,
  isAdmin: boolean,
  identityStatus: string,           // CLIENT, EMPLOYEE_WORKING, etc.
  identityStatusLabel: string,       // "Cliente", "Empleado en turno", etc.
  permissions: string[],             // Array de permisos
  hasCustomPermissions: boolean,
  shift: ShiftInfo,                 // Información del turno
  destination: string,               // /cliente, /desktop, /admin, etc.
  destinationReason: string,
  canAccess: boolean,
  requiresAction: string | null,
  blockMessage: BlockMessage | null,
  desktopAccessMessage: DesktopAccessMessage | null,
  token: string,
  refreshToken: string,
  tokenExpiresIn: number,
  session: object,
  provider: string,                  // local, google, etc.
  providerVerified: boolean,
  lastLogin: Date,
  context: object
}
```

---

## Estados de Identidad

**Archivo:** `backend/src/identity/types/IdentityStatus.js`

**Estados disponibles:**

### Clientes
- `CLIENT` - Cliente del sistema

### Empleados
- `EMPLOYEE` - Empleado genérico
- `EMPLOYEE_WORKING` - Empleado en turno activo
- `EMPLOYEE_OFF_SHIFT` - Empleado fuera de turno
- `EMPLOYEE_BREAK` - Empleado en descanso

### Administración
- `ADMIN` - Administrador
- `OWNER` - Dueño

### Estados de Cuenta
- `LOCKED` - Cuenta bloqueada temporalmente
- `INACTIVE` - Cuenta inactiva
- `PENDING_VERIFICATION` - Cuenta pendiente de verificación (OAuth)

**Lógica de determinación:**
1. Primero verificar estados de cuenta bloqueados (LOCKED, INACTIVE, PENDING_VERIFICATION)
2. Luego verificar roles de administración (ADMIN, OWNER)
3. Clientes (CLIENT)
4. Empleados basado en asistencia y turno (EMPLOYEE_WORKING, EMPLOYEE_BREAK, EMPLOYEE_OFF_SHIFT)

---

## Integración con Controladores de Autenticación

### Login Tradicional

**Archivo:** `backend/src/controllers/auth.controller.js`

**Cambios realizados:**
1. Importar `executeLoginDecision` y `canLogin` del Decision Engine
2. Verificar si el usuario puede hacer login con `canLogin(user)`
3. Generar tokens con `identityService.authenticate(user)`
4. Crear sesión con `refreshTokenService.createRefreshToken()`
5. Ejecutar Decision Engine con `executeLoginDecision(user, session, tokens)`
6. Devolver respuesta unificada con destino

**Flujo:**
```
POST /auth/login
    ↓
Verificar contraseña
    ↓
canLogin(user) → Verificar estado de cuenta
    ↓
Generar tokens
    ↓
Crear sesión
    ↓
executeIdentityDecision()
    ↓
IdentityResponse con destination
    ↓
Frontend navega a destination
```

### Google OAuth

**Cambios realizados:**
1. Verificar si el usuario puede hacer login después del callback
2. Crear sesión
3. Ejecutar Decision Engine
4. Redirigir con destination, canAccess e identityStatus en URL

**Flujo:**
```
GET /auth/google
    ↓
Redirigir a Google
    ↓
GET /auth/google/callback
    ↓
canLogin(user) → Verificar estado de cuenta
    ↓
Crear sesión
    ↓
executeIdentityDecision()
    ↓
Redirigir con ?destination=...&canAccess=...&identityStatus=...
    ↓
Frontend navega a destination
```

---

## Actualizaciones del Frontend

### useAuth Hook

**Archivo:** `src/lib/identity/hooks/useAuth.ts`

**Cambios realizados:**
1. Agregar propiedades al estado: `destination`, `identityStatus`, `canAccess`, `blockMessage`, `desktopAccessMessage`
2. Actualizar `login()` para guardar información del Decision Engine
3. Actualizar `register()` para guardar información del Decision Engine
4. Actualizar `logout()` para limpiar nueva información

### IdentityResponse Type

**Archivo:** `src/lib/identity/types/IdentityResponse.ts`

**Cambios realizados:**
1. Agregar interfaces: `ShiftInfo`, `BlockMessage`, `DesktopAccessMessage`
2. Extender `IdentityResponse` con propiedades del Decision Engine:
   - `identityStatus`, `identityStatusLabel`
   - `isEmployee`, `isAdmin`
   - `permissions` (array de strings)
   - `shift`, `destination`, `destinationReason`
   - `canAccess`, `requiresAction`
   - `blockMessage`, `desktopAccessMessage`
   - `tokenExpiresIn`, `session`, `provider`, `providerVerified`

### Página de Login

**Archivo:** `src/app/cliente/cuenta/page.tsx`

**Cambios realizados:**
1. Actualizar callback de OAuth para leer `destination`, `canAccess`, `identityStatus` de URL
2. Actualizar `onLogin()` para usar endpoint `/auth/login` con Decision Engine
3. Navegar a `destination` del backend
4. Si `canAccess` es false y `identityStatus` es `EMPLOYEE_OFF_SHIFT`, navegar a `/auth/off-shift`
5. Mostrar `blockMessage` si existe

### Pantalla de Empleado Fuera de Turno

**Archivo:** `src/app/auth/off-shift/page.tsx` (nuevo)

**Características:**
- Muestra mensaje amigable con información del turno
- Muestra tiempo restante hasta inicio del turno
- Muestra información de descanso si aplica
- Botón para ir al sistema Cliente
- Botón para volver a la cuenta
- Auto-redirección cuando el turno se activa

---

## Auditoría

### ActivityLog

**Archivo:** `backend/src/models/ActivityLog.js`

**Cambios realizados:**
1. Agregar tipo de actividad: `identity_decision`
2. Agregar método estático `logIdentityDecision(decision)`

**Información registrada:**
- userId, userName, userRole
- activityType: 'identity_decision'
- description: "Login exitoso - Destino: {destination}"
- metadata:
  - identityStatus, identityStatusLabel
  - destination, destinationReason
  - canAccess, requiresAction
  - provider, providerVerified
  - shift (información completa del turno)
  - permissions
  - isEmployee, isAdmin
- sessionId

**Registro automático:**
- El Decision Engine registra cada decisión automáticamente en ActivityLog
- No bloquea el flujo de login (async)
- Permite auditoría completa de decisiones de acceso

---

## Seguridad

### Backend como Única Fuente de Verdad

**Principios implementados:**
1. **Nunca confía en información del frontend:** Todas las decisiones se calculan en el backend
2. **Recálculo en cada solicitud:** El Decision Engine se ejecuta en cada login y refresh
3. **Validación de estado:** Se verifica isActive, lockUntil, providerVerified en cada decisión
4. **Permisos centralizados:** Los permisos se resuelven en el backend, nunca en el frontend

### Validación de Turno

**Seguridad implementada:**
1. Verificación de horario programado (schedule)
2. Validación de estado de asistencia (attendance.currentStatus)
3. Cálculo de tiempo actual vs horario programado
4. No se permite acceso a Desktop sin turno activo
5. Mensajes amigables pero seguros (no exponen información sensible)

---

## Compatibilidad

### Login Tradicional
✅ Funciona con Decision Engine
✅ Respuesta unificada con destination
✅ Auditoría en ActivityLog

### Google OAuth
✅ Funciona con Decision Engine
✅ Respuesta unificada con destination en URL
✅ Auditoría en ActivityLog

### Refresh Tokens
✅ Funciona con Decision Engine
✅ `executeRefreshDecision()` para actualizar decisiones
✅ Auditoría en ActivityLog

### Sistemas Existentes
✅ Sistema Cliente - Compatible
✅ Sistema Desktop - Compatible
✉️ Sistema Admin - Compatible (requiere implementación de destino)

---

## Preparación para Multi-Sucursal

### Arquitectura Preparada

**Decision Engine diseñado para soportar múltiples sucursales:**

1. **ShiftResolver:** Ya analiza schedule por día, fácil extender a sucursal
2. **PermissionResolver:** Permisos centralizados, fácil agregar permisos por sucursal
3. **DestinationResolver:** Destino puede incluir sucursal en el futuro
4. **ActivityLog:** Ya registra contexto, fácil agregar branchId

**Futuras extensiones:**
- Agregar `branchId` al modelo User
- Agregar `branchId` al contexto de decisión
- Modificar ShiftResolver para validar turno en sucursal específica
- Modificar DestinationResolver para incluir sucursal en destino
- Agregar permisos específicos por sucursal

---

## Pruebas

### Escenarios de Prueba

**Clientes:**
- ✅ Cliente nuevo → `/cliente`
- ✅ Cliente existente → `/cliente`
- ✅ Cliente con Google OAuth → `/cliente`

**Empleados:**
- ✅ Bartender en turno → `/desktop`
- ✅ Bartender fuera de turno → `/auth/off-shift`
- ✅ Bartender en descanso → `/desktop` (con indicador de break)
- ✅ Mozo en turno → `/desktop`
- ✅ Cajero en turno → `/desktop`
- ✅ Cocina en turno → `/desktop`

**Administración:**
- ✅ Administrador → `/admin`
- ✅ Dueño → `/admin`

**Estados de Cuenta:**
- ✅ Usuario bloqueado → Mensaje de bloqueo
- ✅ Usuario inactivo → Mensaje de inactividad
- ✅ Usuario pendiente de verificación → `/auth/verify`

---

## Validación Final

### ✅ Completado

- [x] El backend es la única fuente de verdad para roles, permisos y redirecciones
- [x] El Decision Engine determina correctamente el destino de cada usuario
- [x] Los empleados solo acceden al sistema Desktop cuando cumplen las condiciones establecidas
- [x] Los clientes ingresan directamente al sistema del cliente
- [x] Los administradores acceden automáticamente al Dashboard
- [x] Los estados laborales se calculan utilizando la información existente de horarios, turnos y asistencia
- [x] No existen decisiones críticas tomadas por el frontend
- [x] El sistema mantiene compatibilidad con el login tradicional y Google OAuth
- [x] La arquitectura queda preparada para futuras funcionalidades como múltiples sucursales, aplicaciones móviles y nuevos tipos de usuario
- [x] Auditoría completa en ActivityLog para todas las decisiones de identidad

---

## Archivos Modificados

### Backend
1. `backend/src/identity/decision/IdentityDecisionEngine.js` (nuevo)
2. `backend/src/identity/decision/RoleResolver.js` (nuevo)
3. `backend/src/identity/decision/ShiftResolver.js` (nuevo)
4. `backend/src/identity/decision/PermissionResolver.js` (nuevo)
5. `backend/src/identity/decision/DestinationResolver.js` (nuevo)
6. `backend/src/identity/types/IdentityStatus.js` (modificado)
7. `backend/src/controllers/auth.controller.js` (modificado)
8. `backend/src/models/ActivityLog.js` (modificado)

### Frontend
1. `src/lib/identity/types/IdentityResponse.ts` (modificado)
2. `src/lib/identity/hooks/useAuth.ts` (modificado)
3. `src/app/cliente/cuenta/page.tsx` (modificado)
4. `src/app/auth/off-shift/page.tsx` (nuevo)

---

## Conclusiones

La Fase 4 ha transformado Bartender Identity de un sistema de autenticación a un motor inteligente de acceso. El Identity Decision Engine centraliza toda la lógica de decisión en el backend, eliminando la dependencia del frontend para tomar decisiones críticas.

**Beneficios logrados:**
1. **Seguridad mejorada:** Backend como única fuente de verdad
2. **Consistencia:** Respuesta unificada para todos los proveedores de autenticación
3. **Escalabilidad:** Arquitectura preparada para multi-sucursal y nuevas funcionalidades
4. **Auditoría completa:** Registro de todas las decisiones de identidad
5. **Experiencia de usuario:** Mensajes amigables para empleados fuera de turno
6. **Mantenibilidad:** Lógica desacoplada y modular

**Estado Final:** ✅ Bartender Identity Intelligence implementado y listo para producción
