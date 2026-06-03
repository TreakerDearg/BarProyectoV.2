import { useEffect, useState, useMemo } from "react";
import { Plus, X, ShieldCheck, Clock, KeyRound, Calendar, Loader2, Check, Database, FileText, Target } from "lucide-react";
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
     FILTER EMPLOYEES
  ===================================================== */
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

  const handleImport = async (file: File) => {
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
      <div className="text-white text-sm opacity-70">
        Cargando empleados...
      </div>
    );
  }

  return (
    <div className="space-y-6 glass-card p-8 rounded-[3rem] animate-fade-in relative overflow-hidden luxury-bg">

      {/* ATMOSPHERIC GLOW */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-between relative z-10">

        <div className="flex items-center gap-6">
          <div className="p-4 glass-card rounded-2xl">
            <h1 className="text-3xl font-black text-[#ffffff] tracking-tighter uppercase leading-none gradient-text" style={{ fontFamily: 'var(--font-display)' }}>
              Directorio
            </h1>
          </div>
          <div>
            <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.4em] mb-1">
              Operaciones Umbra
            </p>
            <p className="text-xs text-[#a0a0b0] font-bold tracking-widest uppercase">
              Gestión de Personal Elite
            </p>

            {error && (
              <p className="text-[10px] text-[#ff4757] font-black tracking-widest mt-2 bg-[#ff4757]/10 px-2 py-1 rounded">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* System Tabs */}
          <div className="flex p-1 rounded-xl border border-white/8 bg-white/5">
            <button
              onClick={() => setActiveSystemTab("employees")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeSystemTab === "employees"
                  ? "bg-[#d4af37]/20 text-[#d4af37]"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setActiveSystemTab("backup")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeSystemTab === "backup"
                  ? "bg-[#d4af37]/20 text-[#d4af37]"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <Database size={14} className="inline mr-1" />
              Respaldos
            </button>
            <button
              onClick={() => setActiveSystemTab("audit")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeSystemTab === "audit"
                  ? "bg-[#d4af37]/20 text-[#d4af37]"
                  : "text-white/40 hover:text-white"
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
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
                title="Exportar/Importar"
              >
                <Target size={16} />
              </button>
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-3 h-14 px-6 rounded-2xl
                luxury-button
                hover:shadow-gold-glow hover:scale-[1.02] active:scale-95
                transition-all"
              >
                <Plus size={20} className="text-[#0a0a0f]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nuevo Colaborador</span>
              </button>
            </>
          )}
        </div>
      </div>

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

          {/* ================= EMPTY ================= */}
          {!error && filteredUsers.length === 0 && (
            <div className="text-[10px] font-black text-[#a0a0b0] uppercase tracking-widest glass-card p-6 rounded-2xl text-center border border-white/5">
              {search || Object.keys(activeFilters).length > 0
                ? "No se encontraron colaboradores con los filtros aplicados"
                : "No hay colaboradores en el sistema"}
            </div>
          )}

          {/* ================= GRID ================= */}
          <div
            className="
            grid
            grid-cols-1
            xl:grid-cols-2
            2xl:grid-cols-3
            gap-6
            relative z-10
          "
          >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-3 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ivory">Exportar/Importar Empleados</h3>
              <button
                onClick={() => setShowExportImport(false)}
                className="text-muted hover:text-ivory transition-colors"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <section className="glass-card w-full max-w-3xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20">
              <ShieldCheck className="text-[#d4af37]" size={28} />
            </div>
            <div>
              <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.35em]">
                Auditoría de personal
              </p>
              <h2 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                {user.name}
              </h2>
              <p className="text-xs text-[#a0a0b0] font-bold uppercase tracking-widest">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-[#d4af37]/30 transition-all flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* TABS HEADERS */}
        <div className="flex gap-6 border-b border-white/10 px-6 pt-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === "audit" ? "text-[#d4af37]" : "text-white/40 hover:text-white"
            }`}
          >
            Auditoría y Permisos
            {activeTab === "audit" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`pb-3 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === "schedule" ? "text-[#d4af37]" : "text-white/40 hover:text-white"
            }`}
          >
            Agenda Semanal
            {activeTab === "schedule" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
            )}
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="p-6 overflow-y-auto luxury-scrollbar flex-1 space-y-6">
          {activeTab === "audit" ? (
            <>
              {/* TOP METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AuditMetric label="Rol" value={user.role} tone="#d4af37" />
                <AuditMetric label="Turno" value={user.shift || "Sin turno"} tone="#00d4ff" />
                <AuditMetric label="Estado" value={user.isActive ? "Activo" : "Inactivo"} tone={user.isActive ? "#00ff88" : "#ff4757"} />
              </div>

              {/* DETAILS & PERMISSIONS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-5">
                <div className="metric-card space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="text-[#00d4ff]" size={18} />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                      Registro operativo
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-white/45">Último acceso</span>
                      <span className="text-white font-bold text-right">{lastLogin}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-white/45">Permisos activos</span>
                      <span className="text-[#00ff88] font-black">{activePermissions.length}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-white/45">Creado</span>
                      <span className="text-white font-bold text-right">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("es-AR") : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="metric-card space-y-4">
                  <div className="flex items-center gap-3">
                    <KeyRound className="text-[#d4af37]" size={18} />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                      Matriz de permisos
                    </h3>
                  </div>
                  {permissions.length === 0 ? (
                    <p className="text-sm text-white/40">Este usuario no tiene permisos personalizados.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {permissions.map(([key, enabled]) => (
                        <div
                          key={key}
                          className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                            enabled
                              ? "bg-[#00ff88]/10 border-[#00ff88]/20 text-[#00ff88]"
                              : "bg-[#ff4757]/10 border-[#ff4757]/20 text-[#ff4757]"
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
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl transition-all duration-300 border ${
                        daySched.isAvailable
                          ? "bg-[#00ff88]/5 border-[#00ff88]/20 shadow-[0_0_15px_rgba(0,255,136,0.05)]"
                          : "bg-white/[0.02] border-white/5 opacity-60"
                      }`}
                    >
                      {/* Day Name and Availability Toggle */}
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
                              ? "bg-[#00ff88] border-[#00ff88] text-[#0a0a0f] shadow-[0_0_10px_rgba(0,255,136,0.4)]"
                              : "border-white/20 text-transparent hover:border-[#00ff88]/50"
                          }`}
                        >
                          <Check size={14} className="stroke-[3]" />
                        </button>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-white">
                            {d.label}
                          </p>
                          <p
                            className={`text-[9px] font-black uppercase tracking-widest ${
                              daySched.isAvailable ? "text-[#00ff88]" : "text-white/30"
                            }`}
                          >
                            {daySched.isAvailable ? "Disponible" : "No disponible"}
                          </p>
                        </div>
                      </div>

                      {/* Time Inputs */}
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
                          className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#d4af37]/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        />
                        <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">a</span>
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
                          className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#d4af37]/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTIONS FOOTER */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 pt-6 mt-6">
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest max-w-[60%] leading-relaxed">
                  * Los cambios guardados se establecerán como la disponibilidad semanal por defecto del colaborador.
                </p>
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  disabled={isSaving}
                  className={`h-12 px-6 rounded-xl flex items-center gap-3 transition-all ${
                    saveSuccess
                      ? "bg-[#00ff88] text-[#0a0a0f] font-black uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                      : "bg-gradient-gold text-black font-black uppercase tracking-[0.15em] hover:shadow-lg hover:shadow-[#d4af37]/20 hover:scale-[1.02] active:scale-95"
                  } disabled:opacity-50 flex-shrink-0`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin animate-infinite" />
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
  return (
    <div className="metric-card p-5">
      <p className="text-[10px] text-white/45 font-black uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-2xl font-black uppercase tracking-tight" style={{ color: tone, fontFamily: "var(--font-display)" }}>
        {value}
      </p>
    </div>
  );
}
