/**
 * OPERATIONAL CALENDAR
 * Calendario operativo con turnos, ausencias, vacaciones y eventos
 */

"use client";

import { Calendar, Clock, Coffee, Plane, MapPin, Star } from "lucide-react";

export type CalendarEventType = "shift" | "absence" | "vacation" | "event" | "holiday";

interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  date: string;
  title: string;
  description?: string;
  employeeId?: string;
  employeeName?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
}

interface Props {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  currentDate?: Date;
}

const EVENT_CONFIGS: Record<CalendarEventType, { label: string; icon: any; color: string; bgColor: string }> = {
  shift: {
    label: "Turno",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
  },
  absence: {
    label: "Ausencia",
    icon: Coffee,
    color: "text-red-400",
    bgColor: "bg-red-500/20 border-red-500/30",
  },
  vacation: {
    label: "Vacaciones",
    icon: Plane,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20 border-blue-500/30",
  },
  event: {
    label: "Evento",
    icon: Star,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20 border-purple-500/30",
  },
  holiday: {
    label: "Día Festivo",
    icon: MapPin,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20 border-emerald-500/30",
  },
};

export function OperationalCalendar({ events, onEventClick, currentDate = new Date() }: Props) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek };
  };

  const { daysInMonth, startDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("es-ES", { month: "long", year: "numeric" });

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => event.date === dateStr);
  };

  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const emptyDays = Array.from({ length: startDayOfWeek }, () => null);

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Calendar size={24} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Calendario Operativo</h2>
            <p className="text-sm text-gray-400 capitalize">{monthName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {Object.entries(EVENT_CONFIGS).map(([type, config]) => (
            <div key={type} className="flex items-center gap-2">
              <config.icon size={14} className={config.color} />
              <span>{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dayName) => (
          <div key={dayName} className="text-center text-xs font-bold text-gray-400 py-2">
            {dayName}
          </div>
        ))}
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-2">
        {/* Días vacíos al inicio */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-24" />
        ))}

        {/* Días del mes */}
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isToday = day === currentDate.getDate();

          return (
            <div
              key={day}
              className={`h-24 p-2 rounded-lg border transition-all hover:scale-105 cursor-pointer ${
                isToday
                  ? "bg-amber-500/20 border-amber-500/30"
                  : "bg-gray-700/30 border-gray-600/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${isToday ? "text-amber-400" : "text-white"}`}>
                  {day}
                </span>
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const config = EVENT_CONFIGS[event.type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={`p-1 rounded border ${config.bgColor} hover:opacity-80 transition-opacity`}
                    >
                      <div className="flex items-center gap-1">
                        <Icon size={10} className={config.color} />
                        <span className="text-[10px] text-white truncate">{event.title}</span>
                      </div>
                    </div>
                  );
                })}

                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-gray-400 text-center">
                    +{dayEvents.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" />
          <span>Turno</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
          <span>Ausencia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30" />
          <span>Vacaciones</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/30" />
          <span>Evento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
          <span>Día Festivo</span>
        </div>
      </div>
    </div>
  );
}
