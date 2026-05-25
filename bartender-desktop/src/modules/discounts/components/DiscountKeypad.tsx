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
}

export default function NebulaDiscountKeypad({
  type,
  setType,
  value,
  valueInput,
  appendNumber,
  removeLast,
}: Props) {
  const numerosTeclado = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  
  // Valores rápidos comunes para descuentos Nebula
  const descuentosRapidos = type === "PERCENT" ? [10, 15, 20, 25, 50] : [5, 10, 15, 20, 50];
  
  // Historial de valores recientes (simulado - en producción vendría de estado real)
  const valoresRecientes = [10, 15, 20];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 flex flex-col space-y-4 md:space-y-6">
      
      {/* ENCABEZADO AMIGABLE NEBULA */}
      <div>
        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">
          💰 Paso 2: Elige el tipo de descuento
        </h3>
        <p className="text-xs md:text-sm text-gray-500">
          Selecciona cómo quieres calcular el descuento
        </p>
      </div>

      {/* SELECTOR DE TIPO - INTERFAZ AMIGABLE */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <button
          onClick={() => setType("PERCENT")}
          className={`
            p-3 md:p-4 rounded-2xl text-xs md:text-sm font-semibold transition-all flex flex-col items-center gap-2 border-2
            ${type === "PERCENT"
              ? "bg-blue-50 text-blue-600 border-blue-500 shadow-lg"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}
          `}
        >
          <Percent size={24} className="md:size-28" />
          <span className="font-medium text-xs md:text-sm">Porcentaje</span>
          <span className="text-[10px] md:text-xs opacity-70">Ej: 20%</span>
        </button>
        <button
          onClick={() => setType("FLAT")}
          className={`
            p-3 md:p-4 rounded-2xl text-xs md:text-sm font-semibold transition-all flex flex-col items-center gap-2 border-2
            ${type === "FLAT"
              ? "bg-green-50 text-green-600 border-green-500 shadow-lg"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}
          `}
        >
          <DollarSign size={24} className="md:size-28" />
          <span className="font-medium text-xs md:text-sm">Monto Fijo</span>
          <span className="text-[10px] md:text-xs opacity-70">Ej: $15</span>
        </button>
      </div>

      {/* DESCUENTOS RÁPIDOS - NUEVA CARACTERÍSTICA NEBULA */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <Zap size={12} className="inline mr-1" />
            Descuentos rápidos
          </p>
          <button 
            onClick={() => appendNumber("0")}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <RotateCcw size={12} />
            Reiniciar
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {descuentosRapidos.map((valorRapido) => (
            <button
              key={valorRapido}
              onClick={() => appendNumber(valorRapido.toString())}
              className={`
                h-12 md:h-14 rounded-xl font-bold text-sm md:text-base transition-all border-2 flex items-center justify-center
                ${type === "PERCENT"
                  ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 active:scale-95"
                  : "bg-green-50 border-green-300 text-green-700 hover:bg-green-100 active:scale-95"}
              `}
            >
              {valorRapido}
              {type === "PERCENT" && <span className="text-xs ml-1">%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* PANTALLA - CLARO Y AMIGABLE */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 md:p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Valor del descuento
          </span>
          {type === "PERCENT" && (
            <span className="text-[10px] md:text-xs text-gray-400">
              <HelpCircle size={12} className="inline mr-1" />
              del subtotal
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className={`text-4xl md:text-5xl font-bold ${type === 'PERCENT' ? 'text-blue-600' : 'text-green-600'}`}>
            {valueInput || "0"}
          </span>
          <span className={`text-2xl md:text-3xl font-bold ${type === 'PERCENT' ? 'text-blue-600' : 'text-green-600'}`}>
            {type === "PERCENT" ? "%" : "$"}
          </span>
        </div>
        
        {/* PREVIEW DE CÁLCULO */}
        {value > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-[10px] md:text-xs text-gray-500">
              Descuento de: <span className="font-semibold text-gray-700">
                {type === "PERCENT" ? `${value}%` : `$${value}`}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* CONSEJO ÚTIL */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4">
        <p className="text-[10px] md:text-xs text-amber-700 font-medium">
          💡 Consejo: {type === "PERCENT" 
            ? "El porcentaje se aplicará sobre el total de los items seleccionados" 
            : "Este monto se restará directamente del total"}
        </p>
      </div>

      {/* TECLADO - GRANDE Y AMIGABLE PARA TÁCTIL */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {numerosTeclado.map((numero) => (
          <button
            key={numero}
            onClick={() => appendNumber(numero)}
            className="h-16 md:h-20 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-bold text-gray-800 transition-all active:scale-95 shadow-sm hover:shadow touch-manipulation"
          >
            {numero}
          </button>
        ))}
        <button
          onClick={removeLast}
          className="h-16 md:h-20 bg-red-100 hover:bg-red-200 text-red-600 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-sm hover:shadow touch-manipulation"
        >
          <Delete size={24} className="md:size-28" />
        </button>
        <button
          onClick={() => appendNumber("0")}
          className="h-16 md:h-20 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-bold text-gray-800 transition-all active:scale-95 shadow-sm hover:shadow touch-manipulation"
        >
          0
        </button>
        <button
          onClick={() => appendNumber(".")}
          className="h-16 md:h-20 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-bold text-gray-800 transition-all active:scale-95 shadow-sm hover:shadow touch-manipulation pb-2"
        >
          .
        </button>
      </div>

      {/* VALORES RECIENTES - NUEVA CARACTERÍSTICA NEBULA */}
      {valoresRecientes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History size={14} className="text-gray-400" />
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Valores recientes
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {valoresRecientes.map((valorReciente) => (
              <button
                key={valorReciente}
                onClick={() => appendNumber(valorReciente.toString())}
                className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium transition-all border border-gray-200"
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