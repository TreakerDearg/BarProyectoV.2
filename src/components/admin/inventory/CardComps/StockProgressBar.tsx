import styles from "@/styles/inventory/InventoryCard.module.css";
import { StockStatus } from "./cardStyles";

interface Props {
  percentage: number;
  status: StockStatus;
}

export default function StockProgressBar({
  percentage,
  status,
}: Props) {
  const statusClass =
    status === "critical"
      ? styles.progressCritical
      : status === "low"
      ? styles.progressLow
      : styles.progressOptimal;

  return (
    <div className={styles.progressContainer}>
      <div
        className={`${styles.progressBar} ${statusClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}