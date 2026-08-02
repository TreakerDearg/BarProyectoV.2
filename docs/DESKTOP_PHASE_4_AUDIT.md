# Fase 4: Auditoría Inicial - Employee Lifecycle & Operations Center

**Fecha:** 2 de agosto de 2026  
**Versión:** 1.0  
**Estado:** Completado  
**Objetivo:** Analizar modelos existentes para identificar datos disponibles para Employee Lifecycle & Operations Center

---

## Resumen Ejecutivo

Se ha realizado una auditoría de los modelos existentes en el backend para identificar la información disponible para implementar Employee Lifecycle & Operations Center.

**Hallazgos principales:**
- ✅ Modelo User.js con campos de performance, compliance, attendance, schedule
- ✅ Modelo Attendance.js con registro detallado de asistencia y rendimiento
- ✅ Modelo ShiftAssignment.js con asignación de turnos y métricas
- ✅ Modelo ShiftSchedule.js con configuración de horarios
- ✅ Modelo ActivityLog.js con registro de actividad
- ✅ Modelo Session.js con información de sesiones activas
- ✅ Modelo DeviceManager.js con gestión de dispositivos
- ✅ Modelo Identity.js con estado de identidad y verificación
- ✅ Modelo Permissions.js con gestión de permisos
- ✅ Modelo Roles.js con definición de roles

**Campos disponibles para Employee Lifecycle:**
- Estado de cuenta (isActive, lockedUntil)
- Información personal (name, email, phone, address)
- Rendimiento y cumplimiento
- Asistencia y horarios
- Sesiones y dispositivos
- Roles y permisos
- Historial de actividad

---

## 1. Modelos de Base de Datos

### 1.1 User.js - Modelo Principal de Usuario

**Ubicación:** `backend/src/models/User.js`

**Campos relevantes para Employee Lifecycle:**

**Información Personal:**
- `name` - Nombre completo
- `email` - Correo electrónico
- `phone` - Teléfono
- `address` - Dirección
- `birthDate` - Fecha de nacimiento
- `hireDate` - Fecha de contratación
- `position` - Cargo
- `department` - Departamento
- `branch` - Sucursal
- `salary` - Salario
- `isActive` - Estado de cuenta
- `lockedUntil` - Bloqueo temporal

**Estado Laboral (para implementar):**
- `employmentStatus` - Estado laboral (candidato, pendiente, activo, capacitación, licencia, suspendido, baja temporal, desvinculado, archivado)
- `employmentStatusHistory` - Historial de cambios de estado

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
  - `disciplinaryHistory` - Historial disciplinario

**Asistencia (Attendance):**
- `attendance` (Object)
  - `currentStatus` - Estado actual (checked-in, checked-out, on-break, absent)
  - `thisMonth` - Métricas del mes actual
  - `lastShift` - Último turno
  - `consecutiveDays` - Días consecutivos trabajados

**Horarios (Schedule):**
- `schedule` (Object)
  - `weeklySchedule` - Horario semanal
  - `availability` - Disponibilidad
  - `shiftPreferences` - Preferencias de turno

**Documentación (para implementar):**
- `documents` (Array)
  - `type` - Tipo de documento (contrato, certificado, capacitación, legal, evaluación)
  - `name` - Nombre del documento
  - `url` - URL del archivo
  - `uploadDate` - Fecha de carga
  - `expiryDate` - Fecha de vencimiento
  - `status` - Estado (valid, expired, pending)

**Capacitación (para implementar):**
- `training` (Array)
  - `courseId` - ID del curso
  - `courseName` - Nombre del curso
  - `completionDate` - Fecha de completado
  - `certificateUrl` - URL del certificado
  - `status` - Estado (completed, in_progress, pending)
  - `score` - Calificación

**Evaluaciones (para implementar):**
- `evaluations` (Array)
  - `evaluationId` - ID de evaluación
  - `period` - Período de evaluación
  - `overallScore` - Puntuación general
  - `objectives` - Objetivos
  - `comments` - Comentarios
  - `evaluator` - Evaluador
  - `evaluationDate` - Fecha de evaluación

**Solicitudes (para implementar):**
- `requests` (Array)
  - `requestId` - ID de solicitud
  - `type` - Tipo (vacation, leave, shift_change, permission)
  - `startDate` - Fecha de inicio
  - `endDate` - Fecha de fin
  - `reason` - Razón
  - `status` - Estado (pending, approved, rejected)
  - `approver` - Aprobador
  - `requestDate` - Fecha de solicitud

---

### 1.2 Attendance.js - Modelo de Asistencia

**Ubicación:** `backend/src/models/Attendance.js`

