/**
 * EMPLOYEE ACTIVITY TIMELINE
 * Línea de tiempo de actividad del empleado
 */

"use client";

import { History, LogIn, LogOut, Shield, Settings, Key, Calendar, Clock } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
}

const ACTIVITY_ICONS: Record<string, any> = {
  login: LogIn,
  logout: LogOut,
  password_change: Key,
  role_change: Shield,
  permission_change: Settings,
  schedule_change: Calendar,
  profile_update: Settings,
};

export function EmployeeActivityTimeline({ employee }: Props) {
  const activityLogs = employee.activityLogs || [];

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6" role="region" aria-label="Actividad del empleado">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <History size={20} className="text-amber-400" />
        Actividad
      </h2>

      {activityLogs.length === 0 ? (
        <div className="p-8 text-center">
          <History size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No hay actividad registrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activityLogs.map((log: any, index: number) => {
            const Icon = ACTIVITY_ICONS[log.type] || Clock;
            return (
              <div
                key={log.id || index}
                className="relative pl-8 pb-4 border-l-2 border-gray-700 last:border-0"
              >
                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 bg-amber-400 rounded-full border-4 border-gray-900" />
                <div className="p-3 bg-gray-700/30 rounded-xl border border-gray-600/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-400/20 rounded-lg">
                      <Icon size={16} className="text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{log.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                      </p>
                      {log.metadata && (
                        <div className="mt-2 p-2 bg-gray-600/20 rounded-lg">
                          <p className="text-[10px] text-gray-400">
                            {JSON.stringify(log.metadata)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
