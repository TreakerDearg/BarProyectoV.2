"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Martini, Utensils, Plus, Trash2, Layers, ChevronRight, ChevronDown, CheckCircle, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "drink" | "food">("all");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map(c => c.name)));

  // Get all product IDs that are already added to any category
  const addedProductIds = useMemo(() => {
    const ids = new Set<string>();
    categories.forEach(cat => {
      cat.products.forEach(p => {
        const productId = typeof p.product === 'string' ? p.product : (p.product as any)?._id;
        if (productId) ids.add(productId);
      });
    });
    return ids;
  }, [categories]);

  // Filter available products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = (product as any).name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || (product as any).type === filterType;
      const notAdded = !addedProductIds.has((product as any)._id);
      return matchesSearch && matchesType && notAdded;
    });
  }, [products, searchQuery, filterType, addedProductIds]);

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const handleAddProduct = (product: Product) => {
    if (!selectedCategory) return;
    
    const updatedCategories = categories.map(cat => {
      if (cat.name === selectedCategory) {
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
            }
          ]
        };
      }
      return cat;
    });
    
    onUpdateCategories(updatedCategories);
  };

  const handleRemoveProduct = (categoryName: string, productId: string) => {
    const updatedCategories = categories.map(cat => {
      if (cat.name === categoryName) {
        return {
          ...cat,
          products: cat.products.filter(p => {
            const pId = typeof p.product === 'string' ? p.product : (p.product as any)?._id;
            return pId !== productId;
          })
        };
      }
      return cat;
    });
    
    onUpdateCategories(updatedCategories);
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: MenuCategory = {
      name: newCategoryName.trim(),
      description: "",
      image: "",
      products: [],
      order: categories.length,
    };

    onUpdateCategories([...categories, newCategory]);
    setNewCategoryName("");
    onCreateCategory(newCategoryName.trim());
    setSelectedCategory(newCategoryName.trim());
    setExpandedCategories(prev => new Set([...prev, newCategoryName.trim()]));
  };

  const availableCount = products.filter(p => p.available).length;
  const totalCount = products.length;

  return (
    <div className="flex gap-4 h-full">
      {/* LEFT PANEL - CATEGORIES */}
      <div className="w-1/3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-ivory uppercase tracking-widest">Categorías</h3>
          <span className="text-xs font-semibold text-rose bg-rose/10 px-2 py-1 rounded-full">
            {categories.length}
          </span>
        </div>

        {/* Add New Category */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateCategory()}
            className="flex-1 bg-surface-3 border-white/10 rounded-lg px-3 py-2 text-ivory text-xs focus:ring-2 focus:ring-rose/40 focus:border-transparent transition-all outline-none"
            placeholder="Nueva categoría..."
          />
          <button
            onClick={handleCreateCategory}
            className="px-3 py-2 rounded-lg bg-rose/10 border border-rose/30 text-rose-300 hover:bg-rose/20 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted text-xs">
              No hay categorías creadas
            </div>
          ) : (
            categories.map((category) => {
              const isSelected = selectedCategory === category.name;
              const isExpanded = expandedCategories.has(category.name);
              const productCount = category.products?.length || 0;

              return (
                <div key={category.name}>
                  <div
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose/10 border-rose/30 text-rose-300'
                        : 'bg-surface-3 border-white/5 hover:border-white/10 text-muted hover:text-ivory'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategoryExpansion(category.name);
                      }}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{category.name}</span>
                        <span className="text-[10px] bg-surface-2 px-1.5 py-0.5 rounded">
                          {productCount}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar categoría "${category.name}"?`)) {
                          onDeleteCategory(category.name);
                          if (selectedCategory === category.name) {
                            setSelectedCategory(categories[0]?.name || null);
                          }
                        }
                      }}
                      className="p-1 rounded hover:bg-red/10 text-red/40 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Category Products (when expanded) */}
                  {isExpanded && isSelected && (
                    <div className="ml-6 mt-2 space-y-1">
                      {productCount === 0 ? (
                        <div className="text-xs text-muted/50 py-2">
                          Sin productos
                        </div>
                      ) : (
                        category.products.map((p, idx) => {
                          const productId = typeof p.product === 'string' ? p.product : (p.product as any)?._id;
                          return (
                            <div
                              key={productId || idx}
                              className="flex items-center gap-2 p-2 bg-surface-2 rounded border border-white/5 text-xs"
                            >
                              <span className="flex-1 truncate text-ivory">
                                {typeof p.product === 'string' ? p.product : (p.product as any)?.name || 'Producto'}
                              </span>
                              {p.price && (
                                <span className="text-emerald-400 font-semibold">
                                  ${p.price}
                                </span>
                              )}
                              <button
                                onClick={() => handleRemoveProduct(category.name, productId!)}
                                className="p-1 rounded hover:bg-red/10 text-red/40 hover:text-red-300 transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL - PRODUCTS */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-ivory uppercase tracking-widest">
            {selectedCategory ? `Productos para "${selectedCategory}"` : "Selecciona una categoría"}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald/10">
              <CheckCircle size={10} className="text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400">
                {availableCount}/{totalCount} disponibles
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-ivory placeholder:text-muted/50 text-xs focus:outline-none focus:border-rose/40 transition-all"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                filterType === "all"
                  ? "bg-rose/10 border border-rose/30 text-rose-300"
                  : "bg-white/5 border border-white/10 text-muted hover:border-white/20"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType("drink")}
              className={`px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                filterType === "drink"
                  ? "bg-rose/10 border border-rose/30 text-rose-300"
                  : "bg-white/5 border border-white/10 text-muted hover:border-white/20"
              }`}
            >
              <Martini size={12} className="inline mr-1" />
              Bebidas
            </button>
            <button
              onClick={() => setFilterType("food")}
              className={`px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                filterType === "food"
                  ? "bg-rose/10 border border-rose/30 text-rose-300"
                  : "bg-white/5 border border-white/10 text-muted hover:border-white/20"
              }`}
            >
              <Utensils size={12} className="inline mr-1" />
              Comidas
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          {!selectedCategory ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
              <Layers size={24} className="text-muted/30" />
              <p className="text-xs text-muted/50 font-semibold">
                Selecciona una categoría para agregar productos
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
              <Filter size={24} className="text-muted/30" />
              <p className="text-xs text-muted/50 font-semibold">
                {searchQuery || filterType !== "all"
                  ? "No se encontraron productos"
                  : "Todos los productos han sido agregados"}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductMiniCard
                key={product._id}
                product={product}
                onAdd={handleAddProduct}
                isAdded={false}
              />
            ))
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-[10px] text-muted font-semibold">
            {filteredProducts.length} productos disponibles
          </span>
          <span className="text-[10px] text-muted/50 font-semibold">
            {addedProductIds.size} agregados
          </span>
        </div>
      </div>
    </div>
  );
}
