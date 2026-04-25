// components/OrderDetails.tsx
import type { Order, SelectedItem } from "../types/discounts";

interface Props {
  order: Order;
  items: SelectedItem[];
  setItems: (items: SelectedItem[]) => void;
}

export default function OrderDetails({ order, items, setItems }: Props) {
  const toggleItem = (index: number) => {
    const updated = [...items];
    updated[index].selected = !updated[index].selected;
    setItems(updated);
  };

  return (
    <div className="bg-surface-container p-4 rounded-xl">
      <h3 className="font-bold mb-4">Order Details</h3>

      {order.items.map((item, index) => (
        <label key={index} className="flex gap-3 p-2">
          <input
            type="checkbox"
            onChange={() => toggleItem(index)}
          />
          <div className="flex-1">
            <p>{item.name}</p>
            <p className="text-xs">${item.price}</p>
          </div>
        </label>
      ))}
    </div>
  );
}