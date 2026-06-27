"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  Package,
  DollarSign,
  Loader2,
  Target,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Eye,
  MapPin,
  Activity,
  Gauge,
  Bell,
  Warehouse
} from "lucide-react";

import "../../../styles/nebula-forms-theme.css";

import type { InventoryItem } from "../types/inventory";

interface Props {
  item?: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}

const EMPTY_FORM: any = {
  name: "",
  stock: 0,
  minStock: 5,
  maxStock: 100,
  unit: "unit",
  sector: "bar",
  category: "",
  cost: 0,
  supplier: "",
  location: "bar",
  isActive: true,
};

const UNIT_OPTIONS = ["ml", "l", "g", "kg", "unit", "oz", "portion", "box"];
const SECTOR_OPTIONS = ["bar", "kitchen", "general"];
const LOCATION_OPTIONS = [
  { value: "Bóveda Central", icon: <Warehouse size={16} />, label: "Bóveda Central" },
  { value: "Barra Principal", icon: <Activity size={16} />, label: "Barra Principal" },
  { value: "Cocina VIP", icon: <ShieldCheck size={16} />, label: "Cocina VIP" },
  { value: "Bodega Externa", icon: <Package size={16} />, label: "Bodega Externa" },
];

const CATEGORY_LOCATION_MAPPING: Record<string, string> = {
  "destilados": "Bóveda Central",
  "licores": "Bóveda Central",
  "cervezas": "Bodega Externa",
  "vinos": "Bóveda Central",
  "jugos": "Barra Principal",
  "frutas": "Cocina VIP",
  "hielo": "Barra Principal",
  "garnish": "Cocina VIP",
  "vasos": "Bodega Externa",
};

// InventoryBasicInfo Component
function InventoryBasicInfo({ formData, setFormData }: { formData: InventoryItem; setFormData: (f: InventoryItem) => void }) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 rounded-xl border border-violet-500/20">
          <Target className="text-violet-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Información Básica</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="nebula-form-label">Nombre del Insumo</label>
          <input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Gin Mare Premium"
            className="nebula-form-input w-full"
          />
        </div>

        <div>
          <label className="nebula-form-label">Categoría</label>
          <input
            name="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ej: Destilados"
            className="nebula-form-input w-full"
          />
        </div>

        <div>
          <label className="nebula-form-label">Proveedor</label>
          <input
            name="supplier"
            value={formData.supplier || ""}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="Ej: Diageo"
            className="nebula-form-input w-full"
          />
        </div>
      </div>
    </div>
  );
}

