import type { DashboardStats } from "../services/dashboardService";
import type { DashboardMode } from "../store/dashboardUiStore";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import CollapsibleSection from "../components/CollapsibleSection";
import { Trophy, ArrowUpRight, Sparkles } from "lucide-react";

interface Props {
  data: DashboardStats;
  mode: DashboardMode;
  onRangeChange?: (range: string) => void;
  onViewReport?: () => void;
}

const PERIODS = [
  { id: "24H" as const, label: "24 h", range: "1" },
  { id: "7D" as const, label: "7 días", range: "7" },
  { id: "30D" as const, label: "30 días", range: "30" },
];

export default function AnalyticsVersus({
  data,
  mode,
  onRangeChange,
  onViewReport,
}: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<"24H" | "7D" | "30D">("7D");
  const radarData = data?.versusStats?.radarData || [];
  const headToHead = data?.versusStats?.headToHead || [];
  const isSimple = mode === "simple";

  const handlePeriodChange = (period: "24H" | "7D" | "30D") => {
    setSelectedPeriod(period);
    const match = PERIODS.find((p) => p.id === period);
    if (match && onRangeChange) onRangeChange(match.range);
  };

  const rankingTable = (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/5 text-[10px] font-semibold text-muted uppercase">
            <th className="p-4 pl-6">#</th>
            <th className="p-4">Producto</th>
            <th className="p-4 text-center">Tipo</th>
            <th className="p-4 text-right">Vendidos</th>
            <th className="p-4 text-right">Ganancia</th>
            <th className="p-4 text-center pr-6">Rendimiento</th>
          </tr>
        </thead>
        <tbody>
          {headToHead.map((item, idx) => (
            <tr
              key={idx}
              className="border-b border-white/5 hover:bg-white/[0.02]"
            >
              <td className="p-4 pl-6">
                <span
                  className={`inline-flex w-8 h-8 items-center justify-center rounded-lg text-xs font-bold ${
                    item.rank === 1
                      ? "bg-violet-500/30 text-violet-100"
                      : "bg-surface-3/50 text-muted"
                  }`}
                >
                  {item.rank}
                </span>
              </td>
              <td className="p-4 font-semibold text-ivory">{item.name}</td>
              <td className="p-4 text-center">
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${
                    item.category === "AUTHOR"
                      ? "border-gold/30 text-gold bg-gold/5"
                      : "border-emerald-400/30 text-emerald-400 bg-emerald-400/5"
                  }`}
                >
                  {item.category === "AUTHOR" ? "Autor" : "Clásico"}
                </span>
              </td>
              <td className="p-4 text-right text-muted">
                {item.sold.toLocaleString("es-MX")}
              </td>
              <td className="p-4 text-right text-lime font-medium">
                {item.profit}
              </td>
              <td className="p-4 pr-6">
                <div className="w-32 h-1.5 bg-surface-3/50 rounded-full overflow-hidden ml-auto">
                  <div
                    className={`h-full ${item.category === "AUTHOR" ? "bg-gold" : "bg-emerald-400"}`}
                    style={{ width: `${item.perf}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {headToHead.length === 0 && (
        <p className="text-center text-muted text-sm py-10">
          Sin datos comparativos para este periodo
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up-fusion">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-ivory flex items-center gap-2">
            <Sparkles className="text-violet-300" size={22} />
            Análisis comparativo
          </h2>
          <p className="text-xs text-muted mt-1">
            Coctelería de autor frente a clásicos del menú
          </p>
        </div>
        <div className="flex p-1 rounded-xl border border-white/8 bg-surface-3/30">
          {PERIODS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handlePeriodChange(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                t.id === selectedPeriod
                  ? "bg-violet-500/25 text-violet-100 border border-violet-400/25"
                  : "text-muted hover:text-ivory"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="nebula-panel p-6 md:p-8" data-tutorial="analytics-radar">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-ivory">Matriz de atributos</h3>
            <p className="text-xs text-muted">Rendimiento por categoría</p>
          </div>
          <div className="flex gap-4 text-[10px] font-semibold uppercase">
            <span className="flex items-center gap-1.5 text-gold">
              <span className="w-2 h-2 rounded-full bg-gold" />
              Autor
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Clásico
            </span>
          </div>
        </div>
        <div className={isSimple ? "h-[280px]" : "h-[360px]"}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 150]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Autor"
                dataKey="A"
                stroke="#a78bfa"
                strokeWidth={2}
                fill="#8b5cf6"
                fillOpacity={0.2}
              />
              <Radar
                name="Clásico"
                dataKey="B"
                stroke="#34D399"
                strokeWidth={2}
                fill="#34D399"
                fillOpacity={0.08}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {isSimple ? (
        <CollapsibleSection
          title="Ranking de productos"
          subtitle="Comparativa directa de desempeño"
          mode="simple"
        >
          {rankingTable}
        </CollapsibleSection>
      ) : (
        <div className="nebula-panel overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/15 text-violet-300">
                <Trophy size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-ivory">
                  Ranking del bar
                </h3>
                <p className="text-xs text-muted">Comparativa de ventas</p>
              </div>
            </div>
            {onViewReport && (
              <button
                type="button"
                onClick={onViewReport}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold hover:border-violet-400/30 flex items-center gap-2 text-muted hover:text-violet-200"
              >
                Ver reporte completo
                <ArrowUpRight size={14} />
              </button>
            )}
          </div>
          {rankingTable}
        </div>
      )}
    </div>
  );
}
