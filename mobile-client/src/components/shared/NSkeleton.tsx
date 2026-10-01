// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — NSkeleton
// Shimmer animado para estados de carga.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors }  from '../../theme/colors';
import { Radius }  from '../../theme/spacing';

interface NSkeletonProps {
  width?:  number | string;
  height?: number;
  radius?: number;
  style?:  ViewStyle;
}

export function NSkeleton({
  width  = '100%',
  height = 16,
  radius = Radius.sm,
  style,
}: NSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as any, height, borderRadius: radius, opacity },
        style,
      ]}
    />
  );
}

// ── Skeleton compuesto para cards ────────────────────────────────────────────

export function SkeletonSommelierCard() {
  return (
    <View style={skelStyles.card}>
      <NSkeleton height={180} radius={0} />
      <View style={skelStyles.body}>
        <NSkeleton width={60}  height={10} />
        <NSkeleton width="80%" height={20} />
        <NSkeleton width="100%" height={12} />
        <NSkeleton width="60%"  height={12} />
      </View>
    </View>
  );
}

export function SkeletonCompactRow() {
  return (
    <View style={skelStyles.row}>
      <NSkeleton width={80} height={80} radius={Radius.md} />
      <View style={skelStyles.rowBody}>
        <NSkeleton width="70%" height={16} />
        <NSkeleton width="100%" height={12} />
        <NSkeleton width="40%" height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
});

const skelStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.xl,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.06)',
  },
  body: {
    padding: 16,
    gap:     8,
  },
  row: {
    flexDirection:   'row',
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.lg,
    padding:         12,
    gap:             12,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.06)',
  },
  rowBody: {
    flex: 1,
    gap:  8,
    justifyContent: 'center',
  },
});