// StockLevelIndicator Component
function StockLevelIndicator({ formData, setFormData }: { formData: InventoryItem; setFormData: (f: InventoryItem) => void }) {
  const stockPercent = useMemo(() => {
    if (!formData.maxStock) return 0;
    return Math.min((formData.stock / formData.maxStock) * 100, 100);
  }, [formData.stock, formData.maxStock]);

  const isCritical = formData.stock <= formData.minStock;
  const isLow = formData.stock <= formData.minStock * 1.5 && !isCritical;

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 rounded-xl border border-emerald-500/20">
          <Gauge className="text-emerald-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Nivel de Stock</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="nebula-form-label">Actual</label>
            <input
              name="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              className="nebula-form-input w-full text-center"
            />
          </div>
          <div>
            <label className="nebula-form-label">Mínimo</label>
            <input
              name="minStock"
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              className="nebula-form-input w-full text-center"
            />
          </div>
          <div>
            <label className="nebula-form-label">Máximo</label>
            <input
              name="maxStock"
              type="number"
              value={formData.maxStock}
              onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })}
              className="nebula-form-input w-full text-center"
            />
          </div>
        </div>

        <div className={`p-4 rounded-lg border transition-all ${isCritical ? 'bg-red-500/10 border-red-500/30' : isLow ? 'bg-amber-500/10 border-amber-500/30' : 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted">Nivel actual</span>
            <span className={`text-2xl font-bold ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
              {stockPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${isCritical ? 'bg-red-400 animate-pulse' : isLow ? 'bg-amber-400' : 'bg-emerald-400'}`} 
              style={{ width: `${stockPercent}%` }} 
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted">Estado:</span>
            <span className={`font-semibold ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isCritical ? 'Crítico' : isLow ? 'Bajo' : 'Normal'}
            </span>
          </div>
          {isCritical && (
            <div className="mt-3 flex items-start gap-2 text-xs text-red-400 bg-red-500/5 p-2 rounded">
              <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
              <span>Stock crítico. Requiere reposición inmediata.</span>
            </div>
          )}
          {isLow && !isCritical && (
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-400 bg-amber-500/5 p-2 rounded">
              <Bell size={12} className="mt-0.5 flex-shrink-0" />
              <span>Stock bajo. Considera reposición pronto.</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Stock mínimo</p>
            <p className="text-lg font-bold text-ivory">{formData.minStock}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Stock máximo</p>
            <p className="text-lg font-bold text-ivory">{formData.maxStock}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// InventoryLocationPicker Component
function InventoryLocationPicker({ formData, setFormData }: { formData: InventoryItem; setFormData: (f: InventoryItem) => void }) {
  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl border border-cyan-500/20">
          <MapPin className="text-cyan-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Ubicación y Especificaciones</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="nebula-form-label">Unidad de Medida</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
              className="nebula-form-select w-full"
            >
              {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
            </select>
          </div>

          <div>
            <label className="nebula-form-label">Sector</label>
            <select
              name="sector"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value as any })}
              className="nebula-form-select w-full"
            >
              {SECTOR_OPTIONS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="nebula-form-label">Ubicación Física</label>
            <select
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
              className="nebula-form-select w-full"
            >
              {LOCATION_OPTIONS.map(l => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            {formData.category && CATEGORY_LOCATION_MAPPING[formData.category.toLowerCase()] && (
              <button
                onClick={() => setFormData({ ...formData, location: CATEGORY_LOCATION_MAPPING[formData.category.toLowerCase()] as any })}
                className="mt-2 w-full py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs font-semibold text-cyan-400 transition-all flex items-center justify-center gap-2"
              >
                <MapPin size={12} />
                Sugerir ubicación para esta categoría
              </button>
            )}
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              {LOCATION_OPTIONS.find(l => l.value === formData.location)?.icon || <Warehouse className="text-muted" size={16} />}
              <span className="text-xs text-muted">Almacenamiento actual</span>
            </div>
            <p className="text-sm font-semibold text-ivory mt-1">{formData.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// InventoryCostCalculator Component
function InventoryCostCalculator({ formData, setFormData }: { formData: InventoryItem; setFormData: (f: InventoryItem) => void }) {
  const totalValue = useMemo(() => {
    return formData.stock * formData.cost;
  }, [formData.stock, formData.cost]);

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-gold/20 to-amber-500/10 rounded-xl border border-gold/20">
          <DollarSign className="text-gold" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Calculadora de Costos</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="nebula-form-label">Costo por Unidad</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
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

        <div className="p-4 bg-gradient-to-br from-gold/10 to-amber-500/10 rounded-lg border border-gold/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">Valor total del stock</span>
            <span className="text-2xl font-bold text-gold">${totalValue.toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted">
            {formData.stock} unidades × ${formData.cost.toFixed(2)} / unidad
          </div>
        </div>
      </div>
    </div>
  );
}

// StockAlertConfig Component
function StockAlertConfig({ formData }: { formData: InventoryItem }) {
  const isCritical = formData.stock <= formData.minStock;

  return (
    <div className="nebula-form-card nebula-form-animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-500/10 rounded-xl">
          <Bell className="text-red-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-ivory">Configuración de Alertas</h3>
      </div>

      <div className="space-y-3">
        {isCritical && (
          <div className="p-3 bg-red/5 border border-red/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-400" size={16} />
              <span className="text-xs text-red-400 font-semibold">Stock crítico - Requiere reposición inmediata</span>
            </div>
          </div>
        )}

        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-muted" size={16} />
              <span className="text-xs text-muted">Alerta de stock bajo</span>
            </div>
            <span className="text-xs font-semibold text-ivory">
              Cuando stock ≤ {formData.minStock}
            </span>
          </div>
        </div>

        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="text-muted" size={16} />
              <span className="text-xs text-muted">Estado del insumo</span>
            </div>
            <span className={`text-xs font-semibold ${formData.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
              {formData.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// InventoryPreview Component
function InventoryPreview({ formData }: { formData: InventoryItem }) {
  const isCritical = formData.stock <= formData.minStock;

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
          <h4 className="text-lg font-bold text-ivory">{formData.name || "Sin nombre"}</h4>
          <p className="text-xs text-muted mt-1">{formData.category || "Sin categoría"}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-xs font-semibold">
              {formData.unit.toUpperCase()}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${isCritical ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {formData.stock} en stock
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Ubicación</p>
            <p className="text-sm font-semibold text-ivory truncate">{formData.location}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-muted">Sector</p>
            <p className="text-sm font-semibold text-ivory capitalize">{formData.sector}</p>
          </div>
        </div>

        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Costo total</span>
            <span className="text-lg font-bold text-gold">${(formData.stock * formData.cost).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InventoryForm({
  item,
  onSave,
  onClose,
}: Props) {
  const [formData, setFormData] = useState<InventoryItem>(EMPTY_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    basic: false,
    stock: false,
    location: false,
    cost: false,
    alerts: false,
    preview: false,
  });

  useEffect(() => {
    setFormData(item ? { ...EMPTY_FORM, ...item } : EMPTY_FORM);
    setErrors([]);
  }, [item]);

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const validate = () => {
    const err: string[] = [];
    if (!formData.name.trim()) err.push("Se requiere identificar el insumo");
    if (!formData.category.trim()) err.push("Categoría Umbra requerida");
    if (formData.minStock > formData.maxStock) err.push("Conflicto en límites de stock");
    setErrors(err);
    return err.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const isValid = formData.name.trim() && formData.category.trim() && formData.minStock <= formData.maxStock;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="nebula-forms-root w-full max-w-7xl">
        <div className="nebula-forms-aurora" />
        
        <div className="nebula-form-panel">
          {/* HEADER */}
          <div className="p-4 md:p-6 border-b border-violet-500/10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-xl md:rounded-2xl shadow-lg">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-ivory">
                  {item ? "Editar Inventario" : "Nuevo Inventario"}
                </h2>
                <p className="text-xs md:text-sm text-muted">
                  Sistema Nebula de Inventario
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
              {/* LEFT COLUMN - Basic & Stock */}
              <div className="space-y-8">
                {/* Basic Info Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('basic')}
                  >
                    <div className="flex items-center gap-3">
                      <Target className="text-violet-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Información Básica</span>
                    </div>
                    {collapsedSections.basic ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.basic && (
                    <div className="nebula-form-section-content">
                      <InventoryBasicInfo formData={formData} setFormData={setFormData} />
                    </div>
                  )}
                </div>

                {/* Stock Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('stock')}
                  >
                    <div className="flex items-center gap-3">
                      <Gauge className="text-emerald-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Nivel de Stock</span>
                    </div>
                    {collapsedSections.stock ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.stock && (
                    <div className="nebula-form-section-content">
                      <StockLevelIndicator formData={formData} setFormData={setFormData} />
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER COLUMN - Location & Cost */}
              <div className="space-y-6">
                {/* Location Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('location')}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="text-cyan-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Ubicación</span>
                    </div>
                    {collapsedSections.location ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.location && (
                    <div className="nebula-form-section-content">
                      <InventoryLocationPicker formData={formData} setFormData={setFormData} />
                    </div>
                  )}
                </div>

                {/* Cost Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('cost')}
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="text-gold" size={18} />
                      <span className="text-sm font-bold text-ivory">Costos</span>
                    </div>
                    {collapsedSections.cost ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.cost && (
                    <div className="nebula-form-section-content">
                      <InventoryCostCalculator formData={formData} setFormData={setFormData} />
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Alerts & Preview */}
              <div className="space-y-8">
                {/* Alerts Section */}
                <div className="nebula-form-section">
                  <div
                    className="nebula-form-section-header"
                    onClick={() => toggleSection('alerts')}
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="text-red-400" size={18} />
                      <span className="text-sm font-bold text-ivory">Alertas</span>
                    </div>
                    {collapsedSections.alerts ? <ChevronDown className="text-muted" size={18} /> : <ChevronUp className="text-muted" size={18} />}
                  </div>
                  {!collapsedSections.alerts && (
                    <div className="nebula-form-section-content">
                      <StockAlertConfig formData={formData} />
                    </div>
                  )}
                </div>

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
                      <InventoryPreview formData={formData} />
                    </div>
                  )}
                </div>

                {/* Validation Panel */}
                {Array.isArray(errors) && errors.length > 0 && (
                  <div className="nebula-form-card border-red-500/30">
                    <div className="space-y-2">
                      {errors.map((error, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-red-400">
                          <AlertTriangle size={12} className="mt-0.5" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isValid && errors.length === 0 && (
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
                  {item ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}