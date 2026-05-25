"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  AlertTriangle, 
  Box, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Image as ImageIcon, 
  Clock, 
  Star, 
  Tag,
  Loader2,
  Activity
} from "lucide-react";

import ImageUploader from "../../../components/shared/ImageUploader";

import type { Product } from "../../../types/product";

const EMPTY_FORM: Product = {
  name: "",
  description: "",
  price: 0,
  cost: 0,
  category: "",
  subcategory: "",
  type: "drink",
  image: "",
  imagePublicId: "",
  gallery: [],
  galleryPublicIds: [],
  available: true,
  featured: false,
  tags: [],
  preparationTime: 5,
};

const STEPS = ["Identidad", "Finanzas", "Media", "Atributos"];
const TYPE_OPTIONS = [
  { value: "drink", label: "Mixología / Bebida", icon: <Zap size={16} /> },
  { value: "food", label: "Gastronomía / Plato", icon: <Box size={16} /> },
];

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => Promise<void>;
  onClose: () => void;
}

export default function ProductForm({ product, onSave, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>(EMPTY_FORM);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({ ...EMPTY_FORM, ...product });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    const checked = target.checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
              ["price", "cost", "preparationTime"].includes(name) ? Number(value) : value,
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const handleGalleryUpload = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), imageUrl],
    }));
  };

  const margin = useMemo(() => {
    if (!formData.price || !formData.cost) return 0;
    return Math.round(((formData.price - formData.cost) / formData.price) * 100);
  }, [formData.price, formData.cost]);

  const handleSubmit = async () => {
    if (!formData.name) return setError("Identidad del activo requerida");
    if (formData.price <= 0) return setError("Precio de venta inválido");
    
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-fade-in overflow-y-auto">
      
      {/* ATMOSPHERE */}
      <div className="fixed top-1/4 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[150px] -z-10 animate-pulse-slow" />
      <div className="fixed bottom-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-400/5 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

      <div className="w-full max-w-2xl glass-royale rounded-[3rem] overflow-hidden shadow-royale border border-white/5 animate-float my-auto">
        
        {/* HEADER */}
        <div className="p-8 md:p-10 bg-surface-3/50 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-grad-gold rounded-2xl shadow-gold-glow">
              <Box className="text-bg" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-grad-gold tracking-tighter uppercase leading-none">
                {product ? "Redefinir Activo" : "Ingreso Catálogo"}
              </h2>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.5em] mt-2">
                Paso {step + 1} de {STEPS.length} — {STEPS[step]}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-14 h-14 rounded-full flex items-center justify-center border border-white/10 hover:border-gold-border text-muted hover:text-gold transition-all">
            <X size={28} />
          </button>
        </div>

        {/* STEP INDICATOR */}
        <div className="px-10 pt-8 flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-grad-gold shadow-gold-glow' : 'bg-white/5'}`} />
          ))}
        </div>

        {/* BODY */}
        <div className="p-10 md:p-12 space-y-8 min-h-[400px]">
          
          {error && (
            <div className="p-5 bg-red/5 border border-red/20 rounded-2xl flex items-center gap-4 animate-shake">
              <AlertTriangle size={20} className="text-red" />
              <p className="text-[10px] font-black text-red uppercase tracking-widest">{error}</p>
            </div>
          )}

          {/* STEP 1: IDENTITY */}
          {step === 0 && (
            <div className="space-y-6 animate-slide-up">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Nombre del Activo</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Signature Old Fashioned" className="input-royale" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Categoría</label>
                  <input name="category" value={formData.category} onChange={handleChange} placeholder="Ej: Classic Cocktails" className="input-royale" />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Tipo de Activo</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="input-royale appearance-none">
                    {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Descripción de Experiencia</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Relato visual y gustativo..." className="input-royale !h-24 py-4 resize-none" />
              </div>
            </div>
          )}

          {/* STEP 2: FINANCES */}
          {step === 1 && (
            <div className="space-y-10 animate-slide-up">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Precio de Venta (Carta)</label>
                  <div className="relative group">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                    <input name="price" type="number" value={formData.price} onChange={handleChange} className="input-royale !pl-14 text-xl font-black text-ivory" />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Costo Técnico Estimado</label>
                  <div className="relative group">
                    <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-gold" size={20} />
                    <input name="cost" type="number" value={formData.cost} onChange={handleChange} className="input-royale !pl-14 text-xl font-black text-gold" />
                  </div>
                </div>
              </div>

              <div className="bg-surface-3/50 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={16} className={margin > 50 ? 'text-lime' : 'text-gold'} />
                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Margen de Rentabilidad</p>
                  </div>
                  <span className={`text-3xl font-black ${margin > 50 ? 'text-lime' : 'text-gold'} tracking-tighter`}>{margin}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${margin > 50 ? 'bg-lime shadow-lime-glow' : 'bg-grad-gold shadow-gold-glow'}`} style={{ width: `${Math.min(100, margin)}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MEDIA */}
          {step === 2 && (
            <div className="space-y-8 animate-slide-up">
              {/* Main Image Upload */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                  <ImageIcon size={14} /> Imagen Principal
                </p>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  currentImage={formData.image}
                  folder="products"
                  mode="advanced"
                  label="Subir imagen principal del producto"
                />
              </div>

              {/* Gallery Upload - Simplified for now */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center gap-3">
                  <ImageIcon size={14} /> Galería Adicional
                </p>
                <div className="p-4 bg-surface-3/30 rounded-2xl border border-white/5 text-center">
                  <p className="text-sm text-muted">Galería múltiple próximamente</p>
                  <p className="text-xs text-muted mt-1">Funcionalidad en desarrollo</p>
                </div>
              </div>

              {formData.image && (
                <div className="h-64 rounded-[2rem] bg-black/40 border border-white/5 overflow-hidden">
                  <img src={formData.image} alt="Product preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* STEP 4: EXTRAS */}
          {step === 3 && (
            <div className="space-y-8 animate-slide-up">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Tiempo de Prep. (Min)</label>
                  <div className="relative group">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input name="preparationTime" type="number" value={formData.preparationTime} onChange={handleChange} className="input-royale !pl-14" />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Etiquetas (Tags)</label>
                  <div className="relative group">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input 
                      value={formData.tags.join(", ")} 
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()) })}
                      placeholder="Hot, New, Summer" 
                      className="input-royale !pl-14" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({ ...formData, available: !formData.available })}
                  className={`h-20 rounded-2xl border flex items-center justify-center gap-4 transition-all ${formData.available ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400' : 'bg-white/5 border-white/5 text-muted opacity-50'}`}
                >
                  <CheckCircle size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Disponible en Red</span>
                </button>
                <button 
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                  className={`h-20 rounded-2xl border flex items-center justify-center gap-4 transition-all ${formData.featured ? 'bg-gold/10 border-gold/40 text-gold shadow-gold-glow' : 'bg-white/5 border-white/5 text-muted opacity-50'}`}
                >
                  <Star size={20} className={formData.featured ? 'fill-current' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Activo Destacado</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-10 bg-surface-3 border-t border-white/10 flex gap-6 shadow-royale">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="flex-1 h-16 rounded-[1.5rem] flex items-center justify-center gap-4 text-muted hover:text-ivory transition-all group">
              <ChevronLeft size={24} className="group-hover:-translate-x-2 transition-transform" />
              <span className="text-xs font-black uppercase tracking-[0.4em]">ANTERIOR</span>
            </button>
          ) : (
            <button onClick={onClose} className="flex-1 h-16 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.4em] text-muted hover:text-ivory transition-all">
              CANCELAR
            </button>
          )}
          
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="flex-[2] h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center gap-4 hover:border-gold/30 hover:bg-gold/5 transition-all group">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-ivory">SIGUIENTE FASE</span>
              <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform text-gold" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] h-16 rounded-[1.5rem] bg-grad-gold text-bg shadow-gold/30 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
              <span className="text-sm font-black uppercase tracking-[0.3em]">{product ? 'ACTUALIZAR ACTIVO' : 'ESTABLECER ACTIVO'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}