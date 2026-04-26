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
    <div className="bg-surface-container border border-white/10 p-4 rounded-xl min-h-[420px]">
      <h3 className="font-bold mb-4 text-white">Order Details: Mesa {String(order.table)}</h3>

      {items.map((item, index) => (
        <label
          key={item._id || `${item.product}-${index}`}
          className="flex gap-3 p-2 rounded-lg hover:bg-surface-container-high cursor-pointer"
        >
          <input
            type="checkbox"
            checked={item.selected}
            onChange={() => toggleItem(index)}
          />
          <div className="flex-1">
            <p className="text-white">{item.name}</p>
            <p className="text-xs text-gray-400">
              ${item.price} x {item.quantity}
            </p>
          </div>
          <p className="text-sm font-semibold text-primary">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
        </label>
      ))}
    </div>
  );
}