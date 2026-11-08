"use client";

/**
 * ReservationDetailPanel — Panel lateral de detalle de reserva.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Equivalente al TableInspector pero para reservas.
 * Muestra detalle completo + acciones contextuales.
 */
import { motion } from "framer-motion";
import {
  Calendar, Clock, Users, Phone, Mail, Crown,
  Wallet, MapPin, MessageCircle, CheckCircle2,
  XCircle, AlertCircle, Check, Pencil, Trash2,
  AlertTriangle, Info,
} from "lucide-react";
import { format } from "date-fns";
import { es }     from "date-fns/locale";
import type { Reservation } from "../types/reservation";
import { DIETARY_OPTIONS }  from "../types/reservation";
import { getDietaryIcon }   from "../utils/dietaryIcons";

interface Props {
  reservation:       Reservation | null;
  onClose:           () => void;
  onStatusChange:    (id: string, status: Reservation["status"]) => void;
  onEdit:            () => void;
  onDelete:          (id: string) => void;
  onWhatsapp?:       (r: Reservation) => void;
}

/* ── Helpers ───────────────────────────────────────────────── */
const fmtTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : format(d, "HH:mm 'hs'", { locale: es });
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : format(d, "EEEE dd 'de' MMMM", { locale: es });
};

/* ── Status config ─────────────────────────────────────────── */
const STATUS: Record<Reservation["status"], { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: "Por confirmar", color: "#FF7B54", bg: "rgba(255,123,84,0.10)",  border: "rgba(255,123,84,0.25)"  },
  confirmed: { label: "Confirmada",    color: "#F0B429", bg: "rgba(240,180,41,0.10)",  border: "rgba(240,180,41,0.25)"  },
  seated:    { label: "En mesa",       color: "#3FB950", bg: "rgba(63,185,80,0.10)",   border: "rgba(63,185,80,0.25)"   },
  completed: { label: "Finalizada",    color: "#566270", bg: "rgba(86,98,112,0.10)",   border: "rgba(86,98,112,0.20)"   },
  "no-show": { label: "No asistió",    color: "#F85149", bg: "rgba(248,81,73,0.10)",   border: "rgba(248,81,73,0.25)"   },
  cancelled: { label: "Cancelada",     color: "#F85149", bg: "rgba(248,81,73,0.08)",   border: "rgba(248,81,73,0.20)"   },
};

/* ── InfoRow ───────────────────────────────────────────────── */
function InfoRow({ label, value, valueColor = "#E6EDF3" }: { label: string; value: React.ReactNode; valueColor?: string }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl"
      style={{ background: "rgba(33,40,58,0.8)", border: "1px solid #30363D" }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "#566270" }}>
        {label}
      </span>
      <span className="text-[11px] font-bold text-right" style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

