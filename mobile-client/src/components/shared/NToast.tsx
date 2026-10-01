// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — NToast
// Toast ligero con auto-dismiss. Variantes: success, error, info.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';
import { Colors }     from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

type ToastVariant = 'success' | 'error' | 'info';

interface NToastProps {
  visible:  boolean;
  message:  string;
  variant?: ToastVariant;
  duration?: number;       // ms antes de auto-dismiss
  onHide?:  () => void;
}

const VARIANT_CONFIG: Record<ToastVariant, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg:     'rgba(52, 185, 100, 0.12)',
    border: 'rgba(52, 185, 100, 0.30)',
    icon:   <CheckCircle2 size={16} color={Colors.success} />,
  },
  error: {
    bg:     'rgba(255, 180, 171, 0.10)',
    border: 'rgba(255, 180, 171, 0.30)',
    icon:   <AlertCircle size={16} color={Colors.error} />,
  },
  info: {
    bg:     'rgba(56, 189, 248, 0.10)',
    border: 'rgba(56, 189, 248, 0.25)',
    icon:   <Info size={16} color={Colors.info} />,
  },
};

export function NToast({
  visible,
  message,
  variant  = 'info',
  duration = 2800,
  onHide,
}: NToastProps) {
  const opacity  = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      if (timerRef.current) clearTimeout(timerRef.current);

      Animated.parallel([
        Animated.timing(opacity,     { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY,  { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();

      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -16, duration: 200, useNativeDriver: true }),
        ]).start(() => onHide?.());
      }, duration);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible]);

  if (!visible) return null;

  const cfg = VARIANT_CONFIG[variant];

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: cfg.bg, borderColor: cfg.border, opacity, transform: [{ translateY }] },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      {cfg.icon}
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position:        'absolute',
    top:             Spacing.gutter,
    left:            Spacing.gutter,
    right:           Spacing.gutter,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.smMd,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    zIndex:          999,
  },
  message: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    flex:  1,
  },
});
