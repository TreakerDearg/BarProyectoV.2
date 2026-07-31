# Fase 3: Auditoría Inicial - HR Intelligence & Workforce Management

**Fecha:** 31 de julio de 2026  
**Versión:** 1.0  
**Estado:** En progreso  
**Objetivo:** Analizar modelos existentes para identificar datos disponibles para Workforce Management

---

## Resumen Ejecutivo

Se ha realizado una auditoría de los modelos existentes en el backend para identificar la información disponible para implementar HR Intelligence & Workforce Management.

**Hallazgos principales:**
- ✅ Modelo User.js con campos de performance, compliance, attendance, schedule
- ✅ Modelo Attendance.js con registro detallado de asistencia y rendimiento
- ✅ Modelo ShiftAssignment.js con asignación de turnos y métricas
- ✅ Modelo ShiftSchedule.js con configuración de horarios
- ✅ Modelo ActivityLog.js con registro de actividad
- ✅ Modelo Session.js con información de sesiones activas
- ✅ Modelo DeviceManager.js con gestión de dispositivos

---

## 1. Modelos de Base de Datos

### 1.1 User.js - Modelo Principal de Usuario

**Ubicación:** `backend/src/models/User.js`

**Campos relevantes para HR Intelligence:**

**Rendimiento (Performance):**
- `performance` (Object)
  - `totalShifts` - Total de turnos trabajados
  - `totalHours` - Total de horas trabajadas
  - `averageRating` - Calificación promedio
  - `totalOrders` - Total de órdenes procesadas
  - `totalSales` - Total de ventas
  - `avgOrderTime` - Tiempo promedio por orden
  - `errorRate` - Tasa de error
  - `onTimeRate` - Tasa de puntualidad
  - `modules` - Métricas por módulo (tables, orders, payments, reservations)
  - `weekly` - Métricas semanales (shifts, hours, sales, rating)
  - `monthly` - Métricas mensuales (shifts, hours, sales, rating)

**Cumplimiento (Compliance):**
- `compliance` (Object)
  - `overallScore` - Puntuación general
  - `protocolAdherence` - Adherencia a protocolos
  - `timeCompliance` - Cumplimiento de tiempo
  - `qualityScore` - Puntuación de calidad
  - `protocols` - Cumplimiento por protocolo (opening, closing, service, safety)
  - `violations` - Array de violaciones
  - `warnings` - Array de advertencias

**Asistencia (Attendance):**
- `attendance` (Object)
  - `currentStatus` - Estado actual (checked-in, checked-out, break, absent, late)
  - `lastCheckIn` - Último check-in
  - `lastCheckOut` - Último check-out
  - `currentShiftStart` - Inicio de turno actual
  - `totalMinutesWorked` - Total de minutos trabajados
  - `consecutiveDays` - Días consecutivos trabajados
  - `thisMonth` - Métricas del mes (present, absent, late, totalHours)
  - `leaveBalance` - Balance de días libres (vacation, sick, personal)
  - `leaveRequests` - Array de solicitudes de días libres

**Horario (Schedule):**
- `schedule` (Object)
  - Días de la semana con disponibilidad
  - Horarios de entrada/salida
  - Descansos

**Seguridad:**
- `loginAttempts` - Intentos de login fallidos
- `lockedUntil` - Hasta cuándo está bloqueado
- `lastLogin` - Último login

**Estado:**
- `isActive` - Si está activo
- `deletedAt` - Fecha de eliminación (soft delete)

---

### 1.2 Attendance.js - Modelo de Asistencia

**Ubicación:** `backend/src/models/Attendance.js`

**Campos relevantes para HR Intelligence:**

**Timing:**
- `checkIn` - Check-in (time, location, device, ip)
- `checkOut` - Check-out (time, location, device, ip)
- `breakStart` - Inicio de descanso
- `breakEnd` - Fin de descanso

**Estado:**
- `status` - Estado (present, absent, late, early-departure, half-day)
- `isApproved` - Si está aprobado
- `approvedBy` - Quién aprobó
- `approvedAt` - Cuándo aprobó

**Horas:**
- `scheduledHours` - Horas programadas
- `workedHours` - Horas trabajadas
- `breakHours` - Horas de descanso
- `overtimeHours` - Horas extra

