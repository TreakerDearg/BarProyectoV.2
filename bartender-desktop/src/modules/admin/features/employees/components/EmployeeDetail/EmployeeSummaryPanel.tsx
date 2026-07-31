/**
 * EMPLOYEE SUMMARY PANEL
 * Panel resumen con indicadores del empleado
 */

"use client";

import { User, Clock, Activity, Smartphone, TrendingUp, Calendar } from "lucide-react";
import type { Employee } from "../../types";
import { getRoleLabel, getShiftLabel, getEmployeeStatus, calculateEmployeeMetrics } from "../../utils";

interface Props {
  employee: Employee;
}

export function EmployeeSummaryPanel({ employee }: Props) {
  const status = getEmployeeStatus(employee);
  const metrics = calculateEmployeeMetrics(employee);
  const roleLabel = getRoleLabel(employee.role);
  const shiftLabel = getShiftLabel(employee.shift || undefined);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Panel resumen de empleado">
      {/* Estado Actual */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-400/20 rounded-lg">
            <User size={18} className="text-blue-400" />
          </div>
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
            status === "active" ? "bg-emerald-400/20 text-emerald-400" : "bg-red-400/20 text-red-400"
          }`}>
            {status === "active" ? "Activo" : "Inactivo"}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Estado</p>
        <p className="text-lg font-bold text-white">{employee.isActive ? "Disponible" : "No disponible"}</p>
      </div>

      {/* Turno Activo */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-amber-400/20 rounded-lg">
            <Clock size={18} className="text-amber-400" />
          </div>
          {employee.shift && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-400/20 text-amber-400">
              Activo
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Turno</p>
        <p className="text-lg font-bold text-white">{shiftLabel || "Sin turno"}</p>
      </div>

      {/* Último Acceso */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-purple-400/20 rounded-lg">
            <Activity size={18} className="text-purple-400" />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Último Acceso</p>
        <p className="text-lg font-bold text-white">
          {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : "Nunca"}
        </p>
      </div>

      {/* Rendimiento General */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-emerald-400/20 rounded-lg">
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Este mes</span>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Rendimiento</p>
        <p className="text-lg font-bold text-white">{metrics.performance}%</p>
      </div>

      {/* Sesiones Activas */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-cyan-400/20 rounded-lg">
            <Smartphone size={18} className="text-cyan-400" />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Sesiones Activas</p>
        <p className="text-lg font-bold text-white">{employee.activeSessions || 0}</p>
      </div>

      {/* Dispositivos Registrados */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-pink-400/20 rounded-lg">
            <Smartphone size={18} className="text-pink-400" />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Dispositivos</p>
        <p className="text-lg font-bold text-white">{employee.activeDevices || 0}</p>
      </div>

      {/* Asistencia Mensual */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-green-400/20 rounded-lg">
            <Calendar size={18} className="text-green-400" />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Asistencia</p>
        <p className="text-lg font-bold text-white">{metrics.attendanceRate}%</p>
      </div>

      {/* Rol */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-orange-400/20 rounded-lg">
            <User size={18} className="text-orange-400" />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Rol</p>
        <p className="text-lg font-bold text-white">{roleLabel}</p>
      </div>
    </div>
  );
}
