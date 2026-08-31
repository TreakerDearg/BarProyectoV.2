/**
 * PromoteModal
 *
 * Solo el admin puede usar este modal.
 * Permite cambiar el rol de cualquier usuario (client → empleado,
 * empleado → otro rol, o degradar a client).
 * Muestra todos los roles disponibles con descripción, ícono y color.
 */

import { useState } from "react";
import {
  X, UserCheck, Loader2, GlassWater, UtensilsCrossed,
  Calculator, ChefHat, ShieldCheck, User as UserIcon,
  ArrowRight,
} from "lucide-react";
import { promoteToEmployee } from "../services/userService";
import type { User, Role, Shift } from "../types/user";

// ── Todos los roles del sistema ───────────────────────────────────

const ALL_ROLES: {
  value: Role;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;          // Tailwind text color
  border: string;         // Tailwind border color activo
  bg: string;             // Tailwind bg activo
}[] = [
  {
    value: "bartender",
    label: "Bartender",
    description: "Prepara y sirve bebidas en la barra",
    icon: <GlassWater size={18} />,
    color: "text-cyan-400",
    border: "border-cyan-400/40",
    bg: "bg-cyan-400/10",
  },
  {
    value: "waiter",
    label: "Mozo / Camarero",
    description: "Atiende mesas, toma pedidos y los gestiona",
    icon: <UtensilsCrossed size={18} />,
    color: "text-emerald-400",
    border: "border-emerald-400/40",
    bg: "bg-emerald-400/10",
  },
  {
    value: "cashier",
    label: "Cajero / Caja",
    description: "Procesa pagos, cierres y control de caja",
    icon: <Calculator size={18} />,
    color: "text-purple-400",
    border: "border-purple-400/40",
    bg: "bg-purple-400/10",
  },
  {
    value: "kitchen",
    label: "Cocina",
    description: "Prepara platos y coordina el despacho",
    icon: <ChefHat size={18} />,
    color: "text-orange-400",
    border: "border-orange-400/40",
    bg: "bg-orange-400/10",
  },
  {
    value: "admin",
    label: "Administrador",
    description: "Acceso completo al sistema y gestión de personal",
    icon: <ShieldCheck size={18} />,
    color: "text-amber-400",
    border: "border-amber-400/40",
    bg: "bg-amber-400/10",
  },
  {
    value: "client",
    label: "Cliente",
    description: "Acceso solo al sistema de cliente (sin acceso al desktop)",
    icon: <UserIcon size={18} />,
    color: "text-white/40",
    border: "border-white/20",
    bg: "bg-white/5",
  },
];

const SHIFTS: { value: Shift; label: string; hours: string }[] = [
  { value: "morning",   label: "Mañana",  hours: "08:00 – 16:00" },
  { value: "afternoon", label: "Tarde",   hours: "16:00 – 00:00" },
  { value: "night",     label: "Noche",   hours: "22:00 – 06:00" },
  { value: "event",     label: "Evento",  hours: "Variable"       },
];

// ── Props ────────────────────────────────────────────────────────

interface PromoteModalProps {
  user: User;
  /** Rol del usuario que abre el modal — solo admin puede usarlo */
  adminRole: string;
  onClose: () => void;
  onSuccess: (updated: User) => void;
}

// ── Componente ───────────────────────────────────────────────────

