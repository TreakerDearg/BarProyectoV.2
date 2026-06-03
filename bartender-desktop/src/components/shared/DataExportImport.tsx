"use client";

import { useState } from "react";
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

export type ExportFormat = "json" | "csv" | "xlsx";

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeRelations?: boolean;
  dateRange?: { start: Date; end: Date };
}

interface Props {
  data: any[];
  filename: string;
  onExport?: (options: ExportOptions) => Promise<void>;
  onImport?: (file: File) => Promise<void>;
  availableFormats?: ExportFormat[];
}

export default function DataExportImport({
  data,
  filename,
  onExport,
  onImport,
  availableFormats = ["json", "csv"]
}: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: ""
  });

  const exportToJSON = (data: any[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
        return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportStatus({ type: null, message: "" });

    try {
      if (onExport) {
        await onExport({ format });
      } else {
        // Default export logic
        if (format === "json") {
          exportToJSON(data, filename);
        } else if (format === "csv") {
          exportToCSV(data, filename);
        }
      }
      setExportStatus({ type: "success", message: "Exportación completada exitosamente" });
    } catch (error) {
      setExportStatus({ type: "error", message: "Error al exportar datos" });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus({ type: null, message: "" }), 3000);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setExportStatus({ type: null, message: "" });

    try {
      if (onImport) {
        await onImport(file);
        setExportStatus({ type: "success", message: "Importación completada exitosamente" });
      }
    } catch (error) {
      setExportStatus({ type: "error", message: "Error al importar datos" });
    } finally {
      setIsImporting(false);
      setTimeout(() => setExportStatus({ type: null, message: "" }), 3000);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case "json":
        return <FileJson size={16} />;
      case "csv":
      case "xlsx":
        return <FileSpreadsheet size={16} />;
    }
  };

  const getFormatLabel = (format: ExportFormat) => {
    switch (format) {
      case "json":
        return "JSON";
      case "csv":
        return "CSV";
      case "xlsx":
        return "Excel";
    }
  };

  return (
    <div className="bg-surface-3/30 border border-white/5 rounded-[2rem] p-6 space-y-4 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400">
          <Download size={16} />
        </div>
        <div>
          <p className="text-xs font-black text-violet-400 uppercase tracking-[0.3em]">Exportar/Importar</p>
          <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">
            Gestión de datos
          </p>
        </div>
      </div>

      {/* Export Section */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Exportar Datos</p>
        <div className="flex flex-wrap gap-2">
          {availableFormats.map((format) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              disabled={isExporting || data.length === 0}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-semibold
                ${isExporting || data.length === 0
                  ? "bg-white/5 border-white/10 text-muted/50 cursor-not-allowed"
                  : "bg-white/5 border-white/10 text-muted hover:border-white/20 hover:bg-white/10 hover:text-ivory"
                }
              `}
            >
              {getFormatIcon(format)}
              <span>{getFormatLabel(format)}</span>
              {isExporting && <span className="text-xs text-muted/50">...</span>}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-muted/50">
          {data.length} registros disponibles para exportar
        </p>
      </div>

      {/* Import Section */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Importar Datos</p>
        <div className="relative">
          <input
            type="file"
            accept=".json,.csv,.xlsx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
            }}
            disabled={isImporting}
            className="hidden"
            id="file-import"
          />
          <label
            htmlFor="file-import"
            className={`
              flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-semibold cursor-pointer
              ${isImporting
                ? "bg-cyan/5 border-cyan/20 text-cyan/50 cursor-not-allowed"
                : "bg-cyan/5 border-cyan/20 text-cyan-400 hover:bg-cyan/10 hover:border-cyan/30"
              }
            `}
          >
            <Upload size={16} />
            <span>{isImporting ? "Importando..." : "Seleccionar Archivo"}</span>
          </label>
        </div>
        <p className="text-[9px] text-muted/50">
          Formatos aceptados: JSON, CSV, Excel
        </p>
      </div>

      {/* Status Message */}
      {exportStatus.type && (
        <div className={`
          flex items-center gap-2 p-3 rounded-xl border
          ${exportStatus.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
          }
        `}>
          {exportStatus.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          <span className="text-xs font-semibold">{exportStatus.message}</span>
        </div>
      )}

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
        <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-400/80 leading-relaxed">
          Al importar datos, se sobrescribirán los registros existentes. Se recomienda hacer un respaldo antes de importar.
        </p>
      </div>
    </div>
  );
}
