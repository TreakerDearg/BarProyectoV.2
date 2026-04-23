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
  const wheelRef = useRef<SVGSVGElement>(null);

  /* ==============================
     ANGLES CALCULATION
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
     SPIN LOGIC
  ============================== */
  useEffect(() => {
    if (!result || !spinning) return;

    const selected = slices.find((s) => s._id === result._id);
    if (!selected) return;

    // 🎯 centro del segmento ganador
    const targetAngle =
      selected.startAngle + selected.sliceAngle / 2;

    // 🎡 queremos que el puntero (arriba) apunte a ese segmento
    const finalRotation = 360 * 5 + (360 - targetAngle);

    setRotation(finalRotation);
  }, [result, spinning, slices]);

  return (
    <div className="relative w-72 h-72">
      {/* POINTER */}
      <RoulettePointer />

      {/* WHEEL */}
      <svg
        ref={wheelRef}
        viewBox="0 0 200 200"
        className="w-full h-full transition-transform duration-[4000ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {slices.map((slice) => (
          <RouletteSlice
            key={slice._id}
            startAngle={slice.startAngle}
            sliceAngle={slice.sliceAngle}
            color={slice.color}
            label={slice.name}
          />
        ))}
      </svg>

      {/* CENTER DISC */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-[#0F172A] border border-gray-700 rounded-full shadow-inner" />
      </div>
    </div>
  );
}