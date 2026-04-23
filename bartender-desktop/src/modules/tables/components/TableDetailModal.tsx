import {
  X,
  Users,
  Clock,
  MapPin,
  Trash2,
  Play,
  Square,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Table } from "../types/table";

interface Props {
  table: Table | null;
  open: boolean;
  onClose: () => void;
  onOpenTable?: (id: string) => Promise<Table | void>;
  onCloseTable?: (id: string) => Promise<Table | void>;
  onDelete?: (id: string) => void;
  onCreateOrder?: (table: Table, sessionId: string) => void;
}

export default function TableDetailModal({
  table,
  open,
  onClose,
  onOpenTable,
  onCloseTable,
  onDelete,
  onCreateOrder,
}: Props) {
  const [now, setNow] = useState(Date.now());
  const [loadingAction, setLoadingAction] = useState(false);
  const [localTable, setLocalTable] = useState<Table | null>(null);

  /* =========================
     SYNC TABLE
  ========================= */
  useEffect(() => {
    setLocalTable(table);
  }, [table]);

  /* =========================
     TIMER
  ========================= */
  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [open]);

  const activeMinutes = useMemo(() => {
    if (!localTable?.openedAt) return 0;

    return Math.floor(
      (now - new Date(localTable.openedAt).getTime()) / 60000
    );
  }, [now, localTable]);

  if (!open || !localTable) return null;

  const tableId = localTable._id;
  const sessionId = localTable.currentSessionId; // 🔥 CRÍTICO POS

  const isOccupied = localTable.status === "occupied";

  const orders = Array.isArray(localTable.orders)
    ? localTable.orders
    : [];

  const hasOrders = orders.length > 0;

  const statusColors: Record<string, string> = {
    available: "bg-green-500/20 text-green-400",
    occupied: "bg-red-500/20 text-red-400",
    reserved: "bg-yellow-500/20 text-yellow-400",
    maintenance: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-gray-900 w-[620px] rounded-xl p-5 space-y-5 relative border border-gray-800">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X />
        </button>

        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">
              Mesa {localTable.number}
            </h2>

            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <Users size={14} />
              <span>{localTable.capacity} personas</span>
            </div>

            {localTable.location && (
              <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                <MapPin size={14} />
                <span>{localTable.location}</span>
              </div>
            )}
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusColors[localTable.status]
            }`}
          >
            {localTable.status.toUpperCase()}
          </div>
        </div>

        {/* TIMER */}
        {isOccupied && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock size={16} />
            <span>
              Tiempo activo: <b>{activeMinutes}</b> min
            </span>
          </div>
        )}

        {/* ORDERS */}
        <div>
          <h3 className="font-semibold mb-2">
            Órdenes {hasOrders ? `(${orders.length})` : ""}
          </h3>

          {hasOrders ? (
            <div className="space-y-2 max-h-40 overflow-auto">
              {orders.map((o: any) => (
                <div
                  key={o._id}
                  className="bg-gray-800 p-2 rounded text-sm flex justify-between"
                >
                  <span>Orden #{o._id?.slice(-5)}</span>
                  <span className="text-amber-400 font-medium">
                    ${o.total ?? 0}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Sin órdenes asignadas
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 pt-2">

          {/* OPEN / CLOSE */}
          {localTable.status !== "occupied" ? (
            <button
              disabled={loadingAction}
              onClick={async () => {
                if (!tableId) return;
                setLoadingAction(true);

                const updated = await onOpenTable?.(tableId);

                setLocalTable((prev) =>
                  updated ? (updated as Table) : prev
                );

                setLoadingAction(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 text-green-400 py-2 rounded-lg"
            >
              <Play size={16} />
              Abrir mesa
            </button>
          ) : (
            <button
              disabled={loadingAction}
              onClick={async () => {
                if (!tableId) return;
                setLoadingAction(true);

                const updated = await onCloseTable?.(tableId);

                setLocalTable((prev) =>
                  updated ? (updated as Table) : prev
                );

                setLoadingAction(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 text-red-400 py-2 rounded-lg"
            >
              <Square size={16} />
              Cerrar mesa
            </button>
          )}

          {/* CREATE ORDER (🔥 FIX REAL POS FLOW) */}
          <button
            disabled={!sessionId || !isOccupied}
            onClick={() => {
              if (!sessionId) return;
              onCreateOrder?.(localTable, sessionId);
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500/20 text-amber-400 py-2 rounded-lg"
          >
            <Plus size={16} />
            Pedido
          </button>

          {/* DELETE */}
          <button
            onClick={() => tableId && onDelete?.(tableId)}
            className="px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-red-400"
          >
            <Trash2 size={16} />
          </button>

        </div>
      </div>
    </div>
  );
}