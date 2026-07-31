/**
 * EMPLOYEE SESSIONS SECTION
 * Sección de sesiones activas del empleado
 */

"use client";

import { Activity, Monitor, Smartphone, Globe, X } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
}

export function EmployeeSessionsSection({ employee }: Props) {
  const sessions = employee.sessions || [];

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6" role="region" aria-label="Sesiones activas del empleado">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Activity size={20} className="text-amber-400" />
        Sesiones Activas
      </h2>

      {sessions.length === 0 ? (
        <div className="p-8 text-center">
          <Activity size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No hay sesiones activas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session: any) => (
            <div
              key={session.sessionId}
              className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-400/20 rounded-lg">
                    {session.device?.type === "mobile" ? (
                      <Smartphone size={16} className="text-blue-400" />
                    ) : (
                      <Monitor size={16} className="text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{session.device?.name || "Dispositivo desconocido"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{session.platform}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{session.device?.os}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{session.device?.browser}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">
                        Última actividad: {session.lastActivity ? new Date(session.lastActivity).toLocaleString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="p-2 bg-red-400/20 text-red-400 rounded-lg hover:bg-red-400/30 transition-colors"
                  aria-label="Cerrar sesión"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button className="flex-1 px-4 py-2 bg-red-400/20 text-red-400 rounded-lg hover:bg-red-400/30 transition-colors text-sm font-medium">
          Cerrar Todas las Sesiones
        </button>
      </div>
    </div>
  );
}
