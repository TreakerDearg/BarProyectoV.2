"use client";

import { Martini } from "lucide-react";

export default function OrdersHeader() {
  const time = new Date().toLocaleTimeString();

  return (
    <div className="flex items-center justify-between mb-6 border-b border-pink-500 pb-4">
      <div className="flex items-center gap-3">
        <Martini className="text-pink-500" size={28} />
        <div>
          <h1 className="text-xl font-bold neon-text">
            NEON BAR CONTROL
          </h1>
          <p className="text-xs text-zinc-400">
            SYSTEM ONLINE // v2.4.0
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-cyan-400 text-xl font-mono">{time}</p>
        <p className="text-xs text-zinc-400">SERVER TIME</p>
      </div>
    </div>
  );
}