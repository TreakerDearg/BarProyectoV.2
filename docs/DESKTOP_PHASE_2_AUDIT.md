# Fase 2: Auditoría Inicial - Integración Bartender Identity

**Fecha:** 31 de julio de 2026  
**Versión:** 1.0  
**Estado:** Completado  
**Objetivo:** Analizar API, endpoints y modelos de Bartender Identity disponibles para integración

---

## Resumen Ejecutivo

Se ha realizado una auditoría completa de los modelos, endpoints y tipos de Bartender Identity disponibles en el backend. La información necesaria para la Fase 2 está disponible y bien estructurada.

**Hallazgos principales:**
- ✅ Modelo User.js con campos de OAuth, horarios, asistencia, rendimiento y cumplimiento
- ✅ Modelo Session.js con información de plataforma, dispositivo y ubicación
- ✅ Modelo ActivityLog.js con registro de eventos de actividad
- ✅ Modelo Attendance.js con registro detallado de asistencia
- ✅ Modelo ShiftAssignment.js con asignación de turnos
- ✅ Modelo ShiftSchedule.js con configuración de horarios
- ✅ Modelo DeviceManager.js con gestión de dispositivos
- ✅ Tipos IdentityUser.js e IdentitySession.js preparados
- ✅ Endpoints de API disponibles para operaciones CRUD y permisos

---

## 1. Modelos de Base de Datos

### 1.1 User.js - Modelo Principal de Usuario

**Ubicación:** `backend/src/models/User.js`

**Campos principales:**

**Información Básica:**
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, optional para OAuth)

**Rol y Estado:**
- `role` (String, enum: admin, bartender, waiter, cashier, kitchen, client)
- `shift` (String, enum: morning, afternoon, night, event)
- `isEmployee` (Boolean)
- `isActive` (Boolean)
- `deletedAt` (Date)

**Permisos:**
- `permissions` (Mixed, default: {})

**Seguridad:**
- `lastLogin` (Date)
- `loginAttempts` (Number)
- `lockUntil` (Date)
- `refreshToken` (String)

**OAuth/Identity Providers:**
- `googleId` (String, sparse, indexed)
- `provider` (String, enum: local, google, apple, github, microsoft, facebook)
- `providerVerified` (Boolean)
- `avatar` (String)
- `lastProviderLogin` (Date)

**Horario (Schedule):**
- `schedule` (Object con días de la semana)
  - Cada día: `isAvailable`, `startTime`, `endTime`, `breakStart`, `breakEnd`

**Métricas de Rendimiento:**
- `performance` (Object)
  - `totalShifts`, `totalHours`, `averageRating`
  - `totalOrders`, `totalSales`, `avgOrderTime`, `errorRate`, `onTimeRate`
  - `modules` (tables, orders, payments, reservations)
  - `weekly` (shifts, hours, sales, rating)
  - `monthly` (shifts, hours, sales, rating)

**Métricas de Cumplimiento:**
- `compliance` (Object)
  - `overallScore`, `protocolAdherence`, `timeCompliance`, `qualityScore`
  - `protocols` (opening, closing, service, safety)
  - `violations` (Array)
  - `warnings` (Array)

**Asistencia:**
- `attendance` (Object)
  - `currentStatus` (checked-in, checked-out, break, absent, late)
  - `lastCheckIn`, `lastCheckOut`, `currentShiftStart`
  - `totalMinutesWorked`, `consecutiveDays`
  - `thisMonth` (present, absent, late, totalHours)
  - `leaveBalance` (vacation, sick, personal)
  - `leaveRequests` (Array)

**Métodos disponibles:**
- `comparePassword(password)` - Comparar contraseña
- `isLocked()` - Verificar si está bloqueado
- `incrementLoginAttempts()` - Incrementar intentos de login
- `resetLoginAttempts()` - Resetear intentos de login
- `checkIn()` - Registrar check-in
- `checkOut()` - Registrar check-out
- `updatePerformance(metrics)` - Actualizar métricas de rendimiento

---

### 1.2 Session.js - Modelo de Sesiones

**Ubicación:** `backend/src/models/Session.js`

**Campos principales:**

**Identificación:**
- `userId` (ObjectId, ref: User)
- `refreshToken` (String, unique)

