"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import ui from "../../cliente-ui.module.css";

interface NewDateSelectorProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
}

export function NewDateSelector({ value, onChange, minDate }: NewDateSelectorProps) {
  const quickDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === tomorrow.toDateString()) return "Mañana";
    
    return date.toLocaleDateString("es-AR", { weekday: "long" });
  };

  const getISODate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  return (
    <div className={ui.newDateSelector}>
      <div className={ui.newDateSelectorTitle}>
        <Calendar className="inline-block w-5 h-5 mr-2" />
        ¿Cuándo querés venir?
      </div>
      <p className={ui.newDateSelectorSubtitle}>
        Seleccioná una fecha para ver disponibilidad
      </p>

      <div className={ui.newDateQuickGrid}>
        {quickDates.map((date, index) => {
          const isoDate = getISODate(date);
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          
          return (
            <motion.button
              key={isoDate}
              type="button"
              onClick={() => onChange(isoDate)}
              className={`${ui.newDateQuickCard} ${
                isSelected ? ui.newDateQuickCardSelected : ""
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className={ui.newDateQuickDay}>{formatDate(date)}</span>
              <span className={ui.newDateQuickNumber}>{date.getDate()}</span>
              <span className={ui.newDateQuickMonth}>
                {date.toLocaleDateString("es-AR", { month: "short" })}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
