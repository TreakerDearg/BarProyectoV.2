/**
 * EMPLOYEE GENERAL INFO
 * Sección de información general del empleado
 */

"use client";

import { User, Mail, Building, Calendar, MapPin, Phone } from "lucide-react";
import type { Employee } from "../../types";
import { getRoleLabel } from "../../utils";

interface Props {
  employee: Employee;
}

export function EmployeeGeneralInfo({ employee }: Props) {
  const roleLabel = getRoleLabel(employee.role);

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6" role="region" aria-label="Información general del empleado">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <User size={20} className="text-amber-400" />
        Información General
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Foto y Nombre */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-400/20 border border-amber-400/30 flex items-center justify-center">
            <User size={32} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{employee.name}</h3>
            <p className="text-sm text-gray-400">{roleLabel}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                employee.isActive ? "bg-emerald-400/20 text-emerald-400" : "bg-red-400/20 text-red-400"
              }`}>
                {employee.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-400/20 rounded-lg">
              <Mail size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p>
              <p className="text-sm text-white">{employee.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-400/20 rounded-lg">
              <Phone size={16} className="text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Teléfono</p>
              <p className="text-sm text-white">No disponible</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-400/20 rounded-lg">
              <Building size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Sucursal</p>
              <p className="text-sm text-white">Principal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-400/20 rounded-lg">
              <MapPin size={16} className="text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Ubicación</p>
              <p className="text-sm text-white">No disponible</p>
            </div>
          </div>
        </div>

        {/* Información de Empleo */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/20 rounded-lg">
              <Calendar size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Fecha de Ingreso</p>
              <p className="text-sm text-white">
                {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : "No disponible"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-400/20 rounded-lg">
              <User size={16} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cargo</p>
              <p className="text-sm text-white">{roleLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-400/20 rounded-lg">
              <Building size={16} className="text-pink-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Departamento</p>
              <p className="text-sm text-white">Operaciones</p>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Estado de la Cuenta</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${employee.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
              <p className="text-sm text-white">
                {employee.isActive ? "Cuenta activa" : "Cuenta inactiva"}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Último Acceso</p>
            <p className="text-sm text-white">
              {employee.lastLogin ? new Date(employee.lastLogin).toLocaleString() : "Nunca"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
