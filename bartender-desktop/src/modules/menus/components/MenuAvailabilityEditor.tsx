"use client";

import { Clock } from "lucide-react";
import { memo } from "react";

interface Props {
  availableHours: { start: string; end: string } | null;
  availableDays: string[];
  onHoursChange: (hours: { start: string; end: string }) => void;
  onDaysChange: (days: string[]) => void;
  showDays?: boolean;
}

const DAYS = [
  { value: "monday", label: "Lun" },
  { value: "tuesday", label: "Mar" },
  { value: "wednesday", label: "Mié" },
  { value: "thursday", label: "Jue" },
  { value: "friday", label: "Vie" },
  { value: "saturday", label: "Sáb" },
  { value: "sunday", label: "Dom" },
];

function MenuAvailabilityEditor({
  availableHours,
  availableDays,
  onHoursChange,
  onDaysChange,
  showDays = true,
}: Props) {
  const toggleDay = (day: string) => {
    const newDays = availableDays.includes(day)
      ? availableDays.filter((d) => d !== day)
      : [...availableDays, day];
    onDaysChange(newDays);
  };

  return (
    <div className="space-y-4">
      {/* Hours */}
      <div>
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2 block flex items-center gap-2">
          <Clock size={12} />
          Horario de Disponibilidad
        </label>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={availableHours?.start || "09:00"}
            onChange={(e) => onHoursChange({ ...availableHours, start: e.target.value, end: availableHours?.end || "23:00" })}
            className="px-3 py-2 bg-surface-2 border border-white/10 rounded-lg text-ivory text-xs focus:outline-none focus:border-gold/30 transition-colors"
          />
          <span className="text-muted text-xs">a</span>
          <input
            type="time"
            value={availableHours?.end || "23:00"}
            onChange={(e) => onHoursChange({ ...availableHours, start: availableHours?.start || "09:00", end: e.target.value })}
            className="px-3 py-2 bg-surface-2 border border-white/10 rounded-lg text-ivory text-xs focus:outline-none focus:border-gold/30 transition-colors"
          />
        </div>
      </div>

      {/* Days */}
      {showDays && (
        <div>
          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2 block">
            Días Disponibles
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  availableDays.includes(day.value)
                    ? "bg-violet-500/20 text-violet-300 border border-violet-400/30"
                    : "bg-surface-2 text-muted border border-white/10 hover:border-violet-400/30"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(MenuAvailabilityEditor);
