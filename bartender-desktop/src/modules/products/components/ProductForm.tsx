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
  ChevronRight,
  HelpCircle,
  Upload,
  Zap,
  Info,
  Layers,
  Trash2,
  Star,
} from "lucide-react";

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
  { value: "drink", label: "Mixología / Bebida", icon: <Zap size={15} /> },
  { value: "food",  label: "Gastronomía / Plato", icon: <Box size={15} /> },
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
  { value: "vegan",       label: "Vegano"          },
  { value: "vegetarian",  label: "Vegetariano"     },
  { value: "gluten-free", label: "Sin Gluten"      },
  { value: "dairy-free",  label: "Sin Lácteos"     },
  { value: "nut-free",    label: "Sin Frutos Secos"},
  { value: "sugar-free",  label: "Sin Azúcar"      },
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
  categoryNames?: string[];
}

// ── Helpers ───────────────────────────────────────────────────────

function inputCls(hasError?: boolean) {
  return `w-full bg-[#1C2333] rounded-lg px-3.5 py-2.5 text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/50 transition-all outline-none border ${
    hasError
      ? "border-[#F85149] focus:ring-1 focus:ring-[#F85149]"
      : "border-[#30363D] focus:border-[#F0B429] focus:ring-1 focus:ring-[#F0B429]/40"
  }`;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-[#F85149] mt-1 ml-1 font-medium">
      <AlertTriangle size={12} />
      {msg}
    </p>
  );
}

// ── Subcomponentes Slate Elegante ──────────────────────────────────

