"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { checkReservationAvailability } from "@/lib/api/bartender";
import ui from "../../cliente-ui.module.css";

interface NewTimeSlotSelectorProps {
  date: string;
  guests: number;
  onSelect: (start: string, end: string) => void;
}

export function NewTimeSlotSelector({ date, guests, onSelect }: NewTimeSlotSelectorProps) {
  const [availability, setAvailability] = useState<Record<string, "available" | "limited" | "unavailable" | "loading">>({});
  const [selected, setSelected] = useState<string | null>(null);

  const slots = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const hour = 18 + Math.floor(i / 2);
      const min = i % 2 === 0 ? "00" : "30";
      return `${hour.toString().padStart(2, "0")}:${min}`;
    });
  }, []);

  useEffect(() => {
    async function checkAvailability() {
      if (!date) return;

      const loadingState: Record<string, "available" | "limited" | "unavailable" | "loading"> = {};
      slots.forEach((s) => (loadingState[s] = "loading"));
      setAvailability(loadingState);

      const result: Record<string, "available" | "limited" | "unavailable" | "loading"> = {};

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

            if (data.available) {
              result[time] = Math.random() > 0.7 ? "limited" : "available";
            } else {
              result[time] = "unavailable";
            }
          } catch {
            result[time] = "unavailable";
          }
        })
      );

      setAvailability(result);
    }

    checkAvailability();
    const id = setInterval(checkAvailability, 10000);
    return () => clearInterval(id);
  }, [date, guests]);

  return (
    <div className={ui.newTimeSlotSelector}>
      <div className={ui.newTimeSlotSelectorTitle}>
        <Clock className="inline-block w-5 h-5 mr-2" />
        Horarios disponibles
      </div>
      <p className={ui.newTimeSlotSelectorSubtitle}>
        Seleccioná el horario para tu reserva
      </p>

      <div className={ui.newTimeSlotGrid}>
        {slots.map((time, index) => {
          const state = availability[time];
          const isSelected = selected === time;
          const isUnavailable = state === "unavailable";
          const isLoading = state === "loading";

          return (
            <motion.button
              key={time}
              disabled={isUnavailable || isLoading}
              onClick={() => {
                setSelected(time);
                const start = new Date(`${date}T${time}`);
                const end = new Date(start.getTime() + 3600000);
                onSelect(start.toISOString(), end.toISOString());
              }}
              className={`${ui.newTimeSlot} ${
                isSelected ? ui.newTimeSlotSelected : ""
              } ${
                state === "limited" ? ui.newTimeSlotLimited : ""
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={!isUnavailable && !isLoading ? { scale: 1.05 } : {}}
              whileTap={!isUnavailable && !isLoading ? { scale: 0.95 } : {}}
            >
              {isLoading ? "..." : time}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
