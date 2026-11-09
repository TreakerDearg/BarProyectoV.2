"use client";

import { useMemo, useState } from "react";
import { History, Info, Shield, Zap, AlertCircle, Terminal, CheckCircle2 } from "lucide-react";

type LogLevel = "system" | "admin" | "event" | "alert";

interface Log {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
}

interface Props {
  logs: Log[];
}

const levelStyles: Record<
  LogLevel,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  system: {
    label: "SISTEMA",
    color: "text-[#388BFD]",
    bg: "bg-[#388BFD]/10",
    border: "border-[#388BFD]/30",
    icon: <Terminal size={14} className="text-[#388BFD]" />,
  },
  admin: {
    label: "CONFIG",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/30",
    icon: <Shield size={14} className="text-gold" />,
  },
  event: {
    label: "DROP / GIRO",
    color: "text-emerald",
    bg: "bg-emerald/10",
    border: "border-emerald/30",
    icon: <Zap size={14} className="text-emerald" />,
  },
  alert: {
    label: "ALERTA",
    color: "text-red",
    bg: "bg-red/10",
    border: "border-red/30",
    icon: <AlertCircle size={14} className="text-red" />,
  },
};

export default function RouletteLogs({ logs }: Props) {
  const [filter, setFilter] = useState<LogLevel | "all">("all");

  const filteredLogs = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter((l) => l.level === filter);
  }, [logs, filter]);

  const counts = useMemo(() => {
    return {
      all: logs.length,
      system: logs.filter((l) => l.level === "system").length,
      admin: logs.filter((l) => l.level === "admin").length,
      event: logs.filter((l) => l.level === "event").length,
      alert: logs.filter((l) => l.level === "alert").length,
    };
  }, [logs]);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Resumen de Métricas de Auditoría */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-3 border border-border">
          <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">
            Total Eventos
          </span>
          <span className="text-xl font-black text-ivory">{counts.all}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-surface-3 border border-border">
          <span className="text-xs text-[#388BFD] font-bold uppercase tracking-wider block mb-1">
            Sistema
          </span>
          <span className="text-xl font-black text-[#388BFD]">{counts.system}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-surface-3 border border-border">
          <span className="text-xs text-emerald font-bold uppercase tracking-wider block mb-1">
            Drops / Giros
          </span>
          <span className="text-xl font-black text-emerald">{counts.event}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-surface-3 border border-border">
          <span className="text-xs text-red font-bold uppercase tracking-wider block mb-1">
            Alertas
          </span>
          <span className="text-xl font-black text-red">{counts.alert}</span>
        </div>
      </div>

      {/* ================= FILTROS ================= */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "all", label: `Todos (${counts.all})` },
            { key: "system", label: `Sistema (${counts.system})` },
            { key: "admin", label: `Config (${counts.admin})` },
            { key: "event", label: `Drops (${counts.event})` },
            { key: "alert", label: `Alertas (${counts.alert})` },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as LogLevel | "all")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
              filter === key
                ? "bg-gold text-bg border-gold shadow-gold-glow"
                : "border-border bg-surface-3/50 text-muted hover:text-ivory hover:bg-surface-3"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ================= LISTADO DE LOGS ================= */}
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[460px] flex-1">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted border border-dashed border-border rounded-2xl bg-surface-3/20">
            <Info size={40} className="mb-3 opacity-40" />
            <p className="text-sm font-bold uppercase tracking-wider">
              No hay eventos en esta categoría
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const style = levelStyles[log.level] || levelStyles.system;
            const logDate = new Date(log.timestamp);
            const formattedTime = !isNaN(logDate.getTime())
              ? `${logDate.toLocaleDateString()} ${logDate.toLocaleTimeString()}`
              : log.timestamp;

            return (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-border bg-surface-3/40 hover:bg-surface-3 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-black uppercase tracking-wider ${style.bg} ${style.color} ${style.border}`}
                    >
                      {style.icon}
                      {style.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted font-bold font-mono">
                    {formattedTime}
                  </span>
                </div>
                <p className="text-sm font-bold text-ivory leading-relaxed">
                  {log.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="pt-4 border-t border-border flex justify-between items-center text-xs text-muted font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <History size={14} className="text-gold" />
          <span>{filteredLogs.length} eventos listados</span>
        </div>
      </div>
    </div>
  );
}
