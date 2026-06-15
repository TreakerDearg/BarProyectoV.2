import type { Order } from "../../types/order";
import { Martini, Utensils } from "lucide-react";

interface Props {
  order: Order;
  isBar: boolean;
}

export default function OrderHeader({ order, isBar }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${isBar ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
          {isBar ? <Martini size={16} /> : <Utensils size={16} />}
        </div>
        <h3 className="text-lg font-black text-ivory tracking-tighter uppercase leading-none">
          Pedido #{order._id?.slice(-4).toUpperCase()}
        </h3>
      </div>
      <p className="text-xs font-black text-muted uppercase tracking-[0.3em] ml-11">
        {isBar ? 'Barra · Cocktails' : 'Cocina · Platos'}
      </p>
    </div>
  );
}