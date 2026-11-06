/**
 * OrderCard — Tarjeta de comanda individual.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Badge de modificaciones visible en el header cuando algún ítem tiene notes.
 */
import type { Order }    from "../../types/order";
import OrderTimer        from "./OrderTimer";
import OrderItems        from "./OrderItems";
import OrderActions      from "./OrderActions";
import { getTableLabel, isBarOrder } from "./orderCard.utils";
import { Flame, Zap, Clock, MessageSquare, UtensilsCrossed } from "lucide-react";
import { GlassWater }    from "lucide-react";
import { motion }        from "framer-motion";
import type { CSSProperties } from "react";

interface Props {
  order:          Order;
  onDelete:       (id: string) => void;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onSelectItem?:  (item: any) => void;
  selectedItemId?: string;
  onEdit?:        (id: string) => void;
}

export default function OrderCard(props: Props) {
  const { order, onEdit } = props;

  const orderId    = order._id ?? "";
  const tableLabel = getTableLabel(order.table);
  const isBar      = isBarOrder(order.items);

  /* Prioridad temporal */
  const minutes      = order.createdAt
    ? (Date.now() - new Date(order.createdAt).getTime()) / 60000
    : 0;
  const isCritical     = minutes > 15 && order.status !== "completed" && order.status !== "cancelled";
  const isHighPriority = minutes > 10 && !isCritical && order.status !== "completed" && order.status !== "cancelled";

  /* Cuenta de modificaciones (notes por ítem) */
  const notesCount = order.items.filter((i) => (i as any).notes).length;

  /* Progreso */
  const completedItems    = order.items.filter((i) => i.status === "served" || i.status === "ready").length;
  const totalItems        = order.items.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  /* Tema por tipo */
  const typeTheme = isBar
    ? { accent: "#f2d790", accentSoft: "rgba(242,215,144,0.13)", border: "rgba(242,215,144,0.26)", icon: <GlassWater size={18} style={{ color: "#F0B429" }} />, label: "Barra" }
    : { accent: "#64d9d2", accentSoft: "rgba(100,217,210,0.12)", border: "rgba(100,217,210,0.22)", icon: <UtensilsCrossed size={18} style={{ color: "#56D364" }} />, label: "Cocina" };

  /* Color del número de mesa */
  const medallionColor = isCritical ? "#F85149" : isHighPriority ? "#FF7B54" : "#E6EDF3";
  const medallionBorder = isCritical ? "rgba(248,81,73,0.30)" : isHighPriority ? "rgba(255,123,84,0.30)" : "rgba(242,215,144,0.22)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.005 }}
      style={{
        "--order-accent":      typeTheme.accent,
        "--order-accent-soft": typeTheme.accentSoft,
        "--order-border":      typeTheme.border,
      } as CSSProperties}
      className={`
        nebula-command-card flex flex-col transition-all duration-300
        ${isCritical     ? "is-critical" : ""}
        ${isHighPriority ? "is-high"     : ""}
        ${order.status === "completed" ? "opacity-50" : ""}
      `}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative p-5" style={{ borderBottom: "1px solid #30363D" }}>
        <div className="flex items-start justify-between gap-3">

          {/* Mesa + tipo */}
          <div className="flex items-center gap-3">
            <div
              className="nebula-table-medallion font-black text-3xl"
              style={{ color: medallionColor, borderColor: medallionBorder }}
            >
              {tableLabel}
            </div>
            <div>
              {/* Indicador de prioridad */}
              <div className="flex items-center gap-1.5 mb-1">
                {isCritical ? (
                  <Flame size={14} className="animate-pulse" style={{ color: "#F85149" }} />
                ) : isHighPriority ? (
                  <Zap size={14} style={{ color: "#FF7B54" }} />
                ) : (
                  <Clock size={14} style={{ color: "#566270" }} />
                )}
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: isCritical ? "#F85149" : isHighPriority ? "#FF7B54" : "#566270",
                  }}
                >
                  {isCritical ? "CRÍTICO" : isHighPriority ? "ALTA PRIORIDAD" : "Comanda"}
                </span>
              </div>
              {/* Tipo */}
              <div className="flex items-center gap-1.5">
                {typeTheme.icon}
                <span className="text-xs font-medium uppercase" style={{ color: "#8B949E" }}>
                  {typeTheme.label}
                </span>
              </div>
            </div>
          </div>

          {/* Columna derecha: badge modificaciones + progreso */}
          <div className="flex flex-col items-end gap-2">
            {/* Badge de modificaciones */}
            {notesCount > 0 && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(255,123,84,0.15)", border: "1px solid rgba(255,123,84,0.30)" }}
              >
                <MessageSquare size={11} style={{ color: "#FF7B54" }} />
                <span className="text-[10px] font-bold" style={{ color: "#FF7B54" }}>
                  {notesCount} {notesCount === 1 ? "modificación" : "modificaciones"}
                </span>
              </div>
            )}
            {/* Progreso */}
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#566270" }}>
                Progreso
              </p>
              <p className="text-base font-bold" style={{ color: "#E6EDF3" }}>
                {completedItems}/{totalItems}
              </p>
              <div className="nebula-progress-track w-14 h-1.5 mt-1">
                <div
                  className="nebula-progress-bar transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────── */}
      <div className="p-4 space-y-3 flex-1">

        {/* Timer */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: "#21283A", border: "1px solid #30363D" }}
        >
          <div className="flex items-center gap-2">
            <Clock size={14} style={{ color: "#566270" }} />
            <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#566270" }}>
              Tiempo de espera
            </span>
          </div>
          <OrderTimer order={order} />
        </div>

        {/* Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#566270" }}>
              Contenido
            </span>
            <span className="text-[10px] font-bold" style={{ color: "#8B949E" }}>
              {order.items.length} {order.items.length === 1 ? "ítem" : "ítems"}
            </span>
          </div>
          <OrderItems
            items={order.items}
            status={order.status}
            onSelectItem={(item) => props.onSelectItem?.({ ...item, orderId })}
            selectedItemId={props.selectedItemId}
          />
        </div>

        {/* Acciones */}
        <div style={{ paddingTop: "8px", borderTop: "1px solid #30363D" }}>
          <OrderActions
            orderId={orderId}
            status={order.status}
            onDelete={props.onDelete}
            onStatusChange={props.onStatusChange}
            onEdit={onEdit}
          />
        </div>
      </div>
    </motion.div>
  );
}
