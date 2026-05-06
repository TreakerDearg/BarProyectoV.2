"use client";

import {
  TerminalSquare,
  Trash2,
  Filter,
  History,
  Info
} from "lucide-react";
import { useMemo, useState } from "react";

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
  }
> = {
  system: {
    label: "SYSTEM",
    color: "text-blue-400",
    bg: "bg-blue-400/5",
  },
  admin: {
    label: "CONFIG",
    color: "text-gold",
    bg: "bg-gold/5",
  },
  event: {
    label: "DROP",
    color: "text-emerald-400",
    bg: "bg-emerald-400/5",
  },
  alert: {
    label: "ERROR",
    color: "text-red",
    bg: "bg-red/5",
  },
};

export default function RouletteLogs({ logs }: Props) {
  const [filter, setFilter] = useState<LogLevel | "all">("all");

  const filteredLogs = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter((l) => l.level === filter);
  }, [logs, filter]);

  return (
    <div className="flex flex-col h-full">
      
      {/* ================= FILTERS ================= */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "system", "admin", "event", "alert"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl as any)}
            className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
              filter === lvl
                ? "bg-gold text-bg border-gold shadow-gold-glow"
                : "border-white/5 text-muted hover:text-ivory hover:bg-white/5"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* ================= LOG LIST ================= */}
      <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar max-h-[600px]">
        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted opacity-20">
             <Info size={48} className="mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest">No hay registros</p>
          </div>
        )}

        {filteredLogs.map((log) => {
          const style = levelStyles[log.level];
          return (
            <div
              key={log.id}
              className={`group p-6 rounded-2xl border border-white/5 transition-all hover:border-white/10 ${style.bg}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`${style.color} text-[8px] font-black tracking-[0.3em] uppercase`}>
                  {style.label}
                </span>
                <span className="text-[8px] text-muted font-black tracking-widest">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs font-black text-ivory/80 uppercase tracking-tighter leading-relaxed group-hover:text-ivory transition-colors">
                {log.message}
              </p>
            </div>
          );
        })}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="mt-auto pt-6 flex justify-between items-center text-[8px] font-black text-muted uppercase tracking-[0.2em]">
         <div className="flex items-center gap-2">
            <History size={12} className="text-gold" />
            <span>{filteredLogs.length} EVENTOS REGISTRADOS</span>
         </div>
         <button className="hover:text-red transition-colors">LIMPIAR REGISTRO</button>
      </div>
    </div>
  );
}