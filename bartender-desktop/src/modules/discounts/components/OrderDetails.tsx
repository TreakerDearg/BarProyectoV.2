"use client";

/**
 * OrderDetails — Ítems de la orden con toggle de selección.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Ítems seleccionados = VERDE (ahorro positivo para el cliente).
 * Selección de orden = DORADO (coherente con el sistema).
 */
import type { Order, SelectedItem } from "../types/discounts";
import { CheckSquare, Square, Calculator } from "lucide-react";

interface Props {
  order:    Order;
  items:    SelectedItem[];
  setItems: (items: SelectedItem[]) => void;
}

export default function OrderDetails({ order, items, setItems }: Props) {
  const toggleItem = (index: number) => {
    const updated = [...items];
    updated[index].selected = !updated[index].selected;
    setItems(updated);
  };

  const toggleAll = () => {
    const allSelected = items.every((i) => i.selected);
    setItems(items.map((i) => ({ ...i, selected: !allSelected })));
  };

  const allSelected   = items.every((i) => i.selected);
  const selectedCount = items.filter((i) => i.selected).length;
  const selectedTotal = items.filter((i) => i.selected).reduce((acc, i) => acc + i.price * i.quantity, 0);

  const tableLabel =
    typeof order.table === "object"
      ? (order.table as any)?.number ?? "?"
      : order.table;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid #30363D" }}
      >
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>
            Mesa {tableLabel}
          </h3>
          <p className="text-[10px] mt-0.5" style={{ color: "#566270" }}>
            Orden #{order._id.slice(-8).toUpperCase()}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background:  allSelected ? "#3FB950" : "#21283A",
            color:       allSelected ? "#0D1117" : "#8B949E",
            border:      `1px solid ${allSelected ? "transparent" : "#30363D"}`,
          }}
          onMouseEnter={(e) => {
            if (!allSelected) (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3";
          }}
          onMouseLeave={(e) => {
            if (!allSelected) (e.currentTarget as HTMLButtonElement).style.color = "#8B949E";
          }}
        >
          {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
        </button>
      </div>

      {/* Lista de ítems */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(63,185,80,0.3) transparent" }}
      >
        {items.map((item, index) => {
          const isSelected = item.selected;
          return (
            <div
              key={item._id || `${item.product}-${index}`}
              onClick={() => toggleItem(index)}
              className="flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer"
              style={{
                background:  isSelected ? "rgba(63,185,80,0.08)" : "#1C2333",
                border:      `1.5px solid ${isSelected ? "rgba(63,185,80,0.35)" : "#30363D"}`,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(63,185,80,0.18)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = "#30363D";
              }}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: isSelected ? "#3FB950" : "#21283A",
                    border:     `1px solid ${isSelected ? "transparent" : "#30363D"}`,
                    color:      isSelected ? "#0D1117" : "#566270",
                  }}
                >
                  {isSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                </div>

                {/* Info del ítem */}
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: isSelected ? "#3FB950" : "#E6EDF3" }}
                  >
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px]" style={{ color: "#566270" }}>
                      ${item.price.toLocaleString()} × {item.quantity}
                    </p>
                    {item.discountApplied && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ background: "rgba(240,180,41,0.12)", color: "#F0B429", border: "1px solid rgba(240,180,41,0.25)" }}
                      >
                        Ya tiene descuento
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Total del ítem */}
              <p
                className="text-base font-bold flex-shrink-0"
                style={{ color: isSelected ? "#3FB950" : "#E6EDF3" }}
              >
                ${(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer — subtotal seleccionado */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background: "#161B22", borderTop: "1px solid #30363D" }}
      >
        <div className="flex items-center gap-2">
          <Calculator size={14} style={{ color: "#3FB950" }} />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#566270" }}>
              {selectedCount} {selectedCount === 1 ? "producto" : "productos"} seleccionados
            </p>
            <p className="text-[9px]" style={{ color: "#3D444D" }}>Subtotal para descuento</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold" style={{ color: "#566270" }}>Total</span>
          <span className="text-xl font-black ml-2" style={{ color: "#3FB950" }}>
            ${selectedTotal.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
