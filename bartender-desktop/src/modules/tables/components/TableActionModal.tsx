"use client";

import { motion } from "framer-motion";
import { X, Utensils, Edit, Info } from "lucide-react";

interface Props {
  tableNumber: number;
  tableStatus: string;
  onUseTable: () => void;
  onEditTable: () => void;
  onViewDetails: () => void;
  onClose: () => void;
}

export default function TableActionModal({
  tableNumber,
  tableStatus,
  onUseTable,
  onEditTable,
  onViewDetails,
  onClose,
}: Props) {
  const actions = [
    {
      id: "use",
      icon: <Utensils size={32} />,
      title: "Usar mesa",
      description: "Abrir sesión y tomar pedidos",
      color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      hoverColor: "hover:bg-emerald-500/20",
      onClick: onUseTable,
      shortcut: "1",
    },
    {
      id: "edit",
      icon: <Edit size={32} />,
      title: "Editar mesa",
      description: "Configurar capacidad y ubicación",
      color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      hoverColor: "hover:bg-blue-500/20",
      onClick: onEditTable,
      shortcut: "2",
    },
    {
      id: "details",
      icon: <Info size={32} />,
      title: "Ver detalles",
      description: "Información y estadísticas",
      color: "bg-violet-500/10 border-violet-500/30 text-violet-400",
      hoverColor: "hover:bg-violet-500/20",
      onClick: onViewDetails,
      shortcut: "3",
    },
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "occupied":
        return "Ocupada";
      case "reserved":
        return "Reservada";
      case "maintenance":
        return "En mantenimiento";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-emerald-400";
      case "occupied":
        return "text-red-400";
      case "reserved":
        return "text-amber-400";
      case "maintenance":
        return "text-orange-400";
      default:
        return "text-muted";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-surface-3/50">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gold/15 text-gold">
              <Utensils size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ivory">Mesa {tableNumber}</h2>
              <p className={`text-sm mt-1 ${getStatusColor(tableStatus)}`}>
                {getStatusText(tableStatus)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8">
          <p className="text-sm text-muted mb-6 text-center">
            Selecciona una acción para la mesa {tableNumber}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.onClick}
                className={`
                  p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 text-center
                  ${action.color} ${action.hoverColor}
                `}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                  {action.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{action.title}</h3>
                  <p className="text-xs text-muted">{action.description}</p>
                </div>
                <div className="mt-2 px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-muted">
                  Presiona {action.shortcut}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-white/10 bg-surface-3/30">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
