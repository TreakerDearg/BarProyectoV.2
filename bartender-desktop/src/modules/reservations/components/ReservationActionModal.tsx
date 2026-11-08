"use client";

/**
 * ReservationActionModal — Modal de acción sobre una reserva (usado en mobile).
 * REDISEÑO v3.0 — Slate Elegante
 *
 * En desktop el detalle se muestra en ReservationDetailPanel.
 * Este modal se usa en mobile o como fallback.
 */
import {
  X, Phone, Users, Calendar, Crown, Wallet,
  CheckCircle2, XCircle, AlertCircle, Pencil,
  Trash2, Check, MessageCircle, AlertTriangle,
} from "lucide-react";
import type { Reservation } from "../types/reservation";
import { DIETARY_OPTIONS }  from "../types/reservation";
import { getDietaryIcon }   from "../utils/dietaryIcons";
import { format }           from "date-fns";
import { es }               from "date-fns/locale";

interface Props {
  reservation:    Reservation;
  onClose:        () => void;
  onStatusChange: (status: Reservation["status"]) => void;
  onEdit:         () => void;
  onDelete:       () => void;
  onWhatsapp?:    (r: Reservation) => void;
}

function TimelineStep({ label, active, current }: { label: string; active: boolean; current: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 relative z-10">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
        style={{
          background:  current ? "#F0B429" : active ? "rgba(240,180,41,0.20)" : "#21283A",
          border:      `1px solid ${current ? "transparent" : active ? "rgba(240,180,41,0.50)" : "#30363D"}`,
          color:       current ? "#0D1117" : active ? "#F0B429" : "#566270",
        }}
      >
        {active ? <Check size={13} style={{ strokeWidth: 3 }} /> : <div className="w-2 h-2 rounded-full bg-current" />}
      </div>
      <span
        className="text-[9px] font-black uppercase tracking-wide text-center"
        style={{ color: current ? "#F0B429" : active ? "#8B949E" : "#566270" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function ReservationActionModal({
  reservation, onClose, onStatusChange, onEdit, onDelete, onWhatsapp,
}: Props) {
  const startTime  = new Date(reservation.startTime);
  const timeStr    = isNaN(startTime.getTime()) ? "--:--" : format(startTime, "HH:mm 'hs'", { locale: es });
  const dateStr    = isNaN(startTime.getTime()) ? "---"   : format(startTime, "EEEE dd 'de' MMMM", { locale: es });

  const now        = new Date();
  const isDelayed  = (reservation.status === "pending" || reservation.status === "confirmed") &&
                     !isNaN(startTime.getTime()) &&
                     (now.getTime() - startTime.getTime()) > 15 * 60 * 1000;
  const delayMin   = isDelayed ? Math.floor((now.getTime() - startTime.getTime()) / 60000) : 0;

  const tableInfo  = reservation.tableId && typeof reservation.tableId === "object"
    ? `Mesa ${reservation.tableId.number} (${reservation.tableId.location ?? "Interior"})`
    : "Sin asignar";

  const hasDietary = reservation.guestDietaryRestrictions?.some((g) => g.restrictions.length > 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1C2333", border: "1px solid #30363D" }}
      >
        {/* Barra top de color */}
        <div
          className="h-1 w-full"
          style={{ background: reservation.isVIP ? "#F0B429" : isDelayed ? "#F85149" : "rgba(240,180,41,0.40)" }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ background: "#161B22", borderBottom: "1px solid #30363D" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-2.5 rounded-xl flex-shrink-0"
              style={{
                background: reservation.isVIP ? "rgba(240,180,41,0.15)" : "#21283A",
                border:     reservation.isVIP ? "1px solid rgba(240,180,41,0.25)" : "1px solid #30363D",
                color:      reservation.isVIP ? "#F0B429" : "#566270",
              }}
            >
              <Crown size={18} className={reservation.isVIP ? "fill-current" : ""} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black uppercase tracking-tight truncate" style={{ color: "#E6EDF3" }}>
                  {reservation.customerName}
                </h2>
                {reservation.isVIP && (
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex-shrink-0"
                    style={{ background: "rgba(240,180,41,0.15)", border: "1px solid rgba(240,180,41,0.30)", color: "#F0B429" }}
                  >
                    VIP
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: "#566270" }}>
                {tableInfo}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ background: "#21283A", border: "1px solid #30363D", color: "#566270" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div
          className="p-5 space-y-4 max-h-[60vh] overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
        >
          {/* Alerta de retraso */}
          {isDelayed && (
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-xl"
              style={{ background: "rgba(248,81,73,0.10)", border: "1px solid rgba(248,81,73,0.25)" }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="animate-pulse" style={{ color: "#F85149" }} />
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: "#F85149" }}>Cliente atrasado</p>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded" style={{ background: "rgba(248,81,73,0.20)", color: "#FF6B63" }}>
                +{delayMin} min
              </span>
            </div>
          )}

          {/* Grid info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl space-y-1.5" style={{ background: "#21283A", border: "1px solid #30363D" }}>
              <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: "#566270" }}>
                <Calendar size={11} style={{ color: "#F0B429" }} /> Día y horario
              </p>
              <p className="text-xs font-bold capitalize" style={{ color: "#E6EDF3" }}>{dateStr}</p>
              <p className="text-lg font-black" style={{ color: "#F0B429" }}>{timeStr}</p>
            </div>
            <div className="p-4 rounded-xl space-y-1.5" style={{ background: "#21283A", border: "1px solid #30363D" }}>
              <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: "#566270" }}>
                <Users size={11} style={{ color: "#F0B429" }} /> Detalle
              </p>
              <p className="text-xs font-bold" style={{ color: "#E6EDF3" }}>{reservation.guests} invitados</p>
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: "#8B949E" }}>{tableInfo}</p>
            </div>
          </div>

          {/* Directorio */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #30363D" }}>
            {[
              { icon: <Phone size={13} style={{ color: "#F0B429" }} />, label: "Teléfono",  value: reservation.customerPhone },
              ...(reservation.customerEmail ? [{ icon: <Users size={13} style={{ color: "#F0B429" }} />, label: "Email", value: reservation.customerEmail }] : []),
              { icon: <Wallet size={13} style={{ color: reservation.deposit && reservation.deposit > 0 ? "#3FB950" : "#566270" }} />,
                label: "Depósito",
                value: reservation.deposit && reservation.deposit > 0 ? `$${reservation.deposit}` : "Sin depósito" },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-4 py-2.5 text-xs"
                style={{
                  background:  "#21283A",
                  borderBottom: i < arr.length - 1 ? "1px solid #30363D" : "none",
                }}
              >
                <span className="flex items-center gap-2 font-medium" style={{ color: "#566270" }}>
                  {row.icon} {row.label}
                </span>
                <span className="font-bold" style={{ color: "#E6EDF3" }}>{row.value}</span>
              </div>
            ))}
            {reservation.notes && (
              <div className="px-4 py-3" style={{ borderTop: "1px solid #30363D", background: "#21283A" }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "#566270" }}>Notas</p>
                <p className="text-xs italic" style={{ color: "#8B949E" }}>"{reservation.notes}"</p>
              </div>
            )}
          </div>

          {/* Dietary */}
          {hasDietary && (
            <div
              className="p-4 rounded-xl space-y-2"
              style={{ background: "rgba(255,123,84,0.06)", border: "1px solid rgba(255,123,84,0.20)" }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={12} style={{ color: "#FF7B54" }} />
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#FF7B54" }}>
                  Restricciones dietéticas — comunicar a cocina
                </p>
              </div>
              {reservation.guestDietaryRestrictions!.filter((g) => g.restrictions.length > 0).map((guest, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[9px] font-black mt-0.5 flex-shrink-0" style={{ color: "#8B949E" }}>
                    {guest.guestName || `Inv. ${idx + 1}`}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {guest.restrictions.map((r) => {
                      const opt = DIETARY_OPTIONS.find((o) => o.value === r);
                      return (
                        <span
                          key={r}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black border uppercase"
                          style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
                        >
                          {getDietaryIcon(opt?.iconName ?? "AlertTriangle", 9)} {opt?.label ?? r}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          <div className="p-4 rounded-xl relative" style={{ background: "#21283A", border: "1px solid #30363D" }}>
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-px" style={{ background: "#30363D", zIndex: 0 }} />
            <div className="flex items-center justify-between">
              <TimelineStep label="Confirmada" active={["confirmed", "seated", "completed"].includes(reservation.status)} current={reservation.status === "confirmed"} />
              <TimelineStep label="En mesa"    active={["seated", "completed"].includes(reservation.status)} current={reservation.status === "seated"} />
              <TimelineStep label="Finalizada" active={reservation.status === "completed"} current={reservation.status === "completed"} />
            </div>
          </div>

          {/* Acciones principales */}
          <div className="space-y-2">
            {(reservation.status === "pending" || reservation.status === "confirmed") && (
              <button
                type="button"
                onClick={() => onStatusChange("seated")}
                className="w-full h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-wider transition-all"
                style={{ background: "#3FB950", color: "#0D1117", boxShadow: "0 4px 16px rgba(63,185,80,0.25)" }}
              >
                <CheckCircle2 size={18} />
                Sentar cliente en mesa
              </button>
            )}
            {onWhatsapp && (reservation.status === "pending" || reservation.status === "confirmed") && (
              <button
                type="button"
                onClick={() => onWhatsapp(reservation)}
                className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all"
                style={{ background: "rgba(63,185,80,0.08)", border: "1px solid rgba(63,185,80,0.20)", color: "#3FB950" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(63,185,80,0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(63,185,80,0.08)"; }}
              >
                <MessageCircle size={14} /> Enviar WhatsApp
              </button>
            )}
            {reservation.status === "pending" && (
              <button
                type="button"
                onClick={() => onStatusChange("confirmed")}
                className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all"
                style={{ background: "#F0B429", color: "#0D1117" }}
              >
                <Check size={14} /> Confirmar asistencia
              </button>
            )}
            {reservation.status === "seated" && (
              <button
                type="button"
                onClick={() => onStatusChange("completed")}
                className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all"
                style={{ background: "#F0B429", color: "#0D1117" }}
              >
                <CheckCircle2 size={14} /> Completar y liberar mesa
              </button>
            )}
            {(reservation.status === "pending" || reservation.status === "confirmed") && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onStatusChange("no-show")}
                  className="py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all"
                  style={{ background: "rgba(255,123,84,0.08)", border: "1px solid rgba(255,123,84,0.20)", color: "#FF7B54" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,123,84,0.15)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,123,84,0.08)"; }}
                >
                  <AlertCircle size={13} /> No asistió
                </button>
                <button
                  type="button"
                  onClick={() => onStatusChange("cancelled")}
                  className="py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all"
                  style={{ background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.20)", color: "#F85149" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,81,73,0.15)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,81,73,0.08)"; }}
                >
                  <XCircle size={13} /> Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ background: "#161B22", borderTop: "1px solid #30363D" }}
        >
          <button
            type="button"
            onClick={onDelete}
            className="p-2.5 rounded-lg transition-colors"
            style={{ color: "rgba(248,81,73,0.50)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F85149"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(248,81,73,0.50)"; }}
            title="Eliminar reserva"
          >
            <Trash2 size={16} />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
            >
              <Pencil size={13} /> Editar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
