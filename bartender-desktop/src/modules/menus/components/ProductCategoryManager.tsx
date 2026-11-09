"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Martini,
  Utensils,
  Plus,
  Trash2,
  Layers,
  CheckCircle,
  X,
  Box,
  FileText,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import type { Product } from "../../../types/product";
import type { MenuCategory } from "../../../types/menu";
import ProductMiniCard from "./ProductMiniCard";

interface Props {
  categories: MenuCategory[];
  products: Product[];
  onUpdateCategories: (categories: MenuCategory[]) => void;
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (categoryName: string) => void;
}

export default function ProductCategoryManager({
  categories,
  products,
  onUpdateCategories,
  onCreateCategory,
  onDeleteCategory,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categories[0]?.name || null);
  const [activeTab, setActiveTab] = useState<"assigned" | "available">("assigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "drink" | "food">("all");
  const [newCategoryName, setNewCategoryName] = useState("");

  // Categoría activa actualmente
  const currentCategory = useMemo(() => {
    return categories.find((c) => c.name === selectedCategory) || categories[0] || null;
  }, [categories, selectedCategory]);

  // IDs de productos agregados a ESTA categoría específica
  const categoryProductIds = useMemo(() => {
    if (!currentCategory) return new Set<string>();
    return new Set(
      currentCategory.products.map((p) =>
        typeof p.product === "string" ? p.product : (p.product as any)?._id
      ).filter(Boolean)
    );
  }, [currentCategory]);

  // Productos disponibles para agregar (los que no están en esta categoría aún)
  const availableProducts = useMemo(() => {
    return products.filter((product) => {
      const pId = (product as any)._id;
      const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || product.type === filterType;
      const notInThisCategory = !categoryProductIds.has(pId);
      return matchesSearch && matchesType && notInThisCategory;
    });
  }, [products, searchQuery, filterType, categoryProductIds]);

  const handleCreateCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const newCategory: MenuCategory = {
      name: trimmed,
      description: "",
      image: "",
      products: [],
      order: categories.length,
    };

    onUpdateCategories([...categories, newCategory]);
    setNewCategoryName("");
    onCreateCategory(trimmed);
    setSelectedCategory(trimmed);
    setActiveTab("available");
  };

  const handleAddProduct = (product: Product) => {
    if (!currentCategory) return;

    const updatedCategories = categories.map((cat) => {
      if (cat.name === currentCategory.name) {
        return {
          ...cat,
          products: [
            ...cat.products,
            {
              product: (product as any)._id,
              price: product.price || null,
              available: true,
              featured: false,
              order: cat.products.length,
            },
          ],
        };
      }
      return cat;
    });

    onUpdateCategories(updatedCategories);
  };

  const handleRemoveProduct = (productId: string) => {
    if (!currentCategory) return;

    const updatedCategories = categories.map((cat) => {
      if (cat.name === currentCategory.name) {
        return {
          ...cat,
          products: cat.products.filter((p) => {
            const pId = typeof p.product === "string" ? p.product : (p.product as any)?._id;
            return pId !== productId;
          }),
        };
      }
      return cat;
    });

    onUpdateCategories(updatedCategories);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full min-h-[500px]">
      {/* ── COLUMNA IZQUIERDA: Árbol de Categorías (w-full md:w-64) ─── */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-3 bg-[#161B22] border border-[#30363D] rounded-xl p-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
          <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Categorías</h3>
          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-[#21283A] text-[#F0B429]">
            {categories.length}
          </span>
        </div>

        {/* Creador de categoría al vuelo */}
        <div className="flex gap-1.5">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
            className="flex-1 h-8 bg-[#1C2333] border border-[#30363D] rounded-lg px-2.5 text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/50 focus:outline-none focus:border-[#F0B429] transition-colors"
            placeholder="Nueva categoría…"
          />
          <button
            onClick={handleCreateCategory}
            className="h-8 px-2.5 rounded-lg bg-[rgba(240,180,41,0.12)] border border-[rgba(240,180,41,0.30)] text-[#F0B429] hover:bg-[rgba(240,180,41,0.22)] transition-colors font-bold text-xs"
            title="Crear categoría"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Lista de categorías */}
        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-[#8B949E] text-xs">
              No hay categorías. Crea una arriba.
            </div>
          ) : (
            categories.map((category) => {
              const isSelected = (currentCategory?.name || "") === category.name;
              const productCount = category.products?.length || 0;

              return (
                <div
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`group flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#21283A] border-[rgba(240,180,41,0.40)] text-[#F0B429] shadow-sm font-bold"
                      : "bg-[#1C2333] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D]"
                  }`}
                >
                  <span className="truncate flex-1" title={category.name}>{category.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`px-1.5 py-0.2 rounded-full text-xs ${
                      isSelected ? "bg-[#F0B429] text-black font-black" : "bg-[#161B22] text-[#8B949E]"
                    }`}>
                      {productCount}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar categoría "${category.name}" del menú?`)) {
                          onDeleteCategory(category.name);
                        }
                      }}
                      className="p-1 text-[#8B949E] hover:text-[#F85149] rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── COLUMNA DERECHA: Detalle de Productos (flex-1) ─────────── */}
      <div className="flex-1 flex flex-col gap-3 bg-[#161B22] border border-[#30363D] rounded-xl p-4 min-w-0">
        {currentCategory ? (
          <>
            {/* Cabecera de Categoría + Switch de Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#30363D]">
              <div>
                <span className="text-xs text-[#8B949E] font-semibold uppercase tracking-wider block">Categoría activa</span>
                <h3 className="text-base font-bold text-[#E6EDF3] tracking-tight">{currentCategory.name}</h3>
              </div>

              {/* Tabs: Asignados vs Catálogo Disponible */}
              <div className="flex items-center bg-[#1C2333] border border-[#30363D] rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("assigned")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "assigned"
                      ? "bg-[#21283A] text-[#F0B429] border border-[rgba(240,180,41,0.30)] font-bold shadow-sm"
                      : "text-[#8B949E] hover:text-[#E6EDF3]"
                  }`}
                >
                  <Box size={13} />
                  <span>En esta categoría ({currentCategory.products.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("available")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTab === "available"
                      ? "bg-[#21283A] text-[#F0B429] border border-[rgba(240,180,41,0.30)] font-bold shadow-sm"
                      : "text-[#8B949E] hover:text-[#E6EDF3]"
                  }`}
                >
                  <Plus size={13} />
                  <span>Catálogo para agregar ({availableProducts.length})</span>
                </button>
              </div>
            </div>

            {/* CONTENIDO TAB 1: PRODUCTOS ASIGNADOS */}
            {activeTab === "assigned" && (
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-0.5">
                {currentCategory.products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                    <div className="p-3 rounded-xl bg-[#1C2333] text-[#8B949E]">
                      <Box size={28} />
                    </div>
                    <p className="text-xs font-semibold text-[#E6EDF3]">No hay productos asignados a "{currentCategory.name}"</p>
                    <button
                      onClick={() => setActiveTab("available")}
                      className="text-xs text-[#F0B429] hover:underline font-bold mt-1"
                    >
                      + Abrir catálogo para sumar productos
                    </button>
                  </div>
                ) : (
                  currentCategory.products.map((p, idx) => {
                    const productId = typeof p.product === "string" ? p.product : (p.product as any)?._id;
                    const fullProduct = products.find((prod) => prod._id === productId) || (typeof p.product === "object" ? p.product : null);
                    const isDrink = fullProduct?.type === "drink";

                    return (
                      <div
                        key={productId || idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#1C2333] border border-[#30363D] hover:border-[#3D444D] transition-all gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#090E14] border border-[#30363D] shrink-0 flex items-center justify-center">
                            {fullProduct?.image ? (
                              <img src={fullProduct.image} alt={fullProduct.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className={isDrink ? "text-[#F0B429]" : "text-[#3FB950]"}>
                                {isDrink ? <Martini size={16} /> : <Utensils size={16} />}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#E6EDF3] truncate">
                              {fullProduct?.name || "Producto desconocido"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8B949E]">
                              <span className="font-bold text-[#F0B429]">
                                ${(p.price || fullProduct?.price || 0).toLocaleString("es-AR")}
                              </span>
                              <span>·</span>
                              <span>{fullProduct?.available ? "Disponible" : "Agotado"}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveProduct(productId!)}
                          className="p-1.5 rounded-lg text-[#8B949E] hover:text-[#F85149] hover:bg-[rgba(248,81,73,0.12)] border border-transparent hover:border-[rgba(248,81,73,0.30)] transition-colors"
                          title="Quitar de esta categoría"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* CONTENIDO TAB 2: CATÁLOGO DISPONIBLE */}
            {activeTab === "available" && (
              <div className="flex-1 flex flex-col gap-3 min-h-0">
                {/* Buscador y filtro de tipo */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                    <input
                      type="text"
                      placeholder="Buscar en el catálogo general…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#1C2333] border border-[#30363D] text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/50 focus:outline-none focus:border-[#F0B429] transition-colors"
                    />
                  </div>
                  <div className="flex gap-1 bg-[#1C2333] border border-[#30363D] rounded-lg p-0.5">
                    {[
                      { id: "all", label: "Todos" },
                      { id: "drink", label: "Bebidas" },
                      { id: "food", label: "Comidas" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilterType(f.id as any)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                          filterType === f.id
                            ? "bg-[#21283A] text-[#F0B429] font-bold"
                            : "text-[#8B949E] hover:text-[#E6EDF3]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista de productos disponibles para sumar */}
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-0.5">
                  {availableProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
                      <CheckCircle size={28} className="text-[#3FB950]" />
                      <p className="text-xs font-semibold text-[#E6EDF3]">
                        {searchQuery ? "Sin resultados para la búsqueda" : "Todos los productos del catálogo han sido agregados a esta categoría"}
                      </p>
                    </div>
                  ) : (
                    availableProducts.map((prod) => (
                      <ProductMiniCard
                        key={prod._id}
                        product={prod}
                        onAdd={handleAddProduct}
                        isAdded={false}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-2 text-[#8B949E]">
            <Layers size={36} />
            <p className="text-sm font-semibold text-[#E6EDF3]">Selecciona una categoría a la izquierda</p>
            <p className="text-xs">Para ver y agregar productos a la carta digital.</p>
          </div>
        )}
      </div>
    </div>
  );
}
