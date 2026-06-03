"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  X, 
  Layers, 
  Zap, 
  CheckCircle, 
  Loader2, 
  Trash2, 
  Plus,
  ArrowUp,
  ArrowDown,
  Info,
  Target,
  ChevronDown,
  ChevronUp,
  Eye,
  Calculator,
  Beaker,
  ListOrdered,
  Martini,
  Utensils
} from "lucide-react";

import { getProducts } from "../../../modules/products/services/productService";
import { getInventory } from "../../../modules/inventory/services/inventoryService";
import "../../../styles/nebula-forms-theme.css";

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

// RecipeProductSelector Component
function RecipeProductSelector({ form, setForm, products }: { form: Recipe; setForm: (f: Recipe) => void; products: any[] }) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet-500/10 rounded-xl">
          <Target className="text-violet-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Producto Asociado</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="nebula-form-label">Seleccionar Producto</label>
          <select
            value={form.product?._id || ""}
            onChange={(e) => {
              const selectedProduct = products.find(p => p._id === e.target.value);
              setForm({
                ...form,
                product: selectedProduct ? { _id: selectedProduct._id, name: selectedProduct.name } : { _id: "", name: "" }
              });
            }}
            className="nebula-form-select w-full"
          >
            <option value="">Seleccionar producto...</option>
            {Array.isArray(products) && products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="nebula-form-label">Tipo de Receta</label>
          <div className="nebula-form-toggle">
            <button
              onClick={() => setForm({ ...form, type: 'drink' as any })}
              className={form.type === 'drink' ? 'active' : ''}
            >
              <Martini size={16} />
              <span className="ml-1">Bebida</span>
            </button>
            <button
              onClick={() => setForm({ ...form, type: 'food' as any })}
              className={form.type === 'food' ? 'active' : ''}
            >
              <Utensils size={16} />
              <span className="ml-1">Comida</span>
            </button>
          </div>
        </div>

        {form.product?._id && (
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-emerald-400" size={16} />
              <span className="text-xs text-emerald-400">Producto seleccionado: {form.product.name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// IngredientBuilder Component
function IngredientBuilder({ form, setForm, inventory, ingredientDraft, setIngredientDraft }: { 
  form: Recipe; 
  setForm: (f: Recipe) => void; 
  inventory: any[];
  ingredientDraft: any;
  setIngredientDraft: (d: any) => void;
}) {
  const totalCost = useMemo(() => {
    return form.ingredients.reduce((sum, ing) => {
      const item = inventory.find(i => i._id === ing.inventoryItem?._id);
      if (!item) return sum;
      const unitCost = item.cost || 0;
      const quantity = ing.quantity || 0;
      let cost = 0;
      
      // Convert units to base unit for cost calculation
      if (ing.unit === 'ml' && item.unit === 'l') {
        cost = (quantity / 1000) * unitCost;
      } else if (ing.unit === 'l' && item.unit === 'ml') {
        cost = quantity * 1000 * unitCost;
      } else if (ing.unit === 'g' && item.unit === 'kg') {
        cost = (quantity / 1000) * unitCost;
      } else if (ing.unit === 'kg' && item.unit === 'g') {
        cost = quantity * 1000 * unitCost;
      } else {
        cost = quantity * unitCost;
      }
      
      return sum + cost;
    }, 0);
  }, [form.ingredients, inventory]);

  const addIngredient = () => {
    if (!ingredientDraft.inventoryItem) return;
    const exists = form.ingredients.find(i => i.inventoryItem?._id === ingredientDraft.inventoryItem);
    if (exists) return;

    const selectedItem = inventory.find(inv => inv._id === ingredientDraft.inventoryItem);
    if (!selectedItem) return;

    // Validate quantity
    if (ingredientDraft.quantity <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    if (ingredientDraft.quantity > 10000) {
      alert('La cantidad parece demasiado alta. Por favor verifica.');
      return;
    }

    setForm({
      ...form,
      ingredients: [
        ...form.ingredients,
        {
          inventoryItem: { _id: selectedItem._id, name: selectedItem.name },
          quantity: Number(ingredientDraft.quantity),
          unit: ingredientDraft.unit as any
        }
      ],
    });
    setIngredientDraft(EMPTY_INGREDIENT);
  };

  const removeIngredient = (index: number) => {
    setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== index) });
  };

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-cyan-500/10 rounded-xl">
          <Beaker className="text-cyan-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Constructor de Ingredientes</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="nebula-form-label">Insumo</label>
            <select
              value={ingredientDraft.inventoryItem}
              onChange={(e) => setIngredientDraft({ ...ingredientDraft, inventoryItem: e.target.value })}
              className="nebula-form-select w-full"
            >
              <option value="">Seleccionar...</option>
              {Array.isArray(inventory) && inventory.map((i) => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)}
            </select>
          </div>
          <div>
            <label className="nebula-form-label">Cantidad</label>
            <input
              type="number"
              value={ingredientDraft.quantity}
              onChange={(e) => setIngredientDraft({ ...ingredientDraft, quantity: Number(e.target.value) })}
              placeholder="1"
              min="0.1"
              step="0.1"
              className="nebula-form-input w-full"
            />
          </div>
          <div>
            <label className="nebula-form-label">Unidad</label>
            <select
              value={ingredientDraft.unit}
              onChange={(e) => setIngredientDraft({ ...ingredientDraft, unit: e.target.value })}
              className="nebula-form-select w-full"
            >
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="unit">unidad</option>
              <option value="oz">oz</option>
            </select>
          </div>
        </div>

        <button onClick={addIngredient} className="nebula-form-button-accent w-full">
          <Plus size={16} className="mr-2" />
          Agregar Ingrediente
        </button>

        <div className="space-y-2 max-h-48 overflow-y-auto nebula-forms-scroll">
          {Array.isArray(form.ingredients) && form.ingredients.map((i, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs text-muted w-6">{idx + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ivory truncate">{i.inventoryItem?.name}</p>
                  <p className="text-xs text-muted">{i.quantity} {i.unit}</p>
                </div>
              </div>
              <button
                onClick={() => removeIngredient(idx)}
                className="p-1 hover:bg-red-500/10 rounded transition-colors"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>

        {form.ingredients.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-gold/10 to-amber-500/10 rounded-lg border border-gold/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Costo total de ingredientes</span>
              <span className="text-2xl font-bold text-gold">${totalCost.toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted">
              {form.ingredients.length} ingrediente{form.ingredients.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {form.ingredients.length === 0 && (
          <div className="text-center py-4">
            <Info className="text-muted mx-auto mb-2" size={20} />
            <p className="text-sm text-muted">No hay ingredientes agregados</p>
          </div>
        )}
      </div>
    </div>
  );
}

// MethodEditor Component
function MethodEditor({ form, setForm }: { form: Recipe; setForm: (f: Recipe) => void }) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gold/10 rounded-xl">
          <Zap className="text-gold" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Metodología</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="nebula-form-label">Método de Preparación</label>
          <textarea
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            placeholder="Describe el método de preparación..."
            className="nebula-form-textarea w-full h-32"
          />
        </div>

        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <Info className="text-muted" size={16} />
            <span className="text-xs text-muted">Describe la técnica, temperatura, tiempo y otros detalles importantes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// StepSequenceBuilder Component
function StepSequenceBuilder({ form, setForm }: { form: Recipe; setForm: (f: Recipe) => void }) {
  const addStep = () => {
    setForm({
      ...form,
      steps: [...(form.steps || []), { stepNumber: (form.steps?.length || 0) + 1, instruction: "" }],
    });
  };

  const updateStep = (index: number, value: string) => {
    const steps = [...(form.steps || [])];
    if (steps[index]) {
      steps[index].instruction = value;
    }
    setForm({ ...form, steps });
  };

  const removeStep = (index: number) => {
    setForm({
      ...form,
      steps: (form.steps || []).filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 })),
    });
  };

  const moveStep = (index: number, dir: "up" | "down") => {
    const steps = [...(form.steps || [])];
    const newIndex = dir === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
    setForm({ ...form, steps: steps.map((s, i) => ({ ...s, stepNumber: i + 1 })) });
  };

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-500/10 rounded-xl">
          <ListOrdered className="text-emerald-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Secuencia de Pasos</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2 max-h-64 overflow-y-auto nebula-forms-scroll">
          {Array.isArray(form.steps) && form.steps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-xs text-muted w-6 font-bold">{idx + 1}</span>
              <input
                value={s.instruction}
                onChange={(e) => updateStep(idx, e.target.value)}
                placeholder="Instrucción..."
                className="nebula-form-input flex-1 text-sm"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => moveStep(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                >
                  <ArrowUp size={14} className="text-muted" />
                </button>
                <button
                  onClick={() => moveStep(idx, 'down')}
                  disabled={idx === (form.steps?.length || 0) - 1}
                  className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                >
                  <ArrowDown size={14} className="text-muted" />
                </button>
                <button
                  onClick={() => removeStep(idx)}
                  className="p-1 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addStep} className="nebula-form-button-secondary w-full">
          <Plus size={16} className="mr-2" />
          Agregar Paso
        </button>

        {(form.steps?.length || 0) === 0 && (
          <div className="text-center py-4">
            <ListOrdered className="text-muted mx-auto mb-2" size={20} />
            <p className="text-sm text-muted">No hay pasos agregados</p>
          </div>
        )}
      </div>
    </div>
  );
}

// RecipeCostCalculator Component
function RecipeCostCalculator({ form, inventory }: { form: Recipe; inventory: any[] }) {
  const totalCost = useMemo(() => {
    return form.ingredients.reduce((total, ing) => {
      const item = inventory.find(inv => inv._id === ing.inventoryItem?._id);
      if (!item) return total;
      return total + (item.cost * ing.quantity);
    }, 0);
  }, [form.ingredients, inventory]);

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gold/10 rounded-xl">
          <Calculator className="text-gold" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Calculadora de Costos</h3>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-gradient-to-br from-gold/10 to-amber-500/10 rounded-lg border border-gold/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">Costo total de ingredientes</span>
            <span className="text-2xl font-bold text-gold">${totalCost.toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted">
            Basado en {form.ingredients.length} ingredientes
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Ingredientes</p>
            <p className="text-lg font-bold text-ivory">{form.ingredients.length}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Promedio/ingrediente</p>
            <p className="text-lg font-bold text-ivory">
              ${form.ingredients.length > 0 ? (totalCost / form.ingredients.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// RecipePreview Component
function RecipePreview({ form }: { form: Recipe }) {
  return (
    <div className="nebula-form-card nebula-form-animate-scale-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet-500/10 rounded-xl">
          <Eye className="text-violet-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Vista Previa</h3>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-lg border border-violet-500/20">
          <h4 className="text-lg font-bold text-ivory">{form.product?.name || "Sin producto"}</h4>
          <p className="text-xs text-muted mt-1 capitalize">{form.type}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-xs font-semibold">
              {form.ingredients.length} ingredientes
            </span>
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-semibold">
              {(form.steps?.length || 0)} pasos
            </span>
          </div>
        </div>

        {form.method && (
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted mb-1">Método</p>
            <p className="text-sm text-ivory line-clamp-2">{form.method}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Ingredientes</p>
            <p className="text-lg font-bold text-ivory">{form.ingredients.length}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Pasos</p>
            <p className="text-lg font-bold text-ivory">{form.steps?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipeForm({ onSave, onClose }: Props) {
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    product: false,
    ingredients: false,
    method: false,
    steps: false,
    cost: false,
    preview: false,
  });

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

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async () => {
    if (!form.product?._id) return;
    if (form.ingredients.length === 0) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  const isValid = form.product?._id && form.ingredients.length > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="nebula-forms-root w-full max-w-7xl">
        <div className="nebula-forms-aurora" />
        
        <div className="nebula-form-panel">
          {/* HEADER */}
          <div className="p-4 md:p-6 border-b border-violet-500/10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-xl md:rounded-2xl shadow-lg">
                <Layers className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-ivory">
                  Nueva Receta
                </h2>
                <p className="text-xs md:text-sm text-muted">
                  Sistema Nebula de Recetas
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X size={24} className="text-muted" />
            </button>
          </div>

          {/* MAIN CONTENT - 3 COLUMN LAYOUT */}
          <div className="p-6 md:p-8 flex-1 overflow-y-auto nebula-forms-scroll">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* LEFT COLUMN - Product & Ingredients */}
              <div className="space-y-6">
                {/* Product Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('product')}
                  >
                    <div className="flex items-center gap-3">
                      <Target className="text-violet-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Producto</span>
                    </div>
                    {collapsedSections.product ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.product && (
                    <div className="nebula-form-section-content">
                      <RecipeProductSelector form={form} setForm={setForm} products={products} />
                    </div>
                  )}
                </div>

                {/* Ingredients Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('ingredients')}
                  >
                    <div className="flex items-center gap-3">
                      <Beaker className="text-cyan-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Ingredientes</span>
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs font-semibold">
                        {form.ingredients.length}
                      </span>
                    </div>
                    {collapsedSections.ingredients ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.ingredients && (
                    <div className="nebula-form-section-content">
                      <IngredientBuilder 
                        form={form} 
                        setForm={setForm} 
                        inventory={inventory} 
                        ingredientDraft={ingredientDraft}
                        setIngredientDraft={setIngredientDraft}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER COLUMN - Method & Steps */}
              <div className="space-y-6">
                {/* Method Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('method')}
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="text-gold" size={18} />
                      <span className="text-sm font-bold text-ivory">Metodología</span>
                    </div>
                    {collapsedSections.method ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.method && (
                    <div className="nebula-form-section-content">
                      <MethodEditor form={form} setForm={setForm} />
                    </div>
                  )}
                </div>

                {/* Steps Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('steps')}
                  >
                    <div className="flex items-center gap-3">
                      <ListOrdered className="text-emerald-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Pasos</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-semibold">
                        {form.steps?.length || 0}
                      </span>
                    </div>
                    {collapsedSections.steps ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.steps && (
                    <div className="nebula-form-section-content">
                      <StepSequenceBuilder form={form} setForm={setForm} />
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Cost & Preview */}
              <div className="space-y-8">
                {/* Cost Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('cost')}
                  >
                    <div className="flex items-center gap-3">
                      <Calculator className="text-gold" size={18} />
                      <span className="text-sm font-bold text-ivory">Costos</span>
                    </div>
                    {collapsedSections.cost ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.cost && (
                    <div className="nebula-form-section-content">
                      <RecipeCostCalculator form={form} inventory={inventory} />
                    </div>
                  )}
                </div>

                {/* Preview Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('preview')}
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="text-violet-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Vista Previa</span>
                    </div>
                    {collapsedSections.preview ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.preview && (
                    <div className="nebula-form-section-content">
                      <RecipePreview form={form} />
                    </div>
                  )}
                </div>

                {/* Validation Panel */}
                {!isValid && (
                  <div className="nebula-form-card border-red-500/30">
                    <div className="flex items-center gap-3">
                      <Info className="text-red-400" size={20} />
                      <p className="text-xs text-red-400">
                        {!form.product?._id ? "Selecciona un producto" : "Agrega al menos un ingrediente"}
                      </p>
                    </div>
                  </div>
                )}

                {isValid && (
                  <div className="nebula-form-card border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-emerald-400" size={20} />
                      <p className="text-xs text-emerald-400">Listo para guardar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 md:p-6 border-t border-violet-500/10 flex gap-3 md:gap-4 shrink-0">
            <button
              onClick={onClose}
              className="nebula-form-button-secondary flex-1 text-sm md:text-base"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !isValid}
              className="nebula-form-button-primary flex-[2] text-sm md:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={18} />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}