"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Percent, DollarSign, Sparkles, Check, AlertTriangle, Plus } from "lucide-react";

interface Props {
  subtotal: number;
  onApplyDiscount: (discount: { type: "PERCENT" | "FLAT"; value: number; reason: string; note?: string }) => void;
  onClose: () => void;
}

const DISCOUNT_PRESETS = [
  { type: "PERCENT" as const, value: 10, label: "10%", icon: <Percent size={20} /> },
  { type: "PERCENT" as const, value: 15, label: "15%", icon: <Percent size={20} /> },
  { type: "PERCENT" as const, value: 20, label: "20%", icon: <Percent size={20} /> },
  { type: "FLAT" as const, value: 50, label: "$50", icon: <DollarSign size={20} /> },
  { type: "FLAT" as const, value: 100, label: "$100", icon: <DollarSign size={20} /> },
];

const REASONS = [
  { value: "FREQUENT_CUSTOMER", label: "Cliente frecuente" },
  { value: "PROMO", label: "Promoción" },
  { value: "ERROR", label: "Error del sistema" },
  { value: "OTHER", label: "Otro" },
];

export default function DiscountModal({ subtotal, onApplyDiscount, onClose }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<typeof DISCOUNT_PRESETS[0] | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customValue, setCustomValue] = useState<number>(0);
  const [customType, setCustomType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [note, setNote] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const calculateDiscountAmount = () => {
    if (isCustom) {
      if (customType === "PERCENT") {
        return (subtotal * customValue) / 100;
      }
      return customValue;
    }
    if (selectedPreset) {
      if (selectedPreset.type === "PERCENT") {
        return (subtotal * selectedPreset.value) / 100;
      }
      return selectedPreset.value;
    }
    return 0;
  };

  const discountAmount = calculateDiscountAmount();
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApply = () => {
    if (isCustom) {
      if (customValue <= 0) return;
      onApplyDiscount({
        type: customType,
        value: customValue,
        reason: selectedReason || "OTHER",
        note: note || undefined,
      });
    } else if (selectedPreset) {
      onApplyDiscount({
        type: selectedPreset.type,
        value: selectedPreset.value,
        reason: selectedReason || "OTHER",
        note: note || undefined,
      });
    }
  };

  const isValid = selectedReason && (isCustom ? customValue > 0 : selectedPreset !== null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-start bg-surface-3/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gold/15 text-gold">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ivory">Aplicar Descuento</h2>
              <p className="text-sm text-muted mt-1">Subtotal: ${subtotal.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 md:p-8 space-y-6">
          {/* PRESETS */}
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 block">
              {isCustom ? "Valor personalizado" : "Descuentos rápidos"}
            </label>
            
            {!isCustom ? (
              <div className="grid grid-cols-3 gap-3">
                {DISCOUNT_PRESETS.map((preset) => (
                  <motion.button
                    key={preset.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPreset(preset)}
                    className={`
                      p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                      ${selectedPreset === preset
                        ? "border-gold bg-gold/10 shadow-gold-glow"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center
                      ${selectedPreset === preset ? "bg-gold text-black" : "bg-white/10 text-muted"}
                    `}>
                      {preset.icon}
                    </div>
                    <span className={`text-sm font-bold ${
                      selectedPreset === preset ? "text-white" : "text-muted"
                    }`}>
                      {preset.label}
                    </span>
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCustom(true)}
                  className="p-4 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-muted">
                    <Plus size={20} />
                  </div>
                  <span className="text-sm font-bold text-muted">Personalizado</span>
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setCustomType("PERCENT")}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                      customType === "PERCENT"
                        ? "bg-gold text-black"
                        : "bg-white/5 text-muted hover:bg-white/10"
                    }`}
                  >
                    Porcentaje
                  </button>
                  <button
                    onClick={() => setCustomType("FLAT")}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                      customType === "FLAT"
                        ? "bg-gold text-black"
                        : "bg-white/5 text-muted hover:bg-white/10"
                    }`}
                  >
                    Monto fijo
                  </button>
                </div>
                <input
                  type="number"
                  value={customValue}
                  onChange={(e) => setCustomValue(parseFloat(e.target.value) || 0)}
                  placeholder={customType === "PERCENT" ? "0%" : "$0"}
                  className="w-full bg-surface-2 border border-white/10 rounded-xl py-4 px-4 text-white font-bold text-lg outline-none focus:border-gold/50"
                  min={0}
                  max={customType === "PERCENT" ? 100 : subtotal}
                />
                <button
                  onClick={() => setIsCustom(false)}
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  ← Volver a presets
                </button>
              </div>
            )}
          </div>

          {/* REASON */}
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 block">
              Motivo
            </label>
            <div className="grid grid-cols-2 gap-3">
              {REASONS.map((reason) => (
                <motion.button
                  key={reason.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedReason(reason.value)}
                  className={`
                    p-3 rounded-xl border-2 transition-all text-sm font-bold
                    ${selectedReason === reason.value
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-white/10 bg-white/5 text-muted hover:bg-white/10"
                    }
                  `}
                >
                  {reason.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* NOTE */}
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">
              Nota (opcional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Detalles adicionales..."
              className="w-full bg-surface-2 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-gold/50"
            />
          </div>

          {/* SUMMARY */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted">Descuento</span>
              <span className="font-bold text-gold">-${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold text-white">Total final</span>
              <span className="font-black text-gold">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* WARNING */}
          {discountAmount > subtotal * 0.5 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={16} className="text-amber-400 mt-0.5" />
              <p className="text-xs text-amber-400">
                Este descuento es mayor al 50% del subtotal. Asegúrate de tener autorización.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 md:p-8 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={!isValid}
            className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isValid
                ? "bg-gold text-black hover:bg-gold/90"
                : "bg-white/5 text-muted cursor-not-allowed"
            }`}
          >
            <Check size={16} />
            Aplicar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
