"use client";

import { Martini, CheckCircle, AlertTriangle, Plus } from "lucide-react";
import type { Product } from "../../../types/product";

interface Props {
  product: Product;
  onAdd: (product: Product) => void;
  isAdded?: boolean;
}

export default function ProductMiniCard({ product, onAdd, isAdded = false }: Props) {
  return (
    <div
      className={`
        relative group p-3 rounded-xl border transition-all
        ${isAdded
          ? 'bg-emerald/10 border-emerald/30 opacity-50 cursor-not-allowed'
          : 'bg-white/[0.02] border-white/5 hover:border-rose/30 hover:bg-white/5 cursor-pointer'
        }
      `}
      onClick={() => !isAdded && onAdd(product)}
    >
      <div className="flex items-center gap-3">
        {product.image ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-3 flex-shrink-0">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center flex-shrink-0">
            <Martini size={14} className="text-muted/50" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-ivory/90 truncate">{product.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-semibold text-gold">
              $${(product.price ?? 0).toFixed(2)}
            </span>
            {product.available ? (
              <CheckCircle size={10} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={10} className="text-red-400" />
            )}
            {product.hasRecipe && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-violet/10 text-violet-300 font-semibold">
                Receta
              </span>
            )}
          </div>
        </div>
        {!isAdded && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(product); }}
            className="p-1.5 rounded-lg bg-rose/10 border border-rose/20 text-rose-400 hover:bg-rose/20 hover:border-rose/40 transition-all"
          >
            <Plus size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
