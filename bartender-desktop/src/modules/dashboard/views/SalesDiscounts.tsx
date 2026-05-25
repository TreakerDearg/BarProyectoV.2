import type { DashboardStats } from "../services/dashboardService";
import type { DashboardMode } from "../store/dashboardUiStore";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import CollapsibleSection from "../components/CollapsibleSection";
import { BarChart4, LayoutPanelLeft } from "lucide-react";

interface Props {
  data: DashboardStats;
  mode: DashboardMode;
  onRangeChange?: (range: string) => void;
}

const PERIODS = [
  { id: "DIARIO" as const, label: "Hoy", range: "1" },
  { id: "SEMANAL" as const, label: "Semana", range: "7" },
  { id: "MENSUAL" as const, label: "Mes", range: "30" },
];

export default function SalesDiscounts({ data, mode, onRangeChange }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "DIARIO" | "SEMANAL" | "MENSUAL"
  >("DIARIO");
  const hourlyData = data.hourlyData || [];
  const isSimple = mode === "simple";

  const handlePeriodChange = (period: "DIARIO" | "SEMANAL" | "MENSUAL") => {
    setSelectedPeriod(period);
    const match = PERIODS.find((p) => p.id === period);
    if (match && onRangeChange) onRangeChange(match.range);
  };

  const totalSpins = data?.rouletteSpins?.total || 0;
  const acceptedSpins = data?.rouletteSpins?.accepted || 0;
  const acceptedPct =
    totalSpins > 0 ? Math.round((acceptedSpins / totalSpins) * 100) : 0;

  const chartBlock = (
    <div
      data-tutorial="sales-chart"
      className={isSimple ? "nebula-panel p-6" : "nebula-panel p-6 md:p-8 col-span-12 lg:col-span-8"}
    >
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-ivory">Ventas por hora</h3>
          <p className="text-xs text-muted">Ventas frente a descuentos aplicados</p>
        </div>
        <div className="flex gap-4 text-[10px] font-semibold uppercase text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Ventas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gold" />
            Descuentos
          </span>
        </div>
      </div>
      <div className={isSimple ? "h-[260px]" : "h-[320px]"}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={hourlyData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D399" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.15)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0c0a12",
                border: "1px solid rgba(139,92,246,0.25)",
                borderRadius: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#34D399"
              strokeWidth={2}
              fill="url(#salesGrad)"
            />
            <Area
              type="monotone"
              dataKey="discounts"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#discGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {!isSimple && totalSpins > 0 && (
        <p className="text-xs text-muted mt-4">
          Ruleta: {totalSpins} giros · {acceptedPct}% aceptados
        </p>
      )}
    </div>
  );

  const distributionBlock = (
    <div className="nebula-panel p-6 md:p-8 flex flex-col">
      <h3 className="text-base font-bold text-ivory mb-1">Por categoría</h3>
      <p className="text-xs text-muted mb-6">Distribución de ingresos</p>
      <div className="space-y-5 flex-1">
        {(data?.revenueByCategory || []).slice(0, 4).map((item, idx) => {
          const totalRev =
            (data?.revenueByCategory || []).reduce(
              (acc, curr) => acc + curr.value,
              0
            ) || 1;
          const pct = Math.round((item.value / totalRev) * 100);
          return (
            <DistributionRow
              key={idx}
              label={item.name}
              value={pct}
              color={idx % 2 === 0 ? "violet" : "emerald"}
            />
          );
        })}
        {(!data?.revenueByCategory ||
          data.revenueByCategory.length === 0) && (
          <p className="text-center text-muted text-sm py-6">
            Sin datos por categoría
          </p>
        )}
      </div>
      <div className="mt-6 pt-6 border-t border-white/5">
        <div className="flex items-center gap-2 text-violet-300">
          <LayoutPanelLeft size={18} />
          <p className="text-xs font-semibold text-muted">Principal</p>
        </div>
        <p className="text-xl font-bold text-ivory mt-2">
          {data?.revenueByCategory?.[0]?.name || "—"}
        </p>
      </div>
    </div>
  );

  const drinksTable = (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/5 text-[10px] font-semibold text-muted uppercase">
            <th className="p-4 pl-6">Bebida</th>
            <th className="p-4 text-center">Unidades</th>
            <th className="p-4 text-right">Ingresos</th>
          </tr>
        </thead>
        <tbody>
          {data?.topDrinks?.map((item, idx) => (
            <tr key={idx} className="border-b border-white/5">
              <td className="p-4 pl-6 font-medium text-ivory">{item.name}</td>
              <td className="p-4 text-center text-muted">{item.qty}</td>
              <td className="p-4 text-right text-gold">
                ${item.revenue.toLocaleString("es-MX")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up-fusion">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-ivory flex items-center gap-2">
            <BarChart4 className="text-emerald-400" size={22} />
            Ventas y descuentos
          </h2>
          <p className="text-xs text-muted mt-1">
            Rendimiento financiero e impacto de promociones
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

      {isSimple ? (
        <>
          {chartBlock}
          <CollapsibleSection
            title="Distribución y top bebidas"
            subtitle="Categorías y productos destacados"
            mode="simple"
          >
            <div className="space-y-6">
              {distributionBlock}
              {drinksTable}
            </div>
          </CollapsibleSection>
        </>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-6">
            {chartBlock}
            <div className="col-span-12 lg:col-span-4">{distributionBlock}</div>
          </div>
          <div className="nebula-panel overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-base font-bold text-ivory">
                Bebidas con mejor rendimiento
              </h3>
            </div>
            {drinksTable}
          </div>
        </>
      )}
    </div>
  );
}

function DistributionRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "violet" | "emerald" | "gold";
}) {
  const bar =
    color === "violet"
      ? "bg-violet-500"
      : color === "gold"
        ? "bg-gold"
        : "bg-emerald-400";
  const text =
    color === "violet"
      ? "text-violet-300"
      : color === "gold"
        ? "text-gold"
        : "text-emerald-400";

  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-2">
        <span className="text-muted">{label}</span>
        <span className={text}>{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-surface-3/50 rounded-full overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
