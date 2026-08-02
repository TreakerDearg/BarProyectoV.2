/**
 * DIGITAL DOSSIER
 * Expediente Digital unificado del empleado
 */

"use client";

import { User, Shield, Calendar, BarChart3, Clock, Activity, FileText, Award, Briefcase } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
  onTabChange?: (tab: string) => void;
}

const TABS = [
  { id: "personal", label: "Información Personal", icon: User },
  { id: "identity", label: "Identidad", icon: Shield },
  { id: "history", label: "Historial Laboral", icon: Briefcase },
  { id: "roles", label: "Roles y Permisos", icon: Shield },
  { id: "schedule", label: "Horarios", icon: Calendar },
  { id: "attendance", label: "Asistencia", icon: Clock },
  { id: "performance", label: "Rendimiento", icon: BarChart3 },
  { id: "compliance", label: "Cumplimiento", icon: Award },
  { id: "activity", label: "Actividad", icon: Activity },
  { id: "sessions", label: "Sesiones", icon: Shield },
  { id: "devices", label: "Dispositivos", icon: Shield },
  { id: "documents", label: "Documentos", icon: FileText },
];

export function DigitalDossier({ employee, onTabChange }: Props) {
  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/20 rounded-xl">
          <FileText size={24} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Expediente Digital</h2>
          <p className="text-sm text-gray-400">Vista unificada del empleado</p>
        </div>
      </div>

      {/* Navegación por Categorías */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/30 border border-gray-600/30 hover:bg-gray-700/50 transition-all"
                aria-label={`Ver ${tab.label}`}
              >
                <TabIcon size={14} className="text-gray-400" aria-hidden="true" />
                <span className="text-xs text-gray-300">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen del Empleado */}
      <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {employee.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{employee.name}</h3>
            <p className="text-sm text-gray-400">{employee.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Briefcase size={12} className="text-gray-400" />
                <span className="text-xs text-gray-400">{employee.position || "Sin cargo"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={12} className="text-gray-400" />
                <span className="text-xs text-gray-400">{employee.role || "Sin rol"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-gray-400" />
                <span className="text-xs text-gray-400">
                  {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : "Sin fecha de contratación"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={12} className="text-amber-400" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Turnos</span>
          </div>
          <p className="text-lg font-bold text-white">
            {(employee.performance as any)?.totalShifts || 0}
          </p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={12} className="text-blue-400" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Horas</span>
          </div>
          <p className="text-lg font-bold text-white">
            {(employee.performance as any)?.totalHours || 0}h
          </p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={12} className="text-emerald-400" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Rendimiento</span>
          </div>
          <p className="text-lg font-bold text-white">
            {(employee.performance as any)?.averageRating || 0}/5
          </p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <div className="flex items-center gap-2 mb-1">
            <Award size={12} className="text-purple-400" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Cumplimiento</span>
          </div>
          <p className="text-lg font-bold text-white">
            {(employee.compliance as any)?.overallScore || 0}%
          </p>
        </div>
      </div>

      {/* Secciones del Expediente */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            Información Personal
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Nombre:</span>
              <span className="text-white ml-2">{employee.name}</span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="text-white ml-2">{employee.email}</span>
            </div>
            <div>
              <span className="text-gray-400">Teléfono:</span>
              <span className="text-white ml-2">{employee.phone || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-400">Cargo:</span>
              <span className="text-white ml-2">{employee.position || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Shield size={14} className="text-gray-400" />
            Identidad
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Estado:</span>
              <span className={`ml-2 ${employee.isActive ? "text-emerald-400" : "text-red-400"}`}>
                {employee.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Sesiones Activas:</span>
              <span className="text-white ml-2">{employee.activeSessions || 0}</span>
            </div>
            <div>
              <span className="text-gray-400">Dispositivos:</span>
              <span className="text-white ml-2">{employee.activeDevices || 0}</span>
            </div>
            <div>
              <span className="text-gray-400">Último Acceso:</span>
              <span className="text-white ml-2">
                {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Activity size={14} className="text-gray-400" />
            Actividad Reciente
          </h4>
          <div className="text-xs text-gray-400">
            El historial de actividad se muestra en la línea de tiempo unificada.
          </div>
        </div>
      </div>
    </div>
  );
}
