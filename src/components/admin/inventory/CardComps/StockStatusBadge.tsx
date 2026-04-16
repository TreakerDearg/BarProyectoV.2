import styles from "@/styles/inventory/InventoryCard.module.css";
import { StockStatus } from "./cardStyles";

interface Props {
  status: StockStatus;
}

export default function StockStatusBadge({ status }: Props) {
  const labelMap: Record<StockStatus, string> = {
    critical: "CRITICAL STOCK",
    low: "LOW STOCK",
    optimal: "OPTIMAL LEVEL",
  };

  const badgeClassMap: Record<StockStatus, string> = {
    critical: styles.badgeCritical,
    low: styles.badgeLow,
    optimal: styles.badgeOptimal,
  };

  return (
    <span className={`${styles.badge} ${badgeClassMap[status]}`}>
      {labelMap[status]}
    </span>
  );
}