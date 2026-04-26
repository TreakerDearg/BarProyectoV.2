"use client";

import {
  Pencil,
  Trash2,
  Star,
  AlertTriangle,
  TrendingUp,
  Package,
  Wine,
  UtensilsCrossed,
} from "lucide-react";

import type { Product } from "../../../types/product";

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: Props) {
  /* =========================
     CALCULATIONS
  ========================= */
  const margin =
    product.price && product.cost
      ? Math.round(
          ((product.price - product.cost) / product.price) * 100
        )
      : 0;

  const profit =
    product.price && product.cost
      ? product.price - product.cost
      : 0;

  const isDrink = product.type === "drink";

  /* =========================
     TYPE CONFIG
  ========================= */
  const typeConfig = isDrink
    ? {
        label: "DRINK",
        icon: <Wine size={12} />,
        style:
          "bg-cyan-500/15 text-cyan-400 border-cyan-400/20",
      }
    : {
        label: "FOOD",
        icon: <UtensilsCrossed size={12} />,
        style:
          "bg-orange-500/15 text-orange-400 border-orange-400/20",
      };

  /* =========================
     STATUS
  ========================= */
  const availabilityStyle = product.available
    ? "bg-green-500/15 text-green-400 border-green-400/20"
    : "bg-red-500/15 text-red-400 border-red-400/20";

  const marginBar =
    margin >= 40
      ? "bg-green-400"
      : margin >= 20
      ? "bg-yellow-400"
      : "bg-red-400";

  const marginText =
    margin >= 40
      ? "text-green-400"
      : margin >= 20
      ? "text-yellow-400"
      : "text-red-400";

  /* =========================
     UI
  ========================= */
  return (
    <div className="group relative rounded-2xl border border-blue-900/40 bg-gradient-to-b from-[#0a0f1c] to-black p-4 overflow-hidden transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(0,200,255,0.15)]">

      {/* HOVER LIGHT */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gradient-to-br from-cyan-400/10 via-transparent to-transparent" />

      {/* ================= IMAGE ================= */}
      <div className="relative mb-3">

        {/* IMAGE */}
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-36 object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="w-full h-36 bg-gray-800 rounded-xl flex items-center justify-center text-gray-600 text-xs">
            NO IMAGE
          </div>
        )}

        {/* OVERLAY GRADIENT */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* TOP BADGES */}
        <div className="absolute top-2 left-2 flex gap-2">

          {/* TYPE */}
          <div
            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border backdrop-blur ${typeConfig.style}`}
          >
            {typeConfig.icon}
            {typeConfig.label}
          </div>

        </div>

        <div className="absolute top-2 right-2 flex gap-2">

          {/* FEATURED */}
          {product.featured && (
            <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-yellow-400/30 bg-yellow-400/15 text-yellow-400 backdrop-blur">
              <Star size={10} />
            </div>
          )}

        </div>

        {/* BOTTOM BADGE */}
        <div
          className={`absolute bottom-2 left-2 text-[10px] px-2 py-1 rounded border backdrop-blur ${availabilityStyle}`}
        >
          {product.available ? "AVAILABLE" : "OUT"}
        </div>

      </div>

      {/* ================= CONTENT ================= */}

      {/* TITLE */}
      <h3 className="text-white font-bold text-lg leading-tight">
        {product.name}
      </h3>

      {/* DESCRIPTION */}
      <p className="text-xs text-gray-400 line-clamp-2 mt-1">
        {product.description || "No description"}
      </p>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mt-3 text-[10px] uppercase tracking-wide">
        <span className="bg-gray-800/70 px-2 py-1 rounded border border-gray-700">
          {product.category}
        </span>

        {product.subcategory && (
          <span className="bg-gray-800/70 px-2 py-1 rounded border border-gray-700">
            {product.subcategory}
          </span>
        )}
      </div>

      {/* ================= PRICING ================= */}
      <div className="mt-4 space-y-2">

        {/* PRICE */}
        <div className="flex justify-between items-center">
          <span className="text-amber-400 font-bold text-xl">
            ${product.price.toFixed(2)}
          </span>

          <span className={`text-xs font-bold ${marginText}`}>
            {margin}%
          </span>
        </div>

        {/* COST / PROFIT */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>Cost: ${product.cost?.toFixed(2) || "0.00"}</span>

          <span className="flex items-center gap-1 text-green-400">
            <TrendingUp size={12} />
            +${profit.toFixed(2)}
          </span>
        </div>

        {/* MARGIN BAR */}
        <div className="w-full h-1 bg-gray-800 rounded overflow-hidden">
          <div
            className={`h-full ${marginBar}`}
            style={{ width: `${Math.min(margin, 100)}%` }}
          />
        </div>

        {/* STOCK */}
        {"stock" in product && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <Package size={12} />
            Stock: {(product as any).stock ?? 0}
          </div>
        )}
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition">

        <button
          onClick={() => onEdit(product)}
          className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/20 text-blue-400 hover:bg-blue-500/20 transition"
        >
          <Pencil size={14} />
        </button>

        <button
          onClick={() => product._id && onDelete(product._id)}
          className="p-2 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 transition"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* WARNING */}
      {margin < 20 && (
        <div className="absolute bottom-2 right-2 text-red-400 animate-pulse">
          <AlertTriangle size={14} />
        </div>
      )}
    </div>
  );
}