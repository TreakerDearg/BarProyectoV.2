"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  Settings2,
  Play,
  Sliders,
  RefreshCw,
  BarChart2,
  Info,
  Trash2,
  Search,
  CheckCircle2,
  X,
  EyeOff,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import type { RouletteDrink, RouletteRarity } from "../types/roulette";
import RarityBadge from "./RarityBadge";
import RouletteTooltip from "./RouletteTooltip";
import { simulateRoulette } from "../services/rouletteService";
import type { SimulationResult } from "../services/rouletteService";

interface Props {
  drinks: RouletteDrink[];
  onUpdate: (id: string, data: Partial<RouletteDrink>) => void;
  onAutoBalance: (mode: "equal" | "smooth" | "smart") => void;
  onRemove?: (id: string) => Promise<{ success: boolean; error?: string }>;
}

type TabType = "adjust" | "simulate";

export default function ProbabilityEngine({
  drinks,
  onUpdate,
  onAutoBalance,
  onRemove,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("adjust");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRarity, setFilterRarity] = useState<RouletteRarity | "all">("all");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "weight" | "probability" | "rarity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Alerta/Confirmación integrada en UI (reemplazo de alert/confirm)
  const [notice, setNotice] = useState<{ type: "info" | "error" | "success"; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => void;
  } | null>(null);

  const showNotice = (type: "info" | "error" | "success", text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const maxWeight = Math.max(...drinks.map((d) => d.weight || 1), 1);

  // Filtro y ordenación de tragos
  const filteredDrinks = useMemo(() => {
    const result = drinks.filter((drink) => {
      if (!drink) return false;
      if (searchTerm && !drink.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterRarity !== "all" && drink.rarity !== filterRarity) {
        return false;
      }
      if (filterActive === "active" && !drink.active) {
        return false;
      }
      if (filterActive === "inactive" && drink.active) {
        return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (!a || !b) return 0;
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "weight":
          comparison = (a.weight || 0) - (b.weight || 0);
          break;
        case "probability":
          comparison = (a.probability || 0) - (b.probability || 0);
          break;
        case "rarity": {
          const rarityOrder = { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3 };
          comparison = (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
          break;
        }
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [drinks, searchTerm, filterRarity, filterActive, sortBy, sortOrder]);

  // Estadísticas del pool
  const stats = useMemo(() => {
    const activeDrinks = drinks.filter((d) => d && d.active);
    const totalWeight = activeDrinks.reduce((acc, d) => acc + (d.weight || 0), 0);
    const averageWeight = activeDrinks.length > 0 ? totalWeight / activeDrinks.length : 0;

    return {
      total: drinks.length,
      active: activeDrinks.length,
      inactive: drinks.length - activeDrinks.length,
      totalWeight,
      averageWeight: averageWeight.toFixed(1),
    };
  }, [drinks]);

  // Acciones en lote con diálogo amigable
  const handleActivateAll = () => {
    drinks.forEach((drink) => {
      if (drink && !drink.active) {
        onUpdate(drink._id, { active: true });
      }
    });
    showNotice("success", "Todos los tragos fueron activados en la ruleta.");
  };

  const handleDeactivateAll = () => {
    setConfirmModal({
      title: "Desactivar todos los tragos",
      description: "¿Deseas desactivar temporalmente todos los tragos del pool de la ruleta?",
      actionLabel: "Desactivar Todos",
      onConfirm: () => {
        drinks.forEach((drink) => {
          if (drink && drink.active) {
            onUpdate(drink._id, { active: false });
          }
        });
        setConfirmModal(null);
        showNotice("info", "Todos los tragos han sido desactivados.");
      },
    });
  };

  const handleResetWeights = () => {
    setConfirmModal({
      title: "Resetear todos los pesos a 10",
      description: "¿Restablecer el peso de todos los tragos al valor inicial estándar de 10?",
      actionLabel: "Restablecer Pesos",
      onConfirm: () => {
        drinks.forEach((drink) => {
          if (drink) {
            onUpdate(drink._id, { weight: 10 });
          }
        });
        setConfirmModal(null);
        showNotice("success", "Los pesos han sido restablecidos a 10.");
      },
    });
  };

  const handleAutoBalanceClick = (mode: "equal" | "smooth" | "smart") => {
    const activeDrinks = drinks.filter((d) => d.active);
    if (activeDrinks.length === 0) {
      showNotice("error", "No hay tragos activos en el pool para auto-balancear.");
      return;
    }

    const descriptions = {
      equal: "distribuirá probabilidades equitativamente entre todos los tragos activos.",
      smooth: "creará una distribución balanceada reduciendo diferencias extremas.",
      smart: "ajustará las probabilidades dinámicamente según el stock disponible y las rarezas.",
    };

    setConfirmModal({
      title: `Aplicar Auto-Balance (${mode.toUpperCase()})`,
      description: `Esta acción ${descriptions[mode]} Se actualizarán los pesos de ${activeDrinks.length} tragos activos.`,
      actionLabel: `Aplicar Modo ${mode.toUpperCase()}`,
      onConfirm: () => {
        onAutoBalance(mode);
        setConfirmModal(null);
        showNotice("success", `Auto-balance en modo ${mode.toUpperCase()} aplicado con éxito.`);
      },
    });
  };

  // ================= SIMULATOR STATE =================
  const [iterations, setIterations] = useState<number>(1000);
  const [simulateKpi, setSimulateKpi] = useState<number>(100);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  const handleSimulate = async () => {
    if (drinks.length === 0) {
      showNotice("error", "No hay tragos configurados en la ruleta. Añade al menos uno antes de simular.");
      return;
    }

    setSimulating(true);
    try {
      const res = await simulateRoulette(iterations, simulateKpi);
      setSimResult(res);
      showNotice("success", `Simulación de ${iterations.toLocaleString()} tiradas completada exitosamente.`);
    } catch (error) {
      console.error("Error running simulation:", error);
      showNotice("error", "Error al procesar la simulación estadística.");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="relative bg-surface-2 border border-border rounded-3xl p-6 sm:p-7 shadow-xl overflow-hidden">
      {/* Diálogo de Confirmación Embebido */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-3 border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <AlertTriangle size={24} />
              <h3 className="text-base font-black text-ivory uppercase tracking-tight">
                {confirmModal.title}
              </h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {confirmModal.description}
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-4 text-xs font-bold text-muted hover:text-ivory transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-light text-xs font-black text-bg uppercase tracking-wider transition-all cursor-pointer shadow-gold-glow"
              >
                {confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER AND TABS ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-border">
        <div>
          <h2 className="text-xl font-black text-ivory tracking-tight uppercase flex items-center gap-3">
            <TrendingUp size={22} className="text-gold" />
            Matriz de <span className="text-gold">Probabilidades</span>
          </h2>
          <p className="text-xs text-muted font-bold uppercase tracking-wider mt-1">
            Control de Pesos, Rarezas y Simulación Monte Carlo
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-surface-3 p-1 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab("adjust")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === "adjust"
                ? "bg-gold text-bg shadow-sm"
                : "text-muted hover:text-ivory"
            }`}
          >
            <Sliders size={14} /> Calibración
          </button>
          <button
            onClick={() => setActiveTab("simulate")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === "simulate"
                ? "bg-gold text-bg shadow-sm"
                : "text-muted hover:text-ivory"
            }`}
          >
            <BarChart2 size={14} /> Simulador
          </button>
        </div>
      </div>

      {/* Banner de Notificación */}
      {notice && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl mb-5 text-xs font-bold animate-fadeIn border ${
            notice.type === "error"
              ? "bg-red/10 text-red border-red/30"
              : notice.type === "success"
              ? "bg-emerald/10 text-emerald border-emerald/30"
              : "bg-surface-3 text-gold border-gold/30"
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="text-muted hover:text-ivory">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ================= TAB 1: WEIGHT ADJUSTER ================= */}
      {activeTab === "adjust" && (
        <div className="space-y-6">
          {/* Tarjetas de Resumen Rápido */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface-3 p-3.5 rounded-xl border border-border">
              <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">Total</span>
              <span className="text-2xl font-black text-ivory">{stats.total}</span>
            </div>
            <div className="bg-emerald/10 p-3.5 rounded-xl border border-emerald/20">
              <span className="text-xs text-emerald font-bold uppercase tracking-wider block mb-1">Activos</span>
              <span className="text-2xl font-black text-emerald">{stats.active}</span>
            </div>
            <div className="bg-red/10 p-3.5 rounded-xl border border-red/20">
              <span className="text-xs text-red font-bold uppercase tracking-wider block mb-1">Inactivos</span>
              <span className="text-2xl font-black text-red">{stats.inactive}</span>
            </div>
            <div className="bg-gold/10 p-3.5 rounded-xl border border-gold/20">
              <span className="text-xs text-gold font-bold uppercase tracking-wider block mb-1">Peso Prom.</span>
              <span className="text-2xl font-black text-gold">{stats.averageWeight}</span>
            </div>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Buscar trago..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-3 border border-border rounded-xl text-xs sm:text-sm text-ivory placeholder:text-muted/60 focus:outline-none focus:border-gold/50 font-medium"
              />
            </div>

            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value as RouletteRarity | "all")}
              className="px-3 py-2 bg-surface-3 border border-border rounded-xl text-xs sm:text-sm text-ivory focus:outline-none focus:border-gold/50 font-bold"
            >
              <option value="all">Todas las Rarezas</option>
              <option value="COMMON">Común (Common)</option>
              <option value="RARE">Raro (Rare)</option>
              <option value="EPIC">Épico (Epic)</option>
              <option value="LEGENDARY">Legendario (Legendary)</option>
            </select>

            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as "all" | "active" | "inactive")}
              className="px-3 py-2 bg-surface-3 border border-border rounded-xl text-xs sm:text-sm text-ivory focus:outline-none focus:border-gold/50 font-bold"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Solo Activos</option>
              <option value="inactive">Solo Inactivos</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "weight" | "probability" | "rarity")}
              className="px-3 py-2 bg-surface-3 border border-border rounded-xl text-xs sm:text-sm text-ivory focus:outline-none focus:border-gold/50 font-bold"
            >
              <option value="name">Ordenar por Nombre</option>
              <option value="weight">Ordenar por Peso</option>
              <option value="probability">Ordenar por Probabilidad</option>
              <option value="rarity">Ordenar por Rareza</option>
            </select>
          </div>

          {/* Acciones en Lote y Auto-Balance */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 rounded-2xl bg-surface-3/50 border border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted font-bold uppercase tracking-wider mr-1">
                Lote:
              </span>
              <button
                onClick={handleActivateAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald/10 hover:bg-emerald/20 text-emerald border border-emerald/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                <CheckCircle2 size={13} /> Activar Todos
              </button>
              <button
                onClick={handleDeactivateAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red/10 hover:bg-red/20 text-red border border-red/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                <EyeOff size={13} /> Desactivar Todos
              </button>
              <button
                onClick={handleResetWeights}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-4 text-ivory border border-border rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                <RefreshCw size={13} /> Resetear Pesos
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gold font-bold uppercase tracking-wider">
                Auto-Balance:
              </span>
              <div className="flex bg-surface-2 p-1 rounded-xl border border-border">
                <button
                  onClick={() => handleAutoBalanceClick("smart")}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-ivory hover:text-gold uppercase tracking-wider transition-all"
                >
                  Smart
                </button>
                <button
                  onClick={() => handleAutoBalanceClick("smooth")}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-ivory hover:text-gold uppercase tracking-wider transition-all"
                >
                  Smooth
                </button>
                <button
                  onClick={() => handleAutoBalanceClick("equal")}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-ivory hover:text-gold uppercase tracking-wider transition-all"
                >
                  Equal
                </button>
              </div>
            </div>
          </div>

          {/* Listado de Tragos Calibrables */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
            {filteredDrinks.length === 0 ? (
              <div className="py-12 text-center text-muted">
                <Search size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">No se encontraron tragos con los filtros actuales</p>
              </div>
            ) : (
              filteredDrinks.map((drink) => {
                const percent = drink.probability ?? 0;
                const productObj = drink.product && typeof drink.product === "object" ? drink.product : null;
                const productStock = productObj?.stock ?? 0;
                const hasLinkedProduct = !!productObj;
                const isLowStock = hasLinkedProduct && productStock < 5;

                return (
                  <div
                    key={drink._id}
                    className={`p-4 rounded-2xl border transition-all ${
                      drink.active
                        ? "bg-surface-3/60 border-border hover:border-border-strong"
                        : "bg-surface-3/20 border-border/40 opacity-50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-lg shrink-0">
                          🍸
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-ivory uppercase truncate">
                            {drink.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <RarityBadge rarity={drink.rarity} size="sm" />
                            <span className="text-xs text-muted font-bold uppercase">
                              {drink.category}
                            </span>
                            {hasLinkedProduct && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                                  isLowStock
                                    ? "bg-red/10 text-red border border-red/20"
                                    : "bg-emerald/10 text-emerald border border-emerald/20"
                                }`}
                              >
                                Stock: {productStock}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <div className="text-right">
                          <span className="text-lg font-black text-gold">
                            {percent.toFixed(1)}%
                          </span>
                          <span className="text-xs text-muted block uppercase font-bold">
                            Probabilidad
                          </span>
                        </div>

                        {/* Botón On/Off */}
                        <button
                          onClick={() => onUpdate(drink._id, { active: !drink.active })}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                            drink.active
                              ? "bg-emerald/10 text-emerald border-emerald/30 hover:bg-emerald/20"
                              : "bg-surface-2 text-muted border-border hover:text-ivory"
                          }`}
                        >
                          {drink.active ? "Activo" : "Inactivo"}
                        </button>

                        {/* Botón Eliminar */}
                        {onRemove && (
                          <button
                            onClick={async () => {
                              const result = await onRemove(drink._id);
                              if (!result.success) {
                                if (result.error === "last_active") {
                                  showNotice("error", "No puedes eliminar el último trago activo de la ruleta.");
                                } else {
                                  showNotice("error", `Error al eliminar: ${result.error}`);
                                }
                              } else {
                                showNotice("success", `Trago "${drink.name}" eliminado del pool.`);
                              }
                            }}
                            className="p-2 rounded-xl bg-surface-2 hover:bg-red/10 border border-border hover:border-red/30 text-muted hover:text-red transition-all"
                            title="Eliminar de la ruleta"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Fila de Calibración de Peso */}
                    <div className="flex items-center gap-4 pt-2 border-t border-border/60">
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-xs text-muted font-bold uppercase tracking-wider shrink-0 w-16">
                          Peso: {drink.weight}
                        </span>
                        <input
                          type="range"
                          min={1}
                          max={100}
                          value={drink.weight}
                          onChange={(e) => onUpdate(drink._id, { weight: Number(e.target.value) })}
                          disabled={!drink.active}
                          className="w-full accent-gold cursor-pointer"
                        />
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={drink.weight}
                          onChange={(e) => onUpdate(drink._id, { weight: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })}
                          disabled={!drink.active}
                          className="w-16 px-2 py-1 bg-surface-2 border border-border rounded-lg text-xs text-ivory text-center font-bold"
                        />
                      </div>

                      {/* Selector de Rareza Rápido */}
                      <select
                        value={drink.rarity}
                        onChange={(e) => onUpdate(drink._id, { rarity: e.target.value as RouletteRarity })}
                        disabled={!drink.active}
                        className="px-2.5 py-1 bg-surface-2 border border-border rounded-xl text-xs text-ivory font-bold uppercase tracking-wider"
                      >
                        <option value="COMMON">Común</option>
                        <option value="RARE">Raro</option>
                        <option value="EPIC">Épico</option>
                        <option value="LEGENDARY">Legendario</option>
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: MONTE CARLO SIMULATOR ================= */}
      {activeTab === "simulate" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-surface-3 border border-border grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                Muestras a Simular
              </label>
              <div className="flex bg-surface-2 p-1 rounded-xl border border-border">
                {[1000, 10000, 50000].map((num) => (
                  <button
                    key={num}
                    onClick={() => setIterations(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      iterations === num
                        ? "bg-gold text-bg shadow-sm"
                        : "text-muted hover:text-ivory"
                    }`}
                  >
                    {num.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">
                  KPI Desempeño
                </label>
                <span className="text-xs font-black text-gold">{simulateKpi}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={simulateKpi}
                onChange={(e) => setSimulateKpi(Number(e.target.value))}
                className="w-full accent-gold"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="w-full py-3 px-5 bg-gold hover:bg-gold-light text-bg text-xs font-black uppercase tracking-wider rounded-xl shadow-gold-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {simulating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Calculando...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>Ejecutar Simulación</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resultados de la Simulación */}
          {simResult ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-surface-3 p-4 rounded-xl border border-border">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">
                    Chi-Square
                  </span>
                  <span className="text-xl font-black text-ivory">
                    {simResult.audit.chiSquare}
                  </span>
                </div>
                <div className="bg-surface-3 p-4 rounded-xl border border-border">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">
                    Desviación Media
                  </span>
                  <span className="text-xl font-black text-emerald">
                    {simResult.audit.averageDeviation}%
                  </span>
                </div>
                <div className="bg-surface-3 p-4 rounded-xl border border-border">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider block mb-1">
                    Estabilidad
                  </span>
                  <span className="text-sm font-black text-emerald uppercase">
                    {simResult.audit.isStatisticallyStable ? "Estable y Coherente" : "Alta Entropía"}
                  </span>
                </div>
              </div>

              {/* Recomendación del motor */}
              <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 text-xs text-ivory flex items-start gap-3">
                <Info size={16} className="text-gold shrink-0 mt-0.5" />
                <p>{simResult.audit.recommendation}</p>
              </div>

              {/* Grid de Rarezas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(simResult.rarityStats).map(([key, val]) => (
                  <div key={key} className="bg-surface-3 p-3.5 rounded-xl border border-border">
                    <span className="text-xs font-black text-ivory uppercase block mb-1">{key}</span>
                    <span className="text-sm font-black text-gold">{val.wins} aciertos</span>
                    <div className="text-xs text-muted mt-1 space-y-0.5 font-medium">
                      <div className="flex justify-between">
                        <span>Teórica:</span>
                        <span>{val.theoretical}%</span>
                      </div>
                      <div className="flex justify-between text-ivory">
                        <span>Simulada:</span>
                        <span>{val.simulated}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-14 text-center text-muted border border-dashed border-border rounded-2xl bg-surface-3/30">
              <BarChart2 size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Configura los parámetros y presiona "Ejecutar Simulación"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
