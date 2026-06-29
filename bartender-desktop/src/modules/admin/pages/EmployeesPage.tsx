import { useEffect, useState, useMemo } from "react";
import { Plus, X, ShieldCheck, Clock, KeyRound, Calendar, Loader2, Check, Database, FileText, Target, Users, UserCheck } from "lucide-react";
import EmployeeCard from "../components/EmployeeCard";
import EmployeeForm from "../components/EmployeeForm";
import BackupSystem from "../../../components/shared/BackupSystem";
import AuditLogSystem from "../../../components/shared/AuditLogSystem";
import AdvancedSearchFilter from "../../../components/shared/AdvancedSearchFilter";
import DataExportImport from "../../../components/shared/DataExportImport";
import {
  getEmployees,
  createEmployee,
  deactivateUser,
  updateUser,
} from "../services/userService";
import type { User, UserSchedule } from "../types/user";
import "../../../styles/nebula-obsidian-theme.css";

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [auditUser, setAuditUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSystemTab, setActiveSystemTab] = useState<"employees" | "backup" | "audit">("employees");
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [showExportImport, setShowExportImport] = useState(false);

  // Filter groups for AdvancedSearchFilter
  const filterGroups = [
    {
      id: "role",
      label: "Rol",
      type: "radio" as const,
      options: [
        { value: "admin", label: "Admin" },
        { value: "bartender", label: "Bartender" },
        { value: "waiter", label: "Waiter" },
        { value: "cashier", label: "Cashier" },
        { value: "kitchen", label: "Kitchen" },
      ],
      selected: activeFilters["role"] || [],
    },
    {
      id: "status",
      label: "Estado",
      type: "checkbox" as const,
      options: [
        { value: "active", label: "Activo" },
        { value: "inactive", label: "Inactivo" },
      ],
      selected: activeFilters["status"] || [],
    },
    {
      id: "shift",
      label: "Turno",
      type: "checkbox" as const,
      options: [
        { value: "morning", label: "Mañana" },
        { value: "afternoon", label: "Tarde" },
        { value: "night", label: "Noche" },
      ],
      selected: activeFilters["shift"] || [],
    },
  ];

  /* =====================================================
     FETCH EMPLOYEES (SIMPLIFICADO + SAFE SERVICE)
  ===================================================== */
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const data = await getEmployees();

    // 👇 service ya garantiza array
    setUsers(data);

    setLoading(false);
  };

  /* =====================================================
     KPIs CALCULATION
  ===================================================== */
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const inactive = total - active;
    const byRole = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, active, inactive, byRole };
  }, [users]);
  const filteredUsers = useMemo(() => {
    let list = users;

    // Apply search text
    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter(u =>
        u.name?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower)
      );
    }

    // Apply role filter
    if (activeFilters["role"]?.length > 0) {
      list = list.filter(u => activeFilters["role"]!.includes(u.role));
    }

    // Apply status filter
    if (activeFilters["status"]?.length > 0) {
      list = list.filter(u => {
        const filters = activeFilters["status"]!;
        if (filters.includes("active") && !u.isActive) return false;
        if (filters.includes("inactive") && u.isActive) return false;
        return true;
      });
    }

    // Apply shift filter
    if (activeFilters["shift"]?.length > 0) {
      list = list.filter(u => activeFilters["shift"]!.includes(u.shift || ""));
    }

    return list;
  }, [users, search, activeFilters]);

  const handleExport = async (options: { format: "json" | "csv" | "xlsx" }) => {
    try {
      const data = filteredUsers;
      const filename = `empleados-export-${new Date().toISOString().split('T')[0]}`;

      if (options.format === "json") {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error exporting employees:", err);
      setError("Error al exportar empleados");
    }
  };

  const handleImport = async () => {
    setError("Importación deshabilitada - solo exportación para auditoría");
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =====================================================
     LISTEN: USER DISABLED (GLOBAL AUTH EVENT)
  ===================================================== */
  useEffect(() => {
    const handleDisabled = () => {
      setError("Tu usuario fue desactivado");
      setUsers([]);
    };

    window.addEventListener("auth:disabled", handleDisabled);

    return () => {
      window.removeEventListener("auth:disabled", handleDisabled);
    };
  }, []);

  /* =====================================================
     CREATE EMPLOYEE
  ===================================================== */
  const handleCreate = async (form: any) => {
    const res = await createEmployee(form);

    if (!res) {
      alert("No se pudo crear el empleado");
      return;
    }

    setOpen(false);
    await fetchData();
  };

  /* =====================================================
     DEACTIVATE EMPLOYEE
  ===================================================== */
  const handleDeactivate = async (id: string) => {
    const ok = window.confirm("¿Desactivar usuario?");
    if (!ok) return;

    const res = await deactivateUser(id);

    if (!res) {
      alert("No se pudo desactivar el usuario");
      return;
    }

    await fetchData();
  };

  /* =====================================================
     LOADING
  ===================================================== */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  /* =====================================================
     KPI CARD COMPONENT
  ===================================================== */
  function KPICard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    const colorConfig = {
      violet: { bg: "from-violet/20 to-purple/10", border: "border-violet/30", text: "text-violet-400" },
      emerald: { bg: "from-emerald/20 to-green/10", border: "border-emerald/30", text: "text-emerald-400" },
      orange: { bg: "from-orange/20 to-red/10", border: "border-orange/30", text: "text-orange-400" },
      gold: { bg: "from-gold/20 to-amber/10", border: "border-gold/30", text: "text-gold" },
    };
    
    const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.violet;

    return (
      <div className={`bg-gradient-to-br ${config.bg} border ${config.border} rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{label}</span>
          <div className={config.text}>{icon}</div>
        </div>
        <p className={`text-2xl font-bold ${config.text}`}>{value}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-surface-2 to-surface-3 p-6 rounded-3xl border border-white/10 relative overflow-hidden">

      {/* Atmospheric Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-gold/10 via-violet/10 to-cyan/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-end justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-gold/20 via-violet/20 to-cyan/20 border border-gold/30">
            <ShieldCheck size={28} className="text-gold" />
          </div>
          <div>
            <p className="text-xs text-gold font-bold uppercase tracking-wider mb-1">
              Nebula · Personal
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Directorio de Colaboradores
            </h1>
            {error && (
              <p className="text-[10px] text-red-400 font-bold tracking-wider mt-2 bg-red/10 px-2 py-1 rounded">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* System Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveSystemTab("employees")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSystemTab === "employees"
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setActiveSystemTab("backup")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSystemTab === "backup"
                  ? "bg-cyan/20 text-cyan-400 border border-cyan/30"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Database size={14} className="inline mr-1" />
              Respaldos
            </button>
            <button
              onClick={() => setActiveSystemTab("audit")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSystemTab === "audit"
                  ? "bg-violet/20 text-violet-400 border border-violet/30"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <FileText size={14} className="inline mr-1" />
              Auditoría
            </button>
          </div>

          {activeSystemTab === "employees" && (
            <>
              <button
                onClick={() => setShowExportImport(true)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-white/50 hover:text-cyan-400 hover:border-cyan/30 transition-colors"
                title="Exportar/Importar"
              >
                <Target size={16} />
              </button>
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-3 h-12 px-6 rounded-xl bg-gradient-to-r from-gold via-violet to-cyan text-black font-bold shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all"
              >
                <Plus size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Nuevo Colaborador</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPIs Dashboard */}
      {activeSystemTab === "employees" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Total" value={stats.total} icon={<Users size={16} />} color="violet" />
          <KPICard label="Activos" value={stats.active} icon={<UserCheck size={16} />} color="emerald" />
          <KPICard label="Inactivos" value={stats.inactive} icon={<Clock size={16} />} color="orange" />
          <KPICard label="Admins" value={stats.byRole.admin || 0} icon={<ShieldCheck size={16} />} color="gold" />
        </div>
      )}

      {/* ================= EMPLOYEES TAB ================= */}
      {activeSystemTab === "employees" && (
        <>
          {/* ================= SEARCH & FILTER ================= */}
          <div className="mb-6">
            <AdvancedSearchFilter
              filterGroups={filterGroups}
              onSearch={setSearch}
              onFilterChange={setActiveFilters}
              placeholder="Buscar colaboradores..."
              savedFilters={[]}
              onSaveFilter={() => {}}
              onLoadFilter={() => {}}
            />
          </div>

          {/* Empty State */}
          {!error && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Users size={24} className="text-white/30" />
              </div>
              <p className="text-sm text-white/50 font-bold uppercase tracking-wider">
                {search || Object.keys(activeFilters).length > 0
                  ? "No se encontraron colaboradores con los filtros aplicados"
                  : "No hay colaboradores en el sistema"}
              </p>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filteredUsers.map((u) => (
              <div key={u._id}>
                <EmployeeCard
                  user={u}
                  onDeactivate={handleDeactivate}
                  onInspect={setAuditUser}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= BACKUP TAB ================= */}
      {activeSystemTab === "backup" && (
        <BackupSystem
          onBackup={async () => {
            // Implement backup logic
            console.log("Backup triggered");
          }}
          onRestore={async (backupId) => {
            // Implement restore logic
            console.log("Restore triggered:", backupId);
          }}
          onDelete={async (backupId) => {
            // Implement delete logic
            console.log("Delete triggered:", backupId);
          }}
          config={{
            enabled: true,
            interval: 60,
            maxBackups: 10,
            autoCleanup: true
          }}
        />
      )}

      {/* ================= AUDIT TAB ================= */}
      {activeSystemTab === "audit" && (
        <AuditLogSystem
          logs={[]}
          onExport={() => {
            console.log("Export audit logs");
          }}
          onClear={() => {
            console.log("Clear audit logs");
          }}
        />
      )}

      {/* ================= MODAL ================= */}
      {open && (
        <EmployeeForm
          onSave={handleCreate}
          onClose={() => setOpen(false)}
        />
      )}

      {auditUser && (
        <EmployeeAuditPanel
          user={auditUser}
          onClose={() => setAuditUser(null)}
          onRefresh={fetchData}
        />
      )}

      {/* EXPORT/IMPORT PANEL */}
      {showExportImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 fused-animate-fade-in">
          <div className="fused-glass-card p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-fused-text-primary">Exportar/Importar Empleados</h3>
              <button
                onClick={() => setShowExportImport(false)}
                className="text-fused-text-muted hover:text-fused-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <DataExportImport
              data={filteredUsers}
              filename={`empleados-${new Date().toISOString().split('T')[0]}`}
              onExport={handleExport}
              onImport={handleImport}
              availableFormats={["json"]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeAuditPanel({
  user,
  onClose,
  onRefresh,
}: {
  user: User;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"audit" | "schedule">("audit");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const DAYS_OF_WEEK = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ] as const;

  const [schedule, setSchedule] = useState<UserSchedule>(() => {
    const initial: UserSchedule = {};
    DAYS_OF_WEEK.forEach((d) => {
      const existing = user.schedule?.[d.key];
      initial[d.key] = {
        isAvailable: existing?.isAvailable ?? false,
        startTime: existing?.startTime ?? "09:00",
        endTime: existing?.endTime ?? "17:00",
      };
    });
    return initial;
  });

  const permissions = Object.entries(user.permissions || {});
  const activePermissions = permissions.filter(([, enabled]) => enabled);
  const lastLogin = user.lastLogin
    ? new Date(user.lastLogin).toLocaleString("es-AR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Sin registro";

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateUser(user._id, { schedule });
      setSaveSuccess(true);
      onRefresh();
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la agenda semanal");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <section className="w-full max-w-3xl overflow-hidden bg-gradient-to-br from-surface-2 to-surface-3 border border-white/10 rounded-3xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-6 flex-shrink-0 bg-gradient-to-r from-gold/10 via-violet/10 to-cyan/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gold/20 to-violet/20 border border-gold/30">
              <ShieldCheck className="text-gold" size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gold font-bold uppercase tracking-wider">
                Auditoría de personal
              </p>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {user.name}
              </h2>
              <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-white/10 px-6 pt-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "audit" ? "text-gold" : "text-white/50 hover:text-white"
            }`}
          >
            Auditoría y Permisos
            {activeTab === "audit" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold via-violet to-cyan" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "schedule" ? "text-gold" : "text-white/50 hover:text-white"
            }`}
          >
            Agenda Semanal
            {activeTab === "schedule" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold via-violet to-cyan" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "audit" ? (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AuditMetric label="Rol" value={user.role} tone="gold" />
                <AuditMetric label="Turno" value={user.shift || "Sin turno"} tone="cyan" />
                <AuditMetric label="Estado" value={user.isActive ? "Activo" : "Inactivo"} tone={user.isActive ? "emerald" : "red"} />
              </div>

              {/* Details & Permissions */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-5">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="text-cyan-400" size={18} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Registro operativo
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-white/50">Último acceso</span>
                      <span className="text-white font-bold text-right">{lastLogin}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-white/50">Permisos activos</span>
                      <span className="text-emerald-400 font-bold">{activePermissions.length}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-white/50">Creado</span>
                      <span className="text-white font-bold text-right">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("es-MX") : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <KeyRound className="text-gold" size={18} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Matriz de permisos
                    </h3>
                  </div>
                  {permissions.length === 0 ? (
                    <p className="text-sm text-white/50">Este usuario no tiene permisos personalizados.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {permissions.map(([key, enabled]) => (
                        <div
                          key={key}
                          className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider ${
                            enabled
                              ? "bg-emerald/10 border-emerald/30 text-emerald-400"
                              : "bg-red/10 border-red/30 text-red-400"
                          }`}
                        >
                          {key}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {DAYS_OF_WEEK.map((d) => {
                  const daySched = schedule[d.key] || { isAvailable: false, startTime: "09:00", endTime: "17:00" };
                  return (
                    <div
                      key={d.key}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl transition-all duration-300 border ${
                        daySched.isAvailable
                          ? "bg-emerald/5 border-emerald/30"
                          : "bg-white/5 border-white/10 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSchedule((prev) => ({
                              ...prev,
                              [d.key]: {
                                ...daySched,
                                isAvailable: !daySched.isAvailable,
                              },
                            }));
                          }}
                          className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center ${
                            daySched.isAvailable
                              ? "bg-emerald-400 border-emerald-400 text-black"
                              : "border-white/20 text-transparent hover:border-emerald/50"
                          }`}
                        >
                          <Check size={14} className="stroke-[3]" />
                        </button>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-white">
                            {d.label}
                          </p>
                          <p
                            className={`text-[9px] font-bold uppercase tracking-wider ${
                              daySched.isAvailable ? "text-emerald-400" : "text-white/30"
                            }`}
                          >
                            {daySched.isAvailable ? "Disponible" : "No disponible"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="time"
                          disabled={!daySched.isAvailable}
                          value={daySched.startTime}
                          onChange={(e) => {
                            setSchedule((prev) => ({
                              ...prev,
                              [d.key]: {
                                ...daySched,
                                startTime: e.target.value,
                              },
                            }));
                          }}
                          className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-gold/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        />
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">a</span>
                        <input
                          type="time"
                          disabled={!daySched.isAvailable}
                          value={daySched.endTime}
                          onChange={(e) => {
                            setSchedule((prev) => ({
                              ...prev,
                              [d.key]: {
                                ...daySched,
                                endTime: e.target.value,
                              },
                            }));
                          }}
                          className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-gold/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 pt-6 mt-6">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider max-w-[60%] leading-relaxed">
                  * Los cambios guardados se establecerán como la disponibilidad semanal por defecto del colaborador.
                </p>
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  disabled={isSaving}
                  className={`h-12 px-6 rounded-xl flex items-center gap-3 transition-all ${
                    saveSuccess
                      ? "bg-emerald-400 text-black font-bold uppercase tracking-wider"
                      : "bg-gradient-to-r from-gold via-violet to-cyan text-black font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-gold/20"
                  } disabled:opacity-50 flex-shrink-0`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check size={16} className="stroke-[3]" />
                      <span>¡Guardado!</span>
                    </>
                  ) : (
                    <>
                      <Calendar size={16} />
                      <span>Guardar Agenda</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AuditMetric({ label, value, tone }: { label: string; value: string; tone: string }) {
  const colorConfig = {
    gold: { bg: "from-gold/20 to-amber/10", border: "border-gold/30", text: "text-gold" },
    cyan: { bg: "from-cyan/20 to-blue/10", border: "border-cyan/30", text: "text-cyan-400" },
    emerald: { bg: "from-emerald/20 to-green/10", border: "border-emerald/30", text: "text-emerald-400" },
    red: { bg: "from-red/20 to-orange/10", border: "border-red/30", text: "text-red-400" },
  };
  
  const config = colorConfig[tone as keyof typeof colorConfig] || colorConfig.gold;

  return (
    <div className={`bg-gradient-to-br ${config.bg} border ${config.border} rounded-xl p-4`}>
      <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className={`text-xl font-bold uppercase tracking-tight ${config.text}`}>
        {value}
      </p>
    </div>
  );
}
