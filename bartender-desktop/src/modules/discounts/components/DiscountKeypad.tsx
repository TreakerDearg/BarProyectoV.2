"use client";

import type { DiscountType } from "../types/discounts";
import { Percent, DollarSign, Delete, HelpCircle, Zap, RotateCcw, History } from "lucide-react";

interface Props {
  type: DiscountType;
  setType: (t: DiscountType) => void;
  value: number;
  valueInput: string;
  appendNumber: (v: string) => void;
  removeLast: () => void;
  presets?: {
    PERCENT?: number[];
    FLAT?: number[];
  };
}

export default function NebulaDiscountKeypad({
  type,
  setType,
  value,
  valueInput,
  appendNumber,
  removeLast,
  presets,
}: Props) {
  const numerosTeclado = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  
  const descuentosRapidos = type === "PERCENT"
    ? presets?.PERCENT || [10, 15, 20, 25, 50]
    : presets?.FLAT || [5, 10, 15, 20, 50];
  
  const valoresRecientes = [10, 15, 20];

  return (
    <div className="flex flex-col space-y-3 md:space-y-4">
      
      <div>
        <h3 className="text-sm font-bold text-white mb-1">
          Calcular Descuento
        </h3>
        <p className="text-xs text-white/50">
          Selecciona el tipo y valor
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <button
          onClick={() => setType("PERCENT")}
          className={`
            p-3 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-2 border
            ${type === "PERCENT"
              ? "bg-cyan text-black border-cyan shadow-lg"
              : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"}
          `}
        >
          <Percent size={18} className="md:size-20" />
          <span className="font-medium text-xs">Porcentaje</span>
          <span className="text-[10px] opacity-70">Ej: 20%</span>
        </button>
        <button
          onClick={() => setType("FLAT")}
          className={`
            p-3 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-2 border
            ${type === "FLAT"
              ? "bg-violet text-black border-violet shadow-lg"
              : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"}
          `}
        >
          <DollarSign size={18} className="md:size-20" />
          <span className="font-medium text-xs">Monto Fijo</span>
          <span className="text-[10px] opacity-70">Ej: $15</span>
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <p className="text-[10px] md:text-xs font-semibold text-white/40 uppercase tracking-wider">
            <Zap size={10} className="md:size-12 inline mr-1 text-emerald" />
            Rápidos
          </p>
          <button 
            onClick={() => appendNumber("0")}
            className="text-[10px] md:text-xs text-cyan hover:text-cyan/80 font-medium flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={10} className="md:size-12" />
            Reiniciar
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1.5 md:gap-2">
          {descuentosRapidos.map((valorRapido) => (
            <button
              key={valorRapido}
              onClick={() => appendNumber(valorRapido.toString())}
              className="
                h-10 md:h-12 rounded-lg font-bold text-xs md:text-sm transition-all border flex items-center justify-center
                bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-cyan/30 active:scale-95
              "
            >
              {valorRapido}
              {type === "PERCENT" && <span className="text-[10px] md:text-xs ml-0.5">%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 md:p-4 rounded-xl border" style={{
        background: 'rgba(255, 255, 255, 0.04)',
        borderColor: 'rgba(255, 255, 255, 0.08)'
      }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
            Valor
          </span>
          {type === "PERCENT" && (
            <span className="text-[10px] text-white/30">
              <HelpCircle size={10} className="md:size-12 inline mr-1" />
              del subtotal
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl md:text-4xl font-bold text-cyan">
            {valueInput || "0"}
          </span>
          <span className="text-xl md:text-2xl font-bold text-cyan">
            {type === "PERCENT" ? "%" : "$"}
          </span>
        </div>
        
        {value > 0 && (
          <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/10">
            <p className="text-[10px] text-white/40">
              Descuento de: <span className="font-semibold text-white/70">
                {type === "PERCENT" ? `${value}%` : `$${value}`}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="p-2 md:p-3 rounded-lg border" style={{
        background: 'rgba(255, 209, 102, 0.1)',
        borderColor: 'rgba(255, 209, 102, 0.2)'
      }}>
        <p className="text-[10px] text-gold font-medium leading-relaxed">
          💡 {type === "PERCENT" 
            ? "El porcentaje se aplicará sobre el total de los items seleccionados" 
            : "Este monto se restará directamente del total"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1.5 md:gap-2">
        {numerosTeclado.map((numero) => (
          <button
            key={numero}
            onClick={() => appendNumber(numero)}
            className="h-14 md:h-16 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-xl md:text-2xl font-bold text-white transition-all active:scale-95 border border-white/10 touch-manipulation"
          >
            {numero}
          </button>
        ))}
        <button
          onClick={removeLast}
          className="h-14 md:h-16 bg-rose/20 hover:bg-rose/30 text-rose rounded-xl flex items-center justify-center transition-all active:scale-95 border border-rose/30 touch-manipulation"
        >
          <Delete size={16} className="md:size-20" />
        </button>
        <button
          onClick={() => appendNumber("0")}
          className="h-14 md:h-16 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-xl md:text-2xl font-bold text-white transition-all active:scale-95 border border-white/10 touch-manipulation"
        >
          0
        </button>
        <button
          onClick={() => appendNumber(".")}
          className="h-14 md:h-16 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold text-white transition-all active:scale-95 border border-white/10 touch-manipulation pb-1 md:pb-2"
        >
          .
        </button>
      </div>

      {valoresRecientes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History size={12} className="md:size-14 text-white/30" />
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              Recientes
            </p>
          </div>
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            {valoresRecientes.map((valorReciente) => (
              <button
                key={valorReciente}
                onClick={() => appendNumber(valorReciente.toString())}
                className="px-2 md:px-3 py-1 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-[10px] md:text-xs font-medium transition-all border border-white/10"
              >
                {valorReciente}%
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
