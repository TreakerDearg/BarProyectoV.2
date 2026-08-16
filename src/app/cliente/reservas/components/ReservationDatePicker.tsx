"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import ui from "../../cliente-ui.module.css";

interface ReservationDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
}

export default function ReservationDatePicker({
  value,
  onChange,
  minDate,
}: ReservationDatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  // Generate quick date options
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
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return "Hoy";
    if (isTomorrow) return "Mañana";
    
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
    });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const getISODate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleQuickSelect = (date: Date) => {
    onChange(getISODate(date));
  };

  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  return (
    <div className={ui.datePicker}>
      <div className={ui.datePickerHeader}>
        <Calendar className={ui.datePickerIcon} />
        <div>
          <h3 className={ui.datePickerTitle}>¿Cuándo querés venir?</h3>
          <p className={ui.datePickerSubtitle}>
            Seleccioná una fecha para ver disponibilidad
          </p>
        </div>
      </div>

      {/* Quick Selection */}
      <div className={ui.datePickerQuick}>
        {quickDates.map((date, index) => {
          const isoDate = getISODate(date);
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          
          return (
            <motion.button
              key={isoDate}
              type="button"
              onClick={() => handleQuickSelect(date)}
              className={`${ui.datePickerQuickCard} ${
                isSelected ? ui.datePickerQuickCardActive : ""
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className={ui.datePickerQuickDay}>{formatDate(date)}</span>
              <span className={ui.datePickerQuickDate}>
                {date.getDate()}
              </span>
              <span className={ui.datePickerQuickMonth}>
                {date.toLocaleDateString("es-AR", { month: "short" })}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Calendar Toggle */}
      <motion.button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className={ui.datePickerCalendarToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Calendar className={ui.datePickerCalendarIcon} />
        <span>
          {showCalendar ? "Ocultar calendario" : "Ver calendario completo"}
        </span>
        {showCalendar ? (
          <ChevronLeft className={ui.datePickerCalendarArrow} />
        ) : (
          <ChevronRight className={ui.datePickerCalendarArrow} />
        )}
      </motion.button>

      {/* Calendar */}
      {showCalendar && (
        <motion.div
          className={ui.datePickerCalendar}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={minDate}
            className={ui.datePickerInput}
          />
        </motion.div>
      )}

      {/* Selected Date Display */}
      {selectedDate && (
        <motion.div
          className={ui.datePickerSelected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Calendar className={ui.datePickerSelectedIcon} />
          <div>
            <span className={ui.datePickerSelectedLabel}>Fecha seleccionada:</span>
            <span className={ui.datePickerSelectedValue}>
              {formatFullDate(selectedDate)}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}