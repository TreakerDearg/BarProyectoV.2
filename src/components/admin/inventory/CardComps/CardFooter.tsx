import { Plus } from "lucide-react";
import styles from "@/styles/inventory/InventoryCard.module.css";
import { StockStatus } from "./cardStyles";

interface Props {
  status: StockStatus;
  onRefill: () => void;
}

export default function CardFooter({
  status,
  onRefill,
}: Props) {
  const statusText =
    status === "critical"
      ? "CRITICAL STOCK"
      : status === "low"
      ? "LOW STOCK"
      : "OPTIMAL LEVEL";

  const badgeClass =
    status === "critical"
      ? styles.badgeCritical
      : status === "low"
      ? styles.badgeLow
      : styles.badgeOptimal;

  return (
    <div className={styles.footer}>
      <span className={`${styles.badge} ${badgeClass}`}>
        {statusText}
      </span>

      <button
        onClick={onRefill}
        className={styles.refillButton}
      >
        <Plus size={14} />
        REFILL
      </button>
    </div>
  );
}