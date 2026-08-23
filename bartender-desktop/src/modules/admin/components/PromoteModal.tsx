/**
 * PromoteModal
 *
 * Permite al admin:
 *   - Ascender un usuario existente (cliente) a empleado
 *   - Asignar rol y turno
 *
 * Llama a promoteToEmployee(id, role, shift) que internamente usa
 * PUT /api/users/:id — el backend sincroniza isEmployee automáticamente.
 */

import { useState } from "react";
import { X, UserCheck, Loader2, ChevronDown } from "lucide-react";
import { promoteToEmployee } from "../services/userService";
import type { User, Role, Shift } from "../types/user";

// ── Constantes ────────────────────────────────────────────────────

const EMPLOYEE_ROLES: { value: Exclude<Role, "client">; label: string; description: string }[] = [
  { value: "bartender", label: "Bartender",  description: "Prepara y sirve bebidas en la barra" },
  { value: "waiter",    label: "Mozo",        description: "Atiende mesas y gestiona pedidos" },
  { value: "cashier",   label: "Caja",        description: "Procesa pagos y cierra cuentas" },
  { value: "kitchen",   label: "Cocina",      description: "Prepara platos y coordina el despacho" },
  { value: "admin",     label: "Administrador", description: "Acceso completo al sistema" },
];

const SHIFTS: { value: Shift; label: string; hours: string }[] = [
  { value: "morning",   label: "Mañana",   hours: "08:00 – 16:00" },
  { value: "afternoon", label: "Tarde",    hours: "16:00 – 00:00" },
  { value: "night",     label: "Noche",    hours: "22:00 – 06:00" },
  { value: "event",     label: "Evento",   hours: "Variable"       },
];

// ── Props ────────────────────────────────────────────────────────

interface PromoteModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (updated: User) => void;
}

// ── Componente ───────────────────────────────────────────────────

export default function PromoteModal({ user, onClose, onSuccess }: PromoteModalProps) {
  const [selectedRole, setSelectedRole] = useState<Exclude<Role, "client">>("bartender");
  const [selectedShift, setSelectedShift] = useState<Shift>("afternoon");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromote = async () => {
    setLoading(true);
    setError(null);
    try {
      const updated = await promoteToEmployee(user._id, selectedRole, selectedShift);
      if (!updated) throw new Error("No se recibió respuesta del servidor");
      onSuccess(updated as User);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "No se pudo ascender al usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gradient-to-br from-[#12131a] to-[#0d0e14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-gradient-to-r from-gold/10 via-violet-500/10 to-cyan-400/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gold/20 to-yellow-500/10 border border-gold/30">
              <UserCheck className="text-gold" size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-0.5">
                Ascenso de personal
              </p>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-xs text-white/40 font-medium">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 flex items-center justify-center transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Cuerpo ─────────────────────────────────────────── */}
        <div className="p-6 space-y-6">

          {/* Rol */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Rol de empleado
            </label>
            <div className="grid grid-cols-1 gap-2">
              {EMPLOYEE_ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelectedRole(r.value)}
                  className={`flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all ${
                    selectedRole === r.value
                      ? "bg-gold/10 border-gold/40 text-white"
                      : "bg-white/3 border-white/8 text-white/50 hover:border-white/15 hover:text-white/80"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedRole === r.value ? "border-gold" : "border-white/20"
                  }`}>
                    {selectedRole === r.value && (
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${selectedRole === r.value ? "text-gold" : ""}`}>
                      {r.label}
                    </p>
                    <p className="text-[11px] text-white/35 truncate">{r.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Turno */}
          <div className="space-y-3">
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
                      ? "bg-cyan-500/10 border-cyan-400/30 text-white"
                      : "bg-white/3 border-white/8 text-white/50 hover:border-white/15"
                  }`}
                >
                  <p className={`text-sm font-bold ${selectedShift === s.value ? "text-cyan-400" : ""}`}>
                    {s.label}
                  </p>
                  <p className="text-[11px] text-white/35">{s.hours}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="p-3.5 rounded-xl bg-white/3 border border-white/8 flex items-center gap-3 text-sm">
            <ChevronDown size={14} className="text-white/30 rotate-[-90deg]" />
            <p className="text-white/60">
              <span className="font-semibold text-white">{user.name}</span> pasará de{" "}
              <span className="text-white/40">Cliente</span> a{" "}
              <span className="font-semibold text-gold">
                {EMPLOYEE_ROLES.find((r) => r.value === selectedRole)?.label}
              </span>{" "}
              en turno{" "}
              <span className="font-semibold text-cyan-400">
                {SHIFTS.find((s) => s.value === selectedShift)?.label}
              </span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 px-4 py-2.5 rounded-xl">
              {error}
            </p>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11 rounded-xl border border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider hover:text-white hover:border-white/20 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handlePromote}
            disabled={loading}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-gold via-yellow-500 to-amber-400 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-gold/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Ascendiendo…
              </>
            ) : (
              <>
                <UserCheck size={15} />
                Confirmar ascenso
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
