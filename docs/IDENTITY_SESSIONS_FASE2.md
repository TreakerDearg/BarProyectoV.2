# Documentación Técnica - Fase 2: Modernización del Sistema de Sesiones

## Resumen Ejecutivo

Esta fase implementó un sistema moderno de sesiones basado en Access Tokens y Refresh Tokens con rotación automática. El sistema reemplaza la arquitectura anterior basada únicamente en JWT de larga duración por un sistema más seguro y escalable que permite:

- Renovación automática de tokens sin interrumpir al usuario
- Gestión de múltiples sesiones simultáneas por usuario
- Revocación de sesiones específicas o globales
- Control de dispositivos y plataformas
- Preparación para Google OAuth, SSO y MFA

**Objetivo:** Modernizar la gestión de autenticación y sesiones sin romper el login existente.

**Resultado:** Sistema de sesiones completo con refresh tokens, rotación automática, gestión de dispositivos y revocación segura.

---

## 1. Arquitectura de Sesiones

### Flujo General

```
Login
  ↓
Backend valida credenciales
  ↓
Genera Access Token (15-30 min) + Refresh Token (7-30 días)
  ↓
Crea sesión en MongoDB con información de dispositivo
  ↓
Retorna ambos tokens al cliente
  ↓
Cliente guarda ambos tokens en localStorage
  ↓
Cliente usa Access Token para peticiones
  ↓
Access Token expira
  ↓
Interceptor detecta 401
  ↓
Usa Refresh Token para renovar
  ↓
Rotación de Refresh Token (nuevo, anterior revocado)
  ↓
Nuevo Access Token + Nuevo Refresh Token
  ↓
Reintenta petición original transparentemente
  ↓
Usuario nunca nota el proceso
```

### Componentes

#### Backend

**Modelo Session (`backend/src/models/Session.js`)**
- Campos:
  - `userId`: ID del usuario
  - `refreshToken`: Refresh token hasheado (único)
  - `platform`: web, desktop, mobile, admin
  - `device`: tipo, nombre, OS, navegador, userAgent
  - `location`: IP, país, ciudad
  - `createdAt`: Fecha de creación
  - `lastActivity`: Última actividad
  - `expiresAt`: Expiración del refresh token
  - `revokedAt`: Fecha de revocación
  - `status`: active, revoked, expired
  - `metadata`: isTrusted, isRemembered, loginMethod, mfaVerified

- Métodos:
  - `isActive()`: Verifica si la sesión está activa
  - `revoke()`: Revoca la sesión
  - `updateActivity()`: Actualiza última actividad

- Métodos estáticos:
  - `cleanupExpired()`: Limpia sesiones expiradas
  - `getActiveSessions()`: Obtiene sesiones activas de un usuario
  - `revokeAllUserSessions()`: Revoca todas las sesiones de un usuario
  - `revokeByRefreshToken()`: Revoca sesión por refresh token

**RefreshTokenService (`backend/src/identity/services/RefreshTokenService.js`)**
- `generateRefreshToken()`: Genera refresh token y crea sesión
- `verifyRefreshToken()`: Verifica refresh token y actualiza actividad
- `rotateRefreshToken()`: Rota refresh token (revoca anterior, genera nuevo)
- `revokeRefreshToken()`: Revoca refresh token específico
- `revokeAllUserTokens()`: Revoca todos los tokens de un usuario
- `cleanupExpiredTokens()`: Limpia tokens expirados
- `getUserSessions()`: Obtiene sesiones activas de un usuario
- `revokeSession()`: Revoca sesión específica por ID

**IdentityService (`backend/src/identity/services/IdentityService.js`)**
- Modificado para usar refresh tokens en `authenticate()` y `register()`
- `generateToken()`: Ahora genera Access Token de corta duración (15-30 min)
- Retorna tanto `token` como `refreshToken` en las respuestas

**Endpoints (`backend/src/routes/auth.routes.js`)**
- `POST /auth/login`: Login con refresh tokens
- `POST /auth/register`: Registro con refresh tokens
- `POST /auth/refresh`: Renovación de tokens
- `POST /auth/logout`: Logout con revocación de sesión
- `GET /auth/sessions`: Listar sesiones activas
- `DELETE /auth/sessions/:sessionId`: Revocar sesión específica

#### Frontend Web

**Token Storage (`src/lib/auth/tokenStorage.ts`)**
- `saveAccessToken()`: Guarda access token
- `saveRefreshToken()`: Guarda refresh token
- `getAccessToken()`: Obtiene access token
- `getRefreshToken()`: Obtiene refresh token
- `clearTokens()`: Elimina ambos tokens

**API Client (`src/lib/api/client.ts`)**
- Interceptor de request: Inyecta access token en headers
- Interceptor de response:
  - Detecta 401
  - Usa refresh token para renovar
  - Reintenta petición original automáticamente
  - Maneja múltiples peticiones concurrentes
  - Dispatch evento `auth:logout` si refresh falla

