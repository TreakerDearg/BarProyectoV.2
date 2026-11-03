// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — MobileWheel (v4 — Reanimated)
//
// Arquitectura:
//   <View size×size>                         ← contenedor
//     <Animated.View rotate={spinDeg}>       ← ROTA: segmentos + hub (Reanimated)
//       <Svg>…segments…hub…</Svg>
//     </Animated.View>
//     <Svg absoluteFill>                     ← ESTÁTICO: anillos + remaches
//       …rings…rivets…
//     </Svg>
//     <Animated.View bounce={pointerBounce}> ← BOUNCE pointer (Reanimated)
//       <Svg>…pointer…</Svg>
//     </Animated.View>
//     <Animated.View glow={hubScale}>        ← HUB PULSE GLOW (Reanimated)
//     <WheelChaseRing absoluteFill />        ← luces chase (Reanimated)
//   </View>
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path, Circle, Text as SvgText, Polygon,
  Defs, LinearGradient, Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

import { Colors, NocturneColors } from '../../theme/colors';
import type { RouletteDrinkDTO } from '../../types/api';
import { WheelChaseRing } from './WheelChaseRing';

// ── Helpers ───────────────────────────────────────────────────────────────────
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function segmentFill(drink: RouletteDrinkDTO): string {
  if (drink.color && HEX_RE.test(drink.color)) return drink.color;
  return ({
    COMMON:    'url(#grad_COMMON)',
    RARE:      'url(#grad_RARE)',
    EPIC:      'url(#grad_EPIC)',
    LEGENDARY: 'url(#grad_LEGENDARY)',
  } as Record<string, string>)[drink.rarity] ?? 'url(#grad_COMMON)';
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number): string {
  const s  = (startDeg * Math.PI) / 180;
  const e  = ((startDeg + sweepDeg) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(s);
  const y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e);
  const y2 = cy + r * Math.sin(e);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${sweepDeg > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
}

const RARITY_RING_COLOR: Record<string, string> = {
  COMMON:    Colors.outline,
  RARE:      Colors.info,
  EPIC:      Colors.wine,
  LEGENDARY: NocturneColors.vipGold,
};
const RARITY_HUB_FILL: Record<string, string> = {
  COMMON:    NocturneColors.surfaceContainerLow,
  RARE:      NocturneColors.infoMuted,
  EPIC:      NocturneColors.wineMuted,
  LEGENDARY: NocturneColors.vipGoldMuted,
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface MobileWheelProps {
  drinks:        RouletteDrinkDTO[];
  spinAnim:      SharedValue<number>;   // grados absolutos (crece continuamente)
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

  // ── Wheel rotation (Reanimated) ───────────────────────────────────────────
  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinAnim.value}deg` }],
  }));

  // ── Pointer bounce (Reanimated) ───────────────────────────────────────────
  const pointerBounce = useSharedValue(0);

  useEffect(() => {
    if (phase === 'result') {
      pointerBounce.value = withSequence(
        withTiming(-10, { duration: 80, easing: Easing.out(Easing.ease) }),
        withSpring(0,    { damping: 3, mass: 0.5 }),
      );
    }
  }, [phase]);

  const pointerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pointerBounce.value }],
  }));

  // ── Hub pulse (Reanimated) ────────────────────────────────────────────────
  const hubScale = useSharedValue(1);

  useEffect(() => {
    if (phase === 'spinning') {
      hubScale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 300 }),
          withTiming(1.0,  { duration: 300 }),
        ),
        -1,   // infinito
        false,
      );
    } else {
      hubScale.value = withTiming(1.0, { duration: 250 });
    }
  }, [phase]);

  const hubGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: hubScale.value }],
  }));

  // ── Colores reactivos ─────────────────────────────────────────────────────
  const ringColor = phase === 'result'
    ? (RARITY_RING_COLOR[resultRarity] ?? Colors.primaryContainer)
    : Colors.primaryContainer;

  const hubFill = phase === 'result'
    ? (RARITY_HUB_FILL[resultRarity] ?? NocturneColors.surfaceContainerLowest)
    : NocturneColors.surfaceContainerLowest;

  // ── Segmentos ─────────────────────────────────────────────────────────────
  const total  = drinks.reduce((s, d) => s + (d.probability ?? 1), 0) || 1;
  let cursor   = -90;
  const segments = drinks.map((drink) => {
    const sweep = ((drink.probability ?? 1) / total) * 360;
    const start = cursor;
    cursor += sweep;
    return { drink, start, sweep, fill: segmentFill(drink) };
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={{ width: size, height: size }}>

      {/* Capa 1: wheel rotante */}
      <Animated.View style={[StyleSheet.absoluteFill, wheelStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="grad_COMMON"    x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%"   stopColor="#9E8C7B" />
              <Stop offset="100%" stopColor="#6B5B4E" />
            </LinearGradient>
            <LinearGradient id="grad_RARE"      x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%"   stopColor="#5AB8E8" />
              <Stop offset="100%" stopColor="#2E7FA8" />
            </LinearGradient>
            <LinearGradient id="grad_EPIC"      x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%"   stopColor="#A03D52" />
              <Stop offset="100%" stopColor="#5E2130" />
            </LinearGradient>
            <LinearGradient id="grad_LEGENDARY" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%"   stopColor="#F3BE59" />
              <Stop offset="60%"  stopColor="#D4A340" />
              <Stop offset="100%" stopColor="#B8860B" />
            </LinearGradient>
            <LinearGradient id="shimmer_seg"    x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%"   stopColor="rgba(255,255,255,0)"    />
              <Stop offset="50%"  stopColor="rgba(255,255,255,0.10)" />
              <Stop offset="100%" stopColor="rgba(255,255,255,0)"    />
            </LinearGradient>
          </Defs>

          {segments.map(({ drink, start, sweep, fill }, idx) => {
            const isDark     = drink.rarity === 'EPIC' || drink.rarity === 'LEGENDARY';
            const labelColor = isDark ? 'rgba(255,255,255,0.9)' : NocturneColors.onSurface;
            return (
              <React.Fragment key={drink._id + idx}>
                <Path
                  d={arcPath(cx, cy, r, start, sweep)}
                  fill={fill}
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth={1}
                />
                <Path
                  d={arcPath(cx, cy, r, start, sweep)}
                  fill="url(#shimmer_seg)"
                  opacity={0.7}
                />
                {sweep > 22 && (() => {
                  const mid = (start + sweep / 2) * (Math.PI / 180);
                  const tx  = cx + r * 0.62 * Math.cos(mid);
                  const ty  = cy + r * 0.62 * Math.sin(mid);
                  return (
                    <SvgText
                      x={tx} y={ty}
                      fill={labelColor}
                      fontSize={size * 0.033}
                      textAnchor="middle"
                      fontWeight="600"
                      transform={`rotate(${start + sweep / 2 + 90}, ${tx}, ${ty})`}
                    >
                      {drink.name.slice(0, 10)}
                    </SvgText>
                  );
                })()}
              </React.Fragment>
            );
          })}

          {/* Hub central */}
          <Circle cx={cx} cy={cy} r={hubR + 8} fill={NocturneColors.surfaceContainerLowest} stroke={Colors.primaryContainer} strokeWidth={2} />
          <Circle cx={cx} cy={cy} r={hubR}     fill={hubFill} />
          <SvgText x={cx} y={cy + hubR * 0.35} textAnchor="middle" fill={Colors.primary} fontSize={hubR * 0.85} fontWeight="900">
            N
          </SvgText>
        </Svg>
      </Animated.View>

      {/* Capa 2: elementos estáticos (anillos + remaches) */}
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Circle cx={cx} cy={cy} r={r + 5}  fill="none" stroke={ringColor}                      strokeWidth={2} />
        <Circle cx={cx} cy={cy} r={r + 9}  fill="none" stroke={NocturneColors.emberGlowStrong}  strokeWidth={1} />
        <Circle cx={cx} cy={cy} r={r + 13} fill="none" stroke={NocturneColors.wineGlow}         strokeWidth={1} />

        {Array.from({ length: 24 }).map((_, i) => {
          const a  = ((i * 15 - 90) * Math.PI) / 180;
          const rx = cx + (r + 8) * Math.cos(a);
          const ry = cy + (r + 8) * Math.sin(a);
          return (
            <React.Fragment key={`remache_${i}`}>
              <Circle cx={rx} cy={ry} r={4} fill={NocturneColors.surfaceContainerLowest} />
              <Circle cx={rx} cy={ry} r={3} fill={Colors.primaryContainer} opacity={0.9} />
            </React.Fragment>
          );
        })}

        {/* Sombra del pointer (decorativa, no hace bounce) */}
        <Polygon points={`${cx - 10},8 ${cx + 10},8 ${cx},32`} fill="rgba(0,0,0,0.40)" />
      </Svg>

      {/* Capa 3: bounce del pointer */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, pointerStyle]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} pointerEvents="none">
          <Polygon points={`${cx - 9},4 ${cx + 9},4 ${cx},26`}  fill={Colors.primary} />
          <Polygon points={`${cx - 4},8 ${cx + 4},8 ${cx},20`}  fill="rgba(255,255,255,0.28)" />
        </Svg>
      </Animated.View>

      {/* Capa 4: hub pulse glow */}
      {phase === 'spinning' && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position:        'absolute',
              left:            cx - (hubR + 8),
              top:             cy - (hubR + 8),
              width:           (hubR + 8) * 2,
              height:          (hubR + 8) * 2,
              borderRadius:    hubR + 8,
              backgroundColor: Colors.emberMuted,
              opacity:         0.28,
            },
            hubGlowStyle,
          ]}
        />
      )}

      {/* Capa 5: luces chase */}
      <WheelChaseRing cx={cx} cy={cy} orbitR={r + 8} size={size} phase={phase} rarity={resultRarity} />
    </View>
  );
};

export default MobileWheel;
