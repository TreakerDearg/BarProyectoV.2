import { Check, Users, MapPin } from "lucide-react";
import clsx from "clsx";
import styles from "../Reservas.module.css";

export function ReservationTables({
  tables,
  selected,
  onSelect,
}: any) {
  if (!tables?.length) {
    return (
      <p className="text-sm text-white/60 text-center">
        No hay mesas disponibles para este horario
      </p>
    );
  }

  return (
    <div className={styles.tablesGrid}>
      {tables.map((t: any) => {
        const isSelected = selected === t._id;

        return (
          <button
            key={t._id}
            type="button"
            onClick={() => onSelect(isSelected ? undefined : t._id)}
            className={clsx(
              styles.tableCard,
              isSelected && styles.tableCardSelected
            )}
          >
            {/* INFO */}
            <div className={styles.tableInfo}>
              <span className={styles.tableNumber}>
                Mesa #{t.number}
              </span>

              <span className={styles.tableMeta}>
                <Users className="h-3.5 w-3.5 inline mr-1 opacity-70" />
                {t.capacity} personas
              </span>

              <span className={styles.tableMeta}>
                <MapPin className="h-3.5 w-3.5 inline mr-1 opacity-70" />
                {t.location}
              </span>
            </div>

            {/* CHECK */}
            <div className={styles.tableCheck}>
              <Check className="h-4 w-4" />
            </div>
          </button>
        );
      })}
    </div>
  );
}