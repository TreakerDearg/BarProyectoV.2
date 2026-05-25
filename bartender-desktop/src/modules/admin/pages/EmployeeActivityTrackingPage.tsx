import { useState, useEffect } from "react";
import { 
  Activity, 
  Clock, 
  Filter, 
  Search, 
  User as UserIcon, 
  Sparkles,
  TrendingUp,
  Eye,
  RefreshCw,
  Zap,
  Flame,
  Wifi,
  WifiOff
} from "lucide-react";
import {
  getActivityLogs,
  getActivityMetrics,
  type ActivityLog,
  type ActivityMetrics,
  type ActivityType
} from "../services/trackingService";
import { getEmployees } from "../services/userService";
import socketService from "../../../services/socketService";
import "../styles/luxury-theme.css";

export default function EmployeeActivityTrackingPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  
  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | "">("");
  const [selectedShift, setSelectedShift] = useState<string>("");
  
  const activityTypes: { key: ActivityType; label: string; color: string; icon: React.ReactNode }[] = [
    { key: "login", label: "Login", color: "text-[#00ff88]", icon: <Zap size={14} /> },
    { key: "logout", label: "Logout", color: "text-[#ff4757]", icon: <Zap size={14} /> },
    { key: "order_created", label: "Pedido", color: "text-[#00d4ff]", icon: <Activity size={14} /> },
    { key: "order_completed", label: "Completado", color: "text-[#00ff88]", icon: <Sparkles size={14} /> },
    { key: "order_cancelled", label: "Cancelado", color: "text-[#ff4757]", icon: <Activity size={14} /> },
    { key: "payment_processed", label: "Pago", color: "text-[#d4af37]", icon: <Flame size={14} /> },
    { key: "inventory_updated", label: "Inventario", color: "text-[#b147ff]", icon: <Activity size={14} /> },
    { key: "discount_applied", label: "Descuento", color: "text-[#ffaa00]", icon: <Sparkles size={14} /> },
    { key: "table_assigned", label: "Mesa", color: "text-[#00d4ff]", icon: <Eye size={14} /> },
    { key: "menu_viewed", label: "Menú", color: "text-[#00d4ff]", icon: <Eye size={14} /> },
    { key: "roulette_used", label: "Ruleta", color: "text-[#ff47ab]", icon: <Sparkles size={14} /> },
    { key: "permission_change", label: "Permisos", color: "text-[#ffaa00]", icon: <Activity size={14} /> },
  ];

  const shifts = ["morning", "afternoon", "night", "event"];

  // WebSocket connection
  useEffect(() => {
    let mounted = true;

    const connectSocket = async () => {
      try {
        await socketService.connect();
        if (mounted) {
          setSocketConnected(true);
          
          // Unirse a la room de actividad
          socketService.joinRoom("activity");
          
          // Escuchar nuevas actividades
          socketService.on("activity:new", (newActivity: ActivityLog) => {
            if (mounted) {
              setActivities(prev => [newActivity, ...prev].slice(0, 50));
            }
          });

          // Escuchar actividades actualizadas
          socketService.on("activity:updated", (updatedActivity: ActivityLog) => {
            if (mounted) {
              setActivities(prev => 
                prev.map(a => a._id === updatedActivity._id ? updatedActivity : a)
              );
            }
          });
        }
      } catch (error) {
        console.error("Error conectando a WebSocket:", error);
        if (mounted) {
          setSocketConnected(false);
        }
      }
    };

    if (realtimeEnabled) {
      connectSocket();
    }

    return () => {
      mounted = false;
      socketService.off("activity:new");
      socketService.off("activity:updated");
      socketService.leaveRoom("activity");
    };
  }, [realtimeEnabled]);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [activitiesData, metricsData, employeesData] = await Promise.all([
        getActivityLogs({
          userId: selectedEmployee || undefined,
          activityType: selectedActivityType || undefined,
          shift: selectedShift || undefined,
          limit: 50
        }),
        getActivityMetrics(selectedEmployee || undefined),
        getEmployees()
      ]);
      
      setActivities(activitiesData);
      setMetrics(metricsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching activity data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and auto-refresh (solo si WebSocket no está conectado)
  useEffect(() => {
    fetchData();
    
    // Solo usar polling si WebSocket no está conectado
    if (autoRefresh && !socketConnected) {
      const interval = setInterval(() => {
        fetchData();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [selectedEmployee, selectedActivityType, selectedShift, autoRefresh, socketConnected]);

  // Filter activities by search term
  const filteredActivities = activities.filter(activity =>
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.userRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get activity type config
  const getActivityConfig = (type: ActivityType) => {
    return activityTypes.find(t => t.key === type) || { label: type, color: "text-gray-400", icon: <Activity size={14} /> };
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  return (
    <div className="min-h-screen luxury-bg p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial opacity-20 rounded-full blur-2xl" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial opacity-10 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* ================= HEADER ================= */}
        <div className="flex items-end justify-between animate-fade-in-up">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-gold opacity-20 blur-xl rounded-2xl animate-pulse" />
              <div className="relative p-5 glass-card">
                <Activity className="text-[#d4af37]" size={36} />
              </div>
            </div>
            <div>
              <p className="text-xs text-[#d4af37] font-semibold tracking-[0.3em] uppercase mb-2 opacity-80">
                Sistema en Vivo
              </p>
              <h1 className="text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Tracking de
                <span className="gradient-text"> Actividad</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* WebSocket Connection Indicator */}
            <button
              onClick={() => setRealtimeEnabled(!realtimeEnabled)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-500 ${
                realtimeEnabled && socketConnected
                  ? "bg-gradient-emerald text-black font-semibold" 
                  : "glass-card text-white/70 hover:text-white"
              }`}
              title={socketConnected ? "WebSocket conectado" : "WebSocket desconectado"}
            >
              {socketConnected ? (
                <Wifi size={20} />
              ) : (
                <WifiOff size={20} />
              )}
              <span className="text-sm font-semibold tracking-wide">
                {socketConnected ? "Real-time" : "Polling"}
              </span>
            </button>

            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-500 ${
                autoRefresh 
                  ? "bg-gradient-gold text-black font-semibold" 
                  : "glass-card text-white/70 hover:text-white"
              }`}
            >
              <RefreshCw size={20} className={autoRefresh ? "animate-spin" : ""} />
              <span className="text-sm font-semibold tracking-wide">
                {autoRefresh ? "Live: ON" : "Live: OFF"}
              </span>
            </button>
          </div>
        </div>

        {/* ================= METRICS CARDS ================= */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <MetricCard
              label="Total Actividades"
              value={metrics.totalActivities}
              icon={<Activity size={24} className="text-[#00d4ff]" />}
              color="#00d4ff"
            />
            <MetricCard
              label="Tiempo Promedio"
              value={`${Math.round(metrics.averageSessionDuration / 60000)} min`}
              icon={<Clock size={24} className="text-[#d4af37]" />}
              color="#d4af37"
            />
            <MetricCard
              label="Hora Pico"
              value={metrics.peakActivityTime}
              icon={<TrendingUp size={24} className="text-[#00ff88]" />}
              color="#00ff88"
            />
            <MetricCard
              label="Módulos Activos"
              value={metrics.mostUsedModules.length}
              icon={<Sparkles size={24} className="text-[#b147ff]" />}
              color="#b147ff"
            />
          </div>
        )}

        {/* ================= FILTERS ================= */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                placeholder="Buscar actividad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 font-medium focus:outline-none focus:border-[#d4af37]/50 transition-all"
              />
            </div>

            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37]/50 transition-all cursor-pointer"
            >
              <option value="">Todos los empleados</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>

            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value as ActivityType | "")}
              className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37]/50 transition-all cursor-pointer"
            >
              <option value="">Todos los tipos</option>
              {activityTypes.map(type => (
                <option key={type.key} value={type.key}>{type.label}</option>
              ))}
            </select>

            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#d4af37]/50 transition-all cursor-pointer"
            >
              <option value="">Todos los turnos</option>
              {shifts.map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 h-12 px-5 rounded-xl bg-gradient-gold text-black font-semibold hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all"
            >
              <Filter size={18} />
              <span className="text-sm font-semibold">Aplicar</span>
            </button>
          </div>
        </div>

        {/* ================= ACTIVITY LIST ================= */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
                <Clock className="text-[#d4af37]" size={24} />
                Actividad en Tiempo Real
              </h2>
              <span className="text-sm text-white/60 font-semibold">
                {filteredActivities.length} registros
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-gold opacity-20 blur-xl rounded-full animate-pulse" />
                <RefreshCw size={48} className="relative text-[#d4af37] mx-auto animate-spin" />
              </div>
              <p className="text-white/60 font-semibold tracking-wide">
                Cargando actividades...
              </p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="relative inline-block mb-4">
                <Activity size={48} className="text-white/20 mx-auto" />
              </div>
              <p className="text-white/40 font-semibold tracking-wide">
                No hay actividades registradas
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto luxury-scrollbar">
              {filteredActivities.map((activity, index) => {
                const config = getActivityConfig(activity.activityType);
                return (
                  <div
                    key={activity._id}
                    className="px-6 py-5 hover:bg-white/5 transition-all duration-300 flex items-center gap-6 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* User Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                        <UserIcon size={24} className="text-white/60" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00ff88] border-2 border-[#0a0a0f]" />
                    </div>

                    {/* Activity Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-base font-semibold text-white tracking-wide">
                          {activity.userName}
                        </span>
                        <span className="text-xs text-white/50 font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-white/5 border border-white/10">
                          {activity.userRole}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 font-medium truncate">
                        {activity.description}
                      </p>
                    </div>

                    {/* Activity Type Badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${config.color} bg-white/5 font-semibold text-xs uppercase tracking-wider border border-white/10`}>
                      {config.icon}
                      {config.label}
                    </div>

                    {/* Time */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-white tracking-wide">
                        {formatTime(activity.timestamp)}
                      </div>
                      <div className="text-xs text-white/50 font-semibold uppercase tracking-wider">
                        {formatDate(activity.timestamp)}
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
  );
}

// ================= COMPONENT: METRIC CARD =================
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const MetricCard = ({ label, value, icon, color }: MetricCardProps) => {
  return (
    <div className="metric-card group">
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br opacity-30 blur-xl rounded-2xl" style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }} />
            <div className="relative p-4 rounded-xl bg-white/5 border border-white/10">
              {icon}
            </div>
          </div>
          <div className="text-xs text-white/50 font-semibold uppercase tracking-wider">
            {label}
          </div>
        </div>
        <div className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {value}
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-radial opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
      </div>
    </div>
  );
};