**Rendimiento:**
- `performance` (Object)
  - `tasksCompleted` - Tareas completadas
  - `customerInteractions` - Interacciones con clientes
  - `salesAmount` - Monto de ventas
  - `efficiency` - Eficiencia
  - `notes` - Notas

**Cumplimiento:**
- `compliance` (Object)
  - `protocolsFollowed` - Protocolos seguidos
  - `protocolsTotal` - Protocolos totales
  - `onTime` - Si llegó a tiempo
  - `inUniform` - Si estaba en uniforme
  - `violations` - Array de violaciones

**Notas:**
- `notes` (Object)
  - `employee` - Notas del empleado
  - `supervisor` - Notas del supervisor
  - `system` - Notas del sistema

**Métodos:**
- `calculateOvertime()` - Calcular horas extra
- `updatePerformance(data)` - Actualizar rendimiento
- `getUserAttendance(userId, startDate, endDate)` - Obtener asistencia de usuario
- `getDayAttendance(date)` - Obtener asistencia del día
- `getAttendanceStats(startDate, endDate)` - Obtener estadísticas

---

### 1.3 ShiftAssignment.js - Modelo de Asignación de Turnos

**Ubicación:** `backend/src/models/ShiftAssignment.js`

**Campos relevantes para HR Intelligence:**

**Usuario:**
- `userId` - ID del usuario
- `userName` - Nombre del usuario

**Turno:**
- `shiftId` - ID del turno
- `shiftType` - Tipo de turno (morning, afternoon, night, event)

**Fecha:**
- `date` - Fecha (YYYY-MM-DD)

**Estado:**
- `status` - Estado (scheduled, completed, missed, late, left_early)

**Timing:**
- `scheduledStart` - Inicio programado
- `scheduledEnd` - Fin programado
- `actualStart` - Inicio real
- `actualEnd` - Fin real

**Métricas:**
- `performanceScore` - Puntaje de rendimiento (0-100)
- `notes` - Notas

**Asistencia:**
- `checkInTime` - Hora de check-in
- `checkOutTime` - Hora de check-out
- `breaksTaken` - Descansos tomados
- `totalWorkMinutes` - Total de minutos trabajados

**Métodos:**
- `checkIn(timestamp)` - Registrar check-in
- `checkOut(timestamp)` - Registrar check-out
- `calculatePerformanceScore(metrics)` - Calcular puntaje de rendimiento

---

### 1.4 ShiftSchedule.js - Modelo de Horarios de Turnos

**Ubicación:** `backend/src/models/ShiftSchedule.js`

**Campos relevantes para HR Intelligence:**

**Información Básica:**
- `shiftType` - Tipo de turno
- `startTime` - Hora de inicio
- `endTime` - Hora de fin
- `breaks` - Descansos (startTime, endTime, description, isPaid)

**Staffing:**
- `assignedEmployees` - Empleados asignados
- `maxEmployees` - Máximo de empleados
- `minEmployees` - Mínimo de empleados

**Módulos y Permisos:**
- `modules` - Módulos asignados
- `permissions` - Permisos específicos

**Configuración:**
- `isActive` - Si está activo
- `priority` - Prioridad (1-10)
- `description` - Descripción
- `applicableDays` - Días aplicables

**Métodos:**
- `isWithinShift(time)` - Verificar si hora está dentro del turno
- `getActiveEmployees()` - Obtener empleados asignados activos

---

### 1.5 ActivityLog.js - Modelo de Logs de Actividad

**Ubicación:** `backend/src/models/ActivityLog.js`

**Campos relevantes para HR Intelligence:**

**Usuario:**
- `userId` - ID del usuario
- `userName` - Nombre del usuario
- `userRole` - Rol del usuario

**Actividad:**
- `activityType` - Tipo de actividad
- `description` - Descripción
- `metadata` - Metadatos

**Contexto de Turno:**
- `shift` - Turno

**Duración:**
- `duration` - Duración en milisegundos

**Referencias:**
- `orderId` - Referencia a orden
- `paymentId` - Referencia a pago
- `discountId` - Referencia a descuento
- `tableId` - Referencia a mesa

**Sesión:**
- `sessionId` - ID de sesión

**Métodos:**
- `logIdentityDecision(decision)` - Registrar decisión de identidad
- `calculateMetrics(userId, startDate, endDate)` - Calcular métricas de actividad