**Campos relevantes:**
- `userId` - ID del usuario
- `date` - Fecha de asistencia
- `checkInTime` - Hora de entrada
- `checkOutTime` - Hora de salida
- `breakStartTime` - Hora de inicio de descanso
- `breakEndTime` - Hora de fin de descanso
- `status` - Estado (present, absent, late, left_early)
- `shiftId` - ID del turno
- `performance` - Métricas de rendimiento del turno

**Uso en Employee Lifecycle:**
- Historial de asistencia
- Métricas de puntualidad
- Detección de ausencias
- Cálculo de horas trabajadas

---

### 1.3 ShiftAssignment.js - Modelo de Asignación de Turnos

**Ubicación:** `backend/src/models/ShiftAssignment.js`

**Campos relevantes:**
- `userId` - ID del usuario
- `shiftId` - ID del turno
- `date` - Fecha de asignación
- `status` - Estado (scheduled, completed, missed, late, left_early)
- `checkInTime` - Hora de entrada real
- `checkOutTime` - Hora de salida real
- `performance` - Métricas de rendimiento

**Uso en Employee Lifecycle:**
- Historial de turnos
- Detección de turnos sin asignar
- Cálculo de cobertura
- Alertas de turnos faltantes

---

### 1.4 ShiftSchedule.js - Modelo de Configuración de Horarios

**Ubicación:** `backend/src/models/ShiftSchedule.js`

**Campos relevantes:**
- `shiftId` - ID del turno
- `name` - Nombre del turno
- `startTime` - Hora de inicio
- `endTime` - Hora de fin
- `breakDuration` - Duración del descanso
- `type` - Tipo (morning, afternoon, night, event)

**Uso en Employee Lifecycle:**
- Configuración de horarios
- Gestión de disponibilidad
- Planificación de turnos

---

### 1.5 ActivityLog.js - Modelo de Registro de Actividad

**Ubicación:** `backend/src/models/ActivityLog.js`

**Campos relevantes:**
- `userId` - ID del usuario
- `userName` - Nombre del usuario
- `userRole` - Rol del usuario
- `activityType` - Tipo de actividad
- `description` - Descripción
- `metadata` - Metadatos adicionales
- `shift` - Turno asociado
- `duration` - Duración
- `timestamp` - Timestamp

**Uso en Employee Lifecycle:**
- Historial de actividad
- Detección de sesiones sospechosas
- Línea de tiempo unificada
- Auditoría de cambios

---

### 1.6 Session.js - Modelo de Sesiones

**Ubicación:** `backend/src/models/Session.js`

**Campos relevantes:**
- `sessionId` - ID de sesión
- `userId` - ID del usuario
- `platform` - Plataforma (web, desktop, mobile, admin)
- `device` - Información del dispositivo
- `location` - Ubicación
- `timestamps` - Timestamps (createdAt, lastActivity, expiresAt)
- `status` - Estado (active, inactive, expired, revoked)

**Uso en Employee Lifecycle:**
- Gestión de sesiones activas
- Detección de sesiones sospechosas
- Revocación de sesiones
- Historial de accesos

---

### 1.7 DeviceManager.js - Modelo de Dispositivos

**Ubicación:** `backend/src/models/DeviceManager.js`

**Campos relevantes:**
- `deviceId` - ID del dispositivo
- `userId` - ID del usuario
- `platform` - Plataforma
- `deviceType` - Tipo de dispositivo
- `browser` - Navegador
- `os` - Sistema operativo
- `appVersion` - Versión de la aplicación
- `deviceName` - Nombre del dispositivo
- `ipAddress` - Dirección IP
- `lastActivity` - Última actividad
- `isActive` - Estado activo
- `isRevoked` - Estado de revocación

**Uso en Employee Lifecycle:**
- Gestión de dispositivos registrados
- Detección de dispositivos no reconocidos
- Revocación de dispositivos
- Historial de dispositivos

---

### 1.8 Identity.js - Modelo de Identidad

**Ubicación:** `backend/src/models/Identity.js`

**Campos relevantes:**
- `userId` - ID del usuario
- `provider` - Proveedor de autenticación (local, google)
- `providerId` - ID del proveedor
- `isVerified` - Estado de verificación
- `verificationDate` - Fecha de verificación
- `lastLogin` - Último inicio de sesión
- `loginAttempts` - Intentos de inicio de sesión

**Uso en Employee Lifecycle:**
- Estado de identidad
- Verificación de cuenta
- Detección de intentos fallidos
- Integración con Google OAuth

---

### 1.9 Permissions.js - Modelo de Permisos

**Ubicación:** `backend/src/models/Permissions.js`

**Campos relevantes:**
- `userId` - ID del usuario
- `permissions` - Array de permisos
- `grantedBy` - Otorgado por
- `grantedAt` - Fecha de otorgamiento
- `expiresAt` - Fecha de expiración

