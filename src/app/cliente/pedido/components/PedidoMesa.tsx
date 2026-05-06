import ui from "../pedido-ui.module.css";
import { Loader2 } from "lucide-react";

export function PedidoMesa({
  tables = [],
  pickTable,
  setPickTable,
  handleOpenSession,
  loading,
}: any) {
  return (
    <section className={ui.card}>
      <div className={ui.cardInner}>
        <h2 className={ui.cardTitle}>1. Seleccionar mesa</h2>

        <select
          value={pickTable}
          onChange={(e) => setPickTable(e.target.value)}
          className={ui.input}
        >
          <option value="">Elegir mesa</option>

          {tables.length === 0 && (
            <option disabled>No hay mesas disponibles</option>
          )}

          {tables.map((t: any) => (
            <option key={t._id} value={t._id}>
              Mesa #{t.number} · {t.capacity} pers.
            </option>
          ))}
        </select>

        <button
          onClick={handleOpenSession}
          disabled={loading || !pickTable}
          className={ui.btnPrimary}
        >
          {loading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            "Activar mesa"
          )}
        </button>
      </div>
    </section>
  );
}