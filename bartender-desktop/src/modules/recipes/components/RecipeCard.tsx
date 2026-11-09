"use client";

import {
  Wine,
  ChefHat,
  Eye,
  Pencil,
  Plus,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Package,
} from "lucide-react";
import type { Recipe } from "../types/recipe";

interface Props {
  recipe: Recipe;
  variantsCount?: number;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onAddVariant: (recipe: Recipe) => void;
}

export default function RecipeCard({
  recipe,
  variantsCount = 0,
  onView,
  onEdit,
  onAddVariant,
}: Props) {
  const isDrink = recipe.type === "drink";
  const productName =
    typeof recipe.product === "object" && recipe.product
      ? recipe.product.name
      : (recipe as any).name || "Receta sin nombre";

  const price =
    typeof recipe.product === "object" && recipe.product && recipe.product.price
      ? recipe.product.price
      : 0;

  const cost = recipe.totalCost || 0;
  const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;

  const marginColor =
    margin >= 70 ? "text-emerald" : margin >= 50 ? "text-gold" : "text-red";
  const marginBadge =
    margin >= 70
      ? "bg-emerald/10 text-emerald border-emerald/20"
      : margin >= 50
      ? "bg-gold/10 text-gold border-gold/20"
      : "bg-red/10 text-red border-red/20";

  const ingredientsCount = recipe.ingredients?.length || 0;
  const stepsCount = recipe.steps?.length || 0;

  // Método o técnica
  const methodOrTechnique =
    recipe.method ||
    (typeof recipe.technique === "object"
      ? (recipe.technique as any)?.name
      : recipe.technique) ||
    "Estándar";

  return (
    <div className="bg-surface-2 border border-border hover:border-border-strong hover:bg-surface-3 transition-all rounded-3xl p-5 shadow-md flex flex-col justify-between group relative overflow-hidden">
      {/* ── Parte Superior: Imagen, Estación & Variantes ── */}
      <div>
        <div className="relative aspect-[16/10] bg-surface rounded-2xl overflow-hidden mb-4 border border-border/60">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={productName}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-3/50 text-muted/50">
              {isDrink ? <Wine size={36} className="text-gold/40" /> : <ChefHat size={36} className="text-emerald/40" />}
              <span className="text-xs uppercase font-bold tracking-wider mt-1.5">Sin fotografía</span>
            </div>
          )}

          {/* Badge de Estación */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md border shadow-sm ${
                isDrink
                  ? "bg-bg/90 text-gold border-gold/30"
                  : "bg-bg/90 text-emerald border-emerald/30"
              }`}
            >
              {isDrink ? <Wine size={12} /> : <ChefHat size={12} />}
              <span>{isDrink ? "Barra" : "Cocina"}</span>
            </span>
          </div>

          {/* Badge de Variantes */}
          {variantsCount > 0 && (
            <div className="absolute top-2.5 right-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bg/90 text-ivory text-xs font-bold uppercase tracking-wider border border-border backdrop-blur-md shadow-sm">
                <Sparkles size={11} className="text-gold" />
                <span>{variantsCount} {variantsCount === 1 ? "variante" : "variantes"}</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Nombre & Categoría ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-muted uppercase font-bold tracking-wider truncate">
              {recipe.category || "General"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-surface-3 text-muted/80 font-bold uppercase">
              {methodOrTechnique}
            </span>
          </div>

          <h3
            className="text-lg font-black text-ivory tracking-tight uppercase truncate"
            title={productName}
          >
            {productName}
          </h3>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Package size={13} className="text-muted" />
              <span>{ingredientsCount} insumos</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-muted" />
              <span>{stepsCount} pasos</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Parte Inferior: Escandallo & Acciones ── */}
      <div>
        {/* Fila de Escandallo y Margen */}
        <div className="p-3.5 rounded-2xl bg-surface-3/60 border border-border mb-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-0.5">
              Costo Real
            </span>
            <span className="text-sm font-black text-ivory">
              ${cost.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
          </div>

          <div className="text-center">
            <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-0.5">
              Venta POS
            </span>
            <span className="text-sm font-black text-gold">
              {price > 0 ? `$${price.toLocaleString("es-AR")}` : "---"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-0.5">
              Margen
            </span>
            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-black ${marginBadge}`}>
              {margin}%
            </span>
          </div>
        </div>

        {/* Botonera de Acciones */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={() => onView(recipe)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface-3 hover:bg-surface-4 text-ivory text-xs font-bold uppercase tracking-wider border border-border hover:border-gold/30 transition-all cursor-pointer"
          >
            <Eye size={14} className="text-gold" />
            <span>Ficha</span>
          </button>

          <button
            onClick={() => onEdit(recipe)}
            className="p-2 rounded-xl bg-surface-3 hover:bg-surface-4 text-muted hover:text-ivory border border-border hover:border-gold/30 transition-all cursor-pointer"
            title="Editar Ficha"
          >
            <Pencil size={15} />
          </button>

          <button
            onClick={() => onAddVariant(recipe)}
            className="p-2 rounded-xl bg-surface-3 hover:bg-gold/10 text-muted hover:text-gold border border-border hover:border-gold/30 transition-all cursor-pointer"
            title="Crear Variante"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

