// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Spacing Scale: Nocturne Gastronomy
// Grid base de 8pt. Márgenes de pantalla: 20px (normal) / 16px (compacto).
// ─────────────────────────────────────────────────────────────────────────────

export const Spacing = {
  // ── Named tokens ─────────────────────────────────────────────
  /** 4px — micro separación, iconos internos */
  xs:     4,
  /** 8px — separación entre elementos relacionados */
  sm:     8,
  /** 12px — separación secundaria en carouseles horizontales */
  smMd:   12,
  /** 16px — padding interno de cards, separación entre cards */
  md:     16,
  /** 20px — margen de pantalla principal */
  gutter: 20,
  /** 24px — separación entre secciones */
  lg:     24,
  /** 32px — separación entre bloques mayores */
  xl:     32,
  /** 40px — espacios de respiro visual */
  xxl:    40,
  /** 48px — secciones hero */
  xxxl:   48,

  // ── Layout específico ─────────────────────────────────────────
  /** Margen horizontal de pantalla — 20px standard */
  screenH:       20,
  /** Margen horizontal compacto (<360px) — 16px */
  screenHCompact: 16,
  /** Padding vertical de botones primarios */
  btnVertical:   14,
  /** Altura mínima de botones primarios (touch target cómodo) */
  btnHeight:     52,
  /** Padding interno de celdas de lista */
  cellPadding:   12,
  /** Espacio sobre el bottom nav (safe area mínima) */
  bottomNavClearance: 72,
  /** Altura del bottom tab navigator */
  tabBarHeight:  64,
  /** Padding debajo del último elemento de un scroll */
  scrollBottom:  90,
} as const;

// ── Radios (Nocturne Gastronomy) ──────────────────────────────────────────────
export const Radius = {
  /** 4px — micro-badges, chips de estado */
  xs:     4,
  /** 6px — badges de dieta, tags de región */
  sm:     6,
  /** 10px — inputs, dropdowns, filas de lista */
  md:     10,
  /** 12px — secondary containers */
  lg:     12,
  /** 16px — cards principales, hero cards */
  xl:     16,
  /** 24px — modales, bottom sheets */
  xxl:    24,
  /** 9999px — pills, chips de categoría, avatares */
  full:   9999,
} as const;
