"use client";

import type { RouletteDrink } from "../../types/roulette";
import RouletteWheelRoyale from "./RouletteWheelRoyale";
import {
  RotateCw,
  Activity,
  Layers,
  Percent,
  Sparkles,
  Trophy,
  History
} from "lucide-react";
import { useMemo } from "react";
import RarityBadge from "../RarityBadge";

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

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-12">

      {/* ================= WHEEL CONTAINER ================= */}
      <div className="relative flex items-center justify-center w-full min-h-[500px]">
        {/* EFECTOS DE FONDO */}
        <div className="absolute inset-0 bg-gold/5 blur-[120px] rounded-full opacity-30" />
        
        <RouletteWheelRoyale
          drinks={drinks}
          totalWeight={totalWeight}
          result={result}
          spinning={spinning}
        />
      </div>

      {/* ================= RESULT OVERLAY (TICKET STYLE) ================= */}
      {result && !spinning && (
        <div className="w-full glass-royale border border-gold/30 bg-gold/5 rounded-[2rem] p-8 animate-fade-in flex flex-col md:flex-row items-center justify-between gap-8 shadow-gold-glow/10 border-dashed">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gold flex items-center justify-center text-4xl shadow-gold-glow">
                 🏆
              </div>
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <RarityBadge rarity={result.rarity} size="sm" />
                    <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{result.category}</span>
                 </div>
                 <h2 className="text-3xl font-black text-ivory tracking-tighter uppercase">{result.name}</h2>
              </div>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Costo de Trago</span>
              <span className="text-3xl font-black text-grad-gold tracking-tighter">${result.price || 0}</span>
           </div>
        </div>
      )}

      {/* ================= QUICK STATS & LEGEND ================= */}
      <div className="w-full grid grid-cols-12 gap-8">
         
         <div className="col-span-12 lg:col-span-4 space-y-6">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] flex items-center gap-3">
               <Activity size={14} className="text-gold" />
               Engine Diagnostics
            </h3>
            <div className="grid grid-cols-1 gap-4">
               <MiniStat label="Opciones" value={drinks.length} icon={<Layers size={14} />} />
               <MiniStat label="Activos" value={activeCount} icon={<Activity size={14} />} />
               <MiniStat label="Prob. Media" value={`${(100 / (activeCount || 1)).toFixed(1)}%`} icon={<Percent size={14} />} />
            </div>
         </div>

         <div className="col-span-12 lg:col-span-8 space-y-6">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] flex items-center gap-3">
               <History size={14} className="text-gold" />
               Current Pool Weights
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {drinks.filter(d => d.active).slice(0, 9).map((d) => (
                  <div key={d._id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-3/30 border border-white/5 hover:border-gold/30 transition-all group">
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-[10px] font-black text-ivory/60 truncate uppercase">{d.name}</span>
                     </div>
                     <span className="text-[10px] font-black text-gold ml-2">{d.probability?.toFixed(0)}%</span>
                  </div>
               ))}
               {drinks.length > 9 && (
                  <div className="flex items-center justify-center p-4 rounded-2xl bg-surface-3/10 border border-dashed border-white/10">
                     <span className="text-[8px] font-black text-muted uppercase">+{drinks.length - 9} más</span>
                  </div>
               )}
            </div>
         </div>

      </div>

    </div>
  );
}

function MiniStat({ label, value, icon }: any) {
   return (
      <div className="flex items-center justify-between p-5 rounded-2xl bg-surface-3/50 border border-white/5">
         <div className="flex items-center gap-4">
            <div className="text-gold opacity-50">{icon}</div>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">{label}</span>
         </div>
         <span className="text-sm font-black text-ivory uppercase">{value}</span>
      </div>
   );
}