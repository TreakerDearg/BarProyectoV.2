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
  Calendar,
  AlertCircle,
  Crown,
  Wallet,
  Globe,
  MessageCircle
} from "lucide-react";
import type { Reservation } from "../types/reservation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

interface Props {
  r: Reservation;
  highlighted?: boolean;
  onSeat?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
  onWhatsapp?: (r: Reservation) => void;
}

const statusConfig: any = {
  pending: {
    label: "Por Confirmar",
    badge: "badge-ember",
    glow: "shadow-ember/30",
    icon: <Clock size={16} className="animate-pulse" />,
    bg: "bg-ember/10",
    accent: "text-orange-light",
  },
  confirmed: {
    label: "Confirmada",
    badge: "badge-gold",
    glow: "shadow-gold/30",
    icon: <ShieldCheck size={16} />,
    bg: "bg-gold/10",
    accent: "text-gold",
  },
  seated: {
    label: "En Mesa",
    badge: "badge-lime",
    glow: "shadow-lime/30",
    icon: <Zap size={16} />,
    bg: "bg-lime/10",
    accent: "text-green-light",
  },
  completed: {
    label: "Finalizada",
    badge: "badge-neutral",
    glow: "",
    icon: <CheckCircle2 size={16} />,
    bg: "bg-white/5",
    accent: "text-muted",
  },
  cancelled: {
    label: "Cancelada",
    badge: "badge-red",
    glow: "",
    icon: <X size={16} />,
    bg: "bg-red/10",
    accent: "text-red-light",
  },
};

