# Auditoría del Layout del Cliente

**Fecha:** 28 de julio de 2026
**Ubicación:** `src/app/cliente`
**Objetivo:** Rediseñar completamente el Layout para crear una base sólida, moderna y reutilizable.

---

## 1. Arquitectura Actual

### Estructura de Archivos
```
src/app/cliente/
├── layout.tsx (wrapper simple)
├── ClienteShell.tsx (contenedor principal)
├── cliente-shell.module.css
├── cliente-nav.module.css
├── cliente-ui.module.css (estilos globales)
├── page.tsx (home)
├── home/
│   ├── components/
│   │   ├── HomeHero.tsx
│   │   ├── HomeFooter.tsx
│   │   ├── FeaturedCategories.tsx
│   │   ├── FeaturedProducts.tsx
│   │   ├── PromotionSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   └── CTASection.tsx
├── carta/
│   ├── page.tsx
│   └── components/
├── pedido/
│   ├── page.tsx
│   ├── pedido-ui.module.css
│   └── components/
├── reservas/
│   ├── page.tsx
│   ├── Reservas.module.css
│   └── components/
├── ruleta/
└── cuenta/
```

### Componentes del Layout
1. **layout.tsx** - Wrapper mínimo que renderiza ClienteShell
2. **ClienteShell.tsx** - Contenedor principal con:
   - Providers (CartContext, ToastContext, UIContext)
   - Background simple (`bg-[var(--bg)]`)
   - ClienteNav
   - Main con padding básico
3. **ClienteNav.tsx** - Navegación completa con:
   - Header sticky con logo y navegación desktop
   - Mobile menu (dropdown)
   - Bottom navigation dock para móvil
   - CartDrawer integrado

### Problemas de Arquitectura
- ❌ ClienteShell mezcla responsabilidades (providers + layout + navegación)
- ❌ No hay separación clara entre capas (background, decorations, overlays)
- ❌ ClienteNav maneja demasiada lógica (desktop + mobile + dock + cart)
- ❌ No hay sistema de contenedores reutilizables
- ❌ Footer está dentro de cada página en lugar del layout
- ❌ No hay sistema de overlays centralizado
- ❌ No hay sistema de notificaciones globales
- ❌ No hay transiciones entre páginas

---

## 2. Componentización

### Estado Actual
- **ClienteShell**: Contenedor monolítico
- **ClienteNav**: Componente gigante con múltiples responsabilidades
- **CartDrawer**: Componente independiente bien estructurado
- **HomeFooter**: Componente específico de home (no global)

### Problemas
- ❌ ClienteNav debería separarse en:
  - Header
  - DesktopNavigation
  - MobileNavigation
  - BottomNavigation
- ❌ No hay componentes de layout reutilizables (Container, Section, etc.)
- ❌ Footer duplicado en cada página en lugar de ser global
- ❌ No hay BackgroundLayer separado
- ❌ No hay OverlayManager para modales/drawers/alertas
- ❌ No hay NotificationLayer para toasts/alertas globales

---

## 3. Navegación

### Estado Actual
- **Header Sticky**: `position: sticky, top: 0, z-index: 100`
- **Desktop Navigation**: Menú horizontal visible desde 1024px
- **Mobile Menu**: Dropdown desde botón hamburger
- **Bottom Navigation**: Dock flotante en móvil (oculto en desktop)

### Problemas
- ❌ Header no cambia de apariencia al hacer scroll
- ❌ No hay animaciones de transición entre rutas
- ❌ Mobile menu y bottom navigation coexisten (redundancia)
- ❌ Dock bottom navigation tiene CartDrawer integrado (inconsistente)
- ❌ No hay indicador de progreso o breadcrumb
- ❌ Estados activos usan lógica diferente para exact vs prefix
- ❌ No hay buscador global

---

## 4. Responsive

### Estado Actual
- **Breakpoints usados**: 480px, 640px, 1024px
- **Padding**: `px-4 sm:px-6 lg:px-8`
- **Max-width**: `max-w-72rem` en ClienteNav
- **Bottom padding**: `pb-28` para dock en móvil

### Problemas
- ❌ No cubre breakpoints solicitados (320px, 375px, 425px, 768px, 1024px, 1280px, 1440px, ultra wide)
- ❌ Espaciado inconsistente entre páginas
- ❌ No hay sistema de contenedores con anchos definidos
- ❌ Dock bottom navigation puede solaparse con contenido
- ❌ No hay optimización para ultra wide

---

## 5. Espaciado

