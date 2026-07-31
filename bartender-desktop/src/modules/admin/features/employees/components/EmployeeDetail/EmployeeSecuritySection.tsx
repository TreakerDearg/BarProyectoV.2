/**
 * EMPLOYEE SECURITY SECTION
 * Sección de seguridad del empleado
 */

"use client";

import { Lock, AlertTriangle, Shield, Key } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
}

export function EmployeeSecuritySection({ employee }: Props) {
  const isLocked = employee.lockedUntil && new Date(employee.lockedUntil) > new Date();
  const loginAttempts = employee.loginAttempts || 0;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6" role="region" aria-label="Seguridad del empleado">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Lock size={20} className="text-amber-400" />
        Seguridad
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estado de Bloqueo */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Estado de Bloqueo</p>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isLocked ? "bg-red-400/20" : "bg-emerald-400/20"}`}>
              <Lock size={16} className={isLocked ? "text-red-400" : "text-emerald-400"} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {isLocked ? "Bloqueado" : "No bloqueado"}
              </p>
              <p className="text-xs text-gray-400">
                {isLocked
                  ? `Hasta ${new Date(employee.lockedUntil!).toLocaleString()}`
                  : "Cuenta desbloqueada"}
              </p>
            </div>
          </div>
        </div>

        {/* Intentos Fallidos */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Intentos Fallidos</p>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${loginAttempts > 0 ? "bg-amber-400/20" : "bg-emerald-400/20"}`}>
              <AlertTriangle size={16} className={loginAttempts > 0 ? "text-amber-400" : "text-emerald-400"} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{loginAttempts}</p>
              <p className="text-xs text-gray-400">Intentos de login fallidos</p>
            </div>
          </div>
        </div>

        {/* MFA (Preparado) */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Autenticación de Dos Factores</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-600/20 rounded-lg">
              <Shield size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No configurado</p>
              <p className="text-xs text-gray-400">MFA no habilitado (preparado)</p>
            </div>
          </div>
        </div>

        {/* Verificación de Correo */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Verificación de Correo</p>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${employee.providerVerified ? "bg-emerald-400/20" : "bg-amber-400/20"}`}>
              <Key size={16} className={employee.providerVerified ? "text-emerald-400" : "text-amber-400"} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {employee.providerVerified ? "Verificado" : "No verificado"}
              </p>
              <p className="text-xs text-gray-400">
                {employee.providerVerified
                  ? "Correo verificado"
                  : "Correo pendiente de verificación"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