**Uso en Employee Lifecycle:**
- Gestión de permisos
- Detección de permisos inconsistentes
- Historial de cambios de permisos
- Alertas de permisos vencidos

---

### 1.10 Roles.js - Modelo de Roles

**Ubicación:** `backend/src/models/Roles.js`

**Campos relevantes:**
- `roleId` - ID del rol
- `name` - Nombre del rol
- `description` - Descripción
- `permissions` - Permisos asociados
- `level` - Nivel de acceso

**Uso en Employee Lifecycle:**
- Gestión de roles
- Asignación de roles
- Historial de cambios de rol
- Jerarquía de roles

---

## 2. Funcionalidades Existentes

### 2.1 CRUD de Empleados
- ✅ Crear empleado
- ✅ Leer empleado
- ✅ Actualizar empleado
- ✅ Desactivar empleado (soft delete)

### 2.2 Gestión de Roles y Permisos
- ✅ Asignar rol
- ✅ Actualizar rol
- ✅ Otorgar permisos
- ✅ Revocar permisos

### 2.3 Horarios y Asistencia
- ✅ Asignar turno
- ✅ Actualizar horario
- ✅ Check-in
- ✅ Check-out
- ✅ Registro de asistencia

### 2.4 Bartender Identity
- ✅ Integración con Identity Status
- ✅ Gestión de sesiones
- ✅ Gestión de dispositivos
- ✅ Registro de actividad
- ✅ Integración con Google OAuth

---

## 3. Funcionalidades a Implementar

### 3.1 Estados Laborales
- ❌ Candidato
- ❌ Pendiente de incorporación
- ❌ Activo
- ❌ En capacitación
- ❌ En licencia
- ❌ Suspendido
- ❌ Baja temporal
- ❌ Desvinculado
- ❌ Archivado

### 3.2 Expediente Digital
- ❌ Vista unificada de toda la información
- ❌ Navegación organizada por categoría
- ❌ Panel operativo con indicadores rápidos

### 3.3 Gestión Documental
- ❌ Asociación de documentos al empleado
- ❌ Tipos de documentos (contrato, certificados, capacitaciones, legal, evaluaciones)
- ❌ Fechas de vencimiento
- ❌ Alertas de documentación vencida

### 3.4 Capacitación
- ❌ Registro de cursos completados
- ❌ Certificaciones
- ❌ Capacitaciones internas
- ❌ Entrenamientos
- ❌ Preparación para integración LMS

### 3.5 Evaluaciones
- ❌ Estructura para objetivos
- ❌ Comentarios
- ❌ Evaluaciones periódicas
- ❌ Seguimiento

### 3.6 Solicitudes del Empleado
- ❌ Vacaciones
- ❌ Licencias
- ❌ Cambios de turno
- ❌ Permisos especiales

### 3.7 Línea de Tiempo Unificada
- ❌ Cambios de rol
- ❌ Cambios de permisos
- ❌ Sesiones
- ❌ Asistencia
- ❌ Modificaciones de perfil
- ❌ Eventos importantes

### 3.8 Panel Operativo
- ❌ Próximos turnos
- ❌ Vacaciones pendientes
- ❌ Capacitaciones pendientes
- ❌ Documentos faltantes
- ❌ Alertas de cumplimiento

### 3.9 Acciones Inteligentes
- ❌ Contextuales según estado del empleado
- ❌ Diferentes acciones por estado laboral

### 3.10 Centro de Alertas
- ❌ Documentación vencida
- ❌ Capacitación pendiente
- ❌ Exceso de horas trabajadas
- ❌ Permisos inconsistentes
- ❌ Múltiples intentos fallidos de acceso
- ❌ Turnos sin asignar

---

## 4. Conclusión

**Estado de la auditoría:** ✅ Completado

Los modelos existentes proporcionan una base sólida para implementar Employee Lifecycle & Operations Center. La mayoría de los datos necesarios ya están disponibles en los modelos User, Attendance, ShiftAssignment, ActivityLog, Session, DeviceManager, Identity, Permissions y Roles.

**Campos a agregar al modelo User:**
- `employmentStatus` - Estado laboral
- `employmentStatusHistory` - Historial de cambios de estado
- `documents` - Documentos asociados
- `training` - Capacitaciones
- `evaluations` - Evaluaciones
- `requests` - Solicitudes del empleado

**No se requiere duplicar lógica:**
- Bartender Identity se reutiliza completamente
- Sesiones y dispositivos se gestionan con modelos existentes
- Roles y permisos se gestionan con modelos existentes
- Asistencia y horarios se gestionan con modelos existentes
