"use client";

import {
  Pencil,
  Trash2,
  Users,
  Clock,
  AlertTriangle,
  Play,
  Square,
  MapPin,
  Receipt,
  Flame,
  CheckCircle2,
  Wrench,
} from "lucide-react";

import type { Table } from "../types/table";

interface Props {
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (id: string) => void;
  onSelect?: (table: Table) => void;

  onOpenTable?: (id: string) => Promise<void> | void;
  onCloseTable?: (id: string) => Promise<void> | void;
}

/* =========================
   STATUS CONFIG
========================= */
const statusConfig = {
  available: {
    label: "Disponible",
    color: "text-green-400",
    border: "border-green-500/30",
    bg: "bg-green-500/10",
  },
  occupied: {
    label: "Ocupada",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
  },
  reserved: {
    label: "Reservada",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
  },
  maintenance: {
    label: "Mantenimiento",
    color: "text-gray-400",
    border: "border-gray-500/30",
    bg: "bg-gray-500/10",
  },
};

export default function TableCard({
  table,
  onEdit,
  onDelete,
  onSelect,
  onOpenTable,
  onCloseTable,
}: Props) {
  const config = statusConfig[table.status];
  const isOccupied = table.status === "occupied";
  const isMaintenance = table.status === "maintenance";

  /* =========================
     TIME (ROBUSTO)
  ========================= */
  const referenceTime = table.updatedAt || table.createdAt;

  const activeMinutes = isOccupied && referenceTime
    ? Math.floor((Date.now() - new Date(referenceTime).getTime()) / 60000)
    : null;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  /* =========================
     TAG ALERT
  ========================= */
  const hasHighPriorityTag = table.tags?.some(
    (t) => t.priority === "high"
  );

  /* =========================
     🔥 ORDERS REAL SOURCE
  ========================= */
  const activeOrders = (table.orders || []).filter(
    (o: any) => o.sessionStatus === "open"
  );

  const totalOrders = activeOrders.length;

  const totalAmount = activeOrders.reduce(
    (sum: number, o: any) => sum + (o.total || 0),
    0
  );

  /* =========================
     ORDER STATES
  ========================= */
  const hasPreparing = activeOrders.some((o: any) =>
    o.items?.some((i: any) => i.status === "preparing")
  );

  const allDelivered =
    totalOrders > 0 &&
    activeOrders.every((o: any) =>
      o.items?.every((i: any) => i.status === "delivered")
    );

  /* =========================
     🔥 CLOSE RULE REAL
  ========================= */
  const canClose = activeOrders.length === 0;

  /* =========================
     CLICK
  ========================= */
  const handleCardClick = () => {
    if (isMaintenance) return; // bloquea interacción
    onSelect?.(table);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative rounded-2xl border p-4 cursor-pointer
        transition-all duration-200
        hover:scale-[1.02] hover:border-amber-500
        ${config.bg} ${config.border}
        ${isMaintenance && "opacity-70 cursor-not-allowed"}
      `}
    >
      {/* STATUS BAR */}
      <div className={`absolute left-0 top-0 h-full w-[4px] ${config.border}`} />

      {/* ALERT */}
      {hasHighPriorityTag && (
        <div className="absolute top-2 right-2">
          <AlertTriangle size={14} className="text-yellow-400" />
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white">
            Mesa {table.number}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <Users size={14} />
            <span>{table.capacity}</span>
          </div>
        </div>

        <span
          className={`text-[11px] px-2 py-1 rounded-full border uppercase font-semibold ${config.color} ${config.border}`}
        >
          {config.label}
        </span>
      </div>

      {/* LOCATION */}
      {table.location && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
          <MapPin size={12} />
          {table.location}
        </div>
      )}

      {/* ACTIVE TIME */}
      {isOccupied && activeMinutes !== null && (
        <div className="flex items-center gap-2 mt-2 text-xs">
          <Clock size={12} />
          <span className="text-green-400 font-medium">
            {formatTime(activeMinutes)}
          </span>
        </div>
      )}

      {/* 🔧 MAINTENANCE INFO */}
      {isMaintenance && (
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <Wrench size={12} />
          En limpieza / preparación
        </div>
      )}

      {/* =========================
         🔥 ORDERS PANEL
      ========================= */}
      {totalOrders > 0 && (
        <div className="mt-3 bg-gray-800/40 border border-gray-700 rounded-lg p-3 space-y-2">

          {/* HEADER */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-amber-400">
              <Receipt size={12} />
              <span>{totalOrders} órdenes</span>
            </div>

            <span className="text-green-400 font-semibold">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          {/* STATUS */}
          <div className="flex items-center gap-2 text-xs">
            {hasPreparing && (
              <div className="flex items-center gap-1 text-orange-400">
                <Flame size={12} />
                Preparando
              </div>
            )}

            {allDelivered && (
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle2 size={12} />
                Listo para cerrar
              </div>
            )}
          </div>

          {/* PREVIEW */}
          <div className="space-y-1 text-[11px] text-gray-300">
            {activeOrders.slice(0, 2).map((order: any) => (
              <div key={order._id}>
                {order.items
                  ?.slice(0, 2)
                  .map((i: any) => `${i.quantity}x ${i.product?.name}`)
                  .join(", ")}
              </div>
            ))}

            {totalOrders > 2 && (
              <span className="text-gray-500">
                + más órdenes
              </span>
            )}
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div
        className="flex gap-2 mt-4"
        onClick={(e) => e.stopPropagation()}
      >
        {!isOccupied && !isMaintenance ? (
          <button
            onClick={() => onOpenTable?.(table._id!)}
            className="flex-1 flex items-center justify-center gap-1
              bg-green-500/10 hover:bg-green-500/20 text-green-400
              py-2 rounded-lg transition"
          >
            <Play size={14} />
            Abrir
          </button>
        ) : (
          <button
            disabled={!canClose || isMaintenance}
            onClick={() => onCloseTable?.(table._id!)}
            className={`
              flex-1 flex items-center justify-center gap-1 py-2 rounded-lg transition
              ${
                canClose && !isMaintenance
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            <Square size={14} />
            Cerrar
          </button>
        )}

        <button
          onClick={() => onEdit(table)}
          className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
        >
          <Pencil size={14} />
        </button>

        <button
          onClick={() => table._id && onDelete(table._id)}
          className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* GLOW */}
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition pointer-events-none bg-gradient-to-t from-amber-500/5 to-transparent" />
    </div>
  );
}