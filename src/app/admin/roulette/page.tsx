"use client";

import { useState } from "react";
import { Plus, RefreshCw, Sparkles, History, SlidersHorizontal, BookOpen, AlertCircle } from "lucide-react";
import { useRouletteAdmin } from "./hooks/useRouletteAdmin";
import RouletteAdminList from "./components/RouletteAdminList";
import RouletteForm from "./components/RouletteForm";
import RouletteStatsDashboard from "./components/RouletteStatsDashboard";
import type { RouletteDrink } from "./services/rouletteService";


export default function RoulettePage() {
  const {
    drinks,
    logs,
    loading,
    spinning,
    lastResult,
    error,
    stats,
    loadDrinks,
    loadLogs,
    createDrink,
    updateDrink,
    deleteDrink,
    spin,
    autoBalance,
  } = useRouletteAdmin();

  const [selectedDrink, setSelectedDrink] = useState<RouletteDrink | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleCreate = async () => {
    setSelectedDrink(null);
    setIsFormOpen(true);
  };

  const handleEdit = (drink: RouletteDrink) => {
    setSelectedDrink(drink);
    setIsFormOpen(true);
  };

  const handleSave = async (drink: Partial<RouletteDrink>) => {
    if (selectedDrink) {
      await updateDrink(selectedDrink._id, drink);
    } else {
      await createDrink(drink);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este trago?")) return;
    
    setDeletingId(id);
    try {
      await deleteDrink(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    await updateDrink(id, { active });
  };

  const handleWeightUpdate = async (id: string, weight: number) => {
    await updateDrink(id, { weight });
  };

  const handleSpin = async () => {
    // Foolproof validation
    const activeDrinks = drinks.filter(d => d.active);
    if (activeDrinks.length === 0) {
      alert("No hay tragos activos en la ruleta. Activa al menos un trago antes de ejecutar un spin.");
      return;
    }
    await spin();
  };

  const handleAutoBalance = async (mode: "equal" | "smart" = "smart") => {
    // Foolproof validation
    if (drinks.length === 0) {
      alert("No hay tragos configurados para auto-balancear. Añade tragos primero.");
      return;
    }

    const activeDrinks = drinks.filter(d => d.active);
    if (activeDrinks.length === 0) {
      alert("No hay tragos activos para auto-balancear. Activa al menos un trago.");
      return;
    }

    const modeDescriptions = {
      equal: "distribuirá probabilidades equitativamente entre todos los tragos activos",
      smart: "ajustará inteligentemente según rarezas y configuración actual"
    };

    if (!confirm(`¿Aplicar auto-balance en modo ${mode.toUpperCase()}?\n\nEsto ${modeDescriptions[mode]} para ${activeDrinks.length} tragos activos.\n\nLos pesos actuales serán reemplazados.`)) return;
    await autoBalance(mode);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-500" />
            Roulette
          </h1>
          <p className="text-zinc-400 mt-1">Gestión del módulo de roulette.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTutorial(true)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Tutorial
          </button>
          <button
            onClick={() => loadDrinks()}
            disabled={loading}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Trago
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Dashboard */}
      <RouletteStatsDashboard stats={stats} lastResult={lastResult} />

      {/* Actions Bar */}
      <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <button
          onClick={handleSpin}
          disabled={spinning}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
        >
          <Sparkles className={`w-5 h-5 ${spinning ? "animate-spin" : ""}`} />
          {spinning ? "Girando..." : "Ejecutar Spin"}
        </button>

        <div className="flex items-center gap-2 border-l border-zinc-700 pl-4">
          <button
            onClick={() => handleAutoBalance("equal")}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Auto-Balance Equal
          </button>
          <button
            onClick={() => handleAutoBalance("smart")}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Auto-Balance Smart
          </button>
        </div>

        <button
          onClick={() => setShowLogs(!showLogs)}
          className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            showLogs
              ? "bg-amber-500 text-black"
              : "bg-zinc-800 hover:bg-zinc-700 text-white"
          }`}
        >
          <History className="w-4 h-4 inline mr-2" />
          Logs
        </button>
      </div>

      {/* Logs Panel */}
      {showLogs && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Actividad Reciente
          </h3>
          {logs.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No hay actividad registrada</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.slice(0, 20).map((log) => (
                <div
                  key={log._id}
                  className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg text-sm"
                >
                  <span className="text-xs font-mono text-zinc-500">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.type === "spin"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {log.type.toUpperCase()}
                  </span>
                  <span className="text-zinc-300 flex-1">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drinks List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Tragos Configurados
          </h2>
          <span className="text-sm text-zinc-500">
            {stats.totalDrinks} total, {stats.activeDrinks} activos
          </span>
        </div>

        <RouletteAdminList
          drinks={drinks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          onUpdateWeight={handleWeightUpdate}
        />
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <RouletteForm drink={selectedDrink} onSave={handleSave} onClose={() => setIsFormOpen(false)} />
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-zinc-900 border border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-amber-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Tutorial del Sistema Roulette
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Guía rápida para administrar el sistema
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
              >
                <AlertCircle size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <Sparkles size={16} />
                  Conceptos Básicos
                </h3>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>• <strong>Pesos:</strong> Determinan la probabilidad de cada trago (mayor peso = más probable)</li>
                  <li>• <strong>Rarezas:</strong> COMMON, RARE, EPIC, LEGENDARY (afectan multiplicadores)</li>
                  <li>• <strong>Pity:</strong> Garantiza premios raros tras cierto número de tiradas</li>
                  <li>• <strong>Auto-Balance:</strong> Ajusta automáticamente los pesos de los tragos</li>
                </ul>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <History size={16} />
                  Flujo de Trabajo
                </h3>
                <ol className="space-y-2 text-sm text-zinc-300 list-decimal list-inside">
                  <li>Añade tragos usando el botón "Nuevo Trago"</li>
                  <li>Ajusta pesos y rarezas en la lista de tragos</li>
                  <li>Usa Auto-Balance para ajustar automáticamente</li>
                  <li>Ejecuta spins para probar el sistema</li>
                  <li>Revisa los logs para monitorear actividad</li>
                </ol>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  Consejos de Administración
                </h3>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>• Mantén al menos 3-5 tragos activos para variedad</li>
                  <li>• Usa rarezas EPIC/LEGENDARY para premios especiales</li>
                  <li>• El sistema adapta probabilidades según stock disponible</li>
                  <li>• Revisa los logs regularmente para detectar patrones</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-zinc-800/50">
              <button
                onClick={() => setShowTutorial(false)}
                className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
