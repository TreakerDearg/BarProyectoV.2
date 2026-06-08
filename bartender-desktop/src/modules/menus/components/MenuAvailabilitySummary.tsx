"use client";

import { CheckCircle, AlertTriangle, Layers, FileText, TrendingUp } from "lucide-react";
import type { Menu } from "../../../types/menu";

interface Props {
  menu: Menu;
}

export default function MenuAvailabilitySummary({ menu }: Props) {
  const totalProducts = menu.categories?.reduce((sum, cat) => sum + cat.products.length, 0) || 0;
  const availableProducts = menu.categories?.reduce(
    (sum, cat) => sum + cat.products.filter(p => p.available).length,
    0
  ) || 0;
  const productsWithRecipe = menu.categories?.reduce(
    (sum, cat) => sum + cat.products.filter(p => p.hasRecipe).length,
    0
  ) || 0;
  const productsWithMissingIngredients = menu.categories?.reduce(
    (sum, cat) => sum + cat.products.filter(p => p.missingIngredients && p.missingIngredients.length > 0).length,
    0
  ) || 0;

  const availabilityPercentage = totalProducts > 0 ? (availableProducts / totalProducts) * 100 : 0;
  const recipePercentage = totalProducts > 0 ? (productsWithRecipe / totalProducts) * 100 : 0;

  const statusColor = availabilityPercentage === 100 ? "emerald" : availabilityPercentage >= 50 ? "gold" : "red";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp size={14} className="text-rose-400" />
        <h3 className="text-sm font-black text-ivory uppercase tracking-widest">Resumen de Disponibilidad</h3>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-4 rounded-xl border bg-${statusColor}/10 border-${statusColor}/30`}>
          <div className="flex items-center gap-2 mb-2">
            {availabilityPercentage === 100 ? (
              <CheckCircle size={14} className={`text-${statusColor}-400`} />
            ) : (
              <AlertTriangle size={14} className={`text-${statusColor}-400`} />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">
              Disponibilidad
            </span>
          </div>
          <p className={`text-2xl font-black text-${statusColor}-400`}>
            {(availabilityPercentage ?? 0).toFixed(0)}%
          </p>
          <p className="text-[10px] text-muted mt-1">
            {availableProducts} de {totalProducts} productos
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-violet/10 border-violet/30">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="text-violet-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">
              Con Receta
            </span>
          </div>
          <p className="text-2xl font-black text-violet-400">
            {(recipePercentage ?? 0).toFixed(0)}%
          </p>
          <p className="text-[10px] text-muted mt-1">
            {productsWithRecipe} de {totalProducts} productos
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2">
            <Layers size={12} className="text-rose-400" />
            <span className="text-[10px] font-semibold text-muted">Categorías</span>
          </div>
          <span className="text-[10px] font-black text-ivory">{menu.categories?.length || 0}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2">
            <FileText size={12} className="text-gold" />
            <span className="text-[10px] font-semibold text-muted">Total Productos</span>
          </div>
          <span className="text-[10px] font-black text-ivory">{totalProducts}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2">
            <CheckCircle size={12} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-muted">Disponibles</span>
          </div>
          <span className="text-[10px] font-black text-emerald-400">{availableProducts}</span>
        </div>

        {productsWithMissingIngredients > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-red/5 border border-red/10">
            <div className="flex items-center gap-2">
              <AlertTriangle size={12} className="text-red-400" />
              <span className="text-[10px] font-semibold text-red-300">Faltan Ingredientes</span>
            </div>
            <span className="text-[10px] font-black text-red-400">{productsWithMissingIngredients}</span>
          </div>
        )}
      </div>

      {/* Status Message */}
      {availabilityPercentage === 100 ? (
        <div className="p-3 rounded-xl bg-emerald/10 border border-emerald/30 flex items-center gap-2">
          <CheckCircle size={14} className="text-emerald-400" />
          <span className="text-[10px] font-semibold text-emerald-300">
            Todos los productos están disponibles
          </span>
        </div>
      ) : availabilityPercentage >= 50 ? (
        <div className="p-3 rounded-xl bg-gold/10 border border-gold/30 flex items-center gap-2">
          <AlertTriangle size={14} className="text-gold-400" />
          <span className="text-[10px] font-semibold text-gold-300">
            Algunos productos no están disponibles
          </span>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-red/10 border border-red/30 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400" />
          <span className="text-[10px] font-semibold text-red-300">
            La mayoría de productos no están disponibles
          </span>
        </div>
      )}
    </div>
  );
}
