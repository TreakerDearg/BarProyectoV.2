# Mapa de Dependencias - Módulo de Empleados (Bartender Desktop)

**Fecha:** 31 de julio de 2026  
**Estado:** Análisis completado

---

## 1. Estructura Actual

```
src/modules/admin/
├── components/
│   ├── EmployeeCard.tsx (245 líneas)
│   ├── EmployeeForm.tsx (289 líneas)
│   ├── EmployeeKPIsDashboard.tsx (21846 líneas)
│   ├── EmployeePerformanceCard.tsx (6223 líneas)
│   ├── ShiftComparisonChart.tsx (15402 líneas)
│   ├── AlertDashboard.tsx (9808 líneas)
│   ├── AlertRuleBuilder.tsx (16843 líneas)
│   └── AdminTutorialModal.tsx (3589 líneas)
├── pages/
│   ├── EmployeesPage.tsx (795 líneas)
│   ├── EmployeeActivityTrackingPage.tsx (471 líneas)
│   ├── ShiftManagementPage.tsx (1117 líneas)
│   ├── ShiftMetricsPage.tsx (28798 líneas)
│   ├── RoleManagementPage.tsx (9968 líneas)
│   ├── PermissionPage.tsx (10005 líneas)
│   ├── ShiftPermissionsPage.tsx (9377 líneas)
│   ├── AlertsConfigurationPage.tsx (17648 líneas)
│   └── SettingsPage.tsx (6189 líneas)
├── services/
│   ├── userService.ts (79 líneas)
│   └── trackingService.ts (no analizado)
├── types/
│   └── user.ts (81 líneas)
└── styles/
    └── luxury-theme.css (no analizado)
```

---

## 2. Dependencias Identificadas

### 2.1 EmployeesPage.tsx

**Dependencias directas:**
- `../components/EmployeeCard` - Componente de tarjeta de empleado
- `../components/EmployeeForm` - Formulario de creación
- `../../../components/shared/BackupSystem` - Sistema de respaldos
- `../../../components/shared/AuditLogSystem` - Sistema de auditoría
- `../../../components/shared/AdvancedSearchFilter` - Filtros avanzados
- `../../../components/shared/DataExportImport` - Exportación/Importación
- `../services/userService` - Servicio de usuarios
- `../types/user` - Tipos de usuario

**Estado local:**
- `users` - Lista de usuarios
- `open` - Estado del modal de creación
- `auditUser` - Usuario en auditoría
- `loading` - Estado de carga
- `error` - Estado de error
- `activeSystemTab` - Tab activa (employees/backup/audit)
- `search` - Texto de búsqueda
- `activeFilters` - Filtros activos
- `showExportImport` - Estado del panel de exportación

**Funciones:**
- `fetchData()` - Obtiene empleados
- `handleCreate()` - Crea empleado
- `handleDeactivate()` - Desactiva empleado
- `handleExport()` - Exporta datos
- `handleImport()` - Importa datos

**Problemas identificados:**
1. Lógica de negocio mezclada con presentación
2. Estado local no organizado
3. Validaciones dispersas
4. No usa hooks personalizados
5. Lógica de filtros en el componente

### 2.2 EmployeeCard.tsx

**Dependencias directas:**
- `../types/user` - Tipos de usuario
- `lucide-react` - Iconos
- `framer-motion` - Animaciones

**Props:**
- `user` - Datos del usuario
- `onDeactivate` - Callback para desactivar
- `onActivate` - Callback para activar
- `onInspect` - Callback para inspeccionar

**Lógica interna:**
- `getRelativeTime()` - Calcula tiempo relativo
- Métricas simuladas (shifts, performance, reliability)
- Configuración de temas por rol

**Problemas identificados:**
1. Métricas simuladas en lugar de datos reales
2. Lógica de cálculo de tiempo en el componente
3. Configuración de temas hardcodeada
4. No separación de presentación y lógica

