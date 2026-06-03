"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Clock, Target, RefreshCw } from "lucide-react";
import VersusChart from "../../../components/shared/VersusChart";
import { fetchDashboard, type DashboardStats } from "../services/dashboardService";

export default function AnalyticsDashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("7");

  useEffect(() => {
    loadDashboardData();
  }, [range]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboard(undefined, "analytics", range);
      setStats(data);
      setError(null);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-violet-400" size={32} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">{error || "No hay datos disponibles"}</p>
      </div>
    );
  }

  const { totalSales, totalOrders, avgTicket, reservationsToday, trends, topProducts, versusStats, salesData } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ivory">Dashboard Analítico</h2>
          <p className="text-sm text-muted">Métricas detalladas y análisis de rendimiento</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-surface-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-ivory outline-none focus:border-violet-400/40"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
          </select>
          <button
            onClick={loadDashboardData}
            className="p-2 rounded-lg border border-white/10 text-muted hover:text-ivory transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Ventas Totales"
          value={`$${totalSales.toLocaleString()}`}
          trend={trends?.salesPct || 0}
          icon={<DollarSign size={20} />}
          color="violet"
        />
        <KPICard
          title="Órdenes"
          value={totalOrders}
          trend={trends?.ordersPct || 0}
          icon={<Target size={20} />}
          color="cyan"
        />
        <KPICard
          title="Ticket Promedio"
          value={`$${avgTicket}`}
          trend={trends?.ticketPct || 0}
          icon={<TrendingUp size={20} />}
          color="emerald"
        />
        <KPICard
          title="Reservas Hoy"
          value={reservationsToday}
          trend={0}
          icon={<Clock size={20} />}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-surface-3 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-ivory mb-4">Ventas por Día</h3>
          <div className="h-64">
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
      <div className="bg-surface-3 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-ivory mb-4">Productos Más Vendidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topProducts.slice(0, 6).map((product, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-ivory">{product.name}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                  {product.type}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{product.qty} vendidos</span>
                <span className="text-emerald-400">${product.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, icon, color }: {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  color: "violet" | "cyan" | "emerald" | "amber";
}) {
  const colorClasses = {
    violet: "from-violet-500/20 to-violet-600/10 border-violet-400/20",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-400/20",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-400/20",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-400/20",
  };

  const trendColor = trend >= 0 ? "text-emerald-400" : "text-red-400";
  const trendIcon = trend >= 0 ? "↑" : "↓";

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-muted">{icon}</div>
        <div className={`text-xs font-medium ${trendColor}`}>
          {trendIcon} {Math.abs(trend)}%
        </div>
      </div>
      <p className="text-xs text-muted mb-1">{title}</p>
      <p className="text-2xl font-bold text-ivory">{value}</p>
    </div>
  );
}
