/**
 * WORKFORCE DASHBOARD PAGE
 * Panel general para Recursos Humanos con métricas globales
 */

"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, Clock, Coffee, AlertTriangle, TrendingUp, Shield, Calendar, Activity } from "lucide-react";

interface WorkforceMetrics {
  totalEmployees: number;
  activeEmployees: number;
  onlineEmployees: number;
  onShiftEmployees: number;
  onBreakEmployees: number;
  absentToday: number;
  attendanceRate: number;
  averagePerformance: number;
  overallCompliance: number;
  upcomingShifts: number;
}

interface Alert {
  id: string;
  type: "no_shift" | "multiple_absences" | "excess_hours" | "suspicious_session" | "low_performance";
  message: string;
  severity: "low" | "medium" | "high";
  employeeId?: string;
  employeeName?: string;
}

export default function WorkforceDashboardPage() {
  const [metrics, setMetrics] = useState<WorkforceMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    onlineEmployees: 0,
    onShiftEmployees: 0,
    onBreakEmployees: 0,
    absentToday: 0,
    attendanceRate: 0,
    averagePerformance: 0,
    overallCompliance: 0,
    upcomingShifts: 0,
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setMetrics({
        totalEmployees: 24,
        activeEmployees: 20,
        onlineEmployees: 15,
        onShiftEmployees: 12,
        onBreakEmployees: 3,
        absentToday: 4,
        attendanceRate: 83,
        averagePerformance: 87,
        overallCompliance: 92,
        upcomingShifts: 8,
      });

      setAlerts([
        {
          id: "1",
          type: "no_shift",
          message: "Juan Pérez no tiene turno asignado para hoy",
          severity: "medium",
          employeeId: "1",
          employeeName: "Juan Pérez",
        },
        {
          id: "2",
          type: "low_performance",
          message: "María García tiene rendimiento bajo (65%)",
          severity: "high",
          employeeId: "2",
          employeeName: "María García",
        },
        {
          id: "3",
          type: "multiple_absences",
          message: "Carlos López tiene 3 ausencias esta semana",
          severity: "medium",
          employeeId: "3",
          employeeName: "Carlos López",
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/50">
        <div className="text-white text-lg">Cargando Workforce Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Workforce Dashboard</h1>
        <p className="text-gray-400">Centro de Gestión del Personal - Métricas en tiempo real</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Bento Grid de Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Empleados */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users size={24} className="text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{metrics.totalEmployees}</p>
            <p className="text-sm text-gray-400">Empleados registrados</p>
          </div>

          {/* Empleados Activos */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <UserCheck size={24} className="text-emerald-400" />
              </div>
              <span className="text-sm text-gray-400">Activos</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{metrics.activeEmployees}</p>
            <p className="text-sm text-gray-400">Cuentas activas</p>
          </div>

          {/* Empleados Conectados */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Activity size={24} className="text-cyan-400" />
              </div>
              <span className="text-sm text-gray-400">En línea</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{metrics.onlineEmployees}</p>
            <p className="text-sm text-gray-400">Sesiones activas</p>
          </div>

          {/* Empleados en Turno */}
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Clock size={24} className="text-amber-400" />
              </div>
              <span className="text-sm text-gray-400">En turno</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{metrics.onShiftEmployees}</p>
            <p className="text-sm text-gray-400">Trabajando actualmente</p>
          </div>
        </div>

        {/* Segunda fila de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Empleados en Descanso */}
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Coffee size={24} className="text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">Descanso</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{metrics.onBreakEmployees}</p>
            <p className="text-sm text-gray-400">En descanso</p>
          </div>

          {/* Ausencias del Día */}
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <span className="text-sm text-gray-400">Ausentes</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{metrics.absentToday}</p>
            <p className="text-sm text-gray-400">Ausencias hoy</p>
          </div>

          {/* Asistencia del Día */}
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <TrendingUp size={24} className="text-green-400" />
              </div>
              <span className="text-sm text-gray-400">Asistencia</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{metrics.attendanceRate}%</p>
            <p className="text-sm text-gray-400">Tasa de asistencia</p>
          </div>

          {/* Próximos Turnos */}
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Calendar size={24} className="text-orange-400" />
              </div>
              <span className="text-sm text-gray-400">Próximos</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{metrics.upcomingShifts}</p>
            <p className="text-sm text-gray-400">Turnos próximos</p>
          </div>
        </div>

        {/* Métricas de Rendimiento y Cumplimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rendimiento Promedio */}
          <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <TrendingUp size={24} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Rendimiento Promedio</h3>
                  <p className="text-sm text-gray-400">Métrica global del equipo</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-white">{metrics.averagePerformance}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${metrics.averagePerformance}%` }}
              />
            </div>
          </div>

          {/* Cumplimiento General */}
          <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <Shield size={24} className="text-pink-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cumplimiento General</h3>
                  <p className="text-sm text-gray-400">Adherencia a protocolos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-white">{metrics.overallCompliance}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${metrics.overallCompliance}%` }}
              />
            </div>
          </div>
        </div>

        {/* Centro de Alertas */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Alertas Inteligentes</h2>
              <p className="text-sm text-gray-400">Notificaciones importantes del sistema</p>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <Shield size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No hay alertas activas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.severity === "high"
                      ? "bg-red-500/10 border-red-500/30"
                      : alert.severity === "medium"
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-blue-500/10 border-blue-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={20}
                      className={
                        alert.severity === "high"
                          ? "text-red-400"
                          : alert.severity === "medium"
                          ? "text-amber-400"
                          : "text-blue-400"
                      }
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{alert.message}</p>
                      {alert.employeeName && (
                        <p className="text-xs text-gray-400 mt-1">Empleado: {alert.employeeName}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
