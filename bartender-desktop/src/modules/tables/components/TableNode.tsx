import { motion } from "framer-motion";
import type { Table } from "../types/table";
import { Users, Info, DollarSign } from "lucide-react";

const statusConfig: any = {
  available: { label: "Libre", accent: "gold", glow: "shadow-gold-glow", bg: "bg-gold/10", border: "border-gold/30", text: "text-gold" },
  occupied: { label: "Ocupada", accent: "orange", glow: "shadow-orange-glow/50", bg: "bg-orange/10", border: "border-orange/30", text: "text-orange" },
  reserved: { label: "Reservada", accent: "blue", glow: "shadow-blue-glow/50", bg: "bg-blue/10", border: "border-blue/30", text: "text-blue" },
  maintenance: { label: "Fuera", accent: "red", glow: "shadow-red-glow/50", bg: "bg-red/10", border: "border-red/30", text: "text-red" },
};

export default function TableNode({
  table,
  selected,
  onClick,
}: {
  table: Table;
  selected: boolean;
  onClick: () => void;
}) {
  const config = statusConfig[table.status] || statusConfig.maintenance;
  const totalAmount = table.orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative aspect-square cursor-pointer
        flex flex-col items-center justify-center rounded-[2rem] border backdrop-blur-md
        transition-all duration-500 overflow-hidden group
        ${config.bg} ${config.border}
        ${selected ? `ring-2 ring-${config.accent} ring-offset-4 ring-offset-bg z-10 ${config.glow}` : "z-0"}
      `}
    >
      {/* GLOW DECOR */}
      <div className={`absolute -top-1/2 -right-1/2 w-full h-full rounded-full opacity-[0.08] blur-3xl bg-${config.accent}`} />
      
      {/* STATUS INDICATOR */}
      <div className="absolute top-4 right-4">
        <div className={`w-2 h-2 rounded-full bg-${config.accent} ${table.status === 'occupied' ? 'animate-pulse' : ''} shadow-lg`} />
      </div>

      {/* TABLE INFO */}
      <div className="flex flex-col items-center text-center px-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">
          {table.location}
        </span>
        
        <span className={`text-4xl font-black tracking-tighter ${config.text} group-hover:scale-110 transition-transform`}>
          {table.number}
        </span>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 opacity-60">
            <Users size={12} />
            <span className="text-[10px] font-bold">{table.capacity}</span>
          </div>
          
          {totalAmount > 0 && (
            <div className="flex items-center gap-0.5 text-green-400 font-bold text-[11px]">
              <DollarSign size={10} />
              <span>{totalAmount.toFixed(0)}</span>
            </div>
          )}
        </div>

        {/* ITEMS PREVIEW (NEW) */}
        {table.orders && table.orders.length > 0 && (
          <div className="mt-4 w-full px-6 flex flex-col gap-1 overflow-hidden">
             {table.orders.flatMap(o => o.items).slice(0, 3).map((item, idx) => (
               <div key={idx} className="flex justify-between items-center gap-2">
                  <span className="text-[8px] font-black uppercase text-white/40 truncate flex-1 text-left">
                    {item.product?.name || 'Item'}
                  </span>
                  <span className="text-[8px] font-black text-gold/60">x{item.quantity}</span>
               </div>
             ))}
             {table.orders.flatMap(o => o.items).length > 3 && (
               <span className="text-[7px] font-black text-muted uppercase tracking-widest mt-1">
                 +{table.orders.flatMap(o => o.items).length - 3} más...
               </span>
             )}
          </div>
        )}
      </div>

      {/* SELECTION INDICATOR */}
      {selected && (
        <div className={`absolute inset-x-0 bottom-0 h-1 bg-${config.accent}`} />
      )}

      {/* HOVER OVERLAY */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-1">
          <Info size={18} className={config.text} />
          <span className="text-[9px] font-black uppercase text-white/80">Gestionar</span>
        </div>
      </div>
    </motion.div>
  );
}