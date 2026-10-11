// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Motion: NEBULA EMBER (v3)
// Duraciones, easings y presets de animación.
// Reglas: transform/opacity → useNativeDriver true; layout (width) → false;
// todo loop lleva cleanup en useEffect.
// ─────────────────────────────────────────────────────────────────────────────

import { Easing } from 'react-native';

// ── Duraciones ────────────────────────────────────────────────────────────────

export const Motion = {
  /** Micro-interacciones (press scale, toggles) */
  fast: 150,
  /** Transiciones estándar (fades, slides de secciones) */
  base: 250,
  /** Entradas grandes (modales, héroes) */
  slow: 400,
} as const;

// ── Easings ───────────────────────────────────────────────────────────────────

export const Easings = {
  /** Easing estándar: acelera y desacelera suave */
  standard:   Easing.bezier(0.4, 0, 0.2, 1),
  /** Solo desacelera — entradas */
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  /** Solo acelera — salidas */
  accelerate: Easing.bezier(0.4, 0, 1, 1),
} as const;

// ── Presets de animación ──────────────────────────────────────────────────────

/** Spring de micro-interacción para press (fricción 8) */
export const SpringPress = {
  friction:        8,
  tension:         120,
  useNativeDriver: true,
} as const;