**Plataforma y Dispositivo:**
- `platform` (String, enum: web, desktop, mobile, admin)
- `device` (Object)
  - `type` (String, enum: desktop, mobile, tablet, unknown)
  - `name` (String)
  - `os` (String)
  - `browser` (String)
  - `userAgent` (String)

**Ubicación:**
- `location` (Object)
  - `ip` (String)
  - `country` (String)
  - `city` (String)

**Timestamps:**
- `createdAt` (Date)
- `lastActivity` (Date)
- `expiresAt` (Date)
- `revokedAt` (Date)

**Estado:**
- `status` (String, enum: active, revoked, expired)

**Metadatos:**
- `metadata` (Object)
  - `isTrusted` (Boolean)
  - `isRemembered` (Boolean)
  - `loginMethod` (String, enum: password, google, github, microsoft, apple)
  - `mfaVerified` (Boolean)

**Métodos disponibles:**
- `isActive()` - Verificar si está activa
- `revoke()` - Revocar sesión
- `updateActivity()` - Actualizar última actividad
- `cleanupExpired()` (static) - Limpiar sesiones expiradas
- `getActiveSessions(userId)` (static) - Obtener sesiones activas de usuario
- `revokeAllUserSessions(userId, exceptSessionId)` (static) - Revocar todas las sesiones
- `revokeByRefreshToken(refreshToken)` (static) - Revocar por refresh token

---

### 1.3 ActivityLog.js - Modelo de Logs de Actividad

**Ubicación:** `backend/src/models/ActivityLog.js`

**Campos principales:**

**Usuario:**
- `userId` (ObjectId, ref: User)
- `userName` (String)
- `userRole` (String, enum: admin, bartender, waiter, cashier, kitchen, client)

**Actividad:**
- `activityType` (String, enum: login, logout, identity_decision, order_created, order_completed, order_cancelled, payment_processed, inventory_updated, discount_applied, table_assigned, menu_viewed, recipe_accessed, roulette_used, permission_change, settings_updated)
- `description` (String)
- `metadata` (Mixed)

**Contexto de Turno:**
- `shift` (String, enum: morning, afternoon, night, event)

**Duración:**
- `duration` (Number, en milisegundos)

**Referencias:**
- `orderId` (ObjectId, ref: Order)
- `paymentId` (ObjectId, ref: Payment)
- `discountId` (ObjectId, ref: Discount)
- `tableId` (ObjectId, ref: Table)

**Sesión:**
- `sessionId` (String)

**Métodos estáticos:**
- `logIdentityDecision(decision)` - Registrar decisión de identidad
- `calculateMetrics(userId, startDate, endDate)` - Calcular métricas de actividad

---

### 1.4 Attendance.js - Modelo de Asistencia

**Ubicación:** `backend/src/models/Attendance.js`

**Campos principales:**

**Usuario y Turno:**
- `user` (ObjectId, ref: User)
- `shift` (String, enum: morning, afternoon, night, event)
- `date` (Date)

**Timing:**
- `checkIn` (Object: time, location, device, ip)
- `checkOut` (Object: time, location, device, ip)
- `breakStart` (Date)
- `breakEnd` (Date)

**Estado:**
- `status` (String, enum: present, absent, late, early-departure, half-day)
- `isApproved` (Boolean)
- `approvedBy` (ObjectId, ref: User)
- `approvedAt` (Date)

**Horas:**
- `scheduledHours` (Number, default: 8)
- `workedHours` (Number)
- `breakHours` (Number)
- `overtimeHours` (Number)

**Rendimiento:**
- `performance` (Object)
  - `tasksCompleted`, `customerInteractions`, `salesAmount`, `efficiency`, `notes`

**Cumplimiento:**
- `compliance` (Object)
  - `protocolsFollowed`, `protocolsTotal`, `onTime`, `inUniform`
  - `violations` (Array)

**Notas:**
- `notes` (Object: employee, supervisor, system)

**Métodos:**
- `calculateOvertime()` - Calcular horas extra
- `updatePerformance(data)` - Actualizar rendimiento
- `getUserAttendance(userId, startDate, endDate)` (static) - Obtener asistencia de usuario
- `getDayAttendance(date)` (static) - Obtener asistencia del día
- `getAttendanceStats(startDate, endDate)` (static) - Obtener estadísticas

---

### 1.5 ShiftAssignment.js - Modelo de Asignación de Turnos

