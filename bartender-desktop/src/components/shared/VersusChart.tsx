"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Trophy, Target, Zap } from "lucide-react";

interface RadarDataPoint {
  subject: string;
  A: number;
  B: number;
  fullMark: number;
}

interface HeadToHeadData {
  rank: number;
  name: string;
  category: string;
  sold: number;
  profit: string;
  perf: number;
}

interface VersusChartProps {
  radarData: RadarDataPoint[];
  headToHead: HeadToHeadData[];
  drinkAName?: string;
  drinkBName?: string;
}

export default function VersusChart({
  radarData,
  headToHead,
  drinkAName = "Autor",
  drinkBName = "Clásico",
}: VersusChartProps) {
  const [activeTab, setActiveTab] = useState<"bars" | "head-to-head">("bars");

  // Transform radar data to horizontal bar chart format
  const barData = radarData.map(item => ({
    attribute: item.subject,
    autor: item.A || 0,
    clasico: item.B || 0,
  }));

  // Calculate winner
  const authorAvg = radarData.reduce((sum, item) => sum + (item.A || 0), 0) / (radarData.length || 1);
  const classicAvg = radarData.reduce((sum, item) => sum + (item.B || 0), 0) / (radarData.length || 1);
  const authorWins = radarData.filter((item) => (item.A || 0) > (item.B || 0)).length;
  const winner = authorAvg > classicAvg ? drinkAName : drinkBName;
  const winnerPct = Math.max(authorAvg, classicAvg) > 0 
    ? Math.round((Math.max(authorAvg, classicAvg) / Math.min(authorAvg, classicAvg) - 1) * 100)
    : 0;

  return (
    <div className="bg-surface-3 border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/15 text-violet-200">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ivory">Autor vs Clásico</h3>
            <p className="text-xs text-muted">Gana el que tiene barra más larga</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("bars")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "bars"
                ? "bg-violet-500/20 text-violet-200"
                : "bg-white/5 text-muted hover:text-ivory"
            }`}
          >
            <Target size={14} className="inline mr-1" />
            Barras
          </button>
          <button
            onClick={() => setActiveTab("head-to-head")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "head-to-head"
                ? "bg-violet-500/20 text-violet-200"
                : "bg-white/5 text-muted hover:text-ivory"
            }`}
          >
            <Zap size={14} className="inline mr-1" />
            Ranking
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "bars" && (
        <div className="space-y-4">
          {/* Winner badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-400/20">
            <Trophy size={18} className="text-gold" />
            <span className="text-sm font-semibold text-ivory">
              {winner} gana por {winnerPct}%
            </span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }} />
                <YAxis dataKey="attribute" type="category" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0c0a12",
                    border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => `${value} pts`}
                />
                <Bar dataKey="autor" fill="#FFD700" name="Autor" radius={[0, 4, 4, 0]} />
                <Bar dataKey="clasico" fill="#34D399" name="Clásico" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gold" />
              <span className="text-muted">{drinkAName}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-muted">{drinkBName}</span>
            </div>
          </div>

          {/* Summary */}
          {radarData.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-violet-500/10 border border-violet-400/20">
              <p className="text-xs text-muted">
                <span className="text-violet-300 font-semibold">Resumen:</span> 
                {drinkAName} tiene {authorAvg.toFixed(0)} puntos vs {classicAvg.toFixed(0)} de {drinkBName}.
                {authorWins > radarData.length / 2 && ` Destaca en ${authorWins} de ${radarData.length} atributos.`}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "head-to-head" && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-white/10">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Bebida</th>
                  <th className="pb-3 font-medium text-center">Tipo</th>
                  <th className="pb-3 font-medium text-right">Unidades</th>
                  <th className="pb-3 font-medium text-right">Ingresos</th>
                  <th className="pb-3 font-medium text-right">Rendimiento</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {headToHead.map((item) => (
                  <tr key={item.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pl-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${
                        item.rank === 1 ? "bg-violet-500/30 text-violet-100" : "bg-surface-3/50 text-muted"
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-ivory">{item.name}</td>
                    <td className="py-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${
                        item.category === "AUTHOR" 
                          ? "border-gold/30 text-gold bg-gold/5" 
                          : "border-emerald-400/30 text-emerald-400 bg-emerald-400/5"
                      }`}>
                        {item.category === "AUTHOR" ? "Autor" : "Clásico"}
                      </span>
                    </td>
                    <td className="py-3 text-right text-muted">{item.sold.toLocaleString("es-MX")}</td>
                    <td className="py-3 text-right text-gold font-medium">${item.profit}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="w-24 h-1.5 bg-surface-3/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.category === "AUTHOR" ? "bg-gold" : "bg-emerald-400"}`}
                            style={{ width: `${item.perf}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted w-8 text-right">{item.perf}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {headToHead.length >= 2 && (
            <div className="mt-4 p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-violet-400" />
                <span className="text-sm font-medium text-ivory">Resumen</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted block mb-1">Líder en ventas</span>
                  <span className="text-ivory font-medium">{headToHead[0].name}</span>
                </div>
                <div>
                  <span className="text-muted block mb-1">Mejor rendimiento</span>
                  <span className="text-ivory font-medium">
                    {headToHead.reduce((max, item) => 
                      item.perf > max.perf ? item : max
                    ).name}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
