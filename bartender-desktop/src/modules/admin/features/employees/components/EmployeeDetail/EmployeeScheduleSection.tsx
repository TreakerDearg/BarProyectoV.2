/**
 * EMPLOYEE SCHEDULE SECTION
 * Sección de horarios del empleado
 */

"use client";

import { Calendar, Clock, Coffee } from "lucide-react";
import type { Employee } from "../../types";
import { getShiftLabel } from "../../utils";

interface Props {
  employee: Employee;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DAY_LABELS = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export function EmployeeScheduleSection({ employee }: Props) {
  const shiftLabel = getShiftLabel(employee.shift || undefined);
  const schedule = employee.schedule as any;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6" role="region" aria-label="Horarios del empleado">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Calendar size={20} className="text-amber-400" />
        Horarios
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Turno Asignado */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Turno Asignado</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/20 rounded-lg">
              <Clock size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{shiftLabel || "Sin turno"}</p>
              <p className="text-xs text-gray-400">Turno principal</p>
            </div>
          </div>
        </div>

        {/* Horas Semanales */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Horas Semanales</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-400/20 rounded-lg">
              <Clock size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">40h</p>
              <p className="text-xs text-gray-400">Horas programadas</p>
            </div>
          </div>
        </div>

        {/* Horario Semanal */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 md:col-span-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Horario Semanal</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {DAYS.map((day) => {
              const daySchedule = schedule?.[day];
              const isAvailable = daySchedule?.isAvailable;

              return (
                <div
                  key={day}
                  className={`p-3 rounded-lg border ${
                    isAvailable
                      ? "bg-emerald-400/10 border-emerald-400/30"
                      : "bg-gray-600/20 border-gray-600/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{DAY_LABELS[day]}</span>
                    <span className={`text-[10px] font-bold uppercase ${
                      isAvailable ? "text-emerald-400" : "text-gray-400"
                    }`}>
                      {isAvailable ? "Disponible" : "No disponible"}
                    </span>
                  </div>
                  {isAvailable && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>{daySchedule?.startTime} - {daySchedule?.endTime}</span>
                      </div>
                      {daySchedule?.breakStart && daySchedule?.breakEnd && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Coffee size={12} />
                          <span>Descanso: {daySchedule.breakStart} - {daySchedule.breakEnd}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