**Ubicación:** `backend/src/models/ShiftAssignment.js`

**Campos principales:**

**Usuario:**
- `userId` (ObjectId, ref: User)
- `userName` (String)

**Turno:**
- `shiftId` (ObjectId, ref: ShiftSchedule)
- `shiftType` (String, enum: morning, afternoon, night, event)

**Fecha:**
- `date` (String, formato YYYY-MM-DD)

**Estado:**
- `status` (String, enum: scheduled, completed, missed, late, left_early)

**Timing:**
- `scheduledStart`, `scheduledEnd` (String)
- `actualStart`, `actualEnd` (String)

**Métricas:**
- `performanceScore` (Number, 0-100)
- `notes` (String)

**Asistencia:**
- `checkInTime` (Date)
- `checkOutTime` (Date)
- `breaksTaken` (Array: startTime, endTime, duration)
- `totalWorkMinutes` (Number)

**Métodos:**
- `checkIn(timestamp)` - Registrar check-in
- `checkOut(timestamp)` - Registrar check-out
- `calculatePerformanceScore(metrics)` - Calcular puntaje de rendimiento

---

### 1.6 ShiftSchedule.js - Modelo de Horarios de Turnos

**Ubicación:** `backend/src/models/ShiftSchedule.js`

**Campos principales:**

**Información Básica:**
- `shiftType` (String, enum: morning, afternoon, night, event)

**Timing:**
- `startTime`, `endTime` (String, formato HH:MM)
- `breaks` (Array: startTime, endTime, description, isPaid)

**Staffing:**
- `assignedEmployees` (Array de ObjectId)
- `maxEmployees` (Number, default: 5)
- `minEmployees` (Number, default: 2)

**Módulos y Permisos:**
- `modules` (Array: orders, cashier, inventory, roulette, employees, menus, tables, reservations, discounts)
- `permissions` (Mixed)

**Configuración:**
- `isActive` (Boolean)
- `priority` (Number, 1-10)
- `description` (String)
- `applicableDays` (Array: monday, tuesday, etc.)

**Métodos:**
- `isWithinShift(time)` - Verificar si hora está dentro del turno
- `getActiveEmployees()` - Obtener empleados asignados activos

---

### 1.7 DeviceManager.js - Modelo de Dispositivos

**Ubicación:** `backend/src/ecosystem/DeviceManager.js`

**Campos principales:**

**Usuario:**
- `userId` (ObjectId, ref: User)
- `userEmail` (String)
- `userRole` (String)

**Dispositivo:**
- `platform` (String, enum: web_client, web_admin, desktop, mobile, tablet, kiosk, api)
- `deviceType` (String, enum: desktop, laptop, mobile, tablet, kiosk, server, other)
- `browser` (String)
- `os` (String)
- `appVersion` (String)
- `deviceName` (String)

**Red:**
- `ipAddress` (String)
- `userAgent` (String)
- `location` (Object: country, city, region)

**Sesión:**
- `sessionId` (String, unique)
- `refreshTokenId` (String)
- `tokenExpiresAt` (Date)
- `refreshTokenExpiresAt` (Date)

**Actividad:**
- `lastActivity` (Date)
- `isActive` (Boolean)
- `isRevoked` (Boolean)
- `revokedAt` (Date)
- `revokedReason` (String)

**Metadatos:**
- `metadata` (Mixed)

**Métodos estáticos:**
- `registerDevice(deviceData)` - Registrar nuevo dispositivo
- `getActiveDevices(userId)` - Obtener dispositivos activos
- `getAllDevices(userId)` - Obtener todos los dispositivos
- `updateActivity(sessionId)` - Actualizar última actividad
- `revokeDevice(sessionId, reason)` - Revocar dispositivo específico
- `revokeAllDevicesExcept(userId, currentSessionId, reason)` - Revocar todos excepto actual
- `revokeAllDevices(userId, reason)` - Revocar todos
- `revokeByRefreshToken(refreshTokenId, reason)` - Revocar por refresh token
- `isDeviceValid(sessionId)` - Verificar si dispositivo es válido
- `cleanupExpiredDevices()` - Limpiar dispositivos expirados
- `getDeviceStats(userId)` - Obtener estadísticas de dispositivos

---

## 2. Tipos de Bartender Identity

### 2.1 IdentityUser.js

**Ubicación:** `backend/src/identity/types/IdentityUser.js`

