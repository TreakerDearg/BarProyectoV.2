/**
 * QuickActionsPanel — Panel modal de acciones rápidas.
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import { Plus, Clock, Users, Package, TrendingUp, X } from "lucide-react";
import type { DashboardTab } from "../store/dashboardUiStore";

interface Action {
  id:      string;
  label:   string;
  icon:    React.ReactNode;
  onClick: () => void;
  color:   string;
}

interface Props {
  isOpen:   boolean;
  onClose:  () => void;
  context?: DashboardTab;
}

export default function QuickActionsPanel({ isOpen, onClose, context = "operation" }: Props) {
  const getActions = (): Action[] => {
    const commonActions: Action[] = [
      {
        id: "new-order", label: "Nueva cuenta",
        icon: <Plus size={20} />, onClick: () => console.log("Nueva cuenta"),
        color: "text-[#3FB950] bg-[#3FB950]/10 border-[#3FB950]/25 hover:bg-[#3FB950]/18",
      },
      {
        id: "view-orders", label: "Ver pedidos",
        icon: <Clock size={20} />, onClick: () => console.log("Ver pedidos"),
        color: "text-[#F0B429] bg-[#F0B429]/10 border-[#F0B429]/25 hover:bg-[#F0B429]/18",
      },
      {
        id: "view-reservations", label: "Reservas",
        icon: <Users size={20} />, onClick: () => console.log("Reservas"),
        color: "text-[#A371F7] bg-[#A371F7]/10 border-[#A371F7]/25 hover:bg-[#A371F7]/18",
      },
    ];

    const inventoryActions: Action[] = [
      {
        id: "stock-check", label: "Ver stock",
        icon: <Package size={20} />, onClick: () => console.log("Ver stock"),
        color: "text-[#F0B429] bg-[#F0B429]/10 border-[#F0B429]/25 hover:bg-[#F0B429]/18",
      },
      {
        id: "restock", label: "Reabastecer",
        icon: <Plus size={20} />, onClick: () => console.log("Reabastecer"),
        color: "text-[#3FB950] bg-[#3FB950]/10 border-[#3FB950]/25 hover:bg-[#3FB950]/18",
      },
    ];

    const analyticsActions: Action[] = [
      {
        id: "sales-report", label: "Reporte ventas",
        icon: <TrendingUp size={20} />, onClick: () => console.log("Reporte ventas"),
        color: "text-[#F0B429] bg-[#F0B429]/10 border-[#F0B429]/25 hover:bg-[#F0B429]/18",
      },
    ];

    switch (context) {
      case "operation":  return commonActions;
      case "inventory":  return [...commonActions, ...inventoryActions];
      case "analytics":  return [...commonActions, ...analyticsActions];
      default:           return commonActions;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1C2333] border border-[#30363D] rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#E6EDF3]">Acciones rápidas</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/8 text-[#566270] hover:text-[#E6EDF3] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid de acciones */}
        <div className="grid grid-cols-2 gap-3">
          {getActions().map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => { action.onClick(); onClose(); }}
              className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all hover:scale-105 ${action.color}`}
            >
              {action.icon}
              <span className="text-sm font-semibold">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-[#30363D]">
          <p className="text-xs text-[#566270] text-center">
            Atajos de teclado: 1-3 para cambiar modo, M para alternar
          </p>
        </div>
      </div>
    </div>
  );
}
