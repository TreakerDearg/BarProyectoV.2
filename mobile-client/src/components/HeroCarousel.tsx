// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — HeroCarousel
// Carrusel horizontal con auto-avance y dots animados. Slides con imagen
// full-bleed (expo-image), overlay degradado real y benefit pill ember.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Gradients } from '../theme/gradients';
import { Motion } from '../theme/motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { NBadge } from './shared/NBadge';

export interface HeroSlide {
  id:        string;
  imageUri?: string;
  title:     string;
  subtitle?: string;
  /** Beneficio explícito de la promo ("2x1", "-20% OFF"). */
  benefit?:  string;
  /** Vigencia legible ("Vigente hasta 31/10"). */
  validUntil?: string;
  onPress?:  () => void;
}

interface HeroCarouselProps {
  slides:   HeroSlide[];
  height?:  number;
}

// ── Placeholder slide ─────────────────────────────────────────────────────────
function PlaceholderSlide({ height, width }: { height: number; width: number }) {
  return (
    <View style={[pStyles.placeholder, { width, height }]}>
      <LinearGradient
        {...Gradients.cardSheen}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={pStyles.placeholderContent}>
        <Text style={pStyles.placeholderTitle}>Nebula</Text>
        <Text style={pStyles.placeholderSub}>Bienvenido a la experiencia</Text>
      </View>
    </View>
  );
}

const pStyles = StyleSheet.create({
  placeholder: {
    backgroundColor: NocturneColors.surfaceContainerLowest,
    justifyContent:  'center',
    alignItems:      'center',
  },
  placeholderContent: { alignItems: 'center', gap: Spacing.sm },
  placeholderTitle: {
    ...Typography.displaySm,
    color: Colors.primary,
  },
  placeholderSub: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
});

// ── HeroCarousel ──────────────────────────────────────────────────────────────
export function HeroCarousel({ slides, height = Spacing.heroCarouselHeight }: HeroCarouselProps) {
  const flatListRef = useRef<FlatList<HeroSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const [carouselWidth, setCarouselWidth] = useState(windowWidth);
  const reduceMotion = useReducedMotion();

  // Animated opacity values for each dot
  const dotAnims = useRef(
    (slides.length > 0 ? slides : [{ id: '__placeholder' }]).map(
      (_, i) => new Animated.Value(i === 0 ? 1 : 0.35)
    )
  ).current;

  const updateDots = (index: number) => {
    dotAnims.forEach((anim, i) => {
      if (reduceMotion) {
        anim.setValue(i === index ? 1 : 0.35);
        return;
      }
      Animated.timing(anim, {
        toValue:         i === index ? 1 : 0.35,
        duration:        Motion.base,
        useNativeDriver: true,
      }).start();
    });
  };

  // Auto-advance every 3200ms
  useEffect(() => {
    if (slides.length <= 1 || reduceMotion) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % slides.length;
        flatListRef.current?.scrollToOffset({
          offset:   next * carouselWidth,
          animated: true,
        });
        updateDots(next);
        return next;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [slides.length, carouselWidth, reduceMotion]);

  // If no slides, render a single placeholder
  if (slides.length === 0) {
    return (
      <View style={{ height }} onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}>
        <PlaceholderSlide height={height} width={carouselWidth} />
      </View>
    );
  }

  return (
    <View
      style={{ height, overflow: 'hidden', borderRadius: Radius.xl }}
      onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}
    >
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        snapToInterval={carouselWidth}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / carouselWidth);
          setCurrentIndex(newIndex);
          updateDots(newIndex);
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={item.onPress ? 0.85 : 1}
            onPress={item.onPress}
            accessibilityRole={item.onPress ? "button" : "image"}
            accessibilityLabel={item.onPress ? `Ver promoción: ${item.title}` : item.title}
            accessibilityHint={item.onPress ? 'Abre la carta con esta promoción' : undefined}
            style={{ width: carouselWidth, height }}
          >
            {item.imageUri ? (
              <Image
                source={{ uri: item.imageUri }}
                style={{ width: carouselWidth, height }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
            ) : (
              <View style={{ width: carouselWidth, height, backgroundColor: NocturneColors.surfaceContainerLowest }} />
            )}
            {/* Overlay real: transparente → canvas (55% inferior) */}
            <LinearGradient
              {...Gradients.heroOverlay}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            {/* Beneficio de la promo */}
            {item.benefit ? (
              <View style={styles.benefitPosition}>
                <NBadge label={item.benefit} tone="ember" solid />
              </View>
            ) : null}
            {/* Text */}
            <View style={styles.slideTextWrap}>
              <Text style={styles.slideTitle} numberOfLines={2}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={styles.slideSub} numberOfLines={2}>{item.subtitle}</Text>
              ) : null}
              {item.validUntil ? (
                <Text style={styles.validText}>{item.validUntil}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Dot indicators */}
      {slides.length > 1 && (
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: dotAnims[i],
                  width:   i === currentIndex ? 20 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slideTextWrap: {
    position:          'absolute',
    bottom:            Spacing.md,
    left:              Spacing.md,
    right:             Spacing.md,
    gap:               4,
  },
  slideTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
  },
  slideSub: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  dotsRow: {
    position:       'absolute',
    bottom:         Spacing.sm,
    alignSelf:      'center',
    flexDirection:  'row',
    gap:            5,
    alignItems:     'center',
  },
  dot: {
    height:          6,
    borderRadius:    3,
    backgroundColor: Colors.primary,
  },
  benefitPosition: {
    position: 'absolute',
    top:      Spacing.smMd,
    left:     Spacing.smMd,
  },
  validText: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
});

export default HeroCarousel;
