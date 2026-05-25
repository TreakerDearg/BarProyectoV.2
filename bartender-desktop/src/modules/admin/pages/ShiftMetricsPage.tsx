import { useState, useEffect } from "react";
import { 
  Clock, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  BarChart3,
  Calendar,
  Download,
  Flame,
  Sparkles,
  Award,
  Target
} from "lucide-react";
import {
  getShiftMetrics,
  getShiftMetricsRange,
  getPeakHoursByShift,
  type ShiftMetrics
} from "../services/trackingService";
import "../styles/luxury-theme.css";

export default function ShiftMetricsPage() {
  const [selectedShift, setSelectedShift] = useState<"morning" | "afternoon" | "night" | "event">("morning");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [metrics, setMetrics] = useState<ShiftMetrics | null>(null);
  const [rangeMetrics, setRangeMetrics] = useState<ShiftMetrics[]>([]);
  const [peakHours, setPeakHours] = useState<{ hour: string; activityLevel: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"day" | "range">("day");
  
  const shiftTypes = [
    { key: "morning" as const, label: "Mañana", color: "#00ff88", icon: <Flame size={20} />, gradient: "from-[#00ff88] to-[#00d4ff]" },
    { key: "afternoon" as const, label: "Tarde", color: "#d4af37", icon: <Sparkles size={20} />, gradient: "from-[#d4af37] to-[#f4e4a6]" },
    { key: "night" as const, label: "Noche", color: "#b147ff", icon: <Clock size={20} />, gradient: "from-[#b147ff] to-[#ff47ab]" },
    { key: "event" as const, label: "Evento", color: "#00d4ff", icon: <Award size={20} />, gradient: "from-[#00d4ff] to-[#b147ff]" }
  ];

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (viewMode === "day") {
        const [metricsData, peakHoursData] = await Promise.all([
          getShiftMetrics(selectedShift, selectedDate),
          getPeakHoursByShift(selectedShift, {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: selectedDate
          })
        ]);
        
        setMetrics(metricsData);
        setPeakHours(peakHoursData);
      } else {
        const rangeData = await getShiftMetricsRange(selectedShift, {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        });
        
        setRangeMetrics(rangeData);
      }
    } catch (error) {
      console.error("Error fetching shift metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedShift, selectedDate, viewMode]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(value);
  };

  // Get shift config
  const getShiftConfig = (type: string) => {
    return shiftTypes.find(s => s.key === type) || shiftTypes[0];
  };

  const shiftConfig = getShiftConfig(selectedShift);

  return (
    <div className="min-h-screen luxury-bg p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial opacity-20 rounded-full blur-2xl" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* ================= HEADER ================= */}
        <div className="flex items-end justify-between animate-fade-in-up">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-gold opacity-20 blur-xl rounded-2xl animate-pulse" />
              <div className="relative p-5 glass-card">
                <Clock className="text-[#d4af37]" size={36} />
              </div>
            </div>
            <div>
              <p className="text-xs text-[#d4af37] font-semibold tracking-[0.3em] uppercase mb-2 opacity-80">
                Análisis por Turno
              </p>
              <h1 className="text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Métricas de
                <span className="gradient-text"> Turnos</span>
              </h1>
            </div>
          </div>

          <button className="flex items-center gap-3 h-12 px-6 rounded-xl glass-card text-white/80 hover:text-white transition-all border border-white/10">
            <Download size={20} />
            <span className="text-sm font-semibold">Exportar</span>
          </button>
        </div>

        {/* ================= CONTROLS ================= */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap gap-4 items-center">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("day")}
                className={`flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  viewMode === "day"
                    ? "bg-gradient-gold text-black"
                    : "glass-card text-white/60 hover:text-white"
                }`}
              >
                <Calendar size={18} />
                Diario
              </button>
              <button
                onClick={() => setViewMode("range")}
                className={`flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  viewMode === "range"
                    ? "bg-gradient-gold text-black"
                    : "glass-card text-white/60 hover:text-white"
                }`}
              >
                <BarChart3 size={18} />
                Rango (30 días)
              </button>
            </div>

            {/* Shift Selector */}
            <div className="flex gap-2 flex-wrap">
              {shiftTypes.map((shift) => (
                <button
                  key={shift.key}
                  onClick={() => setSelectedShift(shift.key)}
                  className={`
                    flex items-center gap-2 px-4 h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all
                    ${selectedShift === shift.key
                      ? `bg-white/5 border-2 text-white`
                      : "glass-card text-white/40 hover:text-white"
                  }`}
                  style={selectedShift === shift.key ? { borderColor: shift.color } : {}}
                >
                  {shift.icon}
                  {shift.label}
                </button>
              ))}
            </div>

            {/* Date Picker (only for day view) */}
            {viewMode === "day" && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37]/50 transition-all"
              />
            )}
          </div>
        </div>

        {/* ================= DAY VIEW ================= */}
        {viewMode === "day" && metrics && (
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <ShiftMetricCard
                label="Pedidos Totales"
                value={metrics.totalOrders}
                icon={<ShoppingCart size={24} className="text-[#00d4ff]" />}
                color="#00d4ff"
                change={metrics.comparisonWithPreviousPeriod?.ordersChange}
              />
              <ShiftMetricCard
                label="Ventas Totales"
                value={formatCurrency(metrics.totalSales)}
                icon={<DollarSign size={24} className="text-[#d4af37]" />}
                color="#d4af37"
                change={metrics.comparisonWithPreviousPeriod?.salesChange}
              />
              <ShiftMetricCard
                label="Productividad"
                value={metrics.totalProductivityScore.toFixed(1)}
                unit="pts"
                icon={<TrendingUp size={24} className="text-[#00ff88]" />}
                color="#00ff88"
                change={metrics.comparisonWithPreviousPeriod?.productivityChange}
              />
              <ShiftMetricCard
                label="Tiempo Promedio"
                value={`${metrics.averageOrderTime.toFixed(1)} min`}
                icon={<Clock size={24} className="text-[#b147ff]" />}
                color="#b147ff"
                inverse
              />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SecondaryMetricCard
                label="Personal Presente"
                value={metrics.employeesPresent}
                total={metrics.employeesScheduled}
                icon={<TrendingUp size={20} className="text-[#00ff88]" />}
                color="#00ff88"
              />
              <SecondaryMetricCard
                label="Valor Promedio"
                value={formatCurrency(metrics.averageOrderValue)}
                icon={<DollarSign size={20} className="text-[#d4af37]" />}
                color="#d4af37"
              />
              <SecondaryMetricCard
                label="Pedidos por Empleado"
                value={metrics.averageOrderPerEmployee.toFixed(1)}
                icon={<ShoppingCart size={20} className="text-[#00d4ff]" />}
                color="#00d4ff"
              />
            </div>

            {/* Peak Hours */}
            <div className="glass-card animate-fade-in-up">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
                  <TrendingUp className="text-[#d4af37]" size={24} />
                  Horas Pico de Actividad
                </h2>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="text-center">
                    <Clock size={48} className="text-[#d4af37] mx-auto animate-spin mb-4" />
                    <p className="text-white/60 font-semibold tracking-wide">Analizando datos...</p>
                  </div>
                ) : peakHours.length === 0 ? (
                  <div className="text-center">
                    <Target size={48} className="text-white/20 mx-auto mb-4" />
                    <p className="text-white/40 font-semibold tracking-wide">No hay datos de horas pico</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {peakHours.map((peak, index) => {
                      const maxActivity = Math.max(...peakHours.map(p => p.activityLevel));
                      
                      return (
                        <div
                          key={index}
                          className="text-center p-4 rounded-xl bg-white/5 border border-white/10"
                        >
                          <div className="text-xs text-white/40 font-bold uppercase tracking-widest mb-3">
                            {peak.hour}
                          </div>
                          <div
                            className="h-16 rounded-lg relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${shiftConfig.color} 0%, transparent 100%)`,
                              opacity: 0.2 + (peak.activityLevel / maxActivity) * 0.8
                            }}
                          >
                            <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-white">
                              {Math.round(peak.activityLevel)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= RANGE VIEW ================= */}
        {viewMode === "range" && (
          <div className="glass-card animate-fade-in-up">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
                <Calendar size={24} className="text-[#d4af37]" />
                Métricas Diarias (Últimos 30 días)
              </h2>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center">
                  <Clock size={48} className="text-[#d4af37] mx-auto animate-spin mb-4" />
                  <p className="text-white/60 font-semibold tracking-wide">Cargando datos...</p>
                </div>
              ) : rangeMetrics.length === 0 ? (
                <div className="text-center">
                  <BarChart3 size={48} className="text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 font-semibold tracking-wide">No hay datos disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rangeMetrics.map((metric, index) => (
                    <DayMetricCard key={`${metric.shiftType}-${metric.date}`} metric={metric} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================= COMPONENT: SHIFT METRIC CARD =================
interface ShiftMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  change?: number;
  inverse?: boolean;
}

const ShiftMetricCard = ({ label, value, unit, icon, color, change, inverse }: ShiftMetricCardProps) => {
  const isPositive = change !== undefined ? (inverse ? change <= 0 : change >= 0) : null;

  return (
    <div className="metric-card group">
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br opacity-30 blur-xl rounded-xl" style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }} />
            <div className="relative p-4 rounded-xl bg-white/5 border border-white/10">
              {icon}
            </div>
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${
              isPositive ? "text-[#00ff88]" : "text-[#ff4757]"
            }`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-2">
          {label}
        </div>
        <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          {value}
          {unit && <span className="text-sm text-white/40">{unit}</span>}
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-radial opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
      </div>
    </div>
  );
};

// ================= COMPONENT: SECONDARY METRIC CARD =================
interface SecondaryMetricCardProps {
  label: string;
  value: string | number;
  total?: number;
  icon: React.ReactNode;
  color: string;
}

const SecondaryMetricCard = ({ label, value, total, icon, color }: SecondaryMetricCardProps) => {
  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br opacity-30 blur-lg rounded-lg" style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }} />
          <div className="relative p-3 rounded-lg bg-white/5 border border-white/10">
            {icon}
          </div>
        </div>
        <span className="text-xs text-white/50 font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
        {value}
        {total && <span className="text-sm text-white/40">/ {total}</span>}
      </div>
    </div>
  );
};

// ================= COMPONENT: DAY METRIC CARD =================
interface DayMetricCardProps {
  metric: ShiftMetrics;
  index: number;
}

const DayMetricCard = ({ metric, index }: DayMetricCardProps) => {
  const shiftConfig = {
    morning: { label: "Mañana", color: "#00ff88" },
    afternoon: { label: "Tarde", color: "#d4af37" },
    night: { label: "Noche", color: "#b147ff" },
    event: { label: "Evento", color: "#00d4ff" }
  }[metric.shiftType] || { label: metric.shiftType, color: "#00d4ff" };

  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className={`text-sm font-bold uppercase tracking-wider mb-1`} style={{ color: shiftConfig.color }}>
            {shiftConfig.label}
          </div>
          <div className="text-xs text-white/40 font-bold uppercase tracking-wider">
            {new Date(metric.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
          </div>
        </div>
        <div className={`text-2xl font-black ${metric.totalProductivityScore >= 75 ? "text-[#00ff88]" : metric.totalProductivityScore >= 50 ? "text-[#d4af37]" : "text-[#ff4757]"}`}>
          {metric.totalProductivityScore.toFixed(1)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">
            Pedidos
          </div>
          <div className="text-sm font-bold text-white">
            {metric.totalOrders}
          </div>
        </div>
        <div>
          <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">
            Ventas
          </div>
          <div className="text-sm font-bold text-white">
            {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(metric.totalSales)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-white/40 font-bold uppercase tracking-wider">
          {metric.employeesPresent} empleados
        </span>
        <span className={`text-xs font-bold uppercase tracking-wider ${
          metric.comparisonWithPreviousPeriod?.salesChange > 0 ? "text-[#00ff88]" : "text-[#ff4757]"
        }`}>
          {metric.comparisonWithPreviousPeriod?.salesChange > 0 ? "+" : ""}
          {metric.comparisonWithPreviousPeriod?.salesChange.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
