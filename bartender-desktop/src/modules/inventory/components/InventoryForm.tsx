"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X, CheckCircle, AlertTriangle, Package, DollarSign,
  Loader2, Target, MapPin, Activity, Gauge, Bell,
  Upload, Eye, ChevronRight, Layers, Tag,
} from "lucide-react";

import api from "../../../services/api";
import type { InventoryItem } from "../types/inventory";

// ── Constantes ────────────────────────────────────────────────────

const EMPTY_FORM: InventoryItem = {
  name:        "",
  description: "",
  stock:       0,
  minStock:    5,
  maxStock:    100,
  unit:        "unit",
  sector:      "bar",
  category:    "",
  cost:        0,
  supplier:    "",
  location:    "bar",
  isActive:    true,
  image:       "",
};

const UNIT_OPTIONS: { value: InventoryItem["unit"]; label: string }[] = [
  { value: "ml",      label: "ml — Mililitros"    },
  { value: "l",       label: "l — Litros"         },
  { value: "g",       label: "g — Gramos"         },
  { value: "kg",      label: "kg — Kilogramos"    },
  { value: "unit",    label: "u — Unidad"         },
  { value: "oz",      label: "oz — Onzas"         },
  { value: "portion", label: "por — Porción"      },
];

const SECTOR_OPTIONS: { value: InventoryItem["sector"]; label: string }[] = [
  { value: "bar",     label: "Barra"   },
  { value: "kitchen", label: "Cocina"  },
  { value: "general", label: "General" },
];

const LOCATION_OPTIONS: { value: InventoryItem["location"]; label: string }[] = [
  { value: "bar",     label: "Barra"            },
  { value: "kitchen", label: "Cocina"           },
  { value: "storage", label: "Bodega / Almacén" },
];

const CATEGORY_LOCATION_MAP: Record<string, InventoryItem["location"]> = {
  destilados: "storage", licores: "storage", cervezas: "storage",
  vinos: "storage", jugos: "bar", frutas: "kitchen",
  hielo: "bar", garnish: "kitchen", vasos: "storage",
};

// ── Tipos internos ────────────────────────────────────────────────

interface FieldErrors {
  name?:     string;
  category?: string;
  stock?:    string;
  minStock?: string;
  maxStock?: string;
  cost?:     string;
}

interface Props {
  item?:          InventoryItem | null;
  onSave:         (item: InventoryItem) => void;
  onClose:        () => void;
  categoryNames?: string[];
}

// ── Helpers ───────────────────────────────────────────────────────

function inputCls(err?: boolean) {
  return `w-full bg-[#0D1117] rounded-xl px-3.5 py-2.5 text-xs text-[#E6EDF3] placeholder:text-[#8B949E] transition-all outline-none ${
    err
      ? "border border-[#F85149] focus:ring-1 focus:ring-[#F85149]"
      : "border border-[#30363D] focus:border-[#F0B429] focus:ring-1 focus:ring-[#F0B429]"
  }`;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-[#F85149] mt-1 ml-0.5">
      <AlertTriangle size={12} /> {msg}
    </p>
  );
}

