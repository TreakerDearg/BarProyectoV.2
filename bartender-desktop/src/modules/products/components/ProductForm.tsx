"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  X, 
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
  Activity,
  ChevronDown,
  ChevronUp,
  Eye,
  Sparkles,
  Target
} from "lucide-react";

import ImageUploader from "../../../components/shared/ImageUploader";
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
  image: "",
  available: true,
  featured: false,
  tags: [],
  preparationTime: 5,
};

const TYPE_OPTIONS = [
  { value: "drink", label: "Mixología / Bebida", icon: <Zap size={20} /> },
  { value: "food", label: "Gastronomía / Plato", icon: <Box size={20} /> },
];

const PREPARATION_TIME_PRESETS = [
  { value: 3, label: "Rápido (3 min)" },
  { value: 5, label: "Normal (5 min)" },
  { value: 10, label: "Lento (10 min)" },
  { value: 15, label: "Muy lento (15 min)" },
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
function ProductIdentityCard({ formData, setFormData, onImageUpload }: { formData: Product; setFormData: (f: Product) => void; onImageUpload: (url: string) => void }) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet-500/10 rounded-xl">
          <Target className="text-violet-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Identidad del Producto</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="nebula-form-label">Nombre del Producto</label>
            <input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Signature Old Fashioned"
              className="nebula-form-input w-full"
            />
          </div>

          <div>
            <label className="nebula-form-label">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del producto..."
              className="nebula-form-textarea w-full h-24"
            />
          </div>

          <div>
            <label className="nebula-form-label">Categoría</label>
            <input
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ej: Classic Cocktails"
              list="category-suggestions"
              className="nebula-form-input w-full"
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="nebula-form-label">Tipo</label>
            <div className="nebula-form-toggle">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, type: opt.value as any })}
                  className={formData.type === opt.value ? 'active' : ''}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="ml-2 text-sm font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="nebula-form-label">Imagen Principal</label>
          <ImageUploader
            onImageUpload={onImageUpload}
            currentImage={formData.image}
            folder="products"
            mode="advanced"
            label="Subir imagen"
          />
          {formData.image && (
            <div className="mt-3 relative rounded-lg overflow-hidden border border-violet-500/20">
              <img src={formData.image} alt="Product preview" className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}
        </div>
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
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-500/10 rounded-xl">
          <TrendingUp className="text-emerald-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Panel Financiero</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="nebula-form-label">Precio de Venta</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="nebula-form-input w-full pl-10"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="nebula-form-label">Costo</label>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                name="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="nebula-form-input w-full pl-10"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-lg border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Margen de Rentabilidad</span>
              <span className={`text-2xl font-bold ${margin > 50 ? 'text-emerald-400' : margin > 30 ? 'text-cyan-400' : 'text-gold'}`}>
                {margin}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${margin > 50 ? 'bg-emerald-400' : margin > 30 ? 'bg-cyan-400' : 'bg-gold'}`} 
                style={{ width: `${Math.min(100, margin)}%` }} 
              />
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Ganancia por unidad</span>
              <span className="text-lg font-bold text-ivory">${profit.toFixed(2)}</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${margin < 30 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Estado del margen</span>
              <span className={`text-xs font-semibold ${margin > 50 ? 'text-emerald-400' : margin > 30 ? 'text-cyan-400' : 'text-red-400'}`}>
                {margin > 50 ? 'Excelente' : margin > 30 ? 'Bueno' : 'Revisar (bajo)'}
              </span>
            </div>
            {margin < 30 && (
              <div className="mt-2 flex items-start gap-2 text-xs text-red-400">
                <AlertTriangle size={12} className="mt-0.5" />
                <span>El margen es bajo. Considera aumentar el precio.</span>
              </div>
            )}
          </div>

          {formData.cost > 0 && (
            <div className="p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted">Precio sugerido (30% margen)</span>
                <span className="text-lg font-bold text-violet-400">
                  ${(formData.cost / 0.7).toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setFormData({ ...formData, price: Math.round(formData.cost / 0.7 * 100) / 100 })}
                className="w-full py-2 px-3 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg text-xs font-semibold text-violet-400 transition-all"
              >
                Aplicar precio sugerido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ProductMediaGallery Component
function ProductMediaGallery() {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-cyan-500/10 rounded-xl">
          <ImageIcon className="text-cyan-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Imagen del Producto</h3>
      </div>

      <div className="space-y-4">
        <div className="text-center py-8">
          <ImageIcon className="text-muted mx-auto mb-2" size={24} />
          <p className="text-sm text-muted">La imagen principal se gestiona en la sección de Identidad</p>
        </div>
      </div>
    </div>
  );
}

// ProductAttributeGrid Component
function ProductAttributeGrid({ formData, setFormData }: { formData: Product; setFormData: (f: Product) => void }) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gold/10 rounded-xl">
          <Sparkles className="text-gold" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Atributos del Producto</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="nebula-form-label">Tiempo de Preparación (min)</label>
            <div className="space-y-2">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  name="preparationTime"
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: Number(e.target.value) })}
                  className="nebula-form-input w-full pl-10"
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
            <label className="nebula-form-label">Etiquetas (separadas por coma)</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                value={formData.tags.join(", ")}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t) })}
                placeholder="Hot, New, Summer"
                className="nebula-form-input w-full pl-10"
              />
            </div>
            {Array.isArray(formData.tags) && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="nebula-form-tag">
                    {tag}
                    <button
                      onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) })}
                      className="nebula-form-tag-remove"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setFormData({ ...formData, available: !formData.available })}
            className={`w-full py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 ${
              formData.available
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-muted'
            }`}
          >
            <CheckCircle size={18} />
            <span className="font-semibold">{formData.available ? 'Disponible' : 'No Disponible'}</span>
          </button>

          <button
            onClick={() => setFormData({ ...formData, featured: !formData.featured })}
            className={`w-full py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 ${
              formData.featured
                ? 'bg-gold/10 border-gold/30 text-gold'
                : 'bg-white/5 border-white/10 text-muted'
            }`}
          >
            <Star size={18} fill={formData.featured ? "currentColor" : "none"} />
            <span className="font-semibold">{formData.featured ? 'Destacado' : 'No Destacado'}</span>
          </button>
        </div>
      </div>
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
        <div className="p-2 bg-violet-500/10 rounded-xl">
          <Eye className="text-violet-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Vista Previa</h3>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-lg border border-violet-500/20">
          {formData.image && (
            <img src={formData.image} alt={formData.name} className="w-full h-32 object-cover rounded-lg mb-3" />
          )}
          <h4 className="text-lg font-bold text-ivory">{formData.name || "Sin nombre"}</h4>
          <p className="text-xs text-muted mt-1 line-clamp-2">{formData.description || "Sin descripción"}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-gold">${formData.price.toFixed(2)}</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${margin > 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gold/20 text-gold'}`}>
              {margin}% margen
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Categoría</p>
            <p className="text-sm font-semibold text-ivory truncate">{formData.category || "N/A"}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Tipo</p>
            <p className="text-sm font-semibold text-ivory capitalize">{formData.type}</p>
          </div>
        </div>

        {Array.isArray(formData.tags) && formData.tags.length > 0 && (
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted mb-2">Etiquetas</p>
            <div className="flex flex-wrap gap-1">
              {formData.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded text-xs">
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
  const [collapsedSections, setCollapsedSections] = useState({
    identity: false,
    finance: false,
    media: false,
    attributes: false,
    preview: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({ ...EMPTY_FORM, ...product });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [product]);

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name) return setError("Identidad del activo requerida");
    if (formData.price <= 0) return setError("Precio de venta inválido");
    
    setLoading(true);
    setError(null);
    await onSave(formData);
    setLoading(false);
  };

  const isValid = formData.name.trim() && formData.price > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
      <div className="nebula-forms-root w-full max-w-6xl lg:max-w-7xl">
        <div className="nebula-forms-aurora" />
        
        <div className="nebula-form-panel">
          {/* HEADER */}
          <div className="p-4 md:p-6 border-b border-violet-500/10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-xl md:rounded-2xl shadow-lg">
                <Box className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-ivory">
                  {product ? "Editar Producto" : "Nuevo Producto"}
                </h2>
                <p className="text-xs md:text-sm text-muted">
                  Sistema Nebula de Productos
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
              {/* LEFT COLUMN - Identity & Finance */}
              <div className="space-y-8">
                {/* Identity Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('identity')}
                  >
                    <div className="flex items-center gap-3">
                      <Target className="text-violet-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Identidad</span>
                    </div>
                    {collapsedSections.identity ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.identity && (
                    <div className="nebula-form-section-content">
                      <ProductIdentityCard formData={formData} setFormData={setFormData} onImageUpload={handleImageUpload} />
                    </div>
                  )}
                </div>

                {/* Finance Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('finance')}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="text-emerald-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Finanzas</span>
                    </div>
                    {collapsedSections.finance ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.finance && (
                    <div className="nebula-form-section-content">
                      <ProductFinancePanel formData={formData} setFormData={setFormData} />
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER COLUMN - Media & Attributes */}
              <div className="space-y-6">
                {/* Media Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('media')}
                  >
                    <div className="flex items-center gap-3">
                      <ImageIcon className="text-cyan-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Imagen</span>
                    </div>
                    {collapsedSections.media ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.media && (
                    <div className="nebula-form-section-content">
                      <ProductMediaGallery />
                    </div>
                  )}
                </div>

                {/* Attributes Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('attributes')}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-gold" size={18} />
                      <span className="text-sm font-bold text-ivory">Atributos</span>
                    </div>
                    {collapsedSections.attributes ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.attributes && (
                    <div className="nebula-form-section-content">
                      <ProductAttributeGrid formData={formData} setFormData={setFormData} />
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Preview & Validation */}
              <div className="space-y-6">
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
                      <ProductPricePreview formData={formData} />
                    </div>
                  )}
                </div>

                {/* Validation Panel */}
                {error && (
                  <div className="nebula-form-card border-red-500/30">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-red-400" size={20} />
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  </div>
                )}

                {isValid && !error && (
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
                  {product ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}