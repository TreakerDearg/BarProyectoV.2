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
    <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
      
      {/* ENCABEZADO AMIGABLE NEBULA */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          📝 Paso 3: Cuéntanos la razón
        </h3>
        <p className="text-sm text-gray-500">
          Selecciona por qué estás aplicando este descuento
        </p>
      </div>

      {/* TARJETAS DE RAZÓN - VISUAL Y AMIGABLE NEBULA */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Motivo del descuento
        </p>
        <div className="grid grid-cols-1 gap-3">
          {razones.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.val}
                onClick={() => setReason(r.val)}
                className={`
                  p-4 rounded-2xl text-left transition-all border-2 flex items-start gap-4
                  ${reason === r.val
                    ? "bg-purple-50 border-purple-500 shadow-md"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"}
                `}
              >
                <div className={`p-3 rounded-xl ${reason === r.val ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-800 block mb-1">{r.label}</span>
                  <span className="text-xs text-gray-500">{r.description}</span>
                </div>
                {reason === r.val && (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* NOTAS - ÚTILES Y ANIMADAS */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <FileText size={14} /> Notas adicionales (opcional)
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Agrega detalles extras si es necesario..."
          className="w-full min-h-[100px] bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400">
          {note.length}/500 caracteres
        </p>
      </div>

      {/* CAJA INFORMATIVA NEBULA */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Esta información ayuda a mejorar nuestro servicio. Tu nombre y la razón quedarán registrados para fines de auditoría.
        </p>
      </div>
    </div>
  );
}