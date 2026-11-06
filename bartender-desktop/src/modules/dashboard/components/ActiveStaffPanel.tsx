/**
 * ActiveStaffPanel — Personal con check-in activo en tiempo real.
 * Consume GET /attendance/today del backend.
 * Se refresca cada 60 segundos.
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import { useEffect, useState, useCallback } from "react";
import { Users, Clock, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { getTodayAttendance, type TodayAttendanceStats } from "../../admin/services/attendanceService";

/* ── Helpers (sin cambios) ─────────────────────────────────── */
const SHIFT_LABEL: Record<string, string> = {
  morning:   "Mañana",
  afternoon: "Tarde",
  night:     "Noche",
  event:     "Evento",
};

const SHIFT_COLOR: Record<string, string> = {
  morning:   "text-[#F5C842] bg-[#F5C842]/10 border-[#F5C842]/20",
  afternoon: "text-[#F0B429] bg-[#F0B429]/10 border-[#F0B429]/20",
  night:     "text-[#A371F7] bg-[#A371F7]/10 border-[#A371F7]/20",
  event:     "text-[#388BFD] bg-[#388BFD]/10 border-[#388BFD]/20",
};

const ROLE_COLOR: Record<string, string> = {
  admin:     "text-[#F5C842]",
  bartender: "text-[#388BFD]",
  waiter:    "text-[#3FB950]",
  kitchen:   "text-[#FF7B54]",
  cashier:   "text-[#A371F7]",
};

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function formatElapsed(checkInTime: string): string {
  const ms = Date.now() - new Date(checkInTime).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ── Componente ──────────────────────────────────────────────── */
export default function ActiveStaffPanel() {
  const [stats, setStats]           = useState<TodayAttendanceStats | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(false);
    try {
      const data = await getTodayAttendance();
      setStats(data);
      setLastRefresh(new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const active = stats?.employees.filter((e) => !e.checkOut?.time) ?? [];

  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#3FB950]/12 border border-[#3FB950]/25">
            <Users size={18} className="text-[#3FB950]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#E6EDF3]">Personal activo</h3>
            <p className="text-xs text-[#566270] mt-0.5">
              {loading ? "Cargando…" :
               error   ? "Error al cargar" :
               `${active.length} en turno ahora`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-[10px] text-[#566270]">{lastRefresh}</span>
          )}
          <button
            onClick={() => load()}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/5 text-[#566270] hover:text-[#E6EDF3] transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Summary pills */}
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Presentes", value: stats.present, color: "#3FB950" },
            { label: "En turno",  value: stats.onShift, color: "#388BFD" },
            { label: "Tarde",     value: stats.late,    color: "#F0B429" },
            { label: "Ausentes",  value: stats.absent,  color: "#F85149" },
          ].map((s) => (
            <div key={s.label} className="bg-[#21283A] rounded-xl p-3 text-center border border-[#30363D]">
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-[#566270] uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#30363D] border-t-[#F0B429] animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <WifiOff size={20} className="text-[#566270] mx-auto mb-2" />
          <p className="text-xs text-[#566270]">No se pudo obtener el estado del personal</p>
        </div>
      ) : active.length === 0 ? (
        <div className="text-center py-6 text-[#566270]">
          <Wifi size={20} className="mx-auto mb-2 opacity-40" />
          <p className="text-xs">Sin personal con check-in activo ahora</p>
        </div>
      ) : (
        <ul
          className="space-y-2 max-h-[260px] overflow-y-auto pr-1"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
        >
          {active.map((record) => {
            const shiftKey = record.shift?.toLowerCase() ?? "";
            const roleKey  = record.user?.role ?? "";
            const elapsed  = record.checkIn?.time ? formatElapsed(record.checkIn.time) : "—";
            const shiftCls = SHIFT_COLOR[shiftKey] ?? "text-[#8B949E] bg-[#21283A] border-[#30363D]";
            const roleCls  = ROLE_COLOR[roleKey]  ?? "text-[#8B949E]";

            return (
              <li
                key={record._id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#21283A] border border-[#30363D] hover:border-[#3D444D] transition-all"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#388BFD]/20 to-[#3FB950]/12 border border-[#388BFD]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#E6EDF3]">
                    {getInitials(record.user?.name ?? "?")}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#E6EDF3] truncate">{record.user?.name ?? "—"}</p>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${roleCls}`}>
                    {roleKey}
                  </p>
                </div>

                {/* Turno */}
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${shiftCls}`}>
                  {SHIFT_LABEL[shiftKey] ?? shiftKey}
                </span>

                {/* Tiempo */}
                <div className="flex items-center gap-1 text-xs text-[#566270] flex-shrink-0">
                  <Clock size={11} />
                  {elapsed}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
