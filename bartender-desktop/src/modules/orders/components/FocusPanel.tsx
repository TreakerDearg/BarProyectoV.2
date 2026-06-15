"use client";

import {
  ClipboardList,
  MessageSquare,
  Info,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

type ItemStatus = "pending" | "preparing" | "ready" | "served";

interface Props {
  selectedItem: {
    _id?: string;
    orderId?: string;
    status?: string;
    quantity?: number;
    notes?: string;
    product?: { name?: string; category?: string; type?: string };
  } | null;
  onItemStatusChange?: (
    orderId: string,
    itemId: string,
    status: ItemStatus
  ) => Promise<void>;
  statusLoading?: boolean;
}

const STATUS_FLOW: { key: ItemStatus; label: string }[] = [
  { key: "pending", label: "Pendiente" },
  { key: "preparing", label: "Preparando" },
  { key: "ready", label: "Listo" },
  { key: "served", label: "Servido" },
];

export default function FocusPanel({
  selectedItem,
  onItemStatusChange,
  statusLoading,
}: Props) {
  if (!selectedItem) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center nebula-panel opacity-60">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Info size={32} className="text-muted" />
        </div>
        <h3 className="text-base font-semibold text-ivory/70">
          Detalle del ítem
        </h3>
        <p className="text-sm text-muted mt-2 max-w-[220px]">
          Selecciona un producto de una comanda para cambiar su estado en cocina
          o barra.
        </p>
      </div>
    );
  }

  const current = (selectedItem.status || "pending") as string;
  const canUpdate =
    Boolean(selectedItem.orderId && selectedItem._id && onItemStatusChange) &&
    current !== "cancelled";

  const handleStatus = async (status: ItemStatus) => {
    if (!canUpdate || !selectedItem.orderId || !selectedItem._id) return;
    await onItemStatusChange?.(
      selectedItem.orderId,
      selectedItem._id,
      status
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col nebula-panel overflow-hidden"
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-violet-500/15 text-violet-200">
            <ClipboardList size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ivory">Ítem de comanda</h2>
            <p className="text-xs text-muted">Nebula · Comandas</p>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-ivory">
          {selectedItem.product?.name || "Producto"}
        </h3>
        <p className="text-sm text-muted mt-1">
          Cantidad: {selectedItem.quantity ?? 1} ·{" "}
          {selectedItem.product?.type === "drink" ? "Barra" : "Cocina"}
        </p>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
        <section>
          <p className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
            Estado del ítem
          </p>
          {canUpdate ? (
            <div className="grid grid-cols-2 gap-3">
              {STATUS_FLOW.map(({ key, label }) => {
                const active = current === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={statusLoading}
                    onClick={() => handleStatus(key)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                      active
                        ? "bg-violet-500/25 border-violet-400/40 text-violet-100"
                        : "border-white/10 text-muted hover:border-violet-400/30 hover:text-ivory"
                    }`}
                  >
                    {statusLoading && active ? (
                      <Loader2 size={16} className="animate-spin inline mr-1" />
                    ) : null}
                    {label}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-base text-muted capitalize">{current}</p>
          )}
        </section>

        {selectedItem.notes && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={16} className="text-violet-300" />
              <p className="text-sm font-semibold text-muted uppercase">
                Notas
              </p>
            </div>
            <p className="text-base text-ivory/90 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              {selectedItem.notes}
            </p>
          </section>
        )}
      </div>
    </motion.div>
  );
}
