"use client";

import type { ReactNode } from "react";
import { Activity, Zap, Trophy, Target } from "lucide-react";
import type { RouletteSpinResult, RouletteDrink } from "../types/roulette";

interface Props {
  drinks: RouletteDrink[];
  lastResult: RouletteSpinResult | null;
}

export default function RouletteStats({ drinks, lastResult }: Props) {
  const active = drinks.filter((d) => d && d.active);

  const avgWeight =
    active.reduce((acc, d) => acc + (d.weight || 0), 0) /
    (active.length || 1);

  const mostFrequent = [...drinks]
    .filter((d) => d !== null)
    .sort((a, b) => (b.totalSpins || 0) - (a.totalSpins || 0))[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Activity size={20} className="text-gold" />}
        label="Pool Activo"
        value={active.length}
        sub={`${drinks.length} configurados en total`}
        accentColor="gold"
      />
      <StatCard
        icon={<Target size={20} className="text-emerald" />}
        label="Peso Promedio"
        value={avgWeight.toFixed(1)}
        sub="Distribución de probabilidades"
        accentColor="emerald"
      />
      <StatCard
        icon={<Trophy size={20} className="text-gold" />}
        label="Favorito de la Casa"
        value={mostFrequent?.name || "Sin registros"}
        sub={`${mostFrequent?.totalSpins || 0} selecciones registradas`}
        accentColor="gold"
      />
      <StatCard
        icon={<Zap size={20} className="text-emerald" />}
        label="Último Drop"
        value={lastResult?.result.name || "---"}
        sub={lastResult?.meta.rarity ? `Rareza: ${lastResult.meta.rarity}` : "Esperando primer giro"}
        accentColor="emerald"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accentColor,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub: string;
  accentColor: "gold" | "emerald";
}) {
  const valueColor = accentColor === "gold" ? "text-gold" : "text-emerald";

  return (
    <div className="bg-surface-2 p-5 rounded-2xl border border-border hover:border-border-strong hover:bg-surface-3 transition-all relative overflow-hidden group shadow-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black text-muted uppercase tracking-wider">{label}</span>
        <div className="p-2 rounded-xl bg-surface-3 border border-border group-hover:border-gold/30 transition-colors">
          {icon}
        </div>
      </div>
      <div className={`text-2xl sm:text-3xl font-black ${valueColor} tracking-tight truncate uppercase mb-1`}>
        {value}
      </div>
      <p className="text-xs text-muted/70 font-medium truncate">
        {sub}
      </p>
    </div>
  );
}
