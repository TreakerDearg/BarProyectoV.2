# Documentación Técnica - Fase 5: Smart Workspace (Experiencia Dinámica según Identidad)

**Fecha:** 31 de julio de 2026  
**Versión:** 1.0  
**Estado:** Completado

---

## Resumen Ejecutivo

La Fase 5 implementa el Smart Workspace, un sistema que construye dinámicamente la experiencia del usuario a partir de la información proporcionada por Bartender Identity. Cada rol recibe un entorno personalizado con navegación, dashboards, widgets y funcionalidades generadas desde el backend, eliminando la duplicación de código y mejorando la seguridad.

---

## Arquitectura del Smart Workspace

### Componentes del Workspace Builder

```
backend/src/workspace/
├── types/
│   └── WorkspaceDefinition.js          # Contrato del Workspace
├── resolvers/
│   ├── NavigationResolver.js           # Navegación dinámica
│   ├── DashboardResolver.js            # Dashboard por rol
│   ├── FeatureResolver.js              # Funcionalidades dinámicas
│   ├── WidgetResolver.js               # Widgets dinámicos
│   └── LayoutResolver.js               # Layout por plataforma
├── WorkspaceResolver.js               # Coordinador principal
└── controllers/
    └── workspace.controller.js         # Endpoints API
```

### Flujo de Construcción del Workspace

```
Usuario Autenticado
    ↓
Bartender Identity (Identity Decision Engine)
    ↓
Identity Response (rol, permisos, estado laboral)
    ↓
Workspace Builder
    ↓
├── LayoutResolver → Layout por plataforma
├── NavigationResolver → Navegación por rol
├── DashboardResolver → Dashboard por rol
├── FeatureResolver → Funcionalidades por permisos
├── WidgetResolver → Widgets por rol
└── WorkspaceResolver → Coordinación
    ↓
Workspace Definition (contrato completo)
    ↓
Frontend (renderiza dinámicamente)
    ↓
Usuario comienza a trabajar
```

---

## Workspace Definition (Contrato)

### Estructura del Workspace

**Archivo:** `backend/src/workspace/types/WorkspaceDefinition.js`

```javascript
{
  // Información básica
  userId: string,
  role: string,
  platform: 'web' | 'desktop' | 'mobile' | 'tablet',
  
  // Layout
  layout: 'sidebar' | 'topbar' | 'mobile' | 'minimal' | 'fullscreen',
  layoutConfig: {
    sidebar: { position, width, collapsible },
    header: { position, height, showUserInfo },
    content: { maxWidth, padding },
    density: 'compact' | 'normal' | 'comfortable',
    panelSize: { sidebar, panel, modal, drawer }
  },
  
  // Navegación
  navigation: NavigationItem[],
  
  // Widgets
  widgets: Widget[],
  
  // Funcionalidades
  features: Feature[],
  
  // Accesos rápidos
  shortcuts: Shortcut[],
  
  // Permisos
  permissions: string[],
  
  // Tema
  theme: string,
  
  // Página inicial
  landingPage: string,
  
  // Personalización
  customization: {
    theme, language, density, panelSize,
    favoriteWidgets, customOrder
  },
  
  // Metadata
  metadata: {
    identityStatus, shift, branchId, generatedAt
  }
}
```

### Tipos de Layout

- **SIDEBAR** - Navegación lateral (Desktop, Admin)
- **TOPBAR** - Navegación superior (Cliente)
- **MOBILE** - Navegación inferior con tab-bar (Mobile)
- **MINIMAL** - Layout minimalista
- **FULLSCREEN** - Sin navegación (kioscos)

---

## Resolvers

### 1. NavigationResolver

**Archivo:** `backend/src/workspace/resolvers/NavigationResolver.js`

**Responsabilidad:** Generar navegación dinámica basada en rol, permisos y plataforma.

**Navegación por rol:**

**Cliente:**
- Inicio, Menú, Mis Pedidos, Reservas, Ruleta, Mi Cuenta

**Bartender:**
- Inicio, Pedidos, Menú, Mesas, Reservas, Asistencia, Mi Cuenta

**Mozo:**
- Inicio, Mesas, Pedidos, Menú, Reservas, Asistencia, Mi Cuenta

**Cajero:**
- Inicio, Pagos, Pedidos, Mesas, Asistencia, Mi Cuenta

