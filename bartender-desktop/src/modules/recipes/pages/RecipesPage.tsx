"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCcw,
  Search,
  Martini,
  Utensils,
  Layers,
  AlertTriangle,
  History,
  LayoutGrid,
  Zap,
  ChevronRight,
  TrendingUp,
  FileText,
  Activity,
  Dices,
  Target,
  ArrowRight
} from "lucide-react";

import RecipeCard from "../components/RecipeCard";
import RecipeForm from "../components/RecipeForm";
import RecipeDetailModal from "../components/RecipeDetailModal";

import {
  getRecipes,
  createRecipe,
  deleteRecipe,
} from "../services/recipeService";

import type { Recipe } from "../types/recipe";

/* ==============================
   TYPES
============================== */
interface HistoryItem {
  id: string;
  action: 'created' | 'updated' | 'deleted';
  name: string;
  timestamp: Date;
  type: 'drink' | 'food';
}

/* ==============================
   MAIN COMPONENT
============================== */
export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "drink" | "food">("all");

  /* =========================
     FETCH
  ========================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecipes();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Fallo en la sincronización de archivos Umbra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =========================
     STATS
  ========================= */
  const stats = useMemo(() => {
    const total = recipes.length;
    const drinks = recipes.filter((r) => r.type === "drink").length;
    const foods = recipes.filter((r) => r.type === "food").length;
    const totalCost = recipes.reduce((sum, r) => sum + (r.totalCost || 0), 0);

    return { total, drinks, foods, totalCost };
  }, [recipes]);

  /* =========================
     FILTER
  ========================= */
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchSearch =
        r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase());

      const matchType = filter === "all" ? true : r.type === filter;
      return matchSearch && matchType;
    });
  }, [recipes, search, filter]);

  /* =========================
     HISTORY HANDLER
  ========================= */
  const addToHistory = (name: string, action: HistoryItem['action'], type: HistoryItem['type']) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      action,
      type,
      timestamp: new Date()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 15));
  };

  /* =========================
     CREATE
  ========================= */
  const handleSave = async (data: Recipe) => {
    try {
      await createRecipe(data);
      addToHistory(data.product?.name || "Nueva Receta", 'created', data.type || 'food');
      setOpenForm(false);
      await fetchData();
    } catch (err) {
      setError("No se pudo registrar la arquitectura de receta");
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id: string) => {
    if (!confirm("¿Archivar permanentemente esta arquitectura?")) return;
    try {
      const target = recipes.find(r => r._id === id);
      await deleteRecipe(id);
      if (target) addToHistory(target.product?.name || "Receta", 'deleted', target.type || 'food');
      await fetchData();
    } catch (err) {
      setError("Error al eliminar registro Umbra");
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-10 p-4 relative overflow-hidden">
      
      {/* ATMOSPHERIC BACKGROUNDS */}
      <div className="fixed -top-[10%] -left-[5%] w-[50%] h-[50%] bg-emerald-400/5 rounded-full blur-[180px] -z-10 animate-pulse-slow" />
      <div className="fixed -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[150px] -z-10 animate-pulse-slow" />

      {/* HEADER SECTION (UMBRA VIP STYLE) */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-grad-gold rounded-[2rem] shadow-gold-glow animate-float">
              <Layers className="text-bg" size={36} />
            </div>
            <div>
              <h1 className="text-7xl font-black tracking-tighter text-grad-gold uppercase leading-none drop-shadow-2xl">
                Recetario
              </h1>
              <p className="text-[11px] font-black text-muted uppercase tracking-[0.6em] ml-1 mt-2 flex items-center gap-2">
                <Target size={14} className="text-gold opacity-50" />
                Arquitectura de Menú · <span className="text-grad-gold">Umbra VIP v2.5</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* SEARCH COMPONENT */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search size={20} className="text-muted group-focus-within:text-gold transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Escanear receta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-3 border border-white/5 rounded-3xl py-5 pl-14 pr-8 text-sm font-bold text-ivory outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all w-80 shadow-inner group-hover:border-white/10"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={fetchData}
              className="w-16 h-16 rounded-[1.5rem] glass-royale flex items-center justify-center group hover:border-gold/40 transition-all shadow-xl"
            >
              <RefreshCcw size={24} className={`${loading ? "animate-spin text-gold" : "group-hover:rotate-180 transition-transform text-muted"}`} />
            </button>

            <button
              onClick={() => setOpenForm(true)}
              className="btn btn-gold !px-12 !h-16 !rounded-[1.5rem] shadow-royale flex items-center gap-4 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Plus size={28} className="stroke-[4px] relative z-10" />
              <span className="font-black tracking-[0.2em] text-xs uppercase relative z-10">Nueva Arquitectura</span>
            </button>
          </div>
        </div>
      </div>

      {/* STATS & FILTER ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <KPIBox label="Fórmulas Totales" value={stats.total} icon={<LayoutGrid size={20} />} color="gold" />
        <KPIBox label="Mixología" value={stats.drinks} icon={<Martini size={20} />} color="ember" />
        <KPIBox label="Gastronomía" value={stats.foods} icon={<Utensils size={20} />} color="emerald" />
        <KPIBox label="Valor Activo" value={`$${stats.totalCost.toFixed(0)}`} icon={<TrendingUp size={20} />} color="lime" />
      </div>

      <div className="flex items-center gap-4 border-b border-white/5 pb-2">
        <ViewTab active={filter === "all"} onClick={() => setFilter("all")} label="Archivo Completo" />
        <ViewTab active={filter === "drink"} onClick={() => setFilter("drink")} label="Cócteles & Bar" color="ember" />
        <ViewTab active={filter === "food"} onClick={() => setFilter("food")} label="Platos & Cocina" color="emerald" />
      </div>

      {/* ERROR FEEDBACK */}
      {error && (
        <div className="glass-red p-6 rounded-3xl flex items-center gap-6 animate-shake border-brand/20 shadow-xl">
          <AlertTriangle size={24} className="text-brand" />
          <p className="text-sm font-black uppercase tracking-widest text-ivory/90">{error}</p>
        </div>
      )}

      {/* MAIN DUAL-PANEL LAYOUT */}
      <div className="flex-1 flex gap-10 min-h-0">
        
        {/* LEFT PANEL: RECIPE GRID (UMBRA VIP) */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => <RecipeSkeleton key={i} />)}
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="flex-1 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center opacity-20">
              <Dices size={64} className="mb-6 animate-bounce-slow" />
              <p className="text-sm font-black uppercase tracking-[0.5em]">No se encontraron registros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 overflow-y-auto pr-6 custom-scrollbar pb-32">
              {filteredRecipes.map((r) => (
                <RecipeCard
                  key={r._id}
                  recipe={r}
                  onDelete={handleDelete}
                  onOpen={(recipe) => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: MENU ARCHITECTURE & HISTORY (OBSIDIAN NEON) */}
        <div className="hidden 2xl:block w-[400px] flex flex-col gap-8">
          <div className="glass-royale rounded-[3rem] border border-white/10 flex-1 flex flex-col overflow-hidden shadow-royale">
            <div className="p-8 bg-surface-3/50 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand/10 rounded-xl text-brand">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">Monitor Umbra</h3>
                  <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em]">Auditoría en Vivo</p>
                </div>
              </div>
              <History size={20} className="text-muted/30" />
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-4">
                  <FileText size={48} />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Esperando actividad de<br/>arquitectura...</p>
                </div>
              ) : (
                history.map((item) => (
                  <HistoryCard key={item.id} item={item} />
                ))
              )}
            </div>

            <div className="p-8 bg-surface-3/50 border-t border-white/5">
              <div className="p-6 bg-brand/5 rounded-2xl border border-brand/20 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-brand uppercase tracking-widest">Sincronización Cloud</p>
                  <div className="w-2 h-2 rounded-full bg-brand animate-pulse shadow-brand-glow" />
                </div>
                <p className="text-[9px] text-muted uppercase font-bold leading-relaxed">Los cambios se aplican globalmente a la Red de POS y Menú Digital.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {openForm && (
        <RecipeForm
          onSave={handleSave}
          onClose={() => setOpenForm(false)}
        />
      )}

      <RecipeDetailModal
        open={!!selectedRecipe}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />

    </div>
  );
}

/* ==============================
   SUB-COMPONENTS
============================== */

function KPIBox({ label, value, icon, color }: any) {
  const colors: any = {
    gold: "text-gold border-gold/20 bg-gold/5",
    emerald: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
    ember: "text-ember border-ember/20 bg-ember/5",
    lime: "text-lime border-lime/20 bg-lime/5",
  };
  const activeColor = colors[color] || colors.gold;

  return (
    <div className="glass-royale p-8 rounded-[2.5rem] border border-white/5 group hover:border-white/10 transition-all relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{label}</p>
        <div className={`${activeColor.split(' ')[0]} opacity-30 group-hover:opacity-100 transition-opacity`}>{icon}</div>
      </div>
      <p className={`text-5xl font-black ${activeColor.split(' ')[0]} tracking-tighter leading-none`}>{value}</p>
    </div>
  );
}

function ViewTab({ active, onClick, label, color = "gold" }: any) {
  const colors: any = {
    gold: "bg-gold",
    emerald: "bg-emerald-400",
    ember: "bg-ember",
  };
  return (
    <button 
      onClick={onClick}
      className={`
        px-8 py-4 rounded-2xl transition-all duration-500 group flex items-center gap-4
        ${active ? 'bg-surface-glow border-white/10 shadow-xl' : 'hover:bg-white/5 border-transparent opacity-50 hover:opacity-100'}
        border relative
      `}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${colors[color]} ${active ? 'shadow-glow' : 'opacity-20'}`} />
      <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${active ? 'text-ivory' : 'text-muted'}`}>
        {label}
      </span>
      {active && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-grad-gold rounded-full shadow-gold-glow" />
      )}
    </button>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const actions: any = {
    created: { label: "CREACIÓN", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: <Plus size={10} /> },
    updated: { label: "AJUSTE", color: "text-gold", bg: "bg-gold/10", icon: <Zap size={10} /> },
    deleted: { label: "ARCHIVO", color: "text-brand", bg: "bg-brand/10", icon: <ArrowRight size={10} /> },
  };
  const config = actions[item.action];

  return (
    <div className="group flex gap-5 items-start">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shadow-lg`}>
          {item.type === 'drink' ? <Martini size={16} /> : <Utensils size={16} />}
        </div>
        <div className="w-px flex-1 bg-white/5 my-2" />
      </div>
      <div className="flex-1 space-y-2 pt-1">
        <div className="flex justify-between items-center">
          <span className={`text-[8px] font-black tracking-[0.3em] ${config.color} ${config.bg} px-2 py-1 rounded-md`}>
            {config.label}
          </span>
          <span className="text-[9px] font-black text-muted/30 group-hover:text-muted/60 transition-colors">
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <h4 className="text-xs font-black text-ivory uppercase tracking-tighter truncate max-w-[200px]">
          {item.name}
        </h4>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[9px] font-bold text-muted uppercase">Ver Cambios</p>
          <ChevronRight size={10} className="text-gold" />
        </div>
      </div>
    </div>
  );
}

function RecipeSkeleton() {
  return (
    <div className="rounded-[2.5rem] p-8 space-y-6 bg-surface-3/50 border border-white/5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5" />
        <div className="flex-1 space-y-2 py-2">
          <div className="h-4 bg-white/5 rounded-full w-2/3" />
          <div className="h-2 bg-white/5 rounded-full w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-white/5 rounded-2xl" />
        <div className="h-16 bg-white/5 rounded-2xl" />
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-white/5 rounded-full" />
        <div className="h-2 bg-white/5 rounded-full" />
        <div className="h-2 bg-white/5 rounded-full w-1/2" />
      </div>
    </div>
  );
}