---

### 1.6 Session.js - Modelo de Sesiones

**Ubicación:** `backend/src/models/Session.js`

**Campos relevantes para HR Intelligence:**

**Identificación:**
- `userId` - ID del usuario
- `refreshToken` - Token de refresco

**Plataforma y Dispositivo:**
- `platform` - Plataforma (web, desktop, mobile, admin)
- `device` - Información de dispositivo (type, name, os, browser, userAgent)

**Ubicación:**
- `location` - Ubicación (ip, country, city)

**Timestamps:**
- `createdAt` - Fecha de creación
- `lastActivity` - Última actividad
- `expiresAt` - Fecha de expiración
- `revokedAt` - Fecha de revocación

**Estado:**
- `status` - Estado (active, revoked, expired)

**Metadatos:**
- `metadata` - Metadatos (isTrusted, isRemembered, loginMethod, mfaVerified)

**Métodos:**
- `isActive()` - Verificar si está activa
- `revoke()` - Revocar sesión
- `updateActivity()` - Actualizar última actividad
- `cleanupExpired()` - Limpiar sesiones expiradas
- `getActiveSessions(userId)` - Obtener sesiones activas de usuario
- `revokeAllUserSessions(userId, exceptSessionId)` - Revocar todas las sesiones
- `revokeByRefreshToken(refreshToken)` - Revocar por refresh token

---

### 1.7 DeviceManager.js - Modelo de Dispositivos

**Ubicación:** `backend/src/ecosystem/DeviceManager.js`

**Campos relevantes para HR Intelligence:**

**Usuario:**
- `userId` - ID del usuario
- `userEmail` - Email del usuario
- `userRole` - Rol del usuario

**Dispositivo:**
- `platform` - Plataforma (web_client, web_admin, desktop, mobile, tablet, kiosk, api)
- `deviceType` - Tipo de dispositivo (desktop, laptop, mobile, tablet, kiosk, server, other)
- `browser` - Navegador
- `os` - Sistema operativo
- `appVersion` - Versión de la aplicación
- `deviceName` - Nombre del dispositivo

**Red:**
- `ipAddress` - Dirección IP
- `userAgent` - User agent
- `location` - Ubicación (country, city, region)

**Sesión:**
- `sessionId` - ID de sesión
- `refreshTokenId` - ID de refresh token
- `tokenExpiresAt` - Expiración de token
- `refreshTokenExpiresAt` - Expiración de refresh token

**Actividad:**
- `lastActivity` - Última actividad
- `isActive` - Si está activo
- `isRevoked` - Si está revocado
- `revokedAt` - Fecha de revocación
- `revokedReason` - Razón de revocación

**Métodos:**
- `registerDevice(deviceData)` - Registrar dispositivo
- `getActiveDevices(userId)` - Obtener dispositivos activos
- `getAllDevices(userId)` - Obtener todos los dispositivos
- `updateActivity(sessionId)` - Actualizar actividad
- `revokeDevice(sessionId, reason)` - Revocar dispositivo
- `revokeAllDevicesExcept(userId, currentSessionId, reason)` - Revocar todos excepto actual
- `revokeAllDevices(userId, reason)` - Revocar todos
- `revokeByRefreshToken(refreshTokenId, reason)` - Revocar por refresh token
- `isDeviceValid(sessionId)` - Verificar si dispositivo es válido
- `cleanupExpiredDevices()` - Limpiar dispositivos expirados
- `getDeviceStats(userId)` - Obtener estadísticas de dispositivos

---

## 2. Datos Disponibles por Categoría

### 2.1 Rendimiento (Performance)

**Datos disponibles:**
- ✅ Total de turnos trabajados
- ✅ Total de horas trabajadas
- ✅ Calificación promedio
- ✅ Total de órdenes procesadas
- ✅ Total de ventas
- ✅ Tiempo promedio por orden
- ✅ Tasa de error
- ✅ Tasa de puntualidad
- ✅ Métricas por módulo (tables, orders, payments, reservations)
- ✅ Métricas semanales
- ✅ Métricas mensuales
- ✅ Puntaje de rendimiento por asignación de turno

---

### 2.2 Cumplimiento (Compliance)

