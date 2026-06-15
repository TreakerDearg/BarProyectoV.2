import type { DashboardStats } from "../services/dashboardService";
import type { DashboardMode } from "../store/dashboardUiStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useState } from "react";
import CollapsibleSection from "../components/CollapsibleSection";
import { Trophy, ArrowUpRight, Sparkles, Info } from "lucide-react";

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

  // Transform radar data to bar chart format for better readability
  const comparisonData = radarData.map((item) => ({
    attribute: item.subject || "Atributo",
    autor: item.A || 0,
    clasico: item.B || 0,
  }));

  // Calculate insights
  const authorAvg = radarData.reduce((sum, item) => sum + (item.A || 0), 0) / (radarData.length || 1);
  const classicAvg = radarData.reduce((sum, item) => sum + (item.B || 0), 0) / (radarData.length || 1);
  const authorWins = radarData.filter((item) => (item.A || 0) > (item.B || 0)).length;

  const rankingTable = (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/5 text-[10px] font-semibold text-muted uppercase">
            <th className="p-4 pl-6">#</th>
            <th className="p-4">Producto</th>
            <th className="p-4 text-center">Tipo</th>
            <th className="p-4 text-right">Unidades</th>
            <th className="p-4 text-right">Ingresos</th>
            <th className="p-4 text-right">Margen</th>
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
                    item.type === "Autor"
                      ? "border-gold/30 text-gold bg-gold/5"
                      : "border-emerald-400/30 text-emerald-400 bg-emerald-400/5"
                  }`}
                >
                  {item.type === "Autor" ? "Autor" : "Clásico"}
                </span>
              </td>
              <td className="p-4 text-right text-muted">
                {item.sold.toLocaleString("es-MX")}
              </td>
              <td className="p-4 text-right text-gold font-medium">
                ${item.profit}
              </td>
              <td className="p-4 text-right text-emerald-400 font-medium">
                —
              </td>
              <td className="p-4 pr-6">
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
      {headToHead.length === 0 && (
        <p className="text-center text-muted text-sm py-10">
          Sin datos comparativos para este periodo
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 dashboard-animate-fade-in-up">
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

      {/* Educational Context */}
      <div className="dashboard-panel p-5 bg-violet-500/5 border-violet-400/20">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-violet-300 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-violet-200 mb-1">¿Qué significa esta comparativa?</p>
            <p className="text-xs text-muted leading-relaxed">
              Comparamos el rendimiento de los <strong className="text-gold">cócteles de autor</strong> (creaciones exclusivas del bar) 
              contra los <strong className="text-emerald-400">cócteles clásicos</strong> (recetas internacionales reconocidas). 
              Esto nos ayuda a entender qué tipo de bebidas generan más ingresos y cuáles prefieren nuestros clientes.
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-panel p-6 md:p-8" data-tutorial="analytics-radar">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-ivory">Comparativa por atributo</h3>
            <p className="text-xs text-muted">Rendimiento: Autor vs Clásico (0-100 puntos)</p>
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
            <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              <Bar dataKey="autor" fill="#D4A340" name="Autor" radius={[0, 4, 4, 0]} />
              <Bar dataKey="clasico" fill="#34D399" name="Clásico" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {radarData.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-violet-500/10 border border-violet-400/20">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-violet-300 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-violet-200 mb-1">Resumen del análisis</p>
                <p className="text-xs text-muted">
                  Los cócteles de autor tienen un promedio de {authorAvg.toFixed(0)} puntos vs {classicAvg.toFixed(0)} de los clásicos.
                  {authorWins > radarData.length / 2 && " Destacan en " + authorWins + " de " + radarData.length + " atributos evaluados."}
                </p>
              </div>
            </div>
          </div>
        )}
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
        <div className="dashboard-panel overflow-hidden">
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
