"use client";

import { useState, memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Clock, Target, CheckCircle, AlertTriangle } from "lucide-react";
import VersusChart from "../../../components/shared/VersusChart";
import ImprovementSuggestions from "../components/ImprovementSuggestions";
import type { DashboardStats } from "../services/dashboardService";
import type { DashboardMode } from "../store/dashboardUiStore";

interface Props {
  data: DashboardStats;
  mode: DashboardMode;
  onRangeChange?: (range: string) => void;
}

export default function AnalyticsDashboardView({ data, mode, onRangeChange }: Props) {
  const [range, setRange] = useState("7");
  const isSimple = mode === "simple";
  const isMedium = mode === "medium";

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    if (onRangeChange) onRangeChange(newRange);
  };

  const { totalSales, totalOrders, avgTicket, reservationsToday, trends, topProducts, versusStats, salesData } = data;

  // Generate improvement suggestions
  const generateSuggestions = () => {
    const suggestions = [];

    if (totalSales < 30000) {
      suggestions.push({
        id: "low-sales",
        text: "Ventas bajas: Considera promociones de happy hour",
        type: "warning" as const,
        icon: <AlertTriangle size={16} className="text-gold" />,
      });
    }

    if (avgTicket < 120) {
      suggestions.push({
        id: "low-ticket",
        text: "Cuentas pequeñas: Sugiere acompañamientos a los clientes",
        type: "info" as const,
      });
    }

    if (totalOrders > 60) {
      suggestions.push({
        id: "high-orders",
        text: "Muchas cuentas: Excelente rendimiento, mantén el ritmo",
        type: "success" as const,
        icon: <CheckCircle size={16} className="text-emerald-400" />,
      });
    }

    if (topProducts.length > 0 && topProducts[0].qty > 20) {
      suggestions.push({
        id: "top-product",
        text: `${topProducts[0].name} es el favorito: Asegura stock suficiente`,
        type: "info" as const,
      });
    }

    return suggestions.slice(0, 3);
  };

  const suggestions = generateSuggestions();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-ivory">Datos del bar</h2>
          <p className="text-sm text-muted mt-1">Números importantes del negocio</p>
        </div>
        {!isSimple && (
          <div className="flex items-center gap-2">
            <select
              value={range}
              onChange={(e) => handleRangeChange(e.target.value)}
              className="bg-surface-3 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-ivory outline-none focus:border-violet-400/40"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className={`grid gap-6 ${isSimple ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}>
        <KPICard
          title="Ventas"
          value={`$${totalSales.toLocaleString()}`}
          trend={trends?.salesPct || 0}
          icon={<DollarSign size={20} />}
          color="violet"
          benchmark={40000}
          benchmarkLabel="Meta diaria"
        />
        <KPICard
          title="Cuentas"
          value={totalOrders}
          trend={trends?.ordersPct || 0}
          icon={<Target size={20} />}
          color="cyan"
          benchmark={50}
          benchmarkLabel="Meta diaria"
        />
        {!isSimple && (
          <>
            <KPICard
              title="Promedio cuenta"
              value={`$${avgTicket}`}
              trend={trends?.ticketPct || 0}
              icon={<TrendingUp size={20} />}
              color="emerald"
              benchmark={150}
              benchmarkLabel="Promedio ideal"
            />
            <KPICard
              title="Reservas"
              value={reservationsToday}
              trend={0}
              icon={<Clock size={20} />}
              color="amber"
              benchmark={20}
              benchmarkLabel="Capacidad normal"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className={`grid gap-8 ${!isSimple ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Sales Chart */}
        <div className="bg-surface-3 border border-white/10 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-ivory mb-4">Ventas por día</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" tick={{ fill: "#a0a0a0", fontSize: 12 }} />
                <YAxis tick={{ fill: "#a0a0a0", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#e0e0e0" }}
                />
                <Legend />
                <Bar dataKey="total" fill="#FFD700" name="Ventas" />
                <Bar dataKey="orders" fill="#34D399" name="Cuentas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Versus Chart - Medium and Advanced */}
        {!isSimple && (
          <VersusChart
            radarData={versusStats.radarData}
            headToHead={versusStats.headToHead}
            drinkAName={versusStats.headToHead[0]?.name || "Top 1"}
            drinkBName={versusStats.headToHead[1]?.name || "Top 2"}
          />
        )}
      </div>

      {/* Improvement Suggestions - Medium and Advanced */}
      {!isSimple && (
        <ImprovementSuggestions suggestions={suggestions} />
      )}

      {/* Top Products */}
      <div className="bg-surface-3 border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-ivory mb-6">Lo más vendido</h3>
        <div className={`grid gap-6 ${isSimple ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
          {topProducts.slice(0, isSimple ? 3 : 6).map((product, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-ivory text-base">{product.name}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                  {product.type}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{product.qty} vendidos</span>
                <span className="text-emerald-400 font-semibold">${product.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Summary - Advanced only */}
      {!isSimple && (
        <div className="nebula-panel p-6 bg-violet-500/5 border-violet-400/20">
          <h3 className="text-base font-bold text-ivory mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-300" />
            Conclusiones
          </h3>
          <div className="space-y-3">
            {totalSales > 40000 && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2" />
                <p className="text-muted">
                  <span className="text-emerald-400 font-semibold">Ventas arriba de la meta:</span> Mantén el personal actual.
                </p>
              </div>
            )}
            {totalSales < 30000 && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
                <p className="text-muted">
                  <span className="text-amber-400 font-semibold">Ventas bajas:</span> Considera promociones especiales.
                </p>
              </div>
            )}
            {topProducts.length > 0 && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
                <p className="text-muted">
                  <span className="text-gold font-semibold">Favorito:</span> {topProducts[0].name} es el más vendido. Asegura stock.
                </p>
              </div>
            )}
            {avgTicket < 120 && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" />
                <p className="text-muted">
                  <span className="text-cyan-400 font-semibold">Cuentas pequeñas:</span> Sugiere acompañamientos.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const KPICard = memo(function KPICard({ title, value, trend, icon, color, benchmark, benchmarkLabel }: {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  color: "violet" | "cyan" | "emerald" | "amber";
  benchmark?: number;
  benchmarkLabel?: string;
}) {
  const colorClasses = {
    violet: "from-violet-500/20 to-violet-600/10 border-violet-400/20",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-400/20",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-400/20",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-400/20",
  };

  const trendColor = trend >= 0 ? "text-emerald-400" : "text-red-400";
  const trendIcon = trend >= 0 ? "↑" : "↓";

  // Calculate benchmark percentage
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  const benchmarkPct = benchmark ? Math.round((numericValue / benchmark) * 100) : 0;
  const isAboveBenchmark = benchmark && numericValue >= benchmark;

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-muted">{icon}</div>
        <div className={`text-xs font-medium ${trendColor}`}>
          {trendIcon} {Math.abs(trend)}%
        </div>
      </div>
      <p className="text-xs text-muted mb-2">{title}</p>
      <p className="text-3xl font-bold text-ivory">{value}</p>
      {benchmark && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted">{benchmarkLabel}:</span>
            <span className={isAboveBenchmark ? "text-emerald-400" : "text-amber-400"}>
              {isAboveBenchmark ? "✓" : "→"} {benchmarkPct}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
