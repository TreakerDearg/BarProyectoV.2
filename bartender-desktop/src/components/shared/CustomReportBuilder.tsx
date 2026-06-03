"use client";

import { useState } from "react";
import { FileText, Plus, Trash2, Download, Filter, BarChart3 } from "lucide-react";

interface ReportField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "currency";
  source: string;
}

interface ReportFilter {
  id: string;
  field: string;
  operator: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "contains";
  value: string | number;
}

interface ReportConfig {
  name: string;
  fields: ReportField[];
  filters: ReportFilter[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export default function CustomReportBuilder() {
  const [config, setConfig] = useState<ReportConfig>({
    name: "",
    fields: [],
    filters: [],
  });

  const [availableFields] = useState<ReportField[]>([
    { id: "1", name: "Nombre del Producto", type: "text", source: "products" },
    { id: "2", name: "Categoría", type: "text", source: "products" },
    { id: "3", name: "Precio", type: "currency", source: "products" },
    { id: "4", name: "Stock", type: "number", source: "inventory" },
    { id: "5", name: "Fecha de Creación", type: "date", source: "products" },
    { id: "6", name: "Ventas Totales", type: "currency", source: "orders" },
    { id: "7", name: "Cantidad Vendida", type: "number", source: "orders" },
    { id: "8", name: "Fecha de Orden", type: "date", source: "orders" },
  ]);

  const addField = (field: ReportField) => {
    if (!config.fields.find(f => f.id === field.id)) {
      setConfig(prev => ({
        ...prev,
        fields: [...prev.fields, field],
      }));
    }
  };

  const removeField = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
    }));
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: "",
      operator: "eq",
      value: "",
    };
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter],
    }));
  };

  const removeFilter = (filterId: string) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId),
    }));
  };

  const updateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.map(f => f.id === filterId ? { ...f, ...updates } : f),
    }));
  };

  const generateReport = () => {
    console.log("Generating report with config:", config);
    // TODO: Implement report generation logic
  };

  const exportReport = () => {
    console.log("Exporting report with config:", config);
    // TODO: Implement report export logic
  };

  return (
    <div className="bg-surface-3 border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/15 text-violet-200">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ivory">Constructor de Reportes</h3>
            <p className="text-xs text-muted">Crea reportes personalizados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 text-violet-200 hover:bg-violet-500/30 transition-colors text-sm font-medium"
          >
            <FileText size={16} />
            Generar
          </button>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Report Name */}
      <div className="mb-6">
        <label className="block text-xs text-muted mb-2">Nombre del Reporte</label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ej: Ventas Mensuales por Categoría"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-ivory placeholder:text-muted/50 outline-none focus:border-violet-400/40 transition-colors"
        />
      </div>

      {/* Available Fields */}
      <div className="mb-6">
        <label className="block text-xs text-muted mb-2">Campos Disponibles</label>
        <div className="flex flex-wrap gap-2">
          {availableFields.map(field => (
            <button
              key={field.id}
              onClick={() => addField(field)}
              disabled={!!config.fields.find(f => f.id === field.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                config.fields.find(f => f.id === field.id)
                  ? "bg-violet-500/20 text-violet-200 cursor-not-allowed"
                  : "bg-white/5 text-muted hover:bg-white/10 hover:text-ivory"
              }`}
            >
              {field.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Fields */}
      {config.fields.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted">Campos Seleccionados</label>
            <span className="text-xs text-muted">{config.fields.length} campos</span>
          </div>
          <div className="space-y-2">
            {config.fields.map(field => (
              <div
                key={field.id}
                className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ivory">{field.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted">
                    {field.type}
                  </span>
                </div>
                <button
                  onClick={() => removeField(field.id)}
                  className="text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-xs text-muted">
            <Filter size={14} />
            Filtros
          </label>
          <button
            onClick={addFilter}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-muted hover:bg-white/10 hover:text-ivory transition-colors text-xs"
          >
            <Plus size={12} />
            Agregar Filtro
          </button>
        </div>
        {config.filters.length === 0 ? (
          <p className="text-xs text-muted/50 italic">No hay filtros aplicados</p>
        ) : (
          <div className="space-y-2">
            {config.filters.map(filter => (
              <div key={filter.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2">
                <select
                  value={filter.field}
                  onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-ivory outline-none"
                >
                  <option value="">Campo</option>
                  {availableFields.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
                <select
                  value={filter.operator}
                  onChange={(e) => updateFilter(filter.id, { operator: e.target.value as any })}
                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-ivory outline-none"
                >
                  <option value="eq">=</option>
                  <option value="ne">≠</option>
                  <option value="gt">&gt;</option>
                  <option value="lt">&lt;</option>
                  <option value="gte">≥</option>
                  <option value="lte">≤</option>
                  <option value="contains">contiene</option>
                </select>
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                  placeholder="Valor"
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-ivory outline-none"
                />
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grouping & Sorting */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted mb-2">Agrupar por</label>
          <select
            value={config.groupBy || ""}
            onChange={(e) => setConfig(prev => ({ ...prev, groupBy: e.target.value || undefined }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-ivory outline-none focus:border-violet-400/40 transition-colors text-sm"
          >
            <option value="">Sin agrupación</option>
            {availableFields.map(f => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-2">Ordenar por</label>
          <div className="flex gap-2">
            <select
              value={config.sortBy || ""}
              onChange={(e) => setConfig(prev => ({ ...prev, sortBy: e.target.value || undefined }))}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-ivory outline-none focus:border-violet-400/40 transition-colors text-sm"
            >
              <option value="">Sin orden</option>
              {config.fields.map(f => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
            <select
              value={config.sortOrder || "asc"}
              onChange={(e) => setConfig(prev => ({ ...prev, sortOrder: e.target.value as "asc" | "desc" }))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-ivory outline-none focus:border-violet-400/40 transition-colors text-sm"
            >
              <option value="asc">↑</option>
              <option value="desc">↓</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
