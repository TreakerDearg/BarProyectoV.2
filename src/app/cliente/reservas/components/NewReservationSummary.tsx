"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Users } from "lucide-react";
import ui from "../../cliente-ui.module.css";

interface NewReservationSummaryProps {
  date: string;
  time: string;
  guests: number;
  customerName?: string;
  onConfirm: () => void;
  loading: boolean;
  canConfirm: boolean;
}

export function NewReservationSummary({
  date,
  time,
  guests,
  customerName,
  onConfirm,
  loading,
  canConfirm,
}: NewReservationSummaryProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Seleccionar fecha";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "Seleccionar horario";
    const date = new Date(timeStr);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={ui.newReservationSummary}>
      <div className={ui.newReservationSummaryTitle}>Tu Reserva</div>

      <div className={ui.newReservationSummaryItem}>
        <div className={ui.newReservationSummaryLabel}>
          <Calendar className="inline-block w-4 h-4 mr-2" />
          Fecha
        </div>
        <div className={ui.newReservationSummaryValue}>{formatDate(date)}</div>
      </div>

      <div className={ui.newReservationSummaryItem}>
        <div className={ui.newReservationSummaryLabel}>
          <Clock className="inline-block w-4 h-4 mr-2" />
          Horario
        </div>
        <div className={ui.newReservationSummaryValue}>{formatTime(time)}</div>
      </div>

      <div className={ui.newReservationSummaryItem}>
        <div className={ui.newReservationSummaryLabel}>
          <Users className="inline-block w-4 h-4 mr-2" />
          Personas
        </div>
        <div className={ui.newReservationSummaryValue}>{guests}</div>
      </div>

      {customerName && (
        <div className={ui.newReservationSummaryItem}>
          <div className={ui.newReservationSummaryLabel}>Nombre</div>
          <div className={ui.newReservationSummaryValue}>{customerName}</div>
        </div>
      )}

      <div className={ui.newReservationSummaryCTA}>
        <motion.button
          onClick={onConfirm}
          disabled={!canConfirm || loading}
          className={ui.newReservationSummaryButton}
          whileHover={canConfirm && !loading ? { scale: 1.02 } : {}}
          whileTap={canConfirm && !loading ? { scale: 0.98 } : {}}
        >
          {loading ? "Confirmando..." : "Confirmar reserva"}
        </motion.button>
      </div>
    </div>
  );
}
