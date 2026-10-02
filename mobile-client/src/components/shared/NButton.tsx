// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — NButton
// Botón del sistema Nocturne Gastronomy.
// Variantes: primary (gold), ghost (borde gold), text (transparente)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors }     from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Elevation }  from '../../theme/elevation';

type Variant = 'primary' | 'ghost' | 'text' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface NButtonProps {
  label:      string;
  onPress:    () => void;
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  disabled?:  boolean;
  fullWidth?: boolean;
  icon?:      React.ReactNode;
  style?:     ViewStyle;
}

const HEIGHT: Record<Size, number> = { sm: 40, md: 48, lg: 52 };
const H_PAD: Record<Size, number>  = { sm: 16, md: 20, lg: 24 };

export function NButton({
  label,
  onPress,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
}: NButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onPress();
  };

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[variant],
    { height: HEIGHT[size], paddingHorizontal: H_PAD[size] },
    fullWidth ? { alignSelf: 'stretch' as const } : undefined,
    (disabled || loading) ? styles.disabled : undefined,
    variant === 'primary' ? (Elevation.goldCTA as ViewStyle) : undefined,
    style ?? undefined,
  ].filter(Boolean) as ViewStyle[];

  const labelStyle: TextStyle[] = [
    styles.label,
    styles[`label_${variant}` as keyof typeof styles] as TextStyle,
    size === 'sm' ? Typography.labelMd : Typography.labelLg,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      activeOpacity={0.80}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.onPrimary : Colors.primary}
        />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={labelStyle}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius:    Radius.lg,
    alignItems:      'center',
    justifyContent:  'center',
    flexDirection:   'row',
  },
  inner: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems:     'center',
  },

  // ── Variantes ─────────────────────────────────────────────────
  primary: {
    backgroundColor: Colors.primaryContainer,  // #d4a340
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  text: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.errorContainer,
    borderWidth:     1,
    borderColor:     Colors.error,
  },
  disabled: {
    opacity: 0.45,
  },

  // ── Labels ────────────────────────────────────────────────────
  label: {},
  label_primary: { color: Colors.onPrimary },      // #412d00
  label_ghost:   { color: Colors.primary },         // #f3be59
  label_text:    { color: Colors.onSurface },       // #e0e2ec
  label_danger:  { color: Colors.error },           // #ffb4ab
});
