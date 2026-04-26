"use client";

interface Props {
  startAngle: number;
  sliceAngle: number;
  color: string;
  label: string;
  isWinner?: boolean;
}

export default function RouletteSlice({
  startAngle,
  sliceAngle,
  color,
  label,
  isWinner,
}: Props) {
  const radius = 100;
  const center = 100;

  /* =========================
     PATH
  ========================= */
  const start = polarToCartesian(center, center, radius, startAngle);
  const end = polarToCartesian(
    center,
    center,
    radius,
    startAngle + sliceAngle
  );

  const largeArcFlag = sliceAngle > 180 ? 1 : 0;

  const pathData = `
    M ${center} ${center}
    L ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
    Z
  `;

  /* =========================
     TEXT POSITION
  ========================= */
  const midAngle = startAngle + sliceAngle / 2;

  const textPos = polarToCartesian(
    center,
    center,
    radius * 0.6,
    midAngle
  );

  return (
    <g
      className={`
        transition-all duration-500
        ${isWinner ? "scale-[1.03]" : ""}
      `}
      style={{
        transformOrigin: "100px 100px",
      }}
    >
      {/* SLICE */}
      <path
        d={pathData}
        fill={`url(#grad-${label})`}
        className={`
          transition-all duration-500
          ${isWinner ? "brightness-125" : ""}
        `}
      />

      {/* GLOW WINNER */}
      {isWinner && (
        <path
          d={pathData}
          fill="none"
          stroke="gold"
          strokeWidth={2}
          className="animate-pulse opacity-80"
        />
      )}

      {/* LABEL */}
      {sliceAngle > 12 && (
        <text
          x={textPos.x}
          y={textPos.y}
          fill="#E5E7EB"
          fontSize="6"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${midAngle} ${textPos.x} ${textPos.y})`}
          className="pointer-events-none select-none font-semibold tracking-wide"
        >
          {truncate(label, 10)}
        </text>
      )}

      {/* GRADIENT */}
      <defs>
        <linearGradient
          id={`grad-${label}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>
    </g>
  );
}

/* =========================
   HELPERS
========================= */
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angle: number
) {
  const rad = (angle * Math.PI) / 180;

  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function truncate(text: string, max: number) {
  return text.length > max
    ? text.slice(0, max) + "…"
    : text;
}