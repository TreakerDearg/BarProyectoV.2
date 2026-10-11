// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — FloatingCartBar (NEBULA EMBER v3)
// Pill flotante del carrito: gradiente ember, cantidad + total + «Ver pedido».
// Visible solo cuando hay items. Haptic + press scale.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors }    from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation } from '../theme/elevation';
import { Gradients } from '../theme/gradients';
import { usePressScale } from '../hooks/usePressScale';
import { useCartStore } from '../stores/useCartStore';

interface FloatingCartBarProps {
  onPress: () => void;
}

export function FloatingCartBar({ onPress }: FloatingCartBarProps) {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const press = usePressScale(0.97);

  if (totalItems === 0) return null;

  const handlePress = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    onPress();
  };

  return (
    <Animated.View style={[styles.shell, press.animatedStyle]}>
      <TouchableOpacity
        style={styles.bar}
        onPress={handlePress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Ver pedido: ${totalItems} ${totalItems === 1 ? 'ítem' : 'ítems'}, total $${totalPrice.toLocaleString('es-AR')}`}
      >
        <LinearGradient
          colors={Gradients.emberCTA.colors}
          start={Gradients.emberCTA.start}
          end={Gradients.emberCTA.end}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Cantidad de ítems */}
        <View style={styles.badgeWrap}>
          <ShoppingBag size={18} color={Colors.onPrimary} />
          <Text style={styles.itemsText}>
            {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
          </Text>
        </View>

        {/* Total del pedido */}
        <Text style={styles.priceText}>
          ${totalPrice.toLocaleString('es-AR')}
        </Text>

        {/* CTA derecho */}
        <View style={styles.ctaRight}>
          <Text style={styles.ctaText}>Ver pedido</Text>
          <ChevronRight size={16} color={Colors.onPrimary} strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ── Capa exterior: sombra + transform (sin overflow para conservar el glow) ──
  shell: {
    borderRadius:    Radius.full,
    backgroundColor: Colors.primaryContainer,
    ...(Elevation.emberCTA as ViewStyle),
  },
  // ── Touchable interno: clipea el gradiente contra el radio ──
  bar: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    borderRadius:    Radius.full,
    overflow:        'hidden',
    gap:             Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.smMd,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  itemsText: {
    ...Typography.labelLg,
    color:         Colors.onPrimary,
    textTransform: 'none' as const,
  },
  priceText: {
    ...Typography.priceLg,
    color: Colors.onPrimary,
  },
  ctaRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           2,
  },
  ctaText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
  },
});
