import { Check, Users, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import styles from "../Reservas.module.css";
import ui from "../../cliente-ui.module.css";

export function ReservationTables({
  tables,
  selected,
  onSelect,
}: any) {
  if (!tables?.length) {
    return (
      <div className={ui.statePanel}>
        <p className="text-sm text-center">
          No hay mesas disponibles para este horario. 
          <br />
          Probá con otro horario o fecha.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tablesGrid}>
      {tables.map((t: any, index: number) => {
        const isSelected = selected === t._id;

        return (
          <motion.button
            key={t._id}
            type="button"
            onClick={() => onSelect(isSelected ? undefined : t._id)}
            className={clsx(
              styles.tableCard,
              isSelected && styles.tableCardSelected
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
          </motion.button>
        );
      })}
    </div>
  );
}