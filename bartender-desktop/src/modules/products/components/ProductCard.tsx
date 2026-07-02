"use client";

import {
  Pencil,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Layers,
  Martini,
  UtensilsCrossed,
  Eye
} from "lucide-react";

import type { Product } from "../../../types/product";
import { useProductUiStore } from "../store/productUiStore";

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (product: Product) => void;
  simplified?: boolean;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  simplified = false,
}: Props) {
  const { openDrawer } = useProductUiStore();
  const isDrink = product.type === "drink";
  const price = product.price ?? 0;
  const dynamicPrice = (product.dynamicPrice ?? price) as number;
  const cost = product.cost ?? 0;
  const margin = dynamicPrice > 0 ? Math.round(((dynamicPrice - cost) / dynamicPrice) * 100) : 0;

  // Nebula theme configuration by type and category
  const typeTheme = {
    drink: {
      gradient: "from-amber-500/15 via-gold/10 to-orange-500/5",
      borderColor: "border-gold/20",
      icon: <Martini size={24} className="text-gold" />,
      glow: "bg-gold/5",
      primaryColor: "text-gold",
      badgeColor: "bg-gold/20 text-gold border-gold/30"
    },
    food: {
      gradient: "from-emerald-500/15 via-green-500/10 to-teal-500/5",
      borderColor: "border-emerald/20",
      icon: <UtensilsCrossed size={24} className="text-emerald-400" />,
      glow: "bg-emerald/5",
      primaryColor: "text-emerald-400",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald/500/30"
    }
  }[product.type || "drink"];

  // Category-based color variations (Nebula palette)
  const categoryTheme = {
    // Drink categories
    "Cócteles Clásicos": { accent: "border-violet/20", glow: "bg-violet/5" },
    "Cócteles de Autor": { accent: "border-cyan/20", glow: "bg-cyan/5" },
    "Shots": { accent: "border-amber/20", glow: "bg-amber/5" },
    "Bebidas sin Alcohol": { accent: "border-emerald/20", glow: "bg-emerald/5" },
    // Food categories
    "Entradas": { accent: "border-orange/20", glow: "bg-orange/5" },
    "Platos Principales": { accent: "border-red/20", glow: "bg-red/5" },
    "Postres": { accent: "border-pink/20", glow: "bg-pink/5" },
    "Acompañamientos": { accent: "border-yellow/20", glow: "bg-yellow/5" },
  }[product.category] || { accent: "border-white/15", glow: "bg-white/5" };

  const statusConfig = product.available
    ? { color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald/30" }
    : { color: "text-red-400", bg: "bg-red-500/20", border: "border-red/30" };

  const handleViewDetails = () => {
    openDrawer(product);
  };

  return (
      <div className={`
        relative group cursor-pointer
        rounded-2xl overflow-hidden transition-all duration-500
        bg-gradient-to-br ${typeTheme.gradient} border ${typeTheme.borderColor} ${categoryTheme.accent}
        hover:scale-[1.02] hover:shadow-2xl
      `}>

      {/* Hero Section */}
      <div className={`relative p-4 pb-3 bg-gradient-to-r ${typeTheme.gradient}`}>
        <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[50px] transition-opacity duration-700 opacity-50 group-hover:opacity-100 ${typeTheme.glow}`} />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            {product.image ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 border border-white/20 flex-shrink-0 shadow-lg">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 flex-shrink-0 shadow-lg`}>
                {typeTheme.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-base text-white truncate">
                  {product.name}
                </h3>
                <div className={`p-1 rounded-full ${statusConfig.bg} ${statusConfig.border}`}>
                  {product.available ? (
                    <CheckCircle size={12} className={statusConfig.color} />
                  ) : (
                    <XCircle size={12} className={statusConfig.color} />
                  )}
                </div>
              </div>
              {!simplified && (
                <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">
                  {product.category || 'General'} · {product.type === 'drink' ? 'Bebida' : 'Comida'}
                </p>
              )}
              {isDrink && product.drinkStyle && (
                <div className="mt-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                    product.drinkStyle === 'author'
                      ? 'bg-violet-500/20 text-violet-400 border border-violet/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan/30'
                  }`}>
                    {product.drinkStyle === 'author' ? 'Autor' : 'Clásico'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {product.featured && (
            <div className="p-1.5 rounded-lg bg-gold/20 border border-gold/30">
              <Star size={14} className="text-gold fill-gold" />
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 border-t border-white/10">
        <div className="text-center">
          <p className="text-[9px] text-white/50 uppercase tracking-wider mb-1">Precio</p>
          <p className="text-base font-bold text-white">
            ${dynamicPrice.toFixed(2)}
          </p>
        </div>
        {!simplified && (
          <>
            <div className="text-center">
              <p className="text-[9px] text-white/50 uppercase tracking-wider mb-1">Margen</p>
              <p className={`text-base font-bold ${margin > 50 ? 'text-emerald-400' : margin > 30 ? 'text-cyan-400' : 'text-gold'}`}>
                {margin}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-white/50 uppercase tracking-wider mb-1">Costo</p>
              <p className="text-base font-bold text-white/70">
                ${cost.toFixed(2)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Additional Info (Advanced Mode) */}
      {!simplified && (
        <div className="px-3 pb-3 space-y-2">
          <div className="flex items-center gap-3 text-[10px] text-white/50">
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>{product.preparationTime || 5} min</span>
            </div>
            {product.recipe && (
              <div className="flex items-center gap-1">
                <Layers size={10} className="text-emerald-400" />
                <span className="text-emerald-400">Tiene receta</span>
              </div>
            )}
            {product.menuIds && product.menuIds.length > 0 && (
              <div className="flex items-center gap-1">
                <Layers size={10} className="text-violet-400" />
                <span className="text-violet-400">{product.menuIds.length} menú(s)</span>
              </div>
            )}
          </div>

          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded border border-violet/30">
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-[9px] text-white/40">+{product.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 p-3 bg-white/5 border-t border-white/10">
        <button
          onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-violet/20 border border-violet/30 text-violet hover:bg-violet/30 transition-all"
        >
          <Eye size={14} />
          <span className="text-xs font-bold">Detalles</span>
        </button>

        <button
          onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
        >
          <Pencil size={14} />
          <span className="text-xs font-bold">Editar</span>
        </button>

        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(product); }}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <Copy size={14} />
          </button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(product._id!); }}
          className="p-2.5 rounded-xl bg-red/10 border border-red/20 text-red-400 hover:bg-red/20 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}