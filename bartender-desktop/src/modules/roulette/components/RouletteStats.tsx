"use client";

import { Activity, Zap, Trophy, Target } from "lucide-react";
import type { RouletteSpinResult, RouletteDrink } from "../types/roulette";

interface Props {
  drinks: RouletteDrink[];
  lastResult: RouletteSpinResult | null;
}

export default function RouletteStats({
  drinks,
  lastResult,
}: Props) {
  const active = drinks.filter((d) => d && d.active);

  const avgWeight =
    active.reduce((acc, d) => acc + (d.weight || 0), 0) /
    (active.length || 1);

  const mostFrequent = [...drinks]
    .filter((d) => d !== null)
    .sort((a, b) => (b.totalSpins || 0) - (a.totalSpins || 0))[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <PremiumStat 
        icon={<Activity size={24} />} 
        label="Pool Activo" 
        value={active.length} 
        sub="Drinks configurados"
        color="gold"
      />
      <PremiumStat 
        icon={<Target size={24} />} 
        label="Peso Promedio" 
        value={avgWeight.toFixed(1)} 
        sub="Distribución de carga"
        color="emerald"
      />
      <PremiumStat 
        icon={<Trophy size={24} />} 
        label="Más Popular" 
        value={mostFrequent?.name || "N/A"} 
        sub={`${mostFrequent?.totalSpins || 0} selecciones`}
        color="gold"
      />
      <PremiumStat 
        icon={<Zap size={24} />} 
        label="Último Drop" 
        value={lastResult?.result.name || "---"} 
        sub={lastResult?.meta.rarity || "Esperando spin"}
        color="emerald"
      />
    </div>
  );
}

function PremiumStat({ icon, label, value, sub, color }: any) {
  const theme = color === 'gold' ? 'text-gold' : 'text-emerald-400';
  return (
    <div className="glass-royale p-8 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all relative overflow-hidden shadow-royale">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-4">{label}</p>
        <p className={`text-3xl font-black ${theme} tracking-tighter truncate uppercase`}>
          {value}
        </p>
        <p className="text-[9px] font-black text-muted/60 uppercase tracking-[0.2em] mt-2">
          {sub}
        </p>
      </div>
    </div>
  );
}