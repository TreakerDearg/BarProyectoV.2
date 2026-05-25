"use client";

import { 
  Users, 
  Clock, 
  ChevronRight, 
  Phone, 
  Trash2, 
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  Club,
  Spade,
  Heart,
  Diamond,
  Calendar,
  AlertCircle,
  Crown,
  Wallet,
  Globe
} from "lucide-react";
import type { Reservation } from "../types/reservation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  r: Reservation;
  highlighted?: boolean;
  onSeat?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

const statusConfig: any = {
  pending: {
    label: "Por Confirmar",
    badge: "badge-ember",
    glow: "shadow-ember/40",
    icon: <Clock size={14} className="animate-pulse" />,
    bg: "bg-ember/10",
    accent: "text-orange-light",
    suit: <Spade size={24} className="opacity-10 absolute -right-2 -bottom-2 rotate-12" />,
  },
  confirmed: {
    label: "Confirmada",
    badge: "badge-gold",
    glow: "shadow-gold/40",
    icon: <ShieldCheck size={14} />,
    bg: "bg-gold/10",
    accent: "text-gold",
    suit: <Diamond size={24} className="opacity-10 text-gold absolute -right-2 -bottom-2 rotate-12" />,
  },
  seated: {
    label: "En Mesa",
    badge: "badge-lime",
    glow: "shadow-lime/40",
    icon: <Zap size={14} />,
    bg: "bg-lime/10",
    accent: "text-green-light",
    suit: <Club size={24} className="opacity-10 text-green absolute -right-2 -bottom-2 rotate-12" />,
  },
  completed: {
    label: "Finalizada",
    badge: "badge-neutral",
    glow: "",
    icon: <CheckCircle2 size={14} />,
    bg: "bg-white/5",
    accent: "text-muted",
    suit: <Heart size={24} className="opacity-5 absolute -right-2 -bottom-2 rotate-12" />,
  },
  cancelled: {
    label: "Cancelada",
    badge: "badge-red",
    glow: "",
    icon: <X size={14} />,
    bg: "bg-red/10",
    accent: "text-red-light",
    suit: <Heart size={24} className="opacity-10 text-red absolute -right-2 -bottom-2 rotate-12" />,
  },
};

