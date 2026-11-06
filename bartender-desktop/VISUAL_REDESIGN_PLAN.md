# Plan de Rediseño Visual — Bartender Desktop Dashboard
> **Documento de referencia permanente.** Leer antes de tocar cualquier archivo visual.

---

## ⚠️ Reglas absolutas del rediseño

1. **CERO lógica tocada.** Hooks, stores, services, types, routing, accessControl — intocables.
2. **Reescritura permitida si es necesario.** Si un componente está tan acoplado a la estética vieja que parchearlo genera más deuda que reescribirlo, se reescribe el JSX/CSS completo, preservando exactamente las mismas props, datos y lógica.
3. **Paleta única.** Solo los colores definidos en esta tabla. No inventar variantes nuevas durante la implementación.

---

## 🎨 Paleta aprobada — "Slate Elegante"

Referencia visual: GitHub Dark, Linear App, Vercel Dashboard.
Filosofía: grises azulados oscuros con profundidad real, acentos dorado/verde/rojo bien saturados y legibles.

| Rol semántico       | Token CSS          | Valor HEX / RGBA            | Uso principal                          |
|---------------------|--------------------|-----------------------------|----------------------------------------|
| Fondo raíz          | `--bg`             | `#0D1117`                   | Body, DashboardLayout fondo            |
| Fondo profundo      | `--bg-deep`        | `#090E14`                   | Sidebar, zonas de máximo contraste     |
| Superficie base     | `--surface`        | `#161B22`                   | Paneles principales, Header            |
| Superficie 2        | `--surface-2`      | `#1C2333`                   | Tarjetas KPI, cards                    |
| Superficie 3        | `--surface-3`      | `#21283A`                   | Hover de cards, elevación              |
| Superficie 4        | `--surface-4`      | `#293042`                   | Modales, dropdowns                     |
| Primario / Dorado   | `--gold`           | `#F0B429`                   | Ítem activo sidebar, botón CTA, acento |
| Éxito / Verde       | `--green`          | `#3FB950`                   | Completado, disponible, online         |
| Peligro / Rojo      | `--red`            | `#F85149`                   | Alertas críticas, cancelaciones        |
| Advertencia         | `--orange`         | `#FF7B54`                   | Cocina ocupada, advertencias           |
| Borde visible       | `--border`         | `#30363D`                   | Bordes de paneles, separadores         |
| Texto principal     | `--text`           | `#E6EDF3`                   | Todo el texto primario                 |
| Texto secundario    | `--text-dim`       | `#8B949E`                   | Labels, subtítulos, metadata           |
| Texto inactivo      | `--text-muted`     | `rgba(139,148,158,0.5)`     | Placeholders, hints                    |

### Variantes derivadas (generadas automáticamente desde los tokens base)

| Token                 | Valor                                |
|-----------------------|--------------------------------------|
| `--gold-light`        | `#F5C842`                            |
| `--gold-dark`         | `#C8920F`                            |
| `--gold-soft`         | `rgba(240,180,41,0.12)`              |
| `--gold-border`       | `rgba(240,180,41,0.30)`              |
| `--gold-glow`         | `0 0 24px rgba(240,180,41,0.25)`     |
| `--green-light`       | `#56D364`                            |
| `--green-dark`        | `#2EA043`                            |
| `--green-soft`        | `rgba(63,185,80,0.12)`               |
| `--green-border`      | `rgba(63,185,80,0.30)`               |
| `--green-glow`        | `0 0 24px rgba(63,185,80,0.22)`      |
| `--red-light`         | `#FF6B63`                            |
| `--red-dark`          | `#D1322A`                            |
| `--red-soft`          | `rgba(248,81,73,0.12)`               |
| `--red-border`        | `rgba(248,81,73,0.30)`               |
| `--red-glow`          | `0 0 24px rgba(248,81,73,0.22)`      |
| `--orange-light`      | `#FF9A7A`                            |
| `--orange-dark`       | `#D95830`                            |
| `--orange-soft`       | `rgba(255,123,84,0.12)`              |
| `--orange-border`     | `rgba(255,123,84,0.28)`              |
| `--orange-glow`       | `0 0 24px rgba(255,123,84,0.20)`     |
| `--border-strong`     | `rgba(48,54,61,0.8)` → `#3D444D`    |
| `--surface-glow`      | `rgba(22,27,34,0.92)`               |

---

## 📁 Archivos en scope

