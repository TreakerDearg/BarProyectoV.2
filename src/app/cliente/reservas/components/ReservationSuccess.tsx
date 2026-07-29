"use client";

import { motion } from "framer-motion";
import { CheckCircle, CalendarDays, Clock, Users, ArrowRight, Home, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import ui from "../../cliente-ui.module.css";

interface ReservationSuccessProps {
  reservationId?: string;
  date?: string;
  time?: string;
  guests?: number;
  onReset: () => void;
}

export default function ReservationSuccess({
  reservationId,
  date,
  time,
  guests,
  onReset,
}: ReservationSuccessProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.div
      className={ui.reservationSuccess}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={ui.reservationSuccessContainer}>

        {/* Success Icon Animation */}
        <motion.div
          className={ui.reservationSuccessIconWrapper}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 200,
            delay: 0.2,
          }}
        >
          <CheckCircle className={ui.reservationSuccessIcon} />
        </motion.div>

        {/* Title */}
        <motion.h1
          className={ui.reservationSuccessTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          ¡Reserva Confirmada!
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className={ui.reservationSuccessSubtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Tu mesa está reservada. Te esperamos en Nebula para una experiencia
          gastronómica excepcional.
        </motion.p>

        {/* Reservation Details Card */}
        <motion.div
          className={ui.reservationSuccessCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className={ui.reservationSuccessCardHeader}>
            <h3 className={ui.reservationSuccessCardTitle}>Detalles de tu Reserva</h3>
            {reservationId && (
              <span className={ui.reservationSuccessCardId}>
                #{reservationId}
              </span>
            )}
          </div>

          <div className={ui.reservationSuccessCardBody}>
            {date && (
              <div className={ui.reservationSuccessDetail}>
                <CalendarDays className={ui.reservationSuccessDetailIcon} />
                <div>
                  <span className={ui.reservationSuccessDetailLabel}>Fecha</span>
                  <span className={ui.reservationSuccessDetailValue}>
                    {formatDate(date)}
                  </span>
                </div>
              </div>
            )}

            {time && (
              <div className={ui.reservationSuccessDetail}>
                <Clock className={ui.reservationSuccessDetailIcon} />
                <div>
                  <span className={ui.reservationSuccessDetailLabel}>Horario</span>
                  <span className={ui.reservationSuccessDetailValue}>
                    {time}
                  </span>
                </div>
              </div>
            )}

            {guests && (
              <div className={ui.reservationSuccessDetail}>
                <Users className={ui.reservationSuccessDetailIcon} />
                <div>
                  <span className={ui.reservationSuccessDetailLabel}>Personas</span>
                  <span className={ui.reservationSuccessDetailValue}>
                    {guests} {guests === 1 ? "persona" : "personas"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info Message */}
        <motion.div
          className={ui.reservationSuccessInfo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <p>
            Te enviaremos un recordatorio por WhatsApp antes de tu reserva.
            Si necesitás modificar o cancelar, contáctanos con al menos 24 horasde anticipación.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className={ui.reservationSuccessActions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Link
            href="/cliente/carta"
            className={ui.reservationSuccessButton}
          >
            <UtensilsCrossed className={ui.reservationSuccessButtonIcon} />
            <span>Ver la Carta</span>
            <ArrowRight className={ui.reservationSuccessButtonArrow} />
          </Link>

          <button
            onClick={onReset}
            className={ui.reservationSuccessButtonSecondary}
          >
            <Home className={ui.reservationSuccessButtonIcon} />
            <span>Volver al Inicio</span>
          </button>
        </motion.div>

        {/* Decorative Elements */}
        <div className={ui.reservationSuccessGlow} />
        <div className={ui.reservationSuccessParticles} />

      </div>
    </motion.div>
  );
}
