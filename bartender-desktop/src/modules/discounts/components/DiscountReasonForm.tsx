"use client";

import type { DiscountReason } from "../types/discounts";
import type { LucideIcon } from "lucide-react";
import { Clock, AlertTriangle, Gift, Users, MoreHorizontal, FileText, Info } from "lucide-react";

interface Props {
  reason: DiscountReason;
  setReason: (r: DiscountReason) => void;
  note: string;
  setNote: (n: string) => void;
}

export default function NebulaDiscountReasonForm({
  reason,
  setReason,
  note,
  setNote,
}: Props) {
  const razones: { val: DiscountReason; label: string; icon: LucideIcon; description: string }[] = [
    { val: "WAIT_TIME", label: "Tiempo de Espera", icon: Clock, description: "El cliente esperó más de lo habitual" },
    { val: "QUALITY_ISSUE", label: "Problema de Calidad", icon: AlertTriangle, description: "El producto no cumplió las expectativas" },
    { val: "COMP", label: "Cortesía", icon: Gift, description: "Gesto de buena voluntad del local" },
    { val: "EMPLOYEE", label: "Empleado", icon: Users, description: "Descuento para staff del local" },
    { val: "OTHER", label: "Otro", icon: MoreHorizontal, description: "Otra razón no listada" },
  ];

  return (
    <div className="flex flex-col space-y-4">
      
      <div>
        <h3 className="text-sm font-bold text-white mb-1">
          Motivo del Descuento
        </h3>
        <p className="text-xs text-white/50">
          Selecciona por qué estás aplicando este descuento
        </p>
      </div>

      <div className="space-y-2">
        {razones.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.val}
              onClick={() => setReason(r.val)}
              className={`
                p-3 rounded-xl text-left transition-all border flex items-start gap-3
                ${reason === r.val
                  ? "bg-[#00E5FF] text-black border-[#00E5FF]"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"}
              `}
            >
              <div className={`p-2 rounded-lg ${reason === r.val ? 'bg-black/10 text-black' : 'bg-white/10 text-white/50'}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-sm block mb-0.5">{r.label}</span>
                <span className="text-[10px] opacity-70">{r.description}</span>
              </div>
              {reason === r.val && (
                <div className="w-5 h-5 bg-black/20 rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-bold">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
          <FileText size={12} /> Notas adicionales
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Agrega detalles extras si es necesario..."
          className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#00E5FF] transition-all resize-none placeholder:text-white/30"
          style={{ height: '3rem' }}
        />
        <p className="text-[10px] text-white/30">
          {note.length}/500 caracteres
        </p>
      </div>

      <div className="p-3 rounded-lg border flex items-start gap-3" style={{
        background: 'rgba(0, 229, 255, 0.1)',
        borderColor: 'rgba(0, 229, 255, 0.2)'
      }}>
        <Info size={16} className="text-[#00E5FF] flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#00E5FF]/80 leading-relaxed">
          Esta información ayuda a mejorar nuestro servicio. Tu nombre y la razón quedarán registrados para fines de auditoría.
        </p>
      </div>
    </div>
  );
}