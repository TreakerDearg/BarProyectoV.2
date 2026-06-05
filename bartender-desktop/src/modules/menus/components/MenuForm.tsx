"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  AlertTriangle,
  Star,
  Search,
  Layers,
  Box,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle,
  LayoutGrid,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  Eye,

  Grid3x3,
  List,
  Info
} from "lucide-react";

import ImageUploader from "../../../components/shared/ImageUploader";
import "../../../styles/nebula-forms-theme.css";

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
  image?: string;
  imagePublicId?: string;
  categories: Category[];
}

const CATEGORY_OPTIONS = ["Barra Royale", "Gastronomía", "Especiales VIP", "Temporada Umbra", "Premium Selection"];
const TYPE_OPTIONS: { value: MenuType; label: string; icon: any }[] = [
  { value: "drink", label: "Drink List", icon: <Zap size={20} /> },
  { value: "food", label: "Menu Food", icon: <Box size={20} /> },
  { value: "mixed", label: "Mixed Exper.", icon: <LayoutGrid size={20} /> },
];

interface Props {
  menu?: any;
  onSave: (menu: Payload) => void;
  onClose: () => void;
}

// MenuIdentitySection Component
function MenuIdentitySection({ form, setForm, onImageUpload }: { form: Payload; setForm: (f: Payload) => void; onImageUpload: (url: string) => void }) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet-500/10 rounded-xl">
          <Target className="text-violet-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Identidad del Menú</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="nebula-form-label">Nombre del Menú</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Signature Cocktails 2026"
              className="nebula-form-input w-full"
            />
          </div>

          <div>
            <label className="nebula-form-label">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción del menú..."
              className="nebula-form-textarea w-full h-24"
            />
          </div>

          <div>
            <label className="nebula-form-label">Tipo</label>
            <div className="nebula-form-toggle">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, type: opt.value })}
                  className={form.type === opt.value ? 'active' : ''}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="ml-2 text-sm font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="nebula-form-label">Imagen del Menú</label>
          <ImageUploader
            onImageUpload={onImageUpload}
            currentImage={form.image}
            folder="menus"
            mode="advanced"
            label="Subir imagen"
          />
          {form.image && (
            <div className="mt-3 relative rounded-lg overflow-hidden border border-violet-500/20">
              <img src={form.image} alt="Preview" className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// MenuCategoryBuilder Component
function MenuCategoryBuilder({ form, onCategoryChange }: { form: Payload; setForm: (f: Payload) => void; onCategoryChange: (cat: string) => void }) {
  const currentCategory = form.categories[0];
  
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-cyan-500/10 rounded-xl">
          <Grid3x3 className="text-cyan-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Categoría del Menú</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentCategory?.name === cat
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'bg-white/5 text-muted hover:bg-white/10 border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-2">
          <List className="text-muted" size={16} />
          <span className="text-xs text-muted">Productos en categoría</span>
        </div>
        <span className="text-sm font-bold text-violet-400">{currentCategory?.products.length || 0}</span>
      </div>
    </div>
  );
}

// MenuProductSelector Component
function MenuProductSelector({ 
  products, 
  search, 
  setSearch, 
  currentCategory, 
  onToggleProduct, 
  onToggleFeatured,
}: { 
  products: Product[];
  search: string;
  setSearch: (s: string) => void;
  currentCategory: Category;
  onToggleProduct: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onMoveProduct: (index: number, dir: "up" | "down") => void;
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const selectedProductIds = new Set(currentCategory?.products?.map(p => p.product) || []);

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-xl">
            <Box className="text-gold" size={20} />
          </div>
          <h3 className="text-sm font-bold text-ivory">Selector de Productos</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-muted'}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-muted'}`}
          >
            <Grid3x3 size={16} />
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos por nombre o categoría..."
          className="nebula-form-input w-full pl-10"
        />
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSearch("")}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${search === "" ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-muted hover:bg-white/10'}`}
        >
          Todos
        </button>
        {[...new Set(products.map(p => p.category).filter(Boolean))].slice(0, 5).map((cat) => (
          <button
            key={cat}
            onClick={() => setSearch(cat)}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${search === cat ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-muted hover:bg-white/10'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={`grid gap-2 ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} max-h-64 overflow-y-auto nebula-forms-scroll`}>
        {Array.isArray(filteredProducts) && filteredProducts.map((product) => {
          const isSelected = product._id ? selectedProductIds.has(product._id) : false;
          const menuProduct = currentCategory?.products?.find(p => p.product === product._id);
          
          return (
            <div
              key={product._id}
              onClick={() => product._id && onToggleProduct(product._id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-violet-500/10 border-violet-500/30'
                  : 'bg-white/5 border-white/10 hover:border-violet-500/20'
              }`}
            >
              {viewMode === "grid" && product.image && (
                <div className="mb-2 rounded-lg overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-20 object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ivory truncate">{product.name}</p>
                  <p className="text-xs text-muted truncate">{product.category || 'Sin categoría'}</p>
                  {viewMode === "list" && product.price && (
                    <p className="text-xs font-semibold text-gold">${product.price.toFixed(2)}</p>
                  )}
                </div>
                {isSelected && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); product._id && onToggleFeatured(product._id); }}
                      className={`p-1 rounded transition-all ${menuProduct?.featured ? 'text-gold' : 'text-muted hover:text-gold'}`}
                    >
                      <Star size={14} fill={menuProduct?.featured ? "currentColor" : "none"} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <Info className="text-muted mx-auto mb-2" size={24} />
          <p className="text-sm text-muted">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}

// MenuPreviewCard Component
function MenuPreviewCard({ form, currentCategory }: { form: Payload; currentCategory: Category }) {
  return (
    <div className="nebula-form-card nebula-form-animate-scale-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-500/10 rounded-xl">
          <Eye className="text-emerald-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Vista Previa</h3>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-lg border border-violet-500/20">
          {form.image && (
            <img src={form.image} alt={form.name} className="w-full h-32 object-cover rounded-lg mb-3" />
          )}
          <h4 className="text-lg font-bold text-ivory">{form.name || "Sin nombre"}</h4>
          <p className="text-xs text-muted mt-1">{form.description || "Sin descripción"}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-xs font-semibold">
              {form.type}
            </span>
            <span className="px-2 py-1 bg-gold/20 text-gold rounded text-xs font-semibold">
              {currentCategory?.name}
            </span>
          </div>
        </div>

        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Productos</span>
            <span className="font-bold text-ivory">{currentCategory?.products.length || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted">Destacados</span>
            <span className="font-bold text-gold">
              {currentCategory?.products?.filter(p => p.featured).length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// MenuValidationPanel Component
function MenuValidationPanel({ errors, isValid }: { errors: string[]; isValid: boolean }) {
  if (errors.length === 0 && isValid) return null;

  return (
    <div className={`nebula-form-card ${errors.length > 0 ? 'border-red-500/30' : 'border-emerald-500/30'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${errors.length > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'} rounded-xl`}>
          {errors.length > 0 ? (
            <AlertTriangle className="text-red-400" size={20} />
          ) : (
            <CheckCircle className="text-emerald-400" size={20} />
          )}
        </div>
        <h3 className="text-sm font-bold text-ivory">
          {errors.length > 0 ? 'Validación' : 'Listo para guardar'}
        </h3>
      </div>

      {Array.isArray(errors) && errors.length > 0 ? (
        <div className="space-y-2">
          {errors.map((error, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-red-400">
              <span className="mt-0.5">•</span>
              <span>{error}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-emerald-400">Todos los campos requeridos están completos.</p>
      )}
    </div>
  );
}

export default function MenuForm({ menu, onSave, onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    identity: false,
    category: false,
    products: false,
    preview: false,
  });

  const [form, setForm] = useState<Payload>({
    name: "",
    description: "",
    active: true,
    type: "mixed",
    image: "",
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
        image: menu.image || "",
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

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  const handleCategoryChange = (categoryName: string) => {
    setForm(prev => ({
      ...prev,
      categories: [{ name: categoryName, products: [] }],
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setForm(prev => ({
      ...prev,
      image: imageUrl,
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

  const isValid = Boolean(form.name.trim() && form.categories[0].products.length > 0);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
      <div className="nebula-forms-root w-full max-w-6xl lg:max-w-7xl">
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
                  {menu ? "Editar Menú" : "Nuevo Menú"}
                </h2>
                <p className="text-xs md:text-sm text-muted">
                  Sistema Nebula de Menús
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
              {/* LEFT COLUMN - Identity & Category */}
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
                      <MenuIdentitySection form={form} setForm={setForm} onImageUpload={handleImageUpload} />
                    </div>
                  )}
                </div>

                {/* Category Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('category')}
                  >
                    <div className="flex items-center gap-3">
                      <Grid3x3 className="text-cyan-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Categoría</span>
                    </div>
                    {collapsedSections.category ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.category && (
                    <div className="nebula-form-section-content">
                      <MenuCategoryBuilder form={form} setForm={setForm} onCategoryChange={handleCategoryChange} />
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER COLUMN - Product Selector */}
              <div className="space-y-6">
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('products')}
                  >
                    <div className="flex items-center gap-3">
                      <Box className="text-gold" size={18} />
                      <span className="text-sm font-bold text-ivory">Productos</span>
                      <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded text-xs font-semibold">
                        {currentCategory?.products.length || 0}
                      </span>
                    </div>
                    {collapsedSections.products ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.products && (
                    <div className="nebula-form-section-content">
                      <MenuProductSelector
                        products={products}
                        search={search}
                        setSearch={setSearch}
                        currentCategory={currentCategory}
                        onToggleProduct={toggleProduct}
                        onToggleFeatured={toggleFeatured}
                        onMoveProduct={moveProduct}
                      />
                    </div>
                  )}
                </div>

                {/* Selected Products List */}
                {currentCategory?.products && currentCategory.products.length > 0 && (
                  <div className="nebula-form-card">
                    <div className="flex items-center gap-3 mb-4">
                      <List className="text-muted" size={18} />
                      <h3 className="text-sm font-bold text-ivory">Productos Seleccionados</h3>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto nebula-forms-scroll">
                      {Array.isArray(currentCategory?.products) && currentCategory.products.map((menuProduct, idx) => {
                        const product = products.find(p => p._id === menuProduct.product);
                        if (!product) return null;
                        
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-xs text-muted w-6">{idx + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-ivory truncate">{product.name}</p>
                                {menuProduct.featured && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star size={10} className="text-gold fill-current" />
                                    <span className="text-xs text-gold">Destacado</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveProduct(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                              >
                                <ArrowUp size={14} className="text-muted" />
                              </button>
                              <button
                                onClick={() => moveProduct(idx, 'down')}
                                disabled={idx === currentCategory.products.length - 1}
                                className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                              >
                                <ArrowDown size={14} className="text-muted" />
                              </button>
                              <button
                                onClick={() => toggleProduct(menuProduct.product)}
                                className="p-1 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <X size={14} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN - Preview & Validation */}
              <div className="space-y-6">
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('preview')}
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="text-emerald-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Vista Previa</span>
                    </div>
                    {collapsedSections.preview ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.preview && (
                    <div className="nebula-form-section-content">
                      <MenuPreviewCard form={form} currentCategory={currentCategory} />
                    </div>
                  )}
                </div>

                <MenuValidationPanel errors={errors} isValid={isValid} />
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
                  {menu ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}