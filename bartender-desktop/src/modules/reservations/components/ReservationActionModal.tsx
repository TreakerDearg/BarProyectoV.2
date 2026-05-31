"use client";

import {
  X,
  User,
  Phone,
  Users,
  Calendar,
  Crown,
  Wallet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pencil,
  Trash2,
  Check,
  MessageCircle
} from "lucide-react";
import type { Reservation } from "../types/reservation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  reservation: Reservation;
  onClose: () => void;
  onStatusChange: (status: Reservation["status"]) => void;
  onEdit: () => void;
  onDelete: () => void;
  onWhatsapp?: (r: Reservation) => void;
}

export default function ReservationActionModal({
  reservation,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
  onWhatsapp,
}: Props) {
  const startTime = new Date(reservation.startTime);
  const timeStr = isNaN(startTime.getTime()) ? "--:--" : format(startTime, "HH:mm 'hs'", { locale: es });
  const dateStr = isNaN(startTime.getTime()) ? "---" : format(startTime, "EEEE dd 'de' MMMM", { locale: es });

  // Calculador de alerta de retraso (si ya pasó la hora y sigue pendiente/confirmada)
  const now = new Date();
  const isDelayed = (reservation.status === "pending" || reservation.status === "confirmed") && 
                    !isNaN(startTime.getTime()) && 
                    (now.getTime() - startTime.getTime()) > 15 * 60 * 1000;
  const delayMinutes = isDelayed ? Math.floor((now.getTime() - startTime.getTime()) / (60 * 1000)) : 0;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 md:p-8 animate-fade-in">
      
      {/* Background luxury glows */}
      <div className="fixed top-1/4 left-1/4 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[100px] -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand/10 rounded-full blur-[100px] -z-10" />

      <div
        className={`
          w-full max-w-2xl bg-surface-2 rounded-[2.5rem] overflow-hidden shadow-royale border border-white/5
          ${reservation.isVIP ? 'border-gold/30' : ''}
          transition-all duration-500 animate-float
        `}
      >
        {/* TOP VIP HIGHLIGHT BAR */}
        <div className={`h-2.5 w-full ${reservation.isVIP ? 'bg-grad-gold' : isDelayed ? 'bg-red-500' : 'bg-gold-soft'} shadow-lg`} />

        {/* MODAL HEADER */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-surface-3">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${reservation.isVIP ? 'bg-grad-gold text-bg shadow-gold-glow scale-110' : 'bg-surface-4 text-gold border border-white/5'}`}>
              <Crown size={28} className={reservation.isVIP ? 'fill-current' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">
                  {reservation.customerName}
                </h2>
                {reservation.isVIP && (
                  <span className="text-[8px] font-black tracking-widest uppercase bg-gold/20 text-gold px-2 py-0.5 rounded border border-gold/30">
                    VIP GOLD
                  </span>
                )}
              </div>
              <p className="text-[9px] text-muted font-black uppercase tracking-[0.4em] mt-1.5">
                Centro de Operaciones · Mesa {reservation.tableId && typeof reservation.tableId === 'object' ? reservation.tableId.number : 'Sin Asignar'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10 hover:border-gold-border text-muted hover:text-gold transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-8 space-y-8 bg-[radial-gradient(circle_at_top_right,rgba(212,163,64,0.02)_0%,transparent_50%)]">
          
          {/* RETRASO ALARM PANEL */}
          {isDelayed && (
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-center justify-between text-red-400">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="animate-pulse text-red-500" />
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-wider">Cliente Atrasado</p>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Límite de espera de 15 minutos superado</p>
                </div>
              </div>
              <span className="bg-red-500/20 text-white text-xs font-black uppercase px-3 py-1.5 rounded-xl border border-red-500/30">
                +{delayMinutes} Minutos Tarde
              </span>
            </div>
          )}

          {/* LOGISTICS CARDS GRID */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* DATE & TIME CARD */}
            <div className="bg-surface-3/50 border border-white/5 rounded-3xl p-5 space-y-3">
              <p className="text-[8px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={12} className="text-gold" />
                Día y Horario
              </p>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">{dateStr}</p>
                <p className="text-lg font-black text-grad-gold tracking-wider mt-1">{timeStr}</p>
              </div>
            </div>

            {/* GUESTS & TABLE CARD */}
            <div className="bg-surface-3/50 border border-white/5 rounded-3xl p-5 space-y-3">
              <p className="text-[8px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5">
                <Users size={12} className="text-gold" />
                Detalle Asignación
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">{reservation.guests} Invitados</p>
                  <p className="text-base font-black text-white/80 mt-1 uppercase tracking-widest">
                    {reservation.tableId && typeof reservation.tableId === 'object'
                      ? `Mesa ${reservation.tableId.number} (${(reservation.tableId as any).location})`
                      : "Sin Asignar"}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* QUICK INFOS DIRECTORY */}
          <div className="space-y-3 bg-black/20 p-6 rounded-[2rem] border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted font-bold uppercase tracking-wider flex items-center gap-2">
                <Phone size={14} className="text-gold" /> Teléfono
              </span>
              <span className="text-white font-black tracking-wider">{reservation.customerPhone}</span>
            </div>
            {reservation.customerEmail && (
              <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                <span className="text-muted font-bold uppercase tracking-wider flex items-center gap-2">
                  <User size={14} className="text-gold" /> Email
                </span>
                <span className="text-white font-black tracking-wider">{reservation.customerEmail}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
              <span className="text-muted font-bold uppercase tracking-wider flex items-center gap-2">
                <Wallet size={14} className="text-gold" /> Garantía de Depósito
              </span>
              <span className={`font-black ${reservation.deposit && reservation.deposit > 0 ? 'text-green-light' : 'text-white/40'}`}>
                {reservation.deposit && reservation.deposit > 0 ? `$${reservation.deposit}` : "Sin Garantía ($0)"}
              </span>
            </div>
            {reservation.notes && (
              <div className="pt-3 border-t border-white/5 text-left">
                <span className="text-[8px] font-black text-muted uppercase tracking-widest block mb-1">Notas especiales de servicio</span>
                <p className="text-xs text-muted italic leading-relaxed">"{reservation.notes}"</p>
              </div>
            )}
          </div>

          {/* DYNAMIC PROGRESS TIMELINE */}
          <div className="space-y-4">
            <p className="text-[8px] font-black text-muted uppercase tracking-widest text-left">Línea de Proceso de la Reserva</p>
            <div className="flex items-center justify-between bg-black/10 p-4 rounded-2xl border border-white/5 relative">
              <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
              
              <TimelineStep 
                label="Confirmada" 
                active={reservation.status === "confirmed" || reservation.status === "seated" || reservation.status === "completed"} 
                current={reservation.status === "confirmed"} 
              />
              <TimelineStep 
                label="En Mesa" 
                active={reservation.status === "seated" || reservation.status === "completed"} 
                current={reservation.status === "seated"} 
              />
              <TimelineStep 
                label="Finalizada" 
                active={reservation.status === "completed"} 
                current={reservation.status === "completed"} 
              />
            </div>
          </div>

          {/* FOOLPROOF MAIN HOST ACTION CENTER (GIANT BUTTONS) */}
          <div className="space-y-4 pt-2">
            <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em] text-center">Acciones Rápidas del Anfitrión (Hostess)</p>
            
            <div className="grid grid-cols-2 gap-4">
              
              {/* GREEN ACTION: SEAT CLIENT */}
              {(reservation.status === "pending" || reservation.status === "confirmed") && (
                <button
                  type="button"
                  onClick={() => onStatusChange("seated")}
                  className="col-span-2 h-20 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400/20 text-white rounded-3xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] shadow-[0_15px_30px_rgba(16,185,129,0.3)] active:scale-95 group"
                >
                  <CheckCircle2 size={26} className="group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="text-sm font-black uppercase tracking-widest leading-none">SENTAR CLIENTE EN MESA</p>
                    <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-1">Activar mesa en el plano del salón</p>
                  </div>
                </button>
              )}

              {/* WHATSAPP ACTION BUTTON */}
              {onWhatsapp && (reservation.status === "pending" || reservation.status === "confirmed") && (
                <button
                  type="button"
                  onClick={() => onWhatsapp(reservation)}
                  className="col-span-2 h-16 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] font-black text-xs uppercase tracking-widest active:scale-95 shadow-[0_10px_20px_rgba(16,185,129,0.05)]"
                >
                  <MessageCircle size={18} className="fill-current text-emerald-400" />
                  ENVIAR CONFIRMACIÓN POR WHATSAPP
                </button>
              )}

              {/* CONFIRM RESERVATION */}
              {reservation.status === "pending" && (
                <button
                  type="button"
                  onClick={() => onStatusChange("confirmed")}
                  className="h-16 bg-gold hover:bg-gold-hover text-bg rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] font-black text-xs uppercase tracking-widest active:scale-95 shadow-[0_10px_20px_rgba(212,163,64,0.2)]"
                >
                  <Check size={18} className="stroke-[3]" />
                  CONFIRMAR ASISTENCIA
                </button>
              )}

              {/* NO SHOW ACTION */}
              {(reservation.status === "pending" || reservation.status === "confirmed") && (
                <button
                  type="button"
                  onClick={() => onStatusChange("no-show")}
                  className={`h-16 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] font-black text-xs uppercase tracking-widest active:scale-95 ${reservation.status === 'pending' ? 'col-span-2' : ''}`}
                >
                  <AlertCircle size={18} />
                  NO ASISTIÓ (NO-SHOW)
                </button>
              )}

              {/* CANCEL RESERVATION */}
              {(reservation.status === "pending" || reservation.status === "confirmed") && (
                <button
                  type="button"
                  onClick={() => onStatusChange("cancelled")}
                  className="h-16 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] font-black text-xs uppercase tracking-widest active:scale-95 col-span-2"
                >
                  <XCircle size={18} />
                  ANULAR RESERVACIÓN (CANCELAR)
                </button>
              )}

              {/* FINISH/COMPLETE RESERVATION */}
              {reservation.status === "seated" && (
                <button
                  type="button"
                  onClick={() => onStatusChange("completed")}
                  className="col-span-2 h-16 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] font-black text-xs uppercase tracking-widest active:scale-95"
                >
                  <CheckCircle2 size={18} />
                  COMPLETAR Y LIBERAR MESA
                </button>
              )}

            </div>
          </div>

        </div>

        {/* BOTTOM METRICS & SYSTEM CONFIG CONTROLS */}
        <div className="p-6 bg-surface-3 border-t border-white/10 flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={onDelete}
            className="p-4 rounded-xl text-red-500 hover:text-white hover:bg-red-500/15 transition-all"
            title="Borrar Registro Permanentemente"
          >
            <Trash2 size={18} />
          </button>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onEdit}
              className="h-12 px-6 rounded-xl border border-white/15 hover:border-gold/40 text-muted hover:text-gold transition-all text-xs font-black uppercase tracking-wider flex items-center gap-2"
            >
              <Pencil size={14} />
              MODIFICAR DATOS
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-6 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-black uppercase tracking-widest border border-white/5 transition-all"
            >
              CERRAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineStep({ label, active, current }: { label: string; active: boolean; current: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 relative z-10">
      <div 
        className={`
          w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300
          ${current 
            ? 'bg-gold border-transparent text-bg shadow-gold-glow scale-110' 
            : active 
            ? 'bg-gold/15 border-gold text-gold' 
            : 'bg-surface-3 border-white/10 text-muted/30'
          }
        `}
      >
        {active && !current ? <Check size={14} className="stroke-[3]" /> : <div className="w-2 h-2 rounded-full bg-current" />}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-wider ${current ? 'text-gold' : active ? 'text-white/80' : 'text-muted/40'}`}>
        {label}
      </span>
    </div>
  );
}
