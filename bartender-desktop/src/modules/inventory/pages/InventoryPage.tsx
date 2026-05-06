"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  Boxes,
  Activity,
  RefreshCcw,
  Target,
  Zap,
  TrendingUp,
  Box,
  Flame,
  Dices,
  ShieldCheck,
  LayoutGrid
} from "lucide-react";

import InventoryCard from "../components/InventoryCard";
import InventoryForm from "../components/InventoryForm";

import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../services/inventoryService";

import type { InventoryItem } from "../types/inventory";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "bar" | "kitchen" | "general">("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getInventory();
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      setError("Fallo en la sincronización de la Bóveda de Insumos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (filter !== "all") {
      list = list.filter(i => i.sector?.toLowerCase() === filter);
    }
    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter((item) =>
        item.name.toLowerCase().includes(lower) ||
        item.category?.toLowerCase().includes(lower)
      );
    }
    return list;
  }, [items, search, filter]);

  const stats = useMemo(() => {
    const total = items.length;
    const critical = items.filter((i) => (Number(i.stock) <= Number(i.minStock))).length;
    const totalValue = items.reduce((sum, i) => sum + (Number(i.stock) * Number(i.cost)), 0);
    const lowStock = items.filter(i => Number(i.stock) > Number(i.minStock) && Number(i.stock) <= Number(i.minStock) * 1.5).length;

    return { total, critical, totalValue, lowStock };
  }, [items]);

  const handleSave = async (item: InventoryItem) => {
    try {
      if (item._id) await updateInventoryItem(item._id, item);
      else await createInventoryItem(item);
      setOpen(false);
      setSelected(null);
      fetchData();
    } catch (err) {
      setError("Error al registrar movimiento en la Bóveda");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("¿Eliminar permanentemente este insumo de la Bóveda?")) return;
    try {
      await deleteInventoryItem(id);
      fetchData();
    } catch (err) {
      setError("Error al procesar la baja del insumo");
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-10 p-4 relative overflow-hidden">
      
      {/* ATMOSPHERIC BACKGROUNDS */}
      <div className="fixed -top-[10%] -left-[5%] w-[50%] h-[50%] bg-cyan-400/5 rounded-full blur-[180px] -z-10 animate-pulse-slow" />
      <div className="fixed -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[150px] -z-10 animate-pulse-slow" />

      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-grad-gold rounded-[2rem] shadow-gold-glow animate-float">
              <Package className="text-bg" size={36} />
            </div>
            <div>
              <h1 className="text-7xl font-black tracking-tighter text-grad-gold uppercase leading-none drop-shadow-2xl">
                Bóveda
              </h1>
              <p className="text-[11px] font-black text-muted uppercase tracking-[0.6em] ml-1 mt-2 flex items-center gap-2">
                <Target size={14} className="text-gold opacity-50" />
                Stock & Supply Intelligence · <span className="text-grad-gold">Umbra VIP v3.0</span>
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
              placeholder="Escanear insumo Umbra..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-3 border border-white/5 rounded-3xl py-5 pl-14 pr-8 text-sm font-bold text-ivory outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all w-80 shadow-inner group-hover:border-white/10"
            />
          </div>

          <div className="flex gap-4">
            <button onClick={fetchData} className="w-16 h-16 rounded-[1.5rem] glass-royale flex items-center justify-center group hover:border-gold/40 transition-all shadow-xl">
              <RefreshCcw size={24} className={`${loading ? "animate-spin text-gold" : "group-hover:rotate-180 transition-transform text-muted"}`} />
            </button>
            <button onClick={() => { setSelected(null); setOpen(true); }} className="btn btn-gold !px-12 !h-16 !rounded-[1.5rem] shadow-royale flex items-center gap-4 group relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Plus size={28} className="stroke-[4px] relative z-10" />
              <span className="font-black tracking-[0.2em] text-xs uppercase relative z-10">Nuevo Insumo</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <KPIBox label="Insumos Totales" value={stats.total} icon={<LayoutGrid size={20} />} color="gold" />
        <KPIBox label="Críticos" value={stats.critical} icon={<AlertTriangle size={20} className="animate-pulse" />} color="red" />
        <KPIBox label="En Alerta" value={stats.lowStock} icon={<Activity size={20} />} color="ember" />
        <KPIBox label="Valor de Bóveda" value={`$${stats.totalValue.toFixed(0)}`} icon={<TrendingUp size={20} />} color="lime" />
      </div>

      {/* FILTERS TABS */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-2">
        <ViewTab active={filter === "all"} onClick={() => setFilter("all")} label="Inventario Global" />
        <ViewTab active={filter === "bar"} onClick={() => setFilter("bar")} label="Bebidas & Mixología" color="gold" />
        <ViewTab active={filter === "kitchen"} onClick={() => setFilter("kitchen")} label="Insumos Gastronomía" color="emerald" />
        <ViewTab active={filter === "general"} onClick={() => setFilter("general")} label="Suministros Generales" color="ember" />
      </div>

      {/* ERROR FEEDBACK */}
      {error && (
        <div className="glass-red p-6 rounded-3xl flex items-center gap-6 animate-shake border-brand/20 shadow-xl">
          <AlertTriangle size={24} className="text-brand" />
          <p className="text-sm font-black uppercase tracking-widest text-ivory/90">{error}</p>
        </div>
      )}

      {/* MAIN CONTENT */}
      {loading && items.length === 0 ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex-1 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center opacity-20">
          <Dices size={64} className="mb-6 animate-bounce-slow" />
          <p className="text-sm font-black uppercase tracking-[0.5em]">Bóveda de Insumos Vacía</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto pr-6 custom-scrollbar pb-32">
          {filteredItems.map((item) => (
            <InventoryCard
              key={item._id}
              item={item}
              onEdit={(i) => { setSelected(i); setOpen(true); }}
              onDelete={() => handleDelete(item._id)}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      {open && (
        <InventoryForm
          item={selected}
          onSave={handleSave}
          onClose={() => { setOpen(false); setSelected(null); }}
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
    red: "text-red border-red/20 bg-red/5",
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
      <div className={`w-1.5 h-1.5 rounded-full ${colors[color] || 'bg-gold'} ${active ? 'shadow-glow' : 'opacity-20'}`} />
      <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${active ? 'text-ivory' : 'text-muted'}`}>
        {label}
      </span>
      {active && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-grad-gold rounded-full shadow-gold-glow" />
      )}
    </button>
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
      <div className="h-48 bg-white/5 rounded-[2rem]" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-white/5 rounded-2xl" />
        <div className="h-16 bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}