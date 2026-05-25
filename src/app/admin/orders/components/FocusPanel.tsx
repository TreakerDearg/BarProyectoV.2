"use client";

import { 
  ClipboardList, 
  Clock, 
  MessageSquare, 
  User, 
  Hash, 
  ChevronRight,
  Zap,
  Info,
  ShieldCheck,
  Timer,
  AlertTriangle,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  selectedItem: any;
}

export default function FocusPanel({ selectedItem }: Props) {
  if (!selectedItem) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center glass-royale rounded-[2.5rem] border border-white/5 opacity-40 shadow-royale">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8">
          <Info size={40} className="text-muted" />
        </div>
        <h3 className="text-lg font-black text-white/50 uppercase tracking-widest">Inspector de Plato</h3>
        <p className="text-[10px] text-muted font-bold uppercase tracking-[0.3em] mt-4 leading-relaxed">
          Seleccione un ítem del tablero para<br/>desglosar las especificaciones
        </p>
      </div>
    );
  }

  const isReady = selectedItem.status === "ready" || selectedItem.status === "served";
  const isCancelled = selectedItem.status === "cancelled";

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col glass-royale rounded-[2.5rem] border border-white/10 overflow-hidden shadow-royale relative"
    >
      {/* HEADER */}
      <div className="p-10 pb-6 relative">
        <div className="flex items-center gap-4 mb-8">
           <div className="p-3.5 rounded-2xl bg-gold/10 text-gold border border-gold/20 shadow-gold-glow/20">
              <ClipboardList size={24} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Análisis</h2>
              <p className="text-[9px] text-muted font-black uppercase tracking-[0.4em] mt-2">Operational Detail v4.0</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className={`p-5 rounded-3xl border ${isReady ? 'bg-green-500/10 border-green-500/20' : isCancelled ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
              <p className="text-[8px] font-black text-muted uppercase tracking-[0.2em] mb-1">Estado</p>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isReady ? 'text-green-400' : isCancelled ? 'text-red-500' : 'text-gold'}`}>
                 {selectedItem.status || "PENDIENTE"}
              </p>
           </div>
           <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
              <p className="text-[8px] font-black text-muted uppercase tracking-[0.2em] mb-1">Volumen</p>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">
                 {selectedItem.quantity} Unidades
              </p>
           </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 p-10 pt-4 space-y-10 overflow-y-auto custom-scrollbar">
         
         {/* PRODUCT SPECS */}
         <section className="space-y-4">
            <div className="flex items-center gap-2">
               <ShieldCheck size={12} className="text-gold opacity-50" />
               <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Especificaciones Técnicas</h4>
            </div>
            
            <div className="p-8 bg-black/20 rounded-[2rem] border border-white/5 space-y-6">
               <div>
                  <p className="text-[9px] text-muted font-black uppercase tracking-widest mb-2">Denominación</p>
                  <h3 className="text-2xl font-black text-grad-gold uppercase tracking-tighter leading-none">
                     {selectedItem.product?.name || "Sin definir"}
                  </h3>
               </div>
               
               <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                  <div>
                     <p className="text-[8px] font-black text-muted uppercase tracking-widest mb-1">Categoría</p>
                     <p className="text-[10px] font-black text-white/70 uppercase">{selectedItem.product?.category || "General"}</p>
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-muted uppercase tracking-widest mb-1">Departamento</p>
                     <p className="text-[10px] font-black text-white/70 uppercase">{selectedItem.product?.type || "Cocina"}</p>
                  </div>
               </div>
            </div>
         </section>

         {/* SERVICE NOTES */}
         <section className="space-y-4">
            <div className="flex items-center gap-2">
               <MessageSquare size={12} className="text-gold opacity-50" />
               <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Notas de Servicio</h4>
            </div>
            <div className={`p-8 rounded-[2rem] border ${selectedItem.notes ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/5'}`}>
               <p className={`text-xs font-bold leading-relaxed ${selectedItem.notes ? 'text-white' : 'text-muted'}`}>
                  {selectedItem.notes || "No se han adjuntado instrucciones especiales para este ítem."}
               </p>
            </div>
         </section>

         {/* PERFORMANCE */}
         <section className="space-y-4">
            <div className="flex items-center gap-2">
               <Timer size={12} className="text-gold opacity-50" />
               <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Métricas de Producción</h4>
            </div>
            <div className="flex items-center gap-4 p-6 bg-black/20 rounded-3xl border border-white/5">
               <Activity size={24} className="text-muted opacity-40" />
               <div>
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest leading-none mb-1">Carga Estimada</p>
                  <div className="flex items-center gap-4">
                     <span className="text-sm font-black text-white">12:00 MIN</span>
                     <div className="w-20 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="w-2/3 h-full bg-gold shadow-gold-glow" />
                     </div>
                  </div>
               </div>
            </div>
         </section>
      </div>

      {/* FOOTER */}
      <div className="p-10 bg-black/10 border-t border-white/5">
         <button className="w-full h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between px-8 group hover:bg-gold/10 hover:border-gold/30 transition-all">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted group-hover:text-gold transition-colors">Ficha de Preparación</span>
            <ChevronRight size={18} className="text-muted group-hover:text-gold transition-all group-hover:translate-x-1" />
         </button>
      </div>
    </motion.div>
  );
}