export default function ReservationCard({
  r,
  highlighted,
  onSeat,
  onDelete,
  onClick,
}: Props) {
  const config = statusConfig[r.status] || statusConfig.pending;
  const startTime = new Date(r.startTime);
  const timeStr = isNaN(startTime.getTime()) ? "--:--" : format(startTime, "HH:mm 'hs'", { locale: es });
  const dateStr = isNaN(startTime.getTime()) ? "---" : format(startTime, "EEEE dd 'de' MMMM", { locale: es });

  const now = new Date();
  const isDelayed = (r.status === "pending" || r.status === "confirmed") && 
                    !isNaN(startTime.getTime()) && 
                    (now.getTime() - startTime.getTime()) > 15 * 60 * 1000;
  const delayMinutes = isDelayed ? Math.floor((now.getTime() - startTime.getTime()) / (60 * 1000)) : 0;

  return (
    <div
      className={`
        glass p-0 rounded-[2.5rem] border border-white/5 transition-all duration-500
        group relative overflow-hidden flex flex-col cursor-pointer
        hover:translate-y-[-8px] hover:shadow-[0_30px_70px_rgba(0,0,0,0.7)]
        active:scale-[0.97]
        ${config.glow}
        ${isDelayed ? 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20' : ''}
        ${highlighted ? 'ring-2 ring-violet-400/50 border-violet-400/40' : ''}
      `}
      onClick={onClick}
    >
      {/* CASINO DECOR BAR */}
      <div className={`h-2.5 w-full ${isDelayed ? 'bg-red-500' : config.bg.replace('bg-', 'bg-').replace('/10', '')} opacity-60 shadow-lg`} />

      {/* DELAY ALARM STRIP */}
      {isDelayed && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-8 py-2.5 flex items-center justify-between text-red-400 text-[10px] font-black tracking-widest uppercase z-10">
          <div className="flex items-center gap-2">
            <AlertCircle size={12} className="animate-pulse text-red-500" />
            <span>Alerta de Retraso</span>
          </div>
          <span className="bg-red-500/20 px-2 py-0.5 rounded text-white font-black">+{delayMinutes} MIN</span>
        </div>
      )}

      <div className="p-8 space-y-7 relative">
        
        {/* BACKGROUND SUIT */}
        {config.suit}

        {/* HEADER */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-ivory tracking-tighter uppercase group-hover:text-gold transition-all duration-500 group-hover:tracking-normal">
                {r.customerName}
              </h3>
              {(r as any).isVIP && (
                <div className="p-1.5 bg-grad-gold rounded-lg shadow-gold-glow animate-pulse">
                  <Crown size={12} className="text-bg" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 text-[10px] text-muted font-black tracking-widest uppercase bg-surface-4/80 px-3 py-1.5 rounded-xl border border-white/5">
                <Phone size={12} className="text-gold" />
                {r.customerPhone}
              </div>
              {r.isVIP && (
                <div className="flex items-center gap-2 text-[10px] text-gold font-black tracking-widest uppercase bg-gold/10 px-3 py-1.5 rounded-xl border border-gold/20">
                  <Crown size={12} />
                  VIP
                </div>
              )}
              {r.deposit && r.deposit > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-green-light font-black tracking-widest uppercase bg-green/10 px-3 py-1.5 rounded-xl border border-green/20">
                  <Wallet size={12} />
                  ${r.deposit}
                </div>
              )}
              {r.source && r.source !== 'admin' && (
                <div className="flex items-center gap-2 text-[10px] text-blue-light font-black tracking-widest uppercase bg-blue/10 px-3 py-1.5 rounded-xl border border-blue/20">
                  <Globe size={12} />
                  {r.source === 'web' ? 'Web' : 'App'}
                </div>
              )}
            </div>
          </div>
          <div className={`badge ${config.badge} flex items-center gap-3 py-2.5 px-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/10 backdrop-blur-md`}>
            {config.icon}
            {config.label}
          </div>
        </div>

        {/* DATE & TIME (CASINO TOKEN STYLE) */}
        <div className="bg-surface-3/30 rounded-[2rem] p-5 border border-white/5 space-y-4 group-hover:border-gold/20 transition-colors">
          <div className="flex items-center gap-3 text-muted">
            <Calendar size={14} className="text-gold opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">{dateStr}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[9px] text-muted font-black uppercase tracking-[0.4em] mb-1">Check-in</p>
              <p className={`text-2xl font-black tracking-widest ${config.accent}`}>{timeStr}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="text-[9px] text-muted font-black uppercase tracking-[0.4em] mb-1">Invitados</p>
              <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-2xl border border-white/5">
                <Users size={16} className="text-gold" />
                <span className="text-lg font-black text-ivory">{r.guests}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE & ACTIONS */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-grad-dark border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-gold/60 transition-all -rotate-3 group-hover:rotate-0">
              <span className="text-xl font-black text-grad-gold">
                {r.tableId && typeof r.tableId === 'object' ? r.tableId.number : '--'}
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] text-muted font-black uppercase tracking-[0.2em]">Asignación</p>
              <p className="text-xs font-black text-ivory uppercase tracking-widest">
                {r.tableId && typeof r.tableId === 'object' 
                  ? `Mesa ${r.tableId.number} · ${(r.tableId as any).location || 'Indoor'}` 
                  : r.tableId 
                  ? 'Mesa Asignada' 
                  : 'Pendiente'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(r._id!);
                }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-red-500/20 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 active:scale-90 shadow-lg"
                title="Eliminar Registro"
              >
                <Trash2 size={20} />
              </button>
            )}

            {(r.status === "pending" || r.status === "confirmed") && onSeat && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSeat(r._id!);
                }}
                className="btn btn-gold !h-12 !px-8 !rounded-2xl gap-3 text-xs shadow-gold/20 hover:shadow-gold/40 border-gold/40 group/btn"
              >
                SENTAR
                <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* NOTES STRIP */}
        {r.notes && (
          <div className="pt-6 border-t border-white/10 flex items-start gap-4">
            <div className="p-2 rounded-xl bg-surface-4 border border-white/5 shadow-inner">
              <AlertCircle size={14} className="text-gold opacity-60" />
            </div>
            <p className="text-xs text-muted italic line-clamp-2 leading-relaxed font-medium flex-1">
              {r.notes}
            </p>
          </div>
        )}

        {/* TAGS STRIP */}
        {r.tags && r.tags.length > 0 && (
          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-2">
            {r.tags.map((tag, idx) => (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                  tag.priority === 'high' 
                    ? 'bg-red/10 text-red-light border-red/20' 
                    : tag.priority === 'medium'
                    ? 'bg-orange/10 text-orange-light border-orange/20'
                    : 'bg-white/5 text-muted border-white/10'
                }`}
              >
                {tag.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CASINO GLOW DECOR */}
      <div className={`absolute -bottom-32 -right-32 w-64 h-64 ${config.bg.replace('bg-', 'bg-').replace('/10', '')} opacity-0 group-hover:opacity-10 blur-[120px] transition-all duration-1000`} />
    </div>
  );
}