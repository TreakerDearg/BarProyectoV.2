"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getTables } from "../../tables/services/tableService";
import type { Table } from "../../tables/types/table";
import OrderForm from "./OrderForm";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewOrderTablePicker({ onClose, onSuccess }: Props) {
  const [tables, setTables] = useState<Table[]>([]);
  const [selected, setSelected] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTables()
      .then((data) => {
        const occupied = (Array.isArray(data) ? data : []).filter(
          (t) => t.status === "occupied" && t.currentSessionId
        );
        setTables(occupied);
      })
      .finally(() => setLoading(false));
  }, []);

  if (selected?.currentSessionId) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
        <div className="w-full max-w-4xl relative">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute -top-10 left-0 text-xs text-violet-300 hover:text-ivory"
          >
            ← Cambiar mesa
          </button>
          <OrderForm
            tableId={selected._id}
            sessionId={selected.currentSessionId}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
      <div className="nebula-panel w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-ivory">Nuevo pedido</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ivory">
            <X size={22} />
          </button>
        </div>
        <p className="text-sm text-muted mb-4">
          Elige una mesa con sesión abierta. Si no hay ninguna, abre o sienta clientes
          desde Nebula · Salón o Reservas.
        </p>
        {loading ? (
          <p className="text-sm text-muted py-8 text-center">Cargando mesas…</p>
        ) : tables.length === 0 ? (
          <p className="text-sm text-amber-200/90 py-6 text-center border border-amber-500/20 rounded-xl bg-amber-500/5 px-4">
            No hay mesas ocupadas con sesión activa. Abre una mesa o senta una reserva
            primero.
          </p>
        ) : (
          <ul className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
            {tables.map((t) => (
              <li key={t._id}>
                <button
                  type="button"
                  onClick={() => setSelected(t)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-white/10 hover:border-violet-400/30 hover:bg-violet-500/10 transition-colors"
                >
                  <span className="font-semibold text-ivory">Mesa {t.number}</span>
                  <span className="text-xs text-muted block mt-0.5">
                    {t.location} · sesión activa
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
