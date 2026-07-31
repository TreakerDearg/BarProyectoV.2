/**
 * EMPLOYEE STATISTICS CENTER
 * Centro de estadísticas individual por empleado
 */

"use client";

import { BarChart3, TrendingUp, Clock, Shield, Activity, Award } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
}

export function EmployeeStatisticsCenter({ employee }: Props) {
  const attendance = employee.attendance as any;
  const performance = employee.performance as any;
  const compliance = employee.compliance as any;

  const getAttendanceRate = () => {
    const thisMonth = attendance?.thisMonth || {};
    const total = (thisMonth.present || 0) + (thisMonth.absent || 0) + (thisMonth.late || 0);
    return total > 0 ? Math.round(((thisMonth.present || 0) / total) * 100) : 0;
  };

  const getPunctualityRate = () => {
    return performance?.onTimeRate || 0;
  };

  const getPerformanceScore = () => {
    return performance?.averageRating || 0;
  };

  const getComplianceScore = () => {
    return compliance?.overallScore || 0;
  };

  const stats = [
    {
      label: "Asistencia",
      value: `${getAttendanceRate()}%`,
      icon: BarChart3,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      description: "Tasa de asistencia mensual",
    },
    {
      label: "Puntualidad",
      value: `${getPunctualityRate()}%`,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      description: "Llegadas a tiempo",
    },
    {
      label: "Rendimiento",
      value: `${getPerformanceScore()}/5`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      description: "Calificación promedio",
    },
    {
      label: "Cumplimiento",
      value: `${getComplianceScore()}%`,
      icon: Shield,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      description: "Adherencia a protocolos",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/20 rounded-xl">
          <BarChart3 size={24} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Centro de Estadísticas</h2>
          <p className="text-sm text-gray-400">Análisis individual del empleado</p>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon size={16} className={stat.color} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Detalles de Asistencia */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Activity size={16} className="text-blue-400" />
          Asistencia Mensual
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Presentes</p>
            <p className="text-3xl font-bold text-emerald-400">{attendance?.thisMonth?.present || 0}</p>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Ausentes</p>
            <p className="text-3xl font-bold text-red-400">{attendance?.thisMonth?.absent || 0}</p>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Tardanzas</p>
            <p className="text-3xl font-bold text-amber-400">{attendance?.thisMonth?.late || 0}</p>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Horas Totales</p>
            <p className="text-3xl font-bold text-blue-400">{attendance?.thisMonth?.totalHours || 0}h</p>
          </div>
        </div>
      </div>

      {/* Detalles de Rendimiento */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" />
          Rendimiento Detallado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Turnos Trabajados</p>
            <p className="text-3xl font-bold text-white">{performance?.totalShifts || 0}</p>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Horas Acumuladas</p>
            <p className="text-3xl font-bold text-white">{performance?.totalHours || 0}h</p>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Órdenes Procesadas</p>
            <p className="text-3xl font-bold text-white">{performance?.totalOrders || 0}</p>
          </div>
        </div>
      </div>

      {/* Detalles de Cumplimiento */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Shield size={16} className="text-purple-400" />
          Cumplimiento Detallado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Adherencia a Protocolos</p>
            <p className="text-3xl font-bold text-white">{compliance?.protocolAdherence || 0}%</p>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Cumplimiento de Tiempo</p>
            <p className="text-3xl font-bold text-white">{compliance?.timeCompliance || 0}%</p>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Puntuación de Calidad</p>
            <p className="text-3xl font-bold text-white">{compliance?.qualityScore || 0}%</p>
          </div>
        </div>
      </div>

      {/* Historial de Sesiones */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Award size={16} className="text-amber-400" />
          Actividad Reciente
        </h3>
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Sesiones activas</span>
              <span className="text-sm font-bold text-white">{employee.activeSessions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Dispositivos registrados</span>
              <span className="text-sm font-bold text-white">{employee.activeDevices || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Último acceso</span>
              <span className="text-sm font-bold text-white">
                {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Días consecutivos trabajados</span>
              <span className="text-sm font-bold text-white">{attendance?.consecutiveDays || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
