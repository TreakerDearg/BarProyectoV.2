// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Typography Scale: Nocturne Gastronomy
// Outfit: headings, display, prices, branding
// Inter: body, labels, navigation, forms
// ─────────────────────────────────────────────────────────────────────────────

import type { TextStyle } from 'react-native';

// ── Font families ─────────────────────────────────────────────────────────────
// Las fuentes se cargan con expo-google-fonts en App.tsx.
// Mientras no estén cargadas, RN usa el system font sin error.

export const FontFamily = {
  outfit:          'Outfit_400Regular',
  outfitMedium:    'Outfit_500Medium',
  outfitSemiBold:  'Outfit_600SemiBold',
  outfitBold:      'Outfit_700Bold',
  inter:           'Inter_400Regular',
  interMedium:     'Inter_500Medium',
  interSemiBold:   'Inter_600SemiBold',
  interBold:       'Inter_700Bold',
} as const;

// ── Type scale (Nocturne Gastronomy) ─────────────────────────────────────────

export const Typography = {
  // ── Display — Outfit (promociones, hero titles, precios grandes) ──
  displayLg: {
    fontFamily:     FontFamily.outfitSemiBold,
    fontSize:       32,
    lineHeight:     38,
    letterSpacing:  -0.64,  // -0.02em × 32
  } satisfies TextStyle,

  displaySm: {
    fontFamily:     FontFamily.outfitSemiBold,
    fontSize:       26,
    lineHeight:     32,
    letterSpacing:  -0.26,  // -0.01em × 26
  } satisfies TextStyle,

  // ── Headlines — Outfit (títulos de sección, nombres de platos) ──
  headlineLg: {
    fontFamily:     FontFamily.outfitSemiBold,
    fontSize:       22,
    lineHeight:     28,
    letterSpacing:  -0.22,
  } satisfies TextStyle,

  headlineSm: {
    fontFamily:     FontFamily.outfitMedium,
    fontSize:       18,
    lineHeight:     24,
    letterSpacing:  0,
  } satisfies TextStyle,

  // ── Title — Outfit (subtítulos, categorías) ──
  titleMd: {
    fontFamily:     FontFamily.outfitMedium,
    fontSize:       16,
    lineHeight:     22,
    letterSpacing:  0,
  } satisfies TextStyle,

  // ── Body — Inter (descripciones, textos de formularios) ──
  bodyLg: {
    fontFamily:     FontFamily.inter,
    fontSize:       16,
    lineHeight:     24,
    letterSpacing:  0,
  } satisfies TextStyle,

  bodyMd: {
    fontFamily:     FontFamily.inter,
    fontSize:       14,
    lineHeight:     20,
    letterSpacing:  0,
  } satisfies TextStyle,

  bodySm: {
    fontFamily:     FontFamily.inter,
    fontSize:       12,
    lineHeight:     16,
    letterSpacing:  0.12,  // 0.01em × 12
  } satisfies TextStyle,

  // ── Labels — Inter (navegación, chips, badges, botones) ──
  labelLg: {
    fontFamily:     FontFamily.interSemiBold,
    fontSize:       14,
    lineHeight:     18,
    letterSpacing:  0.28,  // 0.02em × 14
  } satisfies TextStyle,

  labelMd: {
    fontFamily:     FontFamily.interMedium,
    fontSize:       12,
    lineHeight:     16,
    letterSpacing:  0.36,  // 0.03em × 12
  } satisfies TextStyle,

  labelSm: {
    fontFamily:     FontFamily.interSemiBold,
    fontSize:       10,
    lineHeight:     12,
    letterSpacing:  0.60,  // 0.06em × 10
    textTransform:  'uppercase' as const,
  } satisfies TextStyle,

  // ── Price — Outfit (precios destacados en gold) ──
  price: {
    fontFamily:     FontFamily.outfitSemiBold,
    fontSize:       18,
    lineHeight:     22,
    letterSpacing:  0,
  } satisfies TextStyle,

  priceLg: {
    fontFamily:     FontFamily.outfitSemiBold,
    fontSize:       22,
    lineHeight:     26,
    letterSpacing:  0,
  } satisfies TextStyle,
} as const;

// ── Alias para legibilidad en uso ─────────────────────────────────────────────
export const T = Typography;