**Datos disponibles:**
- ✅ Puntuación general
- ✅ Adherencia a protocolos
- ✅ Cumplimiento de tiempo
- ✅ Puntuación de calidad
- ✅ Cumplimiento por protocolo (opening, closing, service, safety)
- ✅ Violaciones
- ✅ Advertencias
- ✅ Protocolos seguidos
- ✅ Protocolos totales
- ✅ Si llegó a tiempo
- ✅ Si estaba en uniforme

---

### 2.3 Asistencia (Attendance)

**Datos disponibles:**
- ✅ Estado actual (checked-in, checked-out, break, absent, late)
- ✅ Último check-in
- ✅ Último check-out
- ✅ Inicio de turno actual
- ✅ Total de minutos trabajados
- ✅ Días consecutivos trabajados
- ✅ Métricas del mes (present, absent, late, totalHours)
- ✅ Balance de días libres (vacation, sick, personal)
- ✅ Solicitudes de días libres
- ✅ Horas programadas
- ✅ Horas trabajadas
- ✅ Horas de descanso
- ✅ Horas extra
- ✅ Check-in con ubicación y dispositivo
- ✅ Check-out con ubicación y dispositivo

---

### 2.4 Turnos (Shifts)

**Datos disponibles:**
- ✅ Tipo de turno
- ✅ Horarios de inicio y fin
- ✅ Descansos
- ✅ Empleados asignados
- ✅ Mínimo y máximo de empleados
- ✅ Módulos asignados
- ✅ Permisos específicos
- ✅ Prioridad
- ✅ Días aplicables
- ✅ Estado de asignación (scheduled, completed, missed, late, left_early)
- ✅ Horarios reales de inicio y fin
- ✅ Puntaje de rendimiento por asignación

---

### 2.5 Actividad (Activity)

**Datos disponibles:**
- ✅ Tipo de actividad
- ✅ Descripción
- ✅ Metadatos
- ✅ Turno
- ✅ Duración
- ✅ Referencias a órdenes, pagos, descuentos, mesas
- ✅ ID de sesión
- ✅ Timestamp

---

### 2.6 Sesiones (Sessions)

**Datos disponibles:**
- ✅ Plataforma (web, desktop, mobile, admin)
- ✅ Tipo de dispositivo
- ✅ Nombre del dispositivo
- ✅ Sistema operativo
- ✅ Navegador
- ✅ Ubicación (IP, país, ciudad)
- ✅ Fecha de creación
- ✅ Última actividad
- ✅ Fecha de expiración
- ✅ Estado (active, revoked, expired)
- ✅ Si es confiable
- ✅ Si es recordado
- ✅ Método de login
- ✅ Si MFA está verificado

---

### 2.7 Dispositivos (Devices)

**Datos disponibles:**
- ✅ Plataforma (web_client, web_admin, desktop, mobile, tablet, kiosk, api)
- ✅ Tipo de dispositivo
- ✅ Navegador
- ✅ Sistema operativo
- ✅ Versión de la aplicación
- ✅ Nombre del dispositivo
- ✅ Dirección IP
- ✅ Ubicación (país, ciudad, región)
- ✅ Última actividad
- ✅ Si está activo
- ✅ Si está revocado
- ✅ Razón de revocación

---

## 3. Datos Faltantes

**No se detectaron datos faltantes críticos.** Toda la información necesaria para implementar las funcionalidades solicitadas está disponible en los modelos existentes.

**Datos adicionales que podrían ser útiles:**
- Endpoint para obtener estadísticas globales de workforce (puede agregarse)
- Endpoint para obtener alertas inteligentes (puede agregarse)
- Endpoint para obtener comparativas entre empleados (puede agregarse)
- Endpoint para obtener historial laboral completo (puede agregarse)

---

## 4. Conclusión

**Disponibilidad de datos:** ✅ Completa  
**Estructura de modelos:** ✅ Bien organizada  
**Preparación para HR Intelligence:** ✅ Excelente

**Recomendaciones:**
1. Los modelos existentes contienen toda la información necesaria para Workforce Management
2. Los campos de performance, compliance y attendance están bien estructurados
3. Los modelos de Session y DeviceManager proporcionan información en tiempo real
4. Se pueden agregar endpoints específicos para estadísticas globales y alertas
5. La arquitectura está lista para implementar HR Intelligence sin duplicar información

**Estado de la auditoría:** ✅ Completado
