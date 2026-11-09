/**
 * ProductCard — Tres niveles de vista con paleta Slate Elegante v3.0.
 *
 * simple:    Miniatura 16:10 + nombre + precio + categoría + estado.
 * standard:  + descripción + margen + costo + preparación + tags.
 * advanced:  + fila horizontal estilo lista con métricas completas y receta.
 */

import {
  Pencil, Trash2, Eye, Star, CheckCircle, XCircle,
  Martini, UtensilsCrossed, Clock, Layers, Tag, Zap,
  TrendingUp, DollarSign, Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "../../../types/product";
import { useProductUiStore } from "../store/productUiStore";

// ── Tipos ─────────────────────────────────────────────────────────

export type ViewLevel = "simple" | "standard" | "advanced";

interface Props {
  product: Product;
  view?: ViewLevel;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────

function formatPrice(n: number): string {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

function TypeIcon({ type, size = 18 }: { type: string; size?: number }) {
  return type === "drink"
    ? <Martini size={size} />
    : <UtensilsCrossed size={size} />;
}

// ── Componente ────────────────────────────────────────────────────

export default function ProductCard({ product, view = "standard", onEdit, onDelete }: Props) {
  const { openDrawer } = useProductUiStore();

  const isDrink = product.type === "drink";
  const price = product.price ?? 0;
  const dynPrice = (product.dynamicPrice ?? price) as number;
  const cost = product.cost ?? 0;
  const margin = dynPrice > 0 ? Math.round(((dynPrice - cost) / dynPrice) * 100) : 0;
  const marginColor = margin >= 45 ? "text-[#3FB950]" : margin >= 25 ? "text-[#F0B429]" : "text-[#FF7B54]";
  const statusOk = product.available;

  // ── VISTA SIMPLE ─────────────────────────────────────────────────
  if (view === "simple") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="group relative rounded-xl overflow-hidden border border-[#30363D] bg-[#161B22] hover:border-[rgba(240,180,41,0.40)] transition-all duration-200 cursor-pointer shadow-sm flex flex-col"
        onClick={() => openDrawer(product)}
      >
        {/* Imagen */}
        <div className="relative aspect-[16/10] bg-[#090E14] overflow-hidden shrink-0">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1C2333]">
              <span className={isDrink ? "text-[#F0B429]/60" : "text-[#3FB950]/60"}>
                <TypeIcon type={product.type} size={30} />
              </span>
            </div>
          )}

          {/* Estado de disponibilidad */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${statusOk ? "bg-[#3FB950]" : "bg-[#F85149]"} ring-2 ring-[#0D1117]`}
              title={statusOk ? "Disponible" : "No disponible"}
            />
          </div>

          {/* Featured */}
          {product.featured && (
            <div className="absolute top-2 left-2 p-1 rounded-md bg-[#161B22]/90 border border-[rgba(240,180,41,0.40)] shadow-sm">
              <Star size={12} className="text-[#F0B429] fill-[#F0B429]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider truncate mb-0.5">
              {product.category || "General"}
            </p>
            <h3 className="text-xs font-bold text-[#E6EDF3] capitalize truncate" title={product.name}>
              {product.name}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#30363D]/60">
            <p className="text-sm font-black text-[#F0B429]">{formatPrice(dynPrice)}</p>
            <span className={`text-xs font-bold ${marginColor}`}>{margin}%</span>
          </div>
        </div>

        {/* Acciones flotantes en hover */}
        <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1.5 bg-gradient-to-t from-[#0D1117] via-[#0D1117]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="flex-1 py-1.5 rounded-lg bg-[#21283A] border border-[#30363D] hover:border-[rgba(240,180,41,0.50)] text-xs font-bold text-[#E6EDF3] transition-colors"
          >
            Editar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product._id!); }}
            className="p-1.5 rounded-lg bg-[rgba(248,81,73,0.12)] border border-[rgba(248,81,73,0.30)] text-[#F85149] hover:bg-[rgba(248,81,73,0.22)] transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ── VISTA STANDARD ────────────────────────────────────────────────
  if (view === "standard") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="group relative rounded-xl overflow-hidden border border-[#30363D] bg-[#161B22] hover:border-[#3D444D] transition-all duration-200 flex flex-col shadow-sm"
      >
        {/* Imagen */}
        <div className="relative aspect-[16/9] bg-[#090E14] overflow-hidden shrink-0">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1C2333]">
              <span className={isDrink ? "text-[#F0B429]/50" : "text-[#3FB950]/50"}>
                <TypeIcon type={product.type} size={36} />
              </span>
            </div>
          )}

          {/* Badges superiores */}
          <div className="absolute inset-x-0 top-0 p-2.5 flex items-start justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-md ${isDrink
              ? "bg-[rgba(240,180,41,0.15)] text-[#F0B429] border-[rgba(240,180,41,0.30)]"
              : "bg-[rgba(63,185,80,0.15)] text-[#3FB950] border-[rgba(63,185,80,0.30)]"
              }`}>
              {isDrink ? "Bebida" : "Comida"}
            </span>
            <div className="flex items-center gap-1.5">
              {product.featured && (
                <div className="p-1 rounded-md bg-[#161B22]/90 border border-[rgba(240,180,41,0.40)]">
                  <Star size={13} className="text-[#F0B429] fill-[#F0B429]" />
                </div>
              )}
              <div className={`p-1 rounded-md border ${statusOk
                ? "bg-[rgba(63,185,80,0.15)] border-[rgba(63,185,80,0.30)] text-[#3FB950]"
                : "bg-[rgba(248,81,73,0.15)] border-[rgba(248,81,73,0.30)] text-[#F85149]"
                }`}>
                {statusOk ? <CheckCircle size={13} /> : <XCircle size={13} />}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider truncate">{product.category || "General"}</p>
              {((product as any).variantsCount || (product as any).variants?.length) ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(240,180,41,0.12)] text-[#F0B429] border border-[rgba(240,180,41,0.25)]">
                  <Sparkles size={10} /> {(product as any).variantsCount || (product as any).variants?.length} Variantes
                </span>
              ) : null}
            </div>
            <h3 className="font-bold text-sm text-[#E6EDF3] capitalize leading-snug mt-0.5 truncate">{product.name}</h3>
            {product.description && (
              <p className="text-xs text-[#8B949E] mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Métricas clave */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#1C2333] rounded-lg p-2 text-center border border-[#30363D]">
              <p className="text-xs font-semibold text-[#8B949E] uppercase mb-0.5">Precio</p>
              <p className="text-xs font-black text-[#F0B429]">{formatPrice(dynPrice)}</p>
            </div>
            <div className="bg-[#1C2333] rounded-lg p-2 text-center border border-[#30363D]">
              <p className="text-xs font-semibold text-[#8B949E] uppercase mb-0.5">Margen</p>
              <p className={`text-xs font-black ${marginColor}`}>{margin}%</p>
            </div>
            <div className="bg-[#1C2333] rounded-lg p-2 text-center border border-[#30363D]">
              <p className="text-xs font-semibold text-[#8B949E] uppercase mb-0.5">Prep</p>
              <p className="text-xs font-bold text-[#E6EDF3]">{product.preparationTime ?? 5}m</p>
            </div>
          </div>

          {/* Tags */}
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-[#21283A] text-[#8B949E] border border-[#30363D]">
                  #{tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-xs text-[#8B949E]/60 self-center">+{product.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 p-3 pt-0">
          <button
            onClick={() => openDrawer(product)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C2333] border border-[#30363D] text-xs font-bold text-[#E6EDF3] hover:bg-[#21283A] hover:border-[#3D444D] transition-colors"
          >
            <Eye size={13} />
            Ver
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(240,180,41,0.12)] border border-[rgba(240,180,41,0.30)] text-xs font-bold text-[#F0B429] hover:bg-[rgba(240,180,41,0.20)] transition-colors"
          >
            <Pencil size={13} />
            Editar
          </button>
          <button
            onClick={() => onDelete(product._id!)}
            className="p-2 rounded-lg bg-[rgba(248,81,73,0.10)] border border-[rgba(248,81,73,0.25)] text-[#F85149] hover:bg-[rgba(248,81,73,0.20)] transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ── VISTA ADVANCED (Lista) ────────────────────────────────────────
  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="group relative rounded-xl border border-[#30363D] bg-[#161B22] hover:border-[#3D444D] transition-all duration-200 shadow-sm"
    >
      <div className="flex gap-4 p-3.5 items-center">
        {/* Imagen cuadrada */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[#090E14] border border-[#30363D]">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className={isDrink ? "text-[#F0B429]/50" : "text-[#3FB950]/50"}>
                <TypeIcon type={product.type} size={24} />
              </span>
            </div>
          )}
          {!statusOk && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <XCircle size={18} className="text-[#F85149]" />
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${isDrink
                  ? "bg-[rgba(240,180,41,0.12)] text-[#F0B429] border-[rgba(240,180,41,0.30)]"
                  : "bg-[rgba(63,185,80,0.12)] text-[#3FB950] border-[rgba(63,185,80,0.30)]"
                  }`}>
                  {product.category || "General"}
                </span>
                {product.drinkStyle && product.type === "drink" && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#21283A] text-[#8B949E] border border-[#30363D]">
                    {product.drinkStyle === "author" ? "Autor" : "Clásico"}
                  </span>
                )}
                {((product as any).variantsCount || (product as any).variants?.length) ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[rgba(240,180,41,0.12)] text-[#F0B429] border border-[rgba(240,180,41,0.25)] flex items-center gap-1">
                    <Sparkles size={11} /> {(product as any).variantsCount || (product as any).variants?.length} Variantes
                  </span>
                ) : null}
              </div>
              <h3 className="font-bold text-sm text-[#E6EDF3] capitalize mt-1 truncate">{product.name}</h3>
              {product.description && (
                <p className="text-xs text-[#8B949E] mt-0.5 line-clamp-1">{product.description}</p>
              )}
            </div>
            {product.featured && <Star size={15} className="text-[#F0B429] fill-[#F0B429] shrink-0 mt-1" />}
          </div>

          {/* Métricas en línea */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-1">
              <DollarSign size={13} className="text-[#F0B429]" />
              <span className="text-sm font-black text-[#F0B429]">{formatPrice(dynPrice)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={13} className={marginColor} />
              <span className={`text-xs font-bold ${marginColor}`}>{margin}%</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign size={13} className="text-[#8B949E]" />
              <span className="text-xs text-[#8B949E]">Costo: {formatPrice(cost)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-[#8B949E]" />
              <span className="text-xs text-[#8B949E]">{product.preparationTime ?? 5}m</span>
            </div>

            {product.hasRecipe && (
              <span className="flex items-center gap-1 text-xs font-semibold text-[#3FB950]">
                <Layers size={12} />
                Receta
              </span>
            )}
            {!statusOk && (
              <span className="text-xs font-semibold text-[#F85149]">Agotado</span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-[#30363D]">
          <button
            onClick={() => openDrawer(product)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1C2333] border border-[#30363D] text-xs font-bold text-[#E6EDF3] hover:bg-[#21283A] transition-colors"
          >
            <Eye size={13} />
            Ver
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[rgba(240,180,41,0.12)] border border-[rgba(240,180,41,0.30)] text-xs font-bold text-[#F0B429] hover:bg-[rgba(240,180,41,0.20)] transition-colors"
          >
            <Pencil size={13} />
            Editar
          </button>
          <button
            onClick={() => onDelete(product._id!)}
            className="p-1.5 rounded-lg bg-[rgba(248,81,73,0.10)] border border-[rgba(248,81,73,0.25)] text-[#F85149] hover:bg-[rgba(248,81,73,0.20)] transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