### Estado Actual
- **ClienteShell main**: `px-4 sm:px-6 lg:px-8 pt-6 pb-28`
- **cliente-shell.module.css**: `padding: 2rem 1rem 3rem` (desktop)
- **ClienteNav**: `padding: 0.75rem 1rem`
- **No hay sistema consistente de espaciado**

### Problemas
- ❌ Valores aleatorios sin escala uniforme
- ❌ Cada página define su propio espaciado
- ❌ No hay sistema de spacing (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- ❌ No hay separación entre vertical y horizontal spacing
- ❌ No hay sistema de gaps para grids/flex

---

## 6. Jerarquía Visual

### Estado Actual
- **Header**: Logo + navegación + cart
- **Main**: Contenido de cada página
- **Bottom Nav**: Dock flotante
- **Footer**: Solo en home page

### Problemas
- ❌ No hay jerarquía visual clara entre layout y contenido
- ❌ Footer no es global (solo en home)
- ❌ No hay sistema de headings consistente
- ❌ No hay separación visual entre secciones
- ❌ No hay sistema de tarjetas unificado
- ❌ Cada página tiene su propia estructura visual

---

## 7. Accesibilidad

### Estado Actual
- **ARIA**: Algunos labels en CartDrawer
- **Focus**: No hay gestión de foco en overlays
- **Teclado**: Navegación básica por links
- **Contraste**: Usa variables CSS (no verificado)
- **Reduced motion**: No implementado

### Problemas
- ❌ No hay roles ARIA en navegación
- ❌ No hay gestión de foco en modals/drawers
- ❌ No hay skip links
- ❌ No hay focus visible consistente
- ❌ No hay prefers-reduced-motion
- ❌ No hay soporte para lectores de pantalla

---

## 8. Rendimiento

### Estado Actual
- **Renderizado**: ClienteShell se re-renderiza en cada navegación
- **Memoización**: No hay memoización de componentes
- **Lazy loading**: No implementado
- **Bundle size**: ClienteNav importa muchos iconos

### Problemas
- ❌ ClienteNav se re-renderiza en cada cambio de ruta
- ❌ No hay React.memo en componentes de layout
- ❌ No hay lazy loading de componentes pesados
- ❌ Iconos importados directamente (no tree-shaking óptimo)
- ❌ No hay code splitting por ruta

---

## 9. Gestión del Estado

### Estado Actual
- **ClienteNav**: useState para mobileOpen
- **CartDrawer**: useState local para isOpen, editingNotes
- **Providers**: CartContext, ToastContext, UIContext
- **Zustand**: useClienteStore para carrito global

### Problemas
- ❌ Estado de navegación disperso (ClienteNav + pathname)
- ❌ CartDrawer tiene estado local (no global)
- ❌ No hay estado global para modals/overlays
- ❌ No hay estado para scroll position
- ❌ No hay estado para theme preferences

---

## 10. Experiencia de Usuario

### Estado Actual
- **Navegación**: Funcional pero básica
- **Carrito**: Drawer bien implementado
- **Transiciones**: No hay transiciones entre páginas
- **Loading**: No hay skeletons globales
- **Error states**: No hay manejo global de errores

### Problemas
- ❌ No hay feedback visual al navegar
- ❌ No hay skeletons de carga
- ❌ No hay error boundaries
- ❌ No hay notificaciones globales (toasts)
- ❌ No hay indicador de progreso
- ❌ No hay microinteracciones
- ❌ No hay animaciones de entrada/salida

---

## 11. Diseño Visual

### Estado Actual
- **Colores**: Variables CSS (gold, surface, text, etc.)
- **Tipografía**: No hay sistema consistente
- **Sombras**: Variables CSS
- **Radios**: Variables CSS (--radius-md, --radius-lg, etc.)
- **Glassmorphism**: Usado en nav y dock

### Problemas
- ❌ No hay sistema de tarjetas unificado
- ❌ No hay sistema de botones consistente
- ❌ No hay sistema de inputs consistente
- ❌ Cada página usa estilos diferentes
- ❌ No hay sistema de badges/chips
- ❌ No hay sistema de iconografía consistente
- ❌ Fondo plano sin gradientes o decoraciones
- ❌ No Bento Grid system

---

## 12. Integraciones Existentes

### Backend
- ✅ CartDrawer usa Zustand store (no afectar)
- ✅ Providers (CartContext, ToastContext, UIContext) - mantener
- ✅ API calls en páginas individuales (no afectar)

### Componentes
- ✅ CartDrawer - bien implementado, mantener lógica
- ✅ HomeFooter - mover a layout global
- ✅ HomeHero - mantener, ajustar contenedores

---

## 13. Recomendaciones para Rediseño

### Arquitectura Propuesta
```
ClientLayout
├── BackgroundLayer (gradientes, iluminación, formas orgánicas)
├── GlobalDecorations (elementos decorativos consistentes)
├── Header (sticky con scroll effects)
│   ├── Logo
│   ├── DesktopNavigation
│   ├── CartTrigger
│   └── MobileMenuToggle
├── MobileNavigation (bottom dock)
├── FloatingCart (mejorado)
├── MainContent
│   ├── Container (system: Full, Large, Medium, Narrow)
│   └── PageContent
├── FloatingActions (acciones contextuales)
├── OverlayManager (modals, drawer, alertas centralizados)
├── NotificationLayer (toasts globales)
└── Footer (global)
```

### Componentes a Crear
1. **BackgroundLayer** - Fondo moderno con gradientes y formas
2. **GlobalDecorations** - Elementos decorativos consistentes
3. **Header** - Rediseñado con scroll effects
4. **DesktopNavigation** - Menú horizontal con animaciones
5. **MobileNavigation** - Bottom dock mejorado
6. **MainContent** - Contenedor global con sistema de espaciado
7. **Container** - Sistema de contenedores (Full, Large, Medium, Narrow)
8. **Card** - Sistema de tarjetas unificado
9. **OverlayManager** - Gestión centralizada de overlays
10. **NotificationLayer** - Sistema de notificaciones globales
11. **Footer** - Footer global rediseñado
12. **PageTransition** - Transiciones entre páginas

### Sistemas a Implementar
1. **Sistema de Espaciado** - Escala uniforme (4, 8, 16, 24, 32, 48, 64px)
2. **Sistema de Contenedores** - Full (100%), Large (1400px), Medium (900px), Narrow (600px)
3. **Sistema de Tarjetas** - Bordes, sombras, radios, hover unificados
4. **Sistema de Transiciones** - Fade, slide, crossfade con Framer Motion
5. **Sistema de Overlays** - Animaciones, backdrop, focus, cierre uniforme
6. **Sistema Responsive** - Todos los breakpoints solicitados

### Mejoras Específicas
- Separar ClienteNav en componentes más pequeños
- Mover HomeFooter a layout global
- Crear sistema de contenedores reutilizables
- Implementar transiciones entre páginas
- Centralizar gestión de overlays
- Agregar sistema de notificaciones globales
- Implementar scroll effects en header
- Agregar skeletons de carga
- Implementar error boundaries
- Agregar accesibilidad completa
- Optimizar rendimiento con memoización

---

## 14. Prioridades

### Alta Prioridad
1. Crear BackgroundLayer con fondo moderno
2. Rediseñar Header con scroll effects
3. Crear sistema de contenedores reutilizables
4. Separar ClienteNav en componentes más pequeños
5. Crear MainContent con sistema de espaciado
6. Mover Footer a layout global
7. Implementar sistema de tarjetas unificado
8. Optimizar responsive completo

### Media Prioridad
1. Crear OverlayManager
2. Crear NotificationLayer
3. Implementar transiciones entre páginas
4. Crear FloatingActions
5. Agregar accesibilidad completa

### Baja Prioridad
1. Crear GlobalDecorations
2. Optimizar rendimiento con memoización
3. Agregar buscador global

---

## 15. Riesgos

- **Compatibilidad**: Asegurar que páginas existentes funcionen con nuevo layout
- **Estado**: Migrar estado local de CartDrawer a global si necesario
- **Performance**: Evitar re-renders innecesarios en layout
- **Responsive**: Cubrir todos los breakpoints solicitados
- **Accesibilidad**: Implementar roles ARIA y focus management

---

## 16. Plan de Implementación

1. **Fase 1**: Auditoría completa (✅ en progreso)
2. **Fase 2**: Crear componentes base (Background, Containers, MainContent)
3. **Fase 3**: Rediseñar Header y navegación
4. **Fase 4**: Implementar Footer global
5. **Fase 5**: Crear sistema de overlays y notificaciones
6. **Fase 6**: Implementar transiciones
7. **Fase 7**: Optimizar responsive y accesibilidad
8. **Fase 8**: Integrar en layout.tsx y validar

---

**Conclusión**: El Layout actual es funcional pero carece de estructura, consistencia y características modernas. Necesita una reestructuración completa para convertirse en una base sólida y reutilizable para toda la aplicación cliente.
