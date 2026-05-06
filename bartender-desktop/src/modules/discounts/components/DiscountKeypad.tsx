"use client";

import type { DiscountType } from "../types/discounts";
import { Percent, DollarSign, Delete, Grid, ArrowLeft, Target, ShieldCheck } from "lucide-react";

interface Props {
  type: DiscountType;
  setType: (t: DiscountType) => void;
  value: number;
  valueInput: string;
  appendNumber: (v: string) => void;
  removeLast: () => void;
}

export default function DiscountKeypad({
  type,
  setType,
  value,
  valueInput,
  appendNumber,
  removeLast,
}: Props) {
  const keypadNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="glass-royale p-8 rounded-[3rem] border border-white/10 shadow-royale relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -z-10" />

      {/* SELECTOR PROTOCOL */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setType("PERCENT")}
          className={`
            py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border
            ${type === "PERCENT"
              ? "bg-grad-gold text-bg border-gold shadow-gold-glow"
              : "bg-surface-3 text-muted border-white/5 hover:border-white/10 hover:text-ivory"}
          `}
        >
          <Percent size={14} /> PORCENTAJE
        </button>
        <button
          onClick={() => setType("FLAT")}
          className={`
            py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border
            ${type === "FLAT"
              ? "bg-grad-gold text-bg border-gold shadow-gold-glow"
              : "bg-surface-3 text-muted border-white/5 hover:border-white/10 hover:text-ivory"}
          `}
        >
          <DollarSign size={14} /> VALOR FIJO
        </button>
      </div>

      {/* READOUT TERMINAL */}
      <div className="relative mb-8 bg-black/40 rounded-3xl p-10 border border-white/5 text-center group overflow-hidden">
        <div className="absolute inset-0 bg-grad-gold opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />
        <div className="flex items-center justify-center gap-3">
           <span className="text-6xl font-black text-ivory tracking-tighter drop-shadow-2xl">
              {valueInput || "0"}
           </span>
           <span className="text-2xl font-black text-gold mt-4 uppercase">
              {type === "PERCENT" ? "%" : "$"}
           </span>
        </div>
        <p className="text-[8px] font-black text-muted uppercase tracking-[0.5em] mt-4 flex items-center justify-center gap-2">
           <ShieldCheck size={10} className="text-gold" /> TERMINAL DE AJUSTE ACTIVA
        </p>
      </div>

      {/* TACTICAL KEYPAD */}
      <div className="grid grid-cols-3 gap-3">
        {keypadNumbers.map((key) => (
          <button
            key={key}
            onClick={() => appendNumber(key)}
            className="h-20 bg-surface-3 hover:bg-surface-4 border border-white/5 hover:border-white/20 rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-ivory transition-all shadow-lg active:scale-95"
          >
            {key}
          </button>
        ))}
        <button
          onClick={removeLast}
          className="h-20 bg-red/5 hover:bg-red/10 border border-red/20 rounded-[1.5rem] flex items-center justify-center text-red transition-all shadow-lg active:scale-95 group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => appendNumber("0")}
          className="h-20 bg-surface-3 hover:bg-surface-4 border border-white/5 hover:border-white/20 rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-ivory transition-all shadow-lg active:scale-95"
        >
          0
        </button>
        <button
          onClick={() => appendNumber(".")}
          className="h-20 bg-surface-3 hover:bg-surface-4 border border-white/5 hover:border-white/20 rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-ivory transition-all shadow-lg active:scale-95"
        >
          .
        </button>
      </div>
    </div>
  );
}