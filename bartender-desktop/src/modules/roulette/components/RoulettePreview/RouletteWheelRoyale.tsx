"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { RouletteDrink } from "../../types/roulette";
import RouletteSliceRoyale from "./RouletteSliceRoyale";
import { Flame } from "lucide-react";

interface Props {
  drinks: RouletteDrink[];
  totalWeight: number;
  result?: RouletteDrink;
  spinning?: boolean;
}

export default function RouletteWheelRoyale({
  drinks,
  totalWeight,
  result,
  spinning,
}: Props) {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [, startTransition] = useTransition();
  const wheelRef = useRef<SVGSVGElement>(null);

  const slices = useMemo(() => {
    return drinks.reduce<Array<RouletteDrink & { startAngle: number; sliceAngle: number }>>((result, drink) => {
      const cumulative = result.length === 0
        ? 0
        : result[result.length - 1].startAngle + result[result.length - 1].sliceAngle;
      const startAngle = (cumulative / totalWeight) * 360;
      const sliceAngle = (drink.weight / totalWeight) * 360;
      result.push({ ...drink, startAngle, sliceAngle });
      return result;
    }, []);
  }, [drinks, totalWeight]);

  useEffect(() => {
    if (!result || !spinning) return;

    const selected = slices.find((s) => s._id === result._id);
    if (!selected) return;

    const startAnimation = window.setTimeout(() => startTransition(() => setIsAnimating(true)), 0);

    const targetAngle = selected.startAngle + selected.sliceAngle / 2;
    const extraSpins = 8 + Math.floor(Math.random() * 5);
    const finalRotation = (extraSpins * 360) + (360 - targetAngle);

    window.setTimeout(() => startTransition(() => setRotation(finalRotation)), 0);

    const timeout = setTimeout(() => {
      setIsAnimating(false);
    }, 6000); // Duración de la animación

    return () => {
      window.clearTimeout(startAnimation);
      clearTimeout(timeout);
    };
  }, [result, spinning, slices]);

  return (
    <div className="relative w-112.5 h-112.5 flex items-center justify-center group">
      
      {/* AURA EXTERNA DINÁMICA */}
      <div className={`absolute inset-0 rounded-full border-12 border-white/5 shadow-[0_0_80px_rgba(212,163,64,0.1)] transition-all duration-1000 ${isAnimating ? 'rotate-180 scale-105' : ''}`} />
      
      {/* PUNTOS PERIMETRALES (LUCES) */}
      {[...Array(24)].map((_, i) => (
        <div 
          key={i}
          className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-500 ${isAnimating ? 'bg-gold shadow-gold-glow animate-pulse' : 'bg-white/10'}`}
          style={{
            transform: `rotate(${i * 15}deg) translateY(-210px)`
          }}
        />
      ))}

      {/* CONTENEDOR DE LA RUEDA */}
      <div className="relative w-full h-full p-4 flex items-center justify-center">
        
        {/* PUNTERO SUPERIOR PREMIUM */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-50 flex flex-col items-center">
           <div className="px-3 py-1 bg-gold/10 border border-gold/30 rounded-full mb-2 backdrop-blur-md">
              <span className="text-[8px] font-black text-gold uppercase tracking-[0.2em]">Preview Model</span>
           </div>
           <div className="w-8 h-12 bg-grad-gold rounded-b-full shadow-gold-glow relative flex items-center justify-center border-x border-b border-gold/50">
              <div className="w-1 h-6 bg-bg/50 rounded-full animate-pulse" />
           </div>
        </div>

        <svg
          ref={wheelRef}
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isAnimating ? "transform 6s cubic-bezier(0.1, 0, 0.1, 1)" : "none",
          }}
        >
          {/* SOMBRA INTERNA */}
          <circle cx="100" cy="100" r="98" fill="none" stroke="black" strokeWidth="2" opacity="0.2" />
          
          {slices.map((slice) => (
            <RouletteSliceRoyale
              key={slice._id}
              startAngle={slice.startAngle}
              sliceAngle={slice.sliceAngle}
              color={slice.color}
              label={slice.name}
              rarity={slice.rarity}
              isWinner={!isAnimating && result?._id === slice._id}
            />
          ))}

          {/* BORDE METÁLICO INTERNO */}
          <circle cx="100" cy="100" r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        </svg>

        {/* EJE CENTRAL (THE HUB) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 rounded-full bg-linear-to-b from-surface-3 to-bg border border-white/10 shadow-2xl flex items-center justify-center relative">
             <div className="absolute inset-0 rounded-full bg-gold/5 animate-ping opacity-20" />
             <div className="w-16 h-16 rounded-full bg-bg border border-gold/30 flex items-center justify-center shadow-inner">
                <Flame className={`w-8 h-8 ${isAnimating ? 'text-gold animate-pulse' : 'text-muted/20'}`} />
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
