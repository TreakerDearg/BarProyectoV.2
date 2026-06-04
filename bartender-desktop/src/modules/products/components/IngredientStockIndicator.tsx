"use client";

import { CheckCircle, AlertTriangle } from "lucide-react";

interface Props {
  name: string;
  available: number;
  required: number;
  unit: string;
  compact?: boolean;
}

export default function IngredientStockIndicator({
  name,
  available,
  required,
  unit,
  compact = false
}: Props) {
  const isAvailable = available >= required;
  const stockPercent = available > 0 ? (available / required) * 100 : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${isAvailable ? 'bg-emerald/10' : 'bg-red/10'}`}>
          {isAvailable ? (
            <CheckCircle size={10} className="text-emerald-400" />
          ) : (
            <AlertTriangle size={10} className="text-red-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-ivory/90 truncate">{name}</p>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-muted">
              {available}/{required} {unit}
            </span>
            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`}
                style={{ width: `${Math.min(100, stockPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`p-2 rounded-lg ${isAvailable ? 'bg-emerald/10' : 'bg-red/10'}`}>
          {isAvailable ? (
            <CheckCircle size={12} className="text-emerald-400" />
          ) : (
            <AlertTriangle size={12} className="text-red-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-ivory/90 truncate">{name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted">
              Requerido: {required} {unit}
            </span>
            <span className="text-[10px] text-muted/50">·</span>
            <span className={`text-[10px] font-semibold ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
              Disponible: {available} {unit}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 ml-4">
        <span className="text-[10px] font-black text-muted">
          {stockPercent.toFixed(0)}%
        </span>
        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`}
            style={{ width: `${Math.min(100, stockPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
