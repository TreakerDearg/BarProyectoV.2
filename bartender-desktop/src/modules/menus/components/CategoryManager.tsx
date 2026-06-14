"use client";

import { useState, useCallback, memo } from "react";
import { Layers, Plus, Trash2, GripVertical, Edit2, X, CheckCircle2, Info } from "lucide-react";
import type { MenuCategory } from "../../../types/menu";

interface Props {
  categories: MenuCategory[];
  onUpdate: (categories: MenuCategory[]) => void;
  onAddCategory?: (name: string) => void;
}

function CategoryManager({ categories, onUpdate, onAddCategory }: Props) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    
    // Show success feedback
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (!confirm(`¿Eliminar categoría "${categoryName}" y todos sus productos?`)) return;
    onUpdate(categories.filter((c) => c.name !== categoryName));
  };

  const handleBulkDelete = () => {
    if (selectedCategories.size === 0) return;
    if (!confirm(`¿Eliminar ${selectedCategories.size} categorías seleccionadas?`)) return;
    onUpdate(categories.filter((c) => !selectedCategories.has(c.name)));
    setSelectedCategories(new Set());
  };

  const handleToggleSelect = (categoryName: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName);
    } else {
      newSelected.add(categoryName);
    }
    setSelectedCategories(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories.map(c => c.name)));
    }
  };

  // Drag and drop handlers
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newCategories = [...categories];
    const [draggedItem] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);
    
    onUpdate(newCategories);
    setDraggedIndex(index);
  }, [categories, draggedIndex, onUpdate]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-xl">
            <Layers className="text-rose-300" size={20} />
          </div>
          <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Gestión de Categorías</h3>
          {saveSuccess && (
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] animate-in fade-in duration-300">
              <CheckCircle2 size={10} />
              <span>Guardado</span>
            </div>
          )}
        </div>
        {selectedCategories.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted">{selectedCategories.size} seleccionadas</span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-red/10 border border-red/30 text-red-400 text-xs hover:bg-red/20 transition-colors"
            >
              Eliminar ({selectedCategories.size})
            </button>
          </div>
        )}
      </div>

      {/* Add New Category */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1">
            Nueva Categoría
          </label>
          <div className="group relative">
            <Info size={12} className="text-muted/50 hover:text-rose-400 cursor-help" />
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-surface-2 border border-white/10 rounded-lg text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              Las categorías organizan tus productos en grupos lógicos para el menú.
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
            className="flex-1 bg-surface-3 border-white/10 rounded-lg px-4 py-3 text-ivory focus:ring-2 focus:ring-rose/40 focus:border-transparent transition-all outline-none"
            placeholder="Ej: Entradas, Bebidas, Postres..."
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim()}
            className="px-4 py-3 rounded-xl bg-rose/10 border border-rose/30 text-rose-300 hover:bg-rose/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-surface-3 rounded-lg border border-white/5">
          <button
            onClick={handleSelectAll}
            className="text-[10px] text-muted hover:text-ivory transition-colors"
          >
            {selectedCategories.size === categories.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm flex flex-col items-center gap-2">
            <Layers size={32} className="text-muted/30" />
            <p>No hay categorías creadas</p>
            <p className="text-[10px] opacity-60">Agrega tu primera categoría arriba</p>
          </div>
        ) : (
          categories.map((category, index) => (
            <div
              key={category.name}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 bg-surface-3 rounded-lg border transition-all ${
                draggedIndex === index ? 'border-rose/50 bg-rose/5 scale-102' : 'border-white/5 hover:border-white/10'
              } ${selectedCategories.has(category.name) ? 'border-rose/30 bg-rose/5' : ''}`}
            >
              <GripVertical className="text-muted cursor-grab hover:text-ivory transition-colors" size={16} />
              <input
                type="checkbox"
                checked={selectedCategories.has(category.name)}
                onChange={() => handleToggleSelect(category.name)}
                className="w-4 h-4 rounded border-white/20 bg-surface-2 text-rose-500 focus:ring-rose/40 focus:ring-offset-0 cursor-pointer"
              />
              
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
                      title="Guardar"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 rounded-lg hover:bg-red/10 text-red-400 transition-colors"
                      title="Cancelar"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartEdit(category.name)}
                      className="p-2 rounded-lg hover:bg-white/10 text-muted transition-colors"
                      title="Editar nombre"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.name)}
                      className="p-2 rounded-lg hover:bg-red/10 text-red-400 transition-colors"
                      title="Eliminar categoría"
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
        <div className="flex items-center gap-2 text-[10px] text-muted mt-4">
          <GripVertical size={12} />
          <span>Arrastra las categorías para reordenarlas</span>
        </div>
      )}
    </div>
  );
}

export default memo(CategoryManager);
