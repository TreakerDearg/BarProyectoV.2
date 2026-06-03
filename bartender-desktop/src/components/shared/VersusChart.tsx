"use client";

import { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
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
  drinkAName = "Drink A",
  drinkBName = "Drink B",
}: VersusChartProps) {
  const [activeTab, setActiveTab] = useState<"radar" | "head-to-head">("radar");

  return (
    <div className="bg-surface-3 border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/15 text-violet-200">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ivory">Comparativa de Tragos</h3>
            <p className="text-xs text-muted">Análisis comparativo de rendimiento</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("radar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "radar"
                ? "bg-violet-500/20 text-violet-200"
                : "bg-white/5 text-muted hover:text-ivory"
            }`}
          >
            <Target size={14} className="inline mr-1" />
            Radar
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
            Head-to-Head
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "radar" && (
        <div className="space-y-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#a0a0a0", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 150]} tick={{ fill: "#a0a0a0", fontSize: 10 }} />
                <Radar
                  name={drinkAName}
                  dataKey="A"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name={drinkBName}
                  dataKey="B"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#e0e0e0" }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-muted">{drinkAName}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-muted">{drinkBName}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "head-to-head" && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-white/10">
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">Trago</th>
                  <th className="pb-3 font-medium">Categoría</th>
                  <th className="pb-3 font-medium text-right">Ventas</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                  <th className="pb-3 font-medium text-right">Ganancia</th>
                  <th className="pb-3 font-medium text-right">Margen</th>
                  <th className="pb-3 font-medium text-right">Perf</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {headToHead.map((item) => (
                  <tr key={item.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        item.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                        item.rank === 2 ? "bg-gray-400/20 text-gray-300" :
                        item.rank === 3 ? "bg-orange-500/20 text-orange-400" :
                        "bg-white/5 text-muted"
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-ivory">{item.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-muted">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 text-right text-ivory">{item.sold}</td>
                    <td className="py-3 text-right text-cyan-400">{item.profit}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                            style={{ width: `${Math.min(item.perf, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted">{item.perf}%</span>
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
