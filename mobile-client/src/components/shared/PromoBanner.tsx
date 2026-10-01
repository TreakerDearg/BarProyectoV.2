// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — PromoBanner
// Banner de promoción destacada en la HomeScreen.
// Imagen full-bleed con overlay degradado, badge, título, validez, CTA.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import { Sparkles, Clock } from 'lucide-react-native';
import { Colors }     from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Elevation }  from '../../theme/elevation';
import type { PromotionPublicDTO } from '../../types/api';

interface PromoBannerProps {
  promo:    PromotionPublicDTO;
  onPress?: () => void;
}

function formatBadge(promo: PromotionPublicDTO): string {
  switch (promo.type) {
    case '2X1':     return '2×1';
    case 'PERCENT': return `-${promo.value}%`;
    case 'FLAT':    return `-$${promo.value}`;
    default:        return 'OFERTA';
  }
}

function formatValidity(promo: PromotionPublicDTO): string | null {
  if (!promo.schedule) return null;
  const parts: string[] = [];
  if (promo.schedule.startTime && promo.schedule.endTime) {
    parts.push(`Hasta ${promo.schedule.endTime} hs`);
  }
  if (promo.schedule.endDate) {
    const d = new Date(promo.schedule.endDate);
    parts.push(`hasta ${d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`);
  }
  return parts.join(' · ') || null;
}

export function PromoBanner({ promo, onPress }: PromoBannerProps) {
  const badge    = formatBadge(promo);
  const validity = formatValidity(promo);

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={promo.name}
    >
      {/* Imagen de fondo (si hay un producto con imagen) */}
      {promo.applicableProducts?.[0]?.image ? (
        <Image
          source={{ uri: promo.applicableProducts[0].image }}
          style={styles.bgImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.bgPlaceholder} />
      )}

      {/* Overlay degradado */}
      <View style={styles.overlay} />

      {/* Contenido encima */}
      <View style={styles.content}>
        {/* Badge top-left */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Sparkles size={10} color={Colors.onPrimary} />
            <Text style={styles.badgeText}>ESPECIAL DE HOY</Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{badge}</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title} numberOfLines={2}>{promo.name}</Text>

        {/* Descripción corta */}
        {promo.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {promo.description}
          </Text>
        ) : null}

        {/* Footer: validity + CTA */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.ctaBtn} onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.ctaText}>Ver detalles</Text>
          </TouchableOpacity>

          {validity && (
            <View style={styles.validityRow}>
              <Clock size={12} color={Colors.onSurfaceVariant} />
              <Text style={styles.validityText}>{validity}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Fallback para cuando no hay promos del backend ────────────────────────────
export function PromoBannerFallback({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.banner} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.bgPlaceholder} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Sparkles size={10} color={Colors.onPrimary} />
            <Text style={styles.badgeText}>ESPECIAL DE HOY</Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>2×1</Text>
          </View>
        </View>
        <Text style={styles.title}>2×1 en Signature Cocktails</Text>
        <Text style={styles.description}>
          Válido hoy desde las 20:00 hs con tu consumo en barra.
        </Text>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.ctaBtn} onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.ctaText}>Ver detalles</Text>
          </TouchableOpacity>
          <View style={styles.validityRow}>
            <Clock size={12} color={Colors.onSurfaceVariant} />
            <Text style={styles.validityText}>Hasta 23:30 hs</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius:    Radius.xl,
    overflow:        'hidden',
    aspectRatio:     16 / 7,
    minHeight:       180,
    backgroundColor: Colors.surfaceContainerHigh,
    ...(Elevation.sheet as object),
  },
  bgImage: {
    position:  'absolute',
    inset:      0,
    width:     '100%',
    height:    '100%',
  },
  bgPlaceholder: {
    position:        'absolute',
    inset:            0,
    width:           '100%',
    height:          '100%',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  overlay: {
    position:        'absolute',
    inset:            0,
    // Degradado de abajo hacia arriba: opaco abajo, transparente arriba
    backgroundColor: 'rgba(16, 19, 26, 0.72)',
  },
  content: {
    flex:    1,
    padding: Spacing.md,
    justifyContent: 'flex-end',
    gap:     Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
    marginBottom:  Spacing.xs,
  },
  badge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    backgroundColor: Colors.primaryContainer,
    borderRadius:    Radius.xs,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },
  badgeText: { ...Typography.labelSm, color: Colors.onPrimary },
  discountBadge: {
    backgroundColor: Colors.errorContainer,
    borderRadius:    Radius.xs,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },
  discountText: { ...Typography.labelSm, color: Colors.error },
  title: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
  },
  description: {
    ...Typography.bodySm,
    color:      Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.smMd,
    marginTop:     Spacing.xs,
  },
  ctaBtn: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius:    Radius.md,
    paddingHorizontal: Spacing.smMd,
    paddingVertical:   8,
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.15)',
  },
  ctaText: { ...Typography.labelMd, color: Colors.onSurface },
  validityRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  validityText: { ...Typography.labelSm, color: Colors.onSurfaceVariant, textTransform: 'none' as const },
});
