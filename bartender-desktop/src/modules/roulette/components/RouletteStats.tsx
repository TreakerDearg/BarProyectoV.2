// components/RouletteStats.tsx

import { Activity, Flame, Percent, Shuffle } from "lucide-react";
import type { RouletteSpinResult, RouletteDrink } from "../types/roulette";

interface Props {
  drinks: RouletteDrink[];
  lastResult: RouletteSpinResult | null;
  totalWeight: number;
}

export default function RouletteStats({
  drinks,
  lastResult,
  totalWeight,
}: Props) {
  const active = drinks.filter((d) => d.active);

  const avgWeight =
    active.reduce((acc, d) => acc + d.weight, 0) /
    (active.length || 1);

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Stat icon={<Activity />} label="ACTIVE" value={active.length} />
      <Stat icon={<Flame />} label="AVG WEIGHT" value={avgWeight.toFixed(1)} />
      <Stat icon={<Percent />} label="TOTAL" value={totalWeight} />
      <Stat icon={<Shuffle />} label="LAST" value={lastResult?.result.name || "-"} />
    </div>
  );
}

/* ============================== */

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="bg-gradient-to-b from-[#0F172A] to-[#020617] border border-blue-500/10 rounded-xl p-4 flex items-center gap-3 shadow-[0_0_15px_rgba(59,130,246,0.08)]">

      <div className="text-blue-400">{icon}</div>

      <div>
        <div className="text-[10px] text-gray-500 tracking-wide">
          {label}
        </div>
        <div className="text-white font-bold text-lg">
          {value}
        </div>
      </div>
    </div>
  );
}