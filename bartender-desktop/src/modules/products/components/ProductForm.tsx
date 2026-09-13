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
  Zap,
  Info,
  Layers,
} from "lucide-react";

import "../../../styles/nebula-forms-theme.css";

import api from "../../../services/api";
import type { Product } from "../../../types/product";

// ── Constantes ────────────────────────────────────────────────────

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
  { value: "drink", label: "Mixología / Bebida", icon: <Zap size={18} /> },
  { value: "food",  label: "Gastronomía / Plato", icon: <Box size={18} /> },
];

const DRINK_STYLE_OPTIONS = [
  { value: "classic", label: "Clásico",  description: "Recetas tradicionales establecidas" },
  { value: "author",  label: "De Autor", description: "Creaciones originales del bar" },
];

const PREPARATION_TIME_PRESETS = [
  { value: 3,  label: "3 min"  },
  { value: 5,  label: "5 min"  },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
];

const DIETARY_RESTRICTION_OPTIONS = [
  { value: "vegan",       label: "Vegano",           color: "bg-green-500/20 text-green-400 border-green-500/30"   },
  { value: "vegetarian",  label: "Vegetariano",       color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "gluten-free", label: "Sin Gluten",        color: "bg-amber-500/20 text-amber-400 border-amber-500/30"  },
  { value: "dairy-free",  label: "Sin Lácteos",       color: "bg-blue-500/20 text-blue-400 border-blue-500/30"    },
  { value: "nut-free",    label: "Sin Frutos Secos",  color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { value: "sugar-free",  label: "Sin Azúcar",        color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
];

// ── Tipos ─────────────────────────────────────────────────────────

interface FieldErrors {
  name?: string;
  price?: string;
  cost?: string;
  preparationTime?: string;
}

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => Promise<void>;
  onClose: () => void;
  /** Categorías reales del backend para poblar el datalist dinámicamente */
  categoryNames?: string[];
}

// ── Helpers ───────────────────────────────────────────────────────

function inputCls(hasError?: boolean) {
  return `w-full bg-surface-3 rounded-lg px-4 py-3 text-ivory transition-all outline-none ${
    hasError
      ? "border border-red-500/60 focus:ring-2 focus:ring-red-500/30"
      : "border border-white/10 focus:ring-2 focus:ring-rose/40 focus:border-transparent"
  }`;
}

// ── Subcomponentes ────────────────────────────────────────────────

/** Mensaje de error inline bajo un campo */
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-red-400 mt-1.5 ml-1">
      <AlertTriangle size={11} />
      {msg}
    </p>
  );
}