/* ── TimelineStep ──────────────────────────────────────────── */
function TimelineStep({ label, active, current }: { label: string; active: boolean; current: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 relative z-10">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
        style={{
          background:  active ? (current ? "#F0B429" : "rgba(240,180,41,0.30)") : "#21283A",
          border:      `1px solid ${active ? "rgba(240,180,41,0.50)" : "#30363D"}`,
        }}
      >
        {active && <Check size={12} style={{ color: current ? "#0D1117" : "#F0B429", strokeWidth: 3 }} />}
      </div>
      <span
        className="text-[9px] font-bold uppercase tracking-wide text-center"
        style={{ color: current ? "#F0B429" : active ? "#8B949E" : "#566270" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── EmptyState ────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8" style={{ opacity: 0.40 }}>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "#21283A", border: "1px solid #30363D" }}
      >
        <Info size={22} style={{ color: "#566270" }} />
      </div>
      <h3 className="text-sm font-bold" style={{ color: "#566270" }}>Sin reserva seleccionada</h3>
      <p className="text-[10px] mt-1.5" style={{ color: "#3D444D" }}>Hacé clic en una reserva para ver el detalle</p>
    </div>
  );
}

/* ── ReservationDetailPanel ────────────────────────────────── */
export default function ReservationDetailPanel({
  reservation, onStatusChange, onEdit, onDelete, onWhatsapp,
}: Props) {

  if (!reservation) {
    return (
      <div className="h-full overflow-hidden" style={{ background: "#161B22" }}>
        <EmptyState />
      </div>
    );
  }

  const r     = reservation;
  const cfg   = STATUS[r.status] ?? STATUS.pending;
  const now   = new Date();

  const startTime  = new Date(r.startTime);
  const isDelayed  = (r.status === "pending" || r.status === "confirmed") &&
                     !isNaN(startTime.getTime()) &&
                     (now.getTime() - startTime.getTime()) > 15 * 60 * 1000;
  const delayMin   = isDelayed ? Math.floor((now.getTime() - startTime.getTime()) / 60000) : 0;

  const tableInfo  = r.tableId && typeof r.tableId === "object"
    ? `Mesa ${r.tableId.number} · ${r.tableId.location ?? "Interior"}`
    : r.tableId
    ? "Mesa asignada"
    : "Sin asignar";

  const hasDietary = r.guestDietaryRestrictions?.some((g) => g.restrictions.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col overflow-hidden"
      style={{ background: "#161B22" }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #30363D" }}>
        {/* Alerta de retraso */}
        {isDelayed && (
          <div
            className="flex items-center justify-between px-3 py-2 rounded-xl mb-3"
            style={{ background: "rgba(248,81,73,0.10)", border: "1px solid rgba(248,81,73,0.25)" }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={12} className="animate-pulse" style={{ color: "#F85149" }} />
              <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#F85149" }}>
                Cliente atrasado
              </span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: "rgba(248,81,73,0.20)", color: "#FF6B63" }}>
              +{delayMin} min
            </span>
          </div>
        )}

        {/* Nombre + badge de estado */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-2xl font-black tracking-tight leading-none uppercase truncate" style={{ color: "#E6EDF3" }}>
              {r.customerName}
            </h2>
            {r.isVIP && <Crown size={16} className="flex-shrink-0" style={{ color: "#F0B429" }} />}
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex-shrink-0"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />
            {cfg.label}
          </div>
        </div>

        {/* Teléfono + depósito */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Phone size={12} style={{ color: "#566270" }} />
            <span className="text-xs font-medium" style={{ color: "#8B949E" }}>{r.customerPhone}</span>
          </div>
          {r.deposit != null && r.deposit > 0 && (
            <div className="flex items-center gap-1.5">
              <Wallet size={12} style={{ color: "#3FB950" }} />
              <span className="text-xs font-bold" style={{ color: "#3FB950" }}>${r.deposit}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body scrollable ─────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
      >
        {/* Info rápida */}
        <div className="space-y-1.5">
          <InfoRow
            label="Fecha"
            value={<span className="capitalize">{fmtDate(r.startTime)}</span>}
          />
          <InfoRow label="Check-in" value={fmtTime(r.startTime)} valueColor="#F0B429" />
          <InfoRow label="Invitados" value={
            <div className="flex items-center gap-1">
              <Users size={12} style={{ color: "#F0B429" }} />
              {r.guests}
            </div>
          } />
          <InfoRow label="Mesa" value={tableInfo} />
          {r.customerEmail && (
            <InfoRow
              label="Email"
              value={<span className="truncate max-w-[140px] inline-block">{r.customerEmail}</span>}
            />
          )}
        </div>

        {/* Notas */}
        {r.notes && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: "#566270" }}>
              Notas de servicio
            </p>
            <div
              className="px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(33,40,58,0.6)", border: "1px solid #30363D" }}
            >
              <p className="text-xs italic leading-relaxed" style={{ color: "#8B949E" }}>
                "{r.notes}"
              </p>
            </div>
          </div>
        )}

        {/* Restricciones dietéticas */}
        {hasDietary && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: "#566270" }}>
              Restricciones dietéticas
            </p>
            <div
              className="rounded-xl p-3 space-y-2"
              style={{ background: "rgba(255,123,84,0.06)", border: "1px solid rgba(255,123,84,0.20)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={11} style={{ color: "#FF7B54" }} />
                <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#FF7B54" }}>
                  Comunicar a cocina
                </span>
              </div>
              {r.guestDietaryRestrictions!
                .filter((g) => g.restrictions.length > 0)
                .map((guest, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg"
                    style={{ background: "rgba(13,17,23,0.6)", border: "1px solid rgba(255,123,84,0.12)" }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.25)" }}
                    >
                      <span className="text-[9px] font-black" style={{ color: "#F0B429" }}>{idx + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold mb-1 truncate" style={{ color: "#E6EDF3" }}>
                        {guest.guestName || `Invitado ${idx + 1}`}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {guest.restrictions.map((restriction) => {
                          const opt = DIETARY_OPTIONS.find((o) => o.value === restriction);
                          return (
                            <span
                              key={restriction}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-wider"
                              style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
                            >
                              {getDietaryIcon(opt?.iconName ?? "AlertTriangle", 9)}
                              {opt?.label ?? restriction}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {r.tags && r.tags.length > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: "#566270" }}>
              Etiquetas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {r.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider"
                  style={{
                    background: tag.priority === "high" ? "rgba(248,81,73,0.10)" : tag.priority === "medium" ? "rgba(255,123,84,0.10)" : "#21283A",
                    border:     tag.priority === "high" ? "1px solid rgba(248,81,73,0.25)" : tag.priority === "medium" ? "1px solid rgba(255,123,84,0.25)" : "1px solid #30363D",
                    color:      tag.priority === "high" ? "#F85149" : tag.priority === "medium" ? "#FF7B54" : "#566270",
                  }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timeline de proceso */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-3" style={{ color: "#566270" }}>
            Estado del proceso
          </p>
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl relative"
            style={{ background: "#21283A", border: "1px solid #30363D" }}
          >
            {/* Línea de fondo */}
            <div
              className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-px"
              style={{ background: "#30363D", zIndex: 0 }}
            />
            <TimelineStep
              label="Confirmada"
              active={["confirmed", "seated", "completed"].includes(r.status)}
              current={r.status === "confirmed"}
            />
            <TimelineStep
              label="En mesa"
              active={["seated", "completed"].includes(r.status)}
              current={r.status === "seated"}
            />
            <TimelineStep
              label="Finalizada"
              active={r.status === "completed"}
              current={r.status === "completed"}
            />
          </div>
        </div>

        {/* Fuente + fechas */}
        <div className="space-y-1.5">
          {r.source && r.source !== "admin" && (
            <InfoRow label="Fuente" value={r.source === "web" ? "Web" : "App"} />
          )}
          {r.createdAt && (
            <InfoRow
              label="Creada"
              value={new Date(r.createdAt).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            />
          )}
        </div>
      </div>

      {/* ── Footer: acciones contextuales ───────────────── */}
      <div
        className="flex-shrink-0 p-4 space-y-2"
        style={{ borderTop: "1px solid #30363D", background: "#0D1117" }}
      >
        {/* SENTAR — acción principal para pending/confirmed */}
        {(r.status === "pending" || r.status === "confirmed") && (
          <button
            type="button"
            onClick={() => onStatusChange(r._id!, "seated")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
            style={{ background: "#3FB950", color: "#0D1117", boxShadow: "0 4px 16px rgba(63,185,80,0.25)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#56D364"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3FB950"; }}
          >
            <CheckCircle2 size={16} />
            Sentar cliente en mesa
          </button>
        )}

        {/* CONFIRMAR — solo pending */}
        {r.status === "pending" && (
          <button
            type="button"
            onClick={() => onStatusChange(r._id!, "confirmed")}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
            style={{ background: "#F0B429", color: "#0D1117" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F5C842"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0B429"; }}
          >
            <Check size={15} />
            Confirmar asistencia
          </button>
        )}

        {/* COMPLETAR — solo seated */}
        {r.status === "seated" && (
          <button
            type="button"
            onClick={() => onStatusChange(r._id!, "completed")}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
            style={{ background: "#F0B429", color: "#0D1117" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F5C842"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0B429"; }}
          >
            <CheckCircle2 size={15} />
            Completar y liberar mesa
          </button>
        )}

        {/* WhatsApp */}
        {onWhatsapp && (r.status === "pending" || r.status === "confirmed") && (
          <button
            type="button"
            onClick={() => onWhatsapp(r)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
            style={{ background: "rgba(63,185,80,0.08)", border: "1px solid rgba(63,185,80,0.20)", color: "#3FB950" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(63,185,80,0.15)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(63,185,80,0.08)"; }}
          >
            <MessageCircle size={14} />
            Enviar WhatsApp
          </button>
        )}

        {/* NO-SHOW + CANCELAR — row de 2 */}
        {(r.status === "pending" || r.status === "confirmed") && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onStatusChange(r._id!, "no-show")}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={{ background: "rgba(255,123,84,0.08)", border: "1px solid rgba(255,123,84,0.20)", color: "#FF7B54" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,123,84,0.15)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,123,84,0.08)"; }}
            >
              <AlertCircle size={13} /> No asistió
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(r._id!, "cancelled")}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={{ background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.20)", color: "#F85149" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,81,73,0.15)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,81,73,0.08)"; }}
            >
              <XCircle size={13} /> Cancelar
            </button>
          </div>
        )}

        {/* Editar + Eliminar */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
            style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
          >
            <Pencil size={11} /> Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(r._id!)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
            style={{ background: "rgba(248,81,73,0.06)", border: "1px solid rgba(248,81,73,0.15)", color: "rgba(248,81,73,0.50)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F85149"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(248,81,73,0.50)"; }}
          >
            <Trash2 size={11} /> Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
