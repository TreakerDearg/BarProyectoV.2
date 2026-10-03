"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RouletteDrink, SpinPhase } from "../../types/roulette";
import RouletteSliceRoyale from "./RouletteSliceRoyale";
import { Flame } from "lucide-react";

interface Props {
  drinks: RouletteDrink[];
  totalWeight: number;
  phase: SpinPhase;
  targetAngle: number | null;
  onLanded: () => void;
  /** _id of the winning drink — only used to highlight after phase==='revealed' */
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
  useEffect(() => { onLandedRef.current = onLanded; }, [onLanded]);

  /* ==============================
     Slices computation
  ============================== */
  const slices = useMemo(() => {
    return drinks.reduce<Array<RouletteDrink & { startAngle: number; sliceAngle: number }>>(
      (acc, drink) => {
        const cumulative =
          acc.length === 0
            ? 0
            : acc[acc.length - 1].startAngle + acc[acc.length - 1].sliceAngle;
        const startAngle = (cumulative / totalWeight) * 360;
        const sliceAngle = (drink.weight / totalWeight) * 360;
        acc.push({ ...drink, startAngle, sliceAngle });
        return acc;
      },
      []
    );
  }, [drinks, totalWeight]);

  /* ==============================
     Phase-driven animation
  ============================== */
  useEffect(() => {
    if (phase === "spinning") {
      // Start free-spin loop ~180 deg/s
      setTransitionStyle("none");

      const loop = (timestamp: number) => {
        if (lastFreeSpinTimestampRef.current === 0) {
          lastFreeSpinTimestampRef.current = timestamp;
        }
        const delta = timestamp - lastFreeSpinTimestampRef.current;
        lastFreeSpinTimestampRef.current = timestamp;

        freeSpinAngleRef.current = freeSpinAngleRef.current + (delta / 1000) * 180;
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
      // Stop free-spin loop
      if (freeSpinRafRef.current !== null) {
        cancelAnimationFrame(freeSpinRafRef.current);
        freeSpinRafRef.current = null;
      }
      lastFreeSpinTimestampRef.current = 0;

      // Add enough full rotations so it doesn't spin backwards from current position
      const fullRotations = Math.ceil(freeSpinAngleRef.current / 360);
      const finalAngle = fullRotations * 360 + targetAngle;
      freeSpinAngleRef.current = finalAngle;

      // Apply ease-out transition
      setTransitionStyle("transform 5s cubic-bezier(0.15, 0.8, 0.3, 1)");

      // rAF to ensure transition is applied after DOM flush
      requestAnimationFrame(() => {
        setRotation(finalAngle);
      });

      // Call onLanded after animation completes
      const timer = setTimeout(() => {
        onLandedRef.current();
      }, 5100);

      return () => clearTimeout(timer);
    }

    if (phase === "idle" || phase === "revealed") {
      // Stop free-spin loop
      if (freeSpinRafRef.current !== null) {
        cancelAnimationFrame(freeSpinRafRef.current);
        freeSpinRafRef.current = null;
      }
      lastFreeSpinTimestampRef.current = 0;
      setTransitionStyle("none");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, targetAngle]);

  /* ==============================
     Needle bounce on landing
  ============================== */
  useEffect(() => {
    if (phase === "landing") {
      setNeedleBounce(true);
      const t = setTimeout(() => setNeedleBounce(false), 400);
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
        // 2 full pattern rotations per second
        setChaseOffset((elapsed * 2 * Math.PI * 2) % (2 * Math.PI));
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
     36 rivets at r=96
  ============================== */
  const rivets = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const angleRad = ((i * 10 - 90) * Math.PI) / 180;
        return {
          cx: 100 + 96 * Math.cos(angleRad),
          cy: 100 + 96 * Math.sin(angleRad),
        };
      }),
    []
  );

  /* ==============================
     12 chase lights at r=98
  ============================== */
  const chaseLights = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const angleRad = ((i * 30 - 90) * Math.PI) / 180;
        return {
          cx: 100 + 98 * Math.cos(angleRad),
          cy: 100 + 98 * Math.sin(angleRad),
          phaseOffset: (i / 12) * 2 * Math.PI,
        };
      }),
    []
  );

  return (
    <div className="relative w-112.5 h-112.5 flex items-center justify-center group">

      {/* AURA EXTERNA DINÁMICA */}
      <div
        className={`absolute inset-0 rounded-full border-12 border-white/5 shadow-[0_0_80px_rgba(212,163,64,0.1)] transition-all duration-1000 ${isActive ? "scale-105" : ""}`}
      />

      {/* PUNTOS PERIMETRALES (LUCES) */}
      {Array.from({ length: 24 }, (_, i) => (
        <div
          key={i}
          className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-500 ${isActive ? "bg-gold shadow-gold-glow animate-pulse" : "bg-white/10"}`}
          style={{ transform: `rotate(${i * 15}deg) translateY(-210px)` }}
        />
      ))}

      {/* CONTENEDOR DE LA RUEDA */}
      <div className="relative w-full h-full p-4 flex items-center justify-center">

        {/* PUNTERO SUPERIOR PREMIUM */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-50 flex flex-col items-center ${needleBounce ? "needle-bounce" : ""}`}
        >
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
            transition: transitionStyle,
          }}
        >
          <defs>
            {/* Golden bezel gradient */}
            <linearGradient id="bezel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#D4A340" />
              <stop offset="25%"  stopColor="#F7E08A" />
              <stop offset="50%"  stopColor="#D4A340" />
              <stop offset="75%"  stopColor="#8B6914" />
              <stop offset="100%" stopColor="#D4A340" />
            </linearGradient>
          </defs>

          {/* SOMBRA INTERNA */}
          <circle cx="100" cy="100" r="98" fill="none" stroke="black" strokeWidth="2" opacity="0.2" />

          {/* SLICES */}
          {slices.map((slice) => (
            <RouletteSliceRoyale
              key={slice._id}
              startAngle={slice.startAngle}
              sliceAngle={slice.sliceAngle}
              color={slice.color}
              label={slice.name}
              rarity={slice.rarity}
              isWinner={phase === "revealed" && revealedDrinkId === slice._id}
            />
          ))}

          {/* GOLDEN BEZEL — outer ring */}
          <circle
            cx="100" cy="100" r="99"
            fill="none"
            stroke="url(#bezel-grad)"
            strokeWidth="2.5"
          />
          {/* GOLDEN BEZEL — inner ring (double-ring effect) */}
          <circle
            cx="100" cy="100" r="95"
            fill="none"
            stroke="url(#bezel-grad)"
            strokeWidth="0.8"
            opacity="0.5"
          />

          {/* 36 RIVETS at r=96 */}
          {rivets.map((pos, i) => (
            <circle
              key={`rivet-${i}`}
              cx={pos.cx}
              cy={pos.cy}
              r="1.2"
              fill="#D4A340"
              opacity="0.85"
            />
          ))}

          {/* 12 CHASE LIGHTS at r=98 */}
          {chaseLights.map((light, i) => {
            const opacity = isActive
              ? 0.15 + 0.75 * Math.max(0, Math.sin(chaseOffset + light.phaseOffset))
              : 0.08;
            return (
              <circle
                key={`chase-${i}`}
                cx={light.cx}
                cy={light.cy}
                r="2"
                fill="#F7E08A"
                opacity={opacity}
              />
            );
          })}
        </svg>

        {/* EJE CENTRAL (THE HUB) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 rounded-full bg-linear-to-b from-surface-3 to-bg border border-white/10 shadow-2xl flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full bg-gold/5 animate-ping opacity-20" />
            <div className="w-16 h-16 rounded-full bg-bg border border-gold/30 flex items-center justify-center shadow-inner">
              <Flame className={`w-8 h-8 ${isActive ? "text-gold animate-pulse" : "text-muted/20"}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
