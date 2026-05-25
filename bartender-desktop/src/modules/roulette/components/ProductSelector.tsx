"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Martini,
  DollarSign,
  Info,
  AlertCircle,
  CheckCircle2,
  Settings2
} from "lucide-react";
import api from "../../../services/api";
import type { RouletteRarity } from "../types/roulette";

interface Product {
  _id: string;
  name: string;
  category: string;
  price?: number;
  type?: string;
  stock?: number;
  available?: boolean;
}

interface Props {
  onSelect: (product: Product, config: { weight: number; rarity: RouletteRarity }) => void;
}

export default function ProductSelector({ onSelect }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configWeight, setConfigWeight] = useState(10);
  const [configRarity, setConfigRarity] = useState<RouletteRarity>("COMMON");

  /* ================= LOAD ================= */
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/products");

      const drinks = data.filter(
        (p: Product) => p.type === "drink"
      );

      setProducts(drinks);
    } catch (err) {
      setError("Error al cargar productos. Por favor intenta nuevamente.");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    if (!search) return products;

    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, products]);

  const handleSelect = (product: Product) => {
    // Foolproof validation: Check if product is available
    if (product.available === false) {
      alert("Este producto no está disponible actualmente. Por favor selecciona otro.");
      return;
    }

    // Confirmation before adding
    const confirmMessage = `¿Añadir "${product.name}" a la ruleta?\n\nConfiguración:\n- Peso: ${configWeight}\n- Rareza: ${configRarity}`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setSelectedId(product._id);
    onSelect(product, { weight: configWeight, rarity: configRarity });
    
    // Reset selection after adding
    setTimeout(() => {
      setSelectedId(null);
    }, 500);
  };

  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-full glass-royale border border-white/5 rounded-[2rem] p-6 shadow-royale overflow-hidden">
      
      {/* Background Gold Aura */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gold/10 text-gold">
            <Martini size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-ivory tracking-tight uppercase">
              Añadir Trago a la Ruleta
            </h3>
            <p className="text-[9px] text-muted uppercase tracking-[0.2em]">
              Selecciona un producto de tu inventario
            </p>
          </div>
        </div>
        
        {/* Info Tip */}
        <div className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
          <Info size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-[9px] text-emerald-400/90 leading-relaxed">
            Configura el peso y rareza antes de añadir el trago. Puedes ajustar estos valores después en el panel de control.
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="flex items-center gap-3 bg-surface-3/30 border border-white/10 rounded-xl p-3">
          <Settings2 size={14} className="text-gold" />
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div>
              <label className="text-[8px] text-muted uppercase tracking-wider mb-1 block">Peso Inicial</label>
              <input
                type="number"
                min="1"
                max="100"
                value={configWeight}
                onChange={(e) => setConfigWeight(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-surface-3/50 border border-white/10 rounded-lg text-xs text-ivory focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="text-[8px] text-muted uppercase tracking-wider mb-1 block">Rareza</label>
              <select
                value={configRarity}
                onChange={(e) => setConfigRarity(e.target.value as RouletteRarity)}
                className="w-full px-2 py-1.5 bg-surface-3/50 border border-white/10 rounded-lg text-xs text-ivory focus:outline-none focus:border-gold/50"
              >
                <option value="COMMON">Common</option>
                <option value="RARE">Rare</option>
                <option value="EPIC">Epic</option>
                <option value="LEGENDARY">Legendary</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="relative mb-4 relative z-10">
        <Search
          size={14}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        />

        <input
          type="text"
          placeholder="Buscar trago por nombre o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full pl-11 pr-4 py-3 
            bg-surface-3/30 border border-white/10 
            rounded-xl text-xs text-ivory font-medium
            placeholder:text-muted/50
            focus:outline-none focus:border-gold/50 focus:bg-surface-3/50 transition-all
          "
        />
      </div>

      {/* ================= LIST ================= */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar relative z-10">

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-3" />
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">
              Cargando productos...
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={32} className="text-red mb-3" />
            <p className="text-xs text-red font-black uppercase tracking-wider mb-2">
              Error de Carga
            </p>
            <p className="text-[10px] text-muted/70 uppercase tracking-wider mb-4">
              {error}
            </p>
            <button
              onClick={load}
              className="px-4 py-2 bg-red/10 text-red border border-red/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red/20 transition-all"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Martini size={32} className="text-muted/30 mb-3" />
            <p className="text-xs text-muted font-black uppercase tracking-wider">
              No se encontraron tragos
            </p>
            <p className="text-[9px] text-muted/50 uppercase tracking-wider mt-1">
              Intenta con otro término de búsqueda
            </p>
          </div>
        )}

        {!loading && !error && filtered.map((product) => {
          const isSelected = selectedId === product._id;
          const isLowStock = product.stock !== undefined && product.stock < 5;
          const isUnavailable = product.available === false;

          return (
            <div
              key={product._id}
              onClick={() => handleSelect(product)}
              className={`
                group relative flex items-center justify-between
                rounded-2xl p-4 cursor-pointer transition-all duration-300
                border
                ${
                  isUnavailable
                    ? "border-red/20 bg-red/5 opacity-50 cursor-not-allowed"
                    : isSelected
                      ? "border-gold/30 bg-gold/10 shadow-gold-glow/10"
                      : "border-white/5 bg-surface-3/20 hover:border-gold/20 hover:bg-surface-3/30"
                }
              `}
            >
              {/* LEFT */}
              <div className="flex items-center gap-4 flex-1 min-w-0">

                {/* ICON */}
                <div
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    border transition-all flex-shrink-0
                    ${
                      isUnavailable
                        ? "bg-red/10 border-red/20 text-red/50"
                        : isSelected
                          ? "bg-gold/20 border-gold/30 text-gold"
                          : "bg-surface-3 border-white/10 text-muted group-hover:text-gold group-hover:border-gold/30"
                    }
                  `}
                >
                  <Martini size={20} />
                </div>

                {/* TEXT */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-black uppercase tracking-tight truncate ${
                    isUnavailable ? "text-muted/50" : isSelected ? "text-gold" : "text-ivory group-hover:text-gold"
                  }`}>
                    {product.name}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] uppercase tracking-wider ${
                      isUnavailable ? "text-muted/40" : "text-muted/70"
                    }`}>
                      {product.category}
                    </span>
                    
                    {/* Stock Indicator */}
                    {product.stock !== undefined && (
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        isLowStock 
                          ? "bg-red/10 text-red border border-red/20" 
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-400/20"
                      }`}>
                        Stock: {product.stock}
                      </span>
                    )}

                    {/* Unavailable Badge */}
                    {isUnavailable && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-red/10 text-red border border-red/20">
                        No Disponible
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">

                {/* PRICE */}
                {product.price && (
                  <div className={`flex items-center gap-1 text-xs font-black ${
                    isUnavailable ? "text-muted/40" : "text-gold"
                  }`}>
                    <DollarSign size={12} />
                    {product.price}
                  </div>
                )}

                {/* STATUS ICON */}
                {isSelected ? (
                  <div className="p-2 rounded-xl bg-gold text-black">
                    <CheckCircle2 size={16} />
                  </div>
                ) : isUnavailable ? (
                  <div className="p-2 rounded-xl bg-red/10 text-red/50">
                    <AlertCircle size={16} />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-surface-3 text-muted group-hover:bg-gold/10 group-hover:text-gold transition-all">
                    <Martini size={16} />
                  </div>
                )}
              </div>

              {/* SIDE GLOW */}
              {isSelected && !isUnavailable && (
                <div className="absolute left-0 top-0 h-full w-1 bg-gold rounded-l-2xl shadow-gold-glow" />
              )}
            </div>
          );
        })}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <span className="text-[9px] text-muted font-black uppercase tracking-widest">
            {filtered.length} tragos disponibles
          </span>
          {selectedId && (
            <span className="text-[9px] text-gold font-black uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 size={10} />
              1 seleccionado
            </span>
          )}
        </div>

        {selectedId && (
          <button
            onClick={() => {
              const product = products.find(p => p._id === selectedId);
              if (product) handleSelect(product);
            }}
            className="px-4 py-2 bg-grad-gold text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all"
          >
            Confirmar Selección
          </button>
        )}
      </div>

    </div>
  );
}