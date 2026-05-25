"use client";

import { TrendingUp, Activity, Target, Zap } from "lucide-react";

interface RouletteStatsDashboardProps {
  stats: {
    totalDrinks: number;
    activeDrinks: number;
    totalSpins: number;
    totalWins: number;
    rarityDistribution: Record<string, number>;
  };
  lastResult: any;
}

const RARITY_COLORS = {
  COMMON: "bg-gray-500",
  RARE: "bg-blue-500",
  EPIC: "bg-purple-500",
  LEGENDARY: "bg-amber-500",
};

const RARITY_LABELS = {
  COMMON: "Común",
  RARE: "Raro",
  EPIC: "Épico",
  LEGENDARY: "Legendario",
};

export default function RouletteStatsDashboard({
  stats,
  lastResult,
}: RouletteStatsDashboardProps) {
  const winRate = stats.totalSpins > 0 
    ? ((stats.totalWins / stats.totalSpins) * 100).toFixed(1) 
    : "0";

  const topRarity = Object.entries(stats.rarityDistribution).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Drinks */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <Target className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-sm text-zinc-500">Total Tragos</span>
        </div>
        <div className="text-2xl font-bold text-white">{stats.totalDrinks}</div>
        <div className="text-xs text-zinc-500 mt-1">
          {stats.activeDrinks} activos
        </div>
      </div>

      {/* Total Spins */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <Activity className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-sm text-zinc-500">Total Spins</span>
        </div>
        <div className="text-2xl font-bold text-white">{stats.totalSpins}</div>
        <div className="text-xs text-zinc-500 mt-1">
          {stats.totalWins} ganados
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <TrendingUp className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-sm text-zinc-500">Win Rate</span>
        </div>
        <div className="text-2xl font-bold text-white">{winRate}%</div>
        <div className="text-xs text-zinc-500 mt-1">
          Efectividad global
        </div>
      </div>

      {/* Top Rarity */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <Zap className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-sm text-zinc-500">Top Rareza</span>
        </div>
        {topRarity ? (
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${RARITY_COLORS[topRarity[0] as keyof typeof RARITY_COLORS]}`}
            />
            <span className="text-2xl font-bold text-white">
              {RARITY_LABELS[topRarity[0] as keyof typeof RARITY_LABELS]}
            </span>
          </div>
        ) : (
          <div className="text-2xl font-bold text-white">-</div>
        )}
        <div className="text-xs text-zinc-500 mt-1">
          {topRarity ? `${topRarity[1]} tragos` : "Sin datos"}
        </div>
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className="md:col-span-2 lg:col-span-4 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-amber-400 mb-1">Último Resultado</div>
              <div className="text-lg font-bold text-white">{lastResult.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${RARITY_COLORS[lastResult.rarity as keyof typeof RARITY_COLORS]}`}
                />
                <span className="text-xs text-zinc-400">
                  {RARITY_LABELS[lastResult.rarity as keyof typeof RARITY_LABELS]}
                </span>
                {lastResult.probability && (
                  <span className="text-xs text-zinc-500">
                    • {lastResult.probability.toFixed(1)}% probabilidad
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500">Hace</div>
              <div className="text-sm text-zinc-300">
                {new Date(lastResult.lastSelectedAt || Date.now()).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
