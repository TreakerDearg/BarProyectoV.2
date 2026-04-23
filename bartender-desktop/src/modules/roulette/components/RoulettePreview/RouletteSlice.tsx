// components/RoulettePreview/RouletteSlice.tsx

interface Props {
  startAngle: number;
  sliceAngle: number;
  color: string;
  label: string;
}

export default function RouletteSlice({
  startAngle,
  sliceAngle,
  color,
}: Props) {
  const radius = 100;
  const center = 100;

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

  return (
    <path
      d={pathData}
      fill={color}
      stroke="#0f172a"
      strokeWidth="1"
      className="hover:opacity-80 transition"
    />
  );
}

/* =========================
   HELPERS
========================= */
function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle * Math.PI) / 180;

  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}