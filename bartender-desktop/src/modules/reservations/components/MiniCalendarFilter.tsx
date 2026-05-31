"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Sparkles } from "lucide-react";
import type { Reservation } from "../types/reservation";

interface Props {
  reservations: Reservation[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

export default function MiniCalendarFilter({
  reservations,
  selectedDate,
  onSelectDate,
}: Props) {
  // Generate 7 days starting from today
  const days = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }).map((_, i) => addDays(today, i));
  }, []);

  // Calculate occupancy levels for each of the 7 days based on reservations
  const occupancyMap = useMemo(() => {
    const map: Record<string, { count: number; percentage: number; color: string; glow: string }> = {};

    days.forEach((day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      // Filter reservations active/confirmed on this day
      const dayReservations = reservations.filter((r) => {
        const rDate = new Date(r.startTime);
        return isSameDay(rDate, day) && (r.status === "confirmed" || r.status === "seated" || r.status === "pending");
      });

      const count = dayReservations.length;
      // Assume a theoretical salon capacity of 10 reservations max per night for simple percentage calculation
      const percentage = Math.min((count / 10) * 100, 100);

      let color = "bg-emerald-500";
      let glow = "shadow-emerald-500/20";
      if (percentage > 70) {
        color = "bg-red-500 animate-pulse";
        glow = "shadow-red-500/30 ring-1 ring-red-500/50";
      } else if (percentage > 30) {
        color = "bg-amber-500";
        glow = "shadow-amber-500/30 ring-1 ring-amber-500/40";
      }

      map[dayKey] = {
        count,
        percentage,
        color,
        glow,
      };
    });

    return map;
  }, [days, reservations]);

  return (
    <div className="bg-surface-3/30 border border-white/5 rounded-[2rem] p-6 space-y-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-xl border border-gold/20 text-gold shadow-gold-glow/20">
            <CalendarIcon size={16} />
          </div>
          <div>
            <p className="text-xs font-black text-gold uppercase tracking-[0.3em]">Agenda Semanal</p>
            <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">
              Ocupación estimada de las próximas noches
            </p>
          </div>
        </div>

        {selectedDate && (
          <button
            onClick={() => onSelectDate(null)}
            className="text-[9px] font-black text-muted hover:text-gold uppercase tracking-widest bg-white/5 hover:bg-gold/10 px-3 py-1.5 rounded-lg border border-white/5 hover:border-gold/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles size={10} />
            Ver Todas
          </button>
        )}
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar select-none">
        {days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const occupancy = occupancyMap[dayKey] || { count: 0, percentage: 0, color: "bg-emerald-500", glow: "" };
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

          const dayOfWeek = format(day, "EEEE", { locale: es });
          const dayNum = format(day, "dd");
          const month = format(day, "MMM", { locale: es });

          return (
            <motion.button
              key={dayKey}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectDate(isSelected ? null : day)}
              className={`
                flex-1 min-w-[95px] max-w-[130px] p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-between gap-3 relative overflow-hidden group
                ${isSelected
                  ? "bg-gradient-to-b from-gold/15 to-gold/5 border-gold shadow-gold-glow scale-105"
                  : "bg-surface-4/40 border-white/5 hover:border-white/10 hover:bg-surface-4/60"
                }
              `}
            >
              {/* LED Ring Background Effect */}
              {isSelected && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,163,64,0.08)_0%,transparent_70%)] pointer-events-none" />
              )}

              {/* Day Name */}
              <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? "text-gold" : "text-muted"}`}>
                {dayOfWeek}
              </span>

              {/* Day Number & Month */}
              <div className="flex flex-col items-center leading-none">
                <span className={`text-2xl font-black ${isSelected ? "text-white" : "text-ivory"}`}>
                  {dayNum}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-muted/60 mt-1">
                  {month}
                </span>
              </div>

              {/* Occupancy Indicator LED bar */}
              <div className="w-full space-y-1.5 mt-1">
                <div className="flex items-center justify-between text-[8px] font-bold text-muted/50 uppercase tracking-widest px-0.5">
                  <span>Reservas</span>
                  <span className={occupancy.count > 0 ? "text-ivory/80" : ""}>{occupancy.count}</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${occupancy.color} ${occupancy.glow}`}
                    style={{ width: `${occupancy.percentage}%` }}
                  />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
