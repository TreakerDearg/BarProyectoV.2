// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Design System: Nocturne Gastronomy
// Fuente de verdad de colores para el mobile client.
// Los aliases de compatibilidad (section inferior) mantienen los
// componentes existentes compilando sin cambios.
// ─────────────────────────────────────────────────────────────────────────────

// ── Nocturne Gastronomy — Palette Roles ──────────────────────────────────────

export const NocturneColors = {
  // Backgrounds
  background:                '#10131a',
  backgroundBase:            '#08090C',  // canvas nivel 0
  surfaceDim:                '#10131a',
  surfaceBright:             '#363941',
  surfaceContainerLowest:    '#0b0e15',
  surfaceContainerLow:       '#191c23',
  surfaceContainer:          '#1d2027',
  surfaceContainerHigh:      '#272a31',
  surfaceContainerHighest:   '#32353c',

  // On-surface text
  onSurface:                 '#e0e2ec',  // texto primario
  onSurfaceVariant:          '#d3c5b1',  // texto secundario / tabs inactivos
  inverseSurface:            '#e0e2ec',
  inverseOnSurface:          '#2d3038',

  // Borders / Outlines
  outline:                   '#9b8f7d',
  outlineVariant:            '#4f4536',

  // Primary — Oro gastronómico
  primary:                   '#f3be59',  // tab activo, acción principal
  onPrimary:                 '#412d00',
  primaryContainer:          '#d4a340',  // botones CTA, bordes gold
  onPrimaryContainer:        '#543b00',
  inversePrimary:            '#7c5800',
  surfaceTint:               '#f3be59',

  // Secondary
  secondary:                 '#edc05e',
  onSecondary:               '#3f2e00',
  secondaryContainer:        '#856300',
  onSecondaryContainer:      '#ffe5b4',

  // Tertiary
  tertiary:                  '#f2be64',
  onTertiary:                '#422c00',
  tertiaryContainer:         '#d4a34c',
  onTertiaryContainer:       '#563a00',

  // Error
  error:                     '#ffb4ab',
  onError:                   '#690005',
  errorContainer:            '#93000a',
  onErrorContainer:          '#ffdad6',

  // Fixed variants
  primaryFixed:              '#ffdea6',
  primaryFixedDim:           '#f3be59',
  onPrimaryFixed:            '#271900',
  onPrimaryFixedVariant:     '#5e4200',

  // Semantic
  success:                   '#34B964',
  successMuted:              'rgba(52, 185, 100, 0.15)',
  warning:                   '#E07828',
  warningMuted:              'rgba(224, 120, 40, 0.15)',
  info:                      '#38BDF8',
  infoMuted:                 'rgba(56,189,248,0.12)',

  // Surface tint / glow effects
  goldGlow:                  'rgba(243, 190, 89, 0.25)',
  goldGlowStrong:            'rgba(212, 163, 64, 0.35)',
  goldBorder:                'rgba(212, 163, 64, 0.30)',
  goldMuted:                 'rgba(243, 190, 89, 0.12)',
  errorMuted:                'rgba(255, 180, 171, 0.15)',

  // FEAT-001 new tokens
  surfaceElevated:           '#1e2128',
  goldSubtle:                'rgba(243,190,89,0.06)',
  cardBorderActive:          'rgba(243,190,89,0.35)',
  overlayDark:               'rgba(8,9,12,0.85)',
  badgeRed:                  '#ef4444',
  casinoBackground:          '#0a0a12',
  casinoPurple:              'rgba(168,85,247,0.08)',
  casinoGold:                'rgba(212,163,64,0.15)',
};

// ── Aliases de compatibilidad ─────────────────────────────────────────────────
// Mantienen compilando todos los componentes existentes sin modificación.

export const Colors = {
  // ── Backgrounds ──────────────────────────────────────────────
  background:         NocturneColors.background,              // #10131a
  card:               NocturneColors.surfaceContainer,        // #1d2027
  cardSecondary:      NocturneColors.surfaceContainerHigh,    // #272a31
  cardHover:          NocturneColors.surfaceContainerHighest, // #32353c
  border:             NocturneColors.outlineVariant,          // #4f4536
  borderLight:        NocturneColors.outline,                 // #9b8f7d

  // ── Primary / Gold ────────────────────────────────────────────
  primary:            NocturneColors.primary,                 // #f3be59
  primaryDark:        NocturneColors.primaryContainer,        // #d4a340
  primaryLight:       NocturneColors.primaryFixed,            // #ffdea6
  primaryMuted:       NocturneColors.goldMuted,               // rgba gold

  // ── Deal badges (mantenidos para componentes existentes) ──────
  dealRed:            NocturneColors.errorContainer,          // #93000a
  dealRedMuted:       NocturneColors.errorMuted,
  dealGreen:          NocturneColors.success,                 // #34B964
  dealGreenMuted:     NocturneColors.successMuted,

  // ── Tipografía ────────────────────────────────────────────────
  textPrimary:        NocturneColors.onSurface,               // #e0e2ec
  textSecondary:      NocturneColors.onSurfaceVariant,        // #d3c5b1
  textMuted:          NocturneColors.outline,                 // #9b8f7d
  textInverse:        NocturneColors.onPrimary,               // #412d00

  // ── Status del pedido ─────────────────────────────────────────
  statusReceived:     NocturneColors.info,                    // #38BDF8
  statusPreparing:    NocturneColors.warning,                 // #E07828
  statusReady:        NocturneColors.success,                 // #34B964
  statusCompleted:    NocturneColors.secondary,               // #edc05e
  statusCancelled:    NocturneColors.error,                   // #ffb4ab

  // ── Extras convenientes (nuevos, sin romper nada) ─────────────
  gold:               NocturneColors.primary,
  goldDark:           NocturneColors.primaryContainer,
  goldGlow:           NocturneColors.goldGlow,
  goldBorder:         NocturneColors.goldBorder,
  goldMuted:          NocturneColors.goldMuted,
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
  goldSubtle:         NocturneColors.goldSubtle,
  cardBorderActive:   NocturneColors.cardBorderActive,
  overlayDark:        NocturneColors.overlayDark,
  badgeRed:           NocturneColors.badgeRed,
  casinoBackground:   NocturneColors.casinoBackground,
  casinoPurple:       NocturneColors.casinoPurple,
  casinoGold:         NocturneColors.casinoGold,
  infoMuted:          NocturneColors.infoMuted,
};
