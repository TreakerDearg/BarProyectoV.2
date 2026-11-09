"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RouletteDrink, SpinPhase } from "../../types/roulette";
import RouletteSliceRoyale from "./RouletteSliceRoyale";
import RoulettePointer from "./RoulettePointer";
import { Wine, Sparkles } from "lucide-react";

interface Props {
  drinks: RouletteDrink[];
  totalWeight: number;
  phase: SpinPhase;
  targetAngle: number | null;
  onLanded: () => void;
  revealedDrinkId?: string | null;
}

export default function RouletteWheelRoyale({
  drinks,
  totalWeight,
  phase,
  targetAngle,
  onLanded,
  revealedDrinkId,
}: Props) {
  const [rotation, setRotation] = useState(0);
  const [transitionStyle, setTransitionStyle] = useState("none");
  const [needleBounce, setNeedleBounce] = useState(false);

  // Chase lighting state
  const [chaseOffset, setChaseOffset] = useState(0);
  const chaseRafRef = useRef<number | null>(null);

  // Free-spin loop refs
  const freeSpinRafRef = useRef<number | null>(null);
  const freeSpinAngleRef = useRef(0);
  const lastFreeSpinTimestampRef = useRef<number>(0);

  const wheelRef = useRef<SVGSVGElement>(null);
  const onLandedRef = useRef(onLanded);
  useEffect(() => {
    onLandedRef.current = onLanded;
  }, [onLanded]);

  /* ==============================
     Slices computation
  ============================== */
  const activeDrinks = useMemo(() => drinks.filter((d) => d && d.active), [drinks]);

  const slices = useMemo(() => {
    const pool = activeDrinks.length > 0 ? activeDrinks : drinks;
    const effectiveTotal = pool.reduce((acc, d) => acc + (d.weight || 1), 0) || 1;

    return pool.reduce<Array<RouletteDrink & { startAngle: number; sliceAngle: number }>>(
      (acc, drink) => {
        const cumulative =
          acc.length === 0
            ? 0
            : acc[acc.length - 1].startAngle + acc[acc.length - 1].sliceAngle;
        const startAngle = (cumulative / effectiveTotal) * 360;
        const sliceAngle = ((drink.weight || 1) / effectiveTotal) * 360;
        acc.push({ ...drink, startAngle, sliceAngle });
        return acc;
      },
      []
    );
  }, [activeDrinks, drinks]);

  /* ==============================
     Phase-driven animation
  ============================== */
  useEffect(() => {
    if (phase === "spinning") {
      setTransitionStyle("none");

      const loop = (timestamp: number) => {
        if (lastFreeSpinTimestampRef.current === 0) {
          lastFreeSpinTimestampRef.current = timestamp;
        }
        const delta = timestamp - lastFreeSpinTimestampRef.current;
        lastFreeSpinTimestampRef.current = timestamp;

        freeSpinAngleRef.current = freeSpinAngleRef.current + (delta / 1000) * 220;
        setRotation(freeSpinAngleRef.current);

        freeSpinRafRef.current = requestAnimationFrame(loop);
      };

      freeSpinRafRef.current = requestAnimationFrame(loop);

      return () => {
        if (freeSpinRafRef.current !== null) {
          cancelAnimationFrame(freeSpinRafRef.current);
          freeSpinRafRef.current = null;
        }
        lastFreeSpinTimestampRef.current = 0;
      };
    }

    if (phase === "revealing" && targetAngle !== null) {
      if (freeSpinRafRef.current !== null) {
        cancelAnimationFrame(freeSpinRafRef.current);
        freeSpinRafRef.current = null;
      }
      lastFreeSpinTimestampRef.current = 0;

      const fullRotations = Math.ceil(freeSpinAngleRef.current / 360) + 2;
      const finalAngle = fullRotations * 360 + targetAngle;
      freeSpinAngleRef.current = finalAngle;

      setTransitionStyle("transform 5s cubic-bezier(0.12, 0.85, 0.25, 1)");

      requestAnimationFrame(() => {
        setRotation(finalAngle);
      });

      const timer = setTimeout(() => {
        onLandedRef.current();
      }, 5100);

      return () => clearTimeout(timer);
    }

    if (phase === "idle" || phase === "revealed") {
      if (freeSpinRafRef.current !== null) {
        cancelAnimationFrame(freeSpinRafRef.current);
        freeSpinRafRef.current = null;
      }
      lastFreeSpinTimestampRef.current = 0;
      setTransitionStyle("none");
    }
  }, [phase, targetAngle]);

  /* ==============================
     Needle bounce on landing
  ============================== */
  useEffect(() => {
    if (phase === "landing") {
      setNeedleBounce(true);
      const t = setTimeout(() => setNeedleBounce(false), 450);
      return () => clearTimeout(t);
    }
  }, [phase]);

  /* ==============================
     Chase lighting animation
  ============================== */
  useEffect(() => {
    const isActive = phase === "spinning" || phase === "revealing";

    if (isActive) {
      const startTime = performance.now();

      const loop = (now: number) => {
        const elapsed = (now - startTime) / 1000;
        setChaseOffset((elapsed * 3 * Math.PI * 2) % (2 * Math.PI));
        chaseRafRef.current = requestAnimationFrame(loop);
      };

      chaseRafRef.current = requestAnimationFrame(loop);

      return () => {
        if (chaseRafRef.current !== null) {
          cancelAnimationFrame(chaseRafRef.current);
          chaseRafRef.current = null;
        }
      };
    } else {
      if (chaseRafRef.current !== null) {
        cancelAnimationFrame(chaseRafRef.current);
        chaseRafRef.current = null;
      }
      setChaseOffset(0);
    }
  }, [phase]);

  const isActive = phase === "spinning" || phase === "revealing";

  /* ==============================
     24 Rivets y LEDs perimetrales
  ============================== */
  const perimeterLights = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const angleRad = ((i * 15 - 90) * Math.PI) / 180;
        return {
          cx: 100 + 97 * Math.cos(angleRad),
          cy: 100 + 97 * Math.sin(angleRad),
          phaseOffset: (i / 24) * 2 * Math.PI,
        };
      }),
    []
  );

  return (
    <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] lg:w-[460px] lg:h-[460px] flex items-center justify-center select-none">
      {/* Halo ambiental profundo Slate Elegante */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
          isActive
            ? "bg-gold/15 blur-[60px] scale-105"
            : phase === "revealed"
            ? "bg-emerald/15 blur-[60px] scale-100"
            : "bg-surface-3/30 blur-[40px]"
        }`}
      />

      {/* Puntero Superior Daga Royale */}
      <RoulettePointer needleBounce={needleBounce} isActive={isActive} />

      {/* Contenedor SVG de la Ruleta */}
      <div className="relative w-full h-full p-2 flex items-center justify-center">
        <svg
          ref={wheelRef}
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] filter"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: transitionStyle,
          }}
        >
          <defs>
            {/* Bisel de Oro Pulido multicapa */}
            <radialGradient id="bezel-metal" cx="50%" cy="50%" r="50%">
              <stop offset="90%" stopColor="#161B22" />
              <stop offset="94%" stopColor="#C8920F" />
              <stop offset="97%" stopColor="#F5C842" />
              <stop offset="99%" stopColor="#F0B429" />
              <stop offset="100%" stopColor="#8A6008" />
            </radialGradient>

            <linearGradient id="bezel-gold-linear" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5C842" />
              <stop offset="30%" stopColor="#F0B429" />
              <stop offset="50%" stopColor="#C8920F" />
              <stop offset="70%" stopColor="#F5C842" />
              <stop offset="100%" stopColor="#8A6008" />
            </linearGradient>
          </defs>

          {/* Sombra base */}
          <circle cx="100" cy="100" r="99" fill="#090E14" />

          {/* Bisel exterior de oro */}
          <circle
            cx="100"
            cy="100"
            r="98.5"
            fill="none"
            stroke="url(#bezel-gold-linear)"
            strokeWidth="3"
          />

          {/* Anillo de contraste Slate */}
          <circle
            cx="100"
            cy="100"
            r="95.5"
            fill="none"
            stroke="#161B22"
            strokeWidth="1"
          />

          {/* Gajos / Slices */}
          {slices.map((slice, index) => (
            <RouletteSliceRoyale
              key={slice._id}
              index={index}
              startAngle={slice.startAngle}
              sliceAngle={slice.sliceAngle}
              color={slice.color}
              label={slice.name}
              rarity={slice.rarity}
              isWinner={phase === "revealed" && revealedDrinkId === slice._id}
            />
          ))}

          {/* Anillo interior de fijación */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="rgba(240, 180, 41, 0.4)"
            strokeWidth="0.6"
          />

          {/* 24 Pernos / Luces LED Perimetrales */}
          {perimeterLights.map((light, i) => {
            const opacity = isActive
              ? 0.25 + 0.75 * Math.max(0, Math.sin(chaseOffset + light.phaseOffset))
              : 0.4;
            const isLit = opacity > 0.6;

            return (
              <g key={`pin-${i}`}>
                {/* Remache base de oro */}
                <circle
                  cx={light.cx}
                  cy={light.cy}
                  r="1.4"
                  fill="#F0B429"
                  stroke="#161B22"
                  strokeWidth="0.3"
                />
                {/* Destello del LED */}
                <circle
                  cx={light.cx}
                  cy={light.cy}
                  r={isLit ? "1.8" : "1.0"}
                  fill={isLit ? "#FFFFFF" : "#F5C842"}
                  opacity={opacity}
                />
              </g>
            );
          })}
        </svg>

        {/* Buje Central Compacto (The Crown Core) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#1C2333] via-[#161B22] to-[#0D1117] border-2 border-gold shadow-[0_0_20px_rgba(240,180,41,0.3)] flex items-center justify-center">
            {/* Halo rotatorio interior cuando gira */}
            {isActive && (
              <div className="absolute inset-0 rounded-full border border-gold-light/40 animate-ping opacity-30" />
            )}

            {/* Centro medalla */}
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-surface-2 border border-border flex items-center justify-center shadow-inner">
              {phase === "revealed" ? (
                <Sparkles className="w-6 h-6 text-gold animate-bounce" />
              ) : (
                <Wine
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
                    isActive ? "text-gold animate-pulse" : "text-gold/80"
                  }`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
