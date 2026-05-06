import { useState } from "react";
import { Clock, Shield, Check, X, Activity, Save, Loader2 } from "lucide-react";
import { updateShiftPermissions } from "../services/userService";

type ModuleKey =
  | "orders"
  | "cashier"
  | "roulette"
  | "inventory"
  | "employees"
  | "discounts";

type ShiftKey = "morning" | "afternoon" | "night" | "event";

const modules: { key: ModuleKey; label: string }[] = [
  { key: "orders", label: "Pedidos" },
  { key: "cashier", label: "Caja" },
  { key: "roulette", label: "Ruleta" },
  { key: "inventory", label: "Inventario" },
  { key: "employees", label: "Empleados" },
  { key: "discounts", label: "Descuentos" },
];

const shifts: { key: ShiftKey; label: string }[] = [
  { key: "morning", label: "Mañana" },
  { key: "afternoon", label: "Tarde" },
  { key: "night", label: "Noche" },
  { key: "event", label: "Evento" },
];

type PermissionsState = Record<ShiftKey, Record<ModuleKey, boolean>>;

export default function ShiftPermissionsPage() {
  const [selectedShift, setSelectedShift] = useState<ShiftKey>("morning");
  const [saving, setSaving] = useState(false);

  const [permissions, setPermissions] = useState<PermissionsState>({
    morning: {
      orders: true,
      cashier: true,
      roulette: false,
      inventory: true,
      employees: true,
      discounts: false,
    },
    afternoon: {
      orders: true,
      cashier: true,
      roulette: true,
      inventory: false,
      employees: true,
      discounts: true,
    },
    night: {
      orders: true,
      cashier: false,
      roulette: true,
      inventory: false,
      employees: false,
      discounts: true,
    },
    event: {
      orders: true,
      cashier: true,
      roulette: true,
      inventory: true,
      employees: true,
      discounts: true,
    },
  });

  const togglePermission = (module: ModuleKey) => {
    setPermissions((prev) => ({
      ...prev,
      [selectedShift]: {
        ...prev[selectedShift],
        [module]: !prev[selectedShift][module],
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateShiftPermissions(selectedShift, permissions[selectedShift]);
      alert("Permisos actualizados para todos los empleados de este turno.");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar permisos");
    } finally {
      setSaving(false);
    }
  };

  const activeCount = Object.values(
    permissions[selectedShift]
  ).filter(Boolean).length;

  const total = modules.length;

  return (
    <div className="space-y-6 glass-royale p-8 rounded-[3rem] shadow-royale animate-fade-in relative overflow-hidden">
      {/* ATMOSPHERIC GLOW */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-surface-3 border border-white/5 rounded-2xl shadow-inner">
            <Shield className="text-ivory" size={32} />
          </div>
          <div>
            <p className="text-[10px] text-violet-400 font-black uppercase tracking-[0.4em] mb-1">
              Control de Accesos
            </p>
            <h1 className="text-3xl font-black text-ivory tracking-tighter uppercase leading-none">
              Sistema de Turnos
            </h1>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 h-14 px-6 rounded-2xl
          bg-grad-gold text-bg shadow-gold/30
          hover:shadow-gold-glow hover:scale-[1.02] active:scale-95
          transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={20} className="text-bg animate-spin" /> : <Save size={20} className="text-bg" />}
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Guardar Cambios</span>
        </button>
      </div>

      {/* ================= SHIFT SELECTOR ================= */}
      <div className="flex gap-3 flex-wrap relative z-10">
        {shifts.map((shift) => (
          <button
            key={shift.key}
            onClick={() => setSelectedShift(shift.key)}
            className={`
              flex items-center gap-3 px-5 h-12 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300
              ${
                selectedShift === shift.key
                  ? "bg-violet-500/10 text-violet-400 border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                  : "bg-surface-3 border border-white/5 text-muted hover:text-white hover:border-white/20"
              }
            `}
          >
            <Clock size={16} className={selectedShift === shift.key ? "text-violet-400" : "text-muted"} />
            {shift.label}
          </button>
        ))}
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="
        flex items-center justify-between
        px-6 py-4 rounded-2xl
        bg-surface-3 border border-white/5 shadow-inner relative z-10
      ">
        <span className="text-[10px] font-black text-muted uppercase tracking-widest">
          Nivel de Acceso Activo
        </span>
        <span className="text-sm text-lime font-black flex items-center gap-2">
          <Activity size={16} />
          {activeCount} / {total} MÓDULOS
        </span>
      </div>

      {/* ================= GRID ================= */}
      <div className="
        rounded-[2rem] border border-white/5
        bg-surface-2 backdrop-blur-xl
        overflow-hidden relative z-10 shadow-royale
      ">
        <div className="p-6 border-b border-white/5 bg-surface-3/50">
          <h2 className="text-xs font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3">
            <Shield size={16} className="text-violet-400" />
            Configuración: {selectedShift}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-white/5">
          {modules.map((mod, index) => {
            const enabled = permissions[selectedShift][mod.key];
            return (
              <div
                key={mod.key}
                className={`
                  flex items-center justify-between
                  px-6 py-5 hover:bg-white/5 transition-all
                  ${index % 2 === 0 ? "md:border-r border-white/5" : ""}
                  ${index > 1 ? "md:border-t border-white/5" : ""}
                `}
              >
                {/* LABEL */}
                <div className="flex items-center gap-3 text-ivory">
                  <div className={`p-2 rounded-lg ${enabled ? 'bg-lime/10' : 'bg-red/10'} transition-colors`}>
                    <Shield size={16} className={enabled ? 'text-lime' : 'text-red'} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{mod.label}</span>
                </div>

                {/* TOGGLE */}
                <button
                  onClick={() => togglePermission(mod.key)}
                  className={`
                    relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1
                    ${
                      enabled
                        ? "bg-lime/10 border-lime/30 justify-end"
                        : "bg-red/10 border-red/30 justify-start"
                    }
                  `}
                >
                  <div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all shadow-lg
                      ${
                        enabled
                          ? "bg-lime text-bg shadow-[0_0_10px_rgba(163,230,53,0.5)]"
                          : "bg-red text-ivory shadow-[0_0_10px_rgba(248,113,113,0.5)]"
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