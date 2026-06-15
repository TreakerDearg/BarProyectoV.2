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
  getPeakHoursByShift,
  getIntegratedShiftMetrics,
  getIntegratedShiftMetricsRange,
  getEmployeeGroupedMetrics,
  getComparativeShiftMetrics,
  type IntegratedShiftMetrics
} from "../services/trackingService";
import AdminTutorialModal from "../components/AdminTutorialModal";
import EmployeePerformanceCard from "../components/EmployeePerformanceCard";
import ShiftComparisonChart from "../components/ShiftComparisonChart";
import "../../../styles/nebula-obsidian-theme.css";

export default function ShiftMetricsPage() {
  const [selectedShift, setSelectedShift] = useState<"morning" | "afternoon" | "night" | "event">("morning");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [metrics, setMetrics] = useState<IntegratedShiftMetrics | null>(null);
  const [rangeMetrics, setRangeMetrics] = useState<IntegratedShiftMetrics[]>([]);
  const [peakHours, setPeakHours] = useState<{ hour: string; activityLevel: number }[]>([]);
  const [employeeMetrics, setEmployeeMetrics] = useState<any[]>([]);
  const [comparativeMetrics, setComparativeMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"day" | "range" | "employee" | "comparative">("day");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds default
  const tutorialSteps = [
    { title: "1. Selecciona vista", description: "Diario para detalle puntual, Rango para tendencia de 30 dias." },
    { title: "2. Elige turno y fecha", description: "Filtra manana, tarde, noche o evento para comparar rendimiento real." },
    { title: "3. Lee indicadores clave", description: "Prioriza ventas, productividad y tiempo promedio para ajustar dotacion." }
  ];
  
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
          getIntegratedShiftMetrics(selectedShift, selectedDate),
          getPeakHoursByShift(selectedShift, {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: selectedDate
          })
        ]);

        setMetrics(metricsData);
        setPeakHours(peakHoursData);
      } else if (viewMode === "range") {
        const rangeData = await getIntegratedShiftMetricsRange(selectedShift, {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        });

        setRangeMetrics(rangeData);
      } else if (viewMode === "employee") {
        const employeeData = await getEmployeeGroupedMetrics({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        });
        setEmployeeMetrics(employeeData);
      } else if (viewMode === "comparative") {
        const comparativeData = await getComparativeShiftMetrics({
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        });
        setComparativeMetrics(comparativeData);
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

  // Auto-refresh effect
  useEffect(() => {
    let intervalId: number | null = null;

    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        fetchData();
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, selectedShift, selectedDate, viewMode]);

  // Update last updated timestamp
  useEffect(() => {
    if (!loading) {
      setLastUpdated(new Date());
    }
  }, [loading]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    }).format(value);
  };

  // Get shift config
  const getShiftConfig = (type: string) => {
    return shiftTypes.find(s => s.key === type) || shiftTypes[0];
  };

  const shiftConfig = getShiftConfig(selectedShift);

  return (
    <div className="min-h-screen fused-bg p-4 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="fused-aurora" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 fused-animate-fade-in-up">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-fused-gold opacity-20 blur-xl rounded-2xl animate-pulse" />
              <div className="relative p-5 glass-card">
                <Clock className="text-[#d4af37]" size={36} />
              </div>
            </div>
            <div>
              <p className="text-xs text-[#d4af37] font-semibold tracking-[0.3em] uppercase mb-2 opacity-80">
                Análisis por Turno
              </p>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Métricas de
                <span className="gradient-text"> Turnos</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AdminTutorialModal title="Metricas de turnos" subtitle="Tutorial de lectura rapida para detectar desbalances operativos." steps={tutorialSteps} />
            <button className="flex items-center gap-3 h-11 md:h-12 px-4 md:px-6 rounded-xl glass-card text-white/80 hover:text-white transition-all border border-white/10">
              <Download size={18} />
              <span className="text-sm font-semibold">Exportar</span>
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 h-11 md:h-12 px-4 md:px-6 rounded-xl transition-all ${
                autoRefresh
                  ? "fused-btn-primary"
                  : "glass-card text-white/80 hover:text-white border border-white/10"
              }`}
            >
              <Clock size={18} className={autoRefresh ? "animate-spin" : ""} />
              <span className="text-sm font-semibold">
                {autoRefresh ? "Auto: ON" : "Auto: OFF"}
              </span>
            </button>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-fused-text-secondary">
                <Clock size={14} />
                <span>Actualizado: {lastUpdated.toLocaleTimeString("es-MX")}</span>
              </div>
            )}
          </div>
        </div>

        {/* ================= CONTROLS ================= */}
        <div className="fused-glass-card p-6 fused-animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap gap-4 items-center">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("day")}
                className={`flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  viewMode === "day"
                    ? "fused-btn-primary"
                    : "glass-card text-fused-text-muted hover:text-fused-text-primary"
                }`}
              >
                <Calendar size={18} />
                Diario
              </button>
              <button
                onClick={() => setViewMode("range")}
                className={`flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  viewMode === "range"
                    ? "fused-btn-primary"
                    : "glass-card text-fused-text-muted hover:text-fused-text-primary"
                }`}
              >
                <BarChart3 size={18} />
                Rango (30 días)
              </button>
              <button
                onClick={() => setViewMode("employee")}
                className={`flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  viewMode === "employee"
                    ? "fused-btn-primary"
                    : "glass-card text-fused-text-muted hover:text-fused-text-primary"
                }`}
              >
                <Target size={18} />
                Por Empleado
              </button>
              <button
                onClick={() => setViewMode("comparative")}
                className={`flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  viewMode === "comparative"
                    ? "fused-btn-primary"
                    : "glass-card text-fused-text-muted hover:text-fused-text-primary"
                }`}
              >
                <TrendingUp size={18} />
                Comparativo
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
                      ? `bg-fused-bg-tertiary border-2 text-fused-text-primary`
                      : "fused-glass-card text-fused-text-tertiary hover:text-fused-text-primary border border-fused-glass-border"
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
                className="h-12 px-4 rounded-xl bg-fused-bg-tertiary border border-fused-glass-border text-fused-text-primary font-medium focus:outline-none focus:border-fused-gold/50 transition-all"
              />
            )}

            {/* Refresh Interval Selector */}
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="h-12 px-4 rounded-xl bg-fused-bg-tertiary border border-fused-glass-border text-fused-text-primary font-medium focus:outline-none focus:border-fused-gold/50 transition-all"
              >
                <option value={30000}>30s</option>
                <option value={60000}>1 min</option>
                <option value={300000}>5 min</option>
              </select>
            )}
          </div>
        </div>

        {/* ================= DAY VIEW ================= */}
        {viewMode === "day" && metrics && (
          <div className="space-y-8 fused-animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Main Metrics - Integrated */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <ShiftMetricCard
                label="Pedidos Totales"
                value={metrics.ordersData.totalOrders}
                icon={<ShoppingCart size={24} className="text-fused-neon-blue" />}
                color="#00d4ff"
                change={metrics.comparisonWithPreviousPeriod?.ordersChange}
              />
              <ShiftMetricCard
                label="Ventas Totales"
                value={formatCurrency(metrics.ordersData.totalSales)}
                icon={<DollarSign size={24} className="text-fused-gold" />}
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
                icon={<TrendingUp size={20} className="text-fused-neon-green" />}
                color="#00ff88"
              />
              <SecondaryMetricCard
                label="Valor Promedio"
                value={formatCurrency(metrics.averageOrderValue)}
                icon={<DollarSign size={20} className="text-fused-gold" />}
                color="#d4af37"
              />
              <SecondaryMetricCard
                label="Pedidos por Empleado"
                value={metrics.averageOrderPerEmployee.toFixed(1)}
                icon={<ShoppingCart size={20} className="text-fused-neon-blue" />}
                color="#00d4ff"
              />
            </div>

            {/* Peak Hours */}
            <div className="fused-glass-card fused-animate-fade-in-up">
              <div className="p-6 border-b border-fused-glass-border">
                <h2 className="text-xl font-bold text-fused-text-primary flex items-center gap-3" style={{ fontFamily: 'var(--fused-font-display)' }}>
                  <TrendingUp className="text-fused-gold" size={24} />
                  Horas Pico de Actividad
                </h2>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="text-center">
                    <Clock size={48} className="text-fused-gold mx-auto animate-spin mb-4" />
                    <p className="text-fused-text-secondary font-semibold tracking-wide">Analizando datos...</p>
                  </div>
                ) : peakHours.length === 0 ? (
                  <div className="text-center">
                    <Target size={48} className="text-fused-text-tertiary mx-auto mb-4" />
                    <p className="text-fused-text-tertiary font-semibold tracking-wide">No hay datos de horas pico</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {peakHours.map((peak, index) => {
                      const maxActivity = Math.max(...peakHours.map(p => p.activityLevel));
                      
                      return (
                        <div
                          key={index}
                          className="text-center p-4 rounded-xl bg-fused-bg-tertiary border border-fused-glass-border"
                        >
                          <div className="text-xs text-fused-text-tertiary font-bold uppercase tracking-widest mb-3">
                            {peak.hour}
                          </div>
                          <div
                            className="h-16 rounded-lg relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${shiftConfig.color} 0%, transparent 100%)`,
                              opacity: 0.2 + (peak.activityLevel / maxActivity) * 0.8
                            }}
                          >
                            <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-fused-text-primary">
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
          <div className="fused-glass-card fused-animate-fade-in-up">
            <div className="p-6 border-b border-fused-glass-border">
              <h2 className="text-xl font-bold text-fused-text-primary flex items-center gap-3" style={{ fontFamily: 'var(--fused-font-display)' }}>
                <Calendar size={24} className="text-fused-gold" />
                Métricas Diarias (Últimos 30 días)
              </h2>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center">
                  <Clock size={48} className="text-fused-gold mx-auto animate-spin mb-4" />
                  <p className="text-fused-text-secondary font-semibold tracking-wide">Cargando datos...</p>
                </div>
              ) : rangeMetrics.length === 0 ? (
                <div className="text-center">
                  <BarChart3 size={48} className="text-fused-text-tertiary mx-auto mb-4" />
                  <p className="text-fused-text-tertiary font-semibold tracking-wide">No hay datos disponibles</p>
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

        {/* ================= EMPLOYEE VIEW ================= */}
        {viewMode === "employee" && (
          <div className="space-y-6 fused-animate-fade-in-up">
            <div className="fused-glass-card p-6 border-b border-fused-glass-border">
              <h2 className="text-xl font-bold text-fused-text-primary flex items-center gap-3" style={{ fontFamily: 'var(--fused-font-display)' }}>
                <Target size={24} className="text-fused-gold" />
                Rendimiento por Empleado (Últimos 30 días)
              </h2>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center">
                  <Clock size={48} className="text-fused-gold mx-auto animate-spin mb-4" />
                  <p className="text-fused-text-secondary font-semibold tracking-wide">Cargando datos...</p>
                </div>
              ) : employeeMetrics.length === 0 ? (
                <div className="text-center">
                  <Target size={48} className="text-fused-text-tertiary mx-auto mb-4" />
                  <p className="text-fused-text-tertiary font-semibold tracking-wide">No hay datos disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {employeeMetrics.map((employee) => (
                    <EmployeePerformanceCard
                      key={employee.userId}
                      employee={employee}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= COMPARATIVE VIEW ================= */}
        {viewMode === "comparative" && (
          <div className="space-y-6 fused-animate-fade-in-up">
            <div className="fused-glass-card p-6 border-b border-fused-glass-border">
              <h2 className="text-xl font-bold text-fused-text-primary flex items-center gap-3" style={{ fontFamily: 'var(--fused-font-display)' }}>
                <TrendingUp size={24} className="text-fused-gold" />
                Comparación entre Turnos
              </h2>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center">
                  <Clock size={48} className="text-fused-gold mx-auto animate-spin mb-4" />
                  <p className="text-fused-text-secondary font-semibold tracking-wide">Cargando datos...</p>
                </div>
              ) : !comparativeMetrics ? (
                <div className="text-center">
                  <BarChart3 size={48} className="text-fused-text-tertiary mx-auto mb-4" />
                  <p className="text-fused-text-tertiary font-semibold tracking-wide">No hay datos disponibles</p>
                </div>
              ) : (
                <ShiftComparisonChart
                  comparativeMetrics={comparativeMetrics}
                  formatCurrency={formatCurrency}
                />
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
              isPositive ? "text-fused-neon-green" : "text-fused-neon-red"
            }`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider mb-2">
          {label}
        </div>
        <div className="text-3xl font-black text-fused-text-primary tracking-tight flex items-baseline gap-2" style={{ fontFamily: 'var(--fused-font-display)' }}>
          {value}
          {unit && <span className="text-sm text-fused-text-secondary">{unit}</span>}
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
    <div className="p-6 rounded-xl bg-fused-bg-tertiary border border-fused-glass-border hover:border-fused-gold/30 transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br opacity-30 blur-lg rounded-lg" style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }} />
          <div className="relative p-3 rounded-lg bg-fused-bg-tertiary border border-fused-glass-border">
            {icon}
          </div>
        </div>
        <span className="text-xs text-fused-text-tertiary font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-fused-text-primary tracking-tight flex items-baseline gap-2">
        {value}
        {total && <span className="text-sm text-fused-text-secondary">/ {total}</span>}
      </div>
    </div>
  );
};

// ================= COMPONENT: DAY METRIC CARD =================
interface DayMetricCardProps {
  metric: IntegratedShiftMetrics;
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
    <div className="p-5 rounded-xl bg-fused-bg-tertiary border border-fused-glass-border hover:border-fused-gold/30 transition-all fused-animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className={`text-sm font-bold uppercase tracking-wider mb-1`} style={{ color: shiftConfig.color }}>
            {shiftConfig.label}
          </div>
          <div className="text-xs text-fused-text-tertiary font-bold uppercase tracking-wider">
            {new Date(metric.date).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
          </div>
        </div>
        <div className={`text-2xl font-black ${metric.totalProductivityScore >= 75 ? "text-fused-neon-green" : metric.totalProductivityScore >= 50 ? "text-fused-gold" : "text-fused-neon-red"}`}>
          {metric.totalProductivityScore.toFixed(1)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-fused-text-tertiary font-bold uppercase tracking-wider mb-1">
            Pedidos
          </div>
          <div className="text-sm font-bold text-fused-text-primary">
            {metric.totalOrders}
          </div>
        </div>
        <div>
          <div className="text-xs text-fused-text-tertiary font-bold uppercase tracking-wider mb-1">
            Ventas
          </div>
          <div className="text-sm font-bold text-fused-text-primary">
            {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(metric.totalSales)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-fused-glass-border flex items-center justify-between">
        <span className="text-xs text-fused-text-tertiary font-bold uppercase tracking-wider">
          {metric.employeesPresent} empleados
        </span>
        <span className={`text-xs font-bold uppercase tracking-wider ${
          metric.comparisonWithPreviousPeriod?.salesChange > 0 ? "text-fused-neon-green" : "text-fused-neon-red"
        }`}>
          {metric.comparisonWithPreviousPeriod?.salesChange > 0 ? "+" : ""}
          {metric.comparisonWithPreviousPeriod?.salesChange.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
