"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Box, 
  DollarSign, 
  TrendingUp, 
  Image as ImageIcon, 
  Clock, 
  Tag,
  Loader2,
  Activity,
  Eye,
  Sparkles,
  Target,
  ChevronRight,
  HelpCircle,
  Upload,
  Zap
} from "lucide-react";

import "../../../styles/nebula-forms-theme.css";

import type { Product } from "../../../types/product";

const EMPTY_FORM: Product = {
  name: "",
  description: "",
  price: 0,
  cost: 0,
  category: "",
  subcategory: "",
  type: "drink",
  drinkStyle: "classic",
  image: "",
  available: true,
  featured: false,
  tags: [],
  dietaryRestrictions: [],
  preparationTime: 5,
};

const TYPE_OPTIONS = [
  { value: "drink", label: "Mixología / Bebida", icon: <Zap size={20} /> },
  { value: "food", label: "Gastronomía / Plato", icon: <Box size={20} /> },
];

const DRINK_STYLE_OPTIONS = [
  { value: "classic", label: "Clásico", description: "Recetas tradicionales establecidas" },
  { value: "author", label: "Autor", description: "Creaciones originales del bar" },
];

const PREPARATION_TIME_PRESETS = [
  { value: 3, label: "Rápido (3 min)" },
  { value: 5, label: "Normal (5 min)" },
  { value: 10, label: "Lento (10 min)" },
  { value: 15, label: "Muy lento (15 min)" },
];

