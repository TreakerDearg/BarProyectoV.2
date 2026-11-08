"use client";

/**
 * OrderList — Lista de órdenes activas para aplicar descuentos.
 * REDISEÑO v3.0 — Slate Elegante
 * Selección con dorado (coherente con el sistema).
 */
import type { Order } from "../types/discounts";
import { Store, Clock, ChevronRight } from "lucide-react";

interface Props {
  orders:          Order[];
  selectedOrderId?: string;
  loading?:        boolean;
  onSelectOrder:   (order: Order) => void;
}

export default function OrderList({ orders, selectedOrderId, loading, onSelectOrder }: Props) {
  return (
    <div
      className="flex-1 overflow-y-auto space-y-2 pr-1"
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div
            className="w-9 h-9 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(240,180,41,0.30)", borderTopColor: "#F0B429" }}
          />
          <p className="text-xs" style={{ color: "#566270" }}>Cargando órdenes…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
          <div
            className="p-3 rounded-full"
            style={{ background: "#21283A", border: "1px solid #30363D" }}
          >
            <Store size={22} style={{ color: "#566270" }} />
          </div>
          <p className="text-xs font-medium" style={{ color: "#566270" }}>Sin órdenes activas</p>
          <p className="text-[10px]" style={{ color: "#3D444D" }}>El local está tranquilo</p>
        </div>
      ) : (
        orders.map((orden) => {
          const isSelected = selectedOrderId === orden._id;
          const tableLabel =
            typeof orden.table === "object"
              ? (orden.table as any)?.number ?? (orden.table as any)?._id ?? "?"
              : orden.table;

          return (
            <button
              key={orden._id}
              type="button"
              onClick={() => onSelectOrder(orden)}
              className="w-full text-left p-3 rounded-xl transition-all"
              style={{
                background:  isSelected ? "rgba(240,180,41,0.08)" : "#1C2333",
                border:      `1.5px solid ${isSelected ? "rgba(240,180,41,0.40)" : "#30363D"}`,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,180,41,0.22)";
                  (e.currentTarget as HTMLButtonElement).style.background   = "rgba(240,180,41,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363D";
                  (e.currentTarget as HTMLButtonElement).style.background   = "#1C2333";
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4
                      className="text-sm font-bold"
                      style={{ color: isSelected ? "#F0B429" : "#E6EDF3" }}
                    >
                      Mesa {tableLabel}
                    </h4>
                    {isSelected && (
                      <ChevronRight size={13} style={{ color: "#F0B429" }} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={10} style={{ color: "#566270" }} />
                    <p
                      className="text-[10px] font-medium"
                      style={{ color: isSelected ? "rgba(240,180,41,0.70)" : "#566270" }}
                    >
                      {orden.items.length} {orden.items.length === 1 ? "producto" : "productos"}
                    </p>
                    {orden.status && (
                      <>
                        <span style={{ color: "#3D444D" }}>·</span>
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: isSelected ? "rgba(240,180,41,0.70)" : "#566270" }}
                        >
                          {orden.status === "completed" ? "Completada" : orden.status === "in-progress" ? "En curso" : orden.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-base font-extrabold"
                    style={{ color: isSelected ? "#F0B429" : "#E6EDF3" }}
                  >
                    ${Number(orden.total || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
