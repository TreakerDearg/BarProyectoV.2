import { useEffect, useState } from "react";

export default function OrderTimer({ order }: any) {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const interval = setInterval(() => {
      if (!order.createdAt) return;

      const diff = Date.now() - new Date(order.createdAt).getTime();
      const min = Math.floor(diff / 60000);
      const sec = Math.floor((diff % 60000) / 1000);

      setTime(`${min}:${sec.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  return (
    <div className="text-right">
      <p className="text-2xl font-bold text-[#8B5CF6]">{time}</p>
      <p className="text-[9px] uppercase text-[#8B5CF6]">{order.status}</p>
    </div>
  );
}