/**
 * EMPLOYEE DETAIL PAGE
 * Vista de detalle de empleado con pestañas/secciones
 * Centro de administración de Bartender Identity
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MoreVertical, Shield, Clock, Activity, Smartphone, History, Lock, User, Calendar, Settings } from "lucide-react";
import { useEmployee } from "../hooks";
import { EmployeeSummaryPanel } from "../components/EmployeeDetail/EmployeeSummaryPanel";
import { EmployeeGeneralInfo } from "../components/EmployeeDetail/EmployeeGeneralInfo";
import { EmployeeIdentitySection } from "../components/EmployeeDetail/EmployeeIdentitySection";
import { EmployeeRolesPermissions } from "../components/EmployeeDetail/EmployeeRolesPermissions";
import { EmployeeScheduleSection } from "../components/EmployeeDetail/EmployeeScheduleSection";
import { EmployeeAttendanceSection } from "../components/EmployeeDetail/EmployeeAttendanceSection";
import { EmployeeSessionsSection } from "../components/EmployeeDetail/EmployeeSessionsSection";
import { EmployeeDevicesSection } from "../components/EmployeeDetail/EmployeeDevicesSection";
import { EmployeeActivityTimeline } from "../components/EmployeeDetail/EmployeeActivityTimeline";
import { EmployeeSecuritySection } from "../components/EmployeeDetail/EmployeeSecuritySection";
import { EmployeeQuickActions } from "../components/EmployeeDetail/EmployeeQuickActions";

type TabType = "general" | "identity" | "roles" | "schedule" | "attendance" | "sessions" | "devices" | "activity" | "security";

const TABS: { id: TabType; label: string; icon: any }[] = [
  { id: "general", label: "General", icon: User },
  { id: "identity", label: "Identidad", icon: Shield },
  { id: "roles", label: "Roles y Permisos", icon: Settings },
  { id: "schedule", label: "Horarios", icon: Calendar },
  { id: "attendance", label: "Asistencia", icon: Clock },
  { id: "sessions", label: "Sesiones", icon: Activity },
  { id: "devices", label: "Dispositivos", icon: Smartphone },
  { id: "activity", label: "Actividad", icon: History },
  { id: "security", label: "Seguridad", icon: Lock },
];

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [showQuickActions, setShowQuickActions] = useState(false);

  const { employee, loading, error, refresh } = useEmployee(id, { autoFetch: true });

  useEffect(() => {
    refresh();
  }, [id, refresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/50">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/50">
        <div className="text-red-400 text-lg">{error || "Empleado no encontrado"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                aria-label="Volver"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{employee.name}</h1>
                <p className="text-sm text-gray-400">{employee.email}</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                aria-label="Acciones rápidas"
              >
                <MoreVertical size={20} />
              </button>
              {showQuickActions && (
                <EmployeeQuickActions
                  employee={employee}
                  onClose={() => setShowQuickActions(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <EmployeeSummaryPanel employee={employee} />
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-700/50">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }
                `}
                aria-label={`Pestaña ${tab.label}`}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                <TabIcon size={16} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "general" && <EmployeeGeneralInfo employee={employee} />}
            {activeTab === "identity" && <EmployeeIdentitySection employee={employee} />}
            {activeTab === "roles" && <EmployeeRolesPermissions employee={employee} />}
            {activeTab === "schedule" && <EmployeeScheduleSection employee={employee} />}
            {activeTab === "attendance" && <EmployeeAttendanceSection employee={employee} />}
            {activeTab === "sessions" && <EmployeeSessionsSection employee={employee} />}
            {activeTab === "devices" && <EmployeeDevicesSection employee={employee} />}
            {activeTab === "activity" && <EmployeeActivityTimeline employee={employee} />}
            {activeTab === "security" && <EmployeeSecuritySection employee={employee} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