**Estructura:**
- `id` - ID del usuario
- `name` - Nombre
- `email` - Email
- `role` - Rol
- `roleLabel` - Etiqueta del rol
- `status` - Estado de identidad
- `isEmployee` - Si es empleado
- `shift` - Turno
- `isActive` - Si está activo
- `isLocked` - Si está bloqueado
- `lockedUntil` - Hasta cuándo está bloqueado
- `permissions` - Permisos
- `lastLogin` - Último login
- `loginAttempts` - Intentos de login
- `schedule` - Horario
- `attendance` - Asistencia
- `metadata` - Metadatos

**Funciones:**
- `createIdentityUser(userModel)` - Crear estructura de usuario de identidad
- `canUserLogin(identityUser)` - Verificar si puede hacer login
- `getLockMessage(identityUser)` - Obtener mensaje de bloqueo
- `isUserOnShift(identityUser)` - Verificar si está en turno
- `isUserOffShift(identityUser)` - Verificar si está fuera de turno
- `isUserOnBreak(identityUser)` - Verificar si está en descanso

---

### 2.2 IdentitySession.js

**Ubicación:** `backend/src/identity/types/IdentitySession.js`

**Estructura:**
- `sessionId` - ID de sesión
- `userId` - ID de usuario
- `platform` - Plataforma (web, desktop, mobile, admin)
- `device` - Información de dispositivo (type, name, os, browser, userAgent)
- `location` - Ubicación (ip, country, city)
- `timestamps` - Timestamps (createdAt, lastActivity, expiresAt)
- `status` - Estado (active, inactive, expired, revoked)
- `metadata` - Metadatos (isTrusted, isRemembered, loginMethod, mfaVerified)

**Funciones:**
- `createIdentitySession(options)` - Crear estructura de sesión
- `isSessionActive(session)` - Verificar si está activa
- `isSessionExpired(session)` - Verificar si ha expirado
- `updateSessionActivity(session)` - Actualizar última actividad
- `revokeSession(session)` - Revocar sesión
- `parseUserAgent(userAgent)` - Extraer información del dispositivo desde user agent

---

## 3. Endpoints de API Disponibles

**Ubicación:** `backend/src/routes/user.routes.js`

**Empleados:**
- `POST /users/employees` - Crear empleado
- `GET /users/employees` - Obtener lista de empleados

**Gestión de Usuario:**
- `GET /users/:id` - Obtener usuario por ID
- `PUT /users/:id` - Actualizar usuario

**Seguridad y Estado:**
- `PATCH /users/:id/password` - Cambiar contraseña
- `PATCH /users/:id/deactivate` - Desactivar usuario
- `PATCH /users/:id/activate` - Activar usuario

**Permisos y Acciones Masivas:**
- `PATCH /users/role/:role/permissions` - Actualizar permisos de rol
- `PATCH /users/shift/:shift/permissions` - Actualizar permisos de turno
- `PATCH /users/:id/permissions` - Actualizar permisos de usuario
- `PATCH /users/:id/shift` - Asignar turno

---

## 4. Datos Faltantes

**No se detectaron datos faltantes críticos.** Toda la información necesaria para implementar las secciones solicitadas está disponible en los modelos existentes.

**Datos adicionales que podrían ser útiles:**
- Endpoint para obtener sesiones activas de un usuario (puede agregarse)
- Endpoint para obtener dispositivos de un usuario (puede agregarse)
- Endpoint para obtener logs de actividad de un usuario (puede agregarse)
- Endpoint para obtener historial de asistencia de un usuario (puede agregarse)

---

## 5. Conclusiones

**Disponibilidad de datos:** ✅ Completa  
**Estructura de modelos:** ✅ Bien organizada  
**Endpoints existentes:** ✅ Suficientes para operaciones básicas  
**Preparación para integración:** ✅ Excelente

**Recomendaciones:**
1. Los modelos existentes contienen toda la información necesaria para las secciones solicitadas
2. Los tipos de Bartender Identity están bien preparados para integración
3. Los endpoints existentes cubren las operaciones CRUD básicas
4. Se pueden agregar endpoints específicos para sesiones, dispositivos y actividad si es necesario
5. La arquitectura está lista para implementar las nuevas secciones del perfil de empleado

**Estado de la auditoría:** ✅ Completado
