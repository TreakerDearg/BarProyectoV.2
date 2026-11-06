/**
 * OrderItem — Fila de un ítem dentro de la comanda.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Las notas/modificaciones se muestran SIEMPRE visibles si existen.
 */
import type { OrderItem as IOrderItem } from "../../types/order";
import { CheckCircle2, Circle, AlertCircle, Zap, MessageSquare } from "lucide-react";

interface Props {
  item:      IOrderItem;
  status:    string;
  onSelect?: (item: any) => void;
  isActive?: boolean;
}

/* ── Configuración visual por estado ───────────────────────── */
const statusConfig = {
  pending: {
    color:  "#8B949E",
    bg:     "#21283A",
    border: "#30363D",
    label:  "Pendiente",
    icon:   <Circle size={12} className="fill-current" />,
  },
  preparing: {
    color:  "#FF7B54",
    bg:     "rgba(255,123,84,0.10)",
    border: "rgba(255,123,84,0.25)",
    label:  "Preparando",
    icon:   <Zap size={13} className="animate-pulse" />,
  },
  ready: {
    color:  "#F0B429",
    bg:     "rgba(240,180,41,0.10)",
    border: "rgba(240,180,41,0.30)",
    label:  "Listo",
    icon:   <CheckCircle2 size={13} />,
  },
  served: {
    color:  "#3FB950",
    bg:     "rgba(63,185,80,0.10)",
    border: "rgba(63,185,80,0.25)",
    label:  "Servido",
    icon:   <CheckCircle2 size={13} />,
  },
  cancelled: {
    color:  "#F85149",
    bg:     "rgba(248,81,73,0.10)",
    border: "rgba(248,81,73,0.25)",
    label:  "Cancelado",
    icon:   <AlertCircle size={13} />,
  },
} as const;

export default function OrderItem({ item, onSelect, isActive }: Props) {
  const itemStatus = (item.status as string) || "pending";
  const config     = statusConfig[itemStatus as keyof typeof statusConfig] ?? statusConfig.pending;
  const isCancelled = itemStatus === "cancelled";
  const isReady     = itemStatus === "ready" || itemStatus === "served";
  const itemAny     = item as any;

  return (
    <div
      onClick={() => onSelect?.(item)}
      className="flex flex-col gap-0 rounded-xl border transition-all cursor-pointer group"
      style={{
        background:   isActive ? "rgba(240,180,41,0.10)" : "#161B22",
        border:       `1px solid ${isActive ? "rgba(240,180,41,0.40)" : "#30363D"}`,
        opacity:      isCancelled ? 0.45 : 1,
        filter:       isCancelled ? "grayscale(0.6)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.background = "#21283A";
          (e.currentTarget as HTMLDivElement).style.borderColor = "#3D444D";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.background = "#161B22";
          (e.currentTarget as HTMLDivElement).style.borderColor = "#30363D";
        }
      }}
    >
      {/* Fila principal */}
      <div className="flex items-center gap-3 p-3">
        {/* Ícono de estado con badge de cantidad */}
        <div className="relative flex-shrink-0">
          <div
            className="w-9 h-9 rounded-full border-2 flex items-center justify-center"
            style={{
              background:  config.bg,
              borderColor: config.border,
              color:       config.color,
            }}
          >
            {config.icon}
          </div>
          {item.quantity > 1 && (
            <div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2"
              style={{ background: "#F0B429", color: "#0D1117", borderColor: "#0D1117" }}
            >
              {item.quantity}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm font-bold uppercase tracking-tight truncate transition-colors"
            style={{
              color:           isCancelled ? "#566270" : "#E6EDF3",
              textDecoration:  isCancelled ? "line-through" : "none",
            }}
          >
            {itemAny?.product?.name || itemAny?.name || "Producto desconocido"}
          </h4>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: config.color }}>
            {config.label}
          </span>
        </div>

        {/* Badge LISTO/SERVIDO */}
        {isReady && !isCancelled && (
          <div
            className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
            style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
          >
            {itemStatus === "ready" ? "LISTO" : "SERVIDO"}
          </div>
        )}
      </div>

      {/* ── Notas — siempre visibles si existen ──────────── */}
      {itemAny.notes && (
        <div
          className="mx-3 mb-3 flex items-start gap-1.5 px-2.5 py-2 rounded-lg"
          style={{ background: "rgba(255,123,84,0.10)", border: "1px solid rgba(255,123,84,0.20)" }}
        >
          <MessageSquare size={10} className="flex-shrink-0 mt-0.5" style={{ color: "#FF7B54" }} />
          <p
            className="text-[11px] font-medium leading-tight break-words"
            style={{ color: "#FF9A7A" }}
          >
            {itemAny.notes}
          </p>
        </div>
      )}
    </div>
  );
}
