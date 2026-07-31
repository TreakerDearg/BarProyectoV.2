/**
 * EMPLOYEE DEVICES SECTION
 * Sección de dispositivos del empleado
 */

"use client";

import { Smartphone, Monitor, Laptop, Clock } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
}

export function EmployeeDevicesSection({ employee }: Props) {
  const devices = employee.devices || [];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone size={16} className="text-blue-400" />;
      case "desktop":
        return <Monitor size={16} className="text-blue-400" />;
      case "laptop":
        return <Laptop size={16} className="text-blue-400" />;
      default:
        return <Monitor size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6" role="region" aria-label="Dispositivos del empleado">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Smartphone size={20} className="text-amber-400" />
        Dispositivos
      </h2>

      {devices.length === 0 ? (
        <div className="p-8 text-center">
          <Smartphone size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No hay dispositivos registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device: any) => (
            <div
              key={device.deviceId}
              className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-400/20 rounded-lg">
                  {getDeviceIcon(device.deviceType)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{device.deviceName || "Dispositivo desconocido"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{device.os}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{device.browser}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      Último acceso: {device.lastAccess ? new Date(device.lastAccess).toLocaleString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
