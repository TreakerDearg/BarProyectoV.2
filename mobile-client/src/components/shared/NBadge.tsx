// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — NBadge
// Píldora de badge unificada (descuentos, tags, rarities, sellos premium).
// Tones: ember (acción, default), wine, gold (reservado VIP), semánticos.
// `solid` invierte a fill pleno para badges protagonistas (ej. -20%).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { Colors, NocturneColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

export type BadgeTone =
  | 'ember'
  | 'wine'
  | 'gold'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

type BadgeSize = 'sm' | 'md';

interface NBadgeProps {
  label: string;
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: React.ReactNode;
  /** Fill pleno (protagonista) en vez de tint suave */
  solid?: boolean;
  style?: StyleProp<ViewStyle>;
}

// ── Tonos: tint suave (bg + border + texto) ──────────────────────────────────
const TONE: Record<BadgeTone, { bg: string; border: string; text: string }> = {
  ember:   { bg: NocturneColors.emberMuted,   border: NocturneColors.emberBorder,   text: Colors.primary },
  wine:    { bg: NocturneColors.wineMuted,    border: NocturneColors.wineGlow,      text: NocturneColors.onSecondaryContainer },
  gold:    { bg: NocturneColors.vipGoldMuted, border: NocturneColors.vipGoldBorder, text: NocturneColors.vipGold },
  success: { bg: NocturneColors.successMuted, border: NocturneColors.successBorder, text: Colors.success },
  warning: { bg: NocturneColors.warningMuted, border: NocturneColors.warningBorder, text: Colors.warning },
  error:   { bg: NocturneColors.errorMuted,   border: NocturneColors.errorBorder,   text: Colors.error },
  info:    { bg: NocturneColors.infoMuted,    border: NocturneColors.infoBorder,    text: Colors.info },
  neutral: { bg: NocturneColors.surfaceContainerHigh, border: NocturneColors.borderSubtle, text: Colors.onSurfaceVariant },
};

// ── Tonos solid: fill pleno + par de texto con contraste AA ──────────────────
const TONE_SOLID: Record<BadgeTone, { bg: string; text: string }> = {
  ember:   { bg: Colors.primaryContainer,             text: Colors.onPrimary },
  wine:    { bg: Colors.wine,                         text: NocturneColors.onSecondaryContainer },
  gold:    { bg: NocturneColors.vipGold,              text: NocturneColors.onTertiary },
  success: { bg: Colors.success,                      text: Colors.background },
  warning: { bg: Colors.warning,                      text: Colors.background },
  error:   { bg: Colors.errorContainer,               text: NocturneColors.onErrorContainer },
  info:    { bg: Colors.info,                         text: Colors.background },
  neutral: { bg: NocturneColors.surfaceContainerHighest, text: Colors.onSurface },
};

export function NBadge({
  label,
  tone   = 'ember',
  size   = 'sm',
  icon,
  solid  = false,
  style,
}: NBadgeProps) {
  const tint  = TONE[tone];
  const fill  = TONE_SOLID[tone];
  const isMd  = size === 'md';

  return (
    <View
      style={[
        styles.badge,
        isMd && styles.badgeMd,
        solid
          ? { backgroundColor: fill.bg }
          : { backgroundColor: tint.bg, borderWidth: 1, borderColor: tint.border },
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          isMd ? Typography.labelLg : Typography.labelSm,
          styles.label,
          { color: solid ? fill.text : tint.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection:     'row',
    alignItems:        'center',
    alignSelf:         'flex-start',
    gap:               4,
    borderRadius:      Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical:   3,
  },
  badgeMd: {
    paddingHorizontal: Spacing.smMd,
    paddingVertical:   Spacing.xs + 1,
  },
  label: {
    textTransform: 'none' as const,
  },
});
