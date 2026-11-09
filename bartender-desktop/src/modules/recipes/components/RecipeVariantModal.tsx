"use client";

import { useState, useEffect, useMemo } from "react";
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
  TrendingUp,
  Percent,
  Scale,
  RefreshCw,
  Sliders,
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
    multiplier?: number;
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
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [priceModifier, setPriceModifier] = useState<number>(0);
  const [customAdditionalCost, setCustomAdditionalCost] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDrink = parentRecipe.type === "drink";
  const parentName =
    typeof parentRecipe.product === "object" && parentRecipe.product
      ? parentRecipe.product.name
      : (parentRecipe as any).name || "Ficha Técnica Maestra";

  const basePrice =
    typeof parentRecipe.product === "object" && parentRecipe.product?.price
      ? parentRecipe.product.price
      : 0;
  const baseCost = parentRecipe.totalCost || 0;

  // Carga de productos POS
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        const list = await getProducts();
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn("Could not load products list:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  // Presets según el tipo de variante y estación
  const presets = useMemo(() => {
    if (isDrink) {
      return {
        size: [
          { name: "Shot Doble (2oz)", mult: 1.5, delta: 600 },
          { name: "Media Jarra (500ml)", mult: 1.5, delta: 1200 },
          { name: "Jarra 1L (Para Compartir)", mult: 2.2, delta: 2500 },
          { name: "Copa Degustación (50%)", mult: 0.5, delta: -400 },
        ],
        spirit: [
          { name: "Con Gin Mare (Premium)", mult: 1.0, delta: 1400 },
          { name: "Con Hendrick's Gin", mult: 1.0, delta: 1200 },
          { name: "Con Ron Havana 7 Años", mult: 1.0, delta: 800 },
          { name: "Con Tónica Artesanal Blue", mult: 1.0, delta: 500 },
        ],
        dietary: [
          { name: "Mocktail Virgen (Sin Alcohol)", mult: 0.8, delta: -300 },
          { name: "Keto Friendly (Sin Azúcar)", mult: 1.0, delta: 0 },
          { name: "Con Leche de Almendras", mult: 1.0, delta: 300 },
        ],
      };
    } else {
      return {
        size: [
          { name: "Porción Doble (XL)", mult: 1.8, delta: 1200 },
          { name: "Media Porción (50%)", mult: 0.6, delta: -500 },
          { name: "Para Compartir (3-4 personas)", mult: 2.5, delta: 2800 },
          { name: "Combo Menú Almuerzo", mult: 1.0, delta: 600 },
        ],
        spirit: [
          { name: "Con Queso Vegano", mult: 1.0, delta: 400 },
          { name: "Con Proteína Vegetal / Heura", mult: 1.0, delta: 700 },
          { name: "Con Jamón Ibérico Especial", mult: 1.0, delta: 1500 },
        ],
        dietary: [
          { name: "Opción Sin TACC (Gluten-Free)", mult: 1.0, delta: 400 },
          { name: "100% Apto Vegano", mult: 1.0, delta: 300 },
          { name: "Sin Lactosa", mult: 1.0, delta: 200 },
        ],
      };
    }
  }, [isDrink]);

  const handleApplyPreset = (item: { name: string; mult: number; delta: number }) => {
    setVariantName(item.name);
    setMultiplier(item.mult);
    setPriceModifier(item.delta);
  };

  // Cálculos dinámicos
  const estimatedCost = useMemo(() => {
    if (variantType === "size") {
      return Math.round((baseCost * multiplier + customAdditionalCost) * 10) / 10;
    }
    return Math.round((baseCost + customAdditionalCost) * 10) / 10;
  }, [baseCost, multiplier, customAdditionalCost, variantType]);

  const calculatedNewPrice = useMemo(() => {
    return Math.max(0, basePrice + Number(priceModifier || 0));
  }, [basePrice, priceModifier]);

  const calculatedMargin = useMemo(() => {
    if (calculatedNewPrice <= 0) return 0;
    return Math.round(((calculatedNewPrice - estimatedCost) / calculatedNewPrice) * 100);
  }, [calculatedNewPrice, estimatedCost]);

  const marginColor =
    calculatedMargin >= 65
      ? "text-[#3FB950]"
      : calculatedMargin >= 45
      ? "text-[#F0B429]"
      : "text-[#F85149]";

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
        multiplier: variantType === "size" ? multiplier : 1,
        newPrice: calculatedNewPrice,
        additionalCost: customAdditionalCost,
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
      {/* Backdrop 100% Sólido sin fugas */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Contenedor Modal Opaque Slate Elegante */}
      <div className="relative bg-[#161B22] border border-[#30363D] rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-6 z-10 text-[#E6EDF3]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide text-[#E6EDF3]">
                Nueva Variante de Ficha
              </h3>
              <p className="text-xs text-[#8B949E] mt-0.5">
                Derivada de: <strong className="text-[#F0B429] font-bold">{parentName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[rgba(248,81,73,0.12)] border border-[rgba(248,81,73,0.35)] text-xs text-[#F85149] flex items-center gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Selector de Tipo de Variante */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider block">
              Eje de la Variante
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setVariantType("size")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                  variantType === "size"
                    ? "bg-[#F0B429]/20 text-[#F0B429] border-[#F0B429] shadow-sm"
                    : "bg-[#1C2333] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3] hover:bg-[#21283A]"
                }`}
              >
                📏 Formato / Tamaño
              </button>
              <button
                type="button"
                onClick={() => setVariantType("spirit")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                  variantType === "spirit"
                    ? "bg-[#388BFD]/20 text-[#388BFD] border-[#388BFD] shadow-sm"
                    : "bg-[#1C2333] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3] hover:bg-[#21283A]"
                }`}
              >
                {isDrink ? "🍸 Spirit / Destilado" : "🍳 Sustitución Base"}
              </button>
              <button
                type="button"
                onClick={() => setVariantType("dietary")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                  variantType === "dietary"
                    ? "bg-[#3FB950]/20 text-[#3FB950] border-[#3FB950] shadow-sm"
                    : "bg-[#1C2333] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3] hover:bg-[#21283A]"
                }`}
              >
                🌿 Adaptación Dietaria
              </button>
            </div>
          </div>

          {/* Sugerencias Rápidas */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F0B429]" /> Sugerencias rápidas:
            </label>
            <div className="flex flex-wrap gap-2">
              {presets[variantType]?.map((p) => {
                const isSelected = variantName === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                      isSelected
                        ? "bg-[#F0B429]/25 text-[#F0B429] border-[#F0B429] font-bold"
                        : "bg-[#1C2333] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3] hover:border-[#8B949E]/50"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nombre de la Variante */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider block">
              Nombre de la Variante *
            </label>
            <input
              type="text"
              required
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              placeholder="Ej. Porción Doble XL, Mocktail Virgen, Con Gin Mare..."
              className="w-full text-xs bg-[#1C2333] text-[#E6EDF3] border border-[#30363D] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F0B429] font-medium"
            />
          </div>

          {/* Control Especial según Tipo */}
          {variantType === "size" && (
            <div className="p-3.5 rounded-2xl bg-[#1C2333] border border-[#30363D] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#F0B429]" />
                  Multiplicador de Escandallo
                </span>
                <span className="text-xs font-bold font-mono text-[#F0B429]">
                  {multiplier}x cantidades de insumos
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1.0, 1.5, 2.0].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMultiplier(val)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      multiplier === val
                        ? "bg-[#F0B429] text-[#0D1117] border-[#F0B429]"
                        : "bg-[#21283A] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3]"
                    }`}
                  >
                    {val === 0.5 ? "0.5x (50%)" : val === 1.0 ? "1.0x (Base)" : val === 1.5 ? "1.5x (XL)" : "2.0x (Doble)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Precios & Simulación Financiera */}
          <div className="grid grid-cols-3 gap-3 bg-[#1C2333] rounded-2xl p-4 border border-[#30363D]">
            {/* Costo de Insumos */}
            <div className="space-y-1">
              <label className="text-[11px] text-[#8B949E] uppercase font-bold tracking-wider block">
                Costo Insumos
              </label>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold font-mono text-[#E6EDF3]">
                  ${estimatedCost.toLocaleString()}
                </span>
                {estimatedCost !== baseCost && (
                  <span className="text-[10px] text-[#8B949E] line-through font-mono">
                    ${baseCost}
                  </span>
                )}
              </div>
            </div>

            {/* Ajuste de Precio ($) */}
            <div className="space-y-1">
              <label className="text-[11px] text-[#8B949E] uppercase font-bold tracking-wider block">
                Diferencia PVP ($)
              </label>
              <input
                type="number"
                value={priceModifier}
                onChange={(e) => setPriceModifier(Number(e.target.value))}
                placeholder="+0"
                className="w-full text-xs bg-[#21283A] text-[#E6EDF3] border border-[#30363D] rounded-xl px-2.5 py-1.5 font-mono focus:outline-none focus:border-[#F0B429]"
              />
            </div>

            {/* Precio Final & Margen */}
            <div className="space-y-1 text-right">
              <label className="text-[11px] text-[#8B949E] uppercase font-bold tracking-wider block">
                Precio POS Final
              </label>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-base font-black font-mono text-[#F0B429]">
                  ${calculatedNewPrice.toLocaleString()}
                </span>
              </div>
              <span className={`text-[11px] font-bold font-mono ${marginColor} block`}>
                {calculatedMargin}% margen
              </span>
            </div>
          </div>

          {/* Vinculación opcional con POS */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider block">
              Vincular a Producto POS específico (Opcional)
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
              className="w-full text-xs bg-[#1C2333] text-[#E6EDF3] border border-[#30363D] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F0B429] cursor-pointer font-medium"
            >
              <option value="">-- No asociar producto nuevo (Heredar principal) --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (${p.price?.toLocaleString() || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#30363D]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#21283A] hover:bg-[#293042] text-[#E6EDF3] border border-[#30363D] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#F0B429] hover:bg-[#F5C842] text-[#0D1117] uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              {saving ? "Guardando..." : "Crear Variante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
