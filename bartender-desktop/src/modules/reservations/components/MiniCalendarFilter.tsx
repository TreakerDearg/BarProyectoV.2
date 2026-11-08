"use client";

/**
 * MiniCalendarFilter — Dos variantes:
 *
 * 1. `ReservationDateChips` (export nombrado):
 *    Chips horizontales compactos para integrar inline en el header.
 *    7 días desde hoy, con punto de color según ocupación.
 *
 * 2. `MiniCalendarFilter` (export default):
 *    Bloque completo original (mantenido por compatibilidad).
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import { useMemo } from "react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import type { Reservation } from "../types/reservation";

interface Props {
  reservations:   Reservation[];
  selectedDate:   Date | null;
  onSelectDate:   (date: Date | null) => void;
}

/* ── Cálculo de ocupación compartido ───────────────────────── */
function useOccupancy(reservations: Reservation[]) {
  const days = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  }, []);

  const occupancyMap = useMemo(() => {
    const map: Record<string, { count: number; dot: string }> = {};
    days.forEach((day) => {
      const key   = format(day, "yyyy-MM-dd");
      const count = reservations.filter((r) => {
        const d = new Date(r.startTime);
        return isSameDay(d, day) &&
          (r.status === "confirmed" || r.status === "seated" || r.status === "pending");
      }).length;
      const dot = count > 5 ? "#F85149" : count > 2 ? "#FF7B54" : count > 0 ? "#3FB950" : "transparent";
      map[key] = { count, dot };
    });
    return map;
  }, [days, reservations]);

  return { days, occupancyMap };
}

/* ── ReservationDateChips — chips compactos para el header ─── */
export function ReservationDateChips({ reservations, selectedDate, onSelectDate }: Props) {
  const { days, occupancyMap } = useOccupancy(reservations);

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto"
      style={{ scrollbarWidth: "none", maxWidth: 400 }}
    >
      {days.map((day) => {
        const key      = format(day, "yyyy-MM-dd");
        const occ      = occupancyMap[key] ?? { count: 0, dot: "transparent" };
        const isActive = selectedDate ? isSameDay(day, selectedDate) : false;
        const label    = format(day, "EEE d", { locale: es });

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectDate(isActive ? null : day)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex-shrink-0 whitespace-nowrap capitalize"
            style={{
              background:  isActive ? "rgba(240,180,41,0.15)" : "#1C2333",
              border:      `1px solid ${isActive ? "rgba(240,180,41,0.40)" : "#30363D"}`,
              color:       isActive ? "#F0B429" : "#8B949E",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,180,41,0.25)";
                (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363D";
                (e.currentTarget as HTMLButtonElement).style.color = "#8B949E";
              }
            }}
          >
            {label}
            {occ.dot !== "transparent" && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: occ.dot }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── MiniCalendarFilter — bloque completo (default export) ─── */
export default function MiniCalendarFilter({ reservations, selectedDate, onSelectDate }: Props) {
  const { days, occupancyMap } = useOccupancy(reservations);

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: "#161B22", border: "1px solid #30363D" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#F0B429" }}>
          Agenda semanal
        </p>
        {selectedDate && (
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg transition-colors"
            style={{ background: "#21283A", border: "1px solid #30363D", color: "#566270" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F0B429"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
          >
            Ver todas
          </button>
        )}
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {days.map((day) => {
          const key      = format(day, "yyyy-MM-dd");
          const occ      = occupancyMap[key] ?? { count: 0, dot: "transparent" };
          const isActive = selectedDate ? isSameDay(day, selectedDate) : false;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(isActive ? null : day)}
              className="flex-1 min-w-[80px] max-w-[110px] p-3 rounded-xl flex flex-col items-center gap-2 transition-all"
              style={{
                background:  isActive ? "rgba(240,180,41,0.15)" : "#21283A",
                border:      `1px solid ${isActive ? "rgba(240,180,41,0.40)" : "#30363D"}`,
                color:       isActive ? "#F0B429" : "#8B949E",
              }}
            >
              <span className="text-[9px] font-black uppercase tracking-wider capitalize">
                {format(day, "EEEE", { locale: es })}
              </span>
              <span className="text-2xl font-black" style={{ color: isActive ? "#E6EDF3" : "#E6EDF3" }}>
                {format(day, "dd")}
              </span>
              <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: "#566270" }}>
                {format(day, "MMM", { locale: es })}
              </span>
              <div className="w-full space-y-1">
                <div className="flex items-center justify-between text-[8px]" style={{ color: "#566270" }}>
                  <span>Reservas</span>
                  <span style={{ color: occ.count > 0 ? "#E6EDF3" : "#566270" }}>{occ.count}</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "#30363D" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width:      `${Math.min((occ.count / 10) * 100, 100)}%`,
                      background: occ.dot !== "transparent" ? occ.dot : "#30363D",
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
