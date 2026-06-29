import type { Order } from "../../types/order";
import OrderTimer from "./OrderTimer";
import OrderItems from "./OrderItems";
import OrderActions from "./OrderActions";
import { getTableLabel, isBarOrder } from "./orderCard.utils";
import { Flame, Zap, Clock, Martini, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";

interface Props {
  order: Order;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onSelectItem?: (item: any) => void;
  selectedItemId?: string;
  onEdit?: (id: string) => void;
}

const statusConfig: any = {
  pending: { 
    label: "Pendiente",
    color: "text-gold",
    accent: "bg-gold", 
    bg: "bg-gold/5",
    icon: <Clock size={14} className="text-gold animate-pulse" />
  },
  "in-progress": { 
    label: "En Cocina",
    color: "text-green-400",
    accent: "bg-green-400", 
    bg: "bg-green-400/5",
    icon: <Zap size={14} className="text-green-400 animate-bounce-slow" />
  },
  completed: { 
    label: "Completado",
    color: "text-muted",
    accent: "bg-muted", 
    bg: "bg-white/5",
    icon: null 
  },
  cancelled: { 
    label: "Anulado",
    color: "text-red-500",
    accent: "bg-red-500", 
    bg: "bg-red-500/5",
    icon: null 
  },
};

export default function OrderCard(props: Props) {
  const { order, onEdit } = props;
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
      accent: "#f2d790",
      accentSoft: "rgba(242, 215, 144, 0.13)",
      border: "rgba(242, 215, 144, 0.26)",
      icon: <Martini size={20} className="text-gold" />,
      label: "Barra"
    },
    kitchen: {
      accent: "#64d9d2",
      accentSoft: "rgba(100, 217, 210, 0.12)",
      border: "rgba(100, 217, 210, 0.22)",
      icon: <UtensilsCrossed size={20} className="text-cyan-200" />,
      label: "Cocina"
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
      style={{
        "--order-accent": typeTheme.accent,
        "--order-accent-soft": typeTheme.accentSoft,
        "--order-border": typeTheme.border,
      } as CSSProperties}
      className={`
        nebula-command-card flex flex-col transition-all duration-300
        ${isCritical ? 'is-critical' : isHighPriority ? 'is-high' : ''}
        ${order.status === 'completed' ? 'opacity-50' : ''}
      `}
    >
      {/* Hero Section */}
      <div className="relative p-5 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Table Number - Prominent */}
            <div className={`nebula-table-medallion font-black text-3xl ${
              isCritical ? 'text-red-300 border-red-400/40'
              : isHighPriority ? 'text-amber-200 border-amber-300/40'
              : ''
            }`}>
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
                  {typeTheme.label}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="text-right">
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Progreso</p>
            <p className="text-lg font-bold text-white">{completedItems}/{totalItems}</p>
            <div className="w-16 h-1 nebula-progress-track mt-1">
              <div 
                className="nebula-progress-bar transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        
        {/* Timer Section */}
        <div className="flex items-center justify-between p-4 nebula-soft-cell">
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
            onEdit={onEdit}
          />
        </div>
      </div>
    </motion.div>
  );
}
