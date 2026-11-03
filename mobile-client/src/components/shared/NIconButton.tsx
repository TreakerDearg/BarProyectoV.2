// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — NIconButton
// Control icónico con área táctil cómoda y semántica consistente.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Colors, NocturneColors } from '../../theme/colors';
import { Radius, Spacing } from '../../theme/spacing';

type Tone = 'default' | 'primary' | 'danger';

interface NIconButtonProps {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  selected?: boolean;
  tone?: Tone;
  style?: ViewStyle;
  hint?: string;
}

export function NIconButton({
  label,
  onPress,
  children,
  disabled = false,
  selected,
  tone = 'default',
  style,
  hint,
}: NIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled, selected }}
      hitSlop={Spacing.sm}
      style={({ pressed }) => [
        styles.base,
        tone === 'primary' && styles.primary,
        tone === 'danger' && styles.danger,
        selected && styles.selected,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View pointerEvents="none">{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: 44, height: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: NocturneColors.surfaceContainerHigh, borderWidth: 1, borderColor: NocturneColors.borderSubtle },
  primary: { backgroundColor: Colors.primaryContainer, borderColor: Colors.primary },
  danger: { backgroundColor: Colors.errorContainer, borderColor: Colors.error },
  selected: { backgroundColor: NocturneColors.emberMuted, borderColor: Colors.primary },
  pressed: { opacity: 0.76, transform: [{ scale: 0.96 }] },
  disabled: { opacity: 0.45 },
});
