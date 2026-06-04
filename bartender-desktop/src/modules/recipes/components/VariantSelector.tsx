"use client";

import { Layers, Check } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  isPrimary: boolean;
}

interface Props {
  variants: Variant[];
  selectedId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export default function VariantSelector({ variants, selectedId, onSelect, compact = false }: Props) {
  if (!variants || variants.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Layers size={12} className="text-violet-400" />
        <select
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-semibold text-ivory focus:outline-none focus:border-violet-400/50"
        >
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.isPrimary ? `${variant.name} (Principal)` : variant.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Layers size={14} className="text-violet-400" />
        <h4 className="text-xs font-black text-violet-400 uppercase tracking-widest">Variantes de Receta</h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              onClick={() => onSelect(variant.id)}
              className={`
                px-4 py-2 rounded-xl border flex items-center gap-2 transition-all
                ${isSelected
                  ? 'bg-violet/20 border-violet/40 text-violet-300'
                  : 'bg-white/5 border-white/10 text-muted hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {isSelected && <Check size={12} className="text-violet-400" />}
              <span className="text-[10px] font-semibold">
                {variant.name}
                {variant.isPrimary && ' (Principal)'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
