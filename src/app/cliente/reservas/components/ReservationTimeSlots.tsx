"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { checkReservationAvailability } from "@/lib/api/bartender";

type AvailabilityMap = Record<string, boolean | "loading">;

interface Props {
  date: string;
  guests: number;
  onSelect: (start: string, end: string) => void;
}

export function ReservationTimeSlots({ date, guests, onSelect }: Props) {
  const [available, setAvailable] = useState<AvailabilityMap>({});
  const [selected, setSelected] = useState<string | null>(null);

  /* =========================
     GENERATE SLOTS (memoizado)
  ========================= */
  const slots = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const hour = 18 + Math.floor(i / 2);
      const min = i % 2 === 0 ? "00" : "30";
      return `${hour.toString().padStart(2, "0")}:${min}`;
    });
  }, []);

  /* =========================
     CHECK AVAILABILITY (OPTIMIZADO)
  ========================= */
  /* =========================
     EFFECT + POLLING
  ========================= */
  useEffect(() => {
    async function checkAvailability() {
      if (!date) return;

      // estado loading inmediato (UX)
      const loadingState: AvailabilityMap = {};
      slots.forEach((s) => (loadingState[s] = "loading"));
      setAvailable(loadingState);

      const result: AvailabilityMap = {};

      await Promise.all(
        slots.map(async (time) => {
          const start = new Date(`${date}T${time}`);
          const end = new Date(start.getTime() + 60 * 60 * 1000);

          try {
            const data = await checkReservationAvailability({
              start: start.toISOString(),
              end: end.toISOString(),
              guests,
            });

            result[time] = data.available;
          } catch {
            result[time] = false;
          }
        })
      );

      setAvailable(result);
    }

    checkAvailability();

    const id = setInterval(checkAvailability, 10000); // ⏱ polling
    return () => clearInterval(id);
  }, [date, guests]);

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium text-sm">
          Horarios disponibles
        </h3>

        <span className="text-xs text-white/40">
          actualización automática
        </span>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-3">

        {slots.map((time) => {
          const state = available[time];

          const isLoading = state === "loading";
          const isAvailable = state === true;
          const isUnavailable = state === false;
          const isSelected = selected === time;

          return (
            <button
              key={time}
              disabled={!isAvailable}
              onClick={() => {
                setSelected(time);

                const start = new Date(`${date}T${time}`);
                const end = new Date(start.getTime() + 3600000);

                onSelect(start.toISOString(), end.toISOString());
              }}
              className={clsx(
                "relative p-3 rounded-xl text-sm font-semibold transition-all duration-200",
                "border backdrop-blur-md overflow-hidden",

                /* =========================
                   BASE
                ========================= */
                "flex items-center justify-center",

                /* =========================
                   LOADING (skeleton)
                ========================= */
                isLoading &&
                  "bg-white/5 border-white/10 animate-pulse text-transparent",

                /* =========================
                   AVAILABLE (verde tipo booking)
                ========================= */
                isAvailable &&
                  "bg-emerald-500/10 text-emerald-300 border-emerald-400/20 hover:bg-emerald-500/20",

                /* =========================
                   UNAVAILABLE
                ========================= */
                isUnavailable &&
                  "bg-white/5 text-white/30 border-white/5 cursor-not-allowed",

                /* =========================
                   SELECTED (gold premium)
                ========================= */
                isSelected &&
                  "bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-yellow-400 shadow-lg shadow-yellow-400/30 scale-[1.03]"
              )}
            >
              {/* shimmer loading */}
              {isLoading && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
              )}

              {/* label */}
              <span className={clsx(isLoading && "opacity-0")}>
                {time}
              </span>

              {/* dot indicator */}
              {isAvailable && !isSelected && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* FOOTER INFO */}
      <div className="flex justify-center gap-4 text-xs text-white/40">

        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          Disponible
        </div>

        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-yellow-400 rounded-full" />
          Seleccionado
        </div>

        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-white/30 rounded-full" />
          No disponible
        </div>

      </div>
    </div>
  );
}