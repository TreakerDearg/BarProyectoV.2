"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Wine,
  ChefHat,
  Layers,
  DollarSign,
  Package,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import type { Recipe } from "../types/recipe";
import { getProducts } from "../../products/services/productService";
import type { Product } from "../../../types/product";

interface Props {
  parentRecipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveVariant: (data: {
    parentRecipeId: string;
    variantName: string;
    variantType: "size" | "spirit" | "dietary";
    productId?: string;
    newPrice?: number;
    additionalCost?: number;
  }) => Promise<void>;
}

export default function RecipeVariantModal({
  parentRecipe,
  isOpen,
  onClose,
  onSaveVariant,
}: Props) {
  if (!isOpen || !parentRecipe) return null;

  const [variantType, setVariantType] = useState<"size" | "spirit" | "dietary">("size");
  const [variantName, setVariantName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [priceModifier, setPriceModifier] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDrink = parentRecipe.type === "drink";
  const parentName =
    typeof parentRecipe.product === "object" && parentRecipe.product
      ? parentRecipe.product.name
      : (parentRecipe as any).name || "Receta Maestra";

  const basePrice =
    typeof parentRecipe.product === "object" && parentRecipe.product?.price
      ? parentRecipe.product.price
      : 0;
  const baseCost = parentRecipe.totalCost || 0;

  // Fetch products that could represent this variant
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        const list = await getProducts();
        setProducts(list);
      } catch (err) {
        console.warn("Could not load products list:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  // Preset suggestions based on type
  const presets = isDrink
    ? {
        size: ["Media Jarra (500ml)", "Jarra Completa (1L)", "Shot Doble", "Copa Degustación"],
        spirit: ["Mocktail (Sin Alcohol)", "Destilado Ultra-Premium", "Versión Ahumada", "Tónica Artesanal"],
        dietary: ["Sin Azúcar Añadida (Keto)", "Edulcorante Stevia", "Bajo en Calorías"],
      }
    : {
        size: ["Porción Doble (XL)", "Media Porción", "Para Compartir", "Combo Menú"],
        spirit: ["Proteína Vegetal / Vegano", "Queso Vegano", "Opción Sin Picante"],
        dietary: ["Sin Gluten (Gluten-Free)", "Sin Lactosa", "Keto Friendly"],
      };

  const handleApplyPreset = (name: string) => {
    setVariantName(name);
  };

  const calculatedNewPrice = Math.max(0, basePrice + Number(priceModifier || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantName.trim()) {
      setError("Por favor ingresa un nombre para la variante.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSaveVariant({
        parentRecipeId: parentRecipe._id || "",
        variantName: variantName.trim(),
        variantType,
        productId: selectedProductId || undefined,
        newPrice: calculatedNewPrice,
        additionalCost: priceModifier > 0 ? priceModifier * 0.3 : 0,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al guardar la variante.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
      />

      <div className="relative bg-surface-card border border-border/70 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold border border-gold/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Nueva Variante de Ficha
              </h3>
              <p className="text-xs text-text-muted">
                Derivada de: <strong className="text-gold">{parentName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red/10 border border-red/30 text-xs text-red flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Variant Type Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
              Tipo de Variante
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVariantType("size")}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  variantType === "size"
                    ? "bg-gold/15 text-gold border-gold/40 shadow-sm"
                    : "bg-surface-dark/50 text-text-muted border-border/60 hover:text-text-primary"
                }`}
              >
                Formato / Tamaño
              </button>
              <button
                type="button"
                onClick={() => setVariantType("spirit")}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  variantType === "spirit"
                    ? "bg-cyan/15 text-cyan border-cyan/40 shadow-sm"
                    : "bg-surface-dark/50 text-text-muted border-border/60 hover:text-text-primary"
                }`}
              >
                {isDrink ? "Nivel de Alcohol" : "Sustitución Base"}
              </button>
              <button
                type="button"
                onClick={() => setVariantType("dietary")}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  variantType === "dietary"
                    ? "bg-emerald/15 text-emerald border-emerald/40 shadow-sm"
                    : "bg-surface-dark/50 text-text-muted border-border/60 hover:text-text-primary"
                }`}
              >
                Adaptación Dietaria
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-text-muted flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold" /> Sugerencias rápidas:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presets[variantType]?.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    variantName === p
                      ? "bg-gold/20 text-gold border-gold/40 font-semibold"
                      : "bg-surface-dark/60 text-text-muted border-border/50 hover:text-text-primary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Variant Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
              Nombre de la Variante *
            </label>
            <input
              type="text"
              required
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              placeholder="Ej. Mocktail Virgen, Jarra 1L, Sin Tacc..."
              className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold/50"
            />
          </div>

          {/* Product link (optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
              Vincular a Producto POS existente (Opcional)
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const p = products.find((x) => x._id === e.target.value);
                if (p && p.price) {
                  setPriceModifier(p.price - basePrice);
                }
              }}
              className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold/50 cursor-pointer"
            >
              <option value="">-- No asociar producto nuevo (Heredar principal) --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (${p.price?.toLocaleString() || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Differential Pricing */}
          <div className="grid grid-cols-2 gap-3 bg-surface-dark/60 rounded-xl p-3 border border-border/50">
            <div className="space-y-1">
              <label className="text-[11px] text-text-muted uppercase font-medium block">
                Diferencia de Precio ($)
              </label>
              <input
                type="number"
                value={priceModifier}
                onChange={(e) => setPriceModifier(Number(e.target.value))}
                placeholder="0"
                className="w-full text-xs bg-surface-card text-text-primary border border-border/60 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-gold/50"
              />
            </div>

            <div className="space-y-1 text-right">
              <label className="text-[11px] text-text-muted uppercase font-medium block">
                Precio Final POS
              </label>
              <span className="text-base font-bold font-mono text-gold block pt-1">
                ${calculatedNewPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-surface-card hover:bg-surface-hover text-text-primary border border-border/60 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-medium bg-gold hover:bg-gold-hover text-surface-dark font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? "Guardando..." : "Crear Variante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

