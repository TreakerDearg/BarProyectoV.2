"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Crown,
  Wine,
  UtensilsCrossed,
  ChefHat,
  CreditCard,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Lock,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Package,
  BookOpen,
  Dices,
  Calendar,
  Save,
} from "lucide-react";
import { updateRolePermissions } from "../services/userService";

type SystemRole = "admin" | "bartender" | "waiter" | "cashier" | "kitchen";

interface PermissionItem {
  key: string;
  label: string;
  description: string;
  isDanger?: boolean;
}

interface PermissionGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  permissions: PermissionItem[];
}

const ROLES: { id: SystemRole; label: string; icon: React.ReactNode; badgeClass: string }[] = [
  {
    id: "admin",
    label: "Administrador",
    icon: <Crown className="w-4 h-4 text-gold" />,
    badgeClass: "bg-gold/15 text-gold border-gold/30",
  },
  {
    id: "bartender",
    label: "Bartender",
    icon: <Wine className="w-4 h-4 text-cyan" />,
    badgeClass: "bg-cyan/15 text-cyan border-cyan/30",
  },
  {
    id: "waiter",
    label: "Mozo / Salón",
    icon: <UtensilsCrossed className="w-4 h-4 text-emerald" />,
    badgeClass: "bg-emerald/15 text-emerald border-emerald/30",
  },
  {
    id: "kitchen",
    label: "Cocina",
    icon: <ChefHat className="w-4 h-4 text-amber" />,
    badgeClass: "bg-amber/15 text-amber border-amber/30",
  },
  {
    id: "cashier",
    label: "Caja",
    icon: <CreditCard className="w-4 h-4 text-purple-400" />,
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
];

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "orders",
    title: "Comandas & Salón (Punto de Venta)",
    icon: <UtensilsCrossed className="w-4 h-4 text-gold" />,
    permissions: [
      { key: "orders_view", label: "Ver Comandas", description: "Visualizar el tablero KDS y comandas activas" },
      { key: "orders_create", label: "Crear Pedidos", description: "Tomar pedidos y enviarlos a barra/cocina" },
      { key: "orders_edit", label: "Modificar Comanda", description: "Añadir o remover ítems de comandas no despachadas" },
      { key: "orders_cancel", label: "Anular Comanda", description: "Cancelar comandas ya preparadas o enviadas", isDanger: true },
      { key: "tables_manage", label: "Gestión de Mesas", description: "Unir, dividir o reasignar mesas en el salón" },
    ],
  },
  {
    id: "recipes",
    title: "Fichas Técnicas & Recetario Maestro",
    icon: <BookOpen className="w-4 h-4 text-cyan" />,
    permissions: [
      { key: "recipes_view", label: "Ver Catálogo de Recetas", description: "Consultar fichas técnicas y pasos de elaboración" },
      { key: "recipes_costs", label: "Ver Escandallo de Costos", description: "Visualizar costo de insumos y margen bruto unitario" },
      { key: "recipes_manage", label: "Crear & Editar Fichas", description: "Modificar ingredientes, proporciones y técnicas" },
    ],
  },
  {
    id: "inventory",
    title: "Inventario & Bóveda de Insumos",
    icon: <Package className="w-4 h-4 text-emerald" />,
    permissions: [
      { key: "inventory_view", label: "Ver Stock", description: "Consultar niveles de stock y semáforos de reposición" },
      { key: "inventory_waste", label: "Registrar Mermas", description: "Reportar botellas rotas, insumos vencidos o derrames" },
      { key: "inventory_adjust", label: "Ajuste de Existencias", description: "Modificar el conteo físico de insumos en bóveda", isDanger: true },
    ],
  },
  {
    id: "roulette",
    title: "Ruleta Royale (Gamificación)",
    icon: <Dices className="w-4 h-4 text-amber" />,
    permissions: [
      { key: "roulette_spin", label: "Lanzar Ruleta", description: "Tirar la ruleta para clientes en salón o barra" },
      { key: "roulette_config", label: "Configurar Motor", description: "Modificar probabilidades, presets y pity vault", isDanger: true },
    ],
  },
  {
    id: "cashier",
    title: "Caja, Cobros & Facturación",
    icon: <DollarSign className="w-4 h-4 text-purple-400" />,
    permissions: [
      { key: "cashier_pay", label: "Cobrar Tickets", description: "Cobrar con efectivo, tarjeta o transferencias" },
      { key: "cashier_open", label: "Abrir Cajón Manual", description: "Apertura de cajón de dinero sin cobro asociado", isDanger: true },
      { key: "cashier_discounts", label: "Descuentos Manuales", description: "Aplicar descuentos directos fuera de promociones" },
      { key: "cashier_close", label: "Cierres X / Z", description: "Generar reportes de corte y cierre de turno" },
    ],
  },
  {
    id: "team",
    title: "Gestión de Personal & Turnos",
    icon: <Calendar className="w-4 h-4 text-blue-400" />,
    permissions: [
      { key: "team_self_checkin", label: "Fichar Entrada / Salida", description: "Registrar check-in y descansos propios" },
      { key: "team_view_schedule", label: "Ver Cronograma", description: "Consultar los turnos y horarios de la semana" },
      { key: "team_manage_shifts", label: "Modificar Turnos", description: "Asignar turnos y generar agendas para otros", isDanger: true },
      { key: "team_admin", label: "Administración Total", description: "Crear colaboradores, cambiar roles y editar permisos", isDanger: true },
    ],
  },
];

