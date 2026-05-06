import type { OrderItem as IOrderItem } from "../../types/order";
import OrderItem from "./OrderItem";

interface Props {
  items: IOrderItem[];
  status: string;
  onSelectItem?: (item: any) => void;
  selectedItemId?: string;
}

export default function OrderItems({ items, status, onSelectItem, selectedItemId }: Props) {
  return (
    <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
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