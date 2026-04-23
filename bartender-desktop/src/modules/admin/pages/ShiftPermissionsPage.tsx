import { useState } from "react";
import { Clock, Shield, Check, X, Activity } from "lucide-react";

type ModuleKey =
  | "orders"
  | "cashier"
  | "roulette"
  | "inventory"
  | "employees";

type ShiftKey = "morning" | "afternoon" | "night" | "event";

const modules: { key: ModuleKey; label: string }[] = [
  { key: "orders", label: "Pedidos" },
  { key: "cashier", label: "Caja" },
  { key: "roulette", label: "Ruleta" },
  { key: "inventory", label: "Inventario" },
  { key: "employees", label: "Empleados" },
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

  const [permissions, setPermissions] = useState<PermissionsState>({
    morning: {
      orders: true,
      cashier: true,
      roulette: false,
      inventory: true,
      employees: true,
    },
    afternoon: {
      orders: true,
      cashier: true,
      roulette: true,
      inventory: false,
      employees: true,
    },
    night: {
      orders: true,
      cashier: false,
      roulette: true,
      inventory: false,
      employees: false,
    },
    event: {
      orders: true,
      cashier: true,
      roulette: true,
      inventory: true,
      employees: true,
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

  const activeCount = Object.values(
    permissions[selectedShift]
  ).filter(Boolean).length;

  const total = modules.length;

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-[#A78BFA]" size={20} />
          Sistema de Turnos
        </h1>

        <p className="text-sm text-[#71717A] mt-1">
          Control de accesos por jornada operativa
        </p>
      </div>

      {/* ================= SHIFT SELECTOR ================= */}
      <div className="flex gap-2 flex-wrap">

        {shifts.map((shift) => (
          <button
            key={shift.key}
            onClick={() => setSelectedShift(shift.key)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition

              ${
                selectedShift === shift.key
                  ? "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/30 shadow-[0_0_12px_rgba(167,139,250,0.15)]"
                  : "bg-[#111827]/40 text-[#71717A] border-transparent hover:text-white hover:bg-[#111827]/60"
              }
            `}
          >
            <Clock size={14} />
            {shift.label}
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
          Permisos activos en este turno
        </span>

        <span className="text-sm text-[#34D399] font-semibold flex items-center gap-2">
          <Activity size={14} />
          {activeCount} / {total}
        </span>

      </div>

      {/* ================= GRID ================= */}
      <div className="
        rounded-2xl border border-[rgba(255,255,255,0.06)]
        bg-[#0E131B]/60 backdrop-blur-xl
        overflow-hidden
      ">

        <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-white font-semibold">
            Permisos del turno: {selectedShift.toUpperCase()}
          </h2>
        </div>

        <div>

          {modules.map((mod) => {
            const enabled =
              permissions[selectedShift][mod.key];

            return (
              <div
                key={mod.key}
                className="
                  flex items-center justify-between
                  px-4 py-4 border-b border-[rgba(255,255,255,0.03)]
                  hover:bg-[#111827]/30 transition
                "
              >

                {/* LABEL */}
                <div className="flex items-center gap-2 text-white">
                  <Shield size={14} className="text-[#A78BFA]" />
                  {mod.label}
                </div>

                {/* TOGGLE */}
                <button
                  onClick={() => togglePermission(mod.key)}
                  className={`
                    relative w-20 h-8 rounded-full border transition flex items-center px-1

                    ${
                      enabled
                        ? "bg-[#34D399]/10 border-[#34D399]/30 justify-end"
                        : "bg-[#F87171]/10 border-[#F87171]/30 justify-start"
                    }
                  `}
                >

                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition

                      ${
                        enabled
                          ? "bg-[#34D399] text-black"
                          : "bg-[#F87171] text-black"
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