import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  Award,
  Target,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import {
  getEmployeeKPIs,
  getAllEmployeesKPIs,
  getKPITrends,
  getEmployeeRanking,
  type EmployeeKPIs,
  type KPITrend
} from "../services/trackingService";
import { getEmployees } from "../services/userService";

interface EmployeeKPIsDashboardProps {
  userId?: string;
  period?: { start: string; end: string };
}

export default function EmployeeKPIsDashboard({ 
  userId: propUserId, 
  period = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  }
}: EmployeeKPIsDashboardProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(propUserId || "");
  const [kpiData, setKpiData] = useState<EmployeeKPIs | null>(null);
  const [allKPIs, setAllKPIs] = useState<EmployeeKPIs[]>([]);
  const [trends, setTrends] = useState<{
    productivity: KPITrend[];
    sales: KPITrend[];
    orders: KPITrend[];
  }>({
    productivity: [],
    sales: [],
    orders: []
  });
  const [ranking, setRanking] = useState<Array<{ userId: string; userName: string; value: number; rank: number }>>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrend, setActiveTrend] = useState<"productivity" | "sales" | "orders">("productivity");

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [employeesData] = await Promise.all([
        getEmployees()
      ]);
      
      setEmployees(employeesData);
      
      if (selectedUserId) {
        const [kpiData, trendsData] = await Promise.all([
          getEmployeeKPIs(selectedUserId, period),
          getKPITrends(selectedUserId, activeTrend, period)
        ]);
        
        setKpiData(kpiData);
        setTrends(prev => ({ ...prev, [activeTrend]: trendsData }));
      }
      
      const [allKPIsData, rankingData] = await Promise.all([
        getAllEmployeesKPIs(period),
        getEmployeeRanking("productivity", period)
      ]);
      
      setAllKPIs(allKPIsData);
      setRanking(rankingData);
    } catch (error) {
      console.error("Error fetching KPI data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchData();
    }
  }, [selectedUserId, period, activeTrend]);

  // Handle employee selection
  const handleEmployeeChange = (userId: string) => {
    setSelectedUserId(userId);
    setKpiData(null);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-gold/20 via-violet/20 to-cyan/20 border border-gold/30">
            <TrendingUp className="text-gold" size={32} />
          </div>
          <div>
            <p className="text-xs text-gold font-bold uppercase tracking-wider mb-1">
              Nebula · Rendimiento
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Dashboard de KPIs
            </h1>
          </div>
        </div>

        <button className="flex items-center gap-3 h-12 px-5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-cyan/30 transition-all">
          <Download size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Exportar</span>
        </button>
      </motion.div>

      {/* Employee Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3 flex-wrap"
      >
        <button
          onClick={() => handleEmployeeChange("")}
          className={`
            flex items-center gap-3 px-5 h-12 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300
            ${!selectedUserId
              ? "bg-gradient-to-r from-gold/20 to-violet/20 text-gold border border-gold/30"
              : "bg-white/5 text-white/50 hover:text-white hover:border-white/20"
            }
          `}
        >
          Todos los Empleados
        </button>

        {employees.map((emp) => (
          <button
            key={emp._id}
            onClick={() => handleEmployeeChange(emp._id)}
            className={`
              flex items-center gap-3 px-5 h-12 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300
              ${selectedUserId === emp._id
                ? "bg-gradient-to-r from-gold/20 to-violet/20 text-gold border border-gold/30"
                : "bg-white/5 text-white/50 hover:text-white hover:border-white/20"
              }
            `}
          >
            {emp.name}
          </button>
        ))}
      </motion.div>

      {/* ================= INDIVIDUAL KPIs ================= */}
      {selectedUserId && kpiData ? (
        <div className="space-y-6">
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              label="Productividad"
              value={`${kpiData.productivityScore}`}
              unit="pts"
              icon={<Award size={20} className="text-lime" />}
              color="lime"
              target={85}
              rank={kpiData.rankAmongPeers}
              total={allKPIs.length}
            />
            <KPICard
              label="Ventas Totales"
              value={formatCurrency(kpiData.totalSales)}
              icon={<DollarSign size={20} className="text-gold" />}
              color="gold"
              target={kpiData.totalSales * 1.2}
            />
            <KPICard
              label="Pedidos"
              value={kpiData.ordersCompleted}
              icon={<ShoppingCart size={20} className="text-cyan" />}
              color="cyan"
              target={kpiData.ordersCompleted * 1.3}
            />
            <KPICard
              label="Tiempo Promedio"
              value={`${kpiData.averageOrderTime}`}
              unit="min"
              icon={<Clock size={20} className="text-violet" />}
              color="violet"
              target={kpiData.averageOrderTime * 0.8}
              inverse
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricDetail
              label="Pedidos Cancelados"
              value={kpiData.ordersCancelled}
              total={kpiData.ordersCompleted + kpiData.ordersCancelled}
              icon={<ShoppingCart size={20} className="text-red" />}
              color="red"
            />
            <MetricDetail
              label="Valor Promedio Pedido"
              value={formatCurrency(kpiData.averageOrderValue)}
              icon={<DollarSign size={20} className="text-gold" />}
              color="gold"
            />
            <MetricDetail
              label="Pedidos por Hora"
              value={kpiData.ordersPerHour.toFixed(1)}
              icon={<ShoppingCart size={20} className="text-cyan" />}
              color="cyan"
            />
          </div>

          {/* Activity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricDetail
              label="Sesiones Activas"
              value={kpiData.loginCount}
              icon={<Clock size={20} className="text-lime" />}
              color="lime"
            />
            <MetricDetail
              label="Tiempo Activo"
              value={`${Math.round(kpiData.totalActiveTime / 60)}h`}
              icon={<Clock size={20} className="text-gold" />}
              color="gold"
            />
            <MetricDetail
              label="Porcentaje Actividad"
              value={formatPercentage(kpiData.activeTimePercentage)}
              icon={<Target size={20} className="text-cyan" />}
              color="cyan"
            />
          </div>

          {/* Trends Chart */}
          <div className="rounded-[2rem] border border-white/5 bg-surface-2 backdrop-blur-xl overflow-hidden shadow-royale">
            <div className="p-6 border-b border-white/5 bg-surface-3/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3">
                  <TrendingUp size={16} className="text-lime" />
                  Tendencias
                </h2>
                <div className="flex gap-2">
                  {[
                    { key: "productivity", label: "Productividad" },
                    { key: "sales", label: "Ventas" },
                    { key: "orders", label: "Pedidos" }
                  ].map((trend) => (
                    <button
                      key={trend.key}
                      onClick={() => setActiveTrend(trend.key as any)}
                      className={`
                        px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                        ${activeTrend === trend.key
                          ? "bg-lime/10 text-lime border border-lime/30"
                          : "bg-surface-3 text-muted border border-white/5 hover:border-white/20"
                        }
                      `}
                    >
                      {trend.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6">
              <TrendChart trends={trends[activeTrend]} color={activeTrend === "productivity" ? "lime" : activeTrend === "sales" ? "gold" : "cyan"} />
            </div>
          </div>
        </div>
      ) : (
        /* ================= ALL EMPLOYEES VIEW ================= */
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/5 bg-surface-2 backdrop-blur-xl overflow-hidden shadow-royale">
            <div className="p-6 border-b border-white/5 bg-surface-3/50">
              <h2 className="text-xs font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3">
                <Award size={16} className="text-lime" />
                Ranking de Empleados
              </h2>
            </div>

            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-8 text-center">
                  <Clock size={32} className="text-lime mx-auto animate-spin mb-4" />
                  <p className="text-xs text-muted font-black uppercase tracking-widest">
                    Cargando datos...
                  </p>
                </div>
              ) : ranking.length === 0 ? (
                <div className="p-8 text-center">
                  <Award size={32} className="text-muted mx-auto mb-4" />
                  <p className="text-xs text-muted font-black uppercase tracking-widest">
                    No hay datos disponibles
                  </p>
                </div>
              ) : (
                ranking.map((item, index) => (
                  <div
                    key={item.userId}
                    className="px-6 py-4 hover:bg-white/5 transition-all flex items-center gap-4"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                      index === 0 ? "bg-gold text-bg" : index === 1 ? "bg-gray-400 text-bg" : index === 2 ? "bg-orange-700 text-bg" : "bg-surface-3 text-muted"
                    }`}>
                      #{item.rank}
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-sm font-black text-ivory uppercase tracking-wider">
                        {item.userName}
                      </div>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-wider">
                        Puntuación: {item.value.toFixed(1)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-lg font-black ${
                        item.value >= 80 ? "text-lime" : item.value >= 60 ? "text-gold" : "text-red"
                      }`}>
                        {item.value.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-wider">
                        pts
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* All KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full p-8 text-center">
                <Clock size={32} className="text-lime mx-auto animate-spin mb-4" />
                <p className="text-xs text-muted font-black uppercase tracking-widest">
                  Cargando KPIs...
                </p>
              </div>
            ) : allKPIs.length === 0 ? (
              <div className="col-span-full p-8 text-center">
                <TrendingUp size={32} className="text-muted mx-auto mb-4" />
                <p className="text-xs text-muted font-black uppercase tracking-widest">
                  No hay KPIs disponibles
                </p>
              </div>
            ) : (
              allKPIs.map((kpi) => (
                <EmployeeKPICard key={kpi.userId} kpi={kpi} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ================= COMPONENT: KPI CARD =================
interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color: "lime" | "gold" | "cyan" | "violet";
  target?: number;
  rank?: number;
  total?: number;
  inverse?: boolean;
}

const KPICard = ({ label, value, unit, icon, color, target, rank, total, inverse }: KPICardProps) => {
  const colorConfig = {
    lime: { bg: "from-emerald/20 to-green/10", border: "border-emerald/30", text: "text-emerald-400" },
    gold: { bg: "from-gold/20 to-amber/10", border: "border-gold/30", text: "text-gold" },
    cyan: { bg: "from-cyan/20 to-blue/10", border: "border-cyan/30", text: "text-cyan-400" },
    violet: { bg: "from-violet/20 to-purple/10", border: "border-violet/30", text: "text-violet-400" }
  };

  const config = colorConfig[color];

  const isTargetMet = target ? (
    inverse ? Number.parseFloat(String(value)) <= target : Number.parseFloat(String(value)) >= target
  ) : true;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-5 rounded-xl border bg-gradient-to-br ${config.bg} ${config.border} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={config.text}>{icon}</div>
        {rank !== undefined && total !== undefined && (
          <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
            #{rank} / {total}
          </div>
        )}
      </div>
      <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight uppercase flex items-baseline gap-2">
        {value}
        {unit && <span className="text-sm text-white/50">{unit}</span>}
      </div>
      {target && (
        <div className="mt-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isTargetMet ? "bg-emerald-400" : "bg-red-400"}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isTargetMet ? "text-emerald-400" : "text-red-400"}`}>
            {isTargetMet ? "Objetivo cumplido" : "Por debajo del objetivo"}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// ================= COMPONENT: METRIC DETAIL =================
interface MetricDetailProps {
  label: string;
  value: string | number;
  total?: number;
  icon: React.ReactNode;
  color: "lime" | "gold" | "cyan" | "red";
}

const MetricDetail = ({ label, value, total, icon, color }: MetricDetailProps) => {
  const colorConfig = {
    lime: { bg: "from-emerald/20 to-green/10", border: "border-emerald/30", text: "text-emerald-400" },
    gold: { bg: "from-gold/20 to-amber/10", border: "border-gold/30", text: "text-gold" },
    cyan: { bg: "from-cyan/20 to-blue/10", border: "border-cyan/30", text: "text-cyan-400" },
    red: { bg: "from-red/20 to-orange/10", border: "border-red/30", text: "text-red-400" }
  };

  const config = colorConfig[color];

  return (
    <div className={`p-4 rounded-xl border bg-gradient-to-br ${config.bg} ${config.border}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={config.text}>{icon}</div>
        <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-lg font-bold text-white">
        {value}
        {total && <span className="text-sm text-white/50 ml-2">/ {total}</span>}
      </div>
    </div>
  );
};

// ================= COMPONENT: EMPLOYEE KPI CARD =================
interface EmployeeKPICardProps {
  kpi: EmployeeKPIs;
}

const EmployeeKPICard = ({ kpi }: EmployeeKPICardProps) => {
  const productivityColor = kpi.productivityScore >= 80 ? "text-emerald-400" : kpi.productivityScore >= 60 ? "text-gold" : "text-red-400";
  const productivityBg = kpi.productivityScore >= 80 ? "bg-emerald/10 border-emerald/30" : kpi.productivityScore >= 60 ? "bg-gold/10 border-gold/30" : "bg-red/10 border-red/30";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-5 rounded-xl border border-white/10 bg-white/5 hover:border-cyan/30 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            {kpi.userName}
          </h3>
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
            {new Date(kpi.period.start).toLocaleDateString("es-ES")} - {new Date(kpi.period.end).toLocaleDateString("es-ES")}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-lg ${productivityBg} ${productivityColor} text-[10px] font-bold uppercase tracking-wider`}>
          {kpi.productivityScore} pts
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">
            Pedidos
          </div>
          <div className="text-lg font-bold text-white">
            {kpi.ordersCompleted}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">
            Ventas
          </div>
          <div className="text-lg font-bold text-white">
            {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(kpi.totalSales)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
          Ranking: #{kpi.rankAmongPeers}
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${kpi.percentile >= 75 ? "text-emerald-400" : kpi.percentile >= 50 ? "text-gold" : "text-red-400"}`}>
          Top {kpi.percentile}%
        </span>
      </div>
    </motion.div>
  );
};

// ================= COMPONENT: TREND CHART =================
interface TrendChartProps {
  trends: KPITrend[];
  color: "lime" | "gold" | "cyan";
}

const TrendChart = ({ trends, color }: TrendChartProps) => {
  const colorClasses = {
    lime: "bg-lime",
    gold: "bg-gold",
    cyan: "bg-cyan"
  };

  const maxTrend = Math.max(...trends.map(t => t.value), 1);

  return (
    <div className="h-40 flex items-end gap-2">
      {trends.map((trend, index) => (
        <div
          key={index}
          className="flex-1 flex flex-col items-center gap-2 group"
        >
          <div className="relative w-full h-full flex items-end">
            <div
              className={`w-full ${colorClasses[color]} rounded-t-lg transition-all group-hover:opacity-80`}
              style={{
                height: `${(trend.value / maxTrend) * 100}%`
              }}
            />
            {trend.target && (
              <div
                className="absolute w-full border-t-2 border-dashed border-white/30"
                style={{
                  bottom: `${(trend.target / maxTrend) * 100}%`
                }}
              />
            )}
          </div>
          <div className="text-[8px] text-muted font-bold uppercase tracking-wider rotate-45 origin-left">
            {new Date(trend.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
          </div>
        </div>
      ))}
    </div>
  );
};
