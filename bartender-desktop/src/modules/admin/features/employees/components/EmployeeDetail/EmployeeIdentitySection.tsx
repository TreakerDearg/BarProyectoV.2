/**
 * EMPLOYEE IDENTITY SECTION
 * Sección de identidad del empleado (OAuth, cuenta local, Google, verificación)
 */

"use client";

import { Shield, Mail, CheckCircle, AlertCircle, Link, Unlink } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
}

export function EmployeeIdentitySection({ employee }: Props) {
  const hasGoogle = !!employee.googleId;
  const isLocal = employee.provider === "local";
  const isVerified = employee.providerVerified;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6" role="region" aria-label="Información de identidad del empleado">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Shield size={20} className="text-amber-400" />
        Identidad
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proveedor de Autenticación */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Proveedor de Autenticación</p>
          <div className="flex items-center gap-3">
            <div className={`p-2 ${isLocal ? "bg-blue-400/20" : "bg-red-400/20"} rounded-lg`}>
              <Mail size={16} className={isLocal ? "text-blue-400" : "text-red-400"} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {isLocal ? "Cuenta Local" : employee.provider?.toUpperCase() || "LOCAL"}
              </p>
              <p className="text-xs text-gray-400">
                {isLocal ? "Autenticación con contraseña" : "Autenticación externa"}
              </p>
            </div>
          </div>
        </div>

        {/* Estado de Verificación */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Estado de Verificación</p>
          <div className="flex items-center gap-3">
            <div className={`p-2 ${isVerified ? "bg-emerald-400/20" : "bg-amber-400/20"} rounded-lg`}>
              {isVerified ? (
                <CheckCircle size={16} className="text-emerald-400" />
              ) : (
                <AlertCircle size={16} className="text-amber-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {isVerified ? "Verificado" : "No Verificado"}
              </p>
              <p className="text-xs text-gray-400">
                {isVerified ? "Cuenta verificada" : "Cuenta pendiente de verificación"}
              </p>
            </div>
          </div>
        </div>

        {/* Google OAuth */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Google OAuth</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${hasGoogle ? "bg-red-400/20" : "bg-gray-600/20"} rounded-lg`}>
                <Mail size={16} className={hasGoogle ? "text-red-400" : "text-gray-400"} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {hasGoogle ? "Vinculado" : "No Vinculado"}
                </p>
                <p className="text-xs text-gray-400">
                  {hasGoogle ? "Cuenta Google conectada" : "Sin conexión Google"}
                </p>
              </div>
            </div>
            <button
              className={`p-2 rounded-lg transition-colors ${
                hasGoogle
                  ? "bg-red-400/20 text-red-400 hover:bg-red-400/30"
                  : "bg-blue-400/20 text-blue-400 hover:bg-blue-400/30"
              }`}
              aria-label={hasGoogle ? "Desvincular Google" : "Vincular Google"}
            >
              {hasGoogle ? <Unlink size={16} /> : <Link size={16} />}
            </button>
          </div>
        </div>

        {/* Último Acceso */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Último Acceso</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-400/20 rounded-lg">
              <Shield size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {employee.lastLogin ? new Date(employee.lastLogin).toLocaleString() : "Nunca"}
              </p>
              <p className="text-xs text-gray-400">
                {employee.lastProviderLogin
                  ? `Último acceso ${employee.provider}: ${new Date(employee.lastProviderLogin).toLocaleString()}`
                  : "Sin acceso externo"}
              </p>
            </div>
          </div>
        </div>

        {/* Estado de la Identidad */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 md:col-span-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Estado de la Identidad</p>
          <div className="flex items-center gap-3">
            <div className={`p-2 ${employee.isActive ? "bg-emerald-400/20" : "bg-red-400/20"} rounded-lg`}>
              {employee.isActive ? (
                <CheckCircle size={16} className="text-emerald-400" />
              ) : (
                <AlertCircle size={16} className="text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {employee.isActive ? "Identidad Activa" : "Identidad Inactiva"}
              </p>
              <p className="text-xs text-gray-400">
                {employee.isActive
                  ? "La identidad del empleado está activa y funcional"
                  : "La identidad del empleado está inactiva"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