### 2.3 EmployeeForm.tsx

**Dependencias directas:**
- `lucide-react` - Iconos
- `framer-motion` - Animaciones

**Estado local:**
- `form` - Datos del formulario
- `showPassword` - Estado de visibilidad de contraseña
- `error` - Estado de error

**Funciones:**
- `handleChange()` - Maneja cambios del formulario
- `validate()` - Valida formulario
- `handleSubmit()` - Envía formulario
- `getPasswordStrength()` - Calcula fortaleza de contraseña

**Problemas identificados:**
1. Validaciones en el componente
2. Lógica de fortaleza de contraseña en el componente
3. No usa esquema de validación
4. No separación de presentación y lógica

### 2.4 userService.ts

**Dependencias directas:**
- `../../../services/api` - Cliente HTTP
- `../types/user` - Tipos de usuario

**Funciones:**
- `getEmployees()` - Obtiene empleados
- `createEmployee()` - Crea empleado
- `updateUser()` - Actualiza empleado
- `deactivateUser()` - Desactiva empleado
- `activateUser()` - Activa empleado
- `changePassword()` - Cambia contraseña
- `getUserById()` - Obtiene empleado por ID
- `updateRolePermissions()` - Actualiza permisos de rol
- `updateShiftPermissions()` - Actualiza permisos de turno

**Problemas identificados:**
1. Helper `unwrap` duplicado en otros servicios
2. No manejo de errores consistente
3. No tipado de respuestas
4. No cache
5. No validación de datos

### 2.5 user.ts (Tipos)

**Tipos definidos:**
- `Role` - Roles de usuario
- `Shift` - Turnos
- `PermissionKey` - Claves de permisos
- `Permissions` - Permisos
- `DaySchedule` - Horario diario
- `UserSchedule` - Horario semanal
- `User` - Usuario

**Problemas identificados:**
1. Permisos limitados (9 vs 30+)
2. No campos de Bartender Identity
3. No campos de Ecosystem
4. No campos de OAuth
5. No campos de Activity Logs

---

## 3. Flujo de Datos Actual

```
EmployeesPage
    ↓
userService (API calls)
    ↓
Backend API
    ↓
EmployeesPage (state update)
    ↓
EmployeeCard (render)
```

**Problemas:**
1. Lógica de negocio en EmployeesPage
2. No capa de abstracción
3. No manejo de errores centralizado
4. No cache
5. No optimización de renders

---

## 4. Problemas de Arquitectura

### 4.1 Acoplamiento

**Acoplamiento alto:**
- EmployeesPage depende directamente de userService
- EmployeeCard tiene lógica de negocio
- EmployeeForm tiene validaciones
- Componentes no son reutilizables

### 4.2 Separación de Responsabilidades

**No separación clara:**
- Presentación mezclada con lógica
- Validaciones en componentes
- Cálculos en componentes
- Estado no organizado

### 4.3 Reutilización

**Baja reutilización:**
- Componentes específicos para cada página
- Lógica duplicada
- Validaciones duplicadas
- Helper functions duplicados

### 4.4 Escalabilidad

**Difícil de escalar:**
- Agregar nueva funcionalidad requiere modificar múltiples archivos
- No hay puntos de extensión
- No hay hooks personalizados
- No hay servicios compartidos

---

## 5. Deuda Técnica

### 5.1 Código Duplicado

**Identificado:**
- Helper `unwrap` en múltiples servicios
- Validaciones en múltiples componentes
- Lógica de cálculo de tiempo en múltiples componentes
- Configuración de temas en múltiples componentes

### 5.2 Tipos

**Identificado:**
- Uso de `any` en varios lugares
- Tipos duplicados entre módulos
- Interfaces inconsistentes
- Falta de tipado en respuestas API

### 5.3 Validaciones

**Identificado:**
- Validaciones manuales en componentes
- No esquema de validación
- No validación de tipos en runtime
- No validación de datos de API

