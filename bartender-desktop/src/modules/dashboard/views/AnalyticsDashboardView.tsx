"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Clock, Target, RefreshCw } from "lucide-react";
import VersusChart from "../../../components/shared/VersusChart";
import type { DashboardStats } from "../services/dashboardService";

interface Props {
  data: DashboardStats;
  onRangeChange?: (range: string) => void;
}

export default function AnalyticsDashboardView({ data, onRangeChange }: Props) {
  const [range, setRange] = useState("7");

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    if (onRangeChange) onRangeChange(newRange);
  };

  const { totalSales, totalOrders, avgTicket, reservationsToday, trends, topProducts, versusStats, salesData } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-ivory">Dashboard Analítico</h2>
          <p className="text-sm text-muted mt-1">Métricas detalladas y análisis de rendimiento</p>
        </div>
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Ventas Totales"
          value={`$${totalSales.toLocaleString()}`}
          trend={trends?.salesPct || 0}
          icon={<DollarSign size={20} />}
          color="violet"
          benchmark={40000}
          benchmarkLabel="Meta diaria"
        />
        <KPICard
          title="Órdenes"
          value={totalOrders}
          trend={trends?.ordersPct || 0}
          icon={<Target size={20} />}
          color="cyan"
          benchmark={50}
          benchmarkLabel="Meta diaria"
        />
        <KPICard
          title="Ticket Promedio"
          value={`$${avgTicket}`}
          trend={trends?.ticketPct || 0}
          icon={<TrendingUp size={20} />}
          color="emerald"
          benchmark={150}
          benchmarkLabel="Promedio ideal"
        />
        <KPICard
          title="Reservas Hoy"
          value={reservationsToday}
          trend={0}
          icon={<Clock size={20} />}
          color="amber"
          benchmark={20}
          benchmarkLabel="Capacidad normal"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-surface-3 border border-white/10 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-ivory mb-4">Ventas por Día</h3>
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
                <Bar dataKey="total" fill="#8b5cf6" name="Ventas" />
                <Bar dataKey="orders" fill="#06b6d4" name="Órdenes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Versus Chart */}
        <VersusChart
          radarData={versusStats.radarData}
          headToHead={versusStats.headToHead}
          drinkAName={versusStats.headToHead[0]?.name || "Top 1"}
          drinkBName={versusStats.headToHead[1]?.name || "Top 2"}
        />
      </div>

      {/* Top Products */}
      <div className="bg-surface-3 border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-ivory mb-6">Productos Más Vendidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topProducts.slice(0, 6).map((product, idx) => (
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

      {/* Insights Summary */}
      <div className="nebula-panel p-6 bg-violet-500/5 border-violet-400/20">
        <h3 className="text-base font-bold text-ivory mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-violet-300" />
          Conclusiones y Recomendaciones
        </h3>
        <div className="space-y-3">
          {totalSales > 40000 && (
            <div className="flex items-start gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2" />
              <p className="text-muted">
                <span className="text-emerald-400 font-semibold">Ventas superiores a la meta:</span> Considera mantener el nivel de personal actual para continuar con este rendimiento.
              </p>
            </div>
          )}
          {totalSales < 30000 && (
            <div className="flex items-start gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
              <p className="text-muted">
                <span className="text-amber-400 font-semibold">Ventas por debajo de la meta:</span> Evalúa promociones especiales para aumentar el tráfico durante horarios valles.
              </p>
            </div>
          )}
          {topProducts.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
              <p className="text-muted">
                <span className="text-gold font-semibold">Producto destacado:</span> {topProducts[0].name} es el más vendido. Asegura suficiente stock para evitar faltantes.
              </p>
            </div>
          )}
          {avgTicket < 120 && (
            <div className="flex items-start gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" />
              <p className="text-muted">
                <span className="text-cyan-400 font-semibold">Ticket promedio bajo:</span> Sugiere combos o acompañamientos para aumentar el valor promedio por orden.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, icon, color, benchmark, benchmarkLabel }: {
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
}
