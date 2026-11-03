// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — WheelChaseRing (v4 — Reanimated worklets)
// 12 luces orbitales SVG. Toda la animación corre en el UI thread.
// Eliminado el forceUpdate() por frame de la versión anterior.
//
// phase='idle'     → órbita lenta, ember sutil
// phase='spinning' → órbita rápida, ember brillante
// phase='result'   → todas encendidas al color de rareza
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  createAnimatedComponent,
  type SharedValue,
} from 'react-native-reanimated';

import { Colors, NocturneColors } from '../../theme/colors';

const LIGHT_COUNT = 12;

const RARITY_GLOW_MAP: Record<string, string> = {
  COMMON:    Colors.outline,
  RARE:      Colors.info,
  EPIC:      Colors.wine,
  LEGENDARY: NocturneColors.vipGold,
};

const AnimatedCircle = createAnimatedComponent(Circle);

// ── Luz individual ────────────────────────────────────────────────────────────
interface ChaseLightProps {
  cx:         number;
  cy:         number;
  orbitR:     number;
  index:      number;
  total:      number;
  phaseAnim:  SharedValue<number>;
  phase:      string;
  rarity:     string;
}

function ChaseLight({ cx, cy, orbitR, index, total, phaseAnim, phase, rarity }: ChaseLightProps) {
  const baseAngle = (index / total) * Math.PI * 2;
  const angle     = (index / total) * Math.PI * 2 - Math.PI / 2;
  const lx        = cx + orbitR * Math.cos(angle);
  const ly        = cy + orbitR * Math.sin(angle);

  const isResult   = phase === 'result';
  const isSpinning = phase === 'spinning';
  const rarityColor = RARITY_GLOW_MAP[rarity] ?? RARITY_GLOW_MAP.COMMON;

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    if (isResult) {
      return { opacity: 0.9 };
    }
    const sinVal = Math.sin(phaseAnim.value + baseAngle);
    const maxOp  = isSpinning ? 0.9 : 0.5;
    return { opacity: Math.max(0.05, sinVal * sinVal * maxOp) };
  });

  const color = isResult
    ? rarityColor
    : isSpinning
      ? 'rgba(240,138,90,0.9)'
      : 'rgba(240,138,90,0.5)';

  return (
    <AnimatedCircle
      cx={lx}
      cy={ly}
      r={4.5}
      fill={color}
      animatedProps={animatedProps}
    />
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface WheelChaseRingProps {
  cx:     number;
  cy:     number;
  orbitR: number;
  size:   number;
  phase:  string;
  rarity: string;
}

export const WheelChaseRing: React.FC<WheelChaseRingProps> = ({
  cx, cy, orbitR, size, phase, rarity,
}) => {
  const phaseAnim = useSharedValue(0);

  useEffect(() => {
    if (phase === 'result') {
      // Detener el loop
      phaseAnim.value = phaseAnim.value;
      return;
    }
    const duration = phase === 'spinning' ? 500 : 3500;
    phaseAnim.value = withRepeat(
      withTiming(phaseAnim.value + Math.PI * 2, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [phase]);

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {Array.from({ length: LIGHT_COUNT }, (_, i) => (
        <ChaseLight
          key={i}
          cx={cx}
          cy={cy}
          orbitR={orbitR}
          index={i}
          total={LIGHT_COUNT}
          phaseAnim={phaseAnim}
          phase={phase}
          rarity={rarity}
        />
      ))}
    </Svg>
  );
};

export default WheelChaseRing;
