// pages/RoulettePage.tsx

import { useRoulette } from "../hooks/useRoulette";
import RoulettePreview from "../components/RoulettePreview/RoulettePreview";
import ProductSelector from "../components/ProductSelector";
import RouletteLogs from "../components/RouletteLogs";

import { Activity, Flame, Percent, Shuffle } from "lucide-react";

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
      <div className="p-6 text-gray-400">
        Inicializando engine...
      </div>
    );
  }

  const activeDrinks = drinks.filter((d) => d.active);
  const avgWeight =
    activeDrinks.reduce((acc, d) => acc + d.weight, 0) /
      (activeDrinks.length || 1);

  return (
    <div className="p-6 space-y-6 text-gray-200">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Roulette Configurator
          </h1>
          <div className="text-xs text-gray-500">
            Algorithm v4.2 • Active Pool
          </div>
        </div>

        <button
          onClick={actions.spin}
          disabled={spinning}
          className="bg-[#7A6BFA] hover:bg-[#6a5af0] px-5 py-2 rounded-xl font-medium transition disabled:opacity-50 shadow-lg flex items-center gap-2"
        >
          <Shuffle size={16} />
          {spinning ? "Spinning..." : "Spin"}
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity size={16} />}
          label="Active Options"
          value={activeDrinks.length}
        />

        <StatCard
          icon={<Flame size={16} />}
          label="Avg Weight"
          value={avgWeight.toFixed(1)}
        />

        <StatCard
          icon={<Percent size={16} />}
          label="Total Weight"
          value={totalWeight}
        />

        <StatCard
          icon={<Shuffle size={16} />}
          label="Last Result"
          value={lastResult?.result.name || "-"}
        />
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ================= LEFT PANEL ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* PROBABILITY ENGINE */}
          <div className="bg-[#1A1B23] border border-gray-800 rounded-2xl p-5 shadow">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-white font-semibold">
                  Probability Engine
                </h2>
                <p className="text-xs text-gray-500">
                  Distribución de pesos en tiempo real
                </p>
              </div>

              <button className="bg-[#7A6BFA]/20 text-[#A78BFA] px-3 py-1 rounded-lg text-sm">
                Auto Balance
              </button>
            </div>

            <div className="space-y-4">
              {drinks.map((drink) => (
                <div key={drink._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">
                      {drink.name}
                    </span>
                    <span className="text-gray-400">
                      {drink.probability?.toFixed(1)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={drink.weight}
                    onChange={(e) =>
                      actions.update(drink._id, {
                        weight: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#7A6BFA]"
                  />
                </div>
              ))}
            </div>

            <div className="text-right text-xs text-green-400 mt-4">
              Total Probability: 100%
            </div>
          </div>

          {/* PRODUCT SELECTOR */}
          <div className="bg-[#1A1B23] border border-gray-800 rounded-2xl p-4">
            <ProductSelector
              onSelect={(product) =>
                actions.create({
                  name: product.name,
                  weight: 10,
                  color: "#7A6BFA",
                })
              }
            />
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="space-y-6">
          {/* PREVIEW */}
          <div className="bg-[#1A1B23] border border-gray-800 rounded-2xl p-4">
            <h2 className="text-sm text-gray-400 mb-3">
              Live Preview
            </h2>

            <RoulettePreview drinks={drinks} />
          </div>

          {/* LOGS */}
          <RouletteLogs logs={logs} />
        </div>
      </div>
    </div>
  );
}

/* ==============================
   STAT CARD
============================== */
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="bg-[#1A1B23] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
      <div className="text-[#7A6BFA]">{icon}</div>

      <div>
        <div className="text-xs text-gray-500">
          {label}
        </div>
        <div className="text-white font-semibold">
          {value}
        </div>
      </div>
    </div>
  );
}