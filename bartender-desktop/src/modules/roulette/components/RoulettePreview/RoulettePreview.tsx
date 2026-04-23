import type { RouletteDrink } from "../../types/roulette";
import RouletteWheel from "./RouletteWheel";
import {
  RotateCw,
  Activity,
  Layers,
  Percent,
} from "lucide-react";
import { useMemo } from "react";

interface Props {
  drinks: RouletteDrink[];
}

export default function RoulettePreview({ drinks }: Props) {
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
    <div className="bg-[#1A1B23] p-5 rounded-2xl border border-gray-800 shadow space-y-5">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-300 text-sm font-semibold tracking-wide">
          <RotateCw size={16} />
          LIVE PREVIEW
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2 text-xs text-green-400">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-md" />
          READY
        </div>
      </div>

      {/* ================= WHEEL ================= */}
      <div className="flex justify-center py-2">
        <RouletteWheel drinks={drinks} totalWeight={totalWeight} />
      </div>

      {/* ================= LEGEND ================= */}
      <div className="grid grid-cols-2 gap-2">
        {drinks.map((d) => (
          <div
            key={d._id}
            className="flex items-center justify-between bg-[#0F172A] border border-gray-800 rounded-lg px-3 py-2 text-xs hover:border-[#7A6BFA] transition"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: d.color }}
              />
              <span className="text-gray-300 truncate max-w-[90px]">
                {d.name}
              </span>
            </div>

            <span className="text-gray-400">
              {d.probability?.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-3 gap-3 text-xs">

        {/* OPTIONS */}
        <div className="bg-[#0F172A] border border-gray-800 rounded-xl p-3 text-center">
          <div className="flex justify-center mb-1 text-gray-500">
            <Layers size={14} />
          </div>
          <div className="text-white font-semibold">
            {drinks.length}
          </div>
          <div className="text-gray-500">Opciones</div>
        </div>

        {/* ACTIVE */}
        <div className="bg-[#0F172A] border border-gray-800 rounded-xl p-3 text-center">
          <div className="flex justify-center mb-1 text-gray-500">
            <Activity size={14} />
          </div>
          <div className="text-white font-semibold">
            {activeCount}
          </div>
          <div className="text-gray-500">Activos</div>
        </div>

        {/* AVG */}
        <div className="bg-[#0F172A] border border-gray-800 rounded-xl p-3 text-center">
          <div className="flex justify-center mb-1 text-gray-500">
            <Percent size={14} />
          </div>
          <div className="text-white font-semibold">
            {avgWeight.toFixed(1)}
          </div>
          <div className="text-gray-500">Avg Weight</div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="text-[11px] text-gray-500 text-center border-t border-gray-800 pt-3">
        Distribución dinámica basada en pesos configurados
      </div>
    </div>
  );
}