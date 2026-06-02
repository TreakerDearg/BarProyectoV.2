import { useState, useEffect } from "react";
import { 
  Activity, 
  Clock, 
  Filter, 
  Search, 
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Tracking de Actividad
            </h1>
            <p className="text-sm text-white/50 font-medium mt-1">
              Sistema en vivo de monitoreo de empleados
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* WebSocket Connection Indicator */}
            <button
              onClick={() => setRealtimeEnabled(!realtimeEnabled)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl transition-all duration-200 ${
                realtimeEnabled && socketConnected
                  ? "bg-[#00FF95] text-black font-semibold" 
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
              title={socketConnected ? "WebSocket conectado" : "WebSocket desconectado"}
            >
              {socketConnected ? (
                <Wifi size={18} />
              ) : (
                <WifiOff size={18} />
              )}
              <span className="text-sm font-semibold">
                {socketConnected ? "Real-time" : "Polling"}
              </span>
            </button>

            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl transition-all duration-200 ${
                autoRefresh 
                  ? "bg-[#00E5FF] text-black font-semibold" 
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              <RefreshCw size={18} className={autoRefresh ? "animate-spin" : ""} />
              <span className="text-sm font-semibold">
                {autoRefresh ? "Live: ON" : "Live: OFF"}
              </span>
            </button>
          </div>
        </div>

        {/* ================= METRICS CARDS ================= */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <MetricCard
              label="Total Actividades"
              value={metrics.totalActivities}
              icon={<Activity size={32} className="text-[#00E5FF]" />}
              color="#00E5FF"
            />
            <MetricCard
              label="Tiempo Promedio"
              value={`${Math.round(metrics.averageSessionDuration / 60000)} min`}
              icon={<Clock size={32} className="text-[#9D4EDD]" />}
              color="#9D4EDD"
            />
            <MetricCard
              label="Hora Pico"
              value={metrics.peakActivityTime}
              icon={<TrendingUp size={32} className="text-[#00FF95]" />}
              color="#00FF95"
            />
            <MetricCard
              label="Módulos Activos"
              value={metrics.mostUsedModules.length}
              icon={<Sparkles size={32} className="text-[#FFD166]" />}
              color="#FFD166"
            />
          </div>
        )}

        {/* ================= FILTERS ================= */}
        <div className="p-5 rounded-xl animate-fade-in-up" style={{
          background: 'rgba(18, 18, 25, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          animationDelay: '0.1s'
        }}>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                placeholder="Buscar actividad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl text-white placeholder-white/40 font-medium focus:outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px'
                }}
              />
            </div>

            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px'
              }}
            >
              <option value="">Todos los empleados</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>

            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value as ActivityType | "")}
              className="h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px'
              }}
            >
              <option value="">Todos los tipos</option>
              {activityTypes.map(type => (
                <option key={type.key} value={type.key}>{type.label}</option>
              ))}
            </select>

            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="h-12 px-4 rounded-xl text-white font-medium focus:outline-none transition-all cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px'
              }}
            >
              <option value="">Todos los turnos</option>
              {shifts.map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 h-12 px-5 rounded-xl bg-[#00E5FF] text-black font-semibold hover:bg-[#00E5FF]/90 active:scale-95 transition-all duration-200"
            >
              <Filter size={18} />
              <span className="text-sm font-semibold">Aplicar</span>
            </button>
          </div>
        </div>

        {/* ================= ACTIVITY LIST ================= */}
        <div className="p-5 rounded-xl animate-fade-in-up" style={{
          background: 'rgba(18, 18, 25, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          animationDelay: '0.15s'
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock size={18} className="text-[#00E5FF]" />
              Actividad en Tiempo Real
            </h2>
            <span className="text-sm text-white/50 font-medium">
              {filteredActivities.length} registros
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw size={32} className="text-white/40 mx-auto animate-spin" />
              <p className="text-white/40 text-sm mt-2">Cargando actividades...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-8 text-center">
              <Activity size={32} className="text-white/20 mx-auto mb-2" />
              <p className="text-white/30 text-sm">No hay actividades registradas</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
              {filteredActivities.map((activity) => {
                const config = getActivityConfig(activity.activityType);
                return (
                  <div
                    key={activity._id}
                    className="px-4 py-4 hover:bg-white/[0.02] transition-all duration-300 flex items-center gap-4"
                  >
                    {/* User Avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-[#9D4EDD]/20 border border-white/10 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {activity.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00FF95] border-2 border-[#121215]" />
                    </div>

                    {/* Activity Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-white">
                          {activity.userName}
                        </span>
                        <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                          {activity.userRole}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 font-medium truncate">
                        {activity.description}
                      </p>
                    </div>

                    {/* Activity Type Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-[10px] uppercase tracking-wider border ${
                      config.color === 'text-[#00ff88]' 
                        ? 'bg-[#00FF95]/10 border-[#00FF95]/30 text-[#00FF95]'
                        : config.color === 'text-[#ff4757]'
                        ? 'bg-[#FF4D6D]/10 border-[#FF4D6D]/30 text-[#FF4D6D]'
                        : config.color === 'text-[#00d4ff]'
                        ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]'
                        : config.color === 'text-[#d4af37]'
                        ? 'bg-[#FFD166]/10 border-[#FFD166]/30 text-[#FFD166]'
                        : config.color === 'text-[#b147ff]'
                        ? 'bg-[#9D4EDD]/10 border-[#9D4EDD]/30 text-[#9D4EDD]'
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}>
                      {config.icon}
                      {config.label}
                    </div>

                    {/* Time */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-white">
                        {formatTime(activity.timestamp)}
                      </div>
                      <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">
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
    <div className="p-4 rounded-xl transition-all hover:-translate-y-0.5" style={{
      background: 'rgba(18, 18, 25, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-0.5">
            {label}
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
};
