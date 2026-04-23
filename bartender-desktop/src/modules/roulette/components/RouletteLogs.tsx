import { TerminalSquare, Trash2, Filter } from "lucide-react";
import { useMemo, useState } from "react";

/* ==============================
   TYPES
============================== */
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

/* ==============================
   STYLES
============================== */
const levelStyles: Record<
  LogLevel,
  {
    label: string;
    color: string;
    glow: string;
  }
> = {
  system: {
    label: "SYSTEM",
    color: "text-green-400",
    glow: "shadow-[0_0_6px_rgba(74,222,128,0.6)]",
  },
  admin: {
    label: "ADMIN",
    color: "text-purple-400",
    glow: "shadow-[0_0_6px_rgba(168,85,247,0.6)]",
  },
  event: {
    label: "EVENT",
    color: "text-blue-400",
    glow: "shadow-[0_0_6px_rgba(96,165,250,0.6)]",
  },
  alert: {
    label: "ALERT",
    color: "text-red-400",
    glow: "shadow-[0_0_6px_rgba(248,113,113,0.6)]",
  },
};

/* ==============================
   COMPONENT
============================== */
export default function RouletteLogs({ logs }: Props) {
  const [filter, setFilter] = useState<LogLevel | "all">("all");

  /* ==============================
     FILTERED LOGS
  ============================== */
  const filteredLogs = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter((l) => l.level === filter);
  }, [logs, filter]);

  return (
    <div className="bg-[#1A1B23] rounded-2xl border border-gray-800 shadow overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0F172A]">
        
        {/* TITLE */}
        <div className="flex items-center gap-2 text-gray-300 text-sm font-semibold tracking-wide">
          <TerminalSquare size={16} />
          ENGINE LOGS
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">

          {/* FILTER */}
          <div className="flex items-center gap-1 text-xs">
            <Filter size={14} className="text-gray-500" />

            {["all", "system", "admin", "event", "alert"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl as any)}
                className={`px-2 py-0.5 rounded transition ${
                  filter === lvl
                    ? "bg-[#7A6BFA] text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* STATUS */}
          <div className="text-xs text-green-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-md" />
            Live
          </div>
        </div>
      </div>

      {/* ================= LOGS ================= */}
      <div className="relative max-h-80 overflow-y-auto font-mono text-xs px-4 py-3 space-y-2">

        {/* FADE EFFECT TOP */}
        <div className="pointer-events-none absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-[#1A1B23] to-transparent z-10" />

        {/* EMPTY */}
        {filteredLogs.length === 0 && (
          <div className="text-gray-500 text-center py-6">
            No hay actividad aún
          </div>
        )}

        {/* LOG ITEMS */}
        {filteredLogs.map((log) => {
          const style = levelStyles[log.level];

          return (
            <div
              key={log.id}
              className="flex gap-3 text-gray-400 hover:bg-[#0F172A]/50 px-2 py-1 rounded transition group"
            >
              {/* TIME */}
              <span className="text-gray-600 min-w-[75px] group-hover:text-gray-400 transition">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>

              {/* LEVEL */}
              <span
                className={`${style.color} font-semibold ${style.glow}`}
              >
                {style.label}:
              </span>

              {/* MESSAGE */}
              <span className="text-gray-300 break-words leading-relaxed">
                {log.message}
              </span>
            </div>
          );
        })}

        {/* FADE EFFECT BOTTOM */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-[#1A1B23] to-transparent" />
      </div>

      {/* ================= FOOTER ================= */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800 bg-[#0F172A] text-xs text-gray-500">
        <span>{filteredLogs.length} registros</span>

        <button
          onClick={() => console.log("clear logs hook pending")}
          className="flex items-center gap-1 hover:text-red-400 transition"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>
    </div>
  );
}