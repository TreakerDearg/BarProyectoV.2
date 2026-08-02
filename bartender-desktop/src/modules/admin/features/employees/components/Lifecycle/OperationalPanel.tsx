/**
 * OPERATIONAL PANEL
 * Panel operativo con indicadores rápidos
 */

"use client";

import { Calendar, Coffee, GraduationCap, FileText, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
}

export function OperationalPanel({ employee }: Props) {
  const attendance = employee.attendance as any;
  const performance = employee.performance as any;
  const compliance = employee.compliance as any;

  // Simulación de datos para el panel operativo
  const upcomingShifts = [
    { date: new Date(), time: "09:00", type: "morning" },
    { date: new Date(Date.now() + 86400000), time: "14:00", type: "afternoon" },
  ];

  const pendingVacations = 0;
  const pendingTraining = 2;
  const missingDocuments = 1;
  const complianceAlerts = compliance?.violations?.length || 0;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/20 rounded-xl">
          <Clock size={24} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Panel Operativo</h2>
          <p className="text-sm text-gray-400">Indicadores rápidos</p>
        </div>
      </div>

      {/* Próximos Turnos */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          Próximos Turnos
        </h3>
        <div className="space-y-2">
          {upcomingShifts.length === 0 ? (
            <div className="p-3 text-center text-gray-400 text-xs">
              No hay turnos programados
            </div>
          ) : (
            upcomingShifts.map((shift, index) => (
              <div key={index} className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-amber-400" />
                    <span className="text-xs text-white">
                      {shift.date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{shift.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Vacaciones Pendientes */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Coffee size={14} className="text-gray-400" />
          Vacaciones Pendientes
        </h3>
        <div className={`p-3 rounded-lg border ${pendingVacations > 0 ? "bg-amber-500/20 border-amber-500/30" : "bg-emerald-500/20 border-emerald-500/30"}`}>
          <div className="flex items-center gap-2">
            {pendingVacations > 0 ? (
              <AlertTriangle size={14} className="text-amber-400" aria-hidden="true" />
            ) : (
              <CheckCircle size={14} className="text-emerald-400" aria-hidden="true" />
            )}
            <span className={`text-xs ${pendingVacations > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {pendingVacations > 0 ? `${pendingVacations} solicitud(es) pendiente(s)` : "Sin solicitudes pendientes"}
            </span>
          </div>
        </div>
      </div>

      {/* Capacitaciones Pendientes */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <GraduationCap size={14} className="text-gray-400" />
          Capacitaciones Pendientes
        </h3>
        <div className={`p-3 rounded-lg border ${pendingTraining > 0 ? "bg-amber-500/20 border-amber-500/30" : "bg-emerald-500/20 border-emerald-500/30"}`}>
          <div className="flex items-center gap-2">
            {pendingTraining > 0 ? (
              <AlertTriangle size={14} className="text-amber-400" aria-hidden="true" />
            ) : (
              <CheckCircle size={14} className="text-emerald-400" aria-hidden="true" />
            )}
            <span className={`text-xs ${pendingTraining > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {pendingTraining > 0 ? `${pendingTraining} capacitación(es) pendiente(s)` : "Todas las capacitaciones completadas"}
            </span>
          </div>
        </div>
      </div>

      {/* Documentos Faltantes */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FileText size={14} className="text-gray-400" />
          Documentos Faltantes
        </h3>
        <div className={`p-3 rounded-lg border ${missingDocuments > 0 ? "bg-red-500/20 border-red-500/30" : "bg-emerald-500/20 border-emerald-500/30"}`}>
          <div className="flex items-center gap-2">
            {missingDocuments > 0 ? (
              <XCircle size={14} className="text-red-400" aria-hidden="true" />
            ) : (
              <CheckCircle size={14} className="text-emerald-400" aria-hidden="true" />
            )}
            <span className={`text-xs ${missingDocuments > 0 ? "text-red-400" : "text-emerald-400"}`}>
              {missingDocuments > 0 ? `${missingDocuments} documento(s) faltante(s)` : "Documentación completa"}
            </span>
          </div>
        </div>
      </div>

      {/* Alertas de Cumplimiento */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-gray-400" />
          Alertas de Cumplimiento
        </h3>
        <div className={`p-3 rounded-lg border ${complianceAlerts > 0 ? "bg-red-500/20 border-red-500/30" : "bg-emerald-500/20 border-emerald-500/30"}`}>
          <div className="flex items-center gap-2">
            {complianceAlerts > 0 ? (
              <XCircle size={14} className="text-red-400" aria-hidden="true" />
            ) : (
              <CheckCircle size={14} className="text-emerald-400" aria-hidden="true" />
            )}
            <span className={`text-xs ${complianceAlerts > 0 ? "text-red-400" : "text-emerald-400"}`}>
              {complianceAlerts > 0 ? `${complianceAlerts} alerta(s) de cumplimiento` : "Sin alertas de cumplimiento"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
