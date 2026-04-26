"use client";

import { useEffect, useState } from "react";
import { Triangle } from "lucide-react";

interface Props {
  spinning?: boolean;
}

export default function RoulettePointer({ spinning }: Props) {
  const [active, setActive] = useState(false);

  /* =========================
     MICRO ANIMATION (TICK)
  ========================= */
  useEffect(() => {
    if (!spinning) return;

    let interval: any;

    interval = setInterval(() => {
      setActive((prev) => !prev);
    }, 120);

    return () => clearInterval(interval);
  }, [spinning]);

  return (
    <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">

      {/* GLOW */}
      <div className="absolute w-8 h-8 bg-blue-500/20 blur-xl rounded-full" />

      {/* POINTER BODY */}
      <div
        className={`
          relative transition-transform duration-75
          ${active ? "translate-y-[1px]" : "-translate-y-[1px]"}
        `}
      >
        {/* METAL BASE */}
        <div className="w-4 h-4 rounded-full bg-gradient-to-b from-gray-300 to-gray-600 border border-gray-500 shadow-md mb-[-4px]" />

        {/* TRIANGLE */}
        <Triangle
          size={28}
          className="fill-amber-400 text-amber-500 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]"
        />
      </div>

      {/* SHADOW */}
      <div className="w-6 h-1 bg-black/50 blur-sm rounded-full mt-1" />
    </div>
  );
}