**useAuth Hook (`src/lib/identity/hooks/useAuth.ts`)**
- Estado: `user`, `token`, `refreshToken`, `isAuthenticated`, `loading`, `error`
- `login()`: Guarda ambos tokens
- `register()`: Guarda ambos tokens
- `logout()`: Limpia ambos tokens
- Escucha evento `auth:logout` global

#### Frontend Desktop

**API Service (`bartender-desktop/src/services/api.ts`)**
- Interceptor de request: Inyecta access token
- Interceptor de response:
  - Detecta 401
  - Usa refresh token para renovar
  - Reintenta petición original
  - Dispatch evento `auth:logout` si refresh falla

**Auth Store (`bartender-desktop/src/store/authStore.ts`)**
- Estado: `user`, `token`, `refreshToken`, `isAuthenticated`, `loading`
- `login()`: Guarda ambos tokens
- `logout()`: Limpia ambos tokens
- `initialize()`: Valida token al iniciar

---

## 2. Flujo de Refresh Tokens

### Diagrama de Flujo

```
┌─────────────────┐
│  Login Request  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Backend valida credenciales     │
│  - Verifica usuario              │
│  - Verifica contraseña          │
│  - Verifica estado              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Genera Access Token            │
│  - JWT con {id, role, shift}    │
│  - Expira en 15-30 minutos      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Genera Refresh Token           │
│  - Crypto random 64 bytes       │
│  - Expira en 7-30 días          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Crea Session en MongoDB        │
│  - userId, refreshToken         │
│  - platform, device, location  │
│  - metadata (trusted, method)   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Retorna ambos tokens            │
│  { token, refreshToken, ... }   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Cliente guarda en localStorage │
│  - bartender_access_token       │
│  - bartender_refresh_token      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Cliente usa Access Token       │
│  - Headers: Authorization      │
│  - Todas las peticiones API    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Access Token expira           │
│  - 401 Unauthorized            │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Interceptor detecta 401       │
│  - Verifica si ya está refrescando
│  - Si no, inicia refresh       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  POST /auth/refresh            │
│  - Envía refresh token          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Backend verifica refresh token │
│  - Busca sesión activa          │
│  - Verifica expiración         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Rotación de Refresh Token     │
│  - Revoca token anterior        │
│  - Genera nuevo token          │
│  - Actualiza sesión            │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Genera nuevo Access Token     │
│  - JWT con {id, role, shift}    │
│  - Expira en 15-30 minutos      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Retorna nuevos tokens          │
│  { token, refreshToken, ... }   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Cliente actualiza localStorage │
│  - Guarda nuevos tokens         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Reintenta petición original    │
│  - Con nuevo access token       │
│  - Transparente para usuario    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Usuario continúa trabajando    │
│  - Sin interrupción             │
│  - Sin volver a loguear        │
└─────────────────────────────────┘
```

### Rotación de Refresh Tokens

**Por qué rotar:**
- Seguridad: Si un refresh token es comprometido, solo puede usarse una vez
- Detección de ataques: Reutilización de token antiguo indica posible ataque
- Actualización de sesión: Cada rotación actualiza `lastActivity`

**Proceso:**
1. Cliente envía refresh token
2. Backend verifica que esté activo y no expirado
3. Backend revoca el refresh token anterior
4. Backend genera nuevo refresh token
5. Backend actualiza la sesión con el nuevo token
6. Backend retorna nuevo refresh token + nuevo access token
7. Cliente guarda ambos nuevos tokens

**Si se reutiliza un token revocado:**
- Backend detecta que el token ya está revocado
- Backend rechaza la petición
- Cliente debe volver a loguear

---

## 3. Gestión de Sesiones

### Creación de Sesión

**Al hacer login:**
```javascript
const sessionInfo = {
  platform: 'web', // o 'desktop', 'mobile', 'admin'
  userAgent: req.headers['user-agent'],
  ip: req.ip,
  isTrusted: false,
  isRemembered: false,
  loginMethod: 'password', // o 'google', 'github', etc.
  mfaVerified: false,
};

const refreshTokenData = await refreshTokenService.generateRefreshToken(
  userId,
  sessionInfo
);
```

**Información capturada:**
- Plataforma (web, desktop, mobile, admin)
- Tipo de dispositivo (desktop, mobile, tablet, unknown)
- Nombre del dispositivo (si disponible)
- Sistema operativo
- Navegador
- User Agent string
- IP del cliente
- Método de login (password, OAuth)
- Si es MFA verificado
- Si es dispositivo confiable

### Listado de Sesiones

**Endpoint:** `GET /auth/sessions`

