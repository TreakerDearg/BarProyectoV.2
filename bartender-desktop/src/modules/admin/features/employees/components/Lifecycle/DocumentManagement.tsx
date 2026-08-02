/**
 * DOCUMENT MANAGEMENT
 * Arquitectura preparada para gestión documental
 */

"use client";

import { FileText, Upload, Download, Trash2, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export type DocumentType = "contract" | "certificate" | "training" | "legal" | "evaluation" | "other";
export type DocumentStatus = "valid" | "expired" | "pending" | "expiring_soon";

interface Document {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  uploadDate: Date;
  expiryDate?: Date;
  status: DocumentStatus;
  size?: number;
  uploadedBy?: string;
}

interface Props {
  documents: Document[];
  onUpload?: (document: Omit<Document, "id" | "uploadDate" | "status">) => void;
  onDownload?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
}

const DOCUMENT_TYPE_CONFIGS: Record<DocumentType, { label: string; icon: any; color: string }> = {
  contract: {
    label: "Contrato",
    icon: FileText,
    color: "text-blue-400",
  },
  certificate: {
    label: "Certificado",
    icon: CheckCircle,
    color: "text-emerald-400",
  },
  training: {
    label: "Capacitación",
    icon: FileText,
    color: "text-purple-400",
  },
  legal: {
    label: "Documentación Legal",
    icon: FileText,
    color: "text-red-400",
  },
  evaluation: {
    label: "Evaluación",
    icon: FileText,
    color: "text-amber-400",
  },
  other: {
    label: "Otro",
    icon: FileText,
    color: "text-gray-400",
  },
};

const DOCUMENT_STATUS_CONFIGS: Record<DocumentStatus, { label: string; icon: any; color: string; bgColor: string }> = {
  valid: {
    label: "Válido",
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20 border-emerald-500/30",
  },
  expired: {
    label: "Vencido",
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-500/20 border-red-500/30",
  },
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
  },
  expiring_soon: {
    label: "Por Vencer",
    icon: AlertTriangle,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20 border-orange-500/30",
  },
};

export function DocumentManagement({ documents, onUpload, onDownload, onDelete }: Props) {
  const getDocumentStatus = (document: Document): DocumentStatus => {
    if (!document.expiryDate) return "valid";
    
    const now = new Date();
    const expiry = new Date(document.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 30) return "expiring_soon";
    return "valid";
  };

  const documentsWithStatus = documents.map((doc) => ({
    ...doc,
    status: getDocumentStatus(doc),
  }));

  const expiredDocuments = documentsWithStatus.filter((doc) => doc.status === "expired");
  const expiringSoonDocuments = documentsWithStatus.filter((doc) => doc.status === "expiring_soon");
  const validDocuments = documentsWithStatus.filter((doc) => doc.status === "valid");
  const pendingDocuments = documentsWithStatus.filter((doc) => doc.status === "pending");

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <FileText size={24} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Gestión Documental</h2>
          <p className="text-sm text-gray-400">Documentos asociados al empleado</p>
        </div>
      </div>

      {/* Alertas de Documentos */}
      {(expiredDocuments.length > 0 || expiringSoonDocuments.length > 0) && (
        <div className="mb-6 space-y-2">
          {expiredDocuments.length > 0 && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" aria-hidden="true" />
              <span className="text-sm text-red-400">
                {expiredDocuments.length} documento(s) vencido(s)
              </span>
            </div>
          )}
          {expiringSoonDocuments.length > 0 && (
            <div className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-400" aria-hidden="true" />
              <span className="text-sm text-orange-400">
                {expiringSoonDocuments.length} documento(s) por vencer
              </span>
            </div>
          )}
        </div>
      )}

      {/* Botón de Subir */}
      {onUpload && (
        <button
          onClick={() => {
            // En una implementación real, esto abriría un modal de subida
            console.log("Subir documento");
          }}
          className="mb-6 w-full p-3 bg-gray-700/30 border border-gray-600/30 rounded-lg flex items-center justify-center gap-2 hover:bggray-700/50 transition-all"
          aria-label="Subir documento"
        >
          <Upload size={16} className="text-gray-400" aria-hidden="true" />
          <span className="text-sm text-gray-300">Subir Documento</span>
        </button>
      )}

      {/* Lista de Documentos */}
      <div className="space-y-3">
        {documentsWithStatus.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay documentos asociados
          </div>
        ) : (
          documentsWithStatus.map((document) => {
            const typeConfig = DOCUMENT_TYPE_CONFIGS[document.type];
            const statusConfig = DOCUMENT_STATUS_CONFIGS[document.status];
            const TypeIcon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={document.id}
                className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                    <TypeIcon size={16} className={typeConfig.color} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{document.name}</h4>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded ${statusConfig.bgColor}`}>
                        <StatusIcon size={12} className={statusConfig.color} aria-hidden="true" />
                        <span className={`text-[10px] font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-gray-400">
                      <span>Subido: {new Date(document.uploadDate).toLocaleDateString()}</span>
                      {document.expiryDate && (
                        <span>
                          Vence: {new Date(document.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                      {document.size && (
                        <span>{(document.size / 1024).toFixed(1)} KB</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onDownload && (
                      <button
                        onClick={() => onDownload(document.id)}
                        className="p-2 hover:bg-blue-500/20 rounded transition-colors"
                        aria-label="Descargar documento"
                      >
                        <Download size={14} className="text-blue-400" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(document.id)}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors"
                        aria-label="Eliminar documento"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Leyenda de Estados */}
      <div className="mt-6 flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Válido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Por Vencer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Vencido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Pendiente</span>
        </div>
      </div>
    </div>
  );
}
