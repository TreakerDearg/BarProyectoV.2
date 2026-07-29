"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, Users, MapPin, Edit2, Check } from "lucide-react";
import ui from "../../cliente-ui.module.css";

interface ReservationSummaryProps {
  date?: string;
  time?: string;
  guests?: number;
  table?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  onEdit: (step: number) => void;
  onConfirm: (e?: React.SyntheticEvent) => void;
  loading?: boolean;
}

export default function ReservationSummary({
  date,
  time,
  guests,
  table,
  customerName,
  customerPhone,
  notes,
  onEdit,
  onConfirm,
  loading = false,
}: ReservationSummaryProps) {
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

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={ui.reservationSummary}>
      <div className={ui.reservationSummaryContainer}>

        {/* Header */}
        <div className={ui.reservationSummaryHeader}>
          <h3 className={ui.reservationSummaryTitle}>Resumen de tu Reserva</h3>
          <p className={ui.reservationSummarySubtitle}>
            Revisá los detalles antes de confirmar
          </p>
        </div>

        {/* Summary Card */}
        <div className={ui.reservationSummaryCard}>

          {/* Date & Time */}
          <div className={ui.reservationSummarySection}>
            <div className={ui.reservationSummarySectionHeader}>
              <CalendarDays className={ui.reservationSummarySectionIcon} />
              <span className={ui.reservationSummarySectionTitle}>Fecha y Horario</span>
              <button
                type="button"
                onClick={() => onEdit(0)}
                className={ui.reservationSummaryEditButton}
              >
                <Edit2 className={ui.reservationSummaryEditIcon} />
              </button>
            </div>
            <div className={ui.reservationSummarySectionContent}>
              <div className={ui.reservationSummaryDetail}>
                <span className={ui.reservationSummaryDetailLabel}>Fecha</span>
                <span className={ui.reservationSummaryDetailValue}>
                  {date ? formatDate(date) : "No seleccionada"}
                </span>
              </div>
              <div className={ui.reservationSummaryDetail}>
                <span className={ui.reservationSummaryDetailLabel}>Horario</span>
                <span className={ui.reservationSummaryDetailValue}>
                  {time ? formatTime(time) : "No seleccionado"}
                </span>
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className={ui.reservationSummarySection}>
            <div className={ui.reservationSummarySectionHeader}>
              <Users className={ui.reservationSummarySectionIcon} />
              <span className={ui.reservationSummarySectionTitle}>Cantidad de Personas</span>
              <button
                type="button"
                onClick={() => onEdit(0)}
                className={ui.reservationSummaryEditButton}
              >
                <Edit2 className={ui.reservationSummaryEditIcon} />
              </button>
            </div>
            <div className={ui.reservationSummarySectionContent}>
              <div className={ui.reservationSummaryDetail}>
                <span className={ui.reservationSummaryDetailValue}>
                  {guests || 0} {guests === 1 ? "persona" : "personas"}
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          {table && (
            <div className={ui.reservationSummarySection}>
              <div className={ui.reservationSummarySectionHeader}>
                <MapPin className={ui.reservationSummarySectionIcon} />
                <span className={ui.reservationSummarySectionTitle}>Mesa</span>
                <button
                  type="button"
                  onClick={() => onEdit(1)}
                  className={ui.reservationSummaryEditButton}
                >
                  <Edit2 className={ui.reservationSummaryEditIcon} />
                </button>
              </div>
              <div className={ui.reservationSummarySectionContent}>
                <div className={ui.reservationSummaryDetail}>
                  <span className={ui.reservationSummaryDetailValue}>
                    Mesa #{table}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className={ui.reservationSummarySection}>
            <div className={ui.reservationSummarySectionHeader}>
              <Check className={ui.reservationSummarySectionIcon} />
              <span className={ui.reservationSummarySectionTitle}>Tus Datos</span>
              <button
                type="button"
                onClick={() => onEdit(2)}
                className={ui.reservationSummaryEditButton}
              >
                <Edit2 className={ui.reservationSummaryEditIcon} />
              </button>
            </div>
            <div className={ui.reservationSummarySectionContent}>
              <div className={ui.reservationSummaryDetail}>
                <span className={ui.reservationSummaryDetailLabel}>Nombre</span>
                <span className={ui.reservationSummaryDetailValue}>
                  {customerName || "No ingresado"}
                </span>
              </div>
              <div className={ui.reservationSummaryDetail}>
                <span className={ui.reservationSummaryDetailLabel}>Teléfono</span>
                <span className={ui.reservationSummaryDetailValue}>
                  {customerPhone || "No ingresado"}
                </span>
              </div>
              {notes && (
                <div className={ui.reservationSummaryDetail}>
                  <span className={ui.reservationSummaryDetailLabel}>Notas</span>
                  <span className={ui.reservationSummaryDetailValue}>
                    {notes}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Confirm Button */}
        <motion.button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={ui.reservationSummaryConfirm}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <span className={ui.reservationSummaryLoading}>
              <span className={ui.reservationSummarySpinner} />
              Confirmando...
            </span>
          ) : (
            <span className={ui.reservationSummaryConfirmText}>
              Confirmar Reserva
            </span>
          )}
        </motion.button>

        {/* Info */}
        <p className={ui.reservationSummaryInfo}>
          Al confirmar, aceptás nuestra política de reservas y cancelaciones.
        </p>

      </div>
    </div>
  );
}
