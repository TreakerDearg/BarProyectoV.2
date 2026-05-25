"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Clock, DollarSign, Users, Award, AlertTriangle, X, Calendar, Filter } from "lucide-react";
import { getTableAnalyticsById, generateTableAnalytics as apiGenerateTableAnalytics } from "../services/tableService";

interface AnalyticsData {
  table: {
    _id: string;
    number: number;
    capacity: number;
    location: string;
  };
  analytics: any[];
  historical: {
    averageRevenue: number;
    averageOccupancy: number;
    averageSessionDuration: number;
    totalRevenue: number;
    totalSessions: number;
  };
}

interface Props {
  tableId: string;
  onClose: () => void;
}

const COLORS = ["#d4a340", "#f59e0b", "#fbbf24", "#fcd34d", "#fef3c7"];

export default function TableAnalyticsDashboard({ tableId, onClose }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [tableId, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getTableAnalyticsById(tableId, { period });
      setData(result);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Error al cargar analytics");
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      await apiGenerateTableAnalytics(tableId, { date: today, period });
      await fetchAnalytics();
    } catch (err: any) {
      console.error("Error generating analytics:", err);
      setError("Error al generar analytics");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-white font-bold mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchAnalytics();
            }}
            className="btn btn-gold px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm mb-2"
          >
            Reintentar
          </button>
          <button onClick={onClose} className="text-muted hover:text-white">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-white font-bold mb-4">No hay datos de analytics</p>
          <button
            onClick={generateAnalytics}
            className="btn btn-gold px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm"
          >
            Generar Analytics
          </button>
          <button onClick={onClose} className="mt-4 text-muted hover:text-white">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const chartData = data.analytics.map((a: any) => ({
    date: new Date(a.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    revenue: a.revenue?.totalRevenue || 0,
    sessions: a.occupancy?.totalSessions || 0,
    occupancy: a.occupancy?.occupancyRate || 0,
  }));

  const paymentMethodsData = data.analytics.length > 0 ? [
    { name: 'Efectivo', value: data.analytics[0].payments?.paymentMethods?.cash || 0 },
    { name: 'Transferencia', value: data.analytics[0].payments?.paymentMethods?.transfer || 0 },
    { name: 'Tarjeta', value: data.analytics[0].payments?.paymentMethods?.card || 0 },
    { name: 'QR', value: data.analytics[0].payments?.paymentMethods?.qr || 0 },
  ].filter(item => item.value > 0) : [];

  const latestAnalytics = data.analytics[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-6xl glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-8 border-b border-white/10 flex justify-between items-start sticky top-0 bg-surface-1/95 backdrop-blur-sm z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-gold" />
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Analytics de Mesa</p>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Mesa #{data.table.number} <span className="text-gold">· {data.table.location}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        {/* CONTROLS */}
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
          <Filter size={14} className="text-muted" />
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  period === p
                    ? "bg-gold text-black shadow-gold-glow"
                    : "bg-white/5 text-muted hover:bg-white/10 border border-white/10"
                }`}
              >
                {p === "daily" ? "Diario" : p === "weekly" ? "Semanal" : "Mensual"}
              </button>
            ))}
          </div>
          <button
            onClick={generateAnalytics}
            className="ml-auto px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2"
          >
            <Calendar size={12} />
            Actualizar
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-8">
          {/* KPI CARDS */}
          <div className="grid grid-cols-4 gap-6">
            <KPICard
              label="Revenue Total"
              value={`$${(data.historical.totalRevenue).toFixed(2)}`}
              icon={<DollarSign size={16} />}
              color="gold"
              trend={latestAnalytics?.revenue?.totalRevenue > data.historical.averageRevenue ? "up" : "down"}
            />
            <KPICard
              label="Sesiones"
              value={data.historical.totalSessions}
              icon={<Users size={16} />}
              color="blue"
              trend={latestAnalytics?.occupancy?.totalSessions > data.historical.totalSessions / data.analytics.length ? "up" : "down"}
            />
            <KPICard
              label="Ocupación Promedio"
              value={`${data.historical.averageOccupancy.toFixed(1)}%`}
              icon={<TrendingUp size={16} />}
              color="green"
              trend={latestAnalytics?.occupancy?.occupancyRate > data.historical.averageOccupancy ? "up" : "down"}
            />
            <KPICard
              label="Duración Sesión"
              value={`${Math.round(data.historical.averageSessionDuration)} min`}
              icon={<Clock size={16} />}
              color="purple"
            />
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-2 gap-8">
            {/* REVENUE CHART */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Revenue por Período</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={10} />
                  <YAxis stroke="#888888" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="revenue" fill="#d4a340" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* OCCUPANCY CHART */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Ocupación</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={10} />
                  <YAxis stroke="#888888" fontSize={10} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="occupancy" stroke="#d4a340" strokeWidth={2} dot={{ fill: '#d4a340' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          {paymentMethodsData.length > 0 && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Métodos de Pago</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={paymentMethodsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentMethodsData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ml-8 space-y-2">
                  {paymentMethodsData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs font-bold text-muted">{item.name}</span>
                      <span className="text-xs font-black text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PERFORMANCE METRICS */}
          {latestAnalytics && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Métricas de Rendimiento</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Score de Rendimiento</p>
                  <p className="text-2xl font-black text-white">{latestAnalytics.performance?.score || 0}/100</p>
                  <p className={`text-xs font-bold ${latestAnalytics.performanceGrade === 'A' ? 'text-green-400' : latestAnalytics.performanceGrade === 'F' ? 'text-red-400' : 'text-gold'}`}>
                    Grado: {latestAnalytics.performanceGrade}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Tasa de Rotación</p>
                  <p className="text-2xl font-black text-white">{latestAnalytics.performance?.turnoverRate?.toFixed(2) || 0}/hora</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Eficiencia</p>
                  <p className="text-2xl font-black text-white">${latestAnalytics.performance?.efficiency?.toFixed(2) || 0}/min</p>
                </div>
              </div>

              {/* ALERTS */}
              {latestAnalytics.alerts && (latestAnalytics.alerts.longSessions > 0 || latestAnalytics.alerts.lowRevenue > 0) && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-red-500" />
                    <p className="text-xs font-black text-red-400 uppercase tracking-widest">Alertas Detectadas</p>
                  </div>
                  <ul className="text-xs font-bold text-white/70 space-y-1">
                    {latestAnalytics.alerts.longSessions > 0 && (
                      <li>• {latestAnalytics.alerts.longSessions} sesiones con duración excesiva</li>
                    )}
                    {latestAnalytics.alerts.lowRevenue > 0 && (
                      <li>• {latestAnalytics.alerts.lowRevenue} sesiones con revenue bajo</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down";
}

function KPICard({ label, value, icon, color, trend }: KPICardProps) {
  const colorClasses = {
    gold: "text-gold",
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
  };

  return (
    <div className="glass rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-/20 ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
            {trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}
