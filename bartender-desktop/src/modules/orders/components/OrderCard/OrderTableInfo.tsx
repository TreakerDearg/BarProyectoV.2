import type { Order } from "../../types/order";
import { MapPin } from "lucide-react";

interface Props {
  order: Order;
  tableLabel: string;
}

export default function OrderTableInfo({ tableLabel }: Props) {
  return (
    <div className="flex items-center gap-2">
      <MapPin size={12} className="text-gold" />
      <span className="text-sm font-black text-ivory uppercase tracking-tighter">
        {tableLabel}
      </span>
    </div>
  );
}