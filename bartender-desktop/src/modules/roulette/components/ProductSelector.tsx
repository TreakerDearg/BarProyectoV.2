// components/ProductSelector.tsx

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
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

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await api.get("/products");

    const drinks = data.filter(
      (p: Product) => p.type === "drink"
    );

    setProducts(drinks);
  };

  /* ==============================
     FILTER
  ============================== */
  const filtered = useMemo(() => {
    if (!search) return products;

    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, products]);

  return (
    <div className="space-y-4">
      {/* ================= HEADER ================= */}
      <div>
        <h3 className="text-sm text-gray-400">
          Add Drink to Roulette
        </h3>
        <p className="text-xs text-gray-600">
          Select from available products
        </p>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="flex items-center gap-2 bg-[#0F172A] border border-gray-800 rounded-xl px-3 py-2 focus-within:border-[#7A6BFA] transition">
        <Search size={16} className="text-gray-500" />

        <input
          type="text"
          placeholder="Search drinks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm text-white w-full placeholder:text-gray-500"
        />
      </div>

      {/* ================= LIST ================= */}
      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-6">
            No drinks found
          </div>
        )}

        {filtered.map((product) => {
          const isSelected = selectedId === product._id;

          return (
            <div
              key={product._id}
              className={`
                group relative flex items-center justify-between 
                bg-[#0F172A] border rounded-xl p-3 transition-all
                ${
                  isSelected
                    ? "border-[#7A6BFA] bg-[#1A1B23]"
                    : "border-gray-800 hover:border-[#7A6BFA]"
                }
              `}
            >
              {/* LEFT INFO */}
              <div className="flex items-center gap-3">
                {/* ICON */}
                <div className="w-9 h-9 rounded-lg bg-[#1A1B23] flex items-center justify-center border border-gray-800">
                  <Martini size={16} className="text-[#7A6BFA]" />
                </div>

                {/* TEXT */}
                <div>
                  <div className="text-white text-sm font-medium">
                    {product.name}
                  </div>

                  <div className="text-xs text-gray-400">
                    {product.category}
                  </div>
                </div>
              </div>

              {/* RIGHT ACTION */}
              <div className="flex items-center gap-3">
                {product.price && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <DollarSign size={12} />
                    {product.price}
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedId(product._id);
                    onSelect(product);
                  }}
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition
                    ${
                      isSelected
                        ? "bg-[#7A6BFA] text-white"
                        : "bg-gray-800 text-gray-300 group-hover:bg-[#7A6BFA] group-hover:text-white"
                    }
                  `}
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="text-xs text-gray-600 text-right">
        {filtered.length} drinks available
      </div>
    </div>
  );
}