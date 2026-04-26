"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Martini,
  DollarSign,
} from "lucide-react";
import api from "../../../services/api";

interface Product {
  _id: string;
  name: string;
  category: string;
  price?: number;
  type?: string;
}

interface Props {
  onSelect: (product: Product) => void;
}

export default function ProductSelector({ onSelect }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products");

      const drinks = data.filter(
        (p: Product) => p.type === "drink"
      );

      setProducts(drinks);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    if (!search) return products;

    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, products]);

  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#05070D] to-[#0A0F1C] border border-blue-900/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]">

      {/* ================= HEADER ================= */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-cyan-400 tracking-widest">
          ADD DRINK
        </h3>
        <p className="text-xs text-gray-500">
          Select product for roulette system
        </p>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="relative mb-4">
        <Search
          size={14}
          className="absolute left-3 top-2.5 text-gray-500"
        />

        <input
          type="text"
          placeholder="Search drink..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full pl-8 pr-3 py-2 
            bg-[#0A0F1C] border border-blue-900/40 
            rounded-lg text-sm text-white
            placeholder:text-gray-500
            focus:outline-none focus:border-cyan-400/50
          "
        />
      </div>

      {/* ================= LIST ================= */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">

        {loading && (
          <div className="text-center text-gray-500 py-6 text-sm">
            Loading drinks...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center text-gray-500 py-6 text-sm">
            No drinks found
          </div>
        )}

        {filtered.map((product) => {
          const isSelected = selectedId === product._id;

          return (
            <div
              key={product._id}
              onClick={() => {
                setSelectedId(product._id);
                onSelect(product);
              }}
              className={`
                group relative flex items-center justify-between
                rounded-xl p-3 cursor-pointer transition-all
                border
                ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,200,255,0.15)]"
                    : "border-blue-900/40 bg-[#0A0F1C] hover:border-cyan-400/40 hover:bg-[#0F172A]"
                }
              `}
            >

              {/* LEFT */}
              <div className="flex items-center gap-3">

                {/* ICON */}
                <div
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    border transition
                    ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400/30 text-cyan-400"
                        : "bg-[#05070D] border-blue-900/40 text-gray-400 group-hover:text-cyan-400"
                    }
                  `}
                >
                  <Martini size={16} />
                </div>

                {/* TEXT */}
                <div>
                  <div className="text-white text-sm font-semibold">
                    {product.name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {product.category}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">

                {/* PRICE */}
                {product.price && (
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                    <DollarSign size={12} />
                    {product.price}
                  </div>
                )}

                {/* BUTTON */}
                <div
                  className={`
                    px-3 py-1 rounded-lg text-xs font-bold tracking-widest transition
                    ${
                      isSelected
                        ? "bg-cyan-400 text-black"
                        : "bg-gray-800 text-gray-300 group-hover:bg-cyan-400 group-hover:text-black"
                    }
                  `}
                >
                  {isSelected ? "ADDED" : "ADD"}
                </div>
              </div>

              {/* SIDE GLOW */}
              {isSelected && (
                <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400 rounded-l-xl shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
              )}
            </div>
          );
        })}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="mt-3 text-xs text-gray-500 flex justify-between">
        <span>{filtered.length} drinks</span>

        <span className="text-cyan-400">
          {selectedId ? "1 selected" : "none selected"}
        </span>
      </div>
    </div>
  );
}