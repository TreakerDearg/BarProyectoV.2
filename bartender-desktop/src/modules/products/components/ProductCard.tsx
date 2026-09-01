/**
 * ProductCard — tres niveles de vista.
 *
 * simple:    Imagen + nombre + precio + categoría + estado. Touch-friendly.
 * standard:  + descripción + margen + costo + preparación + tags. (default)
 * advanced:  + todas las métricas + receta + menús + restricciones dietarias.
 */

import {
  Pencil, Trash2, Eye, Star, CheckCircle, XCircle,
  Martini, UtensilsCrossed, Clock, Layers, Tag, Zap,
  TrendingUp, DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "../../../types/product";
import { useProductUiStore } from "../store/productUiStore";

// ── Tipos ─────────────────────────────────────────────────────────

export type ViewLevel = "simple" | "standard" | "advanced";

interface Props {
  product: Product;
  view?: ViewLevel;
  onEdit:   (product: Product) => void;
  onDelete: (id: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────

function formatPrice(n: number): string {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

// Mapa de colores por tipo
const TYPE_THEME = {
  drink: {
    gradient:  "from-amber-500/10 via-gold/8 to-transparent",
    border:    "border-gold/20 hover:border-gold/40",
    iconColor: "text-gold",
    tagBg:     "bg-gold/10 text-gold border-gold/25",
  },
  food: {
    gradient:  "from-emerald-500/10 via-emerald-400/6 to-transparent",
    border:    "border-emerald-400/20 hover:border-emerald-400/40",
    iconColor: "text-emerald-400",
    tagBg:     "bg-emerald-400/10 text-emerald-400 border-emerald-400/25",
  },
} as const;

function TypeIcon({ type, size = 20 }: { type: string; size?: number }) {
  return type === "drink"
    ? <Martini size={size} />
    : <UtensilsCrossed size={size} />;
}

// ── Componente ────────────────────────────────────────────────────

export default function ProductCard({ product, view = "standard", onEdit, onDelete }: Props) {
  const { openDrawer } = useProductUiStore();

  const theme      = TYPE_THEME[product.type ?? "drink"];
  const price      = product.price ?? 0;
  const dynPrice   = (product.dynamicPrice ?? price) as number;
  const cost       = product.cost ?? 0;
  const margin     = dynPrice > 0 ? Math.round(((dynPrice - cost) / dynPrice) * 100) : 0;
  const marginColor = margin > 50 ? "text-emerald-400" : margin > 30 ? "text-cyan-400" : "text-gold";
  const statusOk   = product.available;

  // ── VISTA SIMPLE ─────────────────────────────────────────────────
  if (view === "simple") {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        className={`group relative rounded-2xl overflow-hidden border bg-surface-3/60 backdrop-blur-sm ${theme.border} transition-all duration-300 cursor-pointer`}
        onClick={() => openDrawer(product)}
      >
        {/* Imagen */}
        <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
              <span className={theme.iconColor}>
                <TypeIcon type={product.type} size={32} />
              </span>
            </div>
          )}

          {/* Disponibilidad */}
          <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${statusOk ? "bg-emerald-400" : "bg-red-400"}`} />

          {/* Featured */}
          {product.featured && (
            <div className="absolute top-2 left-2 p-1 rounded-lg bg-gold/20 border border-gold/30">
              <Star size={10} className="text-gold fill-gold" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-white/40 uppercase tracking-wider truncate mb-0.5">
            {product.category || "—"}
          </p>
          <h3 className="text-sm font-bold text-ivory capitalize truncate">{product.name}</h3>
          <p className="text-base font-extrabold text-gold mt-1">{formatPrice(dynPrice)}</p>
        </div>

        {/* Acciones hover */}
        <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="flex-1 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-ivory hover:bg-white/20 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product._id!); }}
            className="p-1.5 rounded-lg bg-red/10 border border-red/20 text-red-400 hover:bg-red/20 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ── VISTA STANDARD ────────────────────────────────────────────────
  if (view === "standard") {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        className={`group relative rounded-2xl overflow-hidden border bg-gradient-to-br ${theme.gradient} bg-surface-3/60 ${theme.border} transition-all duration-300 flex flex-col`}
      >
        {/* Imagen */}
        <div className="relative aspect-[16/9] bg-black/40 overflow-hidden flex-shrink-0">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center`}>
              <span className={`opacity-40 ${theme.iconColor}`}>
                <TypeIcon type={product.type} size={40} />
              </span>
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute inset-x-0 top-0 p-2.5 flex items-start justify-between">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border backdrop-blur-sm ${theme.tagBg}`}>
              {product.type === "drink" ? "Bebida" : "Comida"}
            </span>
            <div className="flex items-center gap-1.5">
              {product.featured && (
                <div className="p-1.5 rounded-lg bg-gold/20 border border-gold/30 backdrop-blur-sm">
                  <Star size={12} className="text-gold fill-gold" />
                </div>
              )}
              <div className={`p-1.5 rounded-lg backdrop-blur-sm ${statusOk ? "bg-emerald-500/20 border border-emerald/30" : "bg-red/20 border border-red/30"}`}>
                {statusOk
                  ? <CheckCircle size={12} className="text-emerald-400" />
                  : <XCircle    size={12} className="text-red-400" />
                }
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Nombre + categoría */}
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">{product.category || "—"}</p>
            <h3 className="font-bold text-base text-ivory capitalize leading-snug mt-0.5">{product.name}</h3>
            {product.description && (
              <p className="text-xs text-white/50 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/8">
              <p className="text-[8px] text-white/40 uppercase tracking-wider mb-0.5">Precio</p>
              <p className="text-sm font-extrabold text-gold">{formatPrice(dynPrice)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/8">
              <p className="text-[8px] text-white/40 uppercase tracking-wider mb-0.5">Margen</p>
              <p className={`text-sm font-extrabold ${marginColor}`}>{margin}%</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/8">
              <p className="text-[8px] text-white/40 uppercase tracking-wider mb-0.5">Prep</p>
              <p className="text-sm font-extrabold text-white/70">{product.preparationTime ?? 5}m</p>
            </div>
          </div>

          {/* Tags */}
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet/20">
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-[9px] text-white/30">+{product.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 p-3 pt-0">
          <button
            onClick={() => openDrawer(product)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-ivory hover:border-white/20 transition-all"
          >
            <Eye size={13} />
            Ver
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-violet/10 border border-violet/20 text-xs font-bold text-violet-300 hover:bg-violet/20 transition-all"
          >
            <Pencil size={13} />
            Editar
          </button>
          <button
            onClick={() => onDelete(product._id!)}
            className="p-2 rounded-xl bg-red/8 border border-red/15 text-red-400/70 hover:bg-red/15 hover:text-red-400 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ── VISTA ADVANCED ────────────────────────────────────────────────
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`group relative rounded-2xl border bg-gradient-to-br ${theme.gradient} bg-surface-3/80 ${theme.border} transition-all duration-300`}
    >
      <div className="flex gap-4 p-4">
        {/* Imagen cuadrada */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-black/30 border border-white/10">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className={`opacity-40 ${theme.iconColor}`}>
                <TypeIcon type={product.type} size={28} />
              </span>
            </div>
          )}
          {!statusOk && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <XCircle size={20} className="text-red-400" />
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${theme.tagBg}`}>
                  {product.category || "—"}
                </span>
                {product.drinkStyle && product.type === "drink" && (
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                    product.drinkStyle === "author"
                      ? "bg-violet/10 text-violet-300 border-violet/20"
                      : "bg-cyan/10 text-cyan-300 border-cyan/20"
                  }`}>
                    {product.drinkStyle === "author" ? "Autor" : "Clásico"}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base text-ivory capitalize mt-1 truncate">{product.name}</h3>
              {product.description && (
                <p className="text-xs text-white/45 mt-0.5 line-clamp-1">{product.description}</p>
              )}
            </div>
            {product.featured && <Star size={14} className="text-gold fill-gold flex-shrink-0 mt-1" />}
          </div>

          {/* Métricas en línea */}
          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            <div className="flex items-center gap-1">
              <DollarSign size={11} className="text-gold" />
              <span className="text-sm font-extrabold text-gold">{formatPrice(dynPrice)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={11} className={marginColor} />
              <span className={`text-xs font-bold ${marginColor}`}>{margin}%</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign size={11} className="text-white/30" />
              <span className="text-xs text-white/40">Costo: {formatPrice(cost)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} className="text-white/30" />
              <span className="text-xs text-white/40">{product.preparationTime ?? 5}m</span>
            </div>
          </div>

          {/* Flags extra */}
          <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px]">
            {product.hasRecipe && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Layers size={10} />
                Receta vinculada
              </span>
            )}
            {product.menuIds && product.menuIds.length > 0 && (
              <span className="flex items-center gap-1 text-violet-400">
                <Zap size={10} />
                {product.menuIds.length} menú{product.menuIds.length > 1 ? "s" : ""}
              </span>
            )}
            {Array.isArray(product.dietaryRestrictions) && product.dietaryRestrictions.length > 0 && (
              <span className="flex items-center gap-1 text-cyan-400">
                <Tag size={10} />
                {product.dietaryRestrictions.join(", ")}
              </span>
            )}
            {!statusOk && (
              <span className="text-red-400 font-semibold">No disponible</span>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {Array.isArray(product.tags) && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pb-3">
          {product.tags.slice(0, 5).map((tag, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-300/70 border border-violet/15">
              #{tag}
            </span>
          ))}
          {product.tags.length > 5 && (
            <span className="text-[9px] text-white/25">+{product.tags.length - 5}</span>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={() => openDrawer(product)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:text-ivory hover:border-white/20 transition-all"
        >
          <Eye size={12} />
          Detalles
        </button>
        <button
          onClick={() => onEdit(product)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet/10 border border-violet/20 text-xs font-bold text-violet-300 hover:bg-violet/20 transition-all"
        >
          <Pencil size={12} />
          Editar
        </button>
        <button
          onClick={() => onDelete(product._id!)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red/8 border border-red/15 text-xs font-bold text-red-400/70 hover:bg-red/15 hover:text-red-400 transition-all"
        >
          <Trash2 size={12} />
          Eliminar
        </button>
      </div>
    </motion.div>
  );
}
