"use client";

/**
 * ReservationCard — Tarjeta compacta de reserva.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Solo muestra: nombre, hora, estado, invitados, mesa.
 * El detalle completo va en ReservationDetailPanel.
 */
import { Users, Clock, Crown, AlertCircle, MessageSquare } from "lucide-react";
import type { Reservation } from "../types/reservation";
import { format } from "date-fns";
import { es }     from "date-fns/locale";

interface Props {
  r:           Reservation;
  selected?:   boolean;
  highlighted?: boolean;
  onClick?:    () => void;
}

/* ── Configuración visual por estado ───────────────────────── */
const STATUS_CONFIG: Record<Reservation["status"], {
  label:  string;
  color:  string;
  bg:     string;
  border: string;
}> = {
  pending:   { label: "Por confirmar", color: "#FF7B54", bg: "rgba(255,123,84,0.12)",  border: "rgba(255,123,84,0.30)"  },
  confirmed: { label: "Confirmada",    color: "#F0B429", bg: "rgba(240,180,41,0.12)",  border: "rgba(240,180,41,0.30)"  },
  seated:    { label: "En mesa",       color: "#3FB950", bg: "rgba(63,185,80,0.12)",   border: "rgba(63,185,80,0.30)"   },
  completed: { label: "Finalizada",    color: "#566270", bg: "rgba(86,98,112,0.12)",   border: "rgba(86,98,112,0.25)"   },
  "no-show": { label: "No asistió",    color: "#F85149", bg: "rgba(248,81,73,0.12)",   border: "rgba(248,81,73,0.25)"   },
  cancelled: { label: "Cancelada",     color: "#F85149", bg: "rgba(248,81,73,0.10)",   border: "rgba(248,81,73,0.20)"   },
};

export default function ReservationCard({ r, selected, highlighted, onClick }: Props) {
  const cfg       = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
  const startTime = new Date(r.startTime);
  const timeStr   = isNaN(startTime.getTime())
    ? "--:--"
    : format(startTime, "HH:mm 'hs'", { locale: es });
  const dateStr   = isNaN(startTime.getTime())
    ? "---"
    : format(startTime, "EEE d MMM", { locale: es });

  /* Delay > 15 min */
  const now        = new Date();
  const isDelayed  = (r.status === "pending" || r.status === "confirmed") &&
                     !isNaN(startTime.getTime()) &&
                     (now.getTime() - startTime.getTime()) > 15 * 60 * 1000;
  const delayMin   = isDelayed ? Math.floor((now.getTime() - startTime.getTime()) / 60000) : 0;

  /* Tabla asignada */
  const tableLabel = r.tableId && typeof r.tableId === "object"
    ? `Mesa ${r.tableId.number}`
    : r.tableId
    ? "Mesa asignada"
    : "Sin mesa";

  /* Tiene notas */
  const hasNotes = Boolean(r.notes);

  /* Estilos del card */
  const cardBg     = selected ? "rgba(240,180,41,0.06)" : "#1C2333";
  const cardBorder = selected
    ? "rgba(240,180,41,0.45)"
    : isDelayed
    ? "rgba(248,81,73,0.30)"
    : highlighted
    ? "rgba(163,113,247,0.45)"
    : "#30363D";
  const cardShadow = selected ? "0 0 12px rgba(240,180,41,0.10)" : "none";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl transition-all duration-200 overflow-hidden group"
      style={{ background: cardBg, border: `1.5px solid ${cardBorder}`, boxShadow: cardShadow }}
      onMouseEnter={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,180,41,0.30)";
          (e.currentTarget as HTMLButtonElement).style.background   = "rgba(240,180,41,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = isDelayed ? "rgba(248,81,73,0.30)" : "#30363D";
          (e.currentTarget as HTMLButtonElement).style.background   = "#1C2333";
        }
      }}
    >
      {/* Barra de alerta de retraso */}
      {isDelayed && (
        <div
          className="flex items-center justify-between px-4 py-1.5"
          style={{ background: "rgba(248,81,73,0.12)", borderBottom: "1px solid rgba(248,81,73,0.20)" }}
        >
          <div className="flex items-center gap-1.5">
            <AlertCircle size={10} className="animate-pulse" style={{ color: "#F85149" }} />
            <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#F85149" }}>
              Alerta de retraso
            </span>
          </div>
          <span
            className="text-[9px] font-black px-1.5 py-0.5 rounded"
            style={{ background: "rgba(248,81,73,0.20)", color: "#FF6B63" }}
          >
            +{delayMin} min
          </span>
        </div>
      )}

      {/* Contenido principal */}
      <div className="p-4">
        {/* Fila 1: nombre + badge de estado */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Dot de estado */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }}
            />
            <h3
              className="text-sm font-bold truncate uppercase tracking-wide transition-colors"
              style={{ color: "#E6EDF3" }}
            >
              {r.customerName}
            </h3>
            {r.isVIP && (
              <Crown size={12} className="flex-shrink-0" style={{ color: "#F0B429" }} />
            )}
            {hasNotes && (
              <MessageSquare size={11} className="flex-shrink-0" style={{ color: "#566270" }} />
            )}
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Fila 2: fecha · hora · invitados · mesa */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] font-medium capitalize" style={{ color: "#566270" }}>
            {dateStr}
          </span>
          <div className="flex items-center gap-1">
            <Clock size={11} style={{ color: "#566270" }} />
            <span className="text-[11px] font-bold" style={{ color: "#8B949E" }}>
              {timeStr}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={11} style={{ color: "#566270" }} />
            <span className="text-[11px] font-bold" style={{ color: "#8B949E" }}>
              {r.guests}
            </span>
          </div>
          <span className="text-[11px] font-medium" style={{ color: "#566270" }}>
            {tableLabel}
          </span>
        </div>
      </div>
    </button>
  );
}
