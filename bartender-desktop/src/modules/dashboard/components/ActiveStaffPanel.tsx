/**
 * ActiveStaffPanel
 *
 * Muestra el personal con check-in activo en tiempo real.
 * Consume GET /attendance/today del backend.
 * Se refresca cada 60 segundos.
 */

import { useEffect, useState, useCallback } from "react";
import { Users, Clock, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { getTodayAttendance, type TodayAttendanceStats } from "../../admin/services/attendanceService";

// ── Helpers ───────────────────────────────────────────────────────

const SHIFT_LABEL: Record<string, string> = {
  morning:   "Mañana",
  afternoon: "Tarde",
  night:     "Noche",
  event:     "Evento",
};

const SHIFT_COLOR: Record<string, string> = {
  morning:   "text-amber-300 bg-amber-400/10 border-amber-400/20",
  afternoon: "text-gold bg-gold/10 border-gold/20",
  night:     "text-violet-300 bg-violet-400/10 border-violet-400/20",
  event:     "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
};

const ROLE_COLOR: Record<string, string> = {
  admin:     "text-amber-400",
  bartender: "text-cyan-400",
  waiter:    "text-emerald-400",
  kitchen:   "text-orange-400",
  cashier:   "text-purple-400",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatElapsed(checkInTime: string): string {
  const ms = Date.now() - new Date(checkInTime).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ── Componente ────────────────────────────────────────────────────

export default function ActiveStaffPanel() {
  const [stats, setStats] = useState<TodayAttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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

  // ── Empleados activos (sin check-out) ─────────────────────────
  const active = stats?.employees.filter((e) => !e.checkOut?.time) ?? [];

  return (
    <div className="dashboard-panel p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
            <Users size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ivory">Personal activo</h3>
            <p className="text-[10px] text-muted mt-0.5">
              {loading
                ? "Cargando…"
                : error
                ? "Error al cargar"
                : `${active.length} en turno ahora`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-[10px] text-muted/60">{lastRefresh}</span>
          )}
          <button
            onClick={() => load()}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-ivory transition-colors"
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
            { label: "Presentes",   value: stats.present,  color: "text-emerald-400" },
            { label: "En turno",    value: stats.onShift,  color: "text-cyan-400"    },
            { label: "Tarde",       value: stats.late,     color: "text-amber-400"   },
            { label: "Ausentes",    value: stats.absent,   color: "text-red"         },
          ].map((s) => (
            <div key={s.label} className="bg-surface-3/40 rounded-xl p-2.5 text-center border border-white/5">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-muted uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lista de empleados activos */}
      {loading ? (
        <div className="flex items-center justify-center h-20">
          <div className="w-8 h-8 rounded-full border-2 border-violet-400/30 border-t-violet-300 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <WifiOff size={20} className="text-muted mx-auto mb-2" />
          <p className="text-xs text-muted">No se pudo obtener el estado del personal</p>
        </div>
      ) : active.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted">
          <Wifi size={20} className="mx-auto mb-2 opacity-40" />
          Sin personal con check-in activo ahora
        </div>
      ) : (
        <ul className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {active.map((record) => {
            const shiftKey  = record.shift?.toLowerCase() ?? "";
            const roleKey   = record.user?.role ?? "";
            const elapsed   = record.checkIn?.time ? formatElapsed(record.checkIn.time) : "—";
            const shiftCls  = SHIFT_COLOR[shiftKey] ?? "text-muted bg-white/5 border-white/10";
            const roleCls   = ROLE_COLOR[roleKey]  ?? "text-muted";

            return (
              <li
                key={record._id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-3/40 border border-white/5 hover:border-white/10 transition-all"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/15 border border-violet-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-ivory">
                    {getInitials(record.user?.name ?? "?")}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ivory truncate">{record.user?.name ?? "—"}</p>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${roleCls}`}>
                    {roleKey}
                  </p>
                </div>

                {/* Turno */}
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${shiftCls}`}>
                  {SHIFT_LABEL[shiftKey] ?? shiftKey}
                </span>

                {/* Tiempo en turno */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <Clock size={10} />
                    {elapsed}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