// ProductIdentityCard
function ProductIdentityCard({
  formData,
  setFormData,
  fieldErrors,
  categoryNames,
}: {
  formData: Product;
  setFormData: (f: Product) => void;
  fieldErrors: FieldErrors;
  categoryNames: string[];
}) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-rose/10 rounded-xl">
          <Target className="text-rose-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Identidad del producto</h3>
      </div>

      <div className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Old Fashioned Signature"
            maxLength={100}
            className={inputCls(!!fieldErrors.name)}
          />
          <div className="flex justify-between mt-1">
            <FieldError msg={fieldErrors.name} />
            <span className={`text-[10px] ml-auto ${formData.name.length > 90 ? "text-red-400" : "text-muted/50"}`}>
              {formData.name.length}/100
            </span>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
            Descripción comercial
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción para la carta del cliente…"
            maxLength={300}
            className={`${inputCls()} resize-none h-[88px]`}
          />
          <div className="flex justify-between mt-1">
            <span className={`text-[10px] ml-1 ${formData.description.length >= 150 && formData.description.length <= 200 ? "text-emerald-400" : "text-muted/50"}`}>
              {formData.description.length >= 150 && formData.description.length <= 200
                ? "✓ Longitud ideal"
                : "Recomendado: 150–200 caracteres"}
            </span>
            <span className={`text-[10px] ${formData.description.length > 270 ? "text-red-400" : "text-muted/50"}`}>
              {formData.description.length}/300
            </span>
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
            Categoría
          </label>
          <input
            name="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ej: Cócteles Clásicos"
            list="category-suggestions"
            maxLength={60}
            className={inputCls()}
          />
          <datalist id="category-suggestions">
            {categoryNames.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        {/* Subcategoría */}
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2 flex items-center gap-1.5">
            Subcategoría
            <span className="text-muted/40 font-normal normal-case tracking-normal">(opcional)</span>
          </label>
          <div className="relative">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={15} />
            <input
              name="subcategory"
              value={formData.subcategory ?? ""}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              placeholder="Ej: Whisky Ahumado"
              maxLength={60}
              className={`${inputCls()} pl-10`}
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
            Tipo de producto
          </label>
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: opt.value as "drink" | "food" })}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                  formData.type === opt.value
                    ? "bg-rose/10 border-rose/30 text-rose-300"
                    : "bg-white/5 border-white/10 text-muted hover:border-white/20"
                }`}
              >
                {opt.icon}
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Estilo de bebida — solo para drinks */}
        {formData.type === "drink" && (
          <div>
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
              Estilo de bebida
            </label>
            <div className="flex gap-2">
              {DRINK_STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, drinkStyle: opt.value as "classic" | "author" })}
                  className={`flex-1 p-3 rounded-lg border transition-all ${
                    formData.drinkStyle === opt.value
                      ? "bg-violet/10 border-violet/30 text-violet-300"
                      : "bg-white/5 border-white/10 text-muted hover:border-white/20"
                  }`}
                  title={opt.description}
                >
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted mt-1.5 ml-1">
              {formData.drinkStyle === "author"
                ? "Creaciones originales del bar"
                : "Recetas tradicionales establecidas"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ProductFinancePanel
function ProductFinancePanel({
  formData,
  setFormData,
  fieldErrors,
}: {
  formData: Product;
  setFormData: (f: Product) => void;
  fieldErrors: FieldErrors;
}) {
  const margin = useMemo(() => {
    if (!formData.price || !formData.cost) return 0;
    return Math.round(((formData.price - formData.cost) / formData.price) * 100);
  }, [formData.price, formData.cost]);

  const profit = useMemo(() => {
    if (!formData.price || !formData.cost) return 0;
    return formData.price - formData.cost;
  }, [formData.price, formData.cost]);

  const marginColor =
    margin > 50 ? "text-emerald-400" : margin > 30 ? "text-cyan-400" : "text-gold";
  const marginLabel =
    margin > 50 ? "Excelente" : margin > 30 ? "Bueno" : "Revisar";

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald/10 rounded-xl">
          <TrendingUp className="text-emerald-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Precios y Logística</h3>
      </div>

      <div className="space-y-5">
        {/* Precio de venta */}
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
            Precio de venta <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className={`${inputCls(!!fieldErrors.price)} pl-10 font-mono`}
              placeholder="0.00"
            />
          </div>
          <FieldError msg={fieldErrors.price} />
        </div>

        {/* Costo */}
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2 flex items-center gap-1.5">
            Costo
            <span className="text-muted/40 font-normal normal-case tracking-normal">(opcional)</span>
          </label>
          <div className="relative">
            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              name="cost"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost || ""}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              className={`${inputCls(!!fieldErrors.cost)} pl-10 font-mono`}
              placeholder="0.00"
            />
          </div>
          <FieldError msg={fieldErrors.cost} />
          {!fieldErrors.cost && formData.price > 0 && formData.cost <= 0 && (
            <p className="flex items-center gap-1 text-[11px] text-amber-400/70 mt-1.5 ml-1">
              <Info size={11} />
              Sin costo definido — el margen no se calculará
            </p>
          )}
        </div>

        {/* Métricas */}
        {formData.cost > 0 && formData.price > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-surface-3 rounded-lg border border-white/10">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Margen</p>
                <p className={`text-xl font-bold mt-1 ${marginColor}`}>{margin}%</p>
                <p className={`text-[10px] mt-1 ${marginColor}`}>{marginLabel}</p>
              </div>
              <div className="p-4 bg-surface-3 rounded-lg border border-white/10">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Ganancia</p>
                <p className="text-xl font-bold text-ivory mt-1">${profit.toFixed(2)}</p>
                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp size={10} />
                  Por unidad
                </p>
              </div>
            </div>

            <div className="p-4 bg-rose/10 rounded-lg border border-rose/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted">Precio sugerido (margen 30%)</span>
                <span className="text-lg font-bold text-rose-300">
                  ${(formData.cost / 0.7).toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    price: Math.round((formData.cost / 0.7) * 100) / 100,
                  })
                }
                className="w-full py-2 px-3 bg-rose/20 hover:bg-rose/30 border border-rose/30 rounded-lg text-xs font-semibold text-rose-300 transition-all"
              >
                Aplicar precio sugerido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// EnhancedImageUpload
function EnhancedImageUpload({
  currentImage,
  onImageUpload,
  onFileSelect,
}: {
  currentImage: string | undefined;
  onImageUpload: (url: string, publicId: string) => void;
  onFileSelect?: (file: File | null) => void;
}) {
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);
    onFileSelect?.(file);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const result = (await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })) as any;

      const url      = result?.data?.url      || result?.url      || "";
      const publicId = result?.data?.publicId  || result?.publicId || "";

      if (url) {
        onImageUpload(url, publicId);
        URL.revokeObjectURL(objectUrl);
        setLocalPreview(null);
      } else {
        throw new Error("No se recibió URL de Cloudinary");
      }
    } catch (err: any) {
      setUploadError(err?.message || "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const displayImage = localPreview || currentImage;

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-cyan/10 rounded-xl">
          <ImageIcon className="text-cyan-400" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Imagen del producto</h3>
          {displayImage && (
            <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle size={10} />
              {localPreview ? "Vista previa local" : "Imagen en Cloudinary"}
            </p>
          )}
        </div>
        {displayImage && (
          <button
            type="button"
            onClick={() => {
              onImageUpload("", "");
              onFileSelect?.(null);
              setLocalPreview(null);
            }}
            className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
          >
            Quitar
          </button>
        )}
      </div>

      <div
        className={`relative group cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all ${
          uploading
            ? "border-cyan/40 cursor-wait"
            : "border-white/10 hover:border-cyan/40"
        }`}
        style={{ aspectRatio: "16/9" }}
      >
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt="Vista previa"
              className="absolute inset-0 w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
            />
            {uploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <Loader2 size={28} className="animate-spin text-cyan-400 mb-2" />
                <p className="text-xs text-cyan-300 font-semibold">Subiendo a Cloudinary…</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                <Upload size={24} className="text-ivory mb-1" />
                <p className="text-xs font-semibold text-ivory">Cambiar imagen</p>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {uploading ? (
              <>
                <Loader2 size={28} className="animate-spin text-cyan-400 mb-2" />
                <p className="text-xs text-cyan-300 font-semibold">Subiendo…</p>
              </>
            ) : (
              <>
                <Upload size={28} className="text-muted mb-2" />
                <p className="text-sm font-medium text-muted">Subir imagen</p>
                <p className="text-[10px] mt-1 text-muted/50">JPG, PNG, WEBP · Máx 8 MB</p>
              </>
            )}
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-wait"
        />
      </div>

      {uploadError && (
        <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
          <AlertTriangle size={12} />
          {uploadError}
        </p>
      )}
    </div>
  );
}

// DietaryRestrictionSelector
function DietaryRestrictionSelector({
  formData,
  setFormData,
}: {
  formData: Product;
  setFormData: (f: Product) => void;
}) {
  const toggle = (value: string) => {
    const current = formData.dietaryRestrictions || [];
    const updated = current.includes(value as any)
      ? current.filter((r) => r !== value)
      : [...current, value as any];
    setFormData({ ...formData, dietaryRestrictions: updated });
  };

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-emerald/10 rounded-xl">
          <Sparkles className="text-emerald-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Restricciones Dietéticas</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DIETARY_RESTRICTION_OPTIONS.map((option) => {
          const selected = (formData.dietaryRestrictions || []).includes(option.value as any);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                selected
                  ? option.color
                  : "bg-white/5 border-white/10 text-muted hover:bg-white/10"
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

// ProductAttributeGrid
function ProductAttributeGrid({
  formData,
  setFormData,
  fieldErrors,
}: {
  formData: Product;
  setFormData: (f: Product) => void;
  fieldErrors: FieldErrors;
}) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-gold/10 rounded-xl">
          <Sparkles className="text-gold" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Opciones de visualización</h3>
      </div>

      <div className="space-y-4">
        {/* Destacado */}
        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-ivory">Destacado en carta</span>
            <span className="text-[10px] text-muted">Agrega distintivo "Recomendado"</span>
          </div>
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="rounded bg-surface-3 border-white/10 text-rose-400 focus:ring-rose/40 focus:ring-offset-0"
          />
        </label>

        {/* Disponible */}
        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-ivory">Disponible</span>
            <span className="text-[10px] text-muted">Visible en la carta del cliente</span>
          </div>
          <input
            type="checkbox"
            checked={formData.available}
            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
            className="rounded bg-surface-3 border-white/10 text-emerald-400 focus:ring-emerald/40 focus:ring-offset-0"
          />
        </label>

        {/* Tiempo de preparación */}
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
            Tiempo de preparación (min)
          </label>
          <div className="space-y-2">
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                name="preparationTime"
                type="number"
                min="1"
                max="120"
                value={formData.preparationTime || ""}
                onChange={(e) =>
                  setFormData({ ...formData, preparationTime: Number(e.target.value) })
                }
                className={`${inputCls(!!fieldErrors.preparationTime)} pl-10`}
                placeholder="5"
              />
            </div>
            <FieldError msg={fieldErrors.preparationTime} />
            <div className="flex flex-wrap gap-1">
              {PREPARATION_TIME_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, preparationTime: preset.value })
                  }
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    formData.preparationTime === preset.value
                      ? "bg-gold text-black"
                      : "bg-white/10 text-muted hover:bg-white/20"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1 block mb-2">
            Etiquetas
          </label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              name="tags"
              value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t.length > 0),
                })
              }
              className={`${inputCls()} pl-10`}
              placeholder="etiqueta1, etiqueta2, etiqueta3"
            />
          </div>
          <p className="text-[10px] text-muted/50 mt-1 ml-1">Separar con comas</p>
        </div>
      </div>
    </div>
  );
}

// HelpTipCard
function HelpTipCard() {
  return (
    <div className="bg-rose/5 border border-rose/10 p-5 rounded-xl relative overflow-hidden group">
      <HelpCircle
        className="absolute -right-4 -bottom-4 text-rose-400 opacity-5 group-hover:scale-110 transition-transform"
        size={48}
      />
      <h4 className="text-rose-300 text-sm font-bold mb-2 flex items-center gap-2">
        <HelpCircle size={16} />
        Consejo del editor
      </h4>
      <p className="text-xs text-muted leading-relaxed">
        Las descripciones de 150–200 caracteres funcionan mejor en pantallas de carta digital.
        Evitá la jerga técnica salvo que esté en el manual de marca.
      </p>
    </div>
  );
}

// ProductPricePreview
function ProductPricePreview({ formData }: { formData: Product }) {
  const margin = useMemo(() => {
    if (!formData.price || !formData.cost) return null;
    return Math.round(((formData.price - formData.cost) / formData.price) * 100);
  }, [formData.price, formData.cost]);

  return (
    <div className="nebula-form-card nebula-form-animate-scale-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet/10 rounded-xl">
          <Eye className="text-violet-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Vista previa</h3>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-gradient-to-br from-violet/10 to-cyan/10 rounded-lg border border-violet/20">
          {formData.image && (
            <img
              src={formData.image}
              alt={formData.name}
              className="w-full h-28 object-cover rounded-lg mb-3"
            />
          )}
          {!formData.image && (
            <div className="w-full h-28 rounded-lg mb-3 bg-white/5 border border-white/10 flex items-center justify-center">
              <ImageIcon size={24} className="text-muted/30" />
            </div>
          )}
          <h4 className="text-base font-bold text-ivory leading-tight">
            {formData.name || <span className="text-muted italic font-normal">Sin nombre</span>}
          </h4>
          <p className="text-xs text-muted mt-1 line-clamp-2">
            {formData.description || "Sin descripción"}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-gold">
              ${formData.price > 0 ? formData.price.toFixed(2) : "—"}
            </span>
            {margin !== null && (
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  margin > 50
                    ? "bg-emerald/20 text-emerald-400"
                    : "bg-gold/20 text-gold"
                }`}
              >
                {margin}% margen
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-[10px] text-muted">Categoría</p>
            <p className="text-sm font-semibold text-ivory truncate">
              {formData.category || <span className="text-muted italic font-normal">N/A</span>}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-[10px] text-muted">Tipo</p>
            <p className="text-sm font-semibold text-ivory capitalize">
              {formData.type === "drink" ? "Bebida" : "Comida"}
            </p>
          </div>
        </div>

        {formData.subcategory && (
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-[10px] text-muted">Subcategoría</p>
            <p className="text-sm font-semibold text-ivory truncate">{formData.subcategory}</p>
          </div>
        )}

        {Array.isArray(formData.tags) && formData.tags.length > 0 && (
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-[10px] text-muted mb-2">Etiquetas</p>
            <div className="flex flex-wrap gap-1">
              {formData.tags.slice(0, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-violet/20 text-violet-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {formData.tags.length > 4 && (
                <span className="px-2 py-0.5 bg-white/10 text-muted rounded text-xs">
                  +{formData.tags.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Estado y tiempo */}
        <div className="flex gap-2">
          <div className={`flex-1 p-2 rounded-lg border text-center text-xs font-semibold ${
            formData.available
              ? "bg-emerald/10 border-emerald/30 text-emerald-400"
              : "bg-white/5 border-white/10 text-muted"
          }`}>
            {formData.available ? "Disponible" : "No disponible"}
          </div>
          {formData.preparationTime > 0 && (
            <div className="flex-1 p-2 rounded-lg border border-white/10 bg-white/5 text-center text-xs font-semibold text-muted flex items-center justify-center gap-1">
              <Clock size={11} />
              {formData.preparationTime} min
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────

export default function ProductForm({
  product,
  onSave,
  onClose,
  categoryNames = [],
}: ProductFormProps) {
  const [formData, setFormData]     = useState<Product>(EMPTY_FORM);
  const [loading, setLoading]       = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saved, setSaved]           = useState(false);

  // Inicializar con el producto a editar
  useEffect(() => {
    if (product) {
      setFormData({ ...EMPTY_FORM, ...product });
    } else {
      setFormData(EMPTY_FORM);
    }
    setFieldErrors({});
    setGlobalError(null);
    setSaved(false);
  }, [product]);

  // Limpiar error global cuando el usuario empieza a corregir
  useEffect(() => {
    if (globalError) setGlobalError(null);
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleImageUpload = (imageUrl: string, publicId?: string) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
      imagePublicId: publicId || (prev as any).imagePublicId || "",
    }));
  };

  // ── Validación ──────────────────────────────────────────────────
  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio";
    } else if (formData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = "Ingresá un precio de venta válido mayor a 0";
    }

    if (formData.cost < 0) {
      errors.cost = "El costo no puede ser negativo";
    }

    if (formData.preparationTime <= 0 || formData.preparationTime > 120) {
      errors.preparationTime = "El tiempo debe estar entre 1 y 120 minutos";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async () => {
    if (!validate()) {
      setGlobalError("Corregí los errores marcados antes de guardar");
      return;
    }

    setLoading(true);
    setGlobalError(null);
    try {
      await onSave(formData);
      setSaved(true);
    } catch (err: any) {
      setGlobalError(err?.message || "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.name.trim().length > 0 && formData.price > 0;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <form
      className="flex flex-col h-full animate-fade-in"
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      noValidate
    >
      {/* HEADER */}
      <div className="px-4 py-4 md:px-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-surface-2">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-gradient-to-br from-rose-600 to-violet-600 rounded-xl md:rounded-2xl shadow-lg">
            <Box className="text-white" size={22} />
          </div>
          <div>
            <nav className="flex items-center gap-2 text-xs text-muted mb-1" aria-label="Breadcrumb">
              <span>Catálogo</span>
              <ChevronRight size={12} />
              <span className="text-rose-300 font-medium">
                {product ? "Editar producto" : "Nuevo producto"}
              </span>
            </nav>
            <h2 className="text-xl md:text-2xl font-bold text-ivory">
              {product ? "Editar producto" : "Nuevo producto"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle de disponibilidad — corregido para reflejar el estado real */}
          <div className="flex items-center gap-3 bg-surface-3 px-3 py-2 rounded-lg border border-white/10">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Visibilidad</span>
              <span
                className={`text-xs font-medium ${
                  formData.available ? "text-emerald-400" : "text-muted"
                }`}
              >
                {formData.available ? "Activo" : "Inactivo"}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.available}
              onClick={() => setFormData({ ...formData, available: !formData.available })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose/40 ${
                formData.available ? "bg-emerald-500" : "bg-white/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.available ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Cerrar formulario"
          >
            <X size={22} className="text-muted" />
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto pb-6 nebula-forms-scroll">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

          {/* COLUMNA IZQUIERDA — Imagen + Identidad (7 columnas) */}
          <div className="lg:col-span-7 space-y-6">
            <EnhancedImageUpload
              currentImage={formData.image}
              onImageUpload={handleImageUpload}
            />
            <ProductIdentityCard
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
              categoryNames={categoryNames}
            />
          </div>

          {/* COLUMNA DERECHA — Precios + Restricciones + Atributos + Preview (5 columnas) */}
          <div className="lg:col-span-5 space-y-6">
            <ProductFinancePanel
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
            />
            <DietaryRestrictionSelector formData={formData} setFormData={setFormData} />
            <ProductAttributeGrid
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
            />
            <HelpTipCard />
            <ProductPricePreview formData={formData} />

            {/* Error global */}
            {globalError && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl nebula-form-error">
                <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-red-300 leading-relaxed">{globalError}</p>
              </div>
            )}

            {/* Listo para guardar */}
            {isValid && !globalError && Object.keys(fieldErrors).length === 0 && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <CheckCircle className="text-emerald-400 shrink-0" size={18} />
                <p className="text-xs text-emerald-300">Listo para guardar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER FIJO */}
      <div className="sticky bottom-0 left-0 right-0 h-[68px] bg-surface-2/95 backdrop-blur-xl border-t border-white/10 px-6 md:px-12 flex items-center justify-between z-20 flex-shrink-0">
        {/* Estado de guardado */}
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <CheckCircle size={13} className="text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                Guardado
              </span>
            </div>
          )}
          {!saved && isValid && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[11px] text-muted uppercase tracking-widest font-bold">
                Sin guardar
              </span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-muted hover:text-ivory text-sm font-bold transition-colors rounded-lg hover:bg-white/5"
          >
            Descartar
          </button>
          <button
            type="submit"
            disabled={loading || !isValid}
            className="flex items-center gap-2 bg-rose text-black px-6 py-2.5 rounded-lg text-sm font-black shadow-lg shadow-rose/20 hover:shadow-rose/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Guardando…</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>{product ? "Guardar cambios" : "Crear producto"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
