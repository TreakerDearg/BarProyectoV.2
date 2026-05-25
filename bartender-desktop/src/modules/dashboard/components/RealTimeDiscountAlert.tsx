/**
 * RealTimeDiscountAlert
 * Componente que muestra notificaciones visuales cuando se aplican descuentos en tiempo real
 */

import { useState, useEffect } from "react";
import { Gift, X, Clock } from "lucide-react";
import { socketService } from "../../../services/socket";
import "../../../styles/dashboard-theme.css";

interface DiscountEvent {
  orderId: string;
  discountId?: string;
  amount: number;
  reason: string;
  type: "PERCENT" | "FLAT";
  table?: string;
  appliedBy?: string;
  timestamp: string;
}

interface AlertData extends DiscountEvent {
  id: string;
  age: number;
}

export default function RealTimeDiscountAlert() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  useEffect(() => {
    const handleDiscountApplied = (data: DiscountEvent) => {
      const alert: AlertData = {
        ...data,
        id: `${data.discountId}-${Date.now()}`,
        age: 0,
      };

      setAlerts((prev) => [alert, ...prev].slice(0, 3)); // Máximo 3 alertas

      // Remover alerta después de 5 segundos
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      }, 5000);
    };

    // Escuchar eventos de descuentos
    socketService.on("discount:applied", handleDiscountApplied);

    return () => {
      socketService.off("discount:applied", handleDiscountApplied);
    };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto glass-royale-fusion border border-gold/30 rounded-2xl p-4 min-w-[320px] animate-slide-in-right-fusion neon-glow-gold-fusion"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="p-2 bg-gold/10 rounded-xl border border-gold/20 flex-shrink-0">
              <Gift className="text-gold" size={20} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-black text-gold uppercase tracking-wider">
                  Descuento Aplicado
                </p>
                <button
                  onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
                  className="text-muted hover:text-ivory transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-sm font-black text-ivory mb-1">
                {alert.type === "PERCENT" ? `${alert.amount}%` : `$${alert.amount.toFixed(2)}`}
                <span className="text-muted font-normal ml-1">
                  · Mesa {alert.table || "N/A"}
                </span>
              </p>

              <div className="flex items-center gap-2 text-[10px] text-muted font-black uppercase tracking-wider">
                <Clock size={10} />
                <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                <span className="opacity-30">|</span>
                <span>{alert.reason}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Animación CSS inline
const style = document.createElement("style");
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-slide-in-right {
    animation: slideInRight 0.3s ease-out;
  }
`;
document.head.appendChild(style);
