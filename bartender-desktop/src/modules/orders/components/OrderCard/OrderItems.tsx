/**
 * OrderItems — Lista de ítems de la comanda.
 * REDISEÑO v3.0 — Slate Elegante
 */
import type { OrderItem as IOrderItem } from "../../types/order";
import OrderItem from "./OrderItem";

interface Props {
  items:         IOrderItem[];
  status:        string;
  onSelectItem?: (item: any) => void;
  selectedItemId?: string;
}

export default function OrderItems({ items, status, onSelectItem, selectedItemId }: Props) {
  return (
    <div
      className="space-y-2 max-h-[220px] overflow-y-auto"
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
    >
      {items.map((item, idx) => (
        <OrderItem
          key={idx}
          item={item}
          status={status}
          onSelect={onSelectItem}
          isActive={selectedItemId === item._id}
        />
      ))}
    </div>
  );
}