**Respuesta:**
```json
[
  {
    "id": "session_id_1",
    "platform": "web",
    "device": {
      "type": "desktop",
      "name": null,
      "os": "Windows 10",
      "browser": "Chrome",
      "userAgent": "Mozilla/5.0..."
    },
    "location": {
      "ip": "192.168.1.1",
      "country": null,
      "city": null
    },
    "createdAt": "2026-07-29T15:00:00.000Z",
    "lastActivity": "2026-07-29T15:30:00.000Z",
    "expiresAt": "2026-08-05T15:00:00.000Z",
    "metadata": {
      "isTrusted": false,
      "isRemembered": false,
      "loginMethod": "password",
      "mfaVerified": false
    }
  }
]
```

### Revocaciónde Sesión

**Revocar sesión específica:**
```
DELETE /auth/sessions/:sessionId
```

**Revocar todas las sesiones excepto la actual:**
```
DELETE /auth/sessions/:sessionId
Body: { "revokeAll": true }
```

**Logout (revocar sesión actual):**
```
POST /auth/logout
Body: { "refreshToken": "..." }
```

### Limpieza de Sesiones Expiradas

**Cron job recomendado:**
```javascript
// Ejecutar cada hora
setInterval(async () => {
  const count = await refreshTokenService.cleanupExpiredTokens();
  console.log(`Limpieza de sesiones: ${count} eliminadas`);
}, 60 * 60 * 1000);
```

---

## 4. Compatibilidad

### Cambios No Destructivos

**Backend:**
- **Access Token:** Expira en 15-30 minutos (antes 8 horas)
- **Refresh Token:** Nuevo campo en respuesta de login
- **Middleware protect:** Sin cambios (sigue validando JWT)
- **Endpoints existentes:** Sin cambios en firma
- **Nuevos endpoints:** `/auth/refresh`, `/auth/sessions`, `DELETE /auth/sessions/:id`

**Frontend Web:**
- **LocalStorage:** Nuevas claves `bartender_access_token` y `bartender_refresh_token`
- **Interceptor:** Agregado manejo de 401 con renovación automática
- **useAuth hook:** Actualizado para manejar refresh tokens
- **Zustand store:** Compatibilidad mantenida con `useClienteStore`

**Frontend Desktop:**
- **LocalStorage:** Mismo mecanismo de token storage
- **Interceptor:** Agregado manejo de 401 con renovación automática
- **Auth store:** Actualizado para manejar refresh tokens

### Migración de Usuarios Existentes

**Usuarios con tokens antiguos:**
- Tokens antiguos (8 horas) seguirán funcionando hasta que expiren
- Al expirar, el usuario deberá volver a loguear
- Nuevo login generará refresh tokens
- No hay migración manual necesaria

**Compatibilidad con código existente:**
- El middleware `protect` sigue funcionando igual
- Los endpoints `/auth/login` y `/auth/register` siguen aceptando las mismas credenciales
- La respuesta ahora incluye `refreshToken` pero es opcional para clientes que no lo usen

---

## 5. Preparación para Fase 3 (Google OAuth)

### Flujo OAuth con Refresh Tokens

**Google OAuth usará el mismo sistema:**
```
Google OAuth Callback
  ↓
Backend valida token de Google
  ↓
Busca o crea usuario
  ↓
Genera Access Token + Refresh Token
  ↓
Crea sesión con loginMethod: 'google'
  ↓
Retorna ambos tokens
  ↓
Cliente guarda tokens
  ↓
Mismo flujo de renovación automática
```

### Beneficios de la Arquitectura Actual

**Para Google OAuth:**
- Mismo endpoint `/auth/refresh` funciona para todos los métodos
- Mismo sistema de sesiones para password y OAuth
- Mismo interceptor de renovación automática
- Mismo mecanismo de revocación
- Mismo control de dispositivos

**Para SSO:**
- Sesiones pueden compartirse entre aplicaciones
- Mismo refresh token funciona en Web y Desktop
- Logout global revoca todas las sesiones
- Control de dispositivos por plataforma

**Para MFA:**
- Campo `mfaVerified` en sesión ya existe
- Flujo de refresh token puede requerir MFA
- Sesiones pueden tener diferentes niveles de confianza

---

## 6. Configuración

### Variables de Entorno

**Backend (.env):**
```env
# Access Token (15-30 minutos)
ACCESS_TOKEN_EXPIRES_IN=30m

# Refresh Token (7-30 días)
REFRESH_TOKEN_EXPIRES_IN_DAYS=7

# JWT Secret (compartido)
JWT_SECRET=tu_secret_aqui

# JWT Expires (legacy, ya no se usa pero se mantiene por compatibilidad)
JWT_EXPIRES_IN=8h
```

### Expiraciones Recomendadas

**Access Token:**
- Desarrollo: 30 minutos
- Producción: 15 minutos

