"use client";

import { useMemo } from "react";
import type { RouletteDrink, SpinPhase } from "../../types/roulette";
import RouletteWheelRoyale from "./RouletteWheelRoyale";

interface Props {
  drinks: RouletteDrink[];
  phase: SpinPhase;
  targetAngle: number | null;
  onWheelLanded: () => void;
  revealedResult?: RouletteDrink | null;
}

export default function RoulettePreview({
  drinks,
  phase,
  targetAngle,
  onWheelLanded,
  revealedResult,
}: Props) {
  const totalWeight = useMemo(
    () => drinks.reduce((acc, d) => acc + (d.weight || 0), 0),
    [drinks]
  );

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      {/* Contenedor de la Rueda Royale */}
      <div className="relative flex items-center justify-center w-full py-4">
        <RouletteWheelRoyale
          drinks={drinks}
          totalWeight={totalWeight}
          phase={phase}
          targetAngle={targetAngle}
          onLanded={onWheelLanded}
          revealedDrinkId={revealedResult?._id ?? null}
        />
      </div>
    </div>
  );
}
