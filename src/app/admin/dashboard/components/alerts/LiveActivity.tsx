"use client";

import { Activity, Clock, ArrowUpRight, Zap, Users } from "lucide-react";

interface Props {
  reservations?: any[];
}

export default function LiveActivity({ reservations = [] }: Props) {
  const activities = reservations.map((res: any) => ({
    title: "Nueva Reserva VIP",
    desc: `${res.name} · ${res.partySize} Pax`,
    time: new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    icon: <Users size={12} />,
    color: "text-emerald-400 bg-emerald-400/10 shadow-emerald-400/20"
  }));

  if (activities.length === 0) {
    activities.push({
      title: "Sistema en Modo Espera",
      desc: "Esperando nuevas solicitudes...",
      time: "AHORA",
      icon: <Activity size={12} />,
      color: "text-muted bg-white/5"
    });
  }

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      <div className="flex-1 space-y-8">
        {activities.map((act, i) => (
          <div key={i} className="flex gap-6 relative group cursor-default">
            {/* LINK LINE */}
            {i !== activities.length - 1 && (
              <div className="absolute left-6 top-10 bottom-[-2rem] w-px bg-white/5 group-hover:bg-gold/20 transition-colors" />
            )}
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5 transition-all group-hover:scale-110 ${act.color}`}>
              {act.icon}
            </div>
            
            <div className="pt-1">
              <div className="flex items-center gap-3">
                 <p className="text-xs font-black text-ivory uppercase tracking-tighter group-hover:text-gold transition-colors">{act.title}</p>
                 <ArrowUpRight size={10} className="text-muted opacity-0 group-hover:opacity-100 transition-all" />
              </div>
              <div className="flex gap-3 text-[9px] font-black text-muted uppercase tracking-widest mt-1.5">
                <span>{act.desc}</span>
                <span className="opacity-20">|</span>
                <span className="text-gold/50">{act.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