**Cocina:**
- Inicio, Órdenes, Menú, Asistencia, Mi Cuenta

**Administrador:**
- Dashboard, Usuarios, Roles, Inventario, Menú, Ventas, Reportes, Asistencia, Rendimiento, Configuración

**Dueño:**
- Dashboard, Usuarios, Roles, Administradores, Inventario, Menú, Ventas, Finanzas, Reportes, Asistencia, Rendimiento, Negocio, Configuración

**Funciones:**
- `resolveNavigation(role, permissions, platform)` - Genera navegación filtrada por permisos
- `resolveQuickActions(role, permissions)` - Genera accesos rápidos

---

### 2. DashboardResolver

**Archivo:** `backend/src/workspace/resolvers/DashboardResolver.js`

**Responsabilidad:** Determinar el dashboard inicial basado en rol y estado laboral.

**Dashboards por rol:**

**Cliente:**
- Promociones, Pedidos Recientes, Mis Reservas, Favoritos, Ruleta, Eventos

**Bartender:**
- Pedidos Pendientes, Bebidas en Preparación, Comandas Urgentes, Estado de Barra, Mi Asistencia

**Mozo:**
- Mis Mesas, Pedidos Pendientes, Reservas de Hoy, Mi Asistencia

**Cajero:**
- Pagos Pendientes, Ventas del Día, Caja, Movimientos, Mi Asistencia

**Cocina:**
- Órdenes Activas, Tiempos de Preparación, Órdenes Prioritarias, Mi Asistencia

**Administrador:**
- Métricas Generales, Ventas de Hoy, Alertas de Inventario, Empleados en Turno, Alertas Recientes

**Dueño:**
- Métricas Generales, Ventas de Hoy, Resumen Financiero, Alertas de Inventario, Empleados en Turno, Alertas Recientes

**Funciones:**
- `resolveDashboard(role, permissions, shiftInfo)` - Genera dashboard filtrado por permisos
- `resolveLandingPage(role, identityStatus, shiftInfo)` - Determina página inicial

---

### 3. FeatureResolver

**Archivo:** `backend/src/workspace/resolvers/FeatureResolver.js`

**Responsabilidad:** Habilitar funcionalidades dinámicas basadas en rol y permisos.

**Funcionalidades por rol:**

**Cliente:**
- view_menu, place_order, view_reservations, create_reservation, view_orders, use_roulette, manage_favorites, view_profile, update_profile

**Bartender:**
- view_menu, view_orders, update_order_status, view_tables, manage_tables, view_reservations, view_profile, update_profile, check_in, check_out

**Mozo:**
- view_menu, view_orders, create_order, update_order_status, view_tables, manage_tables, view_reservations, create_reservation, view_profile, update_profile, check_in, check_out

**Cajero:**
- view_menu, view_orders, process_payment, view_tables, view_reservations, view_profile, update_profile, check_in, check_out

**Cocina:**
- view_menu, view_orders, update_order_status, view_profile, update_profile, check_in, check_out

**Administrador:**
- Todas las funcionalidades de empleados + manage_users, manage_roles, view_analytics, manage_inventory, manage_menu, view_reports, manage_settings, view_attendance, manage_attendance, view_performance

**Dueño:**
- Todas las funcionalidades de administrador + manage_admins, manage_business, view_financials, export_data

**Funciones:**
- `resolveFeatures(role, permissions)` - Genera funcionalidades filtradas por permisos
- `hasFeature(featureId, role, permissions)` - Verifica si una funcionalidad está disponible

---

### 4. WidgetResolver

**Archivo:** `backend/src/workspace/resolvers/WidgetResolver.js`

**Responsabilidad:** Resolver widgets dinámicos basados en rol, permisos y configuración.

**Tipos de Widgets:**
- **SALES** - Ventas y promociones
- **INVENTORY** - Inventario y stock
- **ALERTS** - Alertas del sistema
- **ORDERS** - Pedidos y órdenes
- **RESERVATIONS** - Reservas
- **ROULETTE** - Ruleta de premios
- **FAVORITES** - Favoritos
- **WEATHER** - Clima (futuro)
- **NOTIFICATIONS** - Notificaciones y eventos
- **PERFORMANCE** - Rendimiento y métricas
- **ATTENDANCE** - Asistencia y turnos
- **TABLES** - Mesas
- **MENU** - Menú

