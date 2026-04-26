import OrderItem from "./OrderItem";

interface Props {
  items: any[];
  status: string;
  onSelectItem?: (item: any) => void;
  selectedItemId?: string;
}

export default function OrderItems({
  items,
  status,
  onSelectItem,
  selectedItemId,
}: Props) {
  if (!items?.length) {
    return (
      <div className="mb-6 text-center text-xs text-gray-500 italic">
        Sin items
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6 max-h-48 overflow-y-auto custom-scrollbar pr-1">
      {items.map((item, i) => (
        <OrderItem
          key={item._id || i}
          item={item}
          index={i}
          status={status}
          onClick={() => onSelectItem?.(item)}
          selected={selectedItemId === item._id}
        />
      ))}
    </div>
  );
}