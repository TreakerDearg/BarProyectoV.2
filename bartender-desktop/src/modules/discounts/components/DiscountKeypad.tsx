"use client";

/**
 * DiscountKeypad — Teclado numérico para ingresar el valor del descuento.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * PERCENT = Dorado, FLAT = Azul.
 * Teclado táctil preservado, colores actualizados.
 */
import type { DiscountType } from "../types/discounts";
import { Percent, DollarSign, Delete, Zap } from "lucide-react";

interface Props {
  type:         DiscountType;
  setType:      (t: DiscountType) => void;
  value:        number;
  valueInput:   string;
  appendNumber: (v: string) => void;
  removeLast:   () => void;
  presets?: {
    PERCENT?: number[];
    FLAT?:    number[];
  };
}

export default function DiscountKeypad({
  type, setType, value, valueInput, appendNumber, removeLast, presets,
}: Props) {
  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const quickValues = type === "PERCENT"
    ? presets?.PERCENT || [10, 15, 20, 25, 50]
    : presets?.FLAT    || [5, 10, 15, 20, 50];

  const accentColor = type === "PERCENT" ? "#F0B429" : "#388BFD";

  return (
    <div className="flex flex-col gap-3">

      {/* Toggle PERCENT / FLAT */}
      <div className="grid grid-cols-2 gap-2">
        {([
          { t: "PERCENT" as DiscountType, label: "Porcentaje", sub: "Ej: 20%",  icon: <Percent     size={16} />, active: "#F0B429" },
          { t: "FLAT"    as DiscountType, label: "Monto fijo", sub: "Ej: $15", icon: <DollarSign  size={16} />, active: "#388BFD" },
        ]).map(({ t, label, sub, icon, active }) => {
          const isActive = type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
              style={{
                background:  isActive ? `${active}20` : "#21283A",
                border:      `1.5px solid ${isActive ? `${active}50` : "#30363D"}`,
                color:       isActive ? active : "#566270",
              }}
            >
              {icon}
              <span className="text-xs font-bold">{label}</span>
              <span className="text-[9px]" style={{ color: isActive ? `${active}80` : "#3D444D" }}>{sub}</span>
            </button>
          );
        })}
      </div>

      {/* Presets rápidos */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Zap size={11} style={{ color: "#566270" }} />
          <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#566270" }}>
            Rápidos
          </p>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {quickValues.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => appendNumber(v.toString())}
              className="h-10 rounded-lg text-xs font-bold transition-all"
              style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${accentColor}40`;
                (e.currentTarget as HTMLButtonElement).style.color = accentColor;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363D";
                (e.currentTarget as HTMLButtonElement).style.color = "#8B949E";
              }}
            >
              {v}{type === "PERCENT" ? "%" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Display del valor */}
      <div
        className="flex items-center justify-center gap-1 py-4 rounded-xl"
        style={{ background: "#161B22", border: `1px solid ${accentColor}30` }}
      >
        <span className="text-4xl font-black" style={{ color: accentColor }}>
          {valueInput || "0"}
        </span>
        <span className="text-2xl font-black" style={{ color: accentColor }}>
          {type === "PERCENT" ? "%" : "$"}
        </span>
      </div>

      {/* Hint */}
      {value > 0 && (
        <div
          className="px-3 py-2 rounded-lg text-[10px] font-medium"
          style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20`, color: `${accentColor}CC` }}
        >
          💡 {type === "PERCENT"
            ? "El % se aplica sobre el subtotal de los ítems seleccionados"
            : "Este monto se resta directamente del total"}
        </div>
      )}

      {/* Teclado numérico 3×4 */}
      <div className="grid grid-cols-3 gap-1.5">
        {KEYS.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => appendNumber(num)}
            className="h-14 rounded-xl text-xl font-bold transition-all active:scale-95 touch-manipulation"
            style={{ background: "#21283A", border: "1px solid #30363D", color: "#E6EDF3" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#293042"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#21283A"; }}
          >
            {num}
          </button>
        ))}

        {/* Fila final: ⌫ / 0 / . */}
        <button
          type="button"
          onClick={removeLast}
          className="h-14 rounded-xl flex items-center justify-center transition-all active:scale-95 touch-manipulation"
          style={{ background: "rgba(248,81,73,0.10)", border: "1px solid rgba(248,81,73,0.25)", color: "#F85149" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,81,73,0.18)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,81,73,0.10)"; }}
        >
          <Delete size={17} />
        </button>
        <button
          type="button"
          onClick={() => appendNumber("0")}
          className="h-14 rounded-xl text-xl font-bold transition-all active:scale-95 touch-manipulation"
          style={{ background: "#21283A", border: "1px solid #30363D", color: "#E6EDF3" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#293042"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#21283A"; }}
        >
          0
        </button>
        <button
          type="button"
          onClick={() => appendNumber(".")}
          className="h-14 rounded-xl text-2xl font-bold transition-all active:scale-95 touch-manipulation pb-1"
          style={{ background: "#21283A", border: "1px solid #30363D", color: "#E6EDF3" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#293042"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#21283A"; }}
        >
          .
        </button>
      </div>
    </div>
  );
}