**Refresh Token:**
- Desarrollo: 7 días
- Producción: 30 días (con "remember me")
- Producción: 7 días (sin "remember me")

---

## 7. Seguridad

### Medidas Implementadas

1. **Rotación de Refresh Tokens**
   - Cada uso genera un nuevo token
   - Token anterior se revoca inmediatamente
   - Previene reutilización de tokens comprometidos

2. **Expiración de Access Tokens**
   - Corta duración (15-30 minutos)
   - Reduce ventana de ataque
   - Renovación automática transparente

3. **Revocación de Sesiones**
   - Logout revoca refresh token
   - Logout global revoca todas las sesiones
   - Revocación individual por dispositivo

4. **Detección de Dispositivos**
   - User Agent parsing
   - IP tracking
   - Plataforma detection

5. **Prevención de Ataques**
   - No reutilización de refresh tokens
   - Validación de sesión activa
   - Limpieza de sesiones expiradas

### Recomendaciones Adicionales

1. **HTTPS obligatorio** en producción
2. **HttpOnly cookies** para refresh tokens (opcional)
3. **Rate limiting** en `/auth/refresh`
4. **Alertas** por actividad inusual
5. **2FA/MFA** para sesiones de administración

---

## 8. Testing

### Pruebas Implementadas

**Backend:**
- ✅ Servidor inicia sin errores
- ✅ MongoDB conecta correctamente
- ✅ Modelo Session se crea sin warnings
- ✅ Endpoints responden correctamente

**Frontend:**
- ✅ Interceptor de response maneja 401
- ✅ Renovación automática funciona
- ✅ Hooks actualizados para refresh tokens
- ✅ Compatibilidad con código existente

### Pruebas Manuales Recomendadas

1. **Login normal**
   - Verificar que se generan ambos tokens
   - Verificar que se guardan en localStorage

2. **Expiración de Access Token**
   - Esperar 15-30 minutos (o reducir expiración temporalmente)
   - Hacer una petición
   - Verificar que se renueva automáticamente

3. **Múltiples sesiones**
   - Login desde Web
   - Login desde Desktop
   - Verificar que ambas sesiones aparecen en `/auth/sessions`

4. **Logout**
   - Logout desde Web
   - Verificar que solo la sesión de Web se revoca
   - Desktop sigue funcionando

5. **Logout global**
   - Usar `revokeAll: true`
   - Verificar que todas las sesiones se revocan

6. **Refresh token inválido**
   - Usar un refresh token revocado
   - Verificar que se hace logout global

---

## 9. Resumen de Cambios

### Archivos Creados

**Backend:**
- `backend/src/models/Session.js` - Modelo de sesiones
- `backend/src/identity/services/RefreshTokenService.js` - Servicio completo (reemplazó placeholder)

**Frontend Web:**
- `src/lib/auth/tokenStorage.ts` - Gestión de tokens

### Archivos Modificados

**Backend:**
- `backend/src/identity/services/IdentityService.js` - Agregado refresh tokens en login/register
- `backend/src/controllers/auth.controller.js` - Agregados controllers para refresh, sessions, logout
- `backend/src/routes/auth.routes.js` - Agregados nuevos endpoints

**Frontend Web:**
- `src/lib/api/client.ts` - Agregado interceptor de response con renovación automática
- `src/lib/identity/hooks/useAuth.ts` - Actualizado para manejar refresh tokens

**Frontend Desktop:**
- `bartender-desktop/src/services/api.ts` - Agregado interceptor de response con renovación automática
- `bartender-desktop/src/store/authStore.ts` - Actualizado para manejar refresh tokens

### Archivos Sin Cambios

**Backend:**
- `backend/src/middlewares/auth.middleware.js` - Sin cambios
- `backend/src/models/User.js` - Sin cambios
- `backend/src/utils/response.js` - Sin cambios

**Frontend:**
- `src/stores/useClienteStore.ts` - Sin cambios (compartido con nuevo sistema)
- `src/lib/types/api.ts` - Sin cambios

---

## 10. Conclusión

La Fase 2 ha implementado exitosamente un sistema moderno de sesiones con refresh tokens y rotación automática. El sistema es:

**Más seguro:**
- Access tokens de corta duración
- Rotación de refresh tokens
- Revocación de sesiones
- Control de dispositivos

**Más usable:**
- Renovación automática transparente
- No requiere volver a loguear
- Múltiples sesiones simultáneas
- Logout por dispositivo

**Más escalable:**
- Preparado para Google OAuth
- Preparado para SSO
- Preparado para MFA
- Preparado para aplicaciones móviles

**Compatible:**
- No rompe el login existente
- No requiere migración manual
- Funciona con código existente
- Backend inicia sin errores

El sistema está listo para la Fase 3: Integración de Google OAuth, que podrá utilizar exactamente la misma infraestructura de sesiones sin modificaciones adicionales.
