"use client";

import { Wand2, Sparkles } from "lucide-react";
import type { RouletteDrink } from "../types/roulette";

interface Props {
  drinks: RouletteDrink[];
  onUpdate: (id: string, data: Partial<RouletteDrink>) => void;
  onAutoBalance: (mode: "equal" | "smooth" | "smart") => void;
}

export default function ProbabilityEngine({
  drinks,
  onUpdate,
  onAutoBalance,
}: Props) {

  const maxWeight = Math.max(...drinks.map(d => d.weight || 1), 1);

  return (
    <div className="relative bg-gradient-to-b from-[#0A0F1F] to-[#020617] border border-blue-500/10 rounded-2xl p-5 shadow-[0_0_50px_rgba(59,130,246,0.12)] overflow-hidden">

      {/* 🔥 GLOBAL GLOW */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h2 className="text-white font-semibold tracking-wide flex items-center gap-2">
            <Sparkles size={14} className="text-blue-400" />
            Probability Engine
          </h2>
          <p className="text-xs text-gray-500">
            Adaptive weight distribution system
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onAutoBalance("smart")}
            className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-blue-500/20 transition"
          >
            <Wand2 size={12} />
            Smart
          </button>

          <button
            onClick={() => onAutoBalance("smooth")}
            className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-cyan-500/20 transition"
          >
            Smooth
          </button>

          <button
            onClick={() => onAutoBalance("equal")}
            className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-amber-500/20 transition"
          >
            Equal
          </button>
        </div>
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 relative z-10">

        {drinks.map((drink) => {
          const percent = drink.probability ?? 0;
          const dominance = drink.weight / maxWeight;

          const isDominant = dominance > 0.75;

          return (
            <div
              key={drink._id}
              className={`
                group relative p-4 rounded-xl border transition-all
                bg-[#020617]
                ${
                  drink.active
                    ? "border-blue-500/20 hover:border-blue-500/40"
                    : "border-gray-800 opacity-50"
                }
                ${isDominant ? "shadow-[0_0_15px_rgba(59,130,246,0.25)]" : ""}
              `}
            >

              {/* 🔥 DOMINANCE GLOW */}
              {isDominant && (
                <div className="absolute inset-0 rounded-xl bg-blue-500/5 pointer-events-none" />
              )}

              {/* HEADER */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-white text-sm font-medium">
                  {drink.name}
                </span>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-400">
                    {drink.weight}
                  </span>

                  <span className="text-blue-400 font-semibold">
                    {percent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* ================= PROGRESS ================= */}
              <div className="relative w-full h-2 bg-gray-800 rounded-full mb-3 overflow-hidden">

                <div
                  className="h-full transition-all duration-500 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300"
                  style={{ width: `${percent}%` }}
                />

                {/* glow overlay */}
                <div
                  className="absolute inset-0 blur-md opacity-40"
                  style={{
                    background: `linear-gradient(90deg, #3b82f6, #22d3ee)`,
                    width: `${percent}%`,
                  }}
                />
              </div>

              {/* ================= SLIDER PRO ================= */}
              <input
                type="range"
                min={1}
                max={100}
                value={drink.weight}
                onChange={(e) =>
                  onUpdate(drink._id, {
                    weight: Number(e.target.value),
                  })
                }
                className="
                  w-full appearance-none bg-transparent cursor-pointer

                  [&::-webkit-slider-runnable-track]:h-2
                  [&::-webkit-slider-runnable-track]:bg-gray-800
                  [&::-webkit-slider-runnable-track]:rounded-full

                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-blue-500
                  [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(59,130,246,0.9)]
                  [&::-webkit-slider-thumb]:-mt-1.5

                  hover:[&::-webkit-slider-thumb]:scale-110
                  active:[&::-webkit-slider-thumb]:scale-125
                  transition-all
                "
              />

              {/* ================= FOOT ================= */}
              <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2">

                <span>
                  {drink.category}
                </span>

                <div className="flex gap-2">
                  {isDominant && (
                    <span className="text-cyan-400">
                      Dominant
                    </span>
                  )}

                  {!drink.active && (
                    <span className="text-red-400">
                      Disabled
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="text-right text-xs text-green-400 mt-5 font-semibold relative z-10">
        Total Probability: 100%
      </div>
    </div>
  );
}