// Presets por defecto según rol
const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, Record<string, boolean>> = {
  admin: {
    orders_view: true, orders_create: true, orders_edit: true, orders_cancel: true, tables_manage: true,
    recipes_view: true, recipes_costs: true, recipes_manage: true,
    inventory_view: true, inventory_waste: true, inventory_adjust: true,
    roulette_spin: true, roulette_config: true,
    cashier_pay: true, cashier_open: true, cashier_discounts: true, cashier_close: true,
    team_self_checkin: true, team_view_schedule: true, team_manage_shifts: true, team_admin: true,
  },
  bartender: {
    orders_view: true, orders_create: true, orders_edit: true, orders_cancel: false, tables_manage: false,
    recipes_view: true, recipes_costs: false, recipes_manage: false,
    inventory_view: true, inventory_waste: true, inventory_adjust: false,
    roulette_spin: true, roulette_config: false,
    cashier_pay: true, cashier_open: false, cashier_discounts: false, cashier_close: false,
    team_self_checkin: true, team_view_schedule: true, team_manage_shifts: false, team_admin: false,
  },
  waiter: {
    orders_view: true, orders_create: true, orders_edit: true, orders_cancel: false, tables_manage: true,
    recipes_view: true, recipes_costs: false, recipes_manage: false,
    inventory_view: false, inventory_waste: false, inventory_adjust: false,
    roulette_spin: true, roulette_config: false,
    cashier_pay: false, cashier_open: false, cashier_discounts: false, cashier_close: false,
    team_self_checkin: true, team_view_schedule: true, team_manage_shifts: false, team_admin: false,
  },
  kitchen: {
    orders_view: true, orders_create: false, orders_edit: true, orders_cancel: false, tables_manage: false,
    recipes_view: true, recipes_costs: false, recipes_manage: false,
    inventory_view: true, inventory_waste: true, inventory_adjust: false,
    roulette_spin: false, roulette_config: false,
    cashier_pay: false, cashier_open: false, cashier_discounts: false, cashier_close: false,
    team_self_checkin: true, team_view_schedule: true, team_manage_shifts: false, team_admin: false,
  },
  cashier: {
    orders_view: true, orders_create: true, orders_edit: true, orders_cancel: false, tables_manage: false,
    recipes_view: false, recipes_costs: false, recipes_manage: false,
    inventory_view: false, inventory_waste: false, inventory_adjust: false,
    roulette_spin: true, roulette_config: false,
    cashier_pay: true, cashier_open: true, cashier_discounts: true, cashier_close: true,
    team_self_checkin: true, team_view_schedule: true, team_manage_shifts: false, team_admin: false,
  },
};