### 5.4 Estado

**Identificado:**
- Estado no organizado
- Estados duplicados
- No separación de datos y UI
- No optimización de renders

---

## 6. Recomendaciones de Reorganización

### 6.1 Nueva Estructura Propuesta

```
src/modules/admin/features/employees/
├── api/
│   ├── employeeApi.ts          # Cliente HTTP específico
│   └── index.ts
├── components/
│   ├── EmployeeCard/
│   │   ├── EmployeeCard.tsx    # Componente principal
│   │   ├── EmployeeMetrics.tsx # Métricas
│   │   ├── EmployeeActions.tsx # Acciones
│   │   └── index.ts
│   ├── EmployeeForm/
│   │   ├── EmployeeForm.tsx    # Formulario principal
│   │   ├── EmployeeRoleSection.tsx
│   │   ├── EmployeeScheduleSection.tsx
│   │   ├── EmployeePermissionsSection.tsx
│   │   └── index.ts
│   ├── EmployeeList/
│   │   ├── EmployeeList.tsx    # Lista de empleados
│   │   ├── EmployeeFilters.tsx # Filtros
│   │   ├── EmployeeKPIs.tsx    # KPIs
│   │   └── index.ts
│   ├── EmployeeDialog/
│   │   ├── EmployeeCreateDialog.tsx
│   │   ├── EmployeeEditDialog.tsx
│   │   ├── EmployeeAuditDialog.tsx
│   │   └── index.ts
│   └── index.ts
├── forms/
│   ├── employeeForm.ts         # Configuración de formulario
│   ├── employeeValidation.ts   # Validaciones
│   └── index.ts
├── hooks/
│   ├── useEmployees.ts         # Hook principal
│   ├── useEmployee.ts          # Hook individual
│   ├── useEmployeeFilters.ts   # Hook de filtros
│   ├── useEmployeePermissions.ts
│   ├── useEmployeeSchedule.ts
│   ├── useEmployeeAttendance.ts
│   └── index.ts
├── pages/
│   ├── EmployeesPage.tsx       # Página principal
│   ├── EmployeeDetailPage.tsx  # Página de detalle
│   └── index.ts
├── services/
│   ├── employeeService.ts      # Servicio de negocio
│   ├── employeeCache.ts        # Cache
│   └── index.ts
├── store/
│   ├── employeeStore.ts        # Zustand store
│   └── index.ts
├── types/
│   ├── employee.types.ts       # Tipos de empleado
│   ├── employeeApi.types.ts    # Tipos de API
│   ├── employeeForm.types.ts   # Tipos de formulario
│   └── index.ts
├── utils/
│   ├── employeeHelpers.ts      # Helpers de empleado
│   ├── employeeFormatters.ts   # Formatters
│   ├── employeeValidators.ts   # Validadores
│   └── index.ts
├── constants/
│   ├── employeeConstants.ts    # Constantes
│   ├── roleConfig.ts           # Configuración de roles
│   ├── permissionConfig.ts     # Configuración de permisos
│   └── index.ts
└── index.ts
```

### 6.2 Separación de Responsabilidades

**API Layer:**
- `employeeApi.ts` - Cliente HTTP
- Manejo de errores HTTP
- Transformación de respuestas

**Service Layer:**
- `employeeService.ts` - Lógica de negocio
- Cache
- Validaciones de negocio

**Data Layer:**
- `employeeStore.ts` - Estado global
- Cache de datos
- Optimización de renders

**Presentation Layer:**
- Componentes puros de presentación
- Sin lógica de negocio
- Sin llamadas directas a API

**Form Layer:**
- Configuración de formularios
- Validaciones
- Transformaciones

**Hooks Layer:**
- Hooks personalizados
- Lógica reutilizable
- Abstracción de estado

---

## 7. Plan de Migración

### 7.1 Fase 1: Preparación

