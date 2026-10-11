// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — NButton
// Botón del sistema NEBULA EMBER (v3).
// Variantes: primary (gradiente ember), ghost (borde ember), text, danger.
// Micro-interacción: press scale con spring (usePressScale).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Animated,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Colors, NocturneColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Elevation }  from '../../theme/elevation';
import { Gradients }  from '../../theme/gradients';
import { usePressScale } from '../../hooks/usePressScale';

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
  const press = usePressScale(0.97);
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onPress();
  };

  const labelStyle: TextStyle[] = [
    styles.label,
    styles[`label_${variant}` as keyof typeof styles] as TextStyle,
    size === 'sm' ? Typography.labelMd : Typography.labelLg,
  ];

  return (
    <Animated.View
      style={[
        styles.shell,
        { height: HEIGHT[size] },
        fullWidth && styles.fullWidth,
        variant === 'primary' && styles.shellPrimary,
        variant === 'primary' && (Elevation.emberCTA as ViewStyle),
        isDisabled && styles.disabled,
        style,
        press.animatedStyle,
      ]}
    >
      <TouchableOpacity
        style={[styles.touch, styles[variant], { paddingHorizontal: H_PAD[size] }]}
        onPress={handlePress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={0.9}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        {variant === 'primary' && (
          <LinearGradient
            colors={Gradients.emberCTA.colors}
            start={Gradients.emberCTA.start}
            end={Gradients.emberCTA.end}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}

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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ── Capa exterior: sombra + transform (sin overflow para no comerse el glow) ──
  shell: {
    borderRadius: Radius.lg,
  },
  shellPrimary: {
    backgroundColor: Colors.primaryContainer,
  },
  fullWidth: {
    alignSelf: 'stretch' as const,
  },
  // ── Touchable interno: clipea el gradiente contra el radio ──
  touch: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   Radius.lg,
    overflow:       'hidden',
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

  // ── Variantes (el primary pinta el gradiente encima) ──────────
  primary: {},
  ghost: {
    backgroundColor: 'transparent',
    borderWidth:     1,
    borderColor:     NocturneColors.emberBorder,
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
  label_primary: { color: Colors.onPrimary },                 // #2A0F04 sobre ember
  label_ghost:   { color: Colors.primary },                   // #F08A5A
  label_text:    { color: Colors.onSurface },                 // #F1E8DE
  label_danger:  { color: NocturneColors.onErrorContainer },  // #FFDAD4
});