const DIETARY_RESTRICTION_OPTIONS = [
  { value: "vegan", label: "Vegano", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "vegetarian", label: "Vegetariano", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "gluten-free", label: "Sin Gluten", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "dairy-free", label: "Sin Lácteos", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "nut-free", label: "Sin Frutos Secos", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { value: "sugar-free", label: "Sin Azúcar", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
];

const CATEGORY_SUGGESTIONS = [
  "Classic Cocktails",
  "Signature Drinks",
  "Mocktails",
  "Whisky",
  "Gin & Tonic",
  "Rum",
  "Tequila",
  "Vodka",
  "Wine",
  "Beer",
  "Appetizers",
  "Main Course",
  "Desserts",
  "Tapas",
  "Burgers",
];

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => Promise<void>;
  onClose: () => void;
}

// ProductIdentityCard Component
function ProductIdentityCard({ formData, setFormData }: { formData: Product; setFormData: (f: Product) => void }) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-rose/10 rounded-xl">
          <Target className="text-rose-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Product Core</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Signature Old Fashioned"
            className="w-full bg-surface-3 border-white/10 rounded-lg px-4 py-3 text-ivory focus:ring-2 focus:ring-rose/40 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Commercial Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del producto..."
            className="w-full bg-surface-3 border-white/10 rounded-lg px-4 py-3 text-ivory focus:ring-2 focus:ring-rose/40 focus:border-transparent transition-all outline-none resize-none h-24"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Menu Category</label>
          <input
            name="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ej: Classic Cocktails"
            list="category-suggestions"
            className="w-full bg-surface-3 border-white/10 rounded-lg px-4 py-3 text-ivory focus:ring-2 focus:ring-rose/40 focus:border-transparent transition-all outline-none"
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Type</label>
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFormData({ ...formData, type: opt.value as any })}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  formData.type === opt.value
                    ? 'bg-rose/10 border-rose/30 text-rose-300'
                    : 'bg-white/5 border-white/10 text-muted hover:border-white/20'
                }`}
              >
                <span className="text-lg">{opt.icon}</span>
                <span className="ml-2 text-xs font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {formData.type === "drink" && (
          <div>
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Drink Style</label>
            <div className="flex gap-2">
              {DRINK_STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, drinkStyle: opt.value as any })}
                  className={`flex-1 p-3 rounded-lg border transition-all ${
                    formData.drinkStyle === opt.value
                      ? 'bg-violet/10 border-violet/30 text-violet-300'
                      : 'bg-white/5 border-white/10 text-muted hover:border-white/20'
                  }`}
                  title={opt.description}
                >
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted mt-2 ml-1">
              {formData.drinkStyle === "author" ? "Creaciones originales del bar" : "Recetas tradicionales establecidas"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ProductFinancePanel Component
function ProductFinancePanel({ formData, setFormData }: { formData: Product; setFormData: (f: Product) => void }) {
  const margin = useMemo(() => {
    if (!formData.price || !formData.cost) return 0;
    return Math.round(((formData.price - formData.cost) / formData.price) * 100);
  }, [formData.price, formData.cost]);

  const profit = useMemo(() => {
    if (!formData.price || !formData.cost) return 0;
    return formData.price - formData.cost;
  }, [formData.price, formData.cost]);

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald/10 rounded-xl">
          <TrendingUp className="text-emerald-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Pricing & Logistics</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Sale Price</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full bg-surface-3 border-white/10 rounded-lg pl-10 pr-4 py-3 text-ivory font-mono focus:ring-2 focus:ring-emerald/40 focus:border-transparent transition-all outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Cost</label>
          <div className="relative">
            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              name="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              className="w-full bg-surface-3 border-white/10 rounded-lg pl-10 pr-4 py-3 text-ivory font-mono focus:ring-2 focus:ring-emerald/40 focus:border-transparent transition-all outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-surface-3 rounded-lg border border-white/10">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Margin</p>
            <p className={`text-xl font-bold mt-1 ${margin > 50 ? 'text-emerald-400' : margin > 30 ? 'text-cyan-400' : 'text-gold'}`}>
              {margin}%
            </p>
            <p className="text-[10px] text-muted mt-1">{margin > 50 ? 'Excellent' : margin > 30 ? 'Good' : 'Review'}</p>
          </div>
          <div className="p-4 bg-surface-3 rounded-lg border border-white/10">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Profit</p>
            <p className="text-xl font-bold text-ivory mt-1">${profit.toFixed(2)}</p>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp size={10} />
              Per unit
            </p>
          </div>
        </div>

        {formData.cost > 0 && (
          <div className="p-4 bg-rose/10 rounded-lg border border-rose/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Suggested Price (30% margin)</span>
              <span className="text-lg font-bold text-rose-300">
                ${(formData.cost / 0.7).toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => setFormData({ ...formData, price: Math.round(formData.cost / 0.7 * 100) / 100 })}
              className="w-full py-2 px-3 bg-rose/20 hover:bg-rose/30 border border-rose/30 rounded-lg text-xs font-semibold text-rose-300 transition-all"
            >
              Apply Suggested Price
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// EnhancedImageUpload Component
function EnhancedImageUpload({ currentImage, onImageUpload }: { currentImage: string | undefined; onImageUpload: (url: string) => void }) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan/10 rounded-xl">
          <ImageIcon className="text-cyan-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Image Upload</h3>
      </div>

      <div className="relative group cursor-pointer border-2 border-dashed border-white/10 rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center hover:border-rose/40 transition-colors">
        {currentImage ? (
          <>
            <img 
              src={currentImage} 
              alt="Product preview" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="relative z-10 flex flex-col items-center text-muted group-hover:text-rose-300">
              <Upload size={32} className="mb-2" />
              <p className="text-sm font-medium">Click to replace product image</p>
              <p className="text-[10px] mt-1 opacity-60">PNG, JPG up to 10MB (16:9 Recommended)</p>
            </div>
          </>
        ) : (
          <div className="relative z-10 flex flex-col items-center text-muted group-hover:text-rose-300">
            <Upload size={32} className="mb-2" />
            <p className="text-sm font-medium">Click to upload product image</p>
            <p className="text-[10px] mt-1 opacity-60">PNG, JPG up to 10MB (16:9 Recommended)</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // In a real implementation, this would upload to Cloudinary
              // For now, we'll use a placeholder
              const reader = new FileReader();
              reader.onloadend = () => {
                onImageUpload(reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

// DietaryRestrictionSelector Component
function DietaryRestrictionSelector({ formData, setFormData }: { formData: Product; setFormData: (f: Product) => void }) {
  const toggleRestriction = (restriction: "vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free") => {
    const current = formData.dietaryRestrictions || [];
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    setFormData({ ...formData, dietaryRestrictions: updated });
  };

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald/10 rounded-xl">
          <Sparkles className="text-emerald-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Restricciones Dietéticas</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DIETARY_RESTRICTION_OPTIONS.map((option) => {
          const isSelected = (formData.dietaryRestrictions || []).includes(option.value as any);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleRestriction(option.value as any)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                isSelected
                  ? option.color
                  : 'bg-white/5 border-white/10 text-muted hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ProductAttributeGrid Component
function ProductAttributeGrid({ formData, setFormData }: { formData: Product; setFormData: (f: Product) => void }) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gold/10 rounded-xl">
          <Sparkles className="text-gold" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Display Options</h3>
      </div>

      <div className="space-y-4">
        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-ivory">Highlight in Menu</span>
            <span className="text-[10px] text-muted">Adds a 'Staff Pick' badge</span>
          </div>
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="rounded bg-surface-3 border-white/10 text-rose-400 focus:ring-rose/40 focus:ring-offset-0"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-ivory">Available</span>
            <span className="text-[10px] text-muted">Product is visible in menu</span>
          </div>
          <input
            type="checkbox"
            checked={formData.available}
            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
            className="rounded bg-surface-3 border-white/10 text-emerald-400 focus:ring-emerald/40 focus:ring-offset-0"
          />
        </label>

        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Preparation Time (min)</label>
          <div className="space-y-2">
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                name="preparationTime"
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: Number(e.target.value) })}
                className="w-full bg-surface-3 border-white/10 rounded-lg pl-10 pr-4 py-3 text-ivory focus:ring-2 focus:ring-gold/40 focus:border-transparent transition-all outline-none"
                placeholder="5"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {PREPARATION_TIME_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setFormData({ ...formData, preparationTime: preset.value })}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    formData.preparationTime === preset.value
                      ? 'bg-gold text-black'
                      : 'bg-white/10 text-muted hover:bg-white/20'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">Tags</label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              name="tags"
              value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(", ").filter(t => t.trim()) })}
              className="w-full bg-surface-3 border-white/10 rounded-lg pl-10 pr-4 py-3 text-ivory focus:ring-2 focus:ring-gold/40 focus:border-transparent transition-all outline-none"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// HelpTipCard Component
function HelpTipCard() {
  return (
    <div className="bg-rose/5 border border-rose/10 p-6 rounded-xl relative overflow-hidden group">
      <HelpCircle className="absolute -right-4 -bottom-4 text-7xl text-rose-400 opacity-5 group-hover:scale-110 transition-transform" size={48} />
      <h4 className="text-rose-300 text-sm font-bold mb-2 flex items-center gap-2">
        <HelpCircle size={16} />
        Editor Tip
      </h4>
      <p className="text-xs text-muted leading-relaxed">
        Descriptions between 150-200 characters perform best for tablet-based menu displays. Avoid jargon unless specified in the brand book.
      </p>
    </div>
  );
}

// ProductPricePreview Component
function ProductPricePreview({ formData }: { formData: Product }) {
  const margin = useMemo(() => {
    if (!formData.price || !formData.cost) return 0;
    return Math.round(((formData.price - formData.cost) / formData.price) * 100);
  }, [formData.price, formData.cost]);

  return (
    <div className="nebula-form-card nebula-form-animate-scale-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet/10 rounded-xl">
          <Eye className="text-violet-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Preview</h3>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-gradient-to-br from-violet/10 to-cyan/10 rounded-lg border border-violet/20">
          {formData.image && (
            <img src={formData.image} alt={formData.name} className="w-full h-32 object-cover rounded-lg mb-3" />
          )}
          <h4 className="text-lg font-bold text-ivory">{formData.name || "Sin nombre"}</h4>
          <p className="text-xs text-muted mt-1 line-clamp-2">{formData.description || "Sin descripción"}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-gold">${formData.price.toFixed(2)}</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${margin > 50 ? 'bg-emerald/20 text-emerald-400' : 'bg-gold/20 text-gold'}`}>
              {margin}% margin
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Category</p>
            <p className="text-sm font-semibold text-ivory truncate">{formData.category || "N/A"}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Type</p>
            <p className="text-sm font-semibold text-ivory capitalize">{formData.type}</p>
          </div>
        </div>

        {Array.isArray(formData.tags) && formData.tags.length > 0 && (
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted mb-2">Tags</p>
            <div className="flex flex-wrap gap-1">
              {formData.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-violet/20 text-violet-300 rounded text-xs">
                  {tag}
                </span>
              ))}
              {formData.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-white/10 text-muted rounded text-xs">
                  +{formData.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductForm({ product, onSave, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({ ...EMPTY_FORM, ...product });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [product]);

  // Auto-save simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name || formData.price > 0) {
        setAutoSaved(true);
        setLastSaved(new Date());
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name) return setError("Product name is required");
    if (formData.price <= 0) return setError("Sale price is invalid");
    
    setLoading(true);
    setError(null);
    await onSave(formData);
    setLoading(false);
  };

  const isValid = formData.name.trim() && formData.price > 0;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* HEADER */}
      <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-surface-2">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-gradient-to-br from-rose-600 to-violet-600 rounded-xl md:rounded-2xl shadow-lg">
            <Box className="text-white" size={24} />
          </div>
          <div>
            <nav className="flex items-center gap-2 text-xs text-muted mb-1">
              <span>Catalog</span>
              <ChevronRight size={12} />
              <span className="text-rose-300 font-medium">{product ? "Edit Product" : "New Product"}</span>
            </nav>
            <h2 className="text-xl md:text-2xl font-bold text-ivory">
              {product ? "Edit Product" : "New Product"}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-surface-3 p-3 rounded-lg border border-white/10">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Visibility</span>
              <span className={`text-xs font-medium ${formData.available ? 'text-emerald-400' : 'text-muted'}`}>
                {formData.available ? 'Active' : 'Inactive'}
              </span>
            </div>
            <button
              onClick={() => setFormData({ ...formData, available: !formData.available })}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose/40 bg-emerald-500"
            >
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black/50 shadow ring-0 transition duration-200 ease-in-out translate-x-5" />
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} className="text-muted" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - ASYMMETRIC GRID LAYOUT */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* LEFT COLUMN - Image Upload & Product Core (7 columns) */}
          <div className="lg:col-span-7 space-y-8">
            <EnhancedImageUpload currentImage={formData.image} onImageUpload={handleImageUpload} />
            <ProductIdentityCard formData={formData} setFormData={setFormData} />
          </div>

          {/* RIGHT COLUMN - Pricing & Logistics + Display Options + Help Card (5 columns) */}
          <div className="lg:col-span-5 space-y-8">
            <ProductFinancePanel formData={formData} setFormData={setFormData} />
            <DietaryRestrictionSelector formData={formData} setFormData={setFormData} />
            <ProductAttributeGrid formData={formData} setFormData={setFormData} />
            <HelpTipCard />
            <ProductPricePreview formData={formData} />

            {/* Validation Panel */}
            {error && (
              <div className="nebula-form-card border-red/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-400" size={20} />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              </div>
            )}

            {isValid && !error && (
              <div className="nebula-form-card border-emerald/30">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400" size={20} />
                  <p className="text-xs text-emerald-400">Ready to save</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FIXED FOOTER */}
      <div className="fixed bottom-0 right-0 left-0 h-20 bg-black/80 backdrop-blur-xl border-t border-white/10 px-12 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          {autoSaved && lastSaved && (
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-3 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                Auto-saved {Math.floor((Date.now() - lastSaved.getTime()) / 60000)}m ago
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-muted hover:text-ivory text-sm font-bold transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="bg-rose text-black px-8 py-2.5 rounded-lg text-sm font-black shadow-lg shadow-rose/20 hover:shadow-rose/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2" size={18} />
                {product ? 'Save Changes' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}