function ProductIdentityCard({
  formData,
  setFormData,
  fieldErrors,
  categoryNames = [],
}: {
  formData: Product;
  setFormData: (f: Product) => void;
  fieldErrors: FieldErrors;
  categoryNames: string[];
}) {
  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#30363D]">
        <div className="p-2 bg-[rgba(240,180,41,0.12)] text-[#F0B429] rounded-lg">
          <Box size={16} />
        </div>
        <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Identidad del Producto</h3>
      </div>

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1.5">
            Nombre <span className="text-[#F85149]">*</span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Old Fashioned Signature"
            maxLength={100}
            className={inputCls(!!fieldErrors.name)}
          />
          <div className="flex justify-between items-center mt-1">
            <FieldError msg={fieldErrors.name} />
            <span className={`text-xs ml-auto ${formData.name.length > 90 ? "text-[#F85149]" : "text-[#8B949E]"}`}>
              {formData.name.length}/100
            </span>
          </div>
        </div>

        {/* Tipo de producto (Bebida / Plato) */}
        <div>
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1.5">
            Tipo de producto
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: opt.value as "drink" | "food" })}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  formData.type === opt.value
                    ? opt.value === "drink"
                      ? "bg-[rgba(240,180,41,0.15)] border-[#F0B429] text-[#F0B429]"
                      : "bg-[rgba(63,185,80,0.15)] border-[#3FB950] text-[#3FB950]"
                    : "bg-[#1C2333] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]"
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Estilo si es bebida */}
        {formData.type === "drink" && (
          <div>
            <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1.5">
              Estilo de bebida
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DRINK_STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, drinkStyle: opt.value as "classic" | "author" })}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                    formData.drinkStyle === opt.value
                      ? "bg-[#21283A] border-[rgba(240,180,41,0.40)] text-[#F0B429]"
                      : "bg-[#1C2333] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]"
                  }`}
                  title={opt.description}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categoría y Subcategoría */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1.5">
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

          <div>
            <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1.5">
              Subcategoría <span className="text-[#8B949E]/50 normal-case">(opcional)</span>
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" size={14} />
              <input
                name="subcategory"
                value={formData.subcategory ?? ""}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="Ej: Whisky Ahumado"
                maxLength={60}
                className={`${inputCls()} pl-8`}
              />
            </div>
          </div>
        </div>

        {/* Descripción comercial */}
        <div>
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1.5">
            Descripción comercial
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción para la carta del cliente…"
            maxLength={300}
            className={`${inputCls()} resize-none h-20 leading-relaxed`}
          />
          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs ${formData.description.length >= 150 && formData.description.length <= 200 ? "text-[#3FB950]" : "text-[#8B949E]"}`}>
              {formData.description.length >= 150 && formData.description.length <= 200
                ? "✓ Longitud ideal para carta"
                : "Recomendado: 150–200 caracteres"}
            </span>
            <span className={`text-xs ${formData.description.length > 270 ? "text-[#F85149]" : "text-[#8B949E]"}`}>
              {formData.description.length}/300
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Uploader compacto de imagen
function CompactImageUpload({
  currentImage,
  onImageUpload,
}: {
  currentImage: string | undefined;
  onImageUpload: (url: string, publicId: string) => void;
}) {
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);
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
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#30363D]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#21283A] text-[#8B949E] rounded-lg">
            <ImageIcon size={15} />
          </div>
          <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Imagen del Producto</h3>
        </div>
        {displayImage && (
          <button
            type="button"
            onClick={() => {
              onImageUpload("", "");
              setLocalPreview(null);
            }}
            className="flex items-center gap-1 text-xs text-[#F85149] hover:underline transition-colors"
          >
            <Trash2 size={12} />
            Quitar imagen
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Thumbnail Preview */}
        <div className="relative w-24 h-24 rounded-lg bg-[#090E14] border border-[#30363D] overflow-hidden shrink-0 flex items-center justify-center">
          {displayImage ? (
            <img src={displayImage} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={28} className="text-[#8B949E]/40" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center">
              <Loader2 size={20} className="animate-spin text-[#F0B429]" />
            </div>
          )}
        </div>

        {/* Upload Action */}
        <div className="flex-1 min-w-0">
          <label className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1C2333] hover:bg-[#21283A] border border-[#30363D] hover:border-[#3D444D] text-xs font-bold text-[#E6EDF3] cursor-pointer transition-colors shadow-sm">
            <Upload size={14} className="text-[#F0B429]" />
            <span>{displayImage ? "Cambiar imagen" : "Seleccionar imagen"}</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
          <p className="text-xs text-[#8B949E] mt-2">
            JPG, PNG o WEBP. Tamaño máximo sugerido: 8 MB.
          </p>
          {uploadError && (
            <p className="text-xs text-[#F85149] mt-1.5 flex items-center gap-1">
              <AlertTriangle size={12} />
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Precios y Logística
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
    margin >= 45 ? "text-[#3FB950]" : margin >= 25 ? "text-[#F0B429]" : "text-[#FF7B54]";
  const marginLabel =
    margin >= 45 ? "Excelente margen" : margin >= 25 ? "Margen equilibrado" : "Revisar costos";

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#30363D]">
        <div className="p-2 bg-[rgba(63,185,80,0.12)] text-[#3FB950] rounded-lg">
          <TrendingUp size={16} />
        </div>
        <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Precios y Finanzas</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Precio */}
        <div>
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1.5">
            Precio de venta <span className="text-[#F85149]">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F0B429]" size={15} />
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className={`${inputCls(!!fieldErrors.price)} pl-8 font-mono font-bold text-[#F0B429]`}
              placeholder="0.00"
            />
          </div>
          <FieldError msg={fieldErrors.price} />
        </div>

        {/* Costo */}
        <div>
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1.5">
            Costo unitario <span className="text-[#8B949E]/50 normal-case">(opcional)</span>
          </label>
          <div className="relative">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" size={15} />
            <input
              name="cost"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost || ""}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              className={`${inputCls(!!fieldErrors.cost)} pl-8 font-mono`}
              placeholder="0.00"
            />
          </div>
          <FieldError msg={fieldErrors.cost} />
        </div>
      </div>

      {/* Margen y Ganancia en vivo */}
      {formData.cost > 0 && formData.price > 0 && (
        <div className="p-3.5 rounded-lg bg-[#1C2333] border border-[#30363D] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8B949E]">Margen de ganancia:</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-black ${marginColor}`}>{margin}%</span>
              <span className="text-xs text-[#8B949E]">({marginLabel})</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8B949E]">Ganancia neta por unidad:</span>
            <span className="text-sm font-black text-[#3FB950]">${profit.toFixed(2)}</span>
          </div>

          {/* Barra de progreso visual */}
          <div className="w-full bg-[#0D1117] h-2 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                margin >= 45 ? "bg-[#3FB950]" : margin >= 25 ? "bg-[#F0B429]" : "bg-[#FF7B54]"
              }`}
              style={{ width: `${Math.max(0, Math.min(100, margin))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Restricciones Dietéticas
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
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#30363D]">
        <div className="p-2 bg-[rgba(56,139,253,0.12)] text-[#388BFD] rounded-lg">
          <Sparkles size={16} />
        </div>
        <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Restricciones Dietéticas</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {DIETARY_RESTRICTION_OPTIONS.map((opt) => {
          const selected = (formData.dietaryRestrictions || []).includes(opt.value as any);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                selected
                  ? "bg-[rgba(63,185,80,0.15)] border-[#3FB950] text-[#3FB950] font-bold"
                  : "bg-[#1C2333] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Opciones de visualización y atributos
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
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#30363D]">
        <div className="p-2 bg-[rgba(240,180,41,0.12)] text-[#F0B429] rounded-lg">
          <Star size={16} />
        </div>
        <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Visualización y Parámetros</h3>
      </div>

      <div className="space-y-3">
        {/* Destacado */}
        <label className="flex items-center justify-between p-3 rounded-lg bg-[#1C2333] border border-[#30363D] hover:border-[#3D444D] cursor-pointer transition-colors">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
              <Star size={13} className="text-[#F0B429] fill-[#F0B429]" />
              Destacado en carta digital
            </span>
            <span className="text-xs text-[#8B949E] mt-0.5">Muestra el distintivo "Recomendado del Bar"</span>
          </div>
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="w-4 h-4 accent-[#F0B429] rounded cursor-pointer"
          />
        </label>

        {/* Tiempo de preparación */}
        <div>
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1.5">
            Tiempo de preparación (minutos)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative w-28 shrink-0">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" size={14} />
              <input
                name="preparationTime"
                type="number"
                min="1"
                max="120"
                value={formData.preparationTime || ""}
                onChange={(e) => setFormData({ ...formData, preparationTime: Number(e.target.value) })}
                className={`${inputCls(!!fieldErrors.preparationTime)} pl-8 font-mono`}
                placeholder="5"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {PREPARATION_TIME_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, preparationTime: preset.value })}
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    formData.preparationTime === preset.value
                      ? "bg-[#21283A] text-[#F0B429] border-[rgba(240,180,41,0.40)] font-bold"
                      : "bg-[#1C2333] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <FieldError msg={fieldErrors.preparationTime} />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block mb-1.5">
            Etiquetas de búsqueda
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" size={14} />
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
              className={`${inputCls()} pl-8`}
              placeholder="Ej: dulce, frutal, ahumado, verano"
            />
          </div>
          <p className="text-xs text-[#8B949E] mt-1">Separá las etiquetas con comas</p>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ProductForm ──────────────────────────────

export default function ProductForm({
  product,
  onSave,
  onClose,
  categoryNames = [],
}: ProductFormProps) {
  const [formData, setFormData]       = useState<Product>(EMPTY_FORM);
  const [loading, setLoading]         = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saved, setSaved]             = useState(false);

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

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio";
    } else if (formData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = "Ingresá un precio de venta mayor a 0";
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
      setGlobalError("Corregí los campos marcados antes de guardar");
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
      className="flex flex-col h-full min-h-0 bg-[#0D1117] overflow-hidden"
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      noValidate
    >
      {/* ── HEADER FIJO (shrink-0) ─────────────────────────────────── */}
      <header className="px-6 h-16 border-b border-[#30363D] bg-[#161B22] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(240,180,41,0.15)] text-[#F0B429] rounded-xl border border-[rgba(240,180,41,0.30)]">
            <Box size={20} />
          </div>
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-[#8B949E]" aria-label="Breadcrumb">
              <span>Catálogo</span>
              <ChevronRight size={12} />
              <span className="text-[#F0B429] font-medium">
                {product ? "Editar producto" : "Nuevo producto"}
              </span>
            </nav>
            <h2 className="text-base font-bold text-[#E6EDF3] tracking-tight">
              {product ? `Editar: ${product.name}` : "Crear Nuevo Producto"}
            </h2>
          </div>
        </div>

        {/* Visibilidad Switch + Cerrar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-[#1C2333] px-3 py-1.5 rounded-lg border border-[#30363D]">
            <div className="flex flex-col items-end">
              <span className="text-xs text-[#8B949E] uppercase font-semibold">Visibilidad</span>
              <span className={`text-xs font-bold ${formData.available ? "text-[#3FB950]" : "text-[#8B949E]"}`}>
                {formData.available ? "Activo en carta" : "Inactivo"}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.available}
              onClick={() => setFormData({ ...formData, available: !formData.available })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                formData.available ? "bg-[#3FB950]" : "bg-[#30363D]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                  formData.available ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2333] rounded-lg transition-colors"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* ── CUERPO CON SCROLL INDEPENDIENTE (flex-1 min-h-0) ──────── */}
      <main className="p-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-6xl mx-auto">

          {/* COLUMNA IZQUIERDA: Identidad + Imagen (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <ProductIdentityCard
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
              categoryNames={categoryNames}
            />
            <CompactImageUpload
              currentImage={formData.image}
              onImageUpload={handleImageUpload}
            />
          </div>

          {/* COLUMNA DERECHA: Precios + Restricciones + Atributos (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <ProductFinancePanel
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
            />
            <DietaryRestrictionSelector
              formData={formData}
              setFormData={setFormData}
            />
            <ProductAttributeGrid
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
            />

            {/* Error global */}
            {globalError && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[rgba(248,81,73,0.12)] border border-[rgba(248,81,73,0.30)] rounded-xl">
                <AlertTriangle className="text-[#F85149] shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-[#F85149] leading-relaxed font-medium">{globalError}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── FOOTER FIJO (shrink-0, 100% visible, anti-clipping) ───── */}
      <footer className="h-16 border-t border-[#30363D] bg-[#161B22] px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(63,185,80,0.15)] border border-[rgba(63,185,80,0.30)] text-[#3FB950] text-xs font-bold">
              <CheckCircle size={14} />
              <span>Guardado exitosamente</span>
            </div>
          )}
          {!saved && isValid && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C2333] border border-[#30363D] text-[#8B949E] text-xs">
              <div className="w-2 h-2 rounded-full bg-[#F0B429] animate-pulse" />
              <span>Cambios pendientes</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2333] rounded-lg transition-colors"
          >
            Descartar
          </button>
          <button
            type="submit"
            disabled={loading || !isValid}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F0B429] hover:bg-[#F5C842] text-black text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={15} />
                <span>Guardando…</span>
              </>
            ) : (
              <>
                <CheckCircle size={15} />
                <span>{product ? "Guardar cambios" : "Crear producto"}</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </form>
  );
}
