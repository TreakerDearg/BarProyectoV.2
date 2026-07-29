"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import clsx from "clsx";
import { checkReservationAvailability } from "@/lib/api/bartender";
import ui from "../../cliente-ui.module.css";

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
    <div className={ui.timeSelector}>

      {/* HEADER */}
      <div className={ui.timeSelectorHeader}>
        <Clock className={ui.timeSelectorIcon} />
        <div>
          <h3 className={ui.timeSelectorTitle}>Horarios Disponibles</h3>
          <p className={ui.timeSelectorSubtitle}>
            Seleccioná el horario para tu reserva
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className={ui.timeSelectorGrid}>

        {slots.map((time, index) => {
          const state = available[time];

          const isLoading = state === "loading";
          const isAvailable = state === true;
          const isUnavailable = state === false;
          const isSelected = selected === time;

          return (
            <motion.button
              key={time}
              disabled={!isAvailable}
              onClick={() => {
                setSelected(time);

                const start = new Date(`${date}T${time}`);
                const end = new Date(start.getTime() + 3600000);

                onSelect(start.toISOString(), end.toISOString());
              }}
              className={clsx(
                ui.timeSlot,
                isLoading && ui.timeSlotLoading,
                isAvailable && ui.timeSlotAvailable,
                isUnavailable && ui.timeSlotUnavailable,
                isSelected && ui.timeSlotSelected
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={isAvailable ? { scale: 1.05 } : {}}
              whileTap={isAvailable ? { scale: 0.95 } : {}}
            >
              {/* shimmer loading */}
              {isLoading && (
                <span className={ui.timeSlotShimmer} />
              )}

              {/* time label */}
              <span className={ui.timeSlotLabel}>
                {time}
              </span>

              {/* availability indicator */}
              {isAvailable && !isSelected && (
                <span className={ui.timeSlotIndicator} />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* LEGEND */}
      <div className={ui.timeSelectorLegend}>
        <div className={ui.timeSelectorLegendItem}>
          <span className={ui.timeSelectorLegendDot} />
          <span className={ui.timeSelectorLegendText}>Disponible</span>
        </div>
        <div className={ui.timeSelectorLegendItem}>
          <span className={`${ui.timeSelectorLegendDot} ${ui.timeSelectorLegendDotSelected}`} />
          <span className={ui.timeSelectorLegendText}>Seleccionado</span>
        </div>
        <div className={ui.timeSelectorLegendItem}>
          <span className={`${ui.timeSelectorLegendDot} ${ui.timeSelectorLegendDotUnavailable}`} />
          <span className={ui.timeSelectorLegendText}>No disponible</span>
        </div>
      </div>
    </div>
  );
}