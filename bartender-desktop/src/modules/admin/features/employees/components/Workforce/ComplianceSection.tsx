/**
 * COMPLIANCE SECTION
 * Sección de cumplimiento del empleado
 */

"use client";

import { Shield, AlertTriangle, CheckCircle, XCircle, FileText } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
}

export function ComplianceSection({ employee }: Props) {
  const compliance = employee.compliance as any;

  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  };

  const getComplianceBgColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Shield size={20} className="text-amber-400" />
        Cumplimiento
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Puntuación General */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Puntuación General</p>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-4xl font-bold ${getComplianceColor(compliance?.overallScore || 0)}`}>
                {compliance?.overallScore || 0}%
              </p>
              <p className="text-xs text-gray-400 mt-1">Cumplimiento total</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-gray-600 flex items-center justify-center">
              <div
                className={`w-12 h-12 rounded-full ${getComplianceBgColor(compliance?.overallScore || 0)}`}
                style={{
                  background: `conic-gradient(${getComplianceBgColor(compliance?.overallScore || 0)} ${compliance?.overallScore || 0}%, transparent 0)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Adherencia a Protocolos */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Adherencia a Protocolos</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Protocolos seguidos</span>
                <span className="text-white">{compliance?.protocolsFollowed || 0}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${compliance?.protocolAdherence || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Cumplimiento de tiempo</span>
                <span className="text-white">{compliance?.timeCompliance || 0}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${compliance?.timeCompliance || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Puntuación de calidad</span>
                <span className="text-white">{compliance?.qualityScore || 0}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${compliance?.qualityScore || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cumplimiento por Protocolo */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-white mb-4">Cumplimiento por Protocolo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {compliance?.protocols && (
            <>
              <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-amber-400" />
                  <p className="text-xs font-bold text-white">Apertura</p>
                </div>
                <p className="text-2xl font-bold text-white">{compliance.protocols.opening || 0}%</p>
              </div>

              <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-blue-400" />
                  <p className="text-xs font-bold text-white">Cierre</p>
                </div>
                <p className="text-2xl font-bold text-white">{compliance.protocols.closing || 0}%</p>
              </div>

              <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-emerald-400" />
                  <p className="text-xs font-bold text-white">Servicio</p>
                </div>
                <p className="text-2xl font-bold text-white">{compliance.protocols.service || 0}%</p>
              </div>

              <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-red-400" />
                  <p className="text-xs font-bold text-white">Seguridad</p>
                </div>
                <p className="text-2xl font-bold text-white">{compliance.protocols.safety || 0}%</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Violaciones y Advertencias */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={16} className="text-red-400" />
            <p className="text-sm font-bold text-white">Violaciones</p>
          </div>
          {compliance?.violations && compliance.violations.length > 0 ? (
            <div className="space-y-2">
              {compliance.violations.slice(0, 3).map((violation: any, index: number) => (
                <div key={index} className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-xs text-white">{violation.description || "Sin descripción"}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{violation.date || "Sin fecha"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No hay violaciones registradas</p>
          )}
        </div>

        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-400" />
            <p className="text-sm font-bold text-white">Advertencias</p>
          </div>
          {compliance?.warnings && compliance.warnings.length > 0 ? (
            <div className="space-y-2">
              {compliance.warnings.slice(0, 3).map((warning: any, index: number) => (
                <div key={index} className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-xs text-white">{warning.description || "Sin descripción"}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{warning.date || "Sin fecha"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No hay advertencias registradas</p>
          )}
        </div>
      </div>

      {/* Historial Disciplinario */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white">Historial Disciplinario</h3>
        </div>
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          {compliance?.violations && compliance.violations.length > 0 ? (
            <div className="space-y-2">
              {compliance.violations.map((violation: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-600/20 rounded-lg">
                  <XCircle size={14} className="text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-white">{violation.description || "Sin descripción"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-gray-400">{violation.date || "Sin fecha"}</p>
                      {violation.severity && (
                        <span className={`text-[10px] px-2 py-0.5 rounded ${
                          violation.severity === "high"
                            ? "bg-red-500/20 text-red-400"
                            : violation.severity === "medium"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {violation.severity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Historial disciplinario limpio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
