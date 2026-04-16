import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import styles from "@/styles/inventory/InventoryCard.module.css";
import { InventoryItem } from "@/services/inventoryService";
import { StockStatus } from "./cardStyles";

interface Props {
  item: InventoryItem;
  status: StockStatus;
  onEdit: (item: InventoryItem) => void;
  onDelete: () => void;
}

export default function CardHeader({
  item,
  status,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className={styles.header}>
      <h2 className={`${styles.title} ${styles.neonText}`}>
        {item.name}
      </h2>

      <div className={styles.actions}>
        {status === "critical" && (
          <AlertTriangle
            size={18}
            className={styles.criticalIcon}
          />
        )}

        <button
          onClick={() => onEdit(item)}
          className={styles.iconButton}
          title="Editar"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={onDelete}
          className={styles.iconButton}
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}