```
bartender-desktop/src/
├── index.css                              ← Tokens CSS raíz (:root)
├── tailwind.config.js                     ← Colores Tailwind sincronizados
├── styles/
│   ├── dashboard-theme.css                ← Clases utilitarias dashboard
│   ├── nebula-theme.css                   ← Clases nebula-panel, aurora, scrollbar
│   └── Sidebar.module.css                 ← CSS module del sidebar (puede vaciarse)
├── layouts/
│   └── DashboardLayout.tsx                ← Layout principal, colores hardcoded
├── components/ui/
│   ├── Sidebar.tsx                        ← Reescritura visual completa
│   └── Header.tsx                         ← Reescritura visual completa
└── modules/dashboard/
    ├── pages/DashboardPage.tsx            ← Controles: ModeToggle, ViewTabs, etc.
    └── components/
        ├── OverviewStrip.tsx              ← KPI cards — corazón del dashboard
        ├── DashboardAlertsBanner.tsx      ← Banner alertas críticas
        └── ServiceSummaryRow.tsx          ← Métricas de servicio (Standard)
```

## 🚫 Archivos FUERA de scope — NUNCA tocar

```
src/hooks/
src/stores/
src/services/
src/types/
src/config/
src/router/
src/routes/
src/modules/dashboard/hooks/
src/modules/dashboard/store/
src/modules/dashboard/services/
src/modules/*/hooks/
src/modules/*/store/
src/modules/*/services/
```

---

## ✅ Checklist de tareas

- [x] **Task 1** — Crear este archivo de memoria
- [x] **Task 2** — Actualizar tokens CSS en `index.css` + sincronizar `tailwind.config.js`
- [x] **Task 3** — Reescribir visualmente `Sidebar.tsx` + limpiar `Sidebar.module.css`
- [x] **Task 4** — Reescribir visualmente `Header.tsx`
- [x] **Task 5** — Actualizar `DashboardLayout.tsx` para 1920×1080
- [x] **Task 6** — Reescribir controles de `DashboardPage.tsx`
- [x] **Task 7** — Reescribir `OverviewStrip.tsx`, `DashboardAlertsBanner.tsx`, `ServiceSummaryRow.tsx`
- [x] **Task 8** — Pulir `nebula-theme.css` y `dashboard-theme.css`

**✅ TODAS LAS TAREAS COMPLETADAS — Dashboard v3.0 Slate Elegante**

---

## 🔧 Componentes adicionales actualizados (post-Task 8)

Después del rediseño base se actualizaron todos los componentes secundarios del dashboard
que aún usaban tokens de la paleta anterior:

| Componente | Cambios |
|---|---|
| `AnalyticsPanel.tsx` | Tokens, gráfico, tooltips, chips de métricas |
| `TopProductsGrid.tsx` | Barras de progreso, colores, skeleton |
| `QuickStatusPanel.tsx` | Barras de carga, inventario, alertas |
| `ActiveStaffPanel.tsx` | Pills de resumen, avatares, lista de empleados |
| `DashboardPricingPanel.tsx` | Badge de estado, valor del multiplicador |
| `InventoryAlerts.tsx` | Cards de alertas stock |
| `LiveActivity.tsx` | Feed de actividad, colores por tipo |
| `ServiceHealth.tsx` | Barras segmentadas, indicadores de estado |
| `RevenueStreamChart.tsx` | Gráfico, tooltip, gradiente, total |
| `QuickActionsPanel.tsx` | Modal, botones de acción |
| `DashboardKpiStrip.tsx` | KPIs por vista/modo, tokens inline |
| `KpiSkeleton.tsx` | Skeleton con paleta nueva |
| `RangeSelector` | Clase `select-dark` — soluciona dropdown blanco |
| `dashboard-theme.css` | Añadido `.select-dark` + `select option` dark |

---

## 📐 Directrices de UX — "Sistema para cualquier persona"

- **Texto mínimo visible:** `text-xs` (12px). Nada por debajo.
- **Números KPI:** `text-4xl font-black` — se leen desde 1 metro.
- **Ítem activo sidebar:** fondo sólido + borde izquierdo de 3px dorado. Obvio, no sutil.
- **Alertas críticas:** Fondo con opacidad 25%+ y borde fuerte. Imposibles de ignorar.
- **Bordes de paneles:** `#30363D` — visible, no fantasma (`rgba(255,255,255,0.05)`).
- **Padding de tarjetas:** mínimo `p-5`, preferible `p-6`.
- **Scroll:** debe funcionar en 1920×1080 sin reducir zoom. El `min-h-0` debe propagarse en toda la cadena flex.

---

## 🔄 Próximas áreas (después del Dashboard)

Luego del Dashboard, el mismo proceso se aplica en este orden:
1. Pedidos (Orders)
2. Mesas (Tables)
3. Reservas (Reservations)
4. Inventario
5. Empleados
6. Productos / Menús
7. Resto del sistema

Cada área usará la **misma paleta** definida en este documento.

---

*Última actualización: Task 1 completada.*
