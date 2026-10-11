// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Typography Scale: NEBULA EMBER (v3)
// Fraunces: display, precios, branding (editorial, cálida)
// Inter: body, labels, navegación, forms
// ─────────────────────────────────────────────────────────────────────────────

import type { TextStyle } from 'react-native';

// ── Font families ─────────────────────────────────────────────────────────────
// Las fuentes se cargan con expo-google-fonts en App.tsx (6 pesos en total).
// Mientras no estén cargadas, RN usa el system font sin error.

export const FontFamily = {
  fraunces:        'Fraunces_600SemiBold',
  frauncesBold:    'Fraunces_700Bold',
  inter:           'Inter_400Regular',
  interMedium:     'Inter_500Medium',
  interSemiBold:   'Inter_600SemiBold',
  interBold:       'Inter_700Bold',
} as const;

// ── Type scale (NEBULA EMBER) ────────────────────────────────────────────────

export const Typography = {
  // ── Display — Fraunces (saludo, títulos de pantalla, resultado ruleta) ──
  displayLg: {
    fontFamily:     FontFamily.fraunces,
    fontSize:       34,
    lineHeight:     40,
    letterSpacing:  -0.68,  // -0.02em × 34
  } satisfies TextStyle,

  displaySm: {
    fontFamily:     FontFamily.fraunces,
    fontSize:       27,
    lineHeight:     32,
    letterSpacing:  -0.54,  // -0.02em × 27
  } satisfies TextStyle,

  // ── Headlines — Fraunces (títulos de sección) / Inter (subtítulos) ──
  headlineLg: {
    fontFamily:     FontFamily.fraunces,
    fontSize:       22,
    lineHeight:     28,
    letterSpacing:  -0.22,  // -0.01em × 22
  } satisfies TextStyle,

  headlineSm: {
    fontFamily:     FontFamily.interSemiBold,
    fontSize:       18,
    lineHeight:     24,
    letterSpacing:  0,
  } satisfies TextStyle,

  // ── Title — Inter (subtítulos, categorías) ──
  titleMd: {
    fontFamily:     FontFamily.interMedium,
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

  // ── Price — Fraunces (precios protagonistas en ember) ──
  price: {
    fontFamily:     FontFamily.fraunces,
    fontSize:       19,
    lineHeight:     24,
    letterSpacing:  0,
  } satisfies TextStyle,

  priceLg: {
    fontFamily:     FontFamily.fraunces,
    fontSize:       24,
    lineHeight:     28,
    letterSpacing:  0,
  } satisfies TextStyle,

  // ── Order number — Fraunces (número de comanda gigante del tracker) ──
  orderNumber: {
    fontFamily:     FontFamily.frauncesBold,
    fontSize:       56,
    lineHeight:     60,
    letterSpacing:  -1.12,  // -0.02em × 56
  } satisfies TextStyle,
} as const;

// ── Alias para legibilidad en uso ─────────────────────────────────────────────
export const T = Typography;