export default function PromoteModal({ user, adminRole, onClose, onSuccess }: PromoteModalProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(
    // Preseleccionar el rol actual si ya es empleado, o bartender si es cliente
    user.role !== "client" ? user.role : "bartender"
  );
  const [selectedShift, setSelectedShift] = useState<Shift>(
    user.shift ?? "afternoon"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solo el admin puede usar este modal
  const canPromote = adminRole === "admin";

  // Si el rol seleccionado es "client" no necesita turno
  const needsShift = selectedRole !== "client";

  const currentRoleConfig = ALL_ROLES.find((r) => r.value === user.role);
  const selectedRoleConfig = ALL_ROLES.find((r) => r.value === selectedRole);

  const handlePromote = async () => {
    if (!canPromote) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await promoteToEmployee(
        user._id,
        selectedRole,
        needsShift ? selectedShift : undefined
      );
      if (!updated) throw new Error("No se recibió respuesta del servidor");
      onSuccess(updated as User);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "No se pudo actualizar el rol";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isDowngrade = selectedRole === "client";
  const isSameRole  = selectedRole === user.role && selectedShift === (user.shift ?? "afternoon");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gradient-to-br from-[#12131a] to-[#0d0e14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-gradient-to-r from-gold/10 via-violet-500/10 to-cyan-400/10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gold/20 to-yellow-500/10 border border-gold/30">
              <UserCheck className="text-gold" size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-0.5">
                {user.role === "client" ? "Ascenso de personal" : "Cambio de rol"}
              </p>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-semibold uppercase ${currentRoleConfig?.color ?? "text-white/40"}`}>
                  {currentRoleConfig?.label ?? user.role}
                </span>
                <ArrowRight size={10} className="text-white/30" />
                <span className={`text-[10px] font-semibold uppercase ${selectedRoleConfig?.color ?? "text-white/40"}`}>
                  {selectedRoleConfig?.label ?? selectedRole}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 flex items-center justify-center transition-all flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Sin permisos ─────────────────────────────────────── */}
        {!canPromote && (
          <div className="p-6 text-center">
            <ShieldCheck size={32} className="text-red-400/50 mx-auto mb-3" />
            <p className="text-sm font-bold text-white/60">Solo el administrador puede cambiar roles</p>
            <p className="text-xs text-white/30 mt-1">Tu rol actual no tiene este permiso</p>
          </div>
        )}

        {/* ── Cuerpo (solo visible para admin) ────────────────── */}
        {canPromote && (
          <div className="p-6 space-y-5 overflow-y-auto flex-1">

            {/* Lista de roles */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                Seleccionar puesto
              </label>
              <div className="space-y-1.5">
                {ALL_ROLES.map((r) => {
                  const isSelected  = selectedRole === r.value;
                  const isCurrent   = r.value === user.role;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? `${r.bg} ${r.border}`
                          : "bg-white/[0.03] border-white/8 hover:border-white/15 hover:bg-white/[0.05]"
                      }`}
                    >
                      {/* Radio */}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? r.border.replace("border-", "border-") : "border-white/20"
                      }`}>
                        {isSelected && <div className={`w-2 h-2 rounded-full ${r.color.replace("text-", "bg-")}`} />}
                      </div>

                      {/* Ícono */}
                      <span className={`flex-shrink-0 ${isSelected ? r.color : "text-white/25"}`}>
                        {r.icon}
                      </span>

                      {/* Texto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold ${isSelected ? r.color : "text-white/70"}`}>
                            {r.label}
                          </p>
                          {isCurrent && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-white/30 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">
                              Actual
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/35 truncate mt-0.5">{r.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Turno — solo si no es degradar a cliente */}
            {needsShift && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  Turno asignado
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SHIFTS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSelectedShift(s.value)}
                      className={`flex flex-col items-start gap-0.5 p-3.5 rounded-xl border text-left transition-all ${
                        selectedShift === s.value
                          ? "bg-cyan-500/10 border-cyan-400/30"
                          : "bg-white/[0.03] border-white/8 hover:border-white/15"
                      }`}
                    >
                      <p className={`text-sm font-bold ${selectedShift === s.value ? "text-cyan-400" : "text-white/60"}`}>
                        {s.label}
                      </p>
                      <p className="text-[11px] text-white/35">{s.hours}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Advertencia para degradar a cliente */}
            {isDowngrade && (
              <div className="p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-xs text-red-400/80">
                ⚠️ Este usuario perderá acceso al sistema de empleados y solo podrá usar el sistema de clientes.
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 px-4 py-2.5 rounded-xl">
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="px-6 pb-6 pt-4 flex gap-3 flex-shrink-0 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11 rounded-xl border border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider hover:text-white hover:border-white/20 transition-all"
          >
            Cancelar
          </button>

          {canPromote && (
            <button
              type="button"
              onClick={handlePromote}
              disabled={loading || isSameRole}
              className={`flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 ${
                isDowngrade
                  ? "bg-red-600/80 hover:bg-red-600 text-white border border-red-500/40"
                  : "bg-gradient-to-r from-gold via-yellow-500 to-amber-400 text-black hover:shadow-lg hover:shadow-gold/25"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Guardando…
                </>
              ) : isSameRole ? (
                "Sin cambios"
              ) : isDowngrade ? (
                <>
                  <UserIcon size={15} />
                  Degradar a cliente
                </>
              ) : (
                <>
                  <UserCheck size={15} />
                  Confirmar cambio
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