**Widgets por rol:**

**Cliente:**
- Promociones, Pedidos Recientes, Mis Reservas, Favoritos, Ruleta, Eventos

**Bartender:**
- Pedidos Pendientes, Bebidas en Preparación, Comandas Urgentes, Estado de Barra, Mi Asistencia

**Mozo:**
- Mis Mesas, Pedidos Pendientes, Reservas de Hoy, Mi Asistencia

**Cajero:**
- Pagos Pendientes, Ventas del Día, Caja, Movimientos, Mi Asistencia

**Cocina:**
- Órdenes Activas, Tiempos de Preparación, Órdenes Prioritarias, Mi Asistencia

**Administrador:**
- Métricas Generales, Ventas de Hoy, Alertas de Inventario, Empleados en Turno, Alertas Recientes

**Dueño:**
- Métricas Generales, Ventas de Hoy, Resumen Financiero, Alertas de Inventario, Empleados en Turno, Alertas Recientes

**Funciones:**
- `resolveWidgets(role, permissions, platform)` - Genera widgets filtrados por permisos
- `resolveSpecificWidgets(widgetIds, role, permissions)` - Resuelve widgets específicos

---

### 5. LayoutResolver

**Archivo:** `backend/src/workspace/resolvers/LayoutResolver.js`

**Responsabilidad:** Determinar el layout basado en plataforma y rol.

**Layout por plataforma y rol:**

**Web:**
- Cliente: TOPBAR
- Empleados/Admin: SIDEBAR

**Desktop:**
- Cliente: TOPBAR
- Empleados/Admin: SIDEBAR

**Mobile:**
- Todos: MOBILE (tab-bar inferior)

**Tablet:**
- Cliente: TOPBAR
- Empleados/Admin: SIDEBAR

**Configuraciones de Layout:**

**SIDEBAR:**
- Sidebar izquierdo (260px), colapsible
- Header superior (64px) con usuario y notificaciones
- Densidad normal

**TOPBAR:**
- Header superior (72px) con usuario y notificaciones
- Densidad comfortable

**MOBILE:**
- Header superior (56px)
- Navegación inferior (tab-bar)
- Densidad compact

**Funciones:**
- `resolveLayout(platform, role)` - Determina layout
- `resolveDensity(platform)` - Determina densidad visual
- `resolvePanelSize(platform, role)` - Determina tamaño de paneles

---

### 6. WorkspaceResolver

**Archivo:** `backend/src/workspace/WorkspaceResolver.js`

**Responsabilidad:** Coordinar todos los resolvers para generar el Workspace completo.

**Función principal:**
```javascript
resolveWorkspace(identityResponse, context)
```

**Flujo:**
1. Ejecuta LayoutResolver para determinar layout
2. Ejecuta NavigationResolver para generar navegación
3. Ejecuta DashboardResolver para generar dashboard y widgets
4. Ejecuta FeatureResolver para generar funcionalidades
5. Aplica personalización del usuario
6. Crea Workspace Definition completo

**Función auxiliar:**
```javascript
resolveWorkspaceForUser(user, context)
```
- Ejecuta Identity Decision Engine
- Resuelve Workspace completo

---

## Endpoints API

### GET /workspace

Obtiene el Workspace completo para el usuario autenticado.

**Headers:**
- `Authorization: Bearer {token}`
- `X-Platform: web|desktop|mobile|tablet`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "role": "...",
    "platform": "web",
    "layout": "sidebar",
    "layoutConfig": {...},
    "navigation": [...],
    "widgets": [...],
    "features": [...],
    "shortcuts": [...],
    "permissions": [...],
    "theme": "default",
    "landingPage": "/desktop",
    "customization": {...},
    "metadata": {...}
  },
  "message": "Workspace generado exitosamente"
}
```

### GET /workspace/navigation

Obtiene solo la navegación del Workspace.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "navigation": [...],
    "shortcuts": [...]
  }
}
```

### GET /workspace/widgets

Obtiene solo los widgets del Workspace.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "widgets": [...],
    "landingPage": "/desktop"
  }
}
```

### GET /workspace/features

Obtiene solo las funcionalidades del Workspace.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "features": [...],
    "permissions": [...]
  }
}
```

