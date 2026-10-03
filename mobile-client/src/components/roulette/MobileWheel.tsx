// ─────────────────────────────────────────────────────────────────────────────
// MobileWheel — SVG roulette wheel driven by an Animated.Value
// Props:
//   drinks    – array of RouletteDrinkDTO to render as pie segments
//   spinAnim  – Animated.Value [0..n]; mapped to [0deg..360n deg] via outputRange
//   size      – diameter in dp (default 280)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Animated } from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText, Polygon } from 'react-native-svg';

import type { RouletteDrinkDTO } from '../../types/api';

// Animated SVG group — allows rotating the whole wheel via Animated.Value
const AnimatedG = Animated.createAnimatedComponent(G);

// ── Rarity fallback colors ─────────────────────────────────────────────────
const RARITY_COLOR: Record<string, string> = {
  COMMON:    '#9b8f7d',
  RARE:      '#38BDF8',
  EPIC:      '#a855f7',
  LEGENDARY: '#D4A340',
};

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function segmentColor(drink: RouletteDrinkDTO): string {
  if (drink.color && HEX_RE.test(drink.color)) return drink.color;
  return RARITY_COLOR[drink.rarity] ?? '#9b8f7d';
}

// ── Arc path helper ────────────────────────────────────────────────────────
// Returns an SVG "pie slice" path string: M cx,cy → rim start → arc → close.
function arcPath(
  cx: number, cy: number, r: number,
  startDeg: number, sweepDeg: number,
): string {
  const start = (startDeg * Math.PI) / 180;
  const end   = ((startDeg + sweepDeg) * Math.PI) / 180;

  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);

  const largeArc = sweepDeg > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

// ── Props ──────────────────────────────────────────────────────────────────
interface MobileWheelProps {
  drinks:   RouletteDrinkDTO[];
  /** Accepts Animated.Value or Animated.AnimatedAddition (from Animated.add) */
  spinAnim: Animated.Value | Animated.AnimatedAddition<number>;
  size?:    number;
}

// ── Component ──────────────────────────────────────────────────────────────
export const MobileWheel: React.FC<MobileWheelProps> = ({
  drinks,
  spinAnim,
  size = 280,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size / 2 - 8;   // wheel rim — 8dp inset for stroke
  const hubR = size / 8;      // centre hub radius

  // Compute total probability weight (fallback to 1 to avoid div-by-zero)
  const total = drinks.reduce((sum, d) => sum + (d.probability ?? 1), 0) || 1;

  // Build segment metadata (start angle, sweep angle, color) per drink
  let cursor = -90; // start at top (12 o'clock = −90° in standard math coords)
  const segments = drinks.map((drink) => {
    const prob  = drink.probability ?? 1;
    const sweep = (prob / total) * 360;
    const start = cursor;
    cursor     += sweep;
    return { drink, start, sweep, color: segmentColor(drink) };
  });

  // Map spinAnim [0..1] → rotate '0deg'..'360deg'
  // Use transform prop directly on AnimatedG (SVG transform attribute)
  const rotateDeg = spinAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Rotating wheel group — transform rotates around centre */}
      <AnimatedG
        // @ts-ignore — AnimatedG inherits G transform props; style not available
        transform={[{ rotate: rotateDeg }]}
        origin={`${cx}, ${cy}`}
      >
        {/* Pie segments */}
        {segments.map(({ drink, start, sweep, color }, idx) => (
          <React.Fragment key={drink._id + idx}>
            <Path
              d={arcPath(cx, cy, r, start, sweep)}
              fill={color}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
            />

            {/* Label — only render when segment is wide enough to be legible */}
            {sweep > 25 && (() => {
              const labelAngle    = (start + sweep / 2) * (Math.PI / 180);
              const textX         = cx + r * 0.65 * Math.cos(labelAngle);
              const textY         = cy + r * 0.65 * Math.sin(labelAngle);
              const labelAngleDeg = start + sweep / 2;

              return (
                <SvgText
                  x={textX}
                  y={textY}
                  fill="#ffffff"
                  fontSize={size * 0.035}
                  textAnchor="middle"
                  transform={`rotate(${labelAngleDeg + 90}, ${textX}, ${textY})`}
                >
                  {drink.name.slice(0, 10)}
                </SvgText>
              );
            })()}
          </React.Fragment>
        ))}

        {/* Centre hub — drawn on top of segments */}
        <Circle
          cx={cx}
          cy={cy}
          r={hubR}
          fill="#1A1A22"
          stroke="#D4A340"
          strokeWidth={2}
        />
      </AnimatedG>

      {/* ── Pointer (does NOT rotate) ───────────────────────────────────── */}
      {/* Gold triangle pointing down from top-centre */}
      <Polygon
        points={`${cx - 8},${8} ${cx + 8},${8} ${cx},${28}`}
        fill="#D4A340"
      />
    </Svg>
  );
};

export default MobileWheel;
