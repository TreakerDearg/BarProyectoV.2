"use client";

import type { RouletteDrink } from "../../types/roulette";
import RouletteWheel from "./RouletteWheel";
import {
  RotateCw,
  Activity,
  Layers,
  Percent,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";

interface Props {
  drinks: RouletteDrink[];
  result?: RouletteDrink;
  spinning?: boolean;
}

export default function RoulettePreview({
  drinks,
  result,
  spinning,
}: Props) {
  const totalWeight = useMemo(
    () => drinks.reduce((acc, d) => acc + d.weight, 0),
    [drinks]
  );

  const activeCount = useMemo(
    () => drinks.filter((d) => d.active).length,
    [drinks]
  );

  const avgWeight = useMemo(() => {
    if (!drinks.length) return 0;
    return totalWeight / drinks.length;
  }, [totalWeight, drinks]);

  return (
    <div className="relative bg-gradient-to-b from-[#0B1220] to-[#020617] p-5 rounded-2xl border border-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.08)] space-y-5 overflow-hidden">

      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-blue-500/5 blur-2xl pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold tracking-wide">
          <RotateCw size={16} />
          ROULETTE PREVIEW
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2 text-xs text-green-400">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-md" />
          {spinning ? "SPINNING" : "READY"}
        </div>
      </div>

      {/* ================= WHEEL ================= */}
      <div className="flex justify-center py-4 relative z-10">
        <div className="relative">

          {/* glow behind wheel */}
          <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />

          <RouletteWheel
            drinks={drinks}
            totalWeight={totalWeight}
            result={result}
            spinning={spinning}
          />
        </div>
      </div>

      {/* ================= RESULT ================= */}
      {result && !spinning && (
        <div className="relative z-10 flex items-center justify-center gap-2 text-sm bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-2 rounded-xl">
          <Sparkles size={14} />
          Winner: <span className="font-bold">{result.name}</span>
        </div>
      )}

      {/* ================= LEGEND ================= */}
      <div className="grid grid-cols-2 gap-2 relative z-10 max-h-40 overflow-y-auto pr-1">

        {drinks.map((d) => {
          const isWinner = result?._id === d._id;

          return (
            <div
              key={d._id}
              className={`
                flex items-center justify-between px-3 py-2 rounded-lg text-xs border transition-all
                bg-[#020617]
                ${
                  isWinner
                    ? "border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                    : "border-gray-800 hover:border-blue-500/40"
                }
              `}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow"
                  style={{ background: d.color }}
                />

                <span className="text-gray-300 truncate max-w-[90px]">
                  {d.name}
                </span>
              </div>

              <span className="text-blue-400 font-medium">
                {d.probability?.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-3 gap-3 text-xs relative z-10">

        <Stat icon={<Layers />} label="OPTIONS" value={drinks.length} />

        <Stat icon={<Activity />} label="ACTIVE" value={activeCount} />

        <Stat
          icon={<Percent />}
          label="AVG WEIGHT"
          value={avgWeight.toFixed(1)}
        />
      </div>

      {/* ================= FOOTER ================= */}
      <div className="text-[11px] text-gray-500 text-center border-t border-gray-800 pt-3 relative z-10">
        Real-time weighted probability system
      </div>
    </div>
  );
}

/* ==============================
   STAT COMPONENT
============================== */
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
    <div className="bg-[#020617] border border-blue-500/10 rounded-xl p-3 text-center hover:border-blue-500/30 transition">

      <div className="flex justify-center mb-1 text-blue-400">
        {icon}
      </div>

      <div className="text-white font-bold text-sm">
        {value}
      </div>

      <div className="text-gray-500 text-[10px] tracking-wide">
        {label}
      </div>
    </div>
  );
}