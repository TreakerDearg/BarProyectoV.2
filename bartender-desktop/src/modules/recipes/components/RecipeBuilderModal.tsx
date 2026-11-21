"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
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
  RotateCcw,
  Zap,
  Crosshair,
  RefreshCw,
  UtensilsCrossed,
  Sliders,
  Thermometer,
  Square,
  CircleDot,
  Shield,
  Link as LinkIcon,
  HelpCircle,
  ChevronUp,
  ChevronDown,
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
  onSave: (recipeData: any) => Promise<void>;
  recipeToEdit?: Recipe | null;
  defaultStation?: "drink" | "food";
}

// ── Técnicas Profesionales con Lucide React (Sin Emojis) ──────────────────────────
const DRINK_TECHNIQUES = [
  { id: "shake", label: "Shake", sub: "Batido en coctelera", icon: Wine },
  { id: "stir", label: "Stir", sub: "Revuelto en vaso mezclador", icon: RotateCcw },
  { id: "build", label: "Build", sub: "Directo en vaso", icon: Layers },
  { id: "blend", label: "Blend", sub: "Licuado frozen", icon: Zap },
  { id: "muddle", label: "Muddle", sub: "Macerado con mortero", icon: Crosshair },
  { id: "smoke", label: "Smoke", sub: "Ahumado artesanal", icon: Flame },
  { id: "roll", label: "Throwing / Roll", sub: "Escanciado oxigenado", icon: RefreshCw },
];

