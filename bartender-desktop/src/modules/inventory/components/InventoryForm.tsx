"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  X, CheckCircle, AlertTriangle, Package, DollarSign,
  Loader2, Target, MapPin, Activity, Gauge, Bell,
  Upload, Eye, ChevronRight, Info, Layers, Tag,
  ToggleLeft, ToggleRight,
} from "lucide-react";

import "../../../styles/nebula-forms-theme.css";
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
  { value: "l",       label: "l — Litros"          },
  { value: "g",       label: "g — Gramos"          },
  { value: "kg",      label: "kg — Kilogramos"     },
  { value: "unit",    label: "u — Unidad"          },
  { value: "oz",      label: "oz — Onzas"          },
  { value: "portion", label: "por — Porción"       },
];

const SECTOR_OPTIONS: { value: InventoryItem["sector"]; label: string; color: string }[] = [
  { value: "bar",     label: "Barra",   color: "bg-amber-500/15 border-amber-500/30 text-amber-300"    },
  { value: "kitchen", label: "Cocina",  color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" },
  { value: "general", label: "General", color: "bg-violet-500/15 border-violet-500/30 text-violet-300"  },
];

const LOCATION_OPTIONS: { value: InventoryItem["location"]; label: string }[] = [
  { value: "bar",     label: "Barra"           },
  { value: "kitchen", label: "Cocina"          },
  { value: "storage", label: "Bodega / Almacén"},
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
  return `w-full bg-white/5 rounded-lg px-4 py-3 text-ivory text-sm transition-all outline-none ${
    err
      ? "border border-red-500/60 focus:ring-2 focus:ring-red-500/30"
      : "border border-white/10 focus:ring-2 focus:ring-violet-400/40 focus:border-transparent"
  }`;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-red-400 mt-1.5 ml-1">
      <AlertTriangle size={11} /> {msg}
    </p>
  );
}

