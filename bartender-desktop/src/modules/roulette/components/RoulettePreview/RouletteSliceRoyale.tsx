"use client";

interface Props {
  startAngle: number;
  sliceAngle: number;
  color: string;
  label: string;
  rarity: string;
  isWinner?: boolean;
}

export default function RouletteSliceRoyale({
  startAngle,
  sliceAngle,
  color,
  label,
  rarity,
  isWinner,
}: Props) {
  const radius = 100;
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
  const textPos = polarToCartesian(center, center, radius * 0.75, midAngle);

  // Colores por rareza para los bordes
  const rarityColors: Record<string, string> = {
    LEGENDARY: '#D4A340',
    EPIC: '#C084FC',
    RARE: '#34D399',
    COMMON: 'rgba(255,255,255,0.1)'
  };

  const borderColor = rarityColors[rarity] || 'rgba(255,255,255,0.1)';

  return (
    <g 
      className={`transition-all duration-700 ${isWinner ? "scale-[1.05]" : ""}`}
      style={{ transformOrigin: "100px 100px" }}
    >
      {/* SOMBRA DE PROFUNDIDAD */}
      <path d={pathData} fill="black" opacity={0.3} transform="translate(1, 1)" />

      {/* REBANADA PRINCIPAL */}
      <path
        d={pathData}
        fill={`url(#grad-${label.replace(/\s+/g, '-')})`}
        stroke={borderColor}
        strokeWidth={isWinner ? 1 : 0.2}
        className={`transition-all duration-500 ${isWinner ? "brightness-150" : "brightness-90 group-hover:brightness-110"}`}
      />

      {/* DECORACIÓN GOLD PARA WINNER */}
      {isWinner && (
        <path
          d={pathData}
          fill="none"
          stroke="gold"
          strokeWidth={1.5}
          className="animate-pulse"
          filter="url(#glow)"
        />
      )}

      {/* TEXTO CURVADO O ROTADO */}
      {sliceAngle > 10 && (
        <text
          x={textPos.x}
          y={textPos.y}
          fill="white"
          fontSize={sliceAngle < 20 ? "3.5" : "4.5"}
          fontWeight="900"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${midAngle + 90} ${textPos.x} ${textPos.y})`}
          className="pointer-events-none select-none uppercase tracking-[0.1em] opacity-80"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
        >
          {label.length > 12 ? label.slice(0, 10) + '..' : label}
        </text>
      )}

      {/* GRADIENTES DINÁMICOS */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`grad-${label.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="60%" stopColor={color} stopOpacity={0.8} />
          <stop offset="100%" stopColor="#0A0A0A" />
        </linearGradient>
      </defs>
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
