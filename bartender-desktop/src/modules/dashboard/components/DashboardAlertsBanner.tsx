"use client";

/**
 * DashboardAlertsBanner — Banner de alertas críticas del sistema.
 *
 * REDISEÑO v3.0 — Slate Elegante
 * Las alertas críticas son imposibles de ignorar:
 * fondo sólido, borde grueso, texto grande, ícono prominente.
 */
import { X, AlertTriangle, Info, AlertOctagon } from "lucide-react";
import { useDashboardStore } from "../store/dashboardStore";

export default function DashboardAlertsBanner() {
  const alerts       = useDashboardStore((s) => s.alerts);
  const dismissAlert = useDashboardStore((s) => s.dismissAlert);

  if (alerts.length === 0) return null;

  const top = alerts[0];

  /* Estilos por severidad — progresivamente más urgentes */
  const styles = {
    high: {
      wrapper: "border-[#F85149]/50 bg-[#F85149]/15",
      icon:    "text-[#F85149]",
      text:    "text-[#FF6B63]",
      count:   "bg-[#F85149]/20 text-[#FF6B63]",
      close:   "hover:bg-[#F85149]/20 text-[#F85149]",
      IconEl:  AlertOctagon,
    },
    medium: {
      wrapper: "border-[#FF7B54]/40 bg-[#FF7B54]/12",
      icon:    "text-[#FF7B54]",
      text:    "text-[#FF9A7A]",
      count:   "bg-[#FF7B54]/20 text-[#FF9A7A]",
      close:   "hover:bg-[#FF7B54]/20 text-[#FF7B54]",
      IconEl:  AlertTriangle,
    },
    low: {
      wrapper: "border-[#388BFD]/30 bg-[#388BFD]/8",
      icon:    "text-[#388BFD]",
      text:    "text-[#79C0FF]",
      count:   "bg-[#388BFD]/15 text-[#79C0FF]",
      close:   "hover:bg-[#388BFD]/15 text-[#388BFD]",
      IconEl:  Info,
    },
  };

  const s = styles[top.severity as keyof typeof styles] ?? styles.low;
  const { IconEl } = s;

  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border ${s.wrapper}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Ícono prominente */}
        <IconEl size={22} className={`flex-shrink-0 ${s.icon}`} />

        {/* Mensaje principal */}
        <p className={`text-sm font-semibold truncate ${s.text}`}>
          {top.message}
        </p>

        {/* Contador de alertas adicionales */}
        {alerts.length > 1 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${s.count}`}>
            +{alerts.length - 1} más
          </span>
        )}
      </div>

      {/* Botón cerrar */}
      <button
        type="button"
        onClick={() => dismissAlert(top.id)}
        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${s.close}`}
        aria-label="Cerrar alerta"
      >
        <X size={17} />
      </button>
    </div>
  );
}