const FOOD_TECHNIQUES = [
  { id: "grill", label: "Parrilla / Josper", sub: "Fuego directo", icon: Flame },
  { id: "saute", label: "Salteado Wok", sub: "Alta temperatura", icon: UtensilsCrossed },
  { id: "oven", label: "Horno Convección", sub: "Cocción envolvente", icon: Sliders },
  { id: "sous-vide", label: "Sous-Vide", sub: "Baja temperatura", icon: Thermometer },
  { id: "fryer", label: "Fritura Crujiente", sub: "Inmersión en aceite", icon: Sparkles },
  { id: "cold", label: "Emplatado en Frío", sub: "Preparación fresca", icon: Snowflake },
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

const ICE_SERVICES = [
  { id: "Hielo Macizo 5x5", label: "Hielo Macizo 5x5", icon: Square },
  { id: "Esfera de Hielo", label: "Esfera de Hielo", icon: CircleDot },
  { id: "Hielo Picado / Frappé", label: "Hielo Picado / Frappé", icon: Snowflake },
  { id: "Cubos Estándar", label: "Cubos Estándar", icon: Square },
  { id: "Sin Hielo / Neat", label: "Sin Hielo / Neat", icon: Shield },
];

const CATEGORY_PRESETS_DRINK = [
  "Cócteles Clásicos",
  "Firma del Bar",
  "Aperitivos & Vermut",
  "Gintonería",
  "Sin Alcohol / Mocktails",
  "Cervezas & Vinos",
];

const CATEGORY_PRESETS_FOOD = [
  "Para Picar / Entradas",
  "Platos Principales",
  "Hamburguesas & Sandwiches",
  "Tapas del Bar",
  "Guarniciones",
  "Postres",
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

  // Modo de vinculación POS
  const [posMode, setPosMode] = useState<"auto_create" | "link_existing">(
    recipeToEdit?.product ? "link_existing" : "auto_create"
  );
  const [recipeName, setRecipeName] = useState<string>(
    typeof recipeToEdit?.product === "object"
      ? recipeToEdit.product.name
      : (recipeToEdit as any)?.name || ""
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(
    typeof recipeToEdit?.product === "object"
      ? recipeToEdit.product._id
      : (recipeToEdit?.product as string) || ""
  );
  const [manualSalePrice, setManualSalePrice] = useState<number>(
    typeof recipeToEdit?.product === "object" && recipeToEdit.product.price
      ? recipeToEdit.product.price
      : 2500
  );

  const [category, setCategory] = useState<string>(
    recipeToEdit?.category || (station === "drink" ? "Cócteles Clásicos" : "Para Picar / Entradas")
  );
  const [method, setMethod] = useState<string>(
    recipeToEdit?.method || (station === "drink" ? "shake" : "grill")
  );
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

  // Ingredientes y Pasos
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    recipeToEdit?.ingredients || []
  );
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>(
    recipeToEdit?.steps || [{ stepNumber: 1, instruction: "" }]
  );

  // Datos externos
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventorySearch, setInventorySearch] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial
  useEffect(() => {
    async function loadResources() {
      try {
        setLoadingData(true);
        const [prodList, invList] = await Promise.all([
          getProducts(),
          getInventory({ limit: 200 }),
        ]);
        setProducts(Array.isArray(prodList) ? prodList : []);
        setInventoryItems(Array.isArray(invList) ? invList : []);
      } catch (err) {
        console.warn("Could not load products or inventory:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadResources();
  }, []);

  // Sincronizar producto seleccionado si existe
  const selectedProduct = useMemo(
    () => products.find((p) => p._id === selectedProductId),
    [products, selectedProductId]
  );

  useEffect(() => {
    if (selectedProduct) {
      if (!recipeName) setRecipeName(selectedProduct.name);
      if (selectedProduct.price) setManualSalePrice(selectedProduct.price);
      if (selectedProduct.category) setCategory(selectedProduct.category);
    }
  }, [selectedProduct]);

  // Helper seguro para extraer ID de insumo
  const getInventoryItemId = (item: any): string => {
    if (!item) return "";
    if (typeof item === "object") return item._id || "";
    return String(item);
  };

  // Cálculo del Costo Total del Escandallo
  const totalCost = useMemo(() => {
    return ingredients.reduce((sum, ing) => {
      const invId = getInventoryItemId(ing.inventoryItem);
      const inv =
        typeof ing.inventoryItem === "object" && ing.inventoryItem && typeof (ing.inventoryItem as any).cost === "number"
          ? (ing.inventoryItem as any)
          : inventoryItems.find((i) => i._id === invId);

      if (!inv || typeof inv.cost !== "number") return sum;

      const unit = (ing.unit || "").toLowerCase();
      const invUnit = (inv.unit || "").toLowerCase();
      let costPerUnit = inv.cost;

      if (invUnit === "l" && unit === "ml") costPerUnit = inv.cost / 1000;
      else if (invUnit === "kg" && unit === "g") costPerUnit = inv.cost / 1000;
      else if (invUnit === "l" && unit === "cl") costPerUnit = inv.cost / 100;

      return sum + Number(ing.quantity) * costPerUnit;
    }, 0);
  }, [ingredients, inventoryItems]);

  const grossMargin = useMemo(() => {
    if (manualSalePrice <= 0) return 0;
    return Math.round(((manualSalePrice - totalCost) / manualSalePrice) * 100);
  }, [manualSalePrice, totalCost]);

  // Filtrado de inventario
  const filteredInventory = useMemo(() => {
    if (!inventorySearch.trim()) return [];
    const q = inventorySearch.toLowerCase().trim();
    return inventoryItems
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [inventoryItems, inventorySearch]);

  // Handlers de ingredientes
  const handleAddIngredient = (invItem: InventoryItem) => {
    const exists = ingredients.some((i) => getInventoryItemId(i.inventoryItem) === invItem._id);

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

  // Handlers de pasos de elaboración
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

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= recipeSteps.length) return;
    const updated = [...recipeSteps];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setRecipeSteps(updated.map((s, idx) => ({ ...s, stepNumber: idx + 1 })));
  };

  const handleRemoveStep = (index: number) => {
    const updated = recipeSteps
      .filter((_, i) => i !== index)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setRecipeSteps(updated);
  };

  // Submit
  const handleSubmit = async () => {
    const finalName = (posMode === "link_existing" ? selectedProduct?.name : recipeName) || "";
    if (!finalName.trim()) {
      setError("Debes indicar un nombre para la receta o producto.");
      setStep(1);
      return;
    }

    if (posMode === "link_existing" && !selectedProductId) {
      setError("Debes seleccionar un producto existente del catálogo.");
      setStep(1);
      return;
    }

    if (ingredients.length === 0) {
      setError("Debes agregar al menos 1 insumo de inventario al escandallo.");
      setStep(2);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: any = {
        _id: recipeToEdit?._id,
        product: posMode === "link_existing" ? selectedProductId : undefined,
        autoCreateProduct: posMode === "auto_create",
        productName: finalName.trim(),
        productPrice: manualSalePrice,
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
              ? ing.inventoryItem._id
              : ing.inventoryItem,
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
      setError(err?.message || "Ocurrió un error al guardar la receta.");
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

      {/* Contenedor Modal Slate Elegante */}
      <div
        className="relative rounded-2xl shadow-2xl max-w-4xl w-full p-6 space-y-5 z-10 max-h-[92vh] flex flex-col"
        style={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
      >
        {/* Header con Stepper */}
        <div className="flex items-center justify-between pb-4 shrink-0" style={{ borderBottom: "1px solid #30363D" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
              style={{
                background: station === "drink" ? "rgba(56,139,253,0.15)" : "rgba(240,180,41,0.15)",
                color: station === "drink" ? "#388BFD" : "#F0B429",
                border: `1px solid ${station === "drink" ? "rgba(56,139,253,0.30)" : "rgba(240,180,41,0.30)"}`,
              }}
            >
              {station === "drink" ? <Wine size={20} /> : <ChefHat size={20} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E6EDF3]">
                {recipeToEdit ? "Editar Receta & Escandallo" : "Nueva Receta & Escandallo"}
              </h3>
              <p className="text-xs text-[#8B949E]">
                {station === "drink" ? "Estación Barra & Cócteles" : "Estación Cocina & Gastronomía"} — Escandallo y Protocolo
              </p>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: "Identidad & POS" },
              { num: 2, label: `Escandallo (${ingredients.length})` },
              { num: 3, label: "Protocolo & Pasos" },
            ].map((s) => {
              const active = step === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num as any)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                  style={{
                    background: active ? "rgba(240,180,41,0.18)" : "#1C2333",
                    border: `1px solid ${active ? "rgba(240,180,41,0.40)" : "#30363D"}`,
                    color: active ? "#F0B429" : "#8B949E",
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black"
                    style={{
                      background: active ? "#F0B429" : "#30363D",
                      color: active ? "#0D1117" : "#8B949E",
                    }}
                  >
                    {s.num}
                  </span>
                  <span>{s.label}</span>
                </button>
              );
            })}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] transition-colors ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mensaje de error si ocurre */}
        {error && (
          <div className="p-3 rounded-xl bg-[rgba(248,81,73,0.12)] border border-[rgba(248,81,73,0.30)] flex items-center gap-2 text-xs text-[#F85149]">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Cuerpo del Modal con Scroll */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* ══════════════════════════════════════════════════════════════
              PASO 1: Identidad & Vinculación POS
          ══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Selector de Estación */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStation("drink")}
                  className="p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left"
                  style={{
                    background: station === "drink" ? "rgba(56,139,253,0.15)" : "#1C2333",
                    borderColor: station === "drink" ? "#388BFD" : "#30363D",
                  }}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "rgba(56,139,253,0.15)", color: "#388BFD" }}
                  >
                    <Wine size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#E6EDF3]">Barra & Cócteles</p>
                    <p className="text-[11px] text-[#8B949E]">Bebidas, destilados, cafés y mocktails</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStation("food")}
                  className="p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left"
                  style={{
                    background: station === "food" ? "rgba(240,180,41,0.15)" : "#1C2333",
                    borderColor: station === "food" ? "#F0B429" : "#30363D",
                  }}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "rgba(240,180,41,0.15)", color: "#F0B429" }}
                  >
                    <ChefHat size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#E6EDF3]">Cocina & Platos</p>
                    <p className="text-[11px] text-[#8B949E]">Platos calientes, fríos, tapas y postres</p>
                  </div>
                </button>
              </div>

              {/* Selector de Modo POS (Auto-crear vs Vincular a existente) */}
              <div className="p-4 rounded-xl space-y-3" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B949E]">
                    Vinculación con la Carta POS
                  </p>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg" style={{ background: "#161B22", border: "1px solid #30363D" }}>
                    <button
                      type="button"
                      onClick={() => setPosMode("auto_create")}
                      className="px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all"
                      style={{
                        background: posMode === "auto_create" ? "rgba(240,180,41,0.20)" : "transparent",
                        color: posMode === "auto_create" ? "#F0B429" : "#8B949E",
                      }}
                    >
                      <Sparkles size={12} />
                      Auto-crear Producto
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosMode("link_existing")}
                      className="px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all"
                      style={{
                        background: posMode === "link_existing" ? "rgba(56,139,253,0.20)" : "transparent",
                        color: posMode === "link_existing" ? "#388BFD" : "#8B949E",
                      }}
                    >
                      <LinkIcon size={12} />
                      Vincular a Existente
                    </button>
                  </div>
                </div>

                {posMode === "auto_create" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-[#8B949E] block mb-1">
                        Nombre Comercial del Plato / Trago *
                      </label>
                      <input
                        type="text"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        placeholder="Ej. Negroni Clásico, Bruschetta de Tomate..."
                        className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-colors"
                        style={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#8B949E] block mb-1">
                        Precio Venta POS ($) *
                      </label>
                      <div className="relative">
                        <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                        <input
                          type="number"
                          value={manualSalePrice || ""}
                          onChange={(e) => setManualSalePrice(Number(e.target.value))}
                          placeholder="2500"
                          className="w-full pl-8 pr-3 py-2 rounded-lg text-xs font-bold outline-none"
                          style={{ background: "#161B22", border: "1px solid #30363D", color: "#F0B429" }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-[#8B949E] block mb-1">
                      Seleccionar Producto Registrado de la Carta *
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg text-xs outline-none"
                      style={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
                    >
                      <option value="">-- Seleccionar producto de la carta --</option>
                      {products
                        .filter((p) => p.type === station)
                        .map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} (${p.price.toLocaleString("es-AR")}) - [{p.category}]
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Categoría de Carta con Sugerencias Rápidas */}
              <div className="p-4 rounded-xl space-y-2.5" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
                <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
                  Categoría de Menú
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(station === "drink" ? CATEGORY_PRESETS_DRINK : CATEGORY_PRESETS_FOOD).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                      style={{
                        background: category === cat ? "rgba(240,180,41,0.20)" : "#161B22",
                        border: `1px solid ${category === cat ? "rgba(240,180,41,0.40)" : "#30363D"}`,
                        color: category === cat ? "#F0B429" : "#8B949E",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Categoría personalizada..."
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
                />
              </div>

              {/* Fotografía de la Ficha Técnica */}
              <div className="p-4 rounded-xl space-y-2" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
                <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
                  URL de Imagen (Opcional)
                </label>
                <div className="flex gap-3 items-center">
                  <div
                    className="w-16 h-16 rounded-xl shrink-0 overflow-hidden flex items-center justify-center border"
                    style={{ background: "#161B22", borderColor: "#30363D" }}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-[#8B949E]" />
                    )}
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1 px-3 py-2.5 rounded-lg text-xs outline-none"
                    style={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              PASO 2: Bóveda de Insumos & Escandallo Dinámico
          ══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Barra Financiera Resumen */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E]">Costo Insumos</p>
                  <p className="text-xl font-black text-[#F0B429]">${totalCost.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E]">Precio Venta POS</p>
                  <p className="text-xl font-black text-[#E6EDF3]">${manualSalePrice.toLocaleString("es-AR")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E]">Margen Bruto</p>
                  <p
                    className="text-xl font-black"
                    style={{
                      color: grossMargin >= 70 ? "#3FB950" : grossMargin >= 40 ? "#F0B429" : "#F85149",
                    }}
                  >
                    {grossMargin}%
                  </p>
                </div>
              </div>

              {/* Buscador de Insumos de Inventario */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
                  Añadir Insumos de la Bóveda de Inventario
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Escribe para buscar (Ej. Gin, Jugo, Limón, Queso, Carne)..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none"
                    style={{ background: "#1C2333", border: "1px solid #30363D", color: "#E6EDF3" }}
                  />
                </div>

                {/* Dropdown de resultados encontrados */}
                {filteredInventory.length > 0 && (
                  <div
                    className="p-1 rounded-xl shadow-xl space-y-1 max-h-48 overflow-y-auto"
                    style={{ background: "#1C2333", border: "1px solid #30363D" }}
                  >
                    {filteredInventory.map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => handleAddIngredient(item)}
                        className="w-full text-left p-2.5 rounded-lg flex items-center justify-between hover:bg-[#21283A] transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#E6EDF3]">{item.name}</p>
                          <p className="text-[10px] text-[#8B949E]">
                            Stock: {item.stock} {item.unit} · Costo base: ${item.cost}/{item.unit}
                          </p>
                        </div>
                        <Plus size={14} className="text-[#F0B429]" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabla de Insumos del Escandallo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B949E]">
                    Insumos del Escandallo ({ingredients.length})
                  </p>
                  <span className="text-[11px] text-[#8B949E]">Ajusta cantidades y unidades</span>
                </div>

                {ingredients.length === 0 ? (
                  <div
                    className="p-8 rounded-xl text-center space-y-2"
                    style={{ background: "#1C2333", border: "1px dashed #30363D" }}
                  >
                    <Package size={28} className="mx-auto text-[#8B949E] opacity-50" />
                    <p className="text-xs font-semibold text-[#8B949E]">
                      No has agregado insumos aún. Utiliza el buscador arriba para añadir insumos de la Bóveda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ingredients.map((ing, idx) => {
                      const invId = getInventoryItemId(ing.inventoryItem);
                      const inv =
                        typeof ing.inventoryItem === "object" && ing.inventoryItem && (ing.inventoryItem as any).name
                          ? (ing.inventoryItem as any)
                          : inventoryItems.find((i) => i._id === invId);
                      const invName = inv?.name || "Insumo de inventario";
                      const invCost = inv?.cost || 0;

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl flex items-center justify-between gap-3"
                          style={{ background: "#1C2333", border: "1px solid #30363D" }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#E6EDF3] truncate">{invName}</p>
                            <p className="text-[10px] text-[#8B949E]">
                              Costo ref: ${invCost} / {inv?.unit || "u"}
                            </p>
                          </div>

                          {/* Cantidad y Unidad */}
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0.1"
                              step="0.5"
                              value={ing.quantity}
                              onChange={(e) =>
                                handleUpdateIngredient(idx, "quantity", Number(e.target.value))
                              }
                              className="w-20 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-center outline-none"
                              style={{ background: "#161B22", border: "1px solid #30363D", color: "#F0B429" }}
                            />
                            <select
                              value={ing.unit}
                              onChange={(e) => handleUpdateIngredient(idx, "unit", e.target.value)}
                              className="px-2 py-1.5 rounded-lg text-xs outline-none"
                              style={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
                            >
                              <option value="ml">ml</option>
                              <option value="cl">cl</option>
                              <option value="oz">oz</option>
                              <option value="g">g</option>
                              <option value="kg">kg</option>
                              <option value="unit">unit</option>
                              <option value="portion">porción</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(idx)}
                              className="p-1.5 rounded-lg text-[#8B949E] hover:text-[#F85149] hover:bg-[#21283A] transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              PASO 3: Protocolo Técnico & Pasos
          ══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Selector de Técnicas (Sin emojis, iconos Lucide) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
                  Técnica / Método de Elaboración *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(station === "drink" ? DRINK_TECHNIQUES : FOOD_TECHNIQUES).map((t) => {
                    const Icon = t.icon;
                    const selected = method === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setMethod(t.id)}
                        className="p-3 rounded-xl border text-left transition-all flex items-start gap-2.5"
                        style={{
                          background: selected ? "rgba(240,180,41,0.15)" : "#1C2333",
                          borderColor: selected ? "#F0B429" : "#30363D",
                        }}
                      >
                        <div
                          className="p-1.5 rounded-lg shrink-0"
                          style={{
                            background: selected ? "rgba(240,180,41,0.20)" : "#161B22",
                            color: selected ? "#F0B429" : "#8B949E",
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#E6EDF3]">{t.label}</p>
                          <p className="text-[10px] text-[#8B949E]">{t.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cristalería / Vajilla */}
              <div className="p-4 rounded-xl space-y-2" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
                <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
                  {station === "drink" ? "Cristalería Sugerida" : "Vajilla de Presentación"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(station === "drink" ? DRINK_GLASSWARE : FOOD_DISHWARE).map((glass) => (
                    <button
                      key={glass}
                      type="button"
                      onClick={() => setGlassware(glass)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                      style={{
                        background: glassware === glass ? "rgba(56,139,253,0.20)" : "#161B22",
                        border: `1px solid ${glassware === glass ? "rgba(56,139,253,0.40)" : "#30363D"}`,
                        color: glassware === glass ? "#388BFD" : "#8B949E",
                      }}
                    >
                      {glass}
                    </button>
                  ))}
                </div>
              </div>

              {/* Servicio de Hielo (Solo para Bebidas) */}
              {station === "drink" && (
                <div className="p-4 rounded-xl space-y-2" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
                  <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
                    Servicio de Hielo
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ICE_SERVICES.map((item) => {
                      const Icon = item.icon;
                      const selected = ice === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setIce(item.id)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all"
                          style={{
                            background: selected ? "rgba(240,180,41,0.20)" : "#161B22",
                            border: `1px solid ${selected ? "rgba(240,180,41,0.40)" : "#30363D"}`,
                            color: selected ? "#F0B429" : "#8B949E",
                          }}
                        >
                          <Icon size={13} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Garnish / Decoraciones */}
              <div className="p-4 rounded-xl space-y-1.5" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
                <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
                  Garnish / Decoración de Estación
                </label>
                <input
                  type="text"
                  value={garnish}
                  onChange={(e) => setGarnish(e.target.value)}
                  placeholder="Ej. Twist de limón, ramillete de menta fresca, sal en escamas..."
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
                />
              </div>

              {/* Pasos de Elaboración Operativa */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
                    Pasos de Elaboración ({recipeSteps.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 text-[#F0B429] hover:bg-[#21283A] transition-colors"
                  >
                    <Plus size={13} />
                    Agregar Paso
                  </button>
                </div>

                <div className="space-y-2">
                  {recipeSteps.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl flex items-center gap-2"
                      style={{ background: "#1C2333", border: "1px solid #30363D" }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: "rgba(240,180,41,0.15)", color: "#F0B429" }}
                      >
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={s.instruction}
                        onChange={(e) => handleUpdateStep(idx, e.target.value)}
                        placeholder={`Instrucción para el paso ${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                        style={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] disabled:opacity-30"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, "down")}
                        disabled={idx === recipeSteps.length - 1}
                        className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] disabled:opacity-30"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        disabled={recipeSteps.length <= 1}
                        className="p-1 text-[#8B949E] hover:text-[#F85149] disabled:opacity-30"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con Navegación de Pasos y Guardado */}
        <div className="flex items-center justify-between pt-4 shrink-0" style={{ borderTop: "1px solid #30363D" }}>
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#8B949E] hover:text-[#E6EDF3] flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
            >
              Cancelar
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg"
                style={{ background: "#F0B429", color: "#0D1117" }}
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg disabled:opacity-50"
                style={{ background: "#F0B429", color: "#0D1117" }}
              >
                <Check size={14} />
                {saving ? "Guardando..." : "Guardar Receta & Escandallo"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
