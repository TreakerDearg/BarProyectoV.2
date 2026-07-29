import ui from "../pedido-ui.module.css";
import { Loader2, SkipForward } from "lucide-react";

export function PedidoMesa({
  tables = [],
  pickTable,
  setPickTable,
  handleOpenSession,
  loading,
  skipTable,
  setSkipTable,
}: any) {
  return (
    <section className={ui.card}>
      <div className={ui.cardInner}>
        <div className={ui.cardHeader}>
          <h2 className={ui.cardTitle}>1. Seleccionar mesa</h2>
          <button
            onClick={() => setSkipTable(!skipTable)}
            className={ui.skipButton}
            type="button"
          >
            <SkipForward className={ui.skipIcon} />
            {skipTable ? "Seleccionar mesa" : "Saltar"}
          </button>
        </div>

        {!skipTable ? (
          <>
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
          </>
        ) : (
          <div className={ui.skipNotice}>
            <p className={ui.skipText}>
              Saltaste la selección de mesa. El pedido se enviará sin asignar a una mesa específica.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}