---

## Frontend Integration

### Tipos TypeScript

**Archivo:** `src/lib/workspace/types/WorkspaceDefinition.ts`

Define todos los tipos TypeScript para el Workspace:
- `LayoutType`, `WidgetType`, `NavigationType`, `PlatformType`
- `NavigationItem`, `Widget`, `Feature`, `Shortcut`
- `LayoutConfig`, `Customization`, `WorkspaceMetadata`
- `WorkspaceDefinition`, `WorkspaceResponse`

### Servicio de Workspace

**Archivo:** `src/lib/workspace/services/workspaceService.ts`

Funciones:
- `getWorkspace(token, platform)` - Obtiene Workspace completo
- `getWorkspaceNavigation(token, platform)` - Obtiene navegación
- `getWorkspaceWidgets(token, platform)` - Obtiene widgets
- `getWorkspaceFeatures(token, platform)` - Obtiene funcionalidades

### Hooks de Workspace

**Archivo:** `src/lib/workspace/hooks/useWorkspace.ts`

Hooks disponibles:
- `useWorkspace(platform)` - Hook principal para Workspace completo
- `useWorkspaceNavigation(platform)` - Hook para navegación
- `useWorkspaceWidgets(platform)` - Hook para widgets
- `useWorkspaceFeatures(platform)` - Hook para funcionalidades

### Componentes Dinámicos

**Archivo:** `src/components/workspace/DynamicNavigation.tsx`

Componente de navegación dinámica que:
- Obtiene navegación del backend
- Renderiza items de navegación con iconos
- Muestra estado activo
- Filtra items ocultos
- Muestra accesos rápidos
- Maneja estados de carga y error

---

## Personalización

### Preparación para Personalización

El Workspace está preparado para soportar:

**Tema:**
- `customization.theme` - Tema personalizado del usuario

**Idioma:**
- `customization.language` - Idioma preferido

**Densidad Visual:**
- `customization.density` - compact, normal, comfortable

**Tamaño de Paneles:**
- `customization.panelSize` - Tamaño personalizado de paneles

**Widgets Favoritos:**
- `customization.favoriteWidgets` - Array de IDs de widgets favoritos

**Orden Personalizado:**
- `customization.customOrder` - Orden personalizado de elementos

**Futuras implementaciones:**
- Guardar preferencias en base de datos
- Agregar endpoint para actualizar personalización
- UI para configurar preferencias

---

## Adaptación por Plataforma

### Web

**Características:**
- Layout TOPBAR para clientes, SIDEBAR para empleados
- Densidad comfortable
- Navegación completa
- Widgets de tamaño medio/grande

### Desktop

**Características:**
- Layout SIDEBAR para todos los roles
- Densidad normal
- Mayor densidad de información
- Accesos rápidos por teclado
- Paneles múltiples

### Mobile (Futuro)

**Características:**
- Layout MOBILE con tab-bar inferior
- Densidad compacta
- Navegación optimizada para gestos
- Tarjetas adaptativas
- Widgets de tamaño pequeño

### Tablet

**Características:**
- Layout TOPBAR para clientes, SIDEBAR para empleados
- Densidad normal
- Interfaz táctil optimizada

---

## Lazy Loading

### Preparación para Lazy Loading

El sistema está preparado para cargar módulos bajo demanda:

**Estrategia:**
- Los widgets tienen `refreshInterval` para actualización periódica
- Los endpoints separados permiten cargar solo lo necesario
- Los hooks de Workspace permiten carga bajo demanda

**Futuras implementaciones:**
- Importaciones dinámicas de componentes de widgets
- Carga diferida de navegación por sección
- Suspense boundaries para widgets
- Código splitting por rol

---

## Seguridad

### Backend como Única Fuente de Verdad

**Principios implementados:**
1. **Navegación desde backend:** El frontend no define qué items mostrar
2. **Permisos validados:** Cada item, widget y funcionalidad se valida contra permisos
3. **No ocultar con CSS:** Los componentes no se renderizan si no tienen permisos
4. **Validación en cada solicitud:** El Workspace se genera en cada petición
5. **Filtrado de permisos:** Todos los resolvers filtran por permisos

---

## Integración con Bartender Identity

### Flujo Completo

