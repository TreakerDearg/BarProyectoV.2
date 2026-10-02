// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — SommelierCard
// Card hero grande (16:10) estilo "Selección del Sommelier" del diseño.
// Imagen full-bleed, overlay degradado, rating, nombre Outfit, precio gold,
// botón + circular, badge de característica, ícono de favorito.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Plus, Heart, Star, GlassWater } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors }     from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Elevation }  from '../../theme/elevation';
import type { ProductPublicDTO } from '../../types/api';

interface SommelierCardProps {
  product:      ProductPublicDTO;
  isFavorite?:  boolean;
  onAdd:        (product: ProductPublicDTO) => void;
  onPress:      (product: ProductPublicDTO) => void;
  onFavorite?:  (product: ProductPublicDTO) => void;
  /** Badge de característica: "Ahumado en mesa", "Recomendado", etc. */
  featureBadge?: string;
  /** Rating mostrado (1-5) */
  rating?: number;
}

export function SommelierCard({
  product,
  isFavorite = false,
  onAdd,
  onPress,
  onFavorite,
  featureBadge,
  rating,
}: SommelierCardProps) {
  const price     = product.dynamicPrice ?? product.price;
  const hasDiscount = product.dynamicPrice < product.price;

  const handleAdd = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onAdd(product);
  };

  const handleFav = () => {
    try { Haptics.selectionAsync(); } catch {}
    onFavorite?.(product);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(product)}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${product.name}`}
    >
      {/* ── Imagen 16:10 ──────────────────────────────────────── */}
      <View style={styles.imageWrap}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <GlassWater size={40} color={Colors.outline} />
          </View>
        )}

        {/* Simulated gradient: solid base + fade layer */}
        <View style={styles.gradientSolid} />
        <View style={styles.gradientFade} />

        {/* Badge "COCKTAIL ESTRELLA" o similar */}
        {featureBadge && (
          <View style={styles.featureBadge}>
            <Text style={styles.featureBadgeText}>{featureBadge}</Text>
          </View>
        )}

        {/* Badge descuento */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>OFERTA</Text>
          </View>
        )}

        {/* Favorito */}
        {onFavorite && (
          <TouchableOpacity
            style={styles.favBtn}
            onPress={handleFav}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart
              size={18}
              color={isFavorite ? Colors.error : Colors.onSurface}
              fill={isFavorite ? Colors.error : 'transparent'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Info ──────────────────────────────────────────────── */}
      <View style={styles.info}>
        {/* Rating */}
        {rating !== undefined && (
          <View style={styles.ratingRow}>
            <Star size={12} color={Colors.primary} fill={Colors.primary} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}

        {/* Nombre */}
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* Descripción */}
        {product.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {product.description}
          </Text>
        ) : null}

        {/* Footer: precio + add */}
        <View style={styles.footer}>
          <View style={styles.priceCol}>
            <Text style={styles.price}>
              ${price.toLocaleString('es-AR')}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                ${product.price.toLocaleString('es-AR')}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAdd}
            activeOpacity={0.8}
            accessibilityLabel={`Agregar ${product.name} al carrito`}
          >
            <Plus size={20} color={Colors.onPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const CARD_WIDTH_RATIO = 10 / 16; // 16:10 → height = width * 10/16

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.xl,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     'rgba(224, 226, 236, 0.08)',
    ...(Elevation.card as object),
  },

  // ── Imagen ──────────────────────────────────────────────────────
  imageWrap: {
    width:           '100%',
    aspectRatio:     16 / 10,
    backgroundColor: Colors.surfaceContainerHigh,
    position:        'relative',
  },
  image: {
    width:  '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width:           '100%',
    height:          '100%',
    justifyContent:  'center',
    alignItems:      'center',
  },
  gradientSolid: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          '40%',
    backgroundColor: '#1d2027',
  },
  gradientFade: {
    position:        'absolute',
    bottom:          '20%' as any,
    left:            0,
    right:           0,
    height:          '30%',
    backgroundColor: 'rgba(29, 32, 39, 0.75)',
  },
  featureBadge: {
    position:        'absolute',
    bottom:          Spacing.sm,
    right:           Spacing.sm,
    backgroundColor: 'rgba(16, 19, 26, 0.85)',
    borderRadius:    Radius.xs,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  featureBadgeText: {
    ...Typography.labelSm,
    color: Colors.primary,
  },
  discountBadge: {
    position:        'absolute',
    top:             Spacing.sm,
    left:            Spacing.sm,
    backgroundColor: Colors.errorContainer,
    borderRadius:    Radius.xs,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },
  discountText: {
    ...Typography.labelSm,
    color: Colors.error,
  },
  favBtn: {
    position:        'absolute',
    top:             Spacing.sm,
    right:           Spacing.sm,
    backgroundColor: 'rgba(16, 19, 26, 0.70)',
    borderRadius:    Radius.full,
    padding:         8,
  },

  // ── Info ────────────────────────────────────────────────────────
  info: {
    padding: Spacing.md,
    gap:     Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  ratingText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
  name: {
    ...Typography.displaySm,
    color: Colors.onSurface,
  },
  description: {
    ...Typography.bodySm,
    color:      Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  footer: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginTop:      Spacing.xs,
  },
  priceCol: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap:           Spacing.xs,
  },
  price: {
    ...Typography.price,
    color: Colors.primary,
  },
  originalPrice: {
    ...Typography.bodySm,
    color:              Colors.outline,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    width:           44,
    height:          44,
    borderRadius:    Radius.full,
    backgroundColor: Colors.primaryContainer,
    justifyContent:  'center',
    alignItems:      'center',
    ...(Elevation.goldCTA as object),
  },
});
