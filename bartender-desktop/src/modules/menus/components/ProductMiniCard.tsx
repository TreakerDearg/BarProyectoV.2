"use client";

import { Martini, Utensils, CheckCircle, AlertTriangle, Plus, Check } from "lucide-react";
import type { Product } from "../../../types/product";

interface Props {
  product: Product;
  onAdd: (product: Product) => void;
  isAdded?: boolean;
}

export default function ProductMiniCard({ product, onAdd, isAdded = false }: Props) {
  const isDrink = product.type === "drink";

  return (
    <div
      onClick={() => !isAdded && onAdd(product)}
      className={`relative group p-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
        isAdded
          ? "bg-[#1C2333]/50 border-[#30363D] opacity-60 cursor-default"
          : "bg-[#161B22] border-[#30363D] hover:border-[rgba(240,180,41,0.40)] hover:bg-[#1C2333] cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Miniatura */}
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#090E14] border border-[#30363D] shrink-0 flex items-center justify-center">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className={isDrink ? "text-[#F0B429]/60" : "text-[#3FB950]/60"}>
              {isDrink ? <Martini size={16} /> : <Utensils size={16} />}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#E6EDF3] truncate" title={product.name}>
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-xs">
            <span className="font-extrabold text-[#F0B429]">
              ${(product.price ?? 0).toLocaleString("es-AR")}
            </span>
            <span className="text-[#8B949E]">·</span>
            <span className="text-[#8B949E] capitalize truncate">
              {product.category || "General"}
            </span>
            {product.available ? (
              <CheckCircle size={12} className="text-[#3FB950] shrink-0" title="Disponible" />
            ) : (
              <AlertTriangle size={12} className="text-[#F85149] shrink-0" title="Agotado" />
            )}
          </div>
        </div>
      </div>

      {/* Botón de acción */}
      <div>
        {isAdded ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-[#3FB950] px-2 py-1 rounded bg-[rgba(63,185,80,0.12)] border border-[rgba(63,185,80,0.25)]">
            <Check size={12} />
            Agregado
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[rgba(240,180,41,0.12)] hover:bg-[rgba(240,180,41,0.22)] border border-[rgba(240,180,41,0.30)] text-[#F0B429] text-xs font-bold transition-colors"
          >
            <Plus size={13} />
            <span>Agregar</span>
          </button>
        )}
      </div>
    </div>
  );
}
