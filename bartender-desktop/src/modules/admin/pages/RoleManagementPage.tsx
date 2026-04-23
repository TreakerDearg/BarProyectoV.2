import { useState } from "react";
import { Shield, Users, Check, X, Lock } from "lucide-react";

type Role = "admin" | "bartender" | "waiter" | "cashier" | "kitchen";

type PermissionKey =
  | "orders"
  | "cashier"
  | "inventory"
  | "roulette"
  | "employees"
  | "menus"
  | "tables"
  | "reservations";

interface RolePermissions {
  [role: string]: Record<PermissionKey, boolean>;
}

const roles: { key: Role; label: string }[] = [
  { key: "admin", label: "Administrador" },
  { key: "bartender", label: "Bartender" },
  { key: "waiter", label: "Mozo" },
  { key: "cashier", label: "Caja" },
  { key: "kitchen", label: "Cocina" },
];

const permissions: { key: PermissionKey; label: string }[] = [
  { key: "orders", label: "Pedidos" },
  { key: "cashier", label: "Caja" },
  { key: "inventory", label: "Inventario" },
  { key: "roulette", label: "Ruleta" },
  { key: "employees", label: "Empleados" },
  { key: "menus", label: "Menús" },
  { key: "tables", label: "Mesas" },
  { key: "reservations", label: "Reservas" },
];

export default function RoleManagementPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("bartender");

  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({
    admin: {
      orders: true,
      cashier: true,
      inventory: true,
      roulette: true,
      employees: true,
      menus: true,
      tables: true,
      reservations: true,
    },
    bartender: {
      orders: true,
      cashier: false,
      inventory: false,
      roulette: true,
      employees: false,
      menus: false,
      tables: false,
      reservations: false,
    },
    waiter: {
      orders: true,
      cashier: false,
      inventory: false,
      roulette: false,
      employees: false,
      menus: true,
      tables: true,
      reservations: true,
    },
    cashier: {
      orders: true,
      cashier: true,
      inventory: false,
      roulette: false,
      employees: false,
      menus: false,
      tables: false,
      reservations: false,
    },
    kitchen: {
      orders: true,
      cashier: false,
      inventory: true,
      roulette: false,
      employees: false,
      menus: false,
      tables: false,
      reservations: false,
    },
  });

  const togglePermission = (key: PermissionKey) => {
    setRolePermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [key]: !prev[selectedRole][key],
      },
    }));
  };

  const activePermissionsCount = Object.values(
    rolePermissions[selectedRole]
  ).filter(Boolean).length;

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-[#A78BFA]" size={22} />
          Gestión de Roles
        </h1>

        <p className="text-sm text-[#71717A] mt-1">
          Control de permisos base por rol del sistema
        </p>
      </div>

      {/* ================= ROLES SELECTOR ================= */}
      <div className="flex flex-wrap gap-2">

        {roles.map((role) => (
          <button
            key={role.key}
            onClick={() => setSelectedRole(role.key)}
            className={`
              px-3 py-1.5 rounded-lg text-sm border transition flex items-center gap-2

              ${
                selectedRole === role.key
                  ? "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/30 shadow-[0_0_15px_rgba(167,139,250,0.15)]"
                  : "bg-[#111827]/40 text-[#71717A] border-transparent hover:text-white hover:bg-[#111827]/60"
              }
            `}
          >
            <Users size={14} />
            {role.label}
          </button>
        ))}

      </div>

      {/* ================= SUMMARY ================= */}
      <div className="
        flex items-center justify-between
        px-4 py-3 rounded-xl
        bg-[#0E131B]/60 border border-[rgba(255,255,255,0.06)]
      ">

        <span className="text-sm text-[#71717A]">
          Permisos activos
        </span>

        <span className="text-sm text-[#34D399] font-semibold flex items-center gap-2">
          <Lock size={14} />
          {activePermissionsCount} / {permissions.length}
        </span>

      </div>

      {/* ================= PERMISSIONS GRID ================= */}
      <div className="
        rounded-2xl border border-[rgba(255,255,255,0.06)]
        bg-[#0E131B]/60 backdrop-blur-xl
        overflow-hidden
      ">

        <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-white font-semibold">
            Permisos de {selectedRole.toUpperCase()}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">

          {permissions.map((perm) => {
            const enabled =
              rolePermissions[selectedRole][perm.key];

            return (
              <div
                key={perm.key}
                className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.03)] hover:bg-[#111827]/30 transition"
              >

                <span className="text-white text-sm">
                  {perm.label}
                </span>

                <button
                  onClick={() => togglePermission(perm.key)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition

                    ${
                      enabled
                        ? "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30"
                        : "bg-[#F87171]/10 text-[#F87171] border-[#F87171]/30"
                    }
                  `}
                >
                  {enabled ? (
                    <>
                      <Check size={14} /> Activo
                    </>
                  ) : (
                    <>
                      <X size={14} /> Bloqueado
                    </>
                  )}
                </button>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}