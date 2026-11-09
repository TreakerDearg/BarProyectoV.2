"use client";

import type { RouletteRarity } from "../../types/roulette";

interface Props {
  index?: number;
  startAngle: number;
  sliceAngle: number;
  color?: string;
  label: string;
  rarity: RouletteRarity | string;
  isWinner?: boolean;
}

// Paleta temática Slate Elegante v3.0 con alternancia para gajos contiguos
const RARITY_GRADIENTS: Record<
  string,
  {
    primary: [string, string];
    alternate: [string, string];
    border: string;
    glow: string;
  }
> = {
  COMMON: {
    primary: ["#16233B", "#2563EB"],
    alternate: ["#111C30", "#1D4ED8"],
    border: "#30363D",
    glow: "rgba(56, 139, 253, 0.4)",
  },
  RARE: {
    primary: ["#0B2F20", "#3FB950"],
    alternate: ["#072418", "#2EA043"],
    border: "#2EA043",
    glow: "rgba(63, 185, 80, 0.5)",
  },
  EPIC: {
    primary: ["#2B1647", "#8B5CF6"],
    alternate: ["#200F36", "#7C3AED"],
    border: "#8B5CF6",
    glow: "rgba(139, 92, 246, 0.6)",
  },
  LEGENDARY: {
    primary: ["#452605", "#F0B429"],
    alternate: ["#361D03", "#F5C842"],
    border: "#F0B429",
    glow: "rgba(240, 180, 41, 0.7)",
  },
};

export default function RouletteSliceRoyale({
  index = 0,
  startAngle,
  sliceAngle,
  color,
  label,
  rarity = "COMMON",
  isWinner = false,
}: Props) {
  const radius = 95;
  const center = 100;

  const start = polarToCartesian(center, center, radius, startAngle);
  const end = polarToCartesian(center, center, radius, startAngle + sliceAngle);
  const largeArcFlag = sliceAngle > 180 ? 1 : 0;

  const pathData = `
    M ${center} ${center}
    L ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
    Z
  `;

  const midAngle = startAngle + sliceAngle / 2;
  const textRadius = radius * 0.65;
  const textPos = polarToCartesian(center, center, textRadius, midAngle);

  // Selector de gradiente por rareza con alternancia
  const config = RARITY_GRADIENTS[rarity] || RARITY_GRADIENTS.COMMON;
  const colors = index % 2 === 0 ? config.primary : config.alternate;
  const gradId = `slice-grad-${index}-${label.replace(/[^a-zA-Z0-9]/g, "-")}`;

  // Formato de etiqueta según ángulo disponible
  const isWide = sliceAngle >= 25;
  const isMedium = sliceAngle >= 14 && sliceAngle < 25;

  const maxChars = isWide ? 14 : isMedium ? 9 : 5;
  const displayLabel = label.length > maxChars ? `${label.slice(0, maxChars - 1)}.` : label;

  return (
    <g
      className={`transition-all duration-500 ${isWinner ? "filter brightness-125" : ""}`}
      style={{ transformOrigin: "100px 100px" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="65%" stopColor={colors[1]} stopOpacity={0.9} />
          <stop offset="100%" stopColor={color || colors[1]} />
        </linearGradient>

        <filter id={`winner-glow-${index}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F0B429" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Sombra de profundidad interior */}
      <path d={pathData} fill="#090E14" opacity={0.4} transform="translate(0.5, 0.5)" />

      {/* Gajo principal */}
      <path
        d={pathData}
        fill={`url(#${gradId})`}
        stroke={isWinner ? "#F0B429" : "#161B22"}
        strokeWidth={isWinner ? 1.5 : 0.6}
        className={`transition-all duration-300 ${isWinner ? "animate-pulse" : "hover:opacity-95"}`}
        filter={isWinner ? `url(#winner-glow-${index})` : undefined}
      />

      {/* Separador radial de acabado oro pulido */}
      <line
        x1={center}
        y1={center}
        x2={start.x}
        y2={start.y}
        stroke="rgba(240, 180, 41, 0.35)"
        strokeWidth="0.4"
      />

      {/* Línea exterior del arco con acento de rareza */}
      <path
        d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`}
        fill="none"
        stroke={config.border}
        strokeWidth={isWinner ? 1.8 : 0.9}
        strokeOpacity={isWinner ? 1 : 0.75}
      />

      {/* Texto radial del trago */}
      {sliceAngle >= 8 && (
        <text
          x={textPos.x}
          y={textPos.y}
          fill="#FFFFFF"
          fontSize={isWide ? "4.2" : isMedium ? "3.4" : "2.8"}
          fontWeight="900"
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(${midAngle + 90} ${textPos.x} ${textPos.y})`}
          className="pointer-events-none select-none uppercase tracking-wider font-sans"
          style={{
            textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)",
          }}
        >
          {displayLabel}
        </text>
      )}
    </g>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}
