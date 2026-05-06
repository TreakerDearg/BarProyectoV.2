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
    product: "",
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
    const exists = form.ingredients.find(i => i.inventoryItem === ingredientDraft.inventoryItem);
    if (exists) return;

    setForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...ingredientDraft, quantity: Number(ingredientDraft.quantity) }],
    }));
    setIngredientDraft(EMPTY_INGREDIENT);
  };

  const removeIngredient = (index: number) => {
    setForm(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
  };

  const addStep = () => {
    setForm(prev => ({
      ...prev,
      steps: [...prev.steps, { stepNumber: prev.steps.length + 1, instruction: "" }],
    }));
  };

  const updateStep = (index: number, value: string) => {
    setForm(prev => {
      const steps = [...prev.steps];
      steps[index].instruction = value;
      return { ...prev, steps };
    });
  };

  const removeStep = (index: number) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 })),
    }));
  };

  const moveStep = (index: number, dir: "up" | "down") => {
    setForm(prev => {
      const steps = [...prev.steps];
      const newIndex = dir === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= steps.length) return prev;
      [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
      return { ...prev, steps: steps.map((s, i) => ({ ...s, stepNumber: i + 1 })) };
    });
  };

  const canNext = useMemo(() => {
    switch (step) {
      case 1: return !!form.product;
      case 2: return form.ingredients.length > 0;
      case 4: return form.steps.length > 0;
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
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 md:p-8 animate-fade-in overflow-y-auto">
      
      {/* ATMOSPHERE */}
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[150px] -z-10 animate-pulse-slow" />
      <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-400/5 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

      <div className="w-full max-w-4xl glass-royale rounded-[3rem] overflow-hidden shadow-royale border border-white/5 animate-float my-auto">
        
        {/* HEADER */}
        <div className="p-8 md:p-10 bg-surface-3/50 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-grad-gold rounded-2xl shadow-gold-glow">
              <Layers className="text-bg" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-grad-gold tracking-tighter uppercase leading-none">
                {step === 5 ? "Validar Arquitectura" : "Nueva Arquitectura"}
              </h2>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.5em] mt-2">
                Sistema de Gestión Umbra v2.5
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-14 h-14 rounded-full flex items-center justify-center border border-white/10 hover:border-gold-border text-muted hover:text-gold transition-all">
            <X size={28} />
          </button>
        </div>

        {/* STEP PROGRESS INDICATOR */}
        <div className="px-10 py-6 bg-black/20 flex justify-between items-center gap-2">
          {stepsInfo.map((info, i) => (
            <div key={i} className="flex-1 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${step > i ? 'bg-gold text-bg' : step === i + 1 ? 'bg-white/10 text-gold border border-gold/40' : 'bg-white/5 text-muted'}`}>
                {step > i ? <CheckCircle size={14} /> : info.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest hidden lg:block ${step === i + 1 ? 'text-gold' : 'text-muted'}`}>
                {info.label}
              </span>
              {i < 4 && <div className="flex-1 h-px bg-white/5 mx-2" />}
            </div>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="p-10 md:p-14 space-y-10 min-h-[450px]">
          
          {step === 1 && (
            <div className="space-y-10 animate-slide-up">
              <div className="space-y-4">
                <p className="text-xs font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                  <Target size={14} /> Identificación de Producto
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Producto Umbra</label>
                    <select
                      value={form.product as string}
                      onChange={(e) => setForm({ ...form, product: e.target.value })}
                      className="input-royale !pl-6 appearance-none cursor-pointer"
                    >
                      <option value="">Seleccionar de base de datos...</option>
                      {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Clasificación</label>
                    <div className="flex gap-4">
                      <button onClick={() => setForm({...form, type: 'drink'})} className={`flex-1 h-16 rounded-2xl flex items-center justify-center gap-3 border transition-all ${form.type === 'drink' ? 'bg-gold/10 border-gold/40 text-gold shadow-gold-glow' : 'bg-white/5 border-white/5 text-muted'}`}>
                        <Martini size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">BAR</span>
                      </button>
                      <button onClick={() => setForm({...form, type: 'food'})} className={`flex-1 h-16 rounded-2xl flex items-center justify-center gap-3 border transition-all ${form.type === 'food' ? 'bg-emerald-400/10 border-emerald-400/40 text-emerald-400 shadow-emerald-glow' : 'bg-white/5 border-white/5 text-muted'}`}>
                        <Utensils size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">COCINA</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-slide-up">
              <div className="space-y-6">
                <p className="text-xs font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                  <Box size={14} /> Componentes e Insumos
                </p>
                <div className="flex flex-col md:flex-row gap-4 bg-surface-3/30 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                  <div className="flex-[3] space-y-2">
                    <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-1">Insumo de Inventario</label>
                    <select
                      value={ingredientDraft.inventoryItem}
                      onChange={(e) => setIngredientDraft({ ...ingredientDraft, inventoryItem: e.target.value })}
                      className="input-royale appearance-none"
                    >
                      <option value="">Seleccionar ítem...</option>
                      {inventory.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-1">Cantidad</label>
                    <input
                      type="number"
                      value={ingredientDraft.quantity}
                      onChange={(e) => setIngredientDraft({ ...ingredientDraft, quantity: Number(e.target.value) })}
                      className="input-royale"
                    />
                  </div>
                  <div className="flex-none flex items-end">
                    <button onClick={addIngredient} className="h-14 w-14 rounded-2xl bg-gold text-bg flex items-center justify-center shadow-gold-glow hover:scale-105 active:scale-95 transition-all">
                      <Plus size={24} className="stroke-[3px]" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[250px] overflow-y-auto pr-4 custom-scrollbar">
                  {form.ingredients.map((i, idx) => (
                    <div key={idx} className="bg-surface-3/50 p-5 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-gold/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold">
                          <Zap size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-ivory uppercase">{inventory.find(x => x._id === i.inventoryItem)?.name}</p>
                          <p className="text-[9px] text-muted font-bold">{i.quantity} {i.unit}</p>
                        </div>
                      </div>
                      <button onClick={() => removeIngredient(idx)} className="p-2 text-muted hover:text-red transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-slide-up">
              <p className="text-xs font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                <Zap size={14} /> Metodología de Ejecución
              </p>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Estilo de Preparación (Resumen)</label>
                <textarea
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                  placeholder="Shake, Stir, Dry Shake, Sous-vide..."
                  className="input-royale !h-32 resize-none py-6"
                />
              </div>
              <div className="p-6 bg-gold/5 rounded-2xl border border-gold/20 flex gap-6 items-center">
                <div className="w-12 h-12 rounded-xl bg-gold text-bg flex items-center justify-center flex-none">
                  <Info size={20} />
                </div>
                <p className="text-[10px] font-black text-gold/80 uppercase tracking-widest leading-relaxed">
                  Defina el método principal para que el equipo de producción aplique los estándares de calidad Umbra.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-slide-up">
              <div className="flex justify-between items-center">
                <p className="text-xs font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                  <Layers size={14} /> Secuencia Paso a Paso
                </p>
                <button onClick={addStep} className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-widest hover:opacity-80 transition-opacity">
                  <Plus size={14} /> Agregar Paso
                </button>
              </div>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                {form.steps.map((s, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-surface-4 flex items-center justify-center text-[10px] font-black text-gold border border-white/5">
                      {s.stepNumber}
                    </div>
                    <input
                      value={s.instruction}
                      onChange={(e) => updateStep(idx, e.target.value)}
                      placeholder="Escriba la instrucción técnica..."
                      className="input-royale flex-1"
                    />
                    <div className="flex gap-1">
                      <button onClick={() => moveStep(idx, "up")} className="p-2 text-muted hover:text-gold transition-colors"><ArrowUp size={16} /></button>
                      <button onClick={() => moveStep(idx, "down")} className="p-2 text-muted hover:text-gold transition-colors"><ArrowDown size={16} /></button>
                      <button onClick={() => removeStep(idx)} className="p-2 text-muted hover:text-red transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-10 animate-slide-up">
              <div className="text-center space-y-6 py-10">
                <div className="w-24 h-24 bg-gold/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-gold-glow animate-pulse">
                  <CheckCircle size={48} className="text-gold" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-ivory tracking-tighter uppercase">Validación de Arquitectura</h3>
                  <p className="text-xs text-muted font-black uppercase tracking-widest">Revisión de integridad de datos Umbra</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-surface-3/50 rounded-[2.5rem] border border-white/5 space-y-4 shadow-inner">
                  <p className="text-[10px] font-black text-gold uppercase tracking-widest">Resumen de Estructura</p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[11px] font-bold text-muted uppercase">Componentes</span>
                      <span className="text-[11px] font-black text-ivory">{form.ingredients.length} Ítems</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[11px] font-bold text-muted uppercase">Pasos Técnicos</span>
                      <span className="text-[11px] font-black text-ivory">{form.steps.length} Fases</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[11px] font-bold text-muted uppercase">Tipo de Registro</span>
                      <span className={`text-[11px] font-black uppercase ${form.type === 'drink' ? 'text-gold' : 'text-emerald-400'}`}>{form.type}</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-surface-3/50 rounded-[2.5rem] border border-white/5 flex flex-col justify-center items-center text-center space-y-4 shadow-inner">
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest italic">"Los estándares de hoy son la excelencia del mañana"</p>
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <FileText size={20} className="text-gold opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER NAVIGATION */}
        <div className="p-10 bg-surface-3 border-t border-white/10 flex gap-6 shadow-royale">
          <button
            onClick={step === 1 ? onClose : back}
            className="flex-1 h-16 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.4em] text-muted hover:text-ivory hover:bg-white/5 transition-all"
          >
            {step === 1 ? "CANCELAR" : "ANTERIOR"}
          </button>
          
          {step < 5 ? (
            <button
              onClick={next}
              disabled={!canNext}
              className="flex-[2] h-16 rounded-[1.5rem] bg-surface-glow border border-white/10 flex items-center justify-center gap-4 hover:border-gold/40 transition-all group disabled:opacity-20 disabled:grayscale"
            >
              <span className="text-xs font-black uppercase tracking-[0.3em] text-ivory">SIGUIENTE FASE</span>
              <ChevronRight size={18} className="text-gold group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] h-16 rounded-[1.5rem] bg-grad-gold text-bg shadow-gold/30 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
              <span className="text-sm font-black uppercase tracking-[0.3em]">REGISTRAR ARQUITECTURA</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}