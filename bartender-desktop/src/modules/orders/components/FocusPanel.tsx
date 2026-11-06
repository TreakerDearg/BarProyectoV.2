"use client";

/**
 * FocusPanel — Panel de detalle de ítem seleccionado.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Botones de estado grandes (h-14), color semántico claro, notas visibles.
 */
import { ClipboardList, MessageSquare, Loader2, Circle, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

type ItemStatus = "pending" | "preparing" | "ready" | "served";

interface Props {
  selectedItem: {
    _id?:      string;
    orderId?:  string;
    status?:   string;
    quantity?: number;
    notes?:    string;
    product?:  { name?: string; category?: string; type?: string };
  } | null;
  onItemStatusChange?: (orderId: string, itemId: string, status: ItemStatus) => Promise<void>;
  statusLoading?: boolean;
}

/* ── Flujo de estados con colores semánticos ───────────────── */
const STATUS_FLOW: {
  key:           ItemStatus;
  label:         string;
  color:         string;
  activeBg:      string;
  activeBorder:  string;
  icon:          React.ReactNode;
}[] = [
  {
    key: "pending",   label: "Pendiente",
    color: "#8B949E",  activeBg: "#3D444D",             activeBorder: "#566270",
    icon: <Circle size={14} />,
  },
  {
    key: "preparing", label: "Preparando",
    color: "#FF7B54",  activeBg: "rgba(255,123,84,0.20)", activeBorder: "rgba(255,123,84,0.50)",
    icon: <Zap size={14} className="animate-pulse" />,
  },
  {
    key: "ready",     label: "Listo",
    color: "#F0B429",  activeBg: "rgba(240,180,41,0.20)", activeBorder: "rgba(240,180,41,0.50)",
    icon: <CheckCircle2 size={14} />,
  },
  {
    key: "served",    label: "Servido",
    color: "#3FB950",  activeBg: "rgba(63,185,80,0.20)",  activeBorder: "rgba(63,185,80,0.50)",
    icon: <CheckCircle2 size={14} />,
  },
];

/* Colores del chip de estado actual */
const STATUS_CHIP: Record<string, { color: string; bg: string; border: string; label: string }> = {
  pending:   { color: "#8B949E", bg: "#21283A",              border: "#30363D",               label: "Pendiente"  },
  preparing: { color: "#FF7B54", bg: "rgba(255,123,84,0.12)", border: "rgba(255,123,84,0.25)", label: "Preparando" },
  ready:     { color: "#F0B429", bg: "rgba(240,180,41,0.12)", border: "rgba(240,180,41,0.25)", label: "Listo"      },
  served:    { color: "#3FB950", bg: "rgba(63,185,80,0.12)",  border: "rgba(63,185,80,0.25)",  label: "Servido"    },
  cancelled: { color: "#F85149", bg: "rgba(248,81,73,0.12)",  border: "rgba(248,81,73,0.25)",  label: "Cancelado"  },
};

export default function FocusPanel({ selectedItem, onItemStatusChange, statusLoading }: Props) {

  /* ── Estado vacío ──────────────────────────────────────── */
  if (!selectedItem) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center p-8 text-center"
        style={{ background: "#161B22" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "#1C2333", border: "1px solid #30363D" }}
        >
          <ClipboardList size={28} style={{ color: "#566270" }} />
        </div>
        <h3 className="text-sm font-semibold" style={{ color: "#8B949E" }}>
          Detalle del ítem
        </h3>
        <p className="text-xs mt-2 leading-relaxed max-w-[200px]" style={{ color: "#566270" }}>
          Selecciona un producto de una comanda para cambiar su estado
        </p>
      </div>
    );
  }

  const current   = (selectedItem.status || "pending") as string;
  const chip      = STATUS_CHIP[current] ?? STATUS_CHIP.pending;
  const canUpdate =
    Boolean(selectedItem.orderId && selectedItem._id && onItemStatusChange) &&
    current !== "cancelled";

  const handleStatus = async (status: ItemStatus) => {
    if (!canUpdate || !selectedItem.orderId || !selectedItem._id) return;
    await onItemStatusChange?.(selectedItem.orderId, selectedItem._id, status);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
      style={{ background: "#161B22" }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="p-5" style={{ borderBottom: "1px solid #30363D" }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: "rgba(240,180,41,0.15)", border: "1px solid rgba(240,180,41,0.25)" }}
          >
            <ClipboardList size={18} style={{ color: "#F0B429" }} />
          </div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "#566270" }}
          >
            Ítem de comanda
          </p>
        </div>
        <h3 className="text-xl font-bold" style={{ color: "#E6EDF3" }}>
          {selectedItem.product?.name || "Producto"}
        </h3>
        <p className="text-xs mt-1" style={{ color: "#8B949E" }}>
          Cantidad: {selectedItem.quantity ?? 1} ·{" "}
          {selectedItem.product?.type === "drink" ? "Barra" : "Cocina"}
        </p>
      </div>

      {/* ── Contenido ──────────────────────────────────── */}
      <div
        className="flex-1 p-5 space-y-5 overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
      >

        {/* Estado actual */}
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3"
            style={{ color: "#566270" }}
          >
            Estado actual
          </p>
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm"
            style={{ background: chip.bg, border: `1px solid ${chip.border}`, color: chip.color }}
          >
            {chip.label}
          </div>
        </div>

        {/* Botones de cambio */}
        {canUpdate && (
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3"
              style={{ color: "#566270" }}
            >
              Cambiar estado
            </p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_FLOW.map(({ key, label, color, activeBg, activeBorder, icon }) => {
                const isActive = current === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={statusLoading}
                    onClick={() => handleStatus(key)}
                    className="h-14 rounded-xl text-sm font-bold border transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                    style={{
                      background:  isActive ? activeBg   : "#1C2333",
                      borderColor: isActive ? activeBorder : "#30363D",
                      color:       isActive ? color       : "#566270",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background   = "#21283A";
                        (e.currentTarget as HTMLButtonElement).style.borderColor  = "#3D444D";
                        (e.currentTarget as HTMLButtonElement).style.color        = "#E6EDF3";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background   = "#1C2333";
                        (e.currentTarget as HTMLButtonElement).style.borderColor  = "#30363D";
                        (e.currentTarget as HTMLButtonElement).style.color        = "#566270";
                      }
                    }}
                  >
                    {statusLoading && isActive
                      ? <Loader2 size={14} className="animate-spin" />
                      : icon}
                    <span className="text-[11px] font-bold">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notas / modificación especial */}
        {selectedItem.notes && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={13} style={{ color: "#FF7B54" }} />
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "#566270" }}
              >
                Modificación especial
              </p>
            </div>
            <div
              className="p-3 rounded-xl"
              style={{ background: "rgba(255,123,84,0.10)", border: "1px solid rgba(255,123,84,0.25)" }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "#FF9A7A" }}>
                {selectedItem.notes}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
