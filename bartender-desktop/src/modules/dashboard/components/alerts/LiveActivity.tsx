"use client";

import type { ReactNode } from "react";
import { Activity, ArrowUpRight, Users, Gift, Package } from "lucide-react";
import type { LiveActivityItem } from "../../store/dashboardStore";

interface Props {
  activities?: LiveActivityItem[];
  reservations?: { name?: string; partySize?: number; startTime?: string }[];
}

const typeStyles: Record<
  LiveActivityItem["type"],
  { color: string; defaultIcon: ReactNode }
> = {
  reservation: {
    color: "text-emerald-400 bg-emerald-400/10",
    defaultIcon: <Users size={12} />,
  },
  order: {
    color: "text-violet-300 bg-violet-500/10",
    defaultIcon: <Activity size={12} />,
  },
  discount: {
    color: "text-gold bg-gold/10",
    defaultIcon: <Gift size={12} />,
  },
  inventory: {
    color: "text-red bg-red/10",
    defaultIcon: <Package size={12} />,
  },
  system: {
    color: "text-muted bg-white/5",
    defaultIcon: <Activity size={12} />,
  },
};

export default function LiveActivity({
  activities = [],
  reservations = [],
}: Props) {
  let list: LiveActivityItem[] = activities;

  if (list.length === 0 && reservations.length > 0) {
    list = reservations.map((res, i) => ({
      id: `res-fallback-${i}`,
      title: "Reserva",
      desc: `${res.name ?? "Cliente"} · ${res.partySize ?? "?"} personas`,
      time: res.startTime
        ? new Date(res.startTime).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
      type: "reservation",
    }));
  }

  if (list.length === 0) {
    list = [
      {
        id: "idle",
        title: "En espera",
        desc: "Sin actividad reciente",
        time: "Ahora",
        type: "system",
      },
    ];
  }

  return (
    <div className="space-y-5" data-tutorial="live-activity">
      {list.map((act, i) => {
        const style = typeStyles[act.type] ?? typeStyles.system;
        return (
          <div key={act.id} className="flex gap-4 relative group">
            {i !== list.length - 1 && (
              <div className="absolute left-5 top-10 bottom-[-1rem] w-px bg-white/5" />
            )}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 ${style.color}`}
            >
              {style.defaultIcon}
            </div>
            <div className="pt-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-ivory truncate">
                  {act.title}
                </p>
                <ArrowUpRight
                  size={10}
                  className="text-muted opacity-0 group-hover:opacity-100 shrink-0"
                />
              </div>
              <p className="text-[11px] text-muted mt-0.5 truncate">
                {act.desc}
                <span className="mx-1.5 opacity-30">·</span>
                <span className="text-violet-300/80">{act.time}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
