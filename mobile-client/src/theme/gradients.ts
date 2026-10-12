// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Gradients: NEBULA EMBER (v3)
// Presets de color para expo-linear-gradient.
// Dirección por defecto: vertical (top→bottom); usar Direction para otros ejes.
// ─────────────────────────────────────────────────────────────────────────────

import type { ColorValue } from 'react-native';

import { NocturneColors } from './colors';

/** Tupla de 2+ colores que acepta expo-linear-gradient */
export type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

// ── Direcciones listas para esparcir en props ────────────────────────────────

export const Direction = {
  vertical:   { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  horizontal: { start: { x: 0, y: 0 },   end: { x: 1, y: 0 } },
  diagonal:   { start: { x: 0, y: 0 },   end: { x: 1, y: 1 } },
} as const;

// ── Presets ──────────────────────────────────────────────────────────────────

export const Gradients = {
  /** Oscurece la parte inferior de héroes (imagen full-bleed → canvas) */
  heroOverlay: {
    colors:    ['transparent', NocturneColors.background] as GradientColors,
    locations: [0.45, 1] as readonly [number, number],
    ...Direction.vertical,
  },
  /** Fill de CTAs primarios: brasa → ember profundo */
  emberCTA: {
    colors: [NocturneColors.primary, NocturneColors.emberDeep] as GradientColors,
    ...Direction.vertical,
  },
  /** Lavado nocturno para headers (canvas → transparente) */
  nightWash: {
    colors: [NocturneColors.background, 'transparent'] as GradientColors,
    ...Direction.vertical,
  },
  /** Brillo sutil ember para cards destacadas */
  cardSheen: {
    colors: [NocturneColors.emberGlow, 'transparent'] as GradientColors,
    ...Direction.diagonal,
  },
} as const;
