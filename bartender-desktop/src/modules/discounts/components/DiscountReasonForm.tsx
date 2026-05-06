"use client";

import type { DiscountReason } from "../types/discounts";
import { Briefcase, AlertCircle, ShieldCheck, Zap, History, MessageSquare } from "lucide-react";

interface Props {
  reason: DiscountReason;
  setReason: (r: DiscountReason) => void;
  note: string;
  setNote: (n: string) => void;
}

export default function DiscountReasonForm({
  reason,
  setReason,
  note,
  setNote,
}: Props) {
  const reasons: { val: DiscountReason; label: string }[] = [
    { val: "WAIT_TIME", label: "Protocolo de Espera" },
    { val: "QUALITY_ISSUE", label: "Incidencia de Calidad" },
    { val: "COMP", label: "Cortesía de la Casa" },
    { val: "EMPLOYEE", label: "Beneficio Staff" },
    { val: "OTHER", label: "Otros Motivos" },
  ];

  return (
    <div className="glass-royale p-8 rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden">
      
      {/* SECTION HEADER */}
      <div className="flex items-center gap-4">
         <div className="p-3 rounded-xl bg-gold/10 text-gold shadow-gold-glow">
            <Briefcase size={20} />
         </div>
         <div>
            <h4 className="text-sm font-black text-ivory tracking-tighter uppercase">Justificación del Privilegio</h4>
            <p className="text-[9px] text-muted font-black uppercase tracking-widest mt-1">PROTOCOLO DE AUDITORÍA REQUERIDO</p>
         </div>
      </div>

      <div className="space-y-6">
        {/* REASON SELECTOR */}
        <div className="space-y-3">
           <p className="text-[9px] font-black text-muted uppercase tracking-[0.3em] ml-1">MOTIVO PRINCIPAL</p>
           <div className="grid grid-cols-1 gap-2">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as DiscountReason)}
                className="w-full bg-surface-3 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black text-ivory outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all appearance-none cursor-pointer uppercase tracking-widest"
              >
                {reasons.map((r) => (
                  <option key={r.val} value={r.val} className="bg-surface-4 text-ivory">
                    {r.label}
                  </option>
                ))}
              </select>
           </div>
        </div>

        {/* AUDIT NOTE */}
        <div className="space-y-3">
           <p className="text-[9px] font-black text-muted uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
              <MessageSquare size={12} /> NOTAS DE AUDITORÍA
           </p>
           <textarea
             value={note}
             onChange={(e) => setNote(e.target.value)}
             placeholder="Describa el contexto para el reporte de gerencia..."
             className="w-full min-h-[120px] bg-surface-3 border border-white/5 rounded-[2rem] px-8 py-6 text-xs font-bold text-ivory outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all resize-none placeholder:text-muted/30"
           />
        </div>
      </div>

      {/* SYSTEM FEEDBACK */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gold/5 border border-gold/10">
         <ShieldCheck size={16} className="text-gold" />
         <p className="text-[8px] font-black text-muted uppercase tracking-widest">Este ajuste será registrado permanentemente en el historial de auditoría.</p>
      </div>
    </div>
  );
}