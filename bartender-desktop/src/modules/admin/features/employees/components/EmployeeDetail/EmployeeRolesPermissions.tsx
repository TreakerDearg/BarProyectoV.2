/**
 * EMPLOYEE ROLES AND PERMISSIONS
 * Sección de roles y permisos del empleado
 */

"use client";

import { Shield, Key, Check, X } from "lucide-react";
import type { Employee } from "../../types";
import { getRoleLabel } from "../../utils";

interface Props {
  employee: Employee;
}

export function EmployeeRolesPermissions({ employee }: Props) {
  const roleLabel = getRoleLabel(employee.role);
  const permissions = employee.permissions || {};

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6" role="region" aria-label="Roles y permisos del empleado">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Shield size={20} className="text-amber-400" />
        Roles y Permisos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rol Principal */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Rol Principal</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/20 rounded-lg">
              <Shield size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{roleLabel}</p>
              <p className="text-xs text-gray-400">Rol asignado actualmente</p>
            </div>
          </div>
        </div>

        {/* Permisos Habilitados */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Permisos Habilitados</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-400/20 rounded-lg">
              <Key size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{Object.keys(permissions).length}</p>
              <p className="text-xs text-gray-400">Permisos activos</p>
            </div>
          </div>
        </div>

        {/* Lista de Permisos */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 md:col-span-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Permisos Específicos</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.keys(permissions).length > 0 ? (
              Object.entries(permissions).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 p-2 bg-gray-600/20 rounded-lg"
                >
                  {value ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <X size={14} className="text-red-400" />
                  )}
                  <span className="text-xs text-white">{key}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 col-span-full">Sin permisos específicos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
