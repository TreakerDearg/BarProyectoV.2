// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Design System: NEBULA EMBER (v3)
// Fuente de verdad de colores para el mobile client.
// Brasa cálida sobre noche: superficies ciruela oscura + ember primario.
// El oro queda reservado (VIP/LEGENDARY/sellos) — ya no es color de acción.
// Los aliases de compatibilidad (sección inferior) mantienen los
// componentes existentes compilando sin cambios.
// ─────────────────────────────────────────────────────────────────────────────

// ── NEBULA EMBER — Palette Roles ─────────────────────────────────────────────

export const NocturneColors = {
  // Backgrounds (escalera cálida)
  background:                '#131014',
  backgroundBase:            '#0C0A0D',  // canvas nivel 0
  surfaceDim:                '#131014',
  surfaceBright:             '#3E353A',
  surfaceContainerLowest:    '#0C0A0D',
  surfaceContainerLow:       '#1A1619',
  surfaceContainer:          '#201B1F',
  surfaceContainerHigh:      '#2A2328',
  surfaceContainerHighest:   '#352C31',

  // On-surface text (crema cálida)
  onSurface:                 '#F1E8DE',  // texto primario
  onSurfaceVariant:          '#D6C6B6',  // texto secundario / tabs inactivos
  inverseSurface:            '#F1E8DE',
  inverseOnSurface:          '#2A2328',

  // Borders / Outlines
  outline:                   '#9E8C7B',
  outlineVariant:            '#4D4139',

  // Primary — Ember (brasa): reemplaza al oro como color de acción
  primary:                   '#F08A5A',  // tab activo, acción principal
  onPrimary:                 '#2A0F04',
  primaryContainer:          '#D96A3B',  // botones CTA, bordes ember
  onPrimaryContainer:        '#3A1406',
  inversePrimary:            '#C8551F',
  surfaceTint:               '#F08A5A',

  // Secondary — Wine (vino): acento profundo para ruleta y detalles
  secondary:                 '#A03D52',
  onSecondary:               '#FFE3E8',
  secondaryContainer:        '#5E2130',
  onSecondaryContainer:      '#FFE3E8',

  // Tertiary — Gold reservado (LEGENDARY, fidelidad VIP, sellos premium)
  tertiary:                  '#F3BE59',
  onTertiary:                '#422C00',
  tertiaryContainer:         '#D4A340',
  onTertiaryContainer:       '#563A00',

  // Error
  error:                     '#FF7A6E',
  onError:                   '#690005',
  errorContainer:            '#8E1F2C',
  onErrorContainer:          '#FFDAD4',

  // Fixed variants (tonos ember claros)
  primaryFixed:              '#FFD9C2',
  primaryFixedDim:           '#F08A5A',
  onPrimaryFixed:            '#3D1A08',
  onPrimaryFixedVariant:     '#7A3E1E',

  // Semantic
  success:                   '#3FBF7F',
  successMuted:              'rgba(63, 191, 127, 0.15)',
  warning:                   '#E5A43D',
  warningMuted:              'rgba(229, 164, 61, 0.15)',
  info:                      '#5AB8E8',
  infoMuted:                 'rgba(90, 184, 232, 0.12)',

  // Bordes suaves (tokens v3 — eliminan literales rgba en componentes)
  borderSubtle:              'rgba(241, 232, 222, 0.08)',
  successBorder:             'rgba(63, 191, 127, 0.30)',
  warningBorder:             'rgba(229, 164, 61, 0.30)',
  errorBorder:               'rgba(255, 122, 110, 0.30)',
  infoBorder:                'rgba(90, 184, 232, 0.30)',

  // Ember glow family (acción: los viejos gold* ahora apuntan acá)
  emberGlow:                 'rgba(240, 138, 90, 0.25)',
  emberGlowStrong:           'rgba(217, 106, 59, 0.35)',
  emberBorder:               'rgba(217, 106, 59, 0.30)',
  emberMuted:                'rgba(240, 138, 90, 0.12)',
  emberSubtle:               'rgba(240, 138, 90, 0.06)',
  emberDeep:                 '#D2602A',  // extremo del gradiente emberCTA (ajustado para AA sobre onPrimary)

  // Wine tints (ruleta, detalles profundos)
  wineMuted:                 'rgba(160, 61, 82, 0.15)',
  wineGlow:                  'rgba(160, 61, 82, 0.25)',

  // VIP gold reservado (equivalente a los viejos gold* de Nocturne)
  vipGold:                   '#F3BE59',
  vipGoldDark:               '#D4A340',
  vipGoldGlow:               'rgba(243, 190, 89, 0.25)',
  vipGoldGlowStrong:         'rgba(212, 163, 64, 0.35)',
  vipGoldBorder:             'rgba(212, 163, 64, 0.30)',
  vipGoldMuted:              'rgba(243, 190, 89, 0.12)',
  vipGoldSubtle:             'rgba(243, 190, 89, 0.06)',

  // Escalera de fidelidad (VIP) — identidad de nivel, no colores de acción
  fidelityBronze:            '#CD7F32',
  fidelitySilver:            '#A8A9AD',
  fidelityPlatinum:          '#38BDF8',

  // Alias históricos de acción → ember (se mantienen las claves)
  goldGlow:                  'rgba(240, 138, 90, 0.25)',
  goldGlowStrong:            'rgba(217, 106, 59, 0.35)',
  goldBorder:                'rgba(217, 106, 59, 0.30)',
  goldMuted:                 'rgba(240, 138, 90, 0.12)',
  errorMuted:                'rgba(255, 122, 110, 0.15)',

  // FEAT-001 tokens
  surfaceElevated:           '#241F23',
  goldSubtle:                'rgba(240, 138, 90, 0.06)',
  cardBorderActive:          'rgba(240, 138, 90, 0.35)',
  overlayDark:               'rgba(12, 10, 13, 0.85)',
  badgeRed:                  '#FF7A6E',
  casinoBackground:          '#0C0A0D',
  casinoPurple:              'rgba(160, 61, 82, 0.10)',
  casinoGold:                'rgba(240, 138, 90, 0.15)',
};

