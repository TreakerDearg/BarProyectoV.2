"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  X, 
  ChevronRight, 
  Layers, 
  Box, 
  Zap, 
  FileText, 
  CheckCircle, 
  Martini, 
  Utensils, 
  Loader2, 
  Trash2, 
  Plus,
  ArrowUp,
  ArrowDown,
  Info,
  ShieldCheck,
  Target
} from "lucide-react";

import { getProducts } from "../../../modules/products/services/productService";
import { getInventory } from "../../../modules/inventory/services/inventoryService";
import type { Recipe } from "../types/recipe";

interface Props {
  onSave: (recipe: Recipe) => void;
  onClose: () => void;
}

const EMPTY_INGREDIENT = {
  inventoryItem: "",
  quantity: 1,
  unit: "ml",
};

export default function RecipeForm({ onSave, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<Recipe>({
    product: { _id: "", name: "" },
    type: "drink",
    method: "",
    category: "general",
    image: "",
    ingredients: [],
    steps: [],
  });

  const [ingredientDraft, setIngredientDraft] = useState(EMPTY_INGREDIENT);

  useEffect(() => {
    getProducts().then(setProducts);
    getInventory().then(setInventory);
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const addIngredient = () => {
    if (!ingredientDraft.inventoryItem) return;
    const exists = form.ingredients.find(i => i.inventoryItem?._id === ingredientDraft.inventoryItem);
    if (exists) return;

    const selectedItem = inventory.find(inv => inv._id === ingredientDraft.inventoryItem);
    if (!selectedItem) return;

    setForm(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          inventoryItem: { _id: selectedItem._id, name: selectedItem.name },
          quantity: Number(ingredientDraft.quantity),
          unit: ingredientDraft.unit as any
        }
      ],
    }));
    setIngredientDraft(EMPTY_INGREDIENT);
  };

  const removeIngredient = (index: number) => {
    setForm(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
  };

  const addStep = () => {
    setForm(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { stepNumber: (prev.steps?.length || 0) + 1, instruction: "" }],
    }));
  };

  const updateStep = (index: number, value: string) => {
    setForm(prev => {
      const steps = [...(prev.steps || [])];
      if (steps[index]) {
        steps[index].instruction = value;
      }
      return { ...prev, steps };
    });
  };

  const removeStep = (index: number) => {
    setForm(prev => ({
      ...prev,
      steps: (prev.steps || []).filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 })),
    }));
  };

  const moveStep = (index: number, dir: "up" | "down") => {
    setForm(prev => {
      const steps = [...(prev.steps || [])];
      const newIndex = dir === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= steps.length) return prev;
      [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
      return { ...prev, steps: steps.map((s, i) => ({ ...s, stepNumber: i + 1 })) };
    });
  };

  const canNext = useMemo(() => {
    switch (step) {
      case 1: return !!form.product?._id;
      case 2: return form.ingredients.length > 0;
      case 4: return (form.steps?.length || 0) > 0;
      default: return true;
    }
  }, [step, form]);

  const handleSubmit = async () => {
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  const stepsInfo = [
    { label: "Producto", icon: <Target size={16} /> },
    { label: "Componentes", icon: <Box size={16} /> },
    { label: "Metodología", icon: <Zap size={16} /> },
    { label: "Secuencia", icon: <Layers size={16} /> },
    { label: "Validación", icon: <ShieldCheck size={16} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-fade-in">
      
      <div className="w-full max-w-6xl bg-surface-2 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 bg-surface-3 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold/20 rounded-xl">
              <Layers className="text-gold" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {step === 5 ? "Validar Receta" : "Nueva Receta"}
              </h2>
              <p className="text-sm text-muted">
                Sistema de gestión de recetas
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} className="text-muted" />
          </button>
        </div>

        {/* STEP PROGRESS INDICATOR */}
        <div className="px-6 py-3 bg-surface-3/50 border-b border-white/10 flex gap-2">
          {stepsInfo.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < step ? 'bg-gold' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Producto</label>
                  <select
                    value={form.product?._id || ""}
                    onChange={(e) => {
                      const selectedProduct = products.find(p => p._id === e.target.value);
                      setForm({
                        ...form,
                        product: selectedProduct ? { _id: selectedProduct._id, name: selectedProduct.name } : { _id: "", name: "" }
                      });
                    }}
                    className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                  <div className="flex gap-4">
                    <button onClick={() => setForm({...form, type: 'drink'})} className={`flex-1 py-3 px-4 rounded-lg border ${form.type === 'drink' ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-surface-3 border-white/10 text-gray-400'}`}>
                      Bebida
                    </button>
                    <button onClick={() => setForm({...form, type: 'food'})} className={`flex-1 py-3 px-4 rounded-lg border ${form.type === 'food' ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-surface-3 border-white/10 text-gray-400'}`}>
                      Comida
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Agregar Ingrediente</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={ingredientDraft.inventoryItem}
                    onChange={(e) => setIngredientDraft({ ...ingredientDraft, inventoryItem: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
                  >
                    <option value="">Seleccionar insumo...</option>
                    {inventory.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
                  </select>
                  <input
                    type="number"
                    value={ingredientDraft.quantity}
                    onChange={(e) => setIngredientDraft({ ...ingredientDraft, quantity: Number(e.target.value) })}
                    placeholder="Cantidad"
                    className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
                  />
                  <button onClick={addIngredient} className="w-full py-3 px-4 bg-gold text-black rounded-lg font-medium hover:bg-gold/90 transition-colors">
                    Agregar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ingredientes</label>
                <div className="space-y-2">
                  {form.ingredients.map((i, idx) => (
                    <div key={idx} className="bg-surface-3 p-4 rounded-lg border border-white/10 flex justify-between items-center">
                      <span className="text-gray-300">{i.inventoryItem?.name} - {i.quantity}</span>
                      <button onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-300">
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Método de Preparación</label>
                <textarea
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                  placeholder="Describe el método de preparación..."
                  className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold resize-none h-24"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Instrucciones Paso a Paso</label>
                <div className="space-y-2">
                  {(form.steps || []).map((s, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-gray-400 font-medium">{idx + 1}.</span>
                      <input
                        value={s.instruction}
                        onChange={(e) => updateStep(idx, e.target.value)}
                        placeholder="Instrucción..."
                        className="flex-1 px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
                      />
                      <button onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-300 px-2">
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addStep} className="mt-4 py-2 px-4 bg-surface-3 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors">
                  + Agregar paso
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <h3 className="text-xl font-bold text-white mb-2">Resumen de Receta</h3>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-surface-3 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gold">{form.ingredients.length}</p>
                    <p className="text-xs text-gray-400">Ingredientes</p>
                  </div>
                  <div className="bg-surface-3 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gold">{(form.steps?.length || 0)}</p>
                    <p className="text-xs text-gray-400">Pasos</p>
                  </div>
                  <div className="bg-surface-3 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gold capitalize">{form.type}</p>
                    <p className="text-xs text-gray-400">Tipo</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-6 bg-surface-3 border-t border-white/10 flex gap-4">
          <button
            onClick={step === 1 ? onClose : back}
            className="flex-1 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
          >
            {step === 1 ? "Cancelar" : "Anterior"}
          </button>
          
          {step < 5 ? (
            <button
              onClick={next}
              disabled={!canNext}
              className="flex-[2] py-3 rounded-lg bg-gold text-black font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] py-3 rounded-lg bg-gold text-black font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}