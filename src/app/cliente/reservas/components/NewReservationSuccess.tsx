"use client";

import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock, Users, Home, ArrowRight } from "lucide-react";
import Link from "next/link";
import ui from "../../cliente-ui.module.css";

interface NewReservationSuccessProps {
  date: string;
  time: string;
  guests: number;
  onReset: () => void;
}

export function NewReservationSuccess({ date, time, guests, onReset }: NewReservationSuccessProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      className={ui.newReservationSuccess}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 200,
          delay: 0.2,
        }}
      >
        <CheckCircle className={ui.newReservationSuccessIcon} />
      </motion.div>

      <motion.h1
        className={ui.newReservationSuccessTitle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        ¡Reserva Confirmada!
      </motion.h1>

      <motion.p
        className={ui.newReservationSuccessSubtitle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Tu mesa está reservada. Te esperamos en Nebula para una experiencia
        gastronómica excepcional.
      </motion.p>

      <motion.div
        className={ui.newReservationSuccessDetails}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className={ui.newReservationSuccessDetail}>
          <div className={ui.newReservationSuccessDetailLabel}>
            <Calendar className="inline-block w-4 h-4 mr-2" />
            Fecha
          </div>
          <div className={ui.newReservationSuccessDetailValue}>
            {formatDate(date)}
          </div>
        </div>

        <div className={ui.newReservationSuccessDetail}>
          <div className={ui.newReservationSuccessDetailLabel}>
            <Clock className="inline-block w-4 h-4 mr-2" />
            Horario
          </div>
          <div className={ui.newReservationSuccessDetailValue}>
            {formatTime(time)}
          </div>
        </div>

        <div className={ui.newReservationSuccessDetail}>
          <div className={ui.newReservationSuccessDetailLabel}>
            <Users className="inline-block w-4 h-4 mr-2" />
            Personas
          </div>
          <div className={ui.newReservationSuccessDetailValue}>
            {guests} {guests === 1 ? "persona" : "personas"}
          </div>
        </div>
      </motion.div>

      <motion.div
        className={ui.newReservationSuccessActions}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Link
          href="/cliente/carta"
          className={ui.newReservationSuccessButton}
        >
          Ver la Carta
          <ArrowRight className="inline-block w-4 h-4 ml-2" />
        </Link>

        <button
          onClick={onReset}
          className={ui.newReservationSuccessButtonSecondary}
        >
          <Home className="inline-block w-4 h-4 mr-2" />
          Volver al Inicio
        </button>
      </motion.div>
    </motion.div>
  );
}
