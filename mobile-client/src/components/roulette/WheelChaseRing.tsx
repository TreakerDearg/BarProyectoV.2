// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — WheelChaseRing
// 12 luces orbitales SVG animadas alrededor del wheel.
// Usa Animated de React Native (sin reanimated) para compatibilidad con Expo Go.
//
// phase='idle'     → órbita lenta, ember sutil
// phase='spinning' → órbita rápida, ember brillante
// phase='result'   → todas encendidas al color de rareza
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Colors, NocturneColors } from '../../theme/colors';

const LIGHT_COUNT = 12;

const RARITY_GLOW_MAP: Record<string, string> = {
  COMMON:    Colors.outline,
  RARE:      Colors.info,
  EPIC:      Colors.wine,
  LEGENDARY: NocturneColors.vipGold,
};

interface WheelChaseRingProps {
  cx:     number;
  cy:     number;
  orbitR: number;
  size:   number;
  phase:  string;
  rarity: string;
}

// Cada luz como componente puro SVG — opacidad calculada en JS desde el offset
function ChaseLight({
  lightX,
  lightY,
  opacity,
  color,
}: {
  lightX:   number;
  lightY:   number;
  opacity:  number;
  color:    string;
}) {
  return (
    <Circle cx={lightX} cy={lightY} r={4.5} fill={color} opacity={opacity} />
  );
}

export const WheelChaseRing: React.FC<WheelChaseRingProps> = ({
  cx, cy, orbitR, size, phase, rarity,
}) => {
  const phaseAnim = useRef(new Animated.Value(0)).current;
  const animRef   = useRef<Animated.CompositeAnimation | null>(null);

  // offset actual para el render (leído via listener)
  const offsetRef  = useRef(0);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  useEffect(() => {
    const listener = phaseAnim.addListener(({ value }) => {
      offsetRef.current = value % (Math.PI * 2);
      forceUpdate();
    });
    return () => phaseAnim.removeListener(listener);
  }, []);

  useEffect(() => {
    animRef.current?.stop();

    if (phase === 'result') return;

    const duration = phase === 'spinning' ? 500 : 3500;
    animRef.current = Animated.loop(
      Animated.timing(phaseAnim, {
        toValue:         phaseAnim._value + Math.PI * 2,
        duration,
        easing:          Easing.linear,
        useNativeDriver: false,
      }),
    );
    animRef.current.start();
  }, [phase]);

  const rarityColor = RARITY_GLOW_MAP[rarity] ?? RARITY_GLOW_MAP.COMMON;
  const isResult    = phase === 'result';
  const isSpinning  = phase === 'spinning';

  const lights = Array.from({ length: LIGHT_COUNT }, (_, i) => {
    const angle      = (i / LIGHT_COUNT) * Math.PI * 2 - Math.PI / 2;
    const baseAngle  = (i / LIGHT_COUNT) * Math.PI * 2;
    const lightX     = cx + orbitR * Math.cos(angle);
    const lightY     = cy + orbitR * Math.sin(angle);

    let opacity: number;
    let color: string;

    if (isResult) {
      opacity = 0.9;
      color   = rarityColor;
    } else {
      const sinVal = Math.sin(offsetRef.current + baseAngle);
      opacity      = Math.max(0.05, sinVal * sinVal * (isSpinning ? 0.9 : 0.5));
      color        = isSpinning ? 'rgba(240,138,90,0.9)' : 'rgba(240,138,90,0.5)';
    }

    return { lightX, lightY, opacity, color, key: i };
  });

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none"
    >
      {lights.map(({ lightX, lightY, opacity, color, key }) => (
        <ChaseLight key={key} lightX={lightX} lightY={lightY} opacity={opacity} color={color} />
      ))}
    </Svg>
  );
};

export default WheelChaseRing;
