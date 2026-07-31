/**
 * SHIFT MANAGEMENT CALENDAR
 * Calendario semanal para gestión de turnos
 */

"use client";

import { Calendar, Clock, Users, AlertTriangle, Check } from "lucide-react";

interface ShiftAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftType: "morning" | "afternoon" | "night" | "event";
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "missed" | "late" | "left_early";
  hasConflict: boolean;
}

interface DaySchedule {
  date: string;
  dayName: string;
  assignments: ShiftAssignment[];
  coverage: {
    morning: number;
    afternoon: number;
    night: number;
  };
}

interface Props {
  weekSchedule: DaySchedule[];
  onAssignmentClick?: (assignment: ShiftAssignment) => void;
}

const SHIFT_LABELS = {
  morning: "Mañana",
  afternoon: "Tarde",
  night: "Noche",
  event: "Evento",
};

const SHIFT_COLORS = {
  morning: "bg-amber-500/20 border-amber-500/30",
  afternoon: "bg-blue-500/20 border-blue-500/30",
  night: "bg-purple-500/20 border-purple-500/30",
  event: "bg-green-500/20 border-green-500/30",
};

export function ShiftManagementCalendar({ weekSchedule, onAssignmentClick }: Props) {
  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <Calendar size={24} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Gestión de Turnos</h2>
            <p className="text-sm text-gray-400">Calendario semanal de asignaciones</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span>Mañana</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span>Tarde</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span>Noche</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {weekSchedule.map((day) => (
          <div key={day.date} className="space-y-2">
            <div className="text-center">
              <p className="text-sm font-bold text-white">{day.dayName}</p>
              <p className="text-xs text-gray-400">{day.date}</p>
            </div>

            <div className="space-y-2">
              {day.assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  onClick={() => onAssignmentClick?.(assignment)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                    assignment.hasConflict
                      ? "bg-red-500/20 border-red-500/30"
                      : SHIFT_COLORS[assignment.shiftType]
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">
                      {SHIFT_LABELS[assignment.shiftType]}
                    </span>
                    {assignment.hasConflict && (
                      <AlertTriangle size={12} className="text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-300">
                      {assignment.startTime} - {assignment.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-300 truncate">
                      {assignment.employeeName}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {assignment.status === "completed" && (
                      <Check size={10} className="text-emerald-400" />
                    )}
                    <span className={`text-[10px] font-medium ${
                      assignment.status === "completed"
                        ? "text-emerald-400"
                        : assignment.status === "missed"
                        ? "text-red-400"
                        : assignment.status === "late"
                        ? "text-amber-400"
                        : "text-gray-400"
                    }`}>
                      {assignment.status}
                    </span>
                  </div>
                </div>
              ))}

              {day.assignments.length === 0 && (
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-700/20">
                  <p className="text-xs text-gray-500 text-center">Sin asignaciones</p>
                </div>
              )}
            </div>

            {/* Cobertura del día */}
            <div className="p-2 rounded-lg bg-gray-700/30 border border-gray-600/30">
              <p className="text-[10px] text-gray-400 mb-1">Cobertura</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">M</span>
                  <span className="text-amber-400">{day.coverage.morning}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">T</span>
                  <span className="text-blue-400">{day.coverage.afternoon}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">N</span>
                  <span className="text-purple-400">{day.coverage.night}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span>Completado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span>Tarde</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span>Ausente</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <span>Conflicto</span>
        </div>
      </div>
    </div>
  );
}
