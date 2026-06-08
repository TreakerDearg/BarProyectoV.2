"use client";

import { ArrowLeft, Share2, Clock, Star, Eye, Martini, Utensils, Layers } from "lucide-react";
import type { MenuPublic } from "../../../../types/menu";

interface Props {
  menu: MenuPublic;
  onBack: () => void;
}

export default function PublicMenuDetail({ menu, onBack }: Props) {
  const totalProducts = menu.categories?.reduce((acc, cat) => acc + (cat.products?.length || 0), 0) || 0;

  // Get type icon
  const getTypeIcon = () => {
    switch (menu.type) {
      case 'drink':
        return <Martini size={16} className="text-cyan-400" />;
      case 'food':
        return <Utensils size={16} className="text-gold" />;
      case 'mixed':
      default:
        return <Layers size={16} className="text-violet-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-surface-3 border border-white/10 text-muted hover:text-ivory transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-ivory tracking-tight uppercase">
          {menu.name}
        </h1>
        <div className="flex-1" />
        <button className="p-2 rounded-xl bg-surface-3 border border-white/10 text-muted hover:text-ivory transition-colors">
          <Share2 size={20} />
        </button>
      </div>

      {/* Hero Section */}
      {menu.image && (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-surface-3">
          <img
            src={menu.image}
            alt={menu.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                {getTypeIcon()}
                <span className="text-xs font-semibold text-white uppercase">{menu.type || 'mixed'}</span>
              </div>
              {menu.featured && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gold/10 backdrop-blur-sm border border-gold/30">
                  <Star size={12} className="text-gold-400" />
                  <span className="text-[10px] font-semibold text-gold-300 uppercase tracking-wider">Destacado</span>
                </div>
              )}
            </div>
            {menu.description && (
              <p className="text-sm text-white/90">{menu.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Info Bar */}
      <div className="flex items-center gap-6 p-4 bg-surface-3 border border-white/10 rounded-xl">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted" />
          <span className="text-xs text-muted">Actualizado recientemente</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-cyan-400" />
          <span className="text-xs text-muted">Público</span>
        </div>
        <div className="flex-1" />
        <div className="text-xs font-semibold text-muted">
          {totalProducts} productos
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {menu.categories?.map((category, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-lg font-black text-ivory tracking-tight uppercase">
              {category.name}
            </h2>
            {category.description && (
              <p className="text-sm text-muted/80">{category.description}</p>
            )}
            <div className="space-y-2">
              {category.products?.map((product, pIdx) => (
                <div
                  key={pIdx}
                  className="flex items-center justify-between p-3 bg-surface-3 border border-white/5 rounded-xl"
                >
                  <span className="text-sm text-ivory">{product.product}</span>
                  {product.price && (
                    <span className="text-sm font-semibold text-gold">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tags */}
      {menu.tags && menu.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Etiquetas</h3>
          <div className="flex flex-wrap gap-2">
            {menu.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-violet/10 border border-violet/30 text-violet-300 text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
