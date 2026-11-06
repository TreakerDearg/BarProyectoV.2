/**
 * OrderActions — Botones de acción de la comanda.
 * REDISEÑO v3.0 — Slate Elegante
 */
import { CheckCircle, Play, Trash2, XCircle, Edit } from "lucide-react";
import type { Order } from "../../types/order";

interface Props {
  orderId:        string;
  status:         Order["status"];
  onDelete:       (id: string) => void;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onEdit?:        (id: string) => void;
}

const BTN_BASE = "flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all active:scale-95 flex-shrink-0";
const BTN_ICON = "w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0";

export default function OrderActions({
  orderId, status, onDelete, onStatusChange, onEdit,
}: Props) {
  return (
    <div className="flex gap-2">

      {/* PROCESAR — pending → in-progress */}
      {status === "pending" && (
        <button
          type="button"
          onClick={() => onStatusChange(orderId, "in-progress")}
          className={`${BTN_BASE} flex-1 h-12 px-3`}
          style={{
            background: "linear-gradient(135deg, #3FB950, #2EA043)",
            color:       "#0D1117",
            boxShadow:   "0 4px 16px rgba(63,185,80,0.25)",
          }}
        >
          <Play size={16} className="fill-current" />
          <span className="text-xs font-black uppercase tracking-widest">Procesar</span>
        </button>
      )}

      {/* DESPACHAR — in-progress → completed */}
      {status === "in-progress" && (
        <button
          type="button"
          onClick={() => onStatusChange(orderId, "completed")}
          className={`${BTN_BASE} flex-1 h-12 px-3`}
          style={{
            background: "linear-gradient(135deg, #F0B429, #C8920F)",
            color:       "#0D1117",
            boxShadow:   "0 4px 16px rgba(240,180,41,0.25)",
          }}
        >
          <CheckCircle size={16} />
          <span className="text-xs font-black uppercase tracking-widest">Despachar</span>
        </button>
      )}

      {/* EDITAR — solo pending */}
      {status === "pending" && onEdit && (
        <button
          type="button"
          onClick={() => onEdit(orderId)}
          className={BTN_ICON}
          title="Editar ítems"
          style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color        = "#F0B429";
            (e.currentTarget as HTMLButtonElement).style.borderColor  = "rgba(240,180,41,0.30)";
            (e.currentTarget as HTMLButtonElement).style.background   = "rgba(240,180,41,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color        = "#8B949E";
            (e.currentTarget as HTMLButtonElement).style.borderColor  = "#30363D";
            (e.currentTarget as HTMLButtonElement).style.background   = "#21283A";
          }}
        >
          <Edit size={16} />
        </button>
      )}

      {/* ELIMINAR */}
      <button
        type="button"
        onClick={() => onDelete(orderId)}
        className={BTN_ICON}
        title="Eliminar comanda"
        style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color        = "#F85149";
          (e.currentTarget as HTMLButtonElement).style.borderColor  = "rgba(248,81,73,0.30)";
          (e.currentTarget as HTMLButtonElement).style.background   = "rgba(248,81,73,0.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color        = "#8B949E";
          (e.currentTarget as HTMLButtonElement).style.borderColor  = "#30363D";
          (e.currentTarget as HTMLButtonElement).style.background   = "#21283A";
        }}
      >
        <Trash2 size={16} />
      </button>

      {/* CANCELAR — no completed/cancelled */}
      {status !== "completed" && status !== "cancelled" && (
        <button
          type="button"
          onClick={() => onStatusChange(orderId, "cancelled")}
          className={BTN_ICON}
          title="Cancelar comanda"
          style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color        = "#FF7B54";
            (e.currentTarget as HTMLButtonElement).style.borderColor  = "rgba(255,123,84,0.30)";
            (e.currentTarget as HTMLButtonElement).style.background   = "rgba(255,123,84,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color        = "#8B949E";
            (e.currentTarget as HTMLButtonElement).style.borderColor  = "#30363D";
            (e.currentTarget as HTMLButtonElement).style.background   = "#21283A";
          }}
        >
          <XCircle size={16} />
        </button>
      )}
    </div>
  );
}
