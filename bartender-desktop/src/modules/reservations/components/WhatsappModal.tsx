"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, MessageCircle, AlertCircle, Sparkles } from "lucide-react";
import type { Reservation } from "../types/reservation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  reservation: Reservation;
  onClose: () => void;
}

export default function WhatsappModal({ reservation, onClose }: Props) {
  const startTime = new Date(reservation.startTime);
  const timeStr = isNaN(startTime.getTime()) ? "--:--" : format(startTime, "HH:mm 'hs'", { locale: es });
  const dateStr = isNaN(startTime.getTime()) ? "---" : format(startTime, "EEEE dd 'de' MMMM", { locale: es });

  const tableNum = reservation.tableId && typeof reservation.tableId === "object"
    ? reservation.tableId.number
    : "por asignar";

  // Plantilla de mensaje con formato WhatsApp (negritas, emojis)
  const [message, setMessage] = useState(
    `🍸 *BARTENDER CLUB*\n\n` +
    `Hola *${reservation.customerName}*, queremos confirmarte tu reserva para *${reservation.guests} personas* el día *${dateStr}* a las *${timeStr}*.\n\n` +
    `📍 Mesa asignada: *Mesa ${tableNum}*\n` +
    `⏱️ Tolerancia de espera: *15 minutos.*\n\n` +
    `¡Te esperamos para vivir una noche única! 🍹✨`
  );

  const handleSend = () => {
    // Limpiar el teléfono para la URL (debe incluir código de país, p. ej. 549 para Argentina o el que corresponda)
    // Eliminamos caracteres no numéricos
    let cleanPhone = reservation.customerPhone.replace(/\D/g, "");
    
    // Si no tiene código de país, intentamos agregar el de Argentina (54) o el que sea por defecto
    if (cleanPhone.length === 10) {
      cleanPhone = "54" + cleanPhone; // Fallback
    }

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[150] p-4 md:p-8 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-surface-2 rounded-[2.5rem] overflow-hidden shadow-2xl border border-emerald-500/20 flex flex-col"
      >
        {/* HEADER DE WHATSAPP MOCK */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/15">
              <MessageCircle size={22} className="fill-current text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest leading-none">Confirmar por WhatsApp</h3>
              <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-wider mt-1">Previsualizar mensaje de reserva</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center text-emerald-100 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTENIDO DEL MODAL */}
        <div className="p-6 flex-1 flex flex-col gap-6 bg-[#0b141a]/95 relative min-h-0 overflow-y-auto custom-scrollbar">
          {/* Fondo de WhatsApp (Mockup de chat) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* ALERTA INFORMATIVA */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3 relative z-10">
            <AlertCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider leading-relaxed text-left">
              Se abrirá un chat de WhatsApp con el número del cliente pre-rellenado con la plantilla oficial de confirmación. Puedes editar el texto en el recuadro antes de enviar.
            </p>
          </div>

          {/* WHATSAPP MOCKUP CHAT BUBBLE */}
          <div className="flex flex-col gap-1 relative z-10 items-end w-full">
            <span className="text-[8px] font-black text-muted uppercase tracking-widest self-center mb-1">Previsualización de chat</span>
            
            <div className="bg-[#0b5c46] text-white p-4 rounded-[1.5rem] rounded-tr-none max-w-[90%] text-left shadow-lg border border-emerald-500/10 space-y-2 relative">
              <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium">{message}</p>
              
              <div className="flex items-center justify-end gap-1.5 text-[9px] text-emerald-200/60 font-semibold mt-1">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-emerald-400 leading-none">✓✓</span>
              </div>

              {/* Triángulo de burbuja */}
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-t-[#0b5c46] border-r-[10px] border-r-transparent translate-x-[4px]" />
            </div>
          </div>

          {/* EDITOR RECUADRO DE TEXTO */}
          <div className="flex flex-col gap-2 relative z-10 w-full">
            <label className="text-[9px] font-black text-muted uppercase tracking-wider text-left">Editar contenido del mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full bg-[#111b21] border border-white/5 rounded-2xl p-4 text-xs font-bold text-ivory focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all resize-none custom-scrollbar"
            />
          </div>
        </div>

        {/* PIE DEL MODAL */}
        <div className="p-6 bg-surface-3 border-t border-white/5 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-muted text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-gold" />
            <span>Destino: {reservation.customerPhone}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider border border-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Send size={12} />
              Enviar Mensaje
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