function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
      <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">{title}</h3>
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
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <SectionHeader
        icon={<Upload size={18} className="text-cyan-400" />}
        title="Imagen del insumo"
        color="bg-cyan-500/10"
      />

      <div
        className={`relative group cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all ${
          uploading ? "border-cyan-500/40 cursor-wait" : "border-white/10 hover:border-cyan-500/40"
        }`}
        style={{ aspectRatio: "16/9" }}
      >
        {display ? (
          <>
            <img
              src={display}
              alt="Vista previa"
              className="absolute inset-0 w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
            />
            {!uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity">
                <Upload size={22} className="text-ivory mb-1" />
                <p className="text-xs font-semibold text-ivory">Cambiar imagen</p>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <Loader2 size={26} className="animate-spin text-cyan-400 mb-2" />
                <p className="text-xs text-cyan-300 font-semibold">Subiendo…</p>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {uploading ? (
              <>
                <Loader2 size={26} className="animate-spin text-cyan-400 mb-2" />
                <p className="text-xs text-cyan-300 font-semibold">Subiendo…</p>
              </>
            ) : (
              <>
                <Upload size={26} className="text-muted mb-2" />
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
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-wait"
        />
      </div>

      {display && !uploading && (
        <button
          type="button"
          onClick={() => { onUpload("", ""); setPreview(null); }}
          className="mt-2 text-[11px] text-red-400/60 hover:text-red-400 transition-colors"
        >
          Quitar imagen
        </button>
      )}
      {error && (
        <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
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
    <div className="nebula-form-card nebula-form-animate-slide-in space-y-5">
      <SectionHeader
        icon={<Target size={18} className="text-violet-400" />}
        title="Identificación"
        color="bg-violet-500/10"
      />

      {/* Nombre */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
          Nombre del insumo <span className="text-red-400">*</span>
        </label>
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Gin Mare Premium"
          maxLength={80}
          className={inputCls(!!fieldErrors.name)}
        />
        <div className="flex justify-between mt-1">
          <FieldError msg={fieldErrors.name} />
          <span className={`text-[10px] ml-auto ${formData.name.length > 70 ? "text-red-400" : "text-muted/40"}`}>
            {formData.name.length}/80
          </span>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
          Descripción <span className="text-muted/40 font-normal normal-case">(opcional)</span>
        </label>
        <textarea
          value={formData.description ?? ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Notas internas sobre el insumo…"
          maxLength={300}
          className={`${inputCls()} resize-none h-20`}
        />
        <span className={`text-[10px] ${formData.description && formData.description.length > 270 ? "text-red-400" : "text-muted/40"} float-right mt-0.5`}>
          {(formData.description ?? "").length}/300
        </span>
      </div>

      {/* Categoría */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
          Categoría <span className="text-red-400">*</span>
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
        {formData.category && CATEGORY_LOCATION_MAP[formData.category.toLowerCase()] && (
          <p className="text-[10px] text-cyan-400/70 mt-1 ml-1 flex items-center gap-1">
            <Info size={10} />
            Ubicación sugerida: {LOCATION_OPTIONS.find(l => l.value === CATEGORY_LOCATION_MAP[formData.category.toLowerCase()])?.label}
          </p>
        )}
      </div>

      {/* Proveedor */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
          Proveedor
        </label>
        <div className="relative">
          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={15} />
          <input
            value={formData.supplier ?? ""}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="Ej: Diageo Argentina"
            maxLength={80}
            className={`${inputCls()} pl-10`}
          />
        </div>
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

  const barColor = isCritical ? "bg-red-400 animate-pulse" : isLow ? "bg-amber-400" : "bg-emerald-400";
  const textColor = isCritical ? "text-red-400" : isLow ? "text-amber-400" : "text-emerald-400";
  const statusLabel = isCritical ? "Crítico" : isLow ? "Stock bajo" : "Normal";

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in space-y-5">
      <SectionHeader
        icon={<Gauge size={18} className="text-emerald-400" />}
        title="Niveles de stock"
        color="bg-emerald-500/10"
      />

      {/* Inputs stock */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
            Actual <span className="text-red-400">*</span>
          </label>
          <input
            type="number" min={0}
            value={formData.stock || ""}
            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            className={`${inputCls(!!fieldErrors.stock)} text-center`}
            placeholder="0"
          />
          <FieldError msg={fieldErrors.stock} />
        </div>
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
            Mínimo
          </label>
          <input
            type="number" min={0}
            value={formData.minStock || ""}
            onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
            className={`${inputCls(!!fieldErrors.minStock)} text-center`}
            placeholder="5"
          />
          <FieldError msg={fieldErrors.minStock} />
        </div>
        <div>
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
            Máximo
          </label>
          <input
            type="number" min={1}
            value={formData.maxStock || ""}
            onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })}
            className={`${inputCls(!!fieldErrors.maxStock)} text-center`}
            placeholder="100"
          />
          <FieldError msg={fieldErrors.maxStock} />
        </div>
      </div>

      {/* Visualización */}
      <div className={`p-4 rounded-xl border transition-all ${
        isCritical ? "bg-red-500/8 border-red-500/25" :
        isLow      ? "bg-amber-500/8 border-amber-500/25" :
                     "bg-emerald-500/8 border-emerald-500/25"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted">Nivel actual</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${textColor}`}>{statusLabel}</span>
            <span className={`text-2xl font-extrabold ${textColor}`}>{pct.toFixed(0)}%</span>
          </div>
        </div>
        <div className="h-3 bg-black/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-muted mt-1">
          <span>0 {formData.unit}</span>
          <span>mín {formData.minStock}</span>
          <span>{formData.maxStock} {formData.unit}</span>
        </div>
        {isCritical && (
          <div className="mt-3 flex items-start gap-2 p-2 bg-red-500/8 rounded-lg text-xs text-red-400">
            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
            Requiere reposición inmediata.
          </div>
        )}
        {isLow && (
          <div className="mt-3 flex items-start gap-2 p-2 bg-amber-500/8 rounded-lg text-xs text-amber-400">
            <Bell size={12} className="mt-0.5 flex-shrink-0" />
            Stock bajo — considerá reponer pronto.
          </div>
        )}
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
    <div className="nebula-form-card nebula-form-animate-slide-in space-y-5">
      <SectionHeader
        icon={<MapPin size={18} className="text-cyan-400" />}
        title="Ubicación y clasificación"
        color="bg-cyan-500/10"
      />

      {/* Unidad */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
          Unidad de medida
        </label>
        <select
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value as InventoryItem["unit"] })}
          className={inputCls()}
        >
          {UNIT_OPTIONS.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>

      {/* Sector */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
          Sector operativo
        </label>
        <div className="flex gap-2">
          {SECTOR_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setFormData({ ...formData, sector: s.value })}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                formData.sector === s.value
                  ? s.color
                  : "bg-white/5 border-white/10 text-muted hover:bg-white/10"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ubicación física */}
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
          Ubicación física
        </label>
        <div className="grid grid-cols-1 gap-2">
          {LOCATION_OPTIONS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setFormData({ ...formData, location: l.value })}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                formData.location === l.value
                  ? "bg-violet-500/15 border-violet-500/35 text-violet-300"
                  : "bg-white/3 border-white/8 text-muted hover:bg-white/8 hover:text-ivory"
              }`}
            >
              <Layers size={15} className={formData.location === l.value ? "text-violet-400" : "text-muted/50"} />
              {l.label}
              {formData.location === l.value && (
                <CheckCircle size={14} className="ml-auto text-violet-400" />
              )}
            </button>
          ))}
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
    <div className="nebula-form-card nebula-form-animate-slide-in space-y-5">
      <SectionHeader
        icon={<DollarSign size={18} className="text-gold" />}
        title="Costos"
        color="bg-amber-500/10"
      />

      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">
          Costo por unidad
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={15} />
          <input
            type="number" min={0} step="0.01"
            value={formData.cost || ""}
            onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
            className={`${inputCls(!!fieldErrors.cost)} pl-10 font-mono`}
            placeholder="0.00"
          />
        </div>
        <FieldError msg={fieldErrors.cost} />
      </div>

      {formData.cost > 0 && (
        <div className="p-4 bg-amber-500/8 rounded-xl border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Valor total del stock</span>
            <span className="text-2xl font-bold text-gold">${totalValue.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-muted/60 mt-1">
            {formData.stock} {formData.unit} × ${formData.cost.toFixed(2)}
          </p>
        </div>
      )}
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
    <div className="nebula-form-card nebula-form-animate-slide-in space-y-4">
      <SectionHeader
        icon={<Activity size={18} className="text-rose-400" />}
        title="Estado y alertas"
        color="bg-rose-500/10"
      />

      {/* Toggle isActive */}
      <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/8">
        <div>
          <p className="text-sm font-bold text-ivory">Insumo activo</p>
          <p className="text-[11px] text-muted mt-0.5">Visible en el sistema y recetas</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={formData.isActive}
          onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400/40 ${
            formData.isActive ? "bg-emerald-500" : "bg-white/20"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              formData.isActive ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Info alertas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-white/3 rounded-lg border border-white/8">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Bell size={13} />
            Alerta de stock bajo
          </div>
          <span className="text-xs font-semibold text-ivory">
            ≤ {formData.minStock} {formData.unit}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/3 rounded-lg border border-white/8">
          <div className="flex items-center gap-2 text-xs text-muted">
            <AlertTriangle size={13} />
            Alerta crítica
          </div>
          <span className="text-xs font-semibold text-red-400">
            ≤ {formData.minStock} {formData.unit}
          </span>
        </div>
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
    <div className="nebula-form-card nebula-form-animate-scale-in space-y-4">
      <SectionHeader
        icon={<Eye size={18} className="text-violet-400" />}
        title="Vista previa"
        color="bg-violet-500/10"
      />

      <div className="p-4 bg-gradient-to-br from-violet-500/10 to-cyan-500/8 rounded-xl border border-violet-500/20 space-y-3">
        {formData.image && (
          <img
            src={formData.image}
            alt={formData.name}
            className="w-full h-24 object-cover rounded-lg"
          />
        )}
        {!formData.image && (
          <div className="w-full h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Package size={22} className="text-muted/30" />
          </div>
        )}
        <div>
          <h4 className="text-base font-bold text-ivory">
            {formData.name || <span className="text-muted italic font-normal">Sin nombre</span>}
          </h4>
          <p className="text-[11px] text-muted mt-0.5">{formData.category || "Sin categoría"}</p>
          {formData.description && (
            <p className="text-[11px] text-muted/70 mt-1 line-clamp-2">{formData.description}</p>
          )}
        </div>

        {/* Barra de stock */}
        <div>
          <div className="flex justify-between text-[9px] text-muted mb-1">
            <span>Stock: {formData.stock} {formData.unit}</span>
            <span className={isCritical ? "text-red-400" : isLow ? "text-amber-400" : "text-emerald-400"}>
              {pct}%
            </span>
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isCritical ? "bg-red-400" : isLow ? "bg-amber-400" : "bg-emerald-400"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-white/5 rounded-lg border border-white/8">
          <p className="text-[10px] text-muted">Sector</p>
          <p className="text-sm font-semibold text-ivory capitalize">{formData.sector}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg border border-white/8">
          <p className="text-[10px] text-muted">Ubicación</p>
          <p className="text-sm font-semibold text-ivory capitalize">
            {LOCATION_OPTIONS.find(l => l.value === formData.location)?.label ?? formData.location}
          </p>
        </div>
      </div>

      {formData.cost > 0 && (
        <div className="p-3 bg-amber-500/8 rounded-lg border border-amber-500/20 flex items-center justify-between">
          <span className="text-xs text-muted">Valor en stock</span>
          <span className="text-lg font-bold text-gold">
            ${(formData.stock * formData.cost).toFixed(2)}
          </span>
        </div>
      )}

      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${
        formData.isActive
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-white/5 border-white/10 text-muted"
      }`}>
        {formData.isActive
          ? <><CheckCircle size={13} /> Activo</>
          : <><X size={13} /> Inactivo</>
        }
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────

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

  // Limpiar error global cuando el usuario edita
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
      setGlobalError("Corregí los errores antes de guardar");
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
      className="flex flex-col h-full animate-fade-in"
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      noValidate
    >
      {/* HEADER */}
      <div className="px-4 py-4 md:px-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-surface-2">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-xl shadow-lg">
            <Package className="text-white" size={22} />
          </div>
          <div>
            <nav className="flex items-center gap-2 text-xs text-muted mb-1">
              <span>Inventario</span>
              <ChevronRight size={12} />
              <span className="text-violet-300 font-medium">
                {item ? "Editar insumo" : "Nuevo insumo"}
              </span>
            </nav>
            <h2 className="text-xl md:text-2xl font-bold text-ivory">
              {item ? "Editar insumo" : "Nuevo insumo"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Estado activo en el header */}
          <div className="flex items-center gap-2 bg-surface-3 px-3 py-2 rounded-lg border border-white/10">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Estado</span>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive}
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400/40 ${
                formData.isActive ? "bg-emerald-500" : "bg-white/20"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                  formData.isActive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-medium ${formData.isActive ? "text-emerald-400" : "text-muted"}`}>
              {formData.isActive ? "Activo" : "Inactivo"}
            </span>
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

      {/* CONTENIDO — grid asimétrico */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto pb-6 nebula-forms-scroll">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

          {/* COLUMNA IZQUIERDA — 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            <ImageUpload
              currentImage={formData.image}
              onUpload={(url, publicId) =>
                setFormData({ ...formData, image: url, imagePublicId: publicId })
              }
            />
            <BasicInfo
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
              categoryNames={categoryNames}
            />
          </div>

          {/* COLUMNA CENTRO — 4 cols */}
          <div className="lg:col-span-4 space-y-6">
            <StockPanel
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
            />
            <LocationPanel formData={formData} setFormData={setFormData} />
            <CostPanel
              formData={formData}
              setFormData={setFormData}
              fieldErrors={fieldErrors}
            />
          </div>

          {/* COLUMNA DERECHA — 3 cols */}
          <div className="lg:col-span-3 space-y-6">
            <StatusPanel formData={formData} setFormData={setFormData} />
            <PreviewPanel formData={formData} />

            {/* Errores globales */}
            {globalError && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-red-300 leading-relaxed">{globalError}</p>
              </div>
            )}

            {/* Ready */}
            {isValid && !globalError && Object.keys(fieldErrors).length === 0 && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <CheckCircle className="text-emerald-400 shrink-0" size={16} />
                <p className="text-xs text-emerald-300">Listo para guardar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER FIJO */}
      <div className="sticky bottom-0 left-0 right-0 h-[68px] bg-surface-2/95 backdrop-blur-xl border-t border-white/10 px-6 md:px-12 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <CheckCircle size={13} className="text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Guardado</span>
            </div>
          )}
          {!saved && isValid && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[11px] text-muted uppercase tracking-widest font-bold">Sin guardar</span>
            </div>
          )}
        </div>

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
            className="flex items-center gap-2 bg-violet-500 text-white px-6 py-2.5 rounded-lg text-sm font-black shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:bg-violet-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={16} /><span>Guardando…</span></>
            ) : (
              <><CheckCircle size={16} /><span>{item ? "Guardar cambios" : "Crear insumo"}</span></>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
