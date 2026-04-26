"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RouletteDrink } from "../../types/roulette";
import RouletteSlice from "./RouletteSlice";
import RoulettePointer from "./RoulettePointer";

interface Props {
  drinks: RouletteDrink[];
  totalWeight: number;
  result?: RouletteDrink;
  spinning?: boolean;
}

export default function RouletteWheel({
  drinks,
  totalWeight,
  result,
  spinning,
}: Props) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);

  /* ==============================
     CALCULAR SLICES
  ============================== */
  const slices = useMemo(() => {
    let cumulative = 0;

    return drinks.map((drink) => {
      const startAngle = (cumulative / totalWeight) * 360;
      const sliceAngle = (drink.weight / totalWeight) * 360;

      cumulative += drink.weight;

      return {
        ...drink,
        startAngle,
        sliceAngle,
      };
    });
  }, [drinks, totalWeight]);

  /* ==============================
     SPIN ENGINE PRO 🔥
  ============================== */
  useEffect(() => {
    if (!result || !spinning) return;

    const selected = slices.find((s) => s._id === result._id);
    if (!selected) return;

    setIsSpinning(true);

    /* 🎯 centro del slice */
    const targetAngle =
      selected.startAngle + selected.sliceAngle / 2;

    /* 🎲 variación random */
    const randomOffset = Math.random() * 10 - 5;

    /* 🔥 vueltas + desaceleración */
    const spins = 5 + Math.random() * 2;

    const final =
      360 * spins + (360 - targetAngle) + randomOffset;

    setRotation(final);

    /* ⏱️ fin animación */
    const timeout = setTimeout(() => {
      setIsSpinning(false);
    }, 4200);

    return () => clearTimeout(timeout);
  }, [result, spinning, slices]);

  /* ==============================
     HIGHLIGHT WINNER
  ============================== */
  const winnerId = result?._id;

  return (
    <div className="relative w-80 h-80">

      {/* 🔥 GLOW GLOBAL */}
      <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl animate-pulse pointer-events-none" />

      {/* POINTER */}
      <RoulettePointer />

      {/* WHEEL */}
      <svg
        ref={wheelRef}
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? "transform 4.2s cubic-bezier(0.15,0.8,0.2,1)"
            : "none",
        }}
      >
        {slices.map((slice) => (
          <RouletteSlice
            key={slice._id}
            startAngle={slice.startAngle}
            sliceAngle={slice.sliceAngle}
            color={slice.color}
            label={slice.name}
            isWinner={winnerId === slice._id}
          />
        ))}
      </svg>

      {/* CENTER DISC PRO */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#0F172A] to-[#020617] border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center">

          <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.9)]" />

        </div>
      </div>
    </div>
  );
}