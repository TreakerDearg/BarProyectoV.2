// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — MobileWheel (v2)
// Ruleta SVG gobernada por un Animated.Value de React Native.
// Sin reanimated — compatible con Expo Go arquitectura vieja.
//
// spinAnim: Animated.Value en grados absolutos (0→∞, se aplica % 360 en render)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { View } from 'react-native';
import Svg, {
  G,
  Path,
  Circle,
  Text as SvgText,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

import { Colors, NocturneColors } from '../../theme/colors';
import type { RouletteDrinkDTO } from '../../types/api';
import { WheelChaseRing } from './WheelChaseRing';

// Animated SVG group
const AnimatedG = Animated.createAnimatedComponent(G);

// ── Colores de rareza ─────────────────────────────────────────────────────────
const RARITY_RING_COLOR: Record<string, string> = {
  COMMON:    Colors.outline,
  RARE:      Colors.info,
  EPIC:      Colors.wine,
  LEGENDARY: NocturneColors.vipGold,
};

const RARITY_HUB_COLOR: Record<string, string> = {
  COMMON:    NocturneColors.surfaceContainerLow,
  RARE:      NocturneColors.infoMuted,
  EPIC:      NocturneColors.wineMuted,
  LEGENDARY: NocturneColors.vipGoldMuted,
};

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function segmentFill(drink: RouletteDrinkDTO): string {
  if (drink.color && HEX_RE.test(drink.color)) return drink.color;
  const ids: Record<string, string> = {
    COMMON:    'url(#grad_COMMON)',
    RARE:      'url(#grad_RARE)',
    EPIC:      'url(#grad_EPIC)',
    LEGENDARY: 'url(#grad_LEGENDARY)',
  };
  return ids[drink.rarity] ?? 'url(#grad_COMMON)';
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number): string {
  const s  = (startDeg              * Math.PI) / 180;
  const e  = ((startDeg + sweepDeg) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(s);
  const y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e);
  const y2 = cy + r * Math.sin(e);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${sweepDeg > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface MobileWheelProps {
  drinks:        RouletteDrinkDTO[];
  spinAnim:      Animated.Value;
  phase?:        string;
  resultRarity?: string;
  size?:         number;
}

export const MobileWheel: React.FC<MobileWheelProps> = ({
  drinks,
  spinAnim,
  phase         = 'idle',
  resultRarity  = 'COMMON',
  size          = 300,
}) => {
  const cx   = size / 2;
  const cy   = size / 2;
  const r    = size / 2 - 10;
  const hubR = size / 8;

  // ── Hub: escala pulsante en spinning ─────────────────────────────────────────
  const hubScale   = useRef(new Animated.Value(1)).current;
  const hubPulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    hubPulseRef.current?.stop();
    if (phase === 'spinning') {
      hubPulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(hubScale, { toValue: 1.14, duration: 280, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(hubScale, { toValue: 1.0,  duration: 280, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ]),
      );
      hubPulseRef.current.start();
    } else {
      Animated.timing(hubScale, { toValue: 1.0, duration: 300, useNativeDriver: true }).start();
    }
  }, [phase]);

  // ── Pointer: bounce al aterrizar ─────────────────────────────────────────────
  const pointerBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === 'result') {
      Animated.sequence([
        Animated.timing(pointerBounce, { toValue: -12, duration: 80,  useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.spring(pointerBounce,  { toValue: 0,  friction: 3,   useNativeDriver: true }),
      ]).start();
    }
  }, [phase]);

  // ── Rotación del wheel ────────────────────────────────────────────────────────
  // spinAnim es en grados absolutos; interpolamos a "Xdeg"
  const rotateDeg = spinAnim.interpolate({
    inputRange:  [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  // ── Colores reactivos ─────────────────────────────────────────────────────────
  const ringColor = phase === 'result'
    ? (RARITY_RING_COLOR[resultRarity] ?? Colors.primary)
    : Colors.primaryContainer;

  const hubFill = phase === 'result'
    ? (RARITY_HUB_COLOR[resultRarity] ?? NocturneColors.surfaceContainerLowest)
    : NocturneColors.surfaceContainerLowest;

  // ── Segmentos ─────────────────────────────────────────────────────────────────
  const total = drinks.reduce((s, d) => s + (d.probability ?? 1), 0) || 1;
  let cursor  = -90;
  const segments = drinks.map((drink) => {
    const sweep = ((drink.probability ?? 1) / total) * 360;
    const start = cursor;
    cursor     += sweep;
    return { drink, start, sweep, fill: segmentFill(drink) };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="grad_COMMON" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%"   stopColor="#9E8C7B" />
            <Stop offset="100%" stopColor="#6B5B4E" />
          </LinearGradient>
          <LinearGradient id="grad_RARE" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%"   stopColor="#5AB8E8" />
            <Stop offset="100%" stopColor="#2E7FA8" />
          </LinearGradient>
          <LinearGradient id="grad_EPIC" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%"   stopColor="#A03D52" />
            <Stop offset="100%" stopColor="#5E2130" />
          </LinearGradient>
          <LinearGradient id="grad_LEGENDARY" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%"   stopColor="#F3BE59" />
            <Stop offset="60%"  stopColor="#D4A340" />
            <Stop offset="100%" stopColor="#B8860B" />
          </LinearGradient>
          <LinearGradient id="shimmer_seg" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="rgba(255,255,255,0)"    />
            <Stop offset="50%"  stopColor="rgba(255,255,255,0.10)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0)"    />
          </LinearGradient>
        </Defs>

        {/* Grupo rotante */}
        <AnimatedG
          // @ts-ignore — AnimatedG acepta style con transform
          style={{ transform: [{ rotate: rotateDeg }] }}
          origin={`${cx}, ${cy}`}
        >
          {segments.map(({ drink, start, sweep, fill }, idx) => {
            const isDark     = drink.rarity === 'EPIC' || drink.rarity === 'LEGENDARY';
            const labelColor = isDark ? 'rgba(255,255,255,0.9)' : NocturneColors.onSurface;
            return (
              <React.Fragment key={drink._id + idx}>
                <Path d={arcPath(cx, cy, r, start, sweep)} fill={fill} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
                <Path d={arcPath(cx, cy, r, start, sweep)} fill="url(#shimmer_seg)" opacity={0.7} />
                {sweep > 22 && (() => {
                  const mid   = (start + sweep / 2) * (Math.PI / 180);
                  const textX = cx + r * 0.62 * Math.cos(mid);
                  const textY = cy + r * 0.62 * Math.sin(mid);
                  return (
                    <SvgText
                      x={textX} y={textY}
                      fill={labelColor}
                      fontSize={size * 0.033}
                      textAnchor="middle"
                      fontWeight="600"
                      transform={`rotate(${start + sweep / 2 + 90}, ${textX}, ${textY})`}
                    >
                      {drink.name.slice(0, 10)}
                    </SvgText>
                  );
                })()}
              </React.Fragment>
            );
          })}

          {/* Hub */}
          <Circle cx={cx} cy={cy} r={hubR + 8} fill={NocturneColors.surfaceContainerLowest} stroke={Colors.primaryContainer} strokeWidth={2} />
          <Circle cx={cx} cy={cy} r={hubR}     fill={hubFill} />
          <SvgText x={cx} y={cy + hubR * 0.35} textAnchor="middle" fill={Colors.primary} fontSize={hubR * 0.85} fontWeight="900">
            N
          </SvgText>
        </AnimatedG>

        {/* Anillos estáticos */}
        <Circle cx={cx} cy={cy} r={r + 5}  fill="none" stroke={ringColor}                     strokeWidth={2} />
        <Circle cx={cx} cy={cy} r={r + 9}  fill="none" stroke={NocturneColors.emberGlowStrong} strokeWidth={1} />
        <Circle cx={cx} cy={cy} r={r + 13} fill="none" stroke={NocturneColors.wineGlow}        strokeWidth={1} />

        {/* Remaches */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = ((i * 15 - 90) * Math.PI) / 180;
          return (
            <React.Fragment key={`r${i}`}>
              <Circle cx={cx + (r + 8) * Math.cos(a)} cy={cy + (r + 8) * Math.sin(a)} r={4} fill={NocturneColors.surfaceContainerLowest} />
              <Circle cx={cx + (r + 8) * Math.cos(a)} cy={cy + (r + 8) * Math.sin(a)} r={3} fill={Colors.primaryContainer} opacity={0.9} />
            </React.Fragment>
          );
        })}

        {/* Pointer sombra */}
        <Polygon points={`${cx - 10},8 ${cx + 10},8 ${cx},32`} fill="rgba(0,0,0,0.40)" />

        {/* Pointer con bounce */}
        <Animated.View style={{
          position:  'absolute',
          transform: [{ translateY: pointerBounce }],
          left:      0,
          top:       0,
          width:     size,
          height:    size,
        }} pointerEvents="none">
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Polygon points={`${cx - 9},4 ${cx + 9},4 ${cx},26`} fill={Colors.primary} />
            <Polygon points={`${cx - 4},8 ${cx + 4},8 ${cx},20`} fill="rgba(255,255,255,0.28)" />
          </Svg>
        </Animated.View>
      </Svg>

      {/* Luces chase */}
      <WheelChaseRing cx={cx} cy={cy} orbitR={r + 8} size={size} phase={phase} rarity={resultRarity} />

      {/* Hub scale pulse (overlay separado para no afectar el SVG rotante) */}
      {phase === 'spinning' && (
        <Animated.View
          pointerEvents="none"
          style={{
            position:        'absolute',
            alignSelf:       'center',
            top:             cy - hubR - 8,
            width:           (hubR + 8) * 2,
            height:          (hubR + 8) * 2,
            borderRadius:    hubR + 8,
            backgroundColor: Colors.emberMuted,
            opacity:         0.3,
            transform:       [{ scale: hubScale }],
          }}
        />
      )}
    </View>
  );
};

export default MobileWheel;
