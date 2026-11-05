// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — ImmersiveHero
// Hero full-bleed que ocupa ~52% del viewport. Reemplaza al viejo hero de
// 230px de la HomeScreen. Imagen dinámica si existe, gradiente ember como
// fallback. Overlay nightWash (arriba) + heroOverlay (abajo). CTA ember.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin } from 'lucide-react-native';

import { Colors, NocturneColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { Gradients } from '../../theme/gradients';
import { NButton } from './NButton';

interface ImmersiveHeroProps {
  /** URI de imagen de producto/promo. Si no hay, usa gradiente ember. */
  imageUri?:    string;
  /** Saludo principal: "Buenas noches, Juan" */
  greeting:     string;
  /** Subtítulo: "¿Qué te gustaría disfrutar hoy?" */
  sub:          string;
  /** Etiqueta de mesa activa, p.ej. "Mesa #4 · Zona VIP". Opcional. */
  mesaLabel?:   string;
  onCTAPress:   () => void;
  /** Animated style para la entrada stagger desde HomeScreen */
  animStyle?:   ViewStyle | object;
  style?:       ViewStyle;
}

export function ImmersiveHero({
  imageUri,
  greeting,
  sub,
  mesaLabel,
  onCTAPress,
  animStyle,
  style,
}: ImmersiveHeroProps) {
  const { height: screenHeight } = useWindowDimensions();
  const heroHeight = Math.round(screenHeight * 0.52);

  return (
    <Animated.View
      style={[
        styles.container,
        { height: heroHeight },
        animStyle,
        style,
      ]}
    >
      {/* ── Fondo: imagen o gradiente fallback ────────────────── */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.fill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
      ) : (
        <LinearGradient
          colors={[NocturneColors.emberMuted, NocturneColors.background]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fill}
        />
      )}

      {/* ── Night wash arriba (canvas → transparente, 40% alto) ─ */}
      <LinearGradient
        colors={Gradients.nightWash.colors as any}
        start={Gradients.nightWash.start}
        end={Gradients.nightWash.end}
        style={styles.washTop}
        pointerEvents="none"
      />

      {/* ── Hero overlay abajo (transparente → canvas, 60% alto) ─ */}
      <LinearGradient
        colors={Gradients.heroOverlay.colors as any}
        locations={Gradients.heroOverlay.locations as any}
        start={Gradients.heroOverlay.start}
        end={Gradients.heroOverlay.end}
        style={styles.overlayBottom}
        pointerEvents="none"
      />

      {/* ── Contenido (anclado al fondo) ──────────────────────── */}
      <View style={styles.content}>
        {/* Chip de mesa — solo display */}
        {mesaLabel && (
          <View style={styles.mesaChip}>
            <MapPin size={11} color={Colors.primary} />
            <Text style={styles.mesaChipText} numberOfLines={1}>
              {mesaLabel}
            </Text>
          </View>
        )}

        {/* Saludo */}
        <Text style={styles.greeting} numberOfLines={2}>
          {greeting}
        </Text>

        {/* Subtítulo */}
        <Text style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <NButton
            label="Explorar la carta →"
            onPress={onCTAPress}
            variant="primary"
            size="md"
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // overflow: hidden para clipar imagen + gradientes contra el radio inferior
    overflow:              'hidden',
    backgroundColor:       NocturneColors.surfaceContainerLowest,
    // Sin radio superior (sangra al borde de pantalla)
    borderBottomLeftRadius:  Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  fill: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    bottom:   0,
  },
  washTop: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    height:   '40%',
  },
  overlayBottom: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   '60%',
  },
  content: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    paddingHorizontal: Spacing.gutter,
    paddingBottom:     Spacing.xl,
    gap:               Spacing.sm,
  },
  mesaChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    alignSelf:         'flex-start',
    backgroundColor:   NocturneColors.emberMuted,
    borderWidth:       1,
    borderColor:       NocturneColors.emberBorder,
    borderRadius:      Radius.full,
    paddingHorizontal: 10,
    paddingVertical:   4,
    marginBottom:      2,
  },
  mesaChipText: {
    ...Typography.labelMd,
    color:         Colors.primary,
    textTransform: 'none' as const,
    letterSpacing: 0,
  },
  greeting: {
    ...Typography.displayLg,
    color: Colors.onSurface,
  },
  sub: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
  },
  ctaWrap: {
    marginTop:  Spacing.sm,
    alignSelf:  'flex-start',
  },
});

export default ImmersiveHero;
