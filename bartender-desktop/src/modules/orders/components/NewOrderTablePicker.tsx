"use client";

/**
 * NewOrderTablePicker — Modal de selección de mesa para nueva orden.
 * REDISEÑO v3.0 — Slate Elegante
 */
import { useEffect, useState } from "react";
import { X, Armchair, ArrowLeft } from "lucide-react";
import { getTables }   from "../../tables/services/tableService";
import type { Table }  from "../../tables/types/table";
import OrderForm       from "./OrderForm";

interface Props {
  onClose:   () => void;
  onSuccess: () => void;
}

export default function NewOrderTablePicker({ onClose, onSuccess }: Props) {
  const [tables, setTables]   = useState<Table[]>([]);
  const [selected, setSelected] = useState<Table | null>(null);
  const [loading, setLoading]  = useState(true);

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

  /* Paso 2 — formulario de orden */
  if (selected?.currentSessionId) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-8"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      >
        <div className="w-full max-w-4xl relative">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute -top-10 left-0 flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: "#F0B429" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F5C842"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F0B429"; }}
          >
            <ArrowLeft size={14} /> Cambiar mesa
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

  /* Paso 1 — selección de mesa */
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#1C2333", border: "1px solid #30363D" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid #30363D" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.25)" }}
            >
              <Armchair size={18} style={{ color: "#F0B429" }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: "#E6EDF3" }}>
                Nuevo pedido
              </h2>
              <p className="text-xs" style={{ color: "#566270" }}>
                Selecciona una mesa con sesión abierta
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "#566270" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "rgba(240,180,41,0.3)", borderTopColor: "#F0B429" }}
              />
              <p className="text-sm" style={{ color: "#566270" }}>
                Cargando mesas…
              </p>
            </div>
          ) : tables.length === 0 ? (
            <div
              className="text-center px-4 py-8 rounded-xl"
              style={{ background: "rgba(255,123,84,0.08)", border: "1px solid rgba(255,123,84,0.20)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "#FF9A7A" }}>
                No hay mesas con sesión activa
              </p>
              <p className="text-xs mt-1" style={{ color: "#566270" }}>
                Abre una mesa o sienta una reserva desde Salón o Reservas.
              </p>
            </div>
          ) : (
            <ul
              className="space-y-2 max-h-[340px] overflow-y-auto"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
            >
              {tables.map((t) => (
                <li key={t._id}>
                  <button
                    type="button"
                    onClick={() => setSelected(t)}
                    className="w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center justify-between"
                    style={{ background: "#21283A", border: "1px solid #30363D" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,180,41,0.30)";
                      (e.currentTarget as HTMLButtonElement).style.background  = "rgba(240,180,41,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363D";
                      (e.currentTarget as HTMLButtonElement).style.background  = "#21283A";
                    }}
                  >
                    <div>
                      <span className="font-bold text-base" style={{ color: "#E6EDF3" }}>
                        Mesa {t.number}
                      </span>
                      {t.location && (
                        <span className="text-xs block mt-0.5" style={{ color: "#566270" }}>
                          {t.location}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-lg"
                      style={{ background: "rgba(63,185,80,0.12)", border: "1px solid rgba(63,185,80,0.25)", color: "#3FB950" }}
                    >
                      Sesión activa
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
