"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Wine,
  ChefHat,
  Package,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  AlertCircle,
  Clock,
  Layers,
  GlassWater,
  Flame,
  Snowflake,
} from "lucide-react";
import type { Recipe } from "../types/recipe";
import type { RecipeIngredient } from "../types/ingredient";
import type { RecipeStep } from "../types/step";
import { getProducts } from "../../products/services/productService";
import { getInventory } from "../../inventory/services/inventoryService";
import type { Product } from "../../../types/product";
import type { InventoryItem } from "../../inventory/types/inventory";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipeData: Recipe) => Promise<void>;
  recipeToEdit?: Recipe | null;
  defaultStation?: "drink" | "food";
}

const DRINK_TECHNIQUES = [
  { id: "shake", label: "Shake (Batido con shaker)", icon: "🍸" },
  { id: "stir", label: "Stir (Revuelto en vaso mezclador)", icon: "🥄" },
  { id: "build", label: "Build (Construido directo en vaso)", icon: "🧊" },
  { id: "blend", label: "Blend (Licuado frozen)", icon: "🌪️" },
  { id: "muddle", label: "Muddle (Macerado mortero)", icon: "🍋" },
  { id: "smoke", label: "Smoke (Ahumado artesanal)", icon: "💨" },
  { id: "roll", label: "Throwing / Roll (Oxigenado)", icon: "🔄" },
];

const FOOD_TECHNIQUES = [
  { id: "grill", label: "Parrilla / Josper", icon: "🔥" },
  { id: "saute", label: "Salteado en Wok", icon: "🍳" },
  { id: "oven", label: "Horno de Convección", icon: "♨️" },
  { id: "sous-vide", label: "Sous-Vide (Baja Temp)", icon: "🌡️" },
  { id: "fryer", label: "Fritura Crujiente", icon: "🍟" },
  { id: "cold", label: "Emplatado en Frío", icon: "🥗" },
];

const DRINK_GLASSWARE = [
  "Copa Coupe",
  "Vaso Old Fashioned",
  "Copa Collins / Highball",
  "Copa Martini",
  "Vaso Tiki",
  "Copa Flauta",
  "Shot / Degustación",
];

const FOOD_DISHWARE = [
  "Plato Llano 28cm",
  "Plato Hondo Cerámica",
  "Cazuela de Hierro Fundido",
  "Tabla Rústica de Madera",
  "Bowl de Ensalada",
  "Cesta Freidora",
];

