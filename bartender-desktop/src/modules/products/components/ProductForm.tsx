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
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      
      <div className="w-full max-w-6xl bg-surface-2 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 bg-surface-3 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold/20 rounded-xl">
              <Box className="text-gold" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {product ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <p className="text-sm text-muted">
                Paso {step + 1} de {STEPS.length}: {STEPS[step]}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} className="text-muted" />
          </button>
        </div>

        {/* STEP INDICATOR */}
        <div className="px-6 py-3 bg-surface-3/50 border-b border-white/10 flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-gold' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {error && (
            <div className="p-5 bg-red/5 border border-red/20 rounded-2xl flex items-center gap-4 animate-shake">
              <AlertTriangle size={20} className="text-red" />
              <p className="text-[10px] font-black text-red uppercase tracking-widest">{error}</p>
            </div>
          )}

          {/* STEP 1: IDENTITY */}
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Producto</label>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Signature Old Fashioned" className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción del producto..." className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold resize-none h-24" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                  <input name="category" value={formData.category} onChange={handleChange} placeholder="Ej: Classic Cocktails" className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold">
                    {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FINANCES */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Precio de Venta</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Costo</label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input name="cost" type="number" value={formData.cost} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold" />
                  </div>
                </div>
              </div>

              <div className="bg-surface-3 p-6 rounded-lg border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-300">Margen de Rentabilidad</span>
                  <span className={`text-2xl font-bold ${margin > 50 ? 'text-green-400' : 'text-gold'}`}>{margin}%</span>
                </div>
                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className={`h-full ${margin > 50 ? 'bg-green-400' : 'bg-gold'}`} style={{ width: `${Math.min(100, margin)}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MEDIA */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Imagen Principal</label>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  currentImage={formData.image}
                  folder="products"
                  mode="advanced"
                  label="Subir imagen"
                />
              </div>

              <div>
                {formData.image && (
                  <div className="h-48 bg-surface-3 rounded-lg border border-white/10 overflow-hidden">
                    <img src={formData.image} alt="Product preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: EXTRAS */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tiempo de Prep. (Min)</label>
                  <input name="preparationTime" type="number" value={formData.preparationTime} onChange={handleChange} className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Etiquetas</label>
                  <input 
                    value={formData.tags.join(", ")} 
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()) })}
                    placeholder="Hot, New, Summer" 
                    className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setFormData({ ...formData, available: !formData.available })}
                  className={`w-full py-3 px-4 rounded-lg border ${formData.available ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-surface-3 border-white/10 text-gray-400'}`}
                >
                  {formData.available ? '✓ Disponible' : '○ No Disponible'}
                </button>
                <button 
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                  className={`w-full py-3 px-4 rounded-lg border ${formData.featured ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-surface-3 border-white/10 text-gray-400'}`}
                >
                  {formData.featured ? '★ Destacado' : '○ No Destacado'}
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