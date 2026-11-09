"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Martini,
  DollarSign,
  Info,
  AlertCircle,
  CheckCircle2,
  Settings2,
  Plus,
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configWeight, setConfigWeight] = useState(10);
  const [configRarity, setConfigRarity] = useState<RouletteRarity>("COMMON");
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  /* ================= LOAD ================= */
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/products");

      const drinks = data.filter((p: Product) => p.type === "drink");
      setProducts(drinks);
    } catch (err) {
      setError("Error al cargar productos del inventario.");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    if (!search) return products;

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, products]);

  const handleChooseProduct = (product: Product) => {
    if (product.available === false) {
      setWarningMessage(`El producto "${product.name}" no está disponible actualmente en inventario.`);
      setTimeout(() => setWarningMessage(null), 4000);
      return;
    }
    setWarningMessage(null);
    setSelectedProduct(product);
  };

  const handleConfirmAdd = () => {
    if (!selectedProduct) return;
    onSelect(selectedProduct, { weight: configWeight, rarity: configRarity });
  };

  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-full bg-surface-2 border border-border rounded-3xl p-5 sm:p-6 shadow-xl overflow-hidden">
      {/* ================= HEADER & CONFIG ================= */}
      <div className="mb-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gold/10 text-gold border border-gold/20">
            <Martini size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-ivory tracking-tight uppercase">
              Añadir Trago a la Ruleta
            </h3>
            <p className="text-xs text-muted">
              Selecciona un producto del catálogo para integrarlo a la matriz de probabilidades
            </p>
          </div>
        </div>

        {/* Notificación de advertencia en caso de producto no disponible */}
        {warningMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red/10 border border-red/30 text-red text-xs animate-fadeIn">
            <AlertCircle size={16} className="shrink-0" />
            <span>{warningMessage}</span>
          </div>
        )}

        {/* Panel de Configuración de Peso y Rareza */}
        <div className="p-4 rounded-2xl bg-surface-3 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Settings2 size={16} className="text-gold" />
            <span className="text-xs font-black text-ivory uppercase tracking-wider">
              Calibración Inicial
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
                Peso Inicial (1 - 100)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={configWeight}
                onChange={(e) => setConfigWeight(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-sm text-ivory focus:outline-none focus:border-gold/50 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
                Nivel de Rareza
              </label>
              <select
                value={configRarity}
                onChange={(e) => setConfigRarity(e.target.value as RouletteRarity)}
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-sm text-ivory focus:outline-none focus:border-gold/50 font-bold"
              >
                <option value="COMMON">Común (Common)</option>
                <option value="RARE">Raro (Rare)</option>
                <option value="EPIC">Épico (Epic)</option>
                <option value="LEGENDARY">Legendario (Legendary)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="relative mb-3">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          placeholder="Buscar trago por nombre o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-3 border border-border rounded-xl text-xs sm:text-sm text-ivory placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-all font-medium"
        />
      </div>

      {/* ================= LIST ================= */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[320px] custom-scrollbar">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted font-bold uppercase tracking-wider">
              Cargando catálogo...
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle size={28} className="text-red mb-2" />
            <p className="text-xs text-red font-bold mb-3">{error}</p>
            <button
              onClick={load}
              className="px-4 py-2 bg-surface-3 hover:bg-surface-4 text-ivory border border-border rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Martini size={32} className="text-muted/40 mb-2" />
            <p className="text-xs text-muted font-bold uppercase tracking-wider">
              No se encontraron tragos disponibles
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          filtered.map((product) => {
            const isSelected = selectedProduct?._id === product._id;
            const isLowStock = product.stock !== undefined && product.stock < 5;
            const isUnavailable = product.available === false;

            return (
              <div
                key={product._id}
                onClick={() => handleChooseProduct(product)}
                className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer border transition-all ${isUnavailable
                    ? "border-border/40 bg-surface-3/30 opacity-40 cursor-not-allowed"
                    : isSelected
                      ? "border-gold bg-gold/10 shadow-sm"
                      : "border-border bg-surface-3/50 hover:bg-surface-3 hover:border-border-strong"
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isSelected
                        ? "bg-gold text-bg border-gold"
                        : "bg-surface-2 border-border text-gold"
                      }`}
                  >
                    <Martini size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-ivory uppercase truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted uppercase font-bold">
                        {product.category}
                      </span>
                      {product.stock !== undefined && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase ${isLowStock
                              ? "bg-red/10 text-red border border-red/20"
                              : "bg-emerald/10 text-emerald border border-emerald/20"
                            }`}
                        >
                          Stock: {product.stock}
                        </span>
                      )}
                      {isUnavailable && (
                        <span className="text-xs px-2 py-0.5 rounded-md font-bold uppercase bg-red/10 text-red border border-red/20">
                          Agotado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {product.price != null && (
                    <span className="text-xs sm:text-sm font-black text-gold">
                      ${product.price.toLocaleString("es-AR")}
                    </span>
                  )}
                  <div
                    className={`p-2 rounded-xl border ${isSelected
                        ? "bg-gold text-bg border-gold"
                        : "bg-surface-2 text-muted border-border"
                      }`}
                  >
                    {isSelected ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* ================= FOOTER / CONFIRM ACTION ================= */}
      <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-muted font-bold uppercase tracking-wider">
          {filtered.length} productos en catálogo
        </span>

        {selectedProduct ? (
          <button
            onClick={handleConfirmAdd}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-light text-bg text-xs font-black uppercase tracking-wider rounded-xl shadow-gold-glow transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Añadir "{selectedProduct.name}" (Peso: {configWeight})</span>
          </button>
        ) : (
          <span className="text-xs text-muted/80 italic">
            Selecciona un trago para añadir
          </span>
        )}
      </div>
    </div>
  );
}
