import { Plus, Clock, Users, Package, TrendingUp, X } from "lucide-react";
import type { DashboardTab } from "../store/dashboardUiStore";

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  context?: DashboardTab;
}

export default function QuickActionsPanel({ isOpen, onClose, context = "operation" }: Props) {
  const getActions = (): Action[] => {
    const commonActions: Action[] = [
      {
        id: "new-order",
        label: "Nueva cuenta",
        icon: <Plus size={20} />,
        onClick: () => console.log("Nueva cuenta"),
        color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      },
      {
        id: "view-orders",
        label: "Ver pedidos",
        icon: <Clock size={20} />,
        onClick: () => console.log("Ver pedidos"),
        color: "text-gold bg-gold/10 border-gold/20",
      },
      {
        id: "view-reservations",
        label: "Reservas",
        icon: <Users size={20} />,
        onClick: () => console.log("Reservas"),
        color: "text-violet-300 bg-violet-400/10 border-violet-400/20",
      },
    ];

    const inventoryActions: Action[] = [
      {
        id: "stock-check",
        label: "Ver stock",
        icon: <Package size={20} />,
        onClick: () => console.log("Ver stock"),
        color: "text-gold bg-gold/10 border-gold/20",
      },
      {
        id: "restock",
        label: "Reabastecer",
        icon: <Plus size={20} />,
        onClick: () => console.log("Reabastecer"),
        color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      },
    ];

    const analyticsActions: Action[] = [
      {
        id: "sales-report",
        label: "Reporte ventas",
        icon: <TrendingUp size={20} />,
        onClick: () => console.log("Reporte ventas"),
        color: "text-gold bg-gold/10 border-gold/20",
      },
    ];

    switch (context) {
      case "operation":
        return commonActions;
      case "inventory":
        return [...commonActions, ...inventoryActions];
      case "analytics":
        return [...commonActions, ...analyticsActions];
      default:
        return commonActions;
    }
  };

  if (!isOpen) return null;

  const actions = getActions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface-2 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-ivory">Acciones rápidas</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-muted hover:text-ivory transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all hover:scale-105 ${action.color}`}
            >
              {action.icon}
              <span className="text-xs font-semibold">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-[10px] text-muted text-center">
            Atajos de teclado: 1-3 para cambiar modo, M para alternar
          </p>
        </div>
      </div>
    </div>
  );
}
