// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Elevation System: Nocturne Gastronomy
// Visual hierarchy via tonal stacking — no heavy blurred glass.
// ─────────────────────────────────────────────────────────────────────────────

import type { ViewStyle } from 'react-native';

// ── Shadow helper (cross-platform) ───────────────────────────────────────────
// iOS usa shadow*, Android usa elevation. Se exportan objetos combinados.

export const Elevation = {
  /** Level 0 — Canvas. Sin sombra, absorbe la luz */
  none: {
    shadowColor:   'transparent',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius:  0,
    elevation:     0,
  } satisfies ViewStyle,

  /** Level 1 — Cards. Borde 1px sutil, sin drop shadow */
  card: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.30,
    shadowRadius:  6,
    elevation:     2,
  } satisfies ViewStyle,

  /** Level 2 — Active sheets, navigation bars, menus. Sombra ambiental */
  sheet: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius:  20,
    elevation:     6,
  } satisfies ViewStyle,

  /** Level 3 — Modales, alertas, bottom sheets. Dual shadow model */
  modal: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 16 },
    shadowOpacity: 0.75,
    shadowRadius:  32,
    elevation:     12,
  } satisfies ViewStyle,

  /** Gold Focal — Solo para CTA primarios. Glow dorado difuso */
  goldCTA: {
    shadowColor:   '#d4a340',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius:  16,
    elevation:     8,
  } satisfies ViewStyle,
} as const;