function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-2 border-b border-[#30363D]">
      <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
      <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">{title}</h3>
    </div>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────

function ImageUpload({
  currentImage,
  onUpload,
}: {
  currentImage: string | undefined;
  onUpload: (url: string, publicId: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = (await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })) as any;
      const url      = res?.data?.url      || res?.url      || "";
      const publicId = res?.data?.publicId || res?.publicId || "";
      if (url) {
        onUpload(url, publicId);
        URL.revokeObjectURL(objectUrl);
        setPreview(null);
      } else throw new Error("No se recibió URL");
    } catch (e: any) {
      setError(e?.message || "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const display = preview || currentImage;

  return (
    <div className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-3 shadow-sm">
      <SectionHeader
        icon={<Upload size={15} />}
        title="Imagen del Insumo"
        color="bg-[rgba(240,180,41,0.12)] text-[#F0B429]"
      />

      <div className="flex items-center gap-3">
        {display ? (
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#30363D] shrink-0 bg-[#0D1117]">
            <img src={display} alt="Insumo" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { onUpload("", ""); setPreview(null); }}
              className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-[#F85149] hover:bg-black transition-colors"
              title="Quitar imagen"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl border border-dashed border-[#30363D] bg-[#0D1117] flex flex-col items-center justify-center text-[#8B949E] shrink-0">
            <Package size={22} className="text-[#8B949E]/50" />
            <span className="text-xs text-[#8B949E]/70 mt-1">Sin foto</span>
          </div>
        )}

        <label className="flex-1 cursor-pointer border border-dashed border-[#30363D] hover:border-[#F0B429]/60 rounded-xl p-3 flex flex-col items-center justify-center bg-[#0D1117] hover:bg-[#1C2333]/40 transition-all text-center">
          <Upload size={18} className="text-[#F0B429] mb-1" />
          <span className="text-xs font-semibold text-[#E6EDF3]">
            {display ? "Cambiar foto" : "Subir foto del insumo"}
          </span>
          <span className="text-xs text-[#8B949E] mt-0.5">JPG, PNG, WEBP · Máx 8 MB</span>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
            className="hidden"
          />
        </label>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-xs text-[#F0B429] p-2 bg-[#0D1117] rounded-lg border border-[#30363D]">
          <Loader2 size={13} className="animate-spin" />
          <span>Subiendo imagen a la nube…</span>
        </div>
      )}
      {error && (
        <p className="text-xs text-[#F85149] flex items-center gap-1.5">
          <AlertTriangle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function BasicInfo({
  formData, setFormData, fieldErrors, categoryNames,
}: {
  formData: InventoryItem;
  setFormData: (f: InventoryItem) => void;
  fieldErrors: FieldErrors;
  categoryNames: string[];
}) {
  return (
    <div className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-4 shadow-sm">
      <SectionHeader
        icon={<Target size={15} />}
        title="Identificación"
        color="bg-[rgba(240,180,41,0.12)] text-[#F0B429]"
      />

      {/* Nombre */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
          Nombre del insumo <span className="text-[#F85149]">*</span>
        </label>
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Gin Mare Premium"
          maxLength={80}
          className={inputCls(!!fieldErrors.name)}
        />
        <div className="flex justify-between items-center text-xs">
          <FieldError msg={fieldErrors.name} />
          <span className="text-[#8B949E]/70 ml-auto">{formData.name.length}/80</span>
        </div>
      </div>

      {/* Categoría y Proveedor en 2 columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
            Categoría <span className="text-[#F85149]">*</span>
          </label>
          <input
            value={formData.category}
            onChange={(e) => {
              const cat = e.target.value;
              const suggestedLocation = CATEGORY_LOCATION_MAP[cat.toLowerCase()];
              setFormData({
                ...formData,
                category: cat,
                ...(suggestedLocation ? { location: suggestedLocation } : {}),
              });
            }}
            placeholder="Ej: Destilados"
            maxLength={60}
            list="inv-category-suggestions"
            className={inputCls(!!fieldErrors.category)}
          />
          <datalist id="inv-category-suggestions">
            {categoryNames.map((c) => <option key={c} value={c} />)}
          </datalist>
          <FieldError msg={fieldErrors.category} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
            Proveedor
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" size={13} />
            <input
              value={formData.supplier ?? ""}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Ej: Diageo Argentina"
              maxLength={80}
              className={`${inputCls()} pl-8.5`}
            />
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
          Descripción <span className="text-[#8B949E]/60 font-normal lowercase">(opcional)</span>
        </label>
        <textarea
          value={formData.description ?? ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Notas internas sobre el insumo, graduación o notas de cata…"
          maxLength={300}
          className={`${inputCls()} resize-none h-16`}
        />
        <span className="text-xs text-[#8B949E]/70 float-right">
          {(formData.description ?? "").length}/300
        </span>
      </div>
    </div>
  );
}

function StockPanel({
  formData, setFormData, fieldErrors,
}: {
  formData: InventoryItem;
  setFormData: (f: InventoryItem) => void;
  fieldErrors: FieldErrors;
}) {
  const pct = useMemo(() => {
    if (!formData.maxStock) return 0;
    return Math.min((formData.stock / formData.maxStock) * 100, 100);
  }, [formData.stock, formData.maxStock]);

  const isCritical = formData.stock <= formData.minStock;
  const isLow      = !isCritical && formData.stock <= formData.minStock * 1.5;

  const barColor = isCritical ? "bg-[#F85149]" : isLow ? "bg-[#FF7B54]" : "bg-[#3FB950]";
  const textColor = isCritical ? "text-[#F85149]" : isLow ? "text-[#FF7B54]" : "text-[#3FB950]";
  const statusLabel = isCritical ? "Nivel Crítico" : isLow ? "Stock Bajo" : "Stock Óptimo";

  return (
    <div className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-4 shadow-sm">
      <SectionHeader
        icon={<Gauge size={15} />}
        title="Niveles de Stock y Alertas"
        color="bg-[rgba(63,185,80,0.12)] text-[#3FB950]"
      />

      {/* Inputs stock */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
            Actual <span className="text-[#F85149]">*</span>
          </label>
          <input
            type="number" min={0}
            value={formData.stock || ""}
            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            className={`${inputCls(!!fieldErrors.stock)} text-center font-bold`}
            placeholder="0"
          />
          <FieldError msg={fieldErrors.stock} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
            Mínimo
          </label>
          <input
            type="number" min={0}
            value={formData.minStock || ""}
            onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
            className={`${inputCls(!!fieldErrors.minStock)} text-center font-bold`}
            placeholder="5"
          />
          <FieldError msg={fieldErrors.minStock} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
            Máximo
          </label>
          <input
            type="number" min={1}
            value={formData.maxStock || ""}
            onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })}
            className={`${inputCls(!!fieldErrors.maxStock)} text-center font-bold`}
            placeholder="100"
          />
          <FieldError msg={fieldErrors.maxStock} />
        </div>
      </div>

      {/* Visualización de Nivel */}
      <div className={`p-3.5 rounded-xl border transition-all ${
        isCritical ? "bg-[rgba(248,81,73,0.08)] border-[rgba(248,81,73,0.25)]" :
        isLow      ? "bg-[rgba(255,123,84,0.08)] border-[rgba(255,123,84,0.25)]" :
                     "bg-[#0D1117] border-[#30363D]"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#8B949E] font-medium">Estado Proyectado</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${textColor}`}>{statusLabel}</span>
            <span className={`text-xl font-black ${textColor}`}>{pct.toFixed(0)}%</span>
          </div>
        </div>
        <div className="h-2.5 bg-[#161B22] rounded-full overflow-hidden border border-[#30363D]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.max(2, Math.min(pct, 100))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#8B949E] mt-1.5">
          <span>0 {formData.unit}</span>
          <span>mín: {formData.minStock} {formData.unit}</span>
          <span>máx: {formData.maxStock} {formData.unit}</span>
        </div>
      </div>
    </div>
  );
}

function CostPanel({
  formData, setFormData, fieldErrors,
}: {
  formData: InventoryItem;
  setFormData: (f: InventoryItem) => void;
  fieldErrors: FieldErrors;
}) {
  const totalValue = useMemo(
    () => formData.stock * formData.cost,
    [formData.stock, formData.cost]
  );

  return (
    <div className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-4 shadow-sm">
      <SectionHeader
        icon={<DollarSign size={15} />}
        title="Costos y Valuación"
        color="bg-[rgba(240,180,41,0.12)] text-[#F0B429]"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
            Costo Unitario de Compra
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" size={14} />
            <input
              type="number" min={0} step="0.01"
              value={formData.cost || ""}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              className={`${inputCls(!!fieldErrors.cost)} pl-8 font-mono font-bold`}
              placeholder="0.00"
            />
          </div>
          <FieldError msg={fieldErrors.cost} />
        </div>

        <div className="p-3 bg-[#0D1117] rounded-xl border border-[#30363D] text-right">
          <span className="text-xs text-[#8B949E] block mb-0.5">Inversión en Stock</span>
          <span className="text-lg font-black text-[#F0B429]">
            ${totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-xs text-[#8B949E] mt-0.5">
            {formData.stock} {formData.unit} en stock
          </p>
        </div>
      </div>
    </div>
  );
}

function LocationPanel({
  formData, setFormData,
}: {
  formData: InventoryItem;
  setFormData: (f: InventoryItem) => void;
}) {
  return (
    <div className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-4 shadow-sm">
      <SectionHeader
        icon={<MapPin size={15} />}
        title="Clasificación Operativa"
        color="bg-[rgba(56,139,253,0.12)] text-[#388BFD]"
      />

      {/* Unidad de Medida */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
          Unidad de Medida
        </label>
        <select
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value as InventoryItem["unit"] })}
          className={inputCls()}
        >
          {UNIT_OPTIONS.map((u) => (
            <option key={u.value} value={u.value} className="bg-[#161B22] text-[#E6EDF3]">
              {u.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sector Operativo */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
          Sector Operativo
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SECTOR_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setFormData({ ...formData, sector: s.value })}
              className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                formData.sector === s.value
                  ? "bg-[#21283A] text-[#F0B429] border-[#F0B429]/40 shadow-sm"
                  : "bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ubicación Física */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider block">
          Ubicación Física
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LOCATION_OPTIONS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setFormData({ ...formData, location: l.value })}
              className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                formData.location === l.value
                  ? "bg-[#21283A] text-[#388BFD] border-[#388BFD]/40 shadow-sm"
                  : "bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPanel({
  formData, setFormData,
}: {
  formData: InventoryItem;
  setFormData: (f: InventoryItem) => void;
}) {
  return (
    <div className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-3 shadow-sm">
      <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-xl border border-[#30363D]">
        <div>
          <p className="text-xs font-bold text-[#E6EDF3]">Estado del Insumo</p>
          <p className="text-xs text-[#8B949E]">
            {formData.isActive ? "Habilitado para recetas y órdenes" : "Inactivo / Oculto"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            formData.isActive ? "bg-[#3FB950]" : "bg-[#30363D]"
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              formData.isActive ? "left-6.5" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function PreviewPanel({ formData }: { formData: InventoryItem }) {
  const pct = Math.min(
    formData.maxStock > 0 ? Math.round((formData.stock / formData.maxStock) * 100) : 0,
    100
  );
  const isCritical = formData.stock <= formData.minStock;
  const isLow      = !isCritical && formData.stock <= formData.minStock * 1.5;

  return (
    <div className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-3 shadow-sm">
      <SectionHeader
        icon={<Eye size={15} />}
        title="Vista Previa de Tarjeta"
        color="bg-[rgba(56,139,253,0.12)] text-[#388BFD]"
      />

      <div className="p-3.5 bg-[#0D1117] rounded-xl border border-[#30363D] space-y-2.5">
        <div className="flex items-center gap-3">
          {formData.image ? (
            <img
              src={formData.image}
              alt={formData.name}
              className="w-10 h-10 rounded-xl object-cover border border-[#30363D]"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#161B22] border border-[#30363D] flex items-center justify-center text-[#8B949E]">
              <Package size={18} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-xs text-[#8B949E] uppercase font-semibold block truncate">
              {formData.category || "Sin categoría"}
            </span>
            <h4 className="text-sm font-bold text-[#E6EDF3] capitalize truncate">
              {formData.name || <span className="text-[#8B949E] font-normal italic">Sin nombre</span>}
            </h4>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            isCritical ? "bg-[rgba(248,81,73,0.15)] text-[#F85149] border-[rgba(248,81,73,0.30)]" :
            isLow      ? "bg-[rgba(255,123,84,0.15)] text-[#FF7B54] border-[rgba(255,123,84,0.30)]" :
                         "bg-[rgba(63,185,80,0.15)] text-[#3FB950] border-[rgba(63,185,80,0.30)]"
          }`}>
            {isCritical ? "Crítico" : isLow ? "Bajo" : "Óptimo"}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#30363D]">
          <span className="text-[#8B949E]">Stock: <strong className="text-[#E6EDF3]">{formData.stock} {formData.unit}</strong></span>
          <span className="text-[#F0B429] font-bold">${Number(formData.cost || 0).toLocaleString("es-AR")}</span>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal InventoryForm ────────────────────────────

export default function InventoryForm({ item, onSave, onClose, categoryNames = [] }: Props) {
  const [formData, setFormData]       = useState<InventoryItem>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [saved, setSaved]             = useState(false);

  useEffect(() => {
    setFormData(item ? { ...EMPTY_FORM, ...item } : EMPTY_FORM);
    setFieldErrors({});
    setGlobalError(null);
    setSaved(false);
  }, [item]);

  useEffect(() => {
    if (globalError) setGlobalError(null);
    setSaved(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!formData.name.trim())     errs.name     = "El nombre es obligatorio";
    if (!formData.category.trim()) errs.category = "La categoría es obligatoria";
    if (formData.stock < 0)        errs.stock    = "El stock no puede ser negativo";
    if (formData.minStock < 0)     errs.minStock = "El mínimo no puede ser negativo";
    if (formData.maxStock <= 0)    errs.maxStock = "El máximo debe ser mayor a 0";
    if (formData.minStock > formData.maxStock)
      errs.maxStock = "El máximo debe ser mayor o igual al mínimo";
    if (formData.cost < 0)         errs.cost     = "El costo no puede ser negativo";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async () => {
    if (!validate()) {
      setGlobalError("Por favor completa los campos requeridos correctamente");
      return;
    }
    setLoading(true);
    setGlobalError(null);
    try {
      await onSave(formData);
      setSaved(true);
    } catch (e: any) {
      setGlobalError(e?.message || "Error al guardar el insumo");
    } finally {
      setLoading(false);
    }
  };

  const isValid = !!(
    formData.name.trim() &&
    formData.category.trim() &&
    formData.stock >= 0 &&
    formData.minStock <= formData.maxStock &&
    formData.cost >= 0
  );

  return (
    <form
      className="flex flex-col h-full min-h-0 bg-[#0D1117] relative select-none"
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      noValidate
    >
      {/* ── HEADER FIJO ────────────────────────────────────────── */}
      <div className="px-4 py-3.5 md:px-6 border-b border-[#30363D] flex justify-between items-center shrink-0 bg-[#161B22] z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(240,180,41,0.12)] text-[#F0B429] border border-[rgba(240,180,41,0.25)] rounded-xl shadow-xs">
            <Package size={20} />
          </div>
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-[#8B949E] mb-0.5">
              <span>Inventario</span>
              <ChevronRight size={11} />
              <span className="text-[#F0B429] font-semibold">
                {item ? "Modificar insumo" : "Nuevo insumo"}
              </span>
            </nav>
            <h2 className="text-lg md:text-xl font-black text-[#E6EDF3] tracking-tight">
              {item ? `Editar: ${item.name}` : "Registrar Nuevo Insumo"}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-[#21283A] text-[#8B949E] hover:text-[#E6EDF3] rounded-xl border border-transparent hover:border-[#30363D] transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── CONTENIDO SCROLLEABLE BALANCEADO (2 COLUMNAS 7-5) ─── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-6xl mx-auto">
          {/* Columna Izquierda (7 cols): Datos clave, Stock y Costos */}
          <div className="lg:col-span-7 space-y-4">
            <BasicInfo
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
              categoryNames={categoryNames}
            />
            <StockPanel
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
            />
            <CostPanel
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
            />
          </div>

          {/* Columna Derecha (5 cols): Foto, Clasificación, Alertas y Preview */}
          <div className="lg:col-span-5 space-y-4">
            <ImageUpload
              currentImage={formData.image}
              onUpload={(url, publicId) =>
                setFormData({ ...formData, image: url, imagePublicId: publicId })
              }
            />
            <LocationPanel formData={formData} setFormData={setFormData} />
            <StatusPanel formData={formData} setFormData={setFormData} />
            <PreviewPanel formData={formData} />

            {/* Error global */}
            {globalError && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[rgba(248,81,73,0.12)] border border-[rgba(248,81,73,0.30)] text-[#F85149] text-xs">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <p>{globalError}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER STICKY QUE NUNCA SE CORTA ─────────────────── */}
      <div className="shrink-0 h-16 bg-[#161B22] border-t border-[#30363D] px-4 md:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[rgba(63,185,80,0.15)] border border-[rgba(63,185,80,0.30)] rounded-full text-[#3FB950] text-xs font-bold">
              <CheckCircle size={13} />
              <span>Guardado exitosamente</span>
            </div>
          )}
          {!saved && isValid && (
            <span className="text-xs text-[#8B949E] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3FB950]" />
              Formulario listo para guardar
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] transition-colors"
          >
            Descartar
          </button>
          <button
            type="submit"
            disabled={loading || !isValid}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0B429] hover:bg-[#D99B16] text-[#0D1117] font-bold text-xs uppercase tracking-wider shadow-sm shadow-[#F0B429]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Guardando…</span>
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                <span>{item ? "Guardar Cambios" : "Crear Insumo"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
