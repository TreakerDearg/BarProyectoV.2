"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  Wine,
  UtensilsCrossed,
  ChefHat,
  CreditCard,
  Crown,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import EmployeeCard from "../components/EmployeeCard";
import EmployeeDetailDrawer from "../components/EmployeeDetailDrawer";
import EmployeeForm from "../components/EmployeeForm";
import PromoteModal from "../components/PromoteModal";
import {
  getEmployees,
  getClients,
  createEmployee,
  updateUser,
  deactivateUser,
  activateUser,
} from "../services/userService";
import type { User as UserType } from "../types/user";

export default function EmployeesPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === "admin";

  const [employees, setEmployees] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [onlyOnShift, setOnlyOnShift] = useState(false);

  // Drawer & Modals
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState<UserType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [promoteCandidate, setPromoteCandidate] = useState<UserType | null>(null);
  const [clientsList, setClientsList] = useState<UserType[]>([]);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);

  // Load employees
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error loading employees:", err);
      setError("No se pudieron cargar los colaboradores. Verifica la conexión.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Load clients for promotion
  const loadClientsForPromotion = async () => {
    try {
      setClientsLoading(true);
      const clients = await getClients();
      setClientsList(clients);
      setShowClientSelector(true);
    } catch (err) {
      console.warn("Could not load clients:", err);
    } finally {
      setClientsLoading(false);
    }
  };

  // KPIs Calculations
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.isActive).length;
    const onShift = employees.filter(
      (e) => e.attendance?.currentStatus === "checked-in" && e.isActive
    ).length;

    const bartenders = employees.filter((e) => e.role === "bartender").length;
    const waiters = employees.filter((e) => e.role === "waiter").length;
    const kitchen = employees.filter((e) => e.role === "kitchen").length;
    const cashiers = employees.filter((e) => e.role === "cashier").length;
    const admins = employees.filter((e) => e.role === "admin").length;

    const totalHoursThisMonth = employees.reduce(
      (sum, e) => sum + (e.attendance?.thisMonth?.totalHours || 0),
      0
    );

    return {
      total,
      active,
      onShift,
      bartenders,
      waiters,
      kitchen,
      cashiers,
      admins,
      totalHoursThisMonth,
    };
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      // Role filter
      if (selectedRoleFilter !== "all" && e.role !== selectedRoleFilter) {
        return false;
      }

      // On-shift filter
      if (onlyOnShift && e.attendance?.currentStatus !== "checked-in") {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = e.name?.toLowerCase().includes(q);
        const emailMatch = e.email?.toLowerCase().includes(q);
        const roleMatch = e.role?.toLowerCase().includes(q);
        const phoneMatch = e.phone?.includes(q);
        if (!nameMatch && !emailMatch && !roleMatch && !phoneMatch) {
          return false;
        }
      }

      return true;
    });
  }, [employees, selectedRoleFilter, onlyOnShift, search]);

  // Handlers
  const handleInspectUser = (user: UserType) => {
    setSelectedUserForDrawer(user);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = async (user: UserType) => {
    try {
      if (user.isActive) {
        await deactivateUser(user._id);
      } else {
        await activateUser(user._id);
      }
      await loadEmployees();
    } catch (err: any) {
      console.error("Failed to toggle status:", err);
      alert("No se pudo cambiar el estado del colaborador.");
    }
  };

  const handleSaveDrawer = async (userId: string, updates: Partial<UserType>) => {
    await updateUser(userId, updates);
    await loadEmployees();
  };

  const handleCreateEmployee = async (formData: any) => {
    try {
      setCreateLoading(true);
      await createEmployee(formData);
      setIsCreateModalOpen(false);
      await loadEmployees();
    } catch (err: any) {
      console.error("Failed to create employee:", err);
      alert(err?.message || "Error al crear el colaborador.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold" />
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Gestión de Personal & Talento
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Directorio & Plantilla de Colaboradores
          </h1>
          <p className="text-xs text-text-muted">
            Administración 360° del equipo de barra, salón, cocina, caja y administración
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={loadEmployees}
            title="Refrescar lista"
            className="p-2.5 rounded-xl border border-border/60 hover:border-gold/40 hover:bg-surface-card text-text-muted hover:text-gold transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gold" : ""}`} />
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={loadClientsForPromotion}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card hover:bg-surface-hover text-text-primary border border-border/60 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                Ascender Cliente
              </button>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gold hover:bg-gold-hover text-surface-dark transition-all shadow-sm hover:shadow"
              >
                <UserPlus className="w-4 h-4" />
                Nuevo Colaborador
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Ribbons: 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Plantilla */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Total Colaboradores
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-dark border border-border/60 flex items-center justify-center text-gold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary font-mono">
              {stats.total}
            </span>
            <span className="text-xs text-emerald font-semibold">
              ({stats.active} activos)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-text-muted flex-wrap">
            <span>🍸 {stats.bartenders} Barra</span>
            <span>·</span>
            <span>🍽️ {stats.waiters} Salón</span>
            <span>·</span>
            <span>🍳 {stats.kitchen} Cocina</span>
          </div>
        </div>

        {/* KPI 2: En Turno Ahora */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              En Turno Ahora
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald/15 border border-emerald/30 flex items-center justify-center text-emerald">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald font-mono">
              {stats.onShift}
            </span>
            <span className="text-xs text-text-muted">
              colaboradores en servicio
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            Dotación en tiempo real activa
          </div>
        </div>

        {/* KPI 3: Horas Acumuladas */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Horas del Mes
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gold font-mono">
              {stats.totalHoursThisMonth > 0 ? `${stats.totalHoursThisMonth}h` : "Al día"}
            </span>
            <span className="text-xs text-text-muted">
              horas registradas
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
            Cálculo continuo en Bóveda
          </div>
        </div>

        {/* KPI 4: Roles & Jerarquía */}
        <div className="bg-surface-card border border-border/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Estructura Operativa
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary font-mono">
              5
            </span>
            <span className="text-xs text-text-muted">
              roles operativos activos
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-text-muted">
            <span>👑 {stats.admins} Admins</span>
            <span>·</span>
            <span>💵 {stats.cashiers} Caja</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-dark/60 p-3 rounded-2xl border border-border/60">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, teléfono o rol..."
            className="w-full text-xs bg-surface-card text-text-primary border border-border/60 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-gold/50"
          />
        </div>

        {/* Role Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => {
              setSelectedRoleFilter("all");
              setOnlyOnShift(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
              selectedRoleFilter === "all" && !onlyOnShift
                ? "bg-gold/15 text-gold border-gold/40 shadow-sm"
                : "bg-surface-card text-text-muted border-border/60 hover:text-text-primary"
            }`}
          >
            Todos ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => {
              setOnlyOnShift(!onlyOnShift);
              setSelectedRoleFilter("all");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 flex items-center gap-1.5 ${
              onlyOnShift
                ? "bg-emerald/15 text-emerald border-emerald/40 shadow-sm"
                : "bg-surface-card text-text-muted border-border/60 hover:text-text-primary"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            En Turno ({stats.onShift})
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRoleFilter("bartender");
              setOnlyOnShift(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 flex items-center gap-1 ${
              selectedRoleFilter === "bartender"
                ? "bg-cyan/15 text-cyan border-cyan/40 shadow-sm"
                : "bg-surface-card text-text-muted border-border/60 hover:text-text-primary"
            }`}
          >
            <Wine className="w-3 h-3" />
            Barra ({stats.bartenders})
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRoleFilter("waiter");
              setOnlyOnShift(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 flex items-center gap-1 ${
              selectedRoleFilter === "waiter"
                ? "bg-emerald/15 text-emerald border-emerald/40 shadow-sm"
                : "bg-surface-card text-text-muted border-border/60 hover:text-text-primary"
            }`}
          >
            <UtensilsCrossed className="w-3 h-3" />
            Salón ({stats.waiters})
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRoleFilter("kitchen");
              setOnlyOnShift(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 flex items-center gap-1 ${
              selectedRoleFilter === "kitchen"
                ? "bg-amber/15 text-amber border-amber/40 shadow-sm"
                : "bg-surface-card text-text-muted border-border/60 hover:text-text-primary"
            }`}
          >
            <ChefHat className="w-3 h-3" />
            Cocina ({stats.kitchen})
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRoleFilter("cashier");
              setOnlyOnShift(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 flex items-center gap-1 ${
              selectedRoleFilter === "cashier"
                ? "bg-purple-500/15 text-purple-400 border-purple-500/40 shadow-sm"
                : "bg-surface-card text-text-muted border-border/60 hover:text-text-primary"
            }`}
          >
            <CreditCard className="w-3 h-3" />
            Caja ({stats.cashiers})
          </button>
        </div>
      </div>

      {/* Grid of Employees */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-surface-card/60 rounded-2xl border border-border/40 p-5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-surface-dark rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-surface-dark rounded w-3/4" />
                  <div className="h-3 bg-surface-dark rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-surface-dark rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp._id}
              user={emp}
              onInspect={handleInspectUser}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-surface-card border border-border/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-dark border border-border/60 flex items-center justify-center text-text-muted">
            <Users className="w-8 h-8 text-gold/60" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-semibold text-text-primary">
              No se encontraron colaboradores
            </h3>
            <p className="text-xs text-text-muted">
              {search || selectedRoleFilter !== "all" || onlyOnShift
                ? "No hay personal que coincida con los criterios de búsqueda o filtros seleccionados."
                : "Aún no se han registrado colaboradores en el sistema. Puedes dar de alta uno nuevo o ascender a un cliente."}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setSearch("");
                setSelectedRoleFilter("all");
                setOnlyOnShift(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-dark hover:bg-surface-hover text-text-primary border border-border/60 transition-colors"
            >
              Restablecer Filtros
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold hover:bg-gold-hover text-surface-dark transition-colors"
            >
              + Nuevo Colaborador
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Drawer for 360° Management */}
      <EmployeeDetailDrawer
        user={selectedUserForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveDrawer}
      />

      {/* Create Employee Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setIsCreateModalOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          />
          <div className="relative z-10 w-full max-w-md">
            <EmployeeForm
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={handleCreateEmployee}
              loading={createLoading}
            />
          </div>
        </div>
      )}

      {/* Client Selector for Promotion */}
      {showClientSelector && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setShowClientSelector(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          />
          <div className="relative z-10 bg-surface-card border border-border/70 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                Seleccionar Cliente para Ascender
              </h3>
              <button
                onClick={() => setShowClientSelector(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-border/40 space-y-1">
              {clientsLoading ? (
                <p className="text-xs text-text-muted py-6 text-center">
                  Buscando clientes registrados...
                </p>
              ) : clientsList.length > 0 ? (
                clientsList.map((client) => (
                  <div
                    key={client._id}
                    onClick={() => {
                      setPromoteCandidate(client);
                      setShowClientSelector(false);
                    }}
                    className="p-2.5 flex items-center justify-between hover:bg-surface-hover rounded-xl cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <span className="font-semibold text-text-primary block">
                        {client.name}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {client.email}
                      </span>
                    </div>
                    <span className="text-gold font-bold text-xs hover:underline">
                      Seleccionar →
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted py-6 text-center">
                  No se encontraron usuarios con rol cliente para ascender.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Promote Modal */}
      {promoteCandidate && (
        <PromoteModal
          user={promoteCandidate}
          adminRole={currentUser?.role || "admin"}
          onClose={() => setPromoteCandidate(null)}
          onSuccess={async () => {
            setPromoteCandidate(null);
            await loadEmployees();
          }}
        />
      )}
    </div>
  );
}
