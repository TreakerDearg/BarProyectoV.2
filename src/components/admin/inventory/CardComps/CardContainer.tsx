import styles from "@/styles/inventory/InventoryCard.module.css";
import { ReactNode } from "react";
import { StockStatus } from "./cardStyles";

interface Props {
  status: StockStatus;
  children: ReactNode;
}

export default function CardContainer({
  status,
  children,
}: Props) {
  return (
    <div className={`${styles.card} ${styles[status]}`}>
      {children}
    </div>
  );
}