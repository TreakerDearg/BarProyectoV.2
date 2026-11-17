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
  Repeat,
  Leaf,
  SlidersHorizontal,
  Search,
  Plus,
  Trash2,
  Tag,
  ShieldCheck,
  Maximize2,
} from "lucide-react";
import type { Recipe } from "../types/recipe";
import { getProducts } from "../../products/services/productService";
import { getInventory } from "../../inventory/services/inventoryService";
import type { Product } from "../../../types/product";
import type { InventoryItem } from "../../inventory/types/inventory";

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
    ingredientReplacements?: Array<{
      originalItemId: string;
      newItemId: string;
      newQuantity?: number;
      newUnit?: string;
    }>;
    excludedIngredientIds?: string[];
    additionalIngredients?: Array<{
      inventoryItem: string;
      quantity: number;
      unit: string;
    }>;
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

  // Sustitución de insumos
  const [replacements, setReplacements] = useState<
    Record<string, { newItemId: string; newItemName: string; quantity: number; unit: string; costDelta: number }>
  >({});
  const [activeReplacingItemId, setActiveReplacingItemId] = useState<string | null>(null);

  // Adaptación dietaria (exclusiones y adicionales)
  const [excludedItemIds, setExcludedItemIds] = useState<string[]>([]);
  const [dietaryBadge, setDietaryBadge] = useState<string>("");
  const [additionalIngredients, setAdditionalIngredients] = useState<
    Array<{ inventoryItem: string; name: string; quantity: number; unit: string; cost: number }>
  >([]);

  // Búsqueda de inventario para sustituciones o agregados
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(false);
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
      : 2500;
  const baseCost = parentRecipe.totalCost || 0;

  // Carga de inventario y productos
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const [prodList, invList] = await Promise.all([
          getProducts(),
          getInventory({ limit: 200 }),
        ]);
        setProducts(Array.isArray(prodList) ? prodList : []);
        setInventoryItems(Array.isArray(invList) ? invList : []);
      } catch (err) {
        console.warn("Could not load resources:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // Presets según eje (Sin emojis, textos limpios)
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
          { name: "Mocktail Virgen (Sin Alcohol)", mult: 1.0, delta: -300, badge: "Sin Alcohol / Virgen" },
          { name: "Keto Friendly (Sin Azúcar)", mult: 1.0, delta: 0, badge: "Keto / Sin Azúcar" },
          { name: "Con Leche de Almendras", mult: 1.0, delta: 300, badge: "Sin Lactosa" },
        ],
      };
    } else {
      return {
        size: [
          { name: "Porción Doble (XL)", mult: 1.8, delta: 1400 },
          { name: "Media Porción (50%)", mult: 0.6, delta: -600 },
          { name: "Para Compartir (3-4 personas)", mult: 2.5, delta: 3000 },
          { name: "Combo Menú Almuerzo", mult: 1.0, delta: 700 },
        ],
        spirit: [
          { name: "Con Queso Vegano", mult: 1.0, delta: 400 },
          { name: "Con Proteína Vegetal / Heura", mult: 1.0, delta: 700 },
          { name: "Con Jamón Ibérico Especial", mult: 1.0, delta: 1500 },
        ],
        dietary: [
          { name: "Opción Sin TACC (Gluten-Free)", mult: 1.0, delta: 400, badge: "Sin TACC / Gluten-Free" },
          { name: "100% Apto Vegano", mult: 1.0, delta: 300, badge: "Apto Vegano" },
          { name: "Sin Lactosa", mult: 1.0, delta: 200, badge: "Sin Lactosa" },
        ],
      };
    }
  }, [isDrink]);

  const handleApplyPreset = (item: any) => {
    setVariantName(item.name);
    setMultiplier(item.mult || 1.0);
    setPriceModifier(item.delta || 0);
    if (item.badge) setDietaryBadge(item.badge);
  };

  // Cálculo Dinámico de Costo de Insumos
  const calculatedCost = useMemo(() => {
    if (variantType === "size") {
      return Math.round((baseCost * multiplier + customAdditionalCost) * 10) / 10;
    }

    if (variantType === "spirit") {
      let delta = 0;
      Object.values(replacements).forEach((r) => {
        delta += r.costDelta;
      });
      return Math.max(0, Math.round((baseCost + delta + customAdditionalCost) * 10) / 10);
    }

    if (variantType === "dietary") {
      // Descontar excluidos y sumar adicionales
      let estimated = baseCost;
      (parentRecipe.ingredients || []).forEach((ing) => {
        const id = (ing.inventoryItem?._id || ing.inventoryItem)?.toString();
        if (excludedItemIds.includes(id)) {
          const inv = inventoryItems.find((i) => i._id === id);
          if (inv && typeof inv.cost === "number") {
            const costPerUnit = inv.unit === "l" || inv.unit === "kg" ? inv.cost / 1000 : inv.cost;
            estimated -= Number(ing.quantity) * costPerUnit;
          }
        }
      });
      additionalIngredients.forEach((add) => {
        estimated += add.cost;
      });
      return Math.max(0, Math.round((estimated + customAdditionalCost) * 10) / 10);
    }

    return baseCost;
  }, [
    variantType,
    baseCost,
    multiplier,
    customAdditionalCost,
    replacements,
    excludedItemIds,
    additionalIngredients,
    parentRecipe,
    inventoryItems,
  ]);

  const finalSalePrice = Math.max(0, basePrice + priceModifier);
  const grossMargin =
    finalSalePrice > 0
      ? Math.round(((finalSalePrice - calculatedCost) / finalSalePrice) * 100)
      : 0;

  // Filtrado de inventario
  const filteredInventory = useMemo(() => {
    if (!inventorySearch.trim()) return [];
    const q = inventorySearch.toLowerCase().trim();
    return inventoryItems
      .filter((i) => i.name.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q))
      .slice(0, 5);
  }, [inventoryItems, inventorySearch]);

  // Manejo de Sustituciones de Insumos
  const handleSelectReplacement = (originalIngId: string, originalIngQty: number, originalUnit: string, newItem: InventoryItem) => {
    const origCostPerUnit = newItem.cost / (newItem.unit === "l" || newItem.unit === "kg" ? 1000 : 1);
    const newDelta = originalIngQty * origCostPerUnit;

    setReplacements((prev) => ({
      ...prev,
      [originalIngId]: {
        newItemId: newItem._id || "",
        newItemName: newItem.name,
        quantity: originalIngQty,
        unit: originalUnit,
        costDelta: newDelta,
      },
    }));
    setActiveReplacingItemId(null);
    setInventorySearch("");
  };

  const handleUpdateReplacementQty = (originalIngId: string, qty: number, unit: string) => {
    setReplacements((prev) => {
      const cur = prev[originalIngId];
      if (!cur) return prev;
      return {
        ...prev,
        [originalIngId]: {
          ...cur,
          quantity: qty,
          unit: unit,
        },
      };
    });
  };

  const handleRemoveReplacement = (originalIngId: string) => {
    setReplacements((prev) => {
      const copy = { ...prev };
      delete copy[originalIngId];
      return copy;
    });
  };

  // Toggle de ingredientes excluidos (Dietary / Mocktail)
  const toggleExcludeIngredient = (ingId: string) => {
    setExcludedItemIds((prev) =>
      prev.includes(ingId) ? prev.filter((id) => id !== ingId) : [...prev, ingId]
    );
  };

  // Guardado
  const handleSave = async () => {
    if (!variantName.trim()) {
      setError("Debes indicar un nombre para la variante.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Mapear reemplazos
      const ingredientReplacements = Object.entries(replacements).map(
        ([originalItemId, rep]) => ({
          originalItemId,
          newItemId: rep.newItemId,
          newQuantity: rep.quantity,
          newUnit: rep.unit,
        })
      );

      // Mapear adicionales
      const adds = additionalIngredients.map((a) => ({
        inventoryItem: a.inventoryItem,
        quantity: a.quantity,
        unit: a.unit,
      }));

      await onSaveVariant({
        parentRecipeId: parentRecipe._id!,
        variantName: variantName.trim(),
        variantType,
        productId: selectedProductId || undefined,
        multiplier: variantType === "size" ? multiplier : 1.0,
        ingredientReplacements: ingredientReplacements.length > 0 ? ingredientReplacements : undefined,
        excludedIngredientIds: excludedItemIds.length > 0 ? excludedItemIds : undefined,
        additionalIngredients: adds.length > 0 ? adds : undefined,
        newPrice: finalSalePrice,
        additionalCost: customAdditionalCost,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || "Error al crear la variante.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop 100% Sólido */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Contenedor Modal */}
      <div
        className="relative rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 z-10 max-h-[92vh] flex flex-col"
        style={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 shrink-0" style={{ borderBottom: "1px solid #30363D" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
              style={{
                background: "rgba(240,180,41,0.15)",
                color: "#F0B429",
                border: "1px solid rgba(240,180,41,0.30)",
              }}
            >
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E6EDF3]">Nueva Variante de Ficha</h3>
              <p className="text-xs text-[#8B949E]">
                Derivada de: <span className="font-semibold text-[#F0B429]">{parentName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[rgba(248,81,73,0.12)] border border-[rgba(248,81,73,0.30)] flex items-center gap-2 text-xs text-[#F85149]">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Ejes de Variación con Lucide React (Sin Emojis) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
              Eje de la Variante *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "size", label: "Formato / Tamaño", icon: Scale, desc: "Porciones XL, medias pintas, jarras" },
                { type: "spirit", label: "Sustitución Base", icon: Repeat, desc: "Swap de licores, spirits o insumos" },
                { type: "dietary", label: "Adaptación Dietaria", icon: Leaf, desc: "Mocktails vírgenes, sin TACC, vegano" },
              ].map(({ type, label, icon: Icon, desc }) => {
                const active = variantType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setVariantType(type as any);
                      setVariantName("");
                    }}
                    className="p-3 rounded-xl border text-left transition-all flex flex-col gap-1"
                    style={{
                      background: active ? "rgba(240,180,41,0.15)" : "#1C2333",
                      borderColor: active ? "#F0B429" : "#30363D",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={15} style={{ color: active ? "#F0B429" : "#8B949E" }} />
                      <span className="text-xs font-bold text-[#E6EDF3]">{label}</span>
                    </div>
                    <span className="text-[10px] text-[#8B949E] leading-tight line-clamp-1">{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sugerencias Rápidas */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B949E]">
              <Sparkles size={12} className="text-[#F0B429]" />
              <span>Sugerencias Rápidas</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(presets as any)[variantType]?.map((item: any) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleApplyPreset(item)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: variantName === item.name ? "rgba(240,180,41,0.20)" : "#1C2333",
                    border: `1px solid ${variantName === item.name ? "rgba(240,180,41,0.40)" : "#30363D"}`,
                    color: variantName === item.name ? "#F0B429" : "#E6EDF3",
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre de la Variante */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
              Nombre Comercial de la Variante *
            </label>
            <input
              type="text"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              placeholder="Ej. Porción Doble XL, Mocktail Virgen, Con Gin Mare..."
              className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
              style={{ background: "#1C2333", border: "1px solid #30363D", color: "#E6EDF3" }}
            />
          </div>

          {/* ══════════════════════════════════════════════════════════════
              DETALLE SEGÚN EJE DE VARIANTE
          ══════════════════════════════════════════════════════════════ */}

          {/* 1. MODO TAMAÑO / ESCANDALLO */}
          {variantType === "size" && (
            <div className="p-4 rounded-xl space-y-3" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B949E]">
                  <SlidersHorizontal size={13} className="text-[#F0B429]" />
                  <span>Multiplicador de Escandallo</span>
                </div>
                <span className="text-xs font-black text-[#F0B429]">{multiplier}x cantidades</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "0.5x (50%)", val: 0.5 },
                  { label: "1.0x (Base)", val: 1.0 },
                  { label: "1.5x (XL)", val: 1.5 },
                  { label: "2.0x (Doble)", val: 2.0 },
                ].map((btn) => (
                  <button
                    key={btn.val}
                    type="button"
                    onClick={() => setMultiplier(btn.val)}
                    className="py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: multiplier === btn.val ? "#F0B429" : "#161B22",
                      color: multiplier === btn.val ? "#0D1117" : "#8B949E",
                      border: "1px solid #30363D",
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. MODO SUSTITUCIÓN DE INSUMOS */}
          {variantType === "spirit" && (
            <div className="p-4 rounded-xl space-y-3" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B949E]">
                  <Repeat size={13} className="text-[#388BFD]" />
                  <span>Sustitución de Insumo Base</span>
                </div>
                <span className="text-[11px] text-[#8B949E]">Selecciona insumo a sustituir</span>
              </div>

              {/* Lista de insumos de la receta madre */}
              <div className="space-y-2">
                {(parentRecipe.ingredients || []).map((ing, idx) => {
                  const invId = (ing.inventoryItem?._id || ing.inventoryItem)?.toString();
                  const invName =
                    typeof ing.inventoryItem === "object"
                      ? ing.inventoryItem.name
                      : inventoryItems.find((i) => i._id === invId)?.name || "Insumo";
                  const rep = replacements[invId];

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg flex flex-col gap-2"
                      style={{ background: "#161B22", border: "1px solid #30363D" }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-[#E6EDF3]">{invName}</p>
                          <p className="text-[10px] text-[#8B949E]">
                            Original: {ing.quantity} {ing.unit}
                          </p>
                        </div>

                        {rep ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[#3FB950] flex items-center gap-1">
                              <Repeat size={11} /> Reemplazado por: {rep.newItemName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveReplacement(invId)}
                              className="p-1 text-[#8B949E] hover:text-[#F85149]"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReplacingItemId(invId);
                              setInventorySearch("");
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 text-[#388BFD] hover:bg-[#21283A] transition-colors"
                          >
                            <Repeat size={12} />
                            Sustituir
                          </button>
                        )}
                      </div>

                      {/* Si está activo el selector para este insumo */}
                      {activeReplacingItemId === invId && (
                        <div className="pt-2 border-t border-[#30363D] space-y-2">
                          <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                            <input
                              type="text"
                              value={inventorySearch}
                              onChange={(e) => setInventorySearch(e.target.value)}
                              placeholder="Buscar reemplazo en Bóveda..."
                              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
                              style={{ background: "#1C2333", border: "1px solid #30363D", color: "#E6EDF3" }}
                            />
                          </div>

                          {filteredInventory.length > 0 && (
                            <div className="p-1 rounded-lg max-h-36 overflow-y-auto space-y-1" style={{ background: "#1C2333" }}>
                              {filteredInventory.map((item) => (
                                <button
                                  key={item._id}
                                  type="button"
                                  onClick={() => handleSelectReplacement(invId, ing.quantity, ing.unit, item)}
                                  className="w-full text-left p-2 rounded text-xs flex items-center justify-between hover:bg-[#21283A]"
                                >
                                  <span className="font-semibold text-[#E6EDF3]">{item.name}</span>
                                  <span className="text-[10px] text-[#F0B429]">${item.cost}/{item.unit}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Si ya fue reemplazado, permitir ajustar cantidad y unidad */}
                      {rep && (
                        <div className="pt-2 border-t border-[#30363D] flex items-center gap-3">
                          <span className="text-[11px] text-[#8B949E]">Nueva medida:</span>
                          <input
                            type="number"
                            min="1"
                            value={rep.quantity}
                            onChange={(e) =>
                              handleUpdateReplacementQty(invId, Number(e.target.value), rep.unit)
                            }
                            className="w-16 px-2 py-1 rounded text-xs text-center font-bold font-mono outline-none"
                            style={{ background: "#1C2333", border: "1px solid #30363D", color: "#F0B429" }}
                          />
                          <select
                            value={rep.unit}
                            onChange={(e) =>
                              handleUpdateReplacementQty(invId, rep.quantity, e.target.value)
                            }
                            className="px-2 py-1 rounded text-xs outline-none"
                            style={{ background: "#1C2333", border: "1px solid #30363D", color: "#E6EDF3" }}
                          >
                            <option value="ml">ml</option>
                            <option value="cl">cl</option>
                            <option value="oz">oz</option>
                            <option value="g">g</option>
                            <option value="unit">unit</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. MODO ADAPTACIÓN DIETARIA / MOCKTAIL */}
          {variantType === "dietary" && (
            <div className="p-4 rounded-xl space-y-3" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B949E]">
                  <Leaf size={13} className="text-[#3FB950]" />
                  <span>Adaptación Dietaria & Exclusión de Insumos</span>
                </div>
                <span className="text-[11px] text-[#8B949E]">Desmarca insumos a excluir</span>
              </div>

              {/* Badges de Distinción Dietaria */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8B949E] block">
                  Distintivo de la Variante
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Sin Alcohol / Virgen",
                    "Sin TACC / Gluten-Free",
                    "100% Apto Vegano",
                    "Sin Lactosa",
                    "Keto / Sin Azúcar",
                  ].map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => setDietaryBadge(badge)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                      style={{
                        background: dietaryBadge === badge ? "rgba(63,185,80,0.20)" : "#161B22",
                        border: `1px solid ${dietaryBadge === badge ? "#3FB950" : "#30363D"}`,
                        color: dietaryBadge === badge ? "#3FB950" : "#8B949E",
                      }}
                    >
                      <ShieldCheck size={12} />
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles de Exclusión de Insumos */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8B949E] block">
                  Insumos de la Ficha Maestra
                </label>
                <div className="space-y-1.5">
                  {(parentRecipe.ingredients || []).map((ing, idx) => {
                    const invId = (ing.inventoryItem?._id || ing.inventoryItem)?.toString();
                    const invName =
                      typeof ing.inventoryItem === "object"
                        ? ing.inventoryItem.name
                        : inventoryItems.find((i) => i._id === invId)?.name || "Insumo";
                    const isExcluded = excludedItemIds.includes(invId);

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleExcludeIngredient(invId)}
                        className="p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                        style={{
                          background: isExcluded ? "rgba(248,81,73,0.10)" : "#161B22",
                          border: `1px solid ${isExcluded ? "rgba(248,81,73,0.30)" : "#30363D"}`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold"
                            style={{
                              background: isExcluded ? "#F85149" : "#3FB950",
                              color: "#0D1117",
                            }}
                          >
                            {isExcluded ? "✕" : "✓"}
                          </span>
                          <span className={`text-xs font-semibold ${isExcluded ? "line-through text-[#8B949E]" : "text-[#E6EDF3]"}`}>
                            {invName} ({ing.quantity} {ing.unit})
                          </span>
                        </div>
                        <span className="text-[10px] font-bold" style={{ color: isExcluded ? "#F85149" : "#3FB950" }}>
                          {isExcluded ? "Excluido" : "Activo"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Panel Financiero Dinámico */}
          <div className="p-4 rounded-xl grid grid-cols-3 gap-3" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E]">Costo Insumos</p>
              <p className="text-lg font-black text-[#F0B429]">${calculatedCost.toFixed(1)}</p>
              <p className="text-[10px] text-[#8B949E]">Base: ${baseCost.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E]">Delta PVP ($)</p>
              <input
                type="number"
                value={priceModifier}
                onChange={(e) => setPriceModifier(Number(e.target.value))}
                className="w-full px-2 py-1 rounded text-xs font-bold font-mono outline-none mt-1"
                style={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E]">Precio POS Final</p>
              <p className="text-lg font-black text-[#388BFD]">${finalSalePrice.toLocaleString("es-AR")}</p>
              <p className={`text-[11px] font-bold ${grossMargin >= 40 ? "text-[#3FB950]" : "text-[#F0B429]"}`}>
                {grossMargin}% margen
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-4 shrink-0" style={{ borderTop: "1px solid #30363D" }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg disabled:opacity-50"
            style={{ background: "#F0B429", color: "#0D1117" }}
          >
            <Check size={14} />
            {saving ? "Creando..." : "Crear Variante"}
          </button>
        </div>
      </div>
    </div>
  );
}