export default function RecipeBuilderModal({
  isOpen,
  onClose,
  onSave,
  recipeToEdit,
  defaultStation = "drink",
}: Props) {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [station, setStation] = useState<"drink" | "food">(
    recipeToEdit?.type || defaultStation
  );

  // Form states
  const [selectedProductId, setSelectedProductId] = useState<string>(
    typeof recipeToEdit?.product === "object"
      ? recipeToEdit.product._id
      : (recipeToEdit?.product as string) || ""
  );
  const [category, setCategory] = useState<string>(
    recipeToEdit?.category || (station === "drink" ? "Cócteles Clásicos" : "Platos Principales")
  );
  const [method, setMethod] = useState<string>(recipeToEdit?.method || "shake");
  const [glassware, setGlassware] = useState<string>(
    typeof recipeToEdit?.specifications?.glassware === "string"
      ? recipeToEdit.specifications.glassware
      : (recipeToEdit?.specifications?.glassware as any)?.name ||
          (station === "drink" ? "Copa Coupe" : "Plato Llano 28cm")
  );
  const [ice, setIce] = useState<string>(
    typeof recipeToEdit?.specifications?.ice === "string"
      ? recipeToEdit.specifications.ice
      : "Hielo Macizo 5x5"
  );
  const [garnish, setGarnish] = useState<string>(
    recipeToEdit?.specifications?.decorations?.map((d: any) =>
      typeof d === "string" ? d : d.name
    ).join(", ") || ""
  );
  const [imageUrl, setImageUrl] = useState<string>(recipeToEdit?.image || "");

  // Ingredients and Steps
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    recipeToEdit?.ingredients || []
  );
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>(
    recipeToEdit?.steps || [{ stepNumber: 1, instruction: "" }]
  );

  // External data
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventorySearch, setInventorySearch] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products and inventory
  useEffect(() => {
    async function loadResources() {
      try {
        setLoadingData(true);
        const [prodList, invList] = await Promise.all([
          getProducts(),
          getInventory({ limit: 150 }),
        ]);
        setProducts(prodList);
        setInventoryItems(invList);
      } catch (err) {
        console.warn("Could not load products or inventory:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadResources();
  }, []);

  // Filtered inventory for searching
  const filteredInventory = useMemo(() => {
    if (!inventorySearch.trim()) return [];
    const q = inventorySearch.toLowerCase();
    return inventoryItems
      .filter((item) => item.name?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [inventoryItems, inventorySearch]);

  // Selected product object
  const selectedProduct = useMemo(() => {
    return products.find((p) => p._id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Real-time escandallo cost calculation
  const totalCost = useMemo(() => {
    return ingredients.reduce((sum, ing) => {
      const inv =
        typeof ing.inventoryItem === "object" && ing.inventoryItem
          ? (ing.inventoryItem as any)
          : inventoryItems.find((x) => x._id === ing.inventoryItem);

      if (!inv || !inv.cost) return sum;

      // Normalize cost according to unit
      const unit = ing.unit || "ml";
      let costPerUnit = inv.cost;
      if (unit === "ml" || unit === "g") {
        costPerUnit = inv.cost / 1000;
      } else if (unit === "oz") {
        costPerUnit = (inv.cost / 1000) * 29.57;
      }
      return sum + costPerUnit * ing.quantity;
    }, 0);
  }, [ingredients, inventoryItems]);

  const price = selectedProduct?.price || 0;
  const margin = price > 0 ? Math.round(((price - totalCost) / price) * 100) : 0;
  const marginColor =
    margin >= 70 ? "text-emerald" : margin >= 50 ? "text-gold" : "text-red";

  // Handlers for ingredients
  const handleAddIngredient = (invItem: InventoryItem) => {
    // Check if already in recipe
    const exists = ingredients.some((i) => {
      const id = typeof i.inventoryItem === "object" ? i.inventoryItem._id : i.inventoryItem;
      return id === invItem._id;
    });

    if (exists) return;

    const defaultUnit: any =
      invItem.unit === "l" ? "ml" : invItem.unit === "kg" ? "g" : "unit";
    const defaultQty = defaultUnit === "ml" ? 45 : defaultUnit === "g" ? 100 : 1;

    setIngredients([
      ...ingredients,
      {
        inventoryItem: {
          _id: invItem._id || "",
          name: invItem.name,
          cost: invItem.cost,
          stock: invItem.stock,
          unit: invItem.unit,
        },
        quantity: defaultQty,
        unit: defaultUnit,
        order: ingredients.length + 1,
      },
    ]);
    setInventorySearch("");
  };

  const handleUpdateIngredient = (index: number, field: "quantity" | "unit", value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Handlers for steps
  const handleAddStep = () => {
    setRecipeSteps([
      ...recipeSteps,
      { stepNumber: recipeSteps.length + 1, instruction: "" },
    ]);
  };

  const handleUpdateStep = (index: number, text: string) => {
    const updated = [...recipeSteps];
    updated[index] = { ...updated[index], instruction: text };
    setRecipeSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    const updated = recipeSteps.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
    }));
    setRecipeSteps(updated);
  };

  // Submit
  const handleSubmit = async () => {
    if (!selectedProductId) {
      setError("Debes seleccionar un producto del catálogo POS.");
      setStep(1);
      return;
    }

    if (ingredients.length === 0) {
      setError("Debes agregar al menos 1 insumo de inventario a la ficha.");
      setStep(2);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: Recipe = {
        _id: recipeToEdit?._id,
        product: {
          _id: selectedProductId,
          name: selectedProduct?.name || "Producto",
          price: selectedProduct?.price || 0,
          type: station,
        },
        type: station,
        category: category.trim(),
        method,
        image: imageUrl.trim() || undefined,
        totalCost: Math.round(totalCost),
        isPrimary: recipeToEdit?.isPrimary !== undefined ? recipeToEdit.isPrimary : true,
        variantName: recipeToEdit?.variantName || "",
        parentId: recipeToEdit?.parentId || undefined,
        specifications: {
          glassware,
          ice: station === "drink" ? ice : undefined,
          decorations: garnish
            ? garnish.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        },
        ingredients: ingredients.map((ing, idx) => ({
          inventoryItem:
            typeof ing.inventoryItem === "object"
              ? ing.inventoryItem
              : { _id: ing.inventoryItem as string, name: "Insumo" },
          quantity: Number(ing.quantity),
          unit: ing.unit,
          order: idx + 1,
        })),
        steps: recipeSteps
          .filter((s) => s.instruction.trim().length > 0)
          .map((s, idx) => ({
            stepNumber: idx + 1,
            instruction: s.instruction.trim(),
          })),
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al guardar la ficha técnica.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-background/85 backdrop-blur-sm transition-opacity"
      />

      <div className="relative bg-surface-card border border-border/70 rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-6 z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                station === "drink"
                  ? "bg-cyan/15 text-cyan border-cyan/30"
                  : "bg-amber/15 text-amber border-amber/30"
              }`}
            >
              {station === "drink" ? (
                <Wine className="w-5 h-5" />
              ) : (
                <ChefHat className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {recipeToEdit ? "Editar Ficha Técnica" : "Nueva Ficha Técnica"}
              </h3>
              <p className="text-xs text-text-muted">
                {station === "drink" ? "Estación de Barra" : "Estación de Cocina"} —
                Escandallo y Protocolo Operativo
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

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
              step === 1
                ? "bg-gold/15 text-gold border-gold/40"
                : "bg-surface-dark/50 text-text-muted border-border/50 hover:text-text-primary"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-surface-dark border border-current flex items-center justify-center text-[10px]">
              1
            </span>
            Identidad & Producto
          </button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
              step === 2
                ? "bg-gold/15 text-gold border-gold/40"
                : "bg-surface-dark/50 text-text-muted border-border/50 hover:text-text-primary"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-surface-dark border border-current flex items-center justify-center text-[10px]">
              2
            </span>
            Escandallo Insumos ({ingredients.length})
          </button>

          <button
            type="button"
            onClick={() => setStep(3)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
              step === 3
                ? "bg-gold/15 text-gold border-gold/40"
                : "bg-surface-dark/50 text-text-muted border-border/50 hover:text-text-primary"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-surface-dark border border-current flex items-center justify-center text-[10px]">
              3
            </span>
            Técnicas & Protocolo
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red/10 border border-red/30 text-xs text-red flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body with internal scrolling */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {/* STEP 1: Identidad & Producto */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Station Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  Estación Operativa *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStation("drink");
                      setMethod("shake");
                      setGlassware("Copa Coupe");
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      station === "drink"
                        ? "bg-cyan/15 text-cyan border-cyan/40 shadow-sm"
                        : "bg-surface-dark/50 text-text-muted border-border/60 hover:text-text-primary"
                    }`}
                  >
                    <Wine className="w-5 h-5" />
                    <div className="text-left">
                      <span className="text-xs font-bold block">🍸 Barra & Cócteles</span>
                      <span className="text-[11px] opacity-75">
                        Bebidas, destilados, cafés y mocktails
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStation("food");
                      setMethod("grill");
                      setGlassware("Plato Llano 28cm");
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      station === "food"
                        ? "bg-amber/15 text-amber border-amber/40 shadow-sm"
                        : "bg-surface-dark/50 text-text-muted border-border/60 hover:text-text-primary"
                    }`}
                  >
                    <ChefHat className="w-5 h-5" />
                    <div className="text-left">
                      <span className="text-xs font-bold block">🍳 Cocina & Platos</span>
                      <span className="text-[11px] opacity-75">
                        Platos calientes, fríos, tapas y postres
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Product Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  Producto Asociado en Menú POS *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold/50 cursor-pointer"
                >
                  <option value="">-- Seleccionar producto de la carta --</option>
                  {products
                    .filter((p) => !p.type || p.type === station)
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — ${p.price?.toLocaleString() || 0} ({p.category || "General"})
                      </option>
                    ))}
                </select>
                {selectedProduct && (
                  <div className="p-3 bg-surface-dark/50 rounded-xl border border-border/50 flex items-center justify-between text-xs">
                    <span className="text-text-muted">
                      Precio de Venta registrado en POS:
                    </span>
                    <span className="font-bold text-gold font-mono">
                      ${selectedProduct.price?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  Categoría de Carta *
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={station === "drink" ? "Cócteles Clásicos, Gin Tonic..." : "Hamburguesas, Postres..."}
                  className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  URL de Imagen (Opcional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold/50"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Escandallo Insumos */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Financial KPI Banner */}
              <div className="grid grid-cols-3 gap-3 bg-surface-dark/70 rounded-xl p-3 border border-border/60">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-text-muted uppercase font-medium block">
                    Costo Insumos
                  </span>
                  <span className="text-base font-bold text-text-primary font-mono">
                    ${Math.round(totalCost).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-text-muted uppercase font-medium block">
                    Precio Venta
                  </span>
                  <span className="text-base font-bold text-text-primary font-mono">
                    ${price.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-text-muted uppercase font-medium block">
                    Margen Estimado
                  </span>
                  <span className={`text-base font-bold font-mono ${marginColor}`}>
                    {margin}%
                  </span>
                </div>
              </div>

              {/* Search Inventory Add Bar */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block flex items-center justify-between">
                  <span>Buscar Insumos en Bóveda</span>
                  <span className="text-[11px] text-text-muted font-normal">
                    {inventoryItems.length} insumos disponibles
                  </span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Escribe para buscar (Ej. Gin, Jugo, Limón, Miel, Carne)..."
                    className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-gold/50"
                  />
                </div>

                {/* Dropdown Results */}
                {filteredInventory.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-surface-card border border-border/70 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-border/50 max-h-48 overflow-y-auto">
                    {filteredInventory.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleAddIngredient(item)}
                        className="p-2.5 flex items-center justify-between hover:bg-surface-hover cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-gold" />
                          <span className="font-semibold text-text-primary">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-text-muted">
                            (Stock: {item.stock} {item.unit})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-text-muted">
                            ${item.cost?.toLocaleString() || 0} / {item.unit}
                          </span>
                          <span className="text-gold font-bold text-xs">+ Agregar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Added Ingredients Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Insumos de la Ficha ({ingredients.length})
                </h4>

                {ingredients.length > 0 ? (
                  <div className="border border-border/60 rounded-xl overflow-hidden divide-y divide-border/40 bg-surface-dark/30">
                    {ingredients.map((ing, idx) => {
                      const item =
                        typeof ing.inventoryItem === "object"
                          ? ing.inventoryItem
                          : null;
                      return (
                        <div
                          key={idx}
                          className="p-3 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex-1">
                            <span className="font-semibold text-text-primary block">
                              {item?.name || "Insumo"}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              Stock: {item?.stock || 0} {item?.unit || ""}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0.1"
                              step="any"
                              value={ing.quantity}
                              onChange={(e) =>
                                handleUpdateIngredient(
                                  idx,
                                  "quantity",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 text-xs bg-surface-card text-text-primary border border-border/60 rounded-lg px-2.5 py-1.5 font-mono text-right focus:outline-none focus:border-gold/50"
                            />

                            <select
                              value={ing.unit}
                              onChange={(e) =>
                                handleUpdateIngredient(idx, "unit", e.target.value)
                              }
                              className="text-xs bg-surface-card text-text-primary border border-border/60 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-gold/50"
                            >
                              <option value="ml">ml</option>
                              <option value="oz">oz</option>
                              <option value="g">g</option>
                              <option value="kg">kg</option>
                              <option value="unit">unid</option>
                              <option value="portion">porción</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(idx)}
                              className="p-1.5 text-text-muted hover:text-red rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-text-muted border border-dashed border-border/60 rounded-xl bg-surface-dark/30">
                    No has agregado insumos aún. Utiliza el buscador arriba para añadir insumos de la Bóveda.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Técnicas & Protocolo */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Integrated Techniques Chips */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  Técnica / Método de Elaboración *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(station === "drink" ? DRINK_TECHNIQUES : FOOD_TECHNIQUES).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMethod(t.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 text-left transition-all ${
                        method === t.id
                          ? "bg-gold/15 text-gold border-gold/40 shadow-sm"
                          : "bg-surface-dark/50 text-text-muted border-border/50 hover:text-text-primary"
                      }`}
                    >
                      <span className="text-base">{t.icon}</span>
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Glassware / Dishware Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  {station === "drink" ? "Cristalería Sugerida" : "Vajilla de Servicio"} *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(station === "drink" ? DRINK_GLASSWARE : FOOD_DISHWARE).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGlassware(g)}
                      className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                        glassware === g
                          ? "bg-cyan/15 text-cyan border-cyan/40 font-semibold"
                          : "bg-surface-dark/50 text-text-muted border-border/50 hover:text-text-primary"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drink Specific: Ice */}
              {station === "drink" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                    Servicio de Hielo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Hielo Macizo 5x5",
                      "Esfera de Hielo",
                      "Hielo Picado / Frappé",
                      "Cubos Estándar",
                      "Sin Hielo / Neat",
                    ].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIce(i)}
                        className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                          ice === i
                            ? "bg-gold/15 text-gold border-gold/40 font-semibold"
                            : "bg-surface-dark/50 text-text-muted border-border/50 hover:text-text-primary"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Garnish */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  {station === "drink" ? "Garnish / Decoración" : "Emplatado / Topping"}
                </label>
                <input
                  type="text"
                  value={garnish}
                  onChange={(e) => setGarnish(e.target.value)}
                  placeholder="Ej. Twist de limón, ramillete de hierbabuena, sal ahumada..."
                  className="w-full text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Preparation Steps 1..N */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                    Pasos de Elaboración ({recipeSteps.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="inline-flex items-center gap-1 text-xs text-gold hover:underline font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Paso
                  </button>
                </div>

                <div className="space-y-2">
                  {recipeSteps.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-surface-dark border border-border/60 text-gold text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={st.instruction}
                        onChange={(e) => handleUpdateStep(idx, e.target.value)}
                        placeholder={`Instrucción para el paso ${idx + 1}...`}
                        className="flex-1 text-xs bg-surface-dark/80 text-text-primary border border-border/60 rounded-xl px-3 py-2 focus:outline-none focus:border-gold/50"
                      />
                      {recipeSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="p-1.5 text-text-muted hover:text-red transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4 shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-surface-dark/80 hover:bg-surface-hover text-text-primary border border-border/60 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-surface-card hover:bg-surface-hover text-text-primary border border-border/60 transition-colors"
            >
              Cancelar
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-5 py-2 rounded-xl text-xs font-medium bg-gold hover:bg-gold-hover text-surface-dark font-semibold transition-colors flex items-center gap-1.5"
              >
                Siguiente
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 rounded-xl text-xs font-semibold bg-gold hover:bg-gold-hover text-surface-dark transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {saving ? "Guardando Ficha..." : "Guardar Ficha Técnica"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

