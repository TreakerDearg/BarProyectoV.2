"use client";

/**
 * DiscountReasonForm — Selector de motivo + nota libre.
 * REDISEÑO v3.0 — Slate Elegante
 */
import type { DiscountReason } from "../types/discounts";
import type { LucideIcon }     from "lucide-react";
import { Clock, AlertTriangle, Gift, Users, MoreHorizontal, FileText, Info } from "lucide-react";

interface Props {
  reason:    DiscountReason;
  setReason: (r: DiscountReason) => void;
  note:      string;
  setNote:   (n: string) => void;
}

export default function DiscountReasonForm({ reason, setReason, note, setNote }: Props) {
  const razones: {
    val:         DiscountReason;
    label:       string;
    icon:        LucideIcon;
    description: string;
  }[] = [
    { val: "WAIT_TIME",     label: "Tiempo de espera",    icon: Clock,          description: "El cliente esperó más de lo habitual"      },
    { val: "QUALITY_ISSUE", label: "Problema de calidad", icon: AlertTriangle,  description: "El producto no cumplió las expectativas"    },
    { val: "COMP",          label: "Cortesía",            icon: Gift,           description: "Gesto de buena voluntad del local"          },
    { val: "EMPLOYEE",      label: "Empleado",            icon: Users,          description: "Descuento para staff del local"             },
    { val: "OTHER",         label: "Otro",                icon: MoreHorizontal, description: "Otra razón no listada"                      },
  ];

  return (
    <div className="flex flex-col gap-3">

      {/* Botones de motivo */}
      <div className="space-y-1.5">
        {razones.map((r) => {
          const Icon     = r.icon;
          const isActive = reason === r.val;
          return (
            <button
              key={r.val}
              type="button"
              onClick={() => setReason(r.val)}
              className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all"
              style={{
                background:  isActive ? "rgba(240,180,41,0.12)" : "#21283A",
                border:      `1px solid ${isActive ? "rgba(240,180,41,0.40)" : "#30363D"}`,
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,180,41,0.22)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363D";
              }}
            >
              {/* Ícono */}
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{
                  background: isActive ? "rgba(240,180,41,0.20)" : "#293042",
                  color:      isActive ? "#F0B429" : "#566270",
                }}
              >
                <Icon size={13} />
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-bold"
                  style={{ color: isActive ? "#F0B429" : "#E6EDF3" }}
                >
                  {r.label}
                </p>
                <p className="text-[9px] mt-0.5" style={{ color: "#566270" }}>
                  {r.description}
                </p>
              </div>

              {/* Check */}
              {isActive && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(240,180,41,0.25)" }}
                >
                  <span style={{ color: "#F0B429", fontSize: 10, fontWeight: 900 }}>✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Textarea de nota */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: "#566270" }}>
          <FileText size={11} /> Notas adicionales
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Agrega detalles si es necesario…"
          rows={3}
          className="w-full rounded-xl px-3 py-2.5 text-xs outline-none transition-colors resize-none"
          style={{ background: "#21283A", border: "1px solid #30363D", color: "#E6EDF3" }}
          onFocus={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(240,180,41,0.50)"; }}
          onBlur={(e)  => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "#30363D"; }}
        />
        <p className="text-[9px] mt-1" style={{ color: "#3D444D" }}>
          {note.length}/500 caracteres
        </p>
      </div>

      {/* Nota de auditoría */}
      <div
        className="flex items-start gap-2 p-3 rounded-xl"
        style={{ background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.20)" }}
      >
        <Info size={11} style={{ color: "rgba(240,180,41,0.70)", flexShrink: 0, marginTop: 1 }} />
        <p className="text-[9px] leading-relaxed" style={{ color: "rgba(240,180,41,0.70)" }}>
          El motivo y tu nombre quedan registrados para auditoría interna.
        </p>
      </div>
    </div>
  );
}
