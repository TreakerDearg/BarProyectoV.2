"use client";

import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock, Users, Home, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import ui from "../../cliente-ui.module.css";
import { DIETARY_OPTIONS, type GuestDietaryEntry } from "@/lib/types/reservation";
import { getDietaryIcon } from "@/lib/utils/dietaryIcons";

interface NewReservationSuccessProps {
  date: string;
  time: string;
  guests: number;
  guestDietaryRestrictions?: GuestDietaryEntry[];
  onReset: () => void;
}

export function NewReservationSuccess({
  date,
  time,
  guests,
  guestDietaryRestrictions = [],
  onReset,
}: NewReservationSuccessProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("es-AR", {
      weekday: "long", day: "numeric", month: "long",
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    return new Date(timeStr).toLocaleTimeString("es-AR", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  const guestsWithRestrictions = guestDietaryRestrictions.filter(
    (g) => g.restrictions.length > 0
  );

  return (
    <motion.div
      className={ui.newReservationSuccess}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ícono de éxito */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.2 }}
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

      {/* Resumen de la reserva */}
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

      {/* Restricciones registradas */}
      {guestsWithRestrictions.length > 0 && (
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
            }}
          >
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--amber,#D6A84F)",
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle size={13} />
              Restricciones notificadas al bar
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {guestsWithRestrictions.map((g, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.625rem",
                  }}
                >
                  <span
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      borderRadius: "50%",
                      background: "rgba(212,163,64,0.15)",
                      border: "1px solid rgba(212,163,64,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      color: "var(--gold,#D4A340)",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--text,#F5F0E8)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {g.guestName || `Invitado ${idx + 1}`}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.25rem",
                      }}
                    >
                      {g.restrictions.map((r) => {
                        const opt = DIETARY_OPTIONS.find((o) => o.value === r);
                        return (
                          <span
                            key={r}
                            style={{
                              fontSize: "0.6875rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "2px 8px",
                              borderRadius: "999px",
                              background: "rgba(255,255,255,0.07)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              color: "var(--text-dim,rgba(245,240,232,0.6))",
                            }}
                          >
                            {getDietaryIcon(opt?.iconName ?? "AlertTriangle", 10)}
                            {opt?.label ?? r}
                          </span>
                        );
                      })}
                    </div>
                    {g.notes && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted,rgba(245,240,232,0.35))",
                          marginTop: "0.25rem",
                          fontStyle: "italic",
                        }}
                      >
                        {g.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Acciones */}
      <motion.div
        className={ui.newReservationSuccessActions}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.6 }}
      >
        <Link href="/cliente/carta" className={ui.newReservationSuccessButton}>
          Ver la Carta
          <ArrowRight className="inline-block w-4 h-4 ml-2" />
        </Link>

        <button onClick={onReset} className={ui.newReservationSuccessButtonSecondary}>
          <Home className="inline-block w-4 h-4 mr-2" />
          Volver al Inicio
        </button>
      </motion.div>
    </motion.div>
  );
}
