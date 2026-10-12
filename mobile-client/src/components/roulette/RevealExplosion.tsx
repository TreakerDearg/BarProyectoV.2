// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — RevealExplosion (v2)
// Partículas con forma por rareza. Sin reanimated — usa Animated de RN.
//
// COMMON:    círculos grises
// RARE:      diamantes (cuadrados rotados 45°) azules
// EPIC:      chispas elongadas vino
// LEGENDARY: polvo dorado + destellos blancos + flash inicial
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

import { Colors, NocturneColors } from '../../theme/colors';
import { Radius } from '../../theme/spacing';

const { width: SW, height: SH } = Dimensions.get('window');

const RARITY_CONFIG = {
  COMMON:    { count: 10, color: Colors.outline,         type: 'circle'   as const },
  RARE:      { count: 16, color: Colors.info,            type: 'diamond'  as const },
  EPIC:      { count: 20, color: Colors.wine,            type: 'spark'    as const },
  LEGENDARY: { count: 36, color: NocturneColors.vipGold, type: 'stardust' as const },
};

interface Props {
  rarity:     string;
  visible:    boolean;
  originY?:   number;
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

// Partícula individual
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
  const tx      = useRef(new Animated.Value(startX)).current;
  const ty      = useRef(new Animated.Value(startY)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.delay(data.delay),
        Animated.timing(tx, { toValue: data.endX, duration: data.duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(data.delay),
        Animated.timing(ty, { toValue: data.endY, duration: data.duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(data.delay + data.duration * 0.35),
        Animated.timing(opacity, { toValue: 0, duration: data.duration * 0.65, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const particleColor = (type === 'stardust' && data.isWhite) ? '#FFFFFF' : color;

  const baseStyle = {
    position:  'absolute' as const,
    opacity,
    transform: [
      { translateX: tx },
      { translateY: ty },
      ...(type === 'diamond' ? [{ rotate: '45deg' }] : []),
      ...(type === 'spark'   ? [{ rotate: `${data.angle - Math.PI / 2}rad` }] : []),
    ],
  };

  if (type === 'circle') {
    return <Animated.View style={[baseStyle, { width: 7, height: 7, borderRadius: Radius.full, backgroundColor: particleColor, left: -3.5, top: -3.5 }]} />;
  }
  if (type === 'diamond') {
    return <Animated.View style={[baseStyle, { width: 8, height: 8, backgroundColor: particleColor, left: -4, top: -4 }]} />;
  }
  if (type === 'spark') {
    return <Animated.View style={[baseStyle, { width: 3, height: 12, backgroundColor: particleColor, borderRadius: 2, left: -1.5, top: -6 }]} />;
  }
  const sz = data.isWhite ? 5 : 3;
  return <Animated.View style={[baseStyle, { width: sz, height: sz, backgroundColor: particleColor, borderRadius: data.isWhite ? 1 : Radius.full, left: -(sz/2), top: -(sz/2) }]} />;
}

export const RevealExplosion: React.FC<Props> = ({ rarity, visible, originY, onComplete }) => {
  const cfg    = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG] ?? RARITY_CONFIG.COMMON;
  const startY = originY ?? SH * 0.35;
  const startX = SW / 2;

  // Flash LEGENDARY
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    if (rarity === 'LEGENDARY') {
      flashOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 1,   duration: 80,  useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0,   duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const particles = useMemo<ParticleData[]>(() => {
    if (!visible) return [];
    return Array.from({ length: cfg.count }, (_, i) => {
      const angle    = (i / cfg.count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const distance = 80 + Math.random() * 130;
      const duration = 900 + Math.random() * 700;
      const isWhite  = cfg.type === 'stardust' && i % 2 === 0;
      return {
        endX:    startX + Math.cos(angle) * distance,
        endY:    startY + Math.sin(angle) * distance + 30,
        angle,
        duration,
        delay:   i * 18,
        isWhite,
      };
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {rarity === 'LEGENDARY' && (
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.35)', zIndex: 10, opacity: flashOpacity }]} />
      )}
      {particles.map((p, i) => (
        <Particle key={i} data={p} type={cfg.type} color={cfg.color} startX={startX} startY={startY} />
      ))}
    </View>
  );
};

export default RevealExplosion;
