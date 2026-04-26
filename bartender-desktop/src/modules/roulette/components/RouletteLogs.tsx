"use client";

import {
  TerminalSquare,
  Trash2,
  Filter,
} from "lucide-react";
import { useMemo, useState } from "react";

/* ============================== */
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

/* ============================== */
/* STYLES OBSIDIAN */
const levelStyles: Record<
  LogLevel,
  {
    label: string;
    color: string;
    bar: string;
  }
> = {
  system: {
    label: "SYS",
    color: "text-cyan-400",
    bar: "bg-cyan-400",
  },
  admin: {
    label: "ADM",
    color: "text-purple-400",
    bar: "bg-purple-400",
  },
  event: {
    label: "EVT",
    color: "text-blue-400",
    bar: "bg-blue-400",
  },
  alert: {
    label: "ERR",
    color: "text-red-400",
    bar: "bg-red-400",
  },
};

/* ============================== */
/* COMPONENT */
export default function RouletteLogs({ logs }: Props) {
  const [filter, setFilter] = useState<LogLevel | "all">("all");

  const filteredLogs = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter((l) => l.level === filter);
  }, [logs, filter]);

  return (
    <div className="relative rounded-2xl border border-blue-900/40 bg-gradient-to-b from-[#05070D] to-[#0A0F1C] shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">

      {/* GLOW OVERLAY */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent" />

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-900/30 bg-[#060A14] backdrop-blur">

        <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold tracking-widest">
          <TerminalSquare size={16} />
          SYSTEM LOG STREAM
        </div>

        <div className="flex items-center gap-4">

          {/* FILTER */}
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest">
            <Filter size={12} className="text-gray-500" />

            {["all", "system", "admin", "event", "alert"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl as any)}
                className={`px-2 py-1 rounded transition ${
                  filter === lvl
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* LIVE STATUS */}
          <div className="flex items-center gap-2 text-[10px] text-green-400 font-semibold tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            LIVE
          </div>
        </div>
      </div>

      {/* ================= LOG BODY ================= */}
      <div className="relative max-h-80 overflow-y-auto font-mono text-[11px] px-4 py-3 space-y-2">

        {/* FADE TOP */}
        <div className="pointer-events-none absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-[#05070D] to-transparent z-10" />

        {/* EMPTY */}
        {filteredLogs.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            No activity detected
          </div>
        )}

        {/* LOG ITEM */}
        {filteredLogs.map((log) => {
          const style = levelStyles[log.level];

          return (
            <div
              key={log.id}
              className="group flex items-start gap-3 px-2 py-1.5 rounded-md transition hover:bg-[#0A0F1C]/80"
            >
              {/* LEVEL BAR */}
              <div
                className={`w-[2px] h-full rounded ${style.bar} opacity-70 group-hover:opacity-100`}
              />

              {/* CONTENT */}
              <div className="flex flex-col flex-1">

                {/* HEADER LINE */}
                <div className="flex items-center gap-2">

                  {/* TIME */}
                  <span className="text-gray-600 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>

                  {/* LEVEL */}
                  <span
                    className={`${style.color} text-[10px] font-bold tracking-wider`}
                  >
                    {style.label}
                  </span>
                </div>

                {/* MESSAGE */}
                <span className="text-gray-300 leading-snug group-hover:text-white transition">
                  {log.message}
                </span>
              </div>
            </div>
          );
        })}

        {/* FADE BOTTOM */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-[#05070D] to-transparent" />
      </div>

      {/* ================= FOOTER ================= */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-blue-900/30 bg-[#060A14] text-[10px] text-gray-500 tracking-widest">

        <span>{filteredLogs.length} EVENTS</span>

        <button
          onClick={() => console.log("clear logs hook pending")}
          className="flex items-center gap-1 hover:text-red-400 transition"
        >
          <Trash2 size={12} />
          CLEAR
        </button>
      </div>
    </div>
  );
}