// ── Aliases de compatibilidad ─────────────────────────────────────────────────
// Mantienen compilando todos los componentes existentes sin modificación.

export const Colors = {
  // ── Backgrounds ──────────────────────────────────────────────
  background:         NocturneColors.background,              // #131014
  card:               NocturneColors.surfaceContainer,        // #201B1F
  cardSecondary:      NocturneColors.surfaceContainerHigh,    // #2A2328
  cardHover:          NocturneColors.surfaceContainerHighest, // #352C31
  border:             NocturneColors.outlineVariant,          // #4D4139
  borderLight:        NocturneColors.outline,                 // #9E8C7B

  // ── Primary / Ember ───────────────────────────────────────────
  primary:            NocturneColors.primary,                 // #F08A5A
  primaryDark:        NocturneColors.primaryContainer,        // #D96A3B
  primaryLight:       NocturneColors.primaryFixed,            // #FFD9C2
  primaryMuted:       NocturneColors.emberMuted,              // rgba ember

  // ── Deal badges (mantenidos para componentes existentes) ──────
  dealRed:            NocturneColors.errorContainer,          // #8E1F2C
  dealRedMuted:       NocturneColors.errorMuted,
  dealGreen:          NocturneColors.success,                 // #3FBF7F
  dealGreenMuted:     NocturneColors.successMuted,

  // ── Tipografía ────────────────────────────────────────────────
  textPrimary:        NocturneColors.onSurface,               // #F1E8DE
  textSecondary:      NocturneColors.onSurfaceVariant,        // #D6C6B6
  textMuted:          NocturneColors.outline,                 // #9E8C7B
  textInverse:        NocturneColors.onPrimary,               // #2A0F04

  // ── Status del pedido (legacy: el sistema vivo es utils/status.ts) ──
  statusReceived:     NocturneColors.info,                    // #5AB8E8
  statusPreparing:    NocturneColors.warning,                 // #E5A43D
  statusReady:        NocturneColors.success,                 // #3FBF7F
  statusCompleted:    NocturneColors.outline,                 // #9E8C7B (neutro)
  statusCancelled:    NocturneColors.error,                   // #FF7A6E

  // ── Gold reservado (VIP/LEGENDARY/sellos premium) ─────────────
  gold:               NocturneColors.vipGold,                 // #F3BE59
  goldDark:           NocturneColors.vipGoldDark,             // #D4A340
  goldGlow:           NocturneColors.emberGlow,               // acción → ember
  goldBorder:         NocturneColors.emberBorder,             // acción → ember
  goldMuted:          NocturneColors.emberMuted,              // acción → ember

  surfaceContainerLow:    NocturneColors.surfaceContainerLow,
  surfaceContainer:       NocturneColors.surfaceContainer,
  surfaceContainerHigh:   NocturneColors.surfaceContainerHigh,
  surfaceContainerHighest: NocturneColors.surfaceContainerHighest,
  onSurface:          NocturneColors.onSurface,
  onSurfaceVariant:   NocturneColors.onSurfaceVariant,
  onPrimary:          NocturneColors.onPrimary,
  primaryContainer:   NocturneColors.primaryContainer,
  outline:            NocturneColors.outline,
  outlineVariant:     NocturneColors.outlineVariant,
  error:              NocturneColors.error,
  errorContainer:     NocturneColors.errorContainer,
  success:            NocturneColors.success,
  warning:            NocturneColors.warning,
  info:               NocturneColors.info,

  // FEAT-001 aliases
  surfaceElevated:    NocturneColors.surfaceElevated,
  goldSubtle:         NocturneColors.emberSubtle,             // acción → ember
  cardBorderActive:   NocturneColors.emberGlowStrong,         // acción → ember
  overlayDark:        NocturneColors.overlayDark,
  badgeRed:           NocturneColors.badgeRed,
  casinoBackground:   NocturneColors.casinoBackground,
  casinoPurple:       NocturneColors.casinoPurple,
  casinoGold:         NocturneColors.casinoGold,
  infoMuted:          NocturneColors.infoMuted,

  // ── NEBULA EMBER (v3) ─────────────────────────────────────────
  ember:              NocturneColors.primary,                 // #F08A5A
  emberDark:          NocturneColors.primaryContainer,        // #D96A3B
  emberDeep:          NocturneColors.emberDeep,               // #D2602A
  emberGlow:          NocturneColors.emberGlow,
  emberBorder:        NocturneColors.emberBorder,
  emberMuted:         NocturneColors.emberMuted,
  wine:               NocturneColors.secondary,               // #A03D52
  wineDeep:           NocturneColors.secondaryContainer,      // #5E2130
  wineMuted:          NocturneColors.wineMuted,
  wineGlow:           NocturneColors.wineGlow,
  vipGold:            NocturneColors.vipGold,                 // #F3BE59
  vipGoldDark:        NocturneColors.vipGoldDark,             // #D4A340
  vipGoldGlow:        NocturneColors.vipGoldGlow,
  vipGoldBorder:      NocturneColors.vipGoldBorder,
  vipGoldMuted:       NocturneColors.vipGoldMuted,
};
