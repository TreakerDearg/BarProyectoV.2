"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Check,
  AlertTriangle,
  Star,
  Search,
  Layers,
  Box,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle,
  Sparkles,
  Info,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Zap,
  Target
} from "lucide-react";

import { getProducts } from "../../products/services/productService";
import type { Product } from "../../../types/product";

type MenuType = "drink" | "food" | "mixed";

interface MenuProduct {
  product: string;
  position: number;
  featured?: boolean;
  available?: boolean;
}

interface Category {
  name: string;
  products: MenuProduct[];
}

interface Payload {
  name: string;
  description: string;
  active: boolean;
  type: MenuType;
  categories: Category[];
}

const CATEGORY_OPTIONS = ["Barra Royale", "Gastronomía", "Especiales VIP", "Temporada Umbra", "Premium Selection"];
const TYPE_OPTIONS: { value: MenuType; label: string; icon: any }[] = [
  { value: "drink", label: "Drink List", icon: <Zap size={16} /> },
  { value: "food", label: "Menu Food", icon: <Box size={16} /> },
  { value: "mixed", label: "Mixed Exper.", icon: <LayoutGrid size={16} /> },
];

interface Props {
  menu?: any;
  onSave: (menu: Payload) => void;
  onClose: () => void;
}

export default function MenuForm({ menu, onSave, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<Payload>({
    name: "",
    description: "",
    active: true,
    type: "mixed",
    categories: [{ name: CATEGORY_OPTIONS[0], products: [] }],
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (menu) {
      setForm({
        name: menu.name,
        description: menu.description,
        active: menu.active,
        type: menu.type || "mixed",
        categories: menu.categories?.length
          ? menu.categories
          : [{ name: CATEGORY_OPTIONS[0], products: [] }],
      });
    }
    loadProducts();
  }, [menu]);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data || []);
  };

  const currentCategory = form.categories[0];

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const toggleProduct = (id: string) => {
    const exists = currentCategory.products.find(p => p.product === id);
    let updated;
    if (exists) {
      updated = currentCategory.products.filter(p => p.product !== id);
    } else {
      updated = [
        ...currentCategory.products,
        {
          product: id,
          position: currentCategory.products.length,
          featured: false,
          available: true,
        },
      ];
    }
    updateProducts(updated);
  };

  const toggleFeatured = (id: string) => {
    updateProducts(
      currentCategory.products.map(p =>
        p.product === id ? { ...p, featured: !p.featured } : p
      )
    );
  };

  const moveProduct = (index: number, dir: "up" | "down") => {
    const arr = [...currentCategory.products];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    updateProducts(arr.map((p, i) => ({ ...p, position: i })));
  };

  const updateProducts = (products: MenuProduct[]) => {
    setForm(prev => ({
      ...prev,
      categories: [{ ...prev.categories[0], products }],
    }));
  };

  const validate = () => {
    const err: string[] = [];
    if (!form.name.trim()) err.push("Se requiere un nombre estratégico");
    if (form.categories[0].products.length === 0) err.push("Debe vincular al menos un producto");
    setErrors(err);
    return err.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-fade-in overflow-y-auto">
      
      {/* ATMOSPHERE */}
      <div className="fixed top-1/4 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[150px] -z-10 animate-pulse-slow" />
      <div className="fixed bottom-1/4 left-1/4 w-[300px] h-[300px] bg-brand/5 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

      <div className="w-full max-w-6xl glass-royale rounded-[3rem] overflow-hidden shadow-royale border border-white/5 animate-float my-auto">
        
        {/* HEADER */}
        <div className="p-8 md:p-10 bg-surface-3/50 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-grad-gold rounded-2xl shadow-gold-glow">
              <Layers className="text-bg" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-grad-gold tracking-tighter uppercase leading-none">
                {menu ? "Redefinir Carta" : "Arquitecto de Carta"}
              </h2>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.5em] mt-2">
                Estrategia de Experiencia Umbra v3.0
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-14 h-14 rounded-full flex items-center justify-center border border-white/10 hover:border-gold-border text-muted hover:text-gold transition-all">
            <X size={28} />
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 h-[650px]">
          
          {/* LEFT: STRATEGY CONFIG (4 cols) */}
          <div className="lg:col-span-4 p-10 border-b lg:border-b-0 lg:border-r border-white/5 space-y-8 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
              <Target size={14} /> Configuración Base
            </p>

            <div className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Identidad de Carta</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Signature Cocktails 2026"
                  className="input-royale"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Propósito Estratégico</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Defina la experiencia del cliente..."
                  className="input-royale !h-24 py-4 resize-none"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Categoría Principal</label>
                <select
                  value={currentCategory.name}
                  onChange={(e) => setForm({ ...form, categories: [{ ...currentCategory, name: e.target.value }] })}
                  className="input-royale appearance-none cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Tipo de Servicio</label>
                <div className="grid grid-cols-3 gap-3">
                  {TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setForm({ ...form, type: opt.value })}
                      className={`h-14 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${form.type === opt.value ? 'bg-gold/10 border-gold/40 text-gold shadow-gold-glow' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'}`}
                    >
                      {opt.icon}
                      <span className="text-[8px] font-black uppercase tracking-tighter">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="p-5 bg-red/5 border border-red/20 rounded-2xl space-y-2 animate-shake">
                {errors.map((e, i) => (
                  <p key={i} className="text-[9px] font-black text-red uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={10} /> {e}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* CENTER: PRODUCT SELECTOR (4 cols) */}
          <div className="lg:col-span-4 p-10 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col gap-8 bg-black/20">
            <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
              <Box size={14} /> Catálogo de Productos
            </p>

            <div className="relative group">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold transition-colors" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Escanear catálogo..."
                className="input-royale !pl-14 !h-14 !rounded-2xl"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {filteredProducts.map((p) => {
                const isSelected = currentCategory.products.some(x => x.product === p._id);
                return (
                  <div
                    key={p._id}
                    onClick={() => toggleProduct(p._id!)}
                    className={`p-5 rounded-[1.5rem] cursor-pointer flex justify-between items-center border transition-all ${isSelected ? 'bg-gold/10 border-gold/40 shadow-gold-glow' : 'bg-surface-3/30 border-white/5 hover:border-white/10'}`}
                  >
                    <div>
                      <p className={`text-xs font-black uppercase tracking-tight ${isSelected ? 'text-gold' : 'text-ivory'}`}>{p.name}</p>
                      <p className="text-[9px] text-muted font-bold uppercase tracking-widest">{p.category || 'Gral'}</p>
                    </div>
                    {isSelected ? <CheckCircle size={18} className="text-gold" /> : <Plus size={18} className="text-muted opacity-30" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: COMPOSITION PREVIEW (4 cols) */}
          <div className="lg:col-span-4 p-10 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                <Sparkles size={14} /> Estructura de Carta
              </p>
              <span className="text-[10px] font-black text-muted bg-white/5 px-3 py-1 rounded-full">{currentCategory.products.length} Items</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {currentCategory.products.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center gap-4">
                  <Box size={48} />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Seleccione productos para<br/>componer la carta</p>
                </div>
              ) : (
                currentCategory.products.map((item, idx) => {
                  const prod = products.find(x => x._id === item.product);
                  if (!prod) return null;
                  return (
                    <div key={item.product} className="bg-surface-4 p-5 rounded-[1.8rem] border border-white/5 flex flex-col gap-4 group hover:border-gold/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] text-muted font-black uppercase tracking-widest mb-1">POSICIÓN {idx + 1}</p>
                          <h4 className="text-xs font-black text-ivory uppercase tracking-tight">{prod.name}</h4>
                        </div>
                        <button
                          onClick={() => toggleFeatured(item.product)}
                          className={`p-2 rounded-xl transition-all ${item.featured ? 'bg-gold/20 text-gold shadow-gold-glow' : 'bg-white/5 text-muted hover:text-gold'}`}
                        >
                          <Star size={14} className={item.featured ? 'fill-current' : ''} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <div className="flex gap-2">
                          <button onClick={() => moveProduct(idx, "up")} className="p-1.5 rounded-lg bg-white/5 text-muted hover:text-gold transition-colors"><ArrowUp size={12} /></button>
                          <button onClick={() => moveProduct(idx, "down")} className="p-1.5 rounded-lg bg-white/5 text-muted hover:text-gold transition-colors"><ArrowDown size={12} /></button>
                        </div>
                        <button onClick={() => toggleProduct(item.product)} className="text-[9px] font-black text-red uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Eliminar</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-10 bg-surface-3 border-t border-white/10 flex gap-6 shadow-royale">
          <button
            onClick={onClose}
            className="flex-1 h-16 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.4em] text-muted hover:text-ivory hover:bg-white/5 transition-all"
          >
            CANCELAR
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] h-16 rounded-[1.5rem] bg-grad-gold text-bg shadow-gold/30 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
            <span className="text-sm font-black uppercase tracking-[0.3em]">{menu ? 'ACTUALIZAR CARTA' : 'ESTABLECER CARTA'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}