export default function ReservationCard({
  r,
  highlighted,
  onSeat,
  onDelete,
  onWhatsapp,
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

  // Tolerance countdown progress bar (15 minutes limit)
  const elapsedMs = now.getTime() - startTime.getTime();
  const elapsedMin = elapsedMs / (60 * 1000);
  const isInTolerance = (r.status === "pending" || r.status === "confirmed") && 
                        !isNaN(startTime.getTime()) && 
                        elapsedMin >= 0 && elapsedMin <= 15;
  const toleranceRemaining = 15 - elapsedMin;
  const tolerancePercent = Math.max(0, Math.min(100, (toleranceRemaining / 15) * 100));

  let toleranceColor = "bg-emerald-500";
  let toleranceGlow = "shadow-emerald-500/30";
  if (tolerancePercent < 33) {
    toleranceColor = "bg-red-500 animate-pulse";
    toleranceGlow = "shadow-red-500/40";
  } else if (tolerancePercent < 66) {
    toleranceColor = "bg-amber-500";
    toleranceGlow = "shadow-amber-500/30";
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`
        p-0 rounded-[2rem] transition-all duration-300
        group relative overflow-hidden flex flex-col cursor-pointer
        hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        ${config.glow}
        ${r.isVIP 
          ? 'bg-gradient-to-br from-violet-950/30 via-[#0d091a] to-purple-950/30 border-gold/30 shadow-[0_0_20px_rgba(139,92,246,0.1)] hover:border-gold hover:shadow-[0_0_30px_rgba(212,163,64,0.2)] ring-1 ring-gold/20' 
          : 'glass border-white/5'
        }
        ${isDelayed ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] ring-1 ring-red-500/20' : ''}
        ${highlighted ? 'ring-2 ring-violet-400/50 border-violet-400/40' : ''}
      `}
      onClick={onClick}
    >

      {/* STATUS BAR */}
      <div className={`h-1.5 w-full ${isDelayed ? 'bg-red-500' : r.isVIP ? 'bg-gradient-to-r from-gold via-violet-500 to-gold' : config.bg.replace('bg-', 'bg-').replace('/10', '')} opacity-50`} />

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

      {/* TOLERANCE PROGRESS BAR STRIP */}
      {isInTolerance && !isDelayed && (
        <div className="bg-emerald-500/5 border-b border-white/5 px-8 py-2.5 flex flex-col gap-1.5 z-10 text-left">
          <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase text-muted">
            <span className="flex items-center gap-1.5">
              <Clock size={10} className="text-emerald-400" />
              Tolerancia de Espera
            </span>
            <span className="text-ivory">{Math.ceil(toleranceRemaining)} MIN RESTANTES</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${toleranceColor} ${toleranceGlow}`}
              style={{ width: `${tolerancePercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="p-6 space-y-5 relative">
        {/* HEADER */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-ivory tracking-tighter uppercase group-hover:text-gold transition-all duration-300">
                {r.customerName}
              </h3>
              {(r as any).isVIP && (
                <div className="p-1.5 bg-grad-gold rounded-lg shadow-gold-glow">
                  <Crown size={14} className="text-bg" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-muted font-black tracking-widest uppercase bg-surface-4/80 px-3 py-1.5 rounded-xl border border-white/5">
                <Phone size={14} className="text-gold" />
                {r.customerPhone}
              </div>
              {r.isVIP && (
                <div className="flex items-center gap-2 text-xs text-gold font-black tracking-widest uppercase bg-gold/10 px-3 py-1.5 rounded-xl border border-gold/20">
                  <Crown size={14} />
                  VIP
                </div>
              )}
              {r.deposit && r.deposit > 0 && (
                <div className="flex items-center gap-2 text-xs text-green-light font-black tracking-widest uppercase bg-green/10 px-3 py-1.5 rounded-xl border border-green/20">
                  <Wallet size={14} />
                  ${r.deposit}
                </div>
              )}
              {r.source && r.source !== 'admin' && (
                <div className="flex items-center gap-2 text-xs text-blue-light font-black tracking-widest uppercase bg-blue/10 px-3 py-1.5 rounded-xl border border-blue/20">
                  <Globe size={14} />
                  {r.source === 'web' ? 'Web' : 'App'}
                </div>
              )}
            </div>
          </div>
          <div className={`badge ${config.badge} flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg border border-white/10 backdrop-blur-md`}>
            {config.icon}
            {config.label}
          </div>
        </div>

        {/* DATE & TIME */}
        <div className="bg-surface-3/30 rounded-[1.5rem] p-4 border border-white/5 space-y-3 group-hover:border-gold/20 transition-colors">
          <div className="flex items-center gap-3 text-muted">
            <Calendar size={16} className="text-gold opacity-50" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">{dateStr}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] mb-1">Check-in</p>
              <p className={`text-2xl font-black tracking-widest ${config.accent}`}>{timeStr}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] mb-1">Invitados</p>
              <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
                <Users size={18} className="text-gold" />
                <span className="text-xl font-black text-ivory">{r.guests}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE & ACTIONS */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-grad-dark border border-white/10 flex items-center justify-center shadow-lg group-hover:border-gold/60 transition-all">
              <span className="text-xl font-black text-grad-gold">
                {r.tableId && typeof r.tableId === 'object' ? r.tableId.number : '--'}
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Asignación</p>
              <p className="text-sm font-black text-ivory uppercase tracking-widest">
                {r.tableId && typeof r.tableId === 'object' 
                  ? `Mesa ${r.tableId.number} · ${(r.tableId as any).location || 'Indoor'}` 
                  : r.tableId 
                  ? 'Mesa Asignada' 
                  : 'Pendiente'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(r._id!);
                }}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-red-500/20 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 active:scale-90 shadow-md"
                title="Eliminar Registro"
              >
                <Trash2 size={18} />
              </button>
            )}

            {onWhatsapp && (r.status === "pending" || r.status === "confirmed") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWhatsapp(r);
                }}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-emerald-500/20 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20 active:scale-90 shadow-md"
                title="Enviar confirmación por WhatsApp"
              >
                <MessageCircle size={18} className="fill-current text-emerald-500 hover:text-emerald-400" />
              </button>
            )}

            {(r.status === "pending" || r.status === "confirmed") && onSeat && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSeat(r._id!);
                }}
                className="btn btn-gold !h-11 !px-6 !rounded-xl gap-2 text-xs shadow-gold/20 hover:shadow-gold/40 border-gold/40 group/btn"
              >
                SENTAR
                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* NOTES STRIP */}
        {r.notes && (
          <div className="pt-4 border-t border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-surface-4 border border-white/5 shadow-inner">
              <AlertCircle size={14} className="text-gold opacity-60" />
            </div>
            <p className="text-sm text-muted italic line-clamp-2 leading-relaxed font-medium flex-1">
              {r.notes}
            </p>
          </div>
        )}

        {/* TAGS STRIP */}
        {r.tags && r.tags.length > 0 && (
          <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
            {r.tags.map((tag, idx) => (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
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
    </motion.div>
  );
}