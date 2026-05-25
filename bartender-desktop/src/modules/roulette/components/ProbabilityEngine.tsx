"use client";

import { useState, useEffect, useMemo } from "react";
import { Wand2, Sparkles, TrendingUp, Settings2, Play, Sliders, Save, RefreshCw, BarChart2, Info, Trash2, Search, CheckCircle2, X, EyeOff } from "lucide-react";
import type { RouletteDrink, RouletteRarity } from "../types/roulette";
import RarityBadge from "./RarityBadge";
import RouletteTooltip from "./RouletteTooltip";
import { 
  simulateRoulette, 
  getRouletteConfig, 
  updateRouletteConfig
} from "../services/rouletteService";
import type { 
  SimulationResult, 
  RouletteConfig 
} from "../services/rouletteService";

interface Props {
  drinks: RouletteDrink[];
  onUpdate: (id: string, data: Partial<RouletteDrink>) => void;
  onAutoBalance: (mode: "equal" | "smooth" | "smart") => void;
  onRemove?: (id: string) => Promise<{ success: boolean; error?: string }>;
}

type TabType = "adjust" | "simulate" | "pity";

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
  const maxWeight = Math.max(...drinks.map((d) => d.weight || 1), 1);

  // Filter and search drinks
  const filteredDrinks = useMemo(() => {
    let result = drinks.filter((drink) => {
      if (!drink) return false;
      
      // Search filter
      if (searchTerm && !drink.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Rarity filter
      if (filterRarity !== "all" && drink.rarity !== filterRarity) {
        return false;
      }
      
      // Active filter
      if (filterActive === "active" && !drink.active) {
        return false;
      }
      if (filterActive === "inactive" && drink.active) {
        return false;
      }
      
      return true;
    });

    // Sort
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
        case "rarity":
          const rarityOrder = { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3 };
          comparison = (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [drinks, searchTerm, filterRarity, filterActive, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const activeDrinks = drinks.filter((d) => d && d.active);
    const totalWeight = activeDrinks.reduce((acc, d) => acc + (d.weight || 0), 0);
    const averageWeight = activeDrinks.length > 0 ? totalWeight / activeDrinks.length : 0;
    
    const rarityCount = {
      COMMON: drinks.filter((d) => d && d.rarity === "COMMON").length,
      RARE: drinks.filter((d) => d && d.rarity === "RARE").length,
      EPIC: drinks.filter((d) => d && d.rarity === "EPIC").length,
      LEGENDARY: drinks.filter((d) => d && d.rarity === "LEGENDARY").length,
    };
    
    return {
      total: drinks.length,
      active: activeDrinks.length,
      inactive: drinks.length - activeDrinks.length,
      totalWeight,
      averageWeight: averageWeight.toFixed(1),
      rarityCount,
    };
  }, [drinks]);

  // Bulk actions
  const handleActivateAll = () => {
    drinks.forEach((drink) => {
      if (drink && !drink.active) {
        onUpdate(drink._id, { active: true });
      }
    });
  };

  const handleDeactivateAll = () => {
    if (confirm("¿Estás seguro de que quieres desactivar todos los tragos?")) {
      drinks.forEach((drink) => {
        if (drink && drink.active) {
          onUpdate(drink._id, { active: false });
        }
      });
    }
  };

  const handleResetWeights = () => {
    if (confirm("¿Estás seguro de que quieres resetear todos los pesos a 10?")) {
      drinks.forEach((drink) => {
        if (drink) {
          onUpdate(drink._id, { weight: 10 });
        }
      });
    }
  };

  // ================= SIMULATOR STATE =================
  const [iterations, setIterations] = useState<number>(1000);
  const [simulateKpi, setSimulateKpi] = useState<number>(100);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  // ================= CONFIG STATE =================
  const [config, setConfig] = useState<RouletteConfig | null>(null);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(false);

  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const data = await getRouletteConfig();
      setConfig(data);
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (activeTab === "pity") {
      fetchConfig();
    }
  }, [activeTab]);

  const handleSimulate = async () => {
    // Foolproof validation
    if (drinks.length === 0) {
      alert("No hay tragos configurados en la ruleta. Añade al menos un trago antes de simular.");
      return;
    }

    if (iterations < 100) {
      alert("El número mínimo de iteraciones es 100 para obtener resultados estadísticamente válidos.");
      return;
    }

    setSimulating(true);
    try {
      const res = await simulateRoulette(iterations, simulateKpi);
      setSimResult(res);
    } catch (error) {
      console.error("Error running simulation:", error);
      alert("Error al ejecutar la simulación. Por favor intenta nuevamente.");
    } finally {
      setSimulating(false);
    }
  };

  const handleAutoBalance = (mode: "equal" | "smooth" | "smart") => {
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
      smooth: "creará una distribución suavizada que reduce extremos",
      smart: "ajustará inteligentemente según rarezas y stock actual"
    };

    if (!confirm(`¿Aplicar auto-balance en modo ${mode.toUpperCase()}?\n\nEsto ${modeDescriptions[mode]} para ${activeDrinks.length} tragos activos.\n\nLos pesos actuales serán reemplazados.`)) {
      return;
    }

    onAutoBalance(mode);
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setSavingConfig(true);
    try {
      const res = await updateRouletteConfig(config);
      setConfig(res);
      alert("Configuración de ruleta guardada y sincronizada.");
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Error al guardar la configuración.");
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="relative glass-royale border border-white/5 rounded-[2.5rem] p-8 shadow-royale overflow-hidden">
      
      {/* Background Gold Aura */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

      {/* ================= HEADER AND TABS ================= */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8 relative z-10 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-xl font-black text-ivory tracking-tighter uppercase flex items-center gap-3">
            <TrendingUp size={20} className="text-gold" />
            Probability <span className="text-grad-gold">Engine</span>
          </h2>
          <p className="text-[9px] text-muted font-black uppercase tracking-[0.4em] mt-1">
            Sistema de Pesos y Rarezas
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-surface-3/30 p-1 rounded-2xl border border-white/5 w-full xl:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("adjust")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
              activeTab === "adjust" 
                ? "bg-gold/15 text-gold border border-gold/10" 
                : "text-muted hover:text-ivory"
            }`}
          >
            <Sliders size={12} /> Pesos
          </button>
          <button
            onClick={() => setActiveTab("simulate")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
              activeTab === "simulate" 
                ? "bg-gold/15 text-gold border border-gold/10" 
                : "text-muted hover:text-ivory"
            }`}
          >
            <BarChart2 size={12} /> Simulador
          </button>
          <button
            onClick={() => setActiveTab("pity")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
              activeTab === "pity" 
                ? "bg-gold/15 text-gold border border-gold/10" 
                : "text-muted hover:text-ivory"
            }`}
          >
            <Settings2 size={12} /> Pity Config
          </button>
        </div>
      </div>

      {/* ================= TAB CONTENT ================= */}
      <div className="relative z-10">
        
        {/* TAB 1: WEIGHT ADJUSTER */}
        {activeTab === "adjust" && (
          <div className="space-y-5">
            
            {/* Statistics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-3/15 p-4 rounded-xl border border-white/5">
                <div className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">Total Tragos</div>
                <div className="text-2xl font-black text-ivory">{stats.total}</div>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                <div className="text-[8px] text-emerald-400 font-black uppercase tracking-widest mb-1">Activos</div>
                <div className="text-2xl font-black text-emerald-400">{stats.active}</div>
              </div>
              <div className="bg-red/10 p-4 rounded-xl border border-red/20">
                <div className="text-[8px] text-red font-black uppercase tracking-widest mb-1">Inactivos</div>
                <div className="text-2xl font-black text-red">{stats.inactive}</div>
              </div>
              <div className="bg-gold/10 p-4 rounded-xl border border-gold/20">
                <div className="text-[8px] text-gold font-black uppercase tracking-widest mb-1">Peso Promedio</div>
                <div className="text-2xl font-black text-gold">{stats.averageWeight}</div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Buscar trago..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-3/30 border border-white/10 rounded-xl text-xs text-ivory placeholder:text-muted/50 focus:outline-none focus:border-gold/50"
                />
              </div>
              
              {/* Rarity Filter */}
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value as RouletteRarity | "all")}
                className="px-4 py-2.5 bg-surface-3/30 border border-white/10 rounded-xl text-xs text-ivory focus:outline-none focus:border-gold/50"
              >
                <option value="all">Todas las Rarezas</option>
                <option value="COMMON">Common</option>
                <option value="RARE">Rare</option>
                <option value="EPIC">Epic</option>
                <option value="LEGENDARY">Legendary</option>
              </select>

              {/* Active Filter */}
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as "all" | "active" | "inactive")}
                className="px-4 py-2.5 bg-surface-3/30 border border-white/10 rounded-xl text-xs text-ivory focus:outline-none focus:border-gold/50"
              >
                <option value="all">Todos</option>
                <option value="active">Solo Activos</option>
                <option value="inactive">Solo Inactivos</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "weight" | "probability" | "rarity")}
                className="px-4 py-2.5 bg-surface-3/30 border border-white/10 rounded-xl text-xs text-ivory focus:outline-none focus:border-gold/50"
              >
                <option value="name">Ordenar por Nombre</option>
                <option value="weight">Ordenar por Peso</option>
                <option value="probability">Ordenar por Probabilidad</option>
                <option value="rarity">Ordenar por Rareza</option>
              </select>

              {/* Sort Order Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-2.5 bg-surface-3/30 border border-white/10 rounded-xl text-xs text-ivory hover:bg-surface-3/50 transition-all"
                title={sortOrder === "asc" ? "Orden Ascendente" : "Orden Descendente"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>

              {/* Clear Filters */}
              {(searchTerm || filterRarity !== "all" || filterActive !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterRarity("all");
                    setFilterActive("all");
                  }}
                  className="px-4 py-2.5 bg-red/10 border border-red/20 rounded-xl text-xs text-red hover:bg-red/20 transition-all"
                >
                  <X size={14} className="inline mr-1" /> Limpiar
                </button>
              )}
            </div>

            {/* Bulk Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleActivateAll}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] font-black text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <CheckCircle2 size={12} /> Activar Todos
              </button>
              <button
                onClick={handleDeactivateAll}
                className="flex items-center gap-2 px-4 py-2 bg-red/10 border border-red/20 rounded-xl text-[9px] font-black text-red hover:bg-red/20 transition-all"
              >
                <EyeOff size={12} /> Desactivar Todos
              </button>
              <button
                onClick={handleResetWeights}
                className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl text-[9px] font-black text-gold hover:bg-gold/20 transition-all"
              >
                <RefreshCw size={12} /> Resetear Pesos
              </button>
            </div>

            {/* Auto balance presets */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-3/15 p-5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-xs font-black text-ivory tracking-widest uppercase">Auto-Balance</h3>
                  <p className="text-[9px] text-muted uppercase tracking-wider mt-1">Ajusta pesos automáticamente</p>
                </div>
                <RouletteTooltip 
                  title="¿Qué es Auto-Balance?"
                  content="El Auto-Balance ajusta automáticamente los pesos de todos los tragos activos según el modo seleccionado. SMART usa inteligencia adaptativa, SMOOTH crea una distribución suave, y EQUAL da probabilidades idénticas a todos."
                />
              </div>
              <div className="flex bg-surface-3/30 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => handleAutoBalance("smart")}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest text-gold hover:bg-gold/10 transition-all"
                  title="Ajuste adaptativo inteligente"
                >
                  <Wand2 size={12} /> SMART
                </button>
                <button
                  onClick={() => handleAutoBalance("smooth")}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest text-emerald-400 hover:bg-emerald-400/10 transition-all"
                  title="Distribución suavizada"
                >
                  SMOOTH
                </button>
                <button
                  onClick={() => handleAutoBalance("equal")}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest text-muted hover:bg-white/5 transition-all"
                  title="Probabilidades idénticas para todos"
                >
                  EQUAL
                </button>
              </div>
            </div>

            {/* List of drinks with stock modifiers */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
              {filteredDrinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search size={32} className="text-muted/30 mb-3" />
                  <p className="text-xs text-muted font-black uppercase tracking-widest">No se encontraron tragos</p>
                  <p className="text-[9px] text-muted/50 uppercase tracking-wider mt-1">
                    Intenta con otros filtros o búsqueda
                  </p>
                </div>
              ) : (
                filteredDrinks.map((drink) => {
                const percent = drink.probability ?? 0;
                const dominance = drink.weight / maxWeight;
                const isDominant = dominance > 0.75;

                // stock variables for previewing
                const productObj = drink.product && typeof drink.product === "object" ? drink.product : null;
                const productStock = productObj?.stock ?? 0;
                const hasLinkedProduct = !!productObj;
                const isLowStock = hasLinkedProduct && productStock < 5;
                const isOverStock = hasLinkedProduct && productStock > 15;

                return (
                  <div
                    key={drink._id}
                    className={`
                      group relative p-5 rounded-2xl border transition-all duration-300 bg-surface-3/20
                      ${
                        drink.active
                          ? "border-white/5 hover:border-white/10 hover:bg-surface-3/30"
                          : "border-gray-900 opacity-30 grayscale"
                      }
                      ${isDominant && drink.active ? "border-gold/20 shadow-gold-glow/5" : ""}
                    `}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center text-lg shadow-inner border border-white/5 group-hover:border-gold/30 transition-colors">
                          🍸
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-ivory tracking-tighter uppercase group-hover:text-gold transition-colors">
                            {drink.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <RarityBadge rarity={drink.rarity} size="sm" />
                            <span className="text-[7px] text-muted font-black uppercase tracking-widest">
                              {drink.category}
                            </span>
                            {hasLinkedProduct && (
                              <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                isLowStock 
                                  ? "bg-red/10 text-red border border-red/20" 
                                  : isOverStock 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-400/20" 
                                    : "bg-surface-3 text-muted"
                              }`}>
                                Stock: {productStock}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Display modifiers actively scaling weight */}
                      <div className="flex items-center gap-4">
                        {hasLinkedProduct && (
                          <div className="flex flex-col items-end">
                            <span className="text-[7px] text-muted font-black uppercase tracking-widest">Stock Adaptive</span>
                            <span className={`text-[9px] font-black ${
                              isLowStock 
                                ? "text-red animate-pulse" 
                                : isOverStock 
                                  ? "text-emerald-400" 
                                  : "text-muted"
                            }`}>
                              {isLowStock 
                                ? `📉 x${Math.pow(productStock/5, 1.5).toFixed(2)}` 
                                : isOverStock 
                                  ? `📈 x${(1.0 + Math.min((productStock-15)*0.03, 0.5)).toFixed(2)}` 
                                  : "⚖️ 1.0x"}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col items-end">
                          <span className="text-xl font-black text-grad-gold tracking-tighter leading-none">
                            {percent.toFixed(1)}%
                          </span>
                          <span className="text-[7px] text-muted font-black uppercase tracking-widest mt-0.5">PROBABILIDAD</span>
                        </div>
                      </div>
                    </div>

                    {/* Weight controller slider */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none px-3">
                          <span className="text-[7px] font-black text-muted uppercase tracking-widest">
                            Peso: {drink.weight}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={100}
                          value={drink.weight}
                          onChange={(e) => onUpdate(drink._id, { weight: Number(e.target.value) })}
                          className="premium-slider w-full"
                          disabled={!drink.active}
                        />
                        <RouletteTooltip 
                          position="top"
                          title="¿Qué es el Peso?"
                          content="El peso determina qué tan probable es que salga este trago. Un peso más alto = más probabilidad."
                        />
                      </div>
                      
                      {/* Rarity select */}
                      <div className="flex items-center gap-2">
                        <select 
                          value={drink.rarity}
                          onChange={(e) => onUpdate(drink._id, { rarity: e.target.value as RouletteRarity })}
                          className="bg-surface-3 border border-white/10 rounded-lg px-2 py-1.5 text-[8px] font-black text-ivory uppercase tracking-widest focus:outline-none focus:border-gold/50"
                          disabled={!drink.active}
                        >
                          <option value="COMMON">Common</option>
                          <option value="RARE">Rare</option>
                          <option value="EPIC">Epic</option>
                          <option value="LEGENDARY">Legendary</option>
                        </select>
                        <RouletteTooltip 
                          position="top"
                          title="¿Qué es la Rareza?"
                          content="La rareza aplica un multiplicador que reduce la probabilidad base."
                        />
                      </div>

                      <button 
                        onClick={() => onUpdate(drink._id, { active: !drink.active })}
                        className={`p-2 rounded-lg border transition-all ${
                          drink.active 
                            ? 'border-emerald-400/20 text-emerald-400 bg-emerald-400/5 hover:bg-emerald-400/10' 
                            : 'border-red/20 text-red bg-red/5 hover:bg-red/10'
                        }`}
                        title={drink.active ? "Desactivar" : "Activar"}
                      >
                        {drink.active ? <Sparkles size={12} /> : <Settings2 size={12} />}
                      </button>

                      {onRemove && (
                        <button 
                          onClick={async () => {
                            const result = await onRemove(drink._id);
                            if (!result.success) {
                              if (result.error === "last_active") {
                                alert("No puedes eliminar el último trago activo. La ruleta necesita al menos un trago activo para funcionar.");
                              } else if (result.error === "not_found") {
                                alert("Trago no encontrado.");
                              } else {
                                alert(`Error al eliminar: ${result.error}`);
                              }
                            }
                          }}
                          className="p-2 rounded-lg border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/40 transition-all active:scale-95"
                          title="Eliminar de la ruleta"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Probability Visual Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-surface-3 rounded-full h-1 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            percent > 20 ? 'bg-gold' : percent > 10 ? 'bg-purple-400' : 'bg-blue-400'
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[7px] text-muted/60 font-black uppercase tracking-widest">
                          Rarity: {drink.rarity === 'COMMON' ? '1.0x' : drink.rarity === 'RARE' ? '0.5x' : drink.rarity === 'EPIC' ? '0.2x' : '0.05x'}
                        </span>
                        <span className="text-[7px] text-muted/60 font-black uppercase tracking-widest">
                          {drink.totalSpins || 0} spins
                        </span>
                      </div>
                    </div>

                  </div>
                );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MONTE CARLO SIMULATOR */}
        {activeTab === "simulate" && (
          <div className="space-y-8">
            
            {/* Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-surface-3/15 p-8 rounded-3xl border border-white/5">
              
              {/* Iterations Selection */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-muted uppercase tracking-widest">Tiradas a Simular (Muestras)</label>
                <div className="flex bg-surface-3/40 p-1 rounded-xl border border-white/5">
                  {[1000, 10000, 50000].map((num) => (
                    <button
                      key={num}
                      onClick={() => setIterations(num)}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${
                        iterations === num 
                          ? "bg-gold/15 text-gold border border-gold/10 shadow-sm" 
                          : "text-muted hover:text-ivory"
                      }`}
                    >
                      {num.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPI Luck Factor slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-muted uppercase tracking-widest">KPI Desempeño a Simular</label>
                  <span className="text-xs font-black text-gold">{simulateKpi}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={simulateKpi}
                    onChange={(e) => setSimulateKpi(Number(e.target.value))}
                    className="premium-slider flex-1"
                  />
                </div>
                <p className="text-[8px] text-muted uppercase tracking-wider">
                  {simulateKpi >= 80 
                    ? `🟢 Buff Activo: Multiplica suerte rareza por x${(1.0 + (simulateKpi-80)/100).toFixed(2)}` 
                    : "⚪ Sin Buff de Suerte (KPI < 80)"}
                </p>
              </div>

              {/* Run Action */}
              <div className="flex items-end">
                <button
                  onClick={handleSimulate}
                  disabled={simulating}
                  className="w-full py-4 px-6 bg-grad-gold hover:opacity-90 text-[10px] font-black tracking-[0.2em] text-black rounded-xl border border-gold/30 shadow-gold-glow/10 uppercase transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  {simulating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> PROCESANDO Tiradas...
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="black" /> EJECUTAR SIMULACIÓN ESTADÍSTICA
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Results Panel */}
            {simResult ? (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Simulation stats header audits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="glass-card bg-surface-3/15 border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                    <span className="text-[8px] text-muted font-black tracking-widest uppercase mb-1">Chi-Square Entropy</span>
                    <span className="text-xl font-black text-ivory tracking-tight">{simResult.audit.chiSquare}</span>
                    <span className="text-[7px] text-muted uppercase tracking-widest mt-1">Estabilidad Aleatoria</span>
                  </div>

                  <div className="glass-card bg-surface-3/15 border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                    <span className="text-[8px] text-muted font-black tracking-widest uppercase mb-1">Desviación Media</span>
                    <span className={`text-xl font-black tracking-tight ${
                      simResult.audit.averageDeviation < 1.0 ? "text-emerald-400" : "text-gold"
                    }`}>{simResult.audit.averageDeviation}%</span>
                    <span className="text-[7px] text-muted uppercase tracking-widest mt-1">Convergencia Real vs Teórica</span>
                  </div>

                  <div className="glass-card bg-surface-3/15 border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                    <span className="text-[8px] text-muted font-black tracking-widest uppercase mb-1">Estado de Estabilidad</span>
                    <span className={`text-sm font-black uppercase tracking-wider ${
                      simResult.audit.isStatisticallyStable ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {simResult.audit.isStatisticallyStable ? "🟢 ESTABLE Y COHERENTE" : "🟡 ALTA ENTROPÍA"}
                    </span>
                    <span className="text-[7px] text-muted uppercase tracking-widest mt-1">Auditoría del Motor</span>
                  </div>

                </div>

                {/* Audit recommendation alert */}
                <div className="bg-gold/5 border border-gold/20 rounded-2xl p-6 flex items-start gap-4">
                  <Info size={16} className="text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-[9px] font-black text-gold uppercase tracking-widest">Recomendación del Analista Monte Carlo</h4>
                    <p className="text-[10px] text-muted/95 leading-relaxed mt-1">{simResult.audit.recommendation}</p>
                  </div>
                </div>

                {/* Grid Rarity Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(simResult.rarityStats).map(([key, value]) => {
                    return (
                      <div key={key} className="bg-surface-3/15 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[9px] font-black uppercase tracking-widest text-ivory">{key}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded ${
                            key === "LEGENDARY" ? "bg-gold/10 text-gold" : key === "EPIC" ? "bg-purple-500/10 text-purple-400" : key === "RARE" ? "bg-blue-500/10 text-blue-400" : "bg-muted/15 text-muted"
                          }`}>{value.wins.toLocaleString()} WINS</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[8px] text-muted font-bold">
                            <span>Teórica:</span>
                            <span>{value.theoretical}%</span>
                          </div>
                          <div className="flex justify-between text-[8px] text-ivory font-black">
                            <span>Simulada:</span>
                            <span>{value.simulated}%</span>
                          </div>
                          <div className="flex justify-between text-[8px] font-black">
                            <span>Desviación:</span>
                            <span className={value.deviation > 0 ? "text-emerald-400" : value.deviation < 0 ? "text-red" : "text-muted"}>
                              {value.deviation > 0 ? `+${value.deviation}%` : `${value.deviation}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Drinks List Comparison */}
                <div className="bg-surface-3/15 rounded-3xl border border-white/5 p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-ivory tracking-widest uppercase">Resultados de Tragos y Convergencia</h4>
                    <span className="text-[8px] text-muted font-black tracking-widest uppercase">Muestreo: {simResult.iterations.toLocaleString()} spins</span>
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {simResult.items.map((item) => {
                      return (
                        <div key={item._id} className="p-5 bg-surface-3/20 rounded-2xl border border-white/5 space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-xs font-black text-ivory uppercase tracking-tight">{item.name}</span>
                              <span className="text-[8px] text-muted uppercase tracking-widest ml-3">{item.category}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-[8px] font-black px-2.5 py-0.5 rounded ${
                                item.rarity === "LEGENDARY" ? "bg-gold/10 text-gold" : item.rarity === "EPIC" ? "bg-purple-500/10 text-purple-400" : item.rarity === "RARE" ? "bg-blue-500/10 text-blue-400" : "bg-muted/15 text-muted"
                              }`}>{item.rarity}</span>
                              <span className="text-[9px] text-muted font-bold">{item.simulatedWins.toLocaleString()} Wins</span>
                            </div>
                          </div>

                          {/* Dual Progress Bar for visual comparison */}
                          <div className="space-y-1.5">
                            {/* Theoretical bar */}
                            <div className="flex items-center gap-3">
                              <span className="text-[7px] text-muted font-black w-14 uppercase tracking-widest">Teórica:</span>
                              <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden p-[1px]">
                                <div className="h-full bg-gold rounded-full" style={{ width: `${item.theoreticalProbability}%` }} />
                              </div>
                              <span className="text-[8px] text-gold font-black w-8 text-right">{item.theoreticalProbability}%</span>
                            </div>

                            {/* Simulated bar */}
                            <div className="flex items-center gap-3">
                              <span className="text-[7px] text-muted font-black w-14 uppercase tracking-widest">Simulada:</span>
                              <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden p-[1px]">
                                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${item.simulatedProbability}%` }} />
                              </div>
                              <span className="text-[8px] text-emerald-400 font-black w-8 text-right">{item.simulatedProbability}%</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1.5 text-[8px] text-muted/80 uppercase font-black tracking-widest">
                            <span>Base Weight: {item.baseWeight} • Stock Mult: x{item.stockMultiplier.toFixed(2)} • Luck Mult: x{item.luckMultiplier.toFixed(2)}</span>
                            <span className={item.deviation > 0 ? "text-emerald-400" : item.deviation < 0 ? "text-red" : "text-muted"}>
                              Desviación: {item.deviation > 0 ? `+${item.deviation}%` : `${item.deviation}%`}
                            </span>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-white/5 rounded-[2rem] bg-surface-3/5 p-8">
                <BarChart2 size={48} className="text-muted/30 mx-auto mb-4" />
                <h4 className="text-xs font-black text-muted uppercase tracking-widest">Sin simulación cargada</h4>
                <p className="text-[10px] text-muted/60 uppercase tracking-wider mt-2">
                  Configure los parámetros arriba y presione "Ejecutar Simulación" para testear el motor.
                </p>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: PITY CONFIGURATOR */}
        {activeTab === "pity" && (
          <div className="space-y-8">
            {loadingConfig ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="text-gold animate-spin mb-4" size={24} />
                <span className="text-[9px] text-muted font-black tracking-widest uppercase">Cargando Configuración...</span>
              </div>
            ) : config ? (
              <div className="space-y-8 animate-fadeIn">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Pity thresholds setup */}
                  <div className="bg-surface-3/15 border border-white/5 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xs font-black text-ivory tracking-widest uppercase border-b border-white/5 pb-4">
                      Umbrales de Pity (Spins Garantía)
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-muted uppercase tracking-widest">Garantía RARE</label>
                        <input
                          type="number"
                          value={config.pityThresholds.RARE}
                          onChange={(e) => setConfig({
                            ...config,
                            pityThresholds: { ...config.pityThresholds, RARE: Number(e.target.value) }
                          })}
                          className="w-24 bg-surface-3 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-muted uppercase tracking-widest">Garantía EPIC</label>
                        <input
                          type="number"
                          value={config.pityThresholds.EPIC}
                          onChange={(e) => setConfig({
                            ...config,
                            pityThresholds: { ...config.pityThresholds, EPIC: Number(e.target.value) }
                          })}
                          className="w-24 bg-surface-3 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-muted uppercase tracking-widest">Garantía LEGENDARY</label>
                        <input
                          type="number"
                          value={config.pityThresholds.LEGENDARY}
                          onChange={(e) => setConfig({
                            ...config,
                            pityThresholds: { ...config.pityThresholds, LEGENDARY: Number(e.target.value) }
                          })}
                          className="w-24 bg-surface-3 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <div>
                          <label className="text-[9px] font-black text-muted uppercase tracking-widest">Pity Boost Multiplier</label>
                          <p className="text-[7px] text-muted uppercase tracking-wider mt-0.5">Factor multiplicador de peso al alcanzar garantía</p>
                        </div>
                        <input
                          type="number"
                          value={config.pityBoostMultiplier}
                          onChange={(e) => setConfig({
                            ...config,
                            pityBoostMultiplier: Number(e.target.value)
                          })}
                          className="w-24 bg-surface-3 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* KPI luck settings and multipliers */}
                  <div className="bg-surface-3/15 border border-white/5 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xs font-black text-ivory tracking-widest uppercase border-b border-white/5 pb-4">
                      Gamificación KPI & Multiplicadores
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="text-[9px] font-black text-muted uppercase tracking-widest">KPI Mínimo de Suerte</label>
                          <p className="text-[7px] text-muted uppercase tracking-wider mt-0.5">Nota de desempeño mínima para activar buff de suerte</p>
                        </div>
                        <input
                          type="number"
                          value={config.kpiMinScore}
                          onChange={(e) => setConfig({
                            ...config,
                            kpiMinScore: Number(e.target.value)
                          })}
                          className="w-24 bg-surface-3 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <label className="text-[9px] font-black text-muted uppercase tracking-widest">Multiplicador Máx Buff de Suerte</label>
                          <p className="text-[7px] text-muted uppercase tracking-wider mt-0.5">Máximo empuje probabilístico por excelencia de KPI</p>
                        </div>
                        <input
                          type="number"
                          step="0.05"
                          value={config.kpiMaxMultiplier}
                          onChange={(e) => setConfig({
                            ...config,
                            kpiMaxMultiplier: Number(e.target.value)
                          })}
                          className="w-24 bg-surface-3 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                        />
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <label className="text-[9px] font-black text-muted uppercase tracking-widest">Modificadores de Rarity Base</label>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.keys(config.rarityModifiers).map((rarityKey) => {
                            return (
                              <div key={rarityKey} className="flex justify-between items-center bg-surface-3/30 border border-white/5 rounded-xl px-3 py-2">
                                <span className="text-[8px] font-black uppercase text-muted tracking-wider">{rarityKey}</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={config.rarityModifiers[rarityKey as RouletteRarity]}
                                  onChange={(e) => setConfig({
                                    ...config,
                                    rarityModifiers: {
                                      ...config.rarityModifiers,
                                      [rarityKey]: Number(e.target.value)
                                    }
                                  })}
                                  className="w-14 bg-surface-3 border border-white/10 rounded-lg py-1 text-[10px] font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Save button */}
                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    onClick={handleSaveConfig}
                    disabled={savingConfig}
                    className="px-8 py-3.5 bg-grad-gold hover:opacity-90 text-[10px] font-black tracking-[0.2em] text-black rounded-xl border border-gold/30 shadow-gold-glow/5 uppercase transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95 cursor-pointer"
                  >
                    <Save size={14} /> {savingConfig ? "GUARDANDO..." : "GUARDAR CONFIGURACIÓN"}
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xs text-muted font-black uppercase tracking-widest">Error al cargar la configuración</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ================= FOOTER ================= */}
      <div className="flex justify-between items-center mt-10 pt-10 border-t border-white/5 relative z-10">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-emerald-400/50" />
            <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">
              Engine v4.6 • Vegas Royale Operational Intelligence Active
            </span>
         </div>
         <div className="bg-emerald-400/10 text-emerald-400 px-6 py-2 rounded-full border border-emerald-400/20 text-[10px] font-black tracking-widest">
            STABLE 100%
         </div>
      </div>
    </div>
  );
}