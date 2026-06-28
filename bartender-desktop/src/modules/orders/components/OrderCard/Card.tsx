import type { Order } from "../../types/order";
import OrderTimer from "./OrderTimer";
import OrderItems from "./OrderItems";
import OrderActions from "./OrderActions";
import { getTableLabel, isBarOrder } from "./orderCard.utils";
import { Flame, Zap, Clock, Martini, UtensilsCrossed } from "lucide-react";
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
  const isHighPriority = minutes > 10 && !isCritical && order.status !== "completed" && order.status !== "cancelled";

  // Nebula theme configuration by type
  const typeTheme = {
    bar: {
      gradient: "from-gold/20 via-amber-500/15 to-orange-500/10",
      borderColor: "border-gold/30",
      icon: <Martini size={20} className="text-gold" />,
      glow: "bg-gold/10"
    },
    kitchen: {
      gradient: "from-emerald-500/20 via-green-500/15 to-teal-500/10",
      borderColor: "border-emerald/30",
      icon: <UtensilsCrossed size={20} className="text-emerald-400" />,
      glow: "bg-emerald-400/10"
    }
  }[isBar ? "bar" : "kitchen"];

  // Items progress calculation
  const completedItems = order.items.filter(i => i.status === "served" || i.status === "ready").length;
  const totalItems = order.items.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`
        relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300
        bg-gradient-to-br ${typeTheme.gradient} border ${typeTheme.borderColor}
        ${isCritical ? 'border-red-500/50 shadow-[0_0_32px_rgba(239,68,68,0.3)]' : isHighPriority ? 'border-orange-500/40 shadow-[0_0_24px_rgba(249,115,22,0.2)]' : 'hover:shadow-2xl'}
        ${order.status === 'completed' ? 'opacity-50' : ''}
      `}
    >
      {/* Priority Glow Effect */}
      {isCritical && (
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] bg-red-500/20 animate-pulse" />
      )}
      {isHighPriority && (
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] bg-orange-500/15 animate-pulse" />
      )}

      {/* Hero Section */}
      <div className={`relative p-5 bg-gradient-to-r ${typeTheme.gradient}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Table Number - Prominent */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl ${
              isCritical ? 'bg-red-500/20 text-red-400 border-red-500/40' 
              : isHighPriority ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
              : 'bg-white/10 text-white border-white/20'
            } shadow-lg`}>
              {tableLabel}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isCritical ? (
                  <Flame size={16} className="text-red-400 animate-pulse" />
                ) : isHighPriority ? (
                  <Zap size={16} className="text-orange-400" />
                ) : (
                  <Clock size={16} className="text-white/60" />
                )}
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isCritical ? 'text-red-400' : isHighPriority ? 'text-orange-400' : 'text-white/60'
                }`}>
                  {isCritical ? 'CRÍTICO' : isHighPriority ? 'ALTA PRIORIDAD' : config.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {typeTheme.icon}
                <span className="text-xs text-white/50 font-medium uppercase">
                  {isBar ? 'Barra' : 'Cocina'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="text-right">
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Progreso</p>
            <p className="text-lg font-bold text-white">{completedItems}/{totalItems}</p>
            <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        
        {/* Timer Section */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-white/50" />
            <span className="text-xs text-white/50 uppercase tracking-wider">Tiempo de espera</span>
          </div>
          <OrderTimer order={order} />
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 uppercase tracking-wider">Contenido</span>
            <span className="text-xs font-bold text-white/70">{order.items.length} items</span>
          </div>
          
          <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
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

        {/* Action Panel */}
        <div className="pt-4 border-t border-white/10">
          <OrderActions
            orderId={orderId}
            status={order.status}
            onDelete={props.onDelete}
            onStatusChange={props.onStatusChange}
          />
        </div>
      </div>
    </motion.div>
  );
}