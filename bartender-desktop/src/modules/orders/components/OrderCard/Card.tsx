import type { Order } from "../../types/order";
import OrderHeader from "./OrderHeader";
import OrderTableInfo from "./OrderTableInfo";
import OrderTimer from "./OrderTimer";
import OrderItems from "./OrderItems";
import OrderActions from "./OrderActions";
import { getTableLabel, isBarOrder } from "./orderCard.utils";
import { Flame, Zap, Clock, History } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  order: Order;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onSelectItem?: (item: any) => void;
  selectedItemId?: string;
}

const statusConfig: any = {
  pending: { 
    label: "Pendiente",
    color: "text-gold",
    glow: "shadow-gold-glow/20", 
    accent: "bg-gold", 
    bg: "bg-gold/5",
    icon: <Clock size={14} className="text-gold animate-pulse" />
  },
  "in-progress": { 
    label: "En Cocina",
    color: "text-green-400",
    glow: "shadow-green-400/20", 
    accent: "bg-green-400", 
    bg: "bg-green-400/5",
    icon: <Zap size={14} className="text-green-400 animate-bounce-slow" />
  },
  completed: { 
    label: "Completado",
    color: "text-muted",
    glow: "shadow-white/5", 
    accent: "bg-muted", 
    bg: "bg-white/5",
    icon: null 
  },
  cancelled: { 
    label: "Anulado",
    color: "text-red-500",
    glow: "shadow-red-500/20", 
    accent: "bg-red-500", 
    bg: "bg-red-500/5",
    icon: null 
  },
};

export default function OrderCard(props: Props) {
  const { order } = props;
  const config = statusConfig[order.status] || statusConfig.pending;
  
  const orderId = order._id ?? "";
  const tableLabel = getTableLabel(order.table);
  const isBar = isBarOrder(order.items);

  const minutes = order.createdAt ? (Date.now() - new Date(order.createdAt).getTime()) / 60000 : 0;
  const isCritical = minutes > 15 && order.status !== "completed" && order.status !== "cancelled";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`
        relative flex flex-col bg-surface-2 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl transition-all duration-500
        ${isCritical ? 'border-red-500/40 shadow-red-500/20 ring-1 ring-red-500/20' : `hover:border-white/20`}
        ${order.status === 'completed' ? 'opacity-60' : ''}
      `}
    >
      {/* STATUS DECOR BAR */}
      <div className={`h-1.5 w-full ${config.accent} opacity-40`} />

      <div className="p-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-start">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <div className={`w-1.5 h-1.5 rounded-full ${config.accent} ${order.status === 'in-progress' ? 'animate-pulse' : ''}`} />
                 <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${config.color}`}>
                   {config.label}
                 </span>
              </div>
              <OrderHeader order={order} isBar={isBar} />
           </div>

           {isCritical ? (
             <div className="bg-red-500/10 text-red-500 p-2 rounded-xl animate-pulse">
                <Flame size={20} />
             </div>
           ) : (
             <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-muted">
                {config.icon || <History size={16} />}
             </div>
           )}
        </div>

        {/* LOGISTICS */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <p className="text-[8px] font-black text-muted uppercase tracking-widest mb-1">Destino</p>
              <OrderTableInfo order={order} tableLabel={tableLabel} />
           </div>
           <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <p className="text-[8px] font-black text-muted uppercase tracking-widest mb-1">Cronómetro</p>
              <OrderTimer order={order} />
           </div>
        </div>

        {/* ITEMS LIST */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-1 h-3 rounded-full bg-gold" />
                 <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Contenido Comanda</span>
              </div>
              <span className="text-[9px] font-black text-gold/60">{order.items.length} items</span>
           </div>
           
           <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              <OrderItems
                items={order.items}
                status={order.status}
                onSelectItem={(item) =>
                  props.onSelectItem?.({ ...item, orderId })
                }
                selectedItemId={props.selectedItemId}
              />
           </div>
        </div>

        {/* ACTION PANEL */}
        <div className="pt-4 border-t border-white/5">
           <OrderActions
             orderId={orderId}
             status={order.status}
             onDelete={props.onDelete}
             onStatusChange={props.onStatusChange}
           />
        </div>
      </div>

      {/* BACKGROUND DECOR */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${config.accent} opacity-[0.03] blur-[60px] pointer-events-none`} />
    </motion.div>
  );
}