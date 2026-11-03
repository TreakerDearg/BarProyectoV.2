// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — RevealExplosion (v4 — Reanimated)
// Partículas con forma por rareza. Worklets nativos, 0 re-renders de JS.
//
// COMMON:    círculos grises   (10)
// RARE:      diamantes azules  (16)
// EPIC:      chispas vino      (20)
// LEGENDARY: polvo dorado + destellos blancos + flash inicial (36)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { Colors, NocturneColors } from '../../theme/colors';
import { Radius } from '../../theme/spacing';

const { width: SW, height: SH } = Dimensions.get('window');

const RARITY_CONFIG = {
  COMMON:    { count: 10, color: Colors.outline,          type: 'circle'   as const },
  RARE:      { count: 16, color: Colors.info,             type: 'diamond'  as const },
  EPIC:      { count: 20, color: Colors.wine,             type: 'spark'    as const },
  LEGENDARY: { count: 36, color: NocturneColors.vipGold,  type: 'stardust' as const },
};

interface Props {
  rarity:      string;
  visible:     boolean;
  originY?:    number;
  onComplete?: () => void;
}

interface ParticleData {
  endX:     number;
  endY:     number;
  angle:    number;
  duration: number;
  delay:    number;
  isWhite:  boolean;
}

// ── Partícula individual ──────────────────────────────────────────────────────
function Particle({
  data,
  type,
  color,
  startX,
  startY,
}: {
  data:    ParticleData;
  type:    'circle' | 'diamond' | 'spark' | 'stardust';
  color:   string;
  startX:  number;
  startY:  number;
}) {
  const tx      = useSharedValue(startX);
  const ty      = useSharedValue(startY);
  const opacity = useSharedValue(1);

  useEffect(() => {
    tx.value      = withDelay(data.delay, withTiming(data.endX, { duration: data.duration, easing: Easing.out(Easing.quad) }));
    ty.value      = withDelay(data.delay, withTiming(data.endY, { duration: data.duration, easing: Easing.out(Easing.quad) }));
    opacity.value = withDelay(
      data.delay + data.duration * 0.35,
      withTiming(0, { duration: data.duration * 0.65, easing: Easing.in(Easing.ease) }),
    );
  }, []);

  const particleColor = (type === 'stardust' && data.isWhite) ? '#FFFFFF' : color;

  const rotateStr = type === 'diamond'
    ? '45deg'
    : type === 'spark'
      ? `${data.angle - Math.PI / 2}rad`
      : '0deg';

  const style = useAnimatedStyle(() => ({
    position:  'absolute',
    opacity:   opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: rotateStr },
    ],
  }));

  if (type === 'circle') {
    return (
      <Animated.View style={[style, { width: 7, height: 7, borderRadius: Radius.full, backgroundColor: particleColor, left: -3.5, top: -3.5 }]} />
    );
  }
  if (type === 'diamond') {
    return (
      <Animated.View style={[style, { width: 8, height: 8, backgroundColor: particleColor, left: -4, top: -4 }]} />
    );
  }
  if (type === 'spark') {
    return (
      <Animated.View style={[style, { width: 3, height: 12, backgroundColor: particleColor, borderRadius: 2, left: -1.5, top: -6 }]} />
    );
  }
  // stardust
  const sz = data.isWhite ? 5 : 3;
  return (
    <Animated.View style={[style, { width: sz, height: sz, backgroundColor: particleColor, borderRadius: data.isWhite ? 1 : Radius.full, left: -(sz / 2), top: -(sz / 2) }]} />
  );
}

// ── LegendaryFlash ────────────────────────────────────────────────────────────
function LegendaryFlash() {
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 150 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    bottom:          0,
    backgroundColor: 'rgba(255,255,255,0.35)',
    zIndex:          10,
    opacity:         flashOpacity.value,
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}

// ── RevealExplosion ───────────────────────────────────────────────────────────
export const RevealExplosion: React.FC<Props> = ({ rarity, visible, originY }) => {
  const cfg    = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG] ?? RARITY_CONFIG.COMMON;
  const startY = originY ?? SH * 0.35;
  const startX = SW / 2;

  const particles = useMemo<ParticleData[]>(() => {
    if (!visible) return [];
    return Array.from({ length: cfg.count }, (_, i) => {
      const angle    = (i / cfg.count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const distance = 80 + Math.random() * 130;
      const duration = 900 + Math.random() * 700;
      const isWhite  = cfg.type === 'stardust' && i % 2 === 0;
      return {
        endX:     startX + Math.cos(angle) * distance,
        endY:     startY + Math.sin(angle) * distance + 30,
        angle,
        duration,
        delay:    i * 18,
        isWhite,
      };
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {rarity === 'LEGENDARY' && <LegendaryFlash />}
      {particles.map((p, i) => (
        <Particle
          key={i}
          data={p}
          type={cfg.type}
          color={cfg.color}
          startX={startX}
          startY={startY}
        />
      ))}
    </View>
  );
};

export default RevealExplosion;
