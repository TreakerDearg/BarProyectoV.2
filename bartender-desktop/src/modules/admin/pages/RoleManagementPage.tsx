import { useState } from "react";
import { Shield, Users, Check, X, Lock, Save, Loader2 } from "lucide-react";
import { updateRolePermissions } from "../services/userService";
import "../styles/luxury-theme.css";

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
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateRolePermissions(selectedRole, rolePermissions[selectedRole]);
      alert(`Permisos actualizados para todos los empleados con rol ${selectedRole.toUpperCase()}.`);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar permisos de rol");
    } finally {
      setSaving(false);
    }
  };

  const activePermissionsCount = Object.values(
    rolePermissions[selectedRole]
  ).filter(Boolean).length;

  return (
    <div className="space-y-6 glass-card p-8 rounded-[3rem] animate-fade-in relative overflow-hidden luxury-bg">
      {/* ATMOSPHERIC GLOW */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#b147ff]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-4 glass-card rounded-2xl shadow-inner">
            <Users className="text-[#ffffff]" size={32} />
          </div>
          <div>
            <p className="text-[10px] text-[#00d4ff] font-black uppercase tracking-[0.4em] mb-1">
              Control Base
            </p>
            <h1 className="text-3xl font-black text-[#ffffff] tracking-tighter uppercase leading-none">
              Gestión de Roles
            </h1>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 h-14 px-6 rounded-2xl
          luxury-button text-[#0a0a0f] shadow-gold/30
          hover:shadow-gold-glow hover:scale-[1.02] active:scale-95
          transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={20} className="text-[#0a0a0f] animate-spin" /> : <Save size={20} className="text-[#0a0a0f]" />}
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Guardar Cambios</span>
        </button>
      </div>

      {/* ================= ROLES SELECTOR ================= */}
      <div className="flex gap-3 flex-wrap relative z-10">
        {roles.map((role) => (
          <button
            key={role.key}
            onClick={() => setSelectedRole(role.key)}
            className={`
              flex items-center gap-3 px-5 h-12 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300
              ${
                selectedRole === role.key
                  ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                  : "glass-card text-[#a0a0b0] hover:text-white hover:border-white/20"
              }
            `}
          >
            <Users size={16} className={selectedRole === role.key ? "text-[#00d4ff]" : "text-[#a0a0b0]"} />
            {role.label}
          </button>
        ))}
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="
        flex items-center justify-between
        px-6 py-4 rounded-2xl
        glass-card shadow-inner relative z-10
      ">
        <span className="text-[10px] font-black text-[#a0a0b0] uppercase tracking-widest">
          Permisos Base Activos
        </span>
        <span className="text-sm text-[#00ff88] font-black flex items-center gap-2">
          <Lock size={16} />
          {activePermissionsCount} / {permissions.length} MÓDULOS
        </span>
      </div>

      {/* ================= PERMISSIONS GRID ================= */}
      <div className="
        rounded-[2rem] border border-white/5
        glass-card backdrop-blur-xl
        overflow-hidden relative z-10 shadow-royale
      ">
        <div className="p-6 border-b border-white/5 bg-surface-3/50">
          <h2 className="text-xs font-black text-[#ffffff] tracking-[0.2em] uppercase flex items-center gap-3">
            <Shield size={16} className="text-[#00d4ff]" />
            Permisos de Rango: {selectedRole}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-white/5">
          {permissions.map((perm, index) => {
            const enabled = rolePermissions[selectedRole][perm.key];
            return (
              <div
                key={perm.key}
                className={`
                  flex items-center justify-between
                  px-6 py-5 hover:bg-white/5 transition-all
                  ${index % 2 === 0 ? "md:border-r border-white/5" : ""}
                  ${index > 1 ? "md:border-t border-white/5" : ""}
                `}
              >
                {/* LABEL */}
                <div className="flex items-center gap-3 text-[#ffffff]">
                  <div className={`p-2 rounded-lg ${enabled ? 'bg-[#00ff88]/10' : 'bg-[#ff4757]/10'} transition-colors`}>
                    <Shield size={16} className={enabled ? 'text-[#00ff88]' : 'text-[#ff4757]'} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{perm.label}</span>
                </div>

                {/* TOGGLE */}
                <button
                  onClick={() => togglePermission(perm.key)}
                  className={`
                    relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1
                    ${
                      enabled
                        ? "bg-[#00ff88]/10 border-[#00ff88]/30 justify-end"
                        : "bg-[#ff4757]/10 border-[#ff4757]/30 justify-start"
                    }
                  `}
                >
                  <div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all shadow-lg
                      ${
                        enabled
                          ? "bg-[#00ff88] text-[#0a0a0f] shadow-[0_0_10px_rgba(163,230,53,0.5)]"
                          : "bg-[#ff4757] text-[#ffffff] shadow-[0_0_10px_rgba(248,113,113,0.5)]"
                      }
                    `}
                  >
                    {enabled ? <Check size={12} /> : <X size={12} />}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}