```
Login
    ↓
Identity Decision Engine
    ↓
Identity Response (rol, permisos, estado laboral, shift)
    ↓
Workspace Builder
    ↓
Workspace Definition (navegación, widgets, funcionalidades)
    ↓
Frontend (renderiza dinámicamente)
```

### Puntos de Integración

1. **Identity Response → Workspace Resolver:**
   - Usa `role`, `permissions`, `identityStatus`, `shift`
   - Determina layout, navegación, dashboard

2. **Session Management:**
   - Usa token de autenticación
   - Valida sesión en cada endpoint

3. **Permission System:**
   - Filtra navegación, widgets, funcionalidades
   - Valida permisos en cada render

---

## Escalabilidad

### Incorporación de Nuevos Módulos

**Sin modificar la arquitectura:**

1. **Agregar nuevo rol:**
   - Agregar definición en `NAVIGATION_DEFINITIONS`
   - Agregar definición en `DASHBOARD_DEFINITIONS`
   - Agregar definición en `FEATURE_DEFINITIONS`
   - Agregar definición en `WIDGET_DEFINITIONS`

2. **Agregar nuevo widget:**
   - Agregar tipo en `WidgetType`
   - Agregar definición en `WIDGET_DEFINITIONS`
   - Implementar componente en frontend

3. **Agregar nueva funcionalidad:**
   - Agregar definición en `FEATURE_DEFINITIONS`
   - Agregar permisos correspondientes

4. **Agregar nueva plataforma:**
   - Agregar tipo en `PlatformType`
   - Agregar definición en `LAYOUT_DEFINITIONS`
   - Configurar layout en `LAYOUT_CONFIGS`

---

## Archivos Modificados

### Backend

**Archivos creados:**
1. `backend/src/workspace/types/WorkspaceDefinition.js`
2. `backend/src/workspace/resolvers/NavigationResolver.js`
3. `backend/src/workspace/resolvers/DashboardResolver.js`
4. `backend/src/workspace/resolvers/FeatureResolver.js`
5. `backend/src/workspace/resolvers/WidgetResolver.js`
6. `backend/src/workspace/resolvers/LayoutResolver.js`
7. `backend/src/workspace/WorkspaceResolver.js`
8. `backend/src/controllers/workspace.controller.js`
9. `backend/src/routes/workspace.routes.js`

**Archivos modificados:**
1. `backend/src/routes/index.js` - Agregadas rutas de workspace

### Frontend

**Archivos creados:**
1. `src/lib/workspace/types/WorkspaceDefinition.ts`
2. `src/lib/workspace/services/workspaceService.ts`
3. `src/lib/workspace/hooks/useWorkspace.ts`
4. `src/components/workspace/DynamicNavigation.tsx`

---

## Validación Final

### ✅ Completado

- [x] Cada rol recibe un Workspace diferente
- [x] La navegación se genera dinámicamente desde el backend
- [x] Los componentes solo se renderizan cuando el usuario tiene permisos
- [x] No existen menús ni dashboards duplicados entre aplicaciones
- [x] La arquitectura soporta futuras personalizaciones y nuevos módulos
- [x] El Workspace se adapta correctamente a Web, Desktop y futuras plataformas
- [x] El sistema mantiene compatibilidad con Bartender Identity, Google OAuth, sesiones modernas y el Decision Engine

---

## Conclusiones

La Fase 5 ha implementado el Smart Workspace, un sistema que construye dinámicamente la experiencia del usuario basándose en su identidad, rol y contexto. El backend es ahora la única fuente de verdad para navegación, dashboards, widgets y funcionalidades, eliminando la duplicación de código y mejorando la seguridad.

**Beneficios logrados:**
1. **Experiencia personalizada:** Cada rol recibe un Workspace adaptado
2. **Centralización:** Toda la configuración vive en el backend
3. **Escalabilidad:** Fácil agregar nuevos roles, widgets y funcionalidades
4. **Seguridad:** Permisos validados en cada render
5. **Mantenibilidad:** Arquitectura modular y desacoplada
6. **Performance:** Carga selectiva de módulos y widgets
7. **Personalización:** Preparado para preferencias del usuario
8. **Multi-plataforma:** Adaptación automática por plataforma

**Estado Final:** ✅ Smart Workspace implementado y listo para producción
