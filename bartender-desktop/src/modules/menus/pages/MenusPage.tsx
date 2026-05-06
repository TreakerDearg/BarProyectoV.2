"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  LayoutDashboard,
  Layers,
  CheckCircle,
  XCircle,
  Sparkles,
  RefreshCcw,
  Target,
  Zap,
  TrendingUp,
  Box,
  ChevronRight,
  Activity,
  Dices,
  Martini,
  Utensils,
  History,
  Link as LinkIcon
} from "lucide-react";

import MenuCard from "../components/MenuCard";
import MenuForm from "../components/MenuForm";

import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from "../../../services/menuService";

import { getRecipes } from "../../recipes/services/recipeService";

import type { Menu } from "../../../types/menu";
import type { Recipe } from "../../recipes/types/recipe";

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [inspectedMenu, setInspectedMenu] = useState<Menu | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const [menuData, recipeData] = await Promise.all([
        getMenus(),
        getRecipes()
      ]);
      setMenus(Array.isArray(menuData) ? menuData : []);
      setRecipes(Array.isArray(recipeData) ? recipeData : []);
    } catch (err) {
      console.error("Error sync menus", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const filteredMenus = useMemo(() => {
    if (!search.trim()) return menus;
    const lower = search.toLowerCase();
    return menus.filter((m) => 
      m?.name?.toLowerCase().includes(lower) ||
      m.categories?.some(c => c.name.toLowerCase().includes(lower))
    );
  }, [menus, search]);

  const stats = useMemo(() => {
    const total = menus.length;
    const active = menus.filter((m) => m.active).length;
    const products = menus.reduce((acc, m) => acc + (m.categories?.reduce((a, c) => a + (c.products?.length || 0), 0) || 0), 0);
    const avgProducts = total > 0 ? (products / total).toFixed(1) : 0;

    return { total, active, products, avgProducts };
  }, [menus]);

  const handleSave = async (menu: any) => {
    try {
      if (menu._id) await updateMenu(menu._id, menu);
      else await createMenu(menu);
      await fetchMenus();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save error", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desvincular este menú de la red?")) return;
    try {
      await deleteMenu(id);
      await fetchMenus();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-10 p-4 relative overflow-hidden">
      
      {/* ATMOSPHERIC BACKGROUNDS */}
      <div className="fixed -top-[5%] -right-[5%] w-[45%] h-[45%] bg-gold/5 rounded-full blur-[180px] -z-10 animate-pulse-slow" />
      <div className="fixed -bottom-[5%] -left-[5%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[150px] -z-10 animate-pulse-slow" />

      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-grad-gold rounded-[2rem] shadow-gold-glow animate-float">
              <LayoutDashboard className="text-bg" size={36} />
            </div>
            <div>
              <h1 className="text-7xl font-black tracking-tighter text-grad-gold uppercase leading-none drop-shadow-2xl">
                Cartas
              </h1>
              <p className="text-[11px] font-black text-muted uppercase tracking-[0.6em] ml-1 mt-2 flex items-center gap-2">
                <Target size={14} className="text-gold opacity-50" />
                Menu Architecture · <span className="text-grad-gold">Umbra VIP v3.0</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search size={20} className="text-muted group-focus-within:text-gold transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Buscar carta estratégica..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-3 border border-white/5 rounded-3xl py-5 pl-14 pr-8 text-sm font-bold text-ivory outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all w-80 shadow-inner group-hover:border-white/10"
            />
          </div>

          <div className="flex gap-4">
            <button onClick={fetchMenus} className="w-16 h-16 rounded-[1.5rem] glass-royale flex items-center justify-center group hover:border-gold/40 transition-all shadow-xl">
              <RefreshCcw size={24} className={`${loading ? "animate-spin text-gold" : "group-hover:rotate-180 transition-transform text-muted"}`} />
            </button>
            <button onClick={() => { setSelectedMenu(null); setIsModalOpen(true); }} className="btn btn-gold !px-12 !h-16 !rounded-[1.5rem] shadow-royale flex items-center gap-4 group relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Plus size={28} className="stroke-[4px] relative z-10" />
              <span className="font-black tracking-[0.2em] text-xs uppercase relative z-10">Nuevo Menú</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRICS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <KPIBox label="Cartas Registradas" value={stats.total} icon={<Layers size={20} />} color="gold" />
        <KPIBox label="Menus Activos" value={stats.active} icon={<CheckCircle size={20} />} color="emerald" />
        <KPIBox label="Items Totales" value={stats.products} icon={<Box size={20} />} color="ember" />
        <KPIBox label="Promedio / Carta" value={stats.avgProducts} icon={<TrendingUp size={20} />} color="lime" />
      </div>

      {/* MAIN CONTENT: DUAL PANEL */}
      <div className="flex-1 flex gap-10 min-h-0">
        
        {/* LEFT PANEL: MENU GRID */}
        <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar pb-32">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="h-full border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center opacity-20">
              <Sparkles size={64} className="mb-6 animate-bounce-slow" />
              <p className="text-sm font-black uppercase tracking-[0.5em]">Sin cartas estratégicas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
              {filteredMenus.map((menu) => (
                <div key={menu._id} onMouseEnter={() => setInspectedMenu(menu)}>
                  <MenuCard
                    menu={menu}
                    onEdit={(m) => { setSelectedMenu(m); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: MENU INSIGHTS & LINKAGE (OBSIDIAN NEON) */}
        <div className="hidden 2xl:block w-[450px]">
          <MenuInsightsPanel menu={inspectedMenu} recipes={recipes} />
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <MenuForm
          menu={selectedMenu}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
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

function MenuInsightsPanel({ menu, recipes }: { menu: Menu | null, recipes: Recipe[] }) {
  if (!menu) {
    return (
      <div className="h-full glass-royale rounded-[3rem] border-white/5 flex flex-col items-center justify-center p-12 text-center opacity-20 border-2 border-dashed">
        <Sparkles size={48} className="text-gold mb-6" />
        <p className="text-xs font-black uppercase tracking-[0.4em] leading-relaxed">Pase el cursor por una carta<br/>para inspección de vinculo</p>
      </div>
    );
  }

  // Calculate linked recipes
  const linkedItems = menu.categories?.flatMap(c => c.products) || [];
  const linkedRecipes = recipes.filter(r => linkedItems.some(p => (p as any)?._id === (r.product as any)?._id || p === (r.product as any)?._id));

  return (
    <div className="h-full glass-royale rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-royale animate-slide-left">
      <div className="p-10 bg-surface-3/50 border-b border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gold/10 rounded-xl text-gold">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-ivory tracking-tighter uppercase">Vínculos de Red</h2>
            <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em]">Audit de Producto vs Receta</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] font-black text-muted uppercase tracking-widest">NOMBRE DE CARTA</p>
            <p className="text-[9px] font-black text-gold uppercase tracking-widest">ESTADO {menu.active ? 'ALFA' : 'OFF'}</p>
          </div>
          <p className="text-xl font-black text-ivory uppercase tracking-tight">{menu.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <LinkIcon size={14} className="text-gold" />
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Fórmulas Vinculadas ({linkedRecipes.length})</p>
          </div>
          <div className="space-y-3">
            {linkedRecipes.length > 0 ? linkedRecipes.map((r) => (
              <div key={r._id} className="p-4 bg-surface-3/30 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-gold/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${r.type === 'drink' ? 'bg-ember/10 text-ember' : 'bg-emerald-400/10 text-emerald-400'}`}>
                    {r.type === 'drink' ? <Martini size={14} /> : <Utensils size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-ivory uppercase">{(r.product as any)?.name || "Producto"}</p>
                    <p className="text-[8px] text-muted font-black uppercase tracking-widest">{r.category || 'Gral'}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted group-hover:text-gold transition-colors" />
              </div>
            )) : (
              <p className="text-[10px] text-muted italic font-bold uppercase tracking-widest text-center py-8">Sin recetas vinculadas a los productos de esta carta.</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap size={14} className="text-lime" />
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Resumen de Distribución</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-surface-4 rounded-2xl border border-white/5 flex flex-col gap-1">
              <p className="text-[8px] font-black text-muted uppercase tracking-widest">CATEGORÍAS</p>
              <p className="text-xl font-black text-ivory">{menu.categories?.length || 0}</p>
            </div>
            <div className="p-5 bg-surface-4 rounded-2xl border border-white/5 flex flex-col gap-1">
              <p className="text-[8px] font-black text-muted uppercase tracking-widest">COBERTURA</p>
              <p className="text-xl font-black text-ivory">{linkedRecipes.length > 0 ? Math.round((linkedRecipes.length / linkedItems.length) * 100) : 0}%</p>
            </div>
          </div>
        </section>
      </div>

      <div className="p-10 bg-surface-3 border-t border-white/10">
        <div className="flex items-center gap-4 opacity-50">
          <History size={16} />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">Última sincronización: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[2.5rem] p-8 space-y-6 bg-surface-3/50 border border-white/5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5" />
        <div className="flex-1 space-y-2 py-2">
          <div className="h-4 bg-white/5 rounded-full w-2/3" />
          <div className="h-2 bg-white/5 rounded-full w-1/3" />
        </div>
      </div>
      <div className="h-10 bg-white/5 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-white/5 rounded-2xl" />
        <div className="h-16 bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}