"use client";

import { useState } from "react";
import { Layers, Plus, Trash2, GripVertical, Edit2, X } from "lucide-react";
import type { MenuCategory } from "../../../types/menu";

interface Props {
  categories: MenuCategory[];
  onUpdate: (categories: MenuCategory[]) => void;
  onAddCategory?: (name: string) => void;
}

export default function CategoryManager({ categories, onUpdate, onAddCategory }: Props) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: MenuCategory = {
      name: newCategoryName.trim(),
      order: categories.length,
      products: [],
    };

    onUpdate([...categories, newCategory]);
    setNewCategoryName("");
    onAddCategory?.(newCategoryName.trim());
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (!confirm(`¿Eliminar categoría "${categoryName}"?`)) return;
    onUpdate(categories.filter((c) => c.name !== categoryName));
  };

  const handleStartEdit = (categoryName: string) => {
    setEditingCategory(categoryName);
    setEditName(categoryName);
  };

  const handleSaveEdit = (oldName: string) => {
    if (!editName.trim()) return;
    
    onUpdate(
      categories.map((c) =>
        c.name === oldName ? { ...c, name: editName.trim() } : c
      )
    );
    setEditingCategory(null);
    setEditName("");
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName("");
  };

  return (
    <div className="nebula-panel p-6 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-rose-500/10 rounded-xl">
          <Layers className="text-rose-300" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Gestión de Categorías</h3>
      </div>

      {/* Add New Category */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
          className="flex-1 bg-surface-3 border-white/10 rounded-lg px-4 py-3 text-ivory focus:ring-2 focus:ring-rose/40 focus:border-transparent transition-all outline-none"
          placeholder="Nueva categoría..."
        />
        <button
          onClick={handleAddCategory}
          className="px-4 py-3 rounded-xl bg-rose/10 border border-rose/30 text-rose-300 hover:bg-rose/20 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">
            No hay categorías creadas
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.name}
              className="flex items-center gap-3 p-3 bg-surface-3 rounded-lg border border-white/5 group hover:border-white/10 transition-all"
            >
              <GripVertical className="text-muted cursor-grab" size={16} />
              
              {editingCategory === category.name ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSaveEdit(category.name)}
                  autoFocus
                  className="flex-1 bg-surface-2 border border-white/10 rounded px-3 py-2 text-ivory text-sm focus:ring-2 focus:ring-rose/40 focus:border-transparent outline-none"
                />
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-ivory">{category.name}</span>
                  <span className="text-[10px] text-muted bg-surface-2 px-2 py-0.5 rounded">
                    {category.products?.length || 0} productos
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingCategory === category.name ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(category.name)}
                      className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 rounded-lg hover:bg-red/10 text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartEdit(category.name)}
                      className="p-2 rounded-lg hover:bg-white/10 text-muted transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.name)}
                      className="p-2 rounded-lg hover:bg-red/10 text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reorder Hints */}
      {categories.length > 1 && (
        <div className="text-[10px] text-muted mt-4">
          Arrastra las categorías para reordenarlas
        </div>
      )}
    </div>
  );
}
