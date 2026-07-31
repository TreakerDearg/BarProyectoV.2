/**
 * EMPLOYEE ATTENDANCE SECTION
 * Sección de asistencia del empleado
 */

"use client";

import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
}

export function EmployeeAttendanceSection({ employee }: Props) {
  const attendance = employee.attendance as any;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6" role="region" aria-label="Asistencia del empleado">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Clock size={20} className="text-amber-400" />
        Asistencia
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estado Actual */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Estado Actual</p>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              attendance?.currentStatus === "checked-in"
                ? "bg-emerald-400/20"
                : attendance?.currentStatus === "break"
                ? "bg-amber-400/20"
                : "bg-gray-600/20"
            }`}>
              <Clock size={16} className={
                attendance?.currentStatus === "checked-in"
                  ? "text-emerald-400"
                  : attendance?.currentStatus === "break"
                  ? "text-amber-400"
                  : "text-gray-400"
              } />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {attendance?.currentStatus === "checked-in" && "En turno"}
                {attendance?.currentStatus === "checked-out" && "Fuera de turno"}
                {attendance?.currentStatus === "break" && "En descanso"}
                {attendance?.currentStatus === "absent" && "Ausente"}
                {attendance?.currentStatus === "late" && "Tarde"}
              </p>
              <p className="text-xs text-gray-400">Estado actual de asistencia</p>
            </div>
          </div>
        </div>

        {/* Último Check-in */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Último Check-in</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-400/20 rounded-lg">
              <CheckCircle size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {attendance?.lastCheckIn ? new Date(attendance.lastCheckIn).toLocaleString() : "No registrado"}
              </p>
              <p className="text-xs text-gray-400">Último registro de entrada</p>
            </div>
          </div>
        </div>

        {/* Métricas del Mes */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Métricas del Mes</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-white">{attendance?.thisMonth?.present || 0}</p>
                <p className="text-[10px] text-gray-400">Presentes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle size={14} className="text-red-400" />
              <div>
                <p className="text-sm font-bold text-white">{attendance?.thisMonth?.absent || 0}</p>
                <p className="text-[10px] text-gray-400">Ausentes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <div>
                <p className="text-sm font-bold text-white">{attendance?.thisMonth?.late || 0}</p>
                <p className="text-[10px] text-gray-400">Tardanzas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-blue-400" />
              <div>
                <p className="text-sm font-bold text-white">{attendance?.thisMonth?.totalHours || 0}h</p>
                <p className="text-[10px] text-gray-400">Horas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tiempo Trabajado */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Tiempo Trabajado</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-400/20 rounded-lg">
              <Clock size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{attendance?.totalMinutesWorked || 0} min</p>
              <p className="text-xs text-gray-400">Tiempo total trabajado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
