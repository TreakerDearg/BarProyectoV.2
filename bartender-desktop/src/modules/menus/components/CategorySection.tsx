"use client";

import { ChevronDown, ChevronUp, Plus, GripVertical, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import type { MenuCategory, MenuProduct } from "../../../types/menu";

interface Props {
  category: MenuCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onAddProduct: () => void;
  onRemoveProduct: (productId: string) => void;
  onDeleteCategory?: () => void;
}

export default function CategorySection({
  category,
  isExpanded,
  onToggle,
  onAddProduct,
  onRemoveProduct,
  onDeleteCategory,
}: Props) {
  const availableCount = category.products.filter(p => p.available).length;
  const totalCount = category.products.length;
  const hasRecipeCount = category.products.filter(p => p.hasRecipe).length;

  return (
    <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
          >
            {isExpanded ? (
              <ChevronUp size={14} className="text-muted" />
            ) : (
              <ChevronDown size={14} className="text-muted" />
            )}
          </button>
          <div className="flex-1">
            <h4 className="text-sm font-black text-ivory tracking-tight uppercase">
              {category.name}
            </h4>
            {category.description && (
              <p className="text-[10px] text-muted/70 mt-0.5">{category.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5">
            <span className="text-[10px] font-semibold text-muted">
              {totalCount} productos
            </span>
            {availableCount < totalCount && (
              <span className="text-[10px] font-semibold text-red-400">
                ({availableCount} disponibles)
              </span>
            )}
          </div>
          {hasRecipeCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald/10">
              <span className="text-[10px] font-semibold text-emerald-400">
                {hasRecipeCount} recetas
              </span>
            </div>
          )}
          {onDeleteCategory && (
            <button
              onClick={onDeleteCategory}
              className="p-1.5 rounded-lg bg-red/5 border border-red/10 text-red/40 hover:text-red hover:bg-red/20 transition-all"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {category.products.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-6 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
              <span className="text-xs text-muted/50 font-semibold">No hay productos en esta categoría</span>
            </div>
          ) : (
            category.products.map((product: MenuProduct) => (
              <div
                key={product.product}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="cursor-grab text-muted/30 hover:text-muted/60">
                  <GripVertical size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-ivory/90 truncate">
                      Producto #{product.product.slice(0, 8)}
                    </p>
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
                  {product.missingIngredients && product.missingIngredients.length > 0 && (
                    <p className="text-[10px] text-red-400 mt-1">
                      Faltan {product.missingIngredients.length} ingredientes
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gold">
                    ${product.price?.toFixed(2) || "0.00"}
                  </span>
                  <button
                    onClick={() => onRemoveProduct(product.product)}
                    className="p-1.5 rounded-lg bg-red/5 border border-red/10 text-red/40 hover:text-red hover:bg-red/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Add Product Button */}
          <button
            onClick={onAddProduct}
            className="w-full py-3 rounded-xl border border-dashed border-white/10 flex items-center justify-center gap-2 text-muted hover:text-ivory hover:border-white/20 hover:bg-white/5 transition-all"
          >
            <Plus size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Agregar Producto</span>
          </button>
        </div>
      )}
    </div>
  );
}
