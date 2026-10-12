// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — SommelierCard
// Card hero grande (16:10) estilo "Selección del Sommelier" del diseño.
// Imagen full-bleed (expo-image), overlay degradado real, rating, nombre
// Fraunces, precio ember, botón + con gradiente, badges NBadge, favorito.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Heart, Star, GlassWater } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, NocturneColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Elevation }  from '../../theme/elevation';
import { Gradients } from '../../theme/gradients';
import { NBadge } from './NBadge';
import { usePressScale } from '../../hooks/usePressScale';
import type { ProductPublicDTO } from '../../types/api';

// Touchable con soporte de estilo animado (press scale sin reescribir el JSX)
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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
  const press = usePressScale(0.98);
  const price     = product.dynamicPrice ?? product.price;
  const hasDiscount = product.dynamicPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - price / product.price) * 100)
    : 0;

  const handleAdd = () => {
    if (!product.available) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onAdd(product);
  };

  const handleFav = () => {
    try { Haptics.selectionAsync(); } catch {}
    onFavorite?.(product);
  };

  return (
    <AnimatedTouchable
      style={[styles.card, press.animatedStyle]}
      onPress={() => onPress(product)}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
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
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <GlassWater size={40} color={Colors.outline} />
          </View>
        )}

        {/* Overlay real: imagen → canvas (55% inferior) */}
        <LinearGradient
          {...Gradients.heroOverlay}
          style={styles.heroOverlay}
          pointerEvents="none"
        />

        {/* Badge de característica (protagonista) */}
        {featureBadge && (
          <View style={styles.featureBadgePosition}>
            <NBadge label={featureBadge} tone="ember" solid />
          </View>
        )}

        {/* Badge descuento */}
        {hasDiscount && (
          <View style={styles.discountBadgePosition}>
            <NBadge label={`-${discountPct}%`} tone="error" solid />
          </View>
        )}

        {/* Agotado */}
        {!product.available && (
          <View style={styles.soldOutOverlay} pointerEvents="none">
            <Text style={styles.soldOutText}>Agotado</Text>
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
            style={[styles.addBtn, !product.available && styles.addBtnDisabled]}
            onPress={handleAdd}
            activeOpacity={0.8}
            disabled={!product.available}
            accessibilityLabel={
              product.available
                ? `Agregar ${product.name} al carrito`
                : `${product.name} no está disponible`
            }
          >
            {product.available && (
              <LinearGradient
                {...Gradients.emberCTA}
                style={styles.addBtnGradient}
                pointerEvents="none"
              />
            )}
            <Plus
              size={20}
              color={product.available ? Colors.onPrimary : Colors.onSurfaceVariant}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const CARD_WIDTH_RATIO = 10 / 16; // 16:10 → height = width * 10/16

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.xl,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     NocturneColors.borderSubtle,
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
  heroOverlay: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   '55%',
  },
  featureBadgePosition: {
    position: 'absolute',
    bottom:   Spacing.sm,
    right:    Spacing.sm,
  },
  discountBadgePosition: {
    position: 'absolute',
    top:      Spacing.sm,
    left:     Spacing.sm,
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlayDark,
    justifyContent:  'center',
    alignItems:      'center',
  },
  soldOutText: {
    ...Typography.labelSm,
    color:         Colors.onSurfaceVariant,
    textTransform: 'none' as const,
  },
  favBtn: {
    position:        'absolute',
    top:             Spacing.sm,
    right:           Spacing.sm,
    backgroundColor: Colors.overlayDark,
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
    ...Typography.priceLg,
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
    ...(Elevation.emberCTA as object),
  },
  addBtnGradient: {
    position:     'absolute',
    top:          0,
    left:         0,
    right:        0,
    bottom:       0,
    borderRadius: Radius.full,
  },
  addBtnDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    shadowOpacity:   0,
    elevation:       0,
  },
});
