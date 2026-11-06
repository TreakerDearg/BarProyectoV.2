"use client";

/**
 * LiveActivity — Feed de actividad reciente en tiempo real.
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import type { ReactNode } from "react";
import { Activity, ArrowUpRight, Users, Gift, Package } from "lucide-react";
import type { LiveActivityItem } from "../../store/dashboardStore";

interface Props {
  activities?:  LiveActivityItem[];
  reservations?: { name?: string; partySize?: number; startTime?: string }[];
}

/* Configuración visual por tipo de evento */
const typeStyles: Record<LiveActivityItem["type"], { bg: string; border: string; color: string; icon: ReactNode }> = {
  reservation: {
    bg:     "bg-[#3FB950]/12",
    border: "border-[#3FB950]/20",
    color:  "text-[#3FB950]",
    icon:   <Users size={13} />,
  },
  order: {
    bg:     "bg-[#388BFD]/12",
    border: "border-[#388BFD]/20",
    color:  "text-[#388BFD]",
    icon:   <Activity size={13} />,
  },
  discount: {
    bg:     "bg-[#F0B429]/12",
    border: "border-[#F0B429]/20",
    color:  "text-[#F0B429]",
    icon:   <Gift size={13} />,
  },
  inventory: {
    bg:     "bg-[#F85149]/12",
    border: "border-[#F85149]/20",
    color:  "text-[#F85149]",
    icon:   <Package size={13} />,
  },
  system: {
    bg:     "bg-[#21283A]",
    border: "border-[#30363D]",
    color:  "text-[#8B949E]",
    icon:   <Activity size={13} />,
  },
};

export default function LiveActivity({ activities = [], reservations = [] }: Props) {
  let list: LiveActivityItem[] = activities;

  /* Fallback a reservaciones si no hay actividad */
  if (list.length === 0 && reservations.length > 0) {
    list = reservations.map((res, i) => ({
      id:    `res-fallback-${i}`,
      title: "Reserva",
      desc:  `${res.name ?? "Cliente"} · ${res.partySize ?? "?"} personas`,
      time:  res.startTime
        ? new Date(res.startTime).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
        : "—",
      type: "reservation",
    }));
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
        <div className="w-12 h-12 rounded-full bg-[#21283A] flex items-center justify-center border border-[#30363D]">
          <Activity size={20} className="text-[#566270]" />
        </div>
        <p className="text-sm font-semibold text-[#566270]">Sin actividad reciente</p>
        <p className="text-xs text-[#3D444D]">No hay eventos registrados en este momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((act, i) => {
        const s = typeStyles[act.type] ?? typeStyles.system;
        return (
          <div key={act.id} className="flex gap-3 relative group">
            {/* Línea conectora */}
            {i !== list.length - 1 && (
              <div className="absolute left-5 top-10 bottom-[-1rem] w-px bg-[#30363D]" />
            )}

            {/* Ícono del tipo */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${s.bg} ${s.border} ${s.color}`}>
              {s.icon}
            </div>

            {/* Contenido */}
            <div className="pt-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-[#E6EDF3] truncate">{act.title}</p>
                <ArrowUpRight
                  size={11}
                  className="text-[#566270] opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                />
              </div>
              <p className="text-xs text-[#566270] mt-0.5 truncate">
                {act.desc}
                <span className="mx-1.5 text-[#30363D]">·</span>
                <span className={s.color}>{act.time}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