export default function RolePermissionMatrixPage() {
  const [selectedRole, setSelectedRole] = useState<SystemRole>("bartender");
  const [rolePermissions, setRolePermissions] = useState<Record<SystemRole, Record<string, boolean>>>(
    DEFAULT_ROLE_PERMISSIONS
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Toggle a single permission
  const handleToggle = (key: string) => {
    setRolePermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [key]: !prev[selectedRole]?.[key],
      },
    }));
  };

  // Reset to default
  const handleResetDefaults = () => {
    setRolePermissions((prev) => ({
      ...prev,
      [selectedRole]: { ...DEFAULT_ROLE_PERMISSIONS[selectedRole] },
    }));
  };

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      await updateRolePermissions(selectedRole, rolePermissions[selectedRole]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save permissions:", err);
      alert("Error al guardar la matriz de permisos.");
    } finally {
      setSaving(false);
    }
  };

  const currentPerms = rolePermissions[selectedRole] || {};
  const activeCount = Object.values(currentPerms).filter(Boolean).length;
  const totalCount = PERMISSION_GROUPS.reduce((sum, g) => sum + g.permissions.length, 0);

  return (
    <div className="min-h-screen bg-background text-text-primary p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold" />
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Control de Accesos & Seguridad
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Matriz Granular de Roles & Permisos
          </h1>
          <p className="text-xs text-text-muted">
            Configuración unificada de privilegios operativos, seguridad de comanda y restricciones por rango
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card hover:bg-surface-hover text-text-muted hover:text-text-primary border border-border/60 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer Rol
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gold hover:bg-gold-hover text-surface-dark transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald/15 border border-emerald/30 text-xs text-emerald flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Matriz de permisos actualizada correctamente para el rango seleccionado.</span>
        </div>
      )}

      {/* Role Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-card p-3 rounded-2xl border border-border/60">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {ROLES.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? "bg-gold/15 text-gold border-gold/40 shadow-sm"
                    : "bg-surface-dark/60 text-text-muted border-border/50 hover:text-text-primary"
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted px-2">
          <span>Permisos activos:</span>
          <span className="font-mono font-bold text-gold px-2 py-0.5 rounded-md bg-surface-dark border border-border/60">
            {activeCount} / {totalCount}
          </span>
        </div>
      </div>

      {/* High-Density Modular Permissions Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PERMISSION_GROUPS.map((group) => {
          const groupPerms = group.permissions;
          const groupActiveCount = groupPerms.filter((p) => currentPerms[p.key]).length;

          return (
            <div
              key={group.id}
              className="bg-surface-card border border-border/60 rounded-2xl p-5 space-y-4 shadow-sm hover:border-border-strong transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Group Header */}
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-surface-dark border border-border/60 text-gold">
                      {group.icon}
                    </div>
                    <h3 className="text-xs font-bold text-text-primary">
                      {group.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-text-muted">
                    {groupActiveCount}/{groupPerms.length}
                  </span>
                </div>

                {/* Permissions List */}
                <div className="space-y-2.5">
                  {groupPerms.map((perm) => {
                    const isEnabled = currentPerms[perm.key] ?? false;
                    return (
                      <div
                        key={perm.key}
                        onClick={() => handleToggle(perm.key)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isEnabled
                            ? "bg-surface-dark/70 border-gold/30 hover:border-gold/50"
                            : "bg-surface-dark/30 border-border/40 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div className="space-y-0.5 pr-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-text-primary">
                              {perm.label}
                            </span>
                            {perm.isDanger && (
                              <span
                                title="Operación crítica (requiere precaución o PIN)"
                                className="w-1.5 h-1.5 rounded-full bg-red shrink-0"
                              />
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted leading-tight">
                            {perm.description}
                          </p>
                        </div>

                        {/* Switch indicator */}
                        <div
                          className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                            isEnabled ? "bg-gold" : "bg-surface-card border border-border/60"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-surface-dark shadow-sm transition-transform ${
                              isEnabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

