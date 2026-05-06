import { useEffect, useState } from "react";
import type { Order } from "../../types/order";
import { Clock } from "lucide-react";

interface Props {
  order: Order;
}

export default function OrderTimer({ order }: Props) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(order.createdAt).getTime();
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTime(`${mins}:${secs.toString().padStart(2, "0")}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const minutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  const isWarning = minutes > 10;
  const isCritical = minutes > 15;

  return (
    <div className={`flex items-center gap-2 ${isCritical ? 'text-brand' : isWarning ? 'text-ember' : 'text-ivory'}`}>
      <Clock size={12} className={isCritical ? 'animate-pulse' : ''} />
      <span className="text-sm font-black tracking-widest font-mono">
        {time}
      </span>
    </div>
  );
}