1. Crear nueva estructura de carpetas
2. Crear tipos unificados
3. Crear constantes
4. Crear helpers

### 7.2 Fase 2: API Layer

1. Crear `employeeApi.ts`
2. Mover lógica HTTP de `userService.ts`
3. Implementar manejo de errores
4. Implementar transformación de respuestas

### 7.3 Fase 3: Service Layer

1. Crear `employeeService.ts`
2. Implementar cache
3. Implementar validaciones de negocio
4. Mover lógica de negocio de componentes

### 7.4 Fase 4: Store Layer

1. Crear `employeeStore.ts`
2. Implementar estado global
3. Implementar optimización de renders
4. Mover estado local de componentes

### 7.5 Fase 5: Hooks Layer

1. Crear hooks personalizados
2. Implementar lógica reutilizable
3. Mover lógica de componentes a hooks
4. Implementar abstracción de estado

### 7.6 Fase 6: Form Layer

1. Crear configuración de formularios
2. Crear validaciones centralizadas
3. Mover validaciones de componentes
4. Implementar esquema de validación

### 7.7 Fase 7: Components Layer

1. Refactorizar EmployeeCard
2. Refactorizar EmployeeForm
3. Crear componentes reutilizables
4. Separar presentación de lógica

### 7.8 Fase 8: Pages Layer

1. Refactorizar EmployeesPage
2. Mover lógica a hooks
3. Usar hooks personalizados
4. Simplificar componentes

### 7.9 Fase 9: Integración

1. Actualizar imports
2. Probar funcionalidad
3. Validar compatibilidad
4. Limpiar código antiguo

---

## 8. Puntos de Integración Futura

### 8.1 Bartender Identity

**Puntos preparados:**
- Tipos con campos de Identity
- Hooks para Identity Status
- Servicios para Identity Bridge
- Componentes para Identity UI

### 8.2 OAuth

**Puntos preparados:**
- Tipos con campos de OAuth
- Hooks para OAuth
- Servicios para OAuth
- Componentes para OAuth UI

### 8.3 Ecosystem

**Puntos preparados:**
- Tipos con campos de Ecosystem
- Hooks para Sessions
- Hooks para Devices
- Servicios para Ecosystem
- Componentes para Ecosystem UI

### 8.4 Activity Logs

**Puntos preparados:**
- Tipos con campos de Activity Logs
- Hooks para Activity Logs
- Servicios para Activity Logs
- Componentes para Activity Logs UI

### 8.5 Workspace

**Puntos preparados:**
- Tipos con campos de Workspace
- Hooks para Workspace
- Servicios para Workspace
- Componentes para Workspace UI

---

## 9. Métricas de Calidad

### 9.1 Antes de Refactorización

- **Líneas de código:** ~100,000 líneas en módulo admin
- **Componentes:** 8 componentes principales
- **Acoplamiento:** Alto
- **Cohesión:** Baja
- **Reutilización:** Baja
- **Test coverage:** 0%
- **Deuda técnica:** Alta

### 9.2 Después de Refactorización (Objetivo)

- **Líneas de código:** ~60,000 líneas (reducción del 40%)
- **Componentes:** 20+ componentes reutilizables
- **Acoplamiento:** Bajo
- **Cohesión:** Alta
- **Reutilización:** Alta
- **Test coverage:** 80%+
- **Deuda técnica:** Baja

---

## 10. Conclusión

El módulo de empleados actualmente tiene una arquitectura monolítica con alto acoplamiento y baja reutilización. La reorganización propuesta separa claramente las responsabilidades y prepara el módulo para integración con Bartender Identity.

**Próximos pasos:**
1. Crear nueva estructura de carpetas
2. Implementar tipos unificados
3. Implementar API Layer
4. Implementar Service Layer
5. Implementar Store Layer
6. Implementar Hooks Layer
7. Refactorizar componentes
8. Refactorizar páginas
9. Validar compatibilidad
10. Generar documentación
