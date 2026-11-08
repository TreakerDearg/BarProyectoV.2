"use client";

/**
 * WhatsappModal — Modal de confirmación por WhatsApp.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Lógica completamente preservada. Solo cambian colores y layout.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, MessageCircle, AlertCircle, Sparkles } from "lucide-react";
import type { Reservation } from "../types/reservation";
import { format } from "date-fns";
import { es }     from "date-fns/locale";

interface Props {
  reservation: Reservation;
  onClose:     () => void;
}

export default function WhatsappModal({ reservation, onClose }: Props) {
  const startTime = new Date(reservation.startTime);
  const timeStr   = isNaN(startTime.getTime()) ? "--:--" : format(startTime, "HH:mm 'hs'", { locale: es });
  const dateStr   = isNaN(startTime.getTime()) ? "---"   : format(startTime, "EEEE dd 'de' MMMM", { locale: es });

  const tableNum  = reservation.tableId && typeof reservation.tableId === "object"
    ? reservation.tableId.number
    : "por asignar";

  const [message, setMessage] = useState(
    `🍸 *BARTENDER CLUB*\n\n` +
    `Hola *${reservation.customerName}*, queremos confirmarte tu reserva para *${reservation.guests} personas* el día *${dateStr}* a las *${timeStr}*.\n\n` +
    `📍 Mesa asignada: *Mesa ${tableNum}*\n` +
    `⏱️ Tolerancia de espera: *15 minutos.*\n\n` +
    `¡Te esperamos para vivir una noche única! 🍹✨`
  );

  const handleSend = () => {
    let cleanPhone = reservation.customerPhone.replace(/\D/g, "");
    if (cleanPhone.length === 10) cleanPhone = "54" + cleanPhone;
    const encodedText  = encodeURIComponent(message);
    const whatsappUrl  = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: "#1C2333", border: "1px solid rgba(63,185,80,0.25)" }}
      >
        {/* Header verde WhatsApp */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ background: "linear-gradient(135deg, #1a6b3c, #1a7a4a)", borderBottom: "1px solid rgba(63,185,80,0.20)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <MessageCircle size={20} className="fill-current" style={{ color: "#fff" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Confirmar por WhatsApp</h3>
              <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.60)" }}>
                Previsualizar mensaje de reserva
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "rgba(0,0,0,0.20)", color: "rgba(255,255,255,0.70)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.70)"; }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Cuerpo */}
        <div
          className="p-5 flex flex-col gap-4 overflow-y-auto"
          style={{ background: "#0f1a20", maxHeight: "60vh", scrollbarWidth: "thin", scrollbarColor: "rgba(63,185,80,0.3) transparent" }}
        >
          {/* Info */}
          <div
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
            style={{ background: "rgba(63,185,80,0.08)", border: "1px solid rgba(63,185,80,0.20)" }}
          >
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#3FB950" }} />
            <p className="text-[10px] font-medium leading-relaxed" style={{ color: "rgba(63,185,80,0.85)" }}>
              Se abrirá WhatsApp con el mensaje pre-rellenado. Podés editar el texto antes de enviar.
            </p>
          </div>

          {/* Burbuja de chat */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[8px] font-bold uppercase tracking-widest self-center mb-1" style={{ color: "#566270" }}>
              Previsualización
            </span>
            <div
              className="px-4 py-3 rounded-2xl rounded-tr-sm max-w-[90%] text-left relative"
              style={{ background: "#0b5c46", border: "1px solid rgba(63,185,80,0.12)" }}
            >
              <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium text-white">{message}</p>
              <div className="flex items-center justify-end gap-1 mt-1.5">
                <span className="text-[9px]" style={{ color: "rgba(63,185,80,0.60)" }}>
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span style={{ color: "#3FB950", fontSize: 10 }}>✓✓</span>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#566270" }}>
              Editar mensaje
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full rounded-xl p-3.5 text-xs font-medium outline-none resize-none transition-colors"
              style={{ background: "#21283A", border: "1px solid #30363D", color: "#E6EDF3" }}
              onFocus={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(63,185,80,0.50)"; }}
              onBlur={(e)  => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "#30363D"; }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ background: "#161B22", borderTop: "1px solid #30363D" }}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles size={11} style={{ color: "#F0B429" }} />
            <span className="text-[10px] font-medium" style={{ color: "#566270" }}>
              {reservation.customerPhone}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
              style={{ background: "#3FB950", color: "#0D1117", boxShadow: "0 4px 14px rgba(63,185,80,0.25)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#56D364"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3FB950"; }}
            >
              <Send size={13} /> Enviar mensaje
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
