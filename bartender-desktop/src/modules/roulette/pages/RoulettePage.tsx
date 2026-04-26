"use client";

import { useRoulette } from "../hooks/useRoulette";
import RoulettePreview from "../components/RoulettePreview/RoulettePreview";
import ProductSelector from "../components/ProductSelector";
import RouletteLogs from "../components/RouletteLogs";
import RouletteStats from "../components/RouletteStats";
import ProbabilityEngine from "../components/ProbabilityEngine";

import { Shuffle, Zap } from "lucide-react";

export default function RoulettePage() {
  const {
    drinks,
    loading,
    spinning,
    lastResult,
    totalWeight,
    logs,
    actions,
  } = useRoulette();

  if (loading) {
    return (
      <div className="p-6 text-gray-400 animate-pulse">
        Inicializando engine...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-gray-200">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            ROULETTE ENGINE
            <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
              LIVE
            </span>
          </h1>

          <div className="text-xs text-gray-500 flex items-center gap-2">
            v4.2 • Smart Probability System
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>

        <button
          onClick={actions.spin}
          disabled={spinning}
          className={`
            flex items-center gap-2 px-6 py-2 rounded-xl font-semibold
            transition-all duration-300
            ${
              spinning
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-cyan-400 hover:brightness-110 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            }
          `}
        >
          <Shuffle size={16} />
          {spinning ? "Spinning..." : "Spin"}
        </button>
      </div>

      {/* ================= STATS ================= */}
      <RouletteStats
        drinks={drinks}
        lastResult={lastResult}
        totalWeight={totalWeight}
      />

      {/* ================= MAIN ================= */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ================= LEFT PANEL ================= */}
        <div className="lg:col-span-2 space-y-6">

          {/* PROBABILITY ENGINE */}
          <ProbabilityEngine
            drinks={drinks}
            onUpdate={actions.update}
            onAutoBalance={actions.autoBalance}
          />

          {/* PRODUCT SELECTOR */}
          <div className="
            bg-gradient-to-b from-[#0B1220] to-[#020617]
            border border-blue-500/10
            rounded-2xl p-4
            shadow-[0_0_25px_rgba(59,130,246,0.05)]
          ">
            <ProductSelector
              onSelect={(product) =>
                actions.create({
                  name: product.name,
                  weight: 10,
                  color: "#3B82F6",
                })
              }
            />
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="space-y-6">

          {/* ROULETTE VISUAL */}
          <div className="
            bg-gradient-to-b from-[#0B1220] to-[#020617]
            border border-blue-500/10
            rounded-2xl p-4
            shadow-[0_0_40px_rgba(59,130,246,0.08)]
          ">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs text-gray-500 tracking-wide">
                LIVE PREVIEW
              </h2>

              {spinning && (
                <div className="flex items-center gap-1 text-blue-400 text-xs">
                  <Zap size={12} className="animate-pulse" />
                  Running
                </div>
              )}
            </div>

            <RoulettePreview
              drinks={drinks}
              result={lastResult?.result}
              spinning={spinning}
            />
          </div>

          {/* LOGS */}
          <RouletteLogs logs={logs} />
        </div>
      </div>
    </div>
  );
}