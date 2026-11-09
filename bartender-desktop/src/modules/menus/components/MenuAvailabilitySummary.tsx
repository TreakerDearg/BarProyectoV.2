"use client";

import { CheckCircle, AlertTriangle, Layers, FileText, TrendingUp, Box } from "lucide-react";
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

  const availabilityPercentage = totalProducts > 0 ? (availableProducts / totalProducts) * 100 : 0;
  const recipePercentage = totalProducts > 0 ? (productsWithRecipe / totalProducts) * 100 : 0;

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3.5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2.5 border-b border-[#30363D]">
        <div className="p-1.5 bg-[rgba(240,180,41,0.12)] text-[#F0B429] rounded-lg">
          <TrendingUp size={15} />
        </div>
        <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">
          Salud Operativa de la Carta
        </h3>
      </div>

      {/* Tarjetas Principales */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-lg border border-[rgba(63,185,80,0.30)] bg-[rgba(63,185,80,0.10)]">
          <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-[#3FB950]">
            <CheckCircle size={13} />
            <span>Disponibilidad</span>
          </div>
          <p className="text-xl font-black text-[#3FB950]">
            {(availabilityPercentage ?? 0).toFixed(0)}%
          </p>
          <p className="text-xs text-[#8B949E] mt-0.5">
            {availableProducts} de {totalProducts} activos
          </p>
        </div>

        <div className="p-3 rounded-lg border border-[rgba(56,139,253,0.30)] bg-[rgba(56,139,253,0.10)]">
          <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-[#388BFD]">
            <FileText size={13} />
            <span>Con Receta</span>
          </div>
          <p className="text-xl font-black text-[#388BFD]">
            {(recipePercentage ?? 0).toFixed(0)}%
          </p>
          <p className="text-xs text-[#8B949E] mt-0.5">
            {productsWithRecipe} de {totalProducts} con stock
          </p>
        </div>
      </div>

      {/* Desglose Rápido */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1C2333] border border-[#30363D]">
          <div className="flex items-center gap-2 text-[#8B949E]">
            <Layers size={13} className="text-[#F0B429]" />
            <span>Categorías activas</span>
          </div>
          <span className="font-bold text-[#E6EDF3]">{menu.categories?.length || 0}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1C2333] border border-[#30363D]">
          <div className="flex items-center gap-2 text-[#8B949E]">
            <Box size={13} className="text-[#3FB950]" />
            <span>Total productos listados</span>
          </div>
          <span className="font-bold text-[#E6EDF3]">{totalProducts}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1C2333] border border-[#30363D]">
          <div className="flex items-center gap-2 text-[#8B949E]">
            <CheckCircle size={13} className="text-[#3FB950]" />
            <span>Disponibles en barra/cocina</span>
          </div>
          <span className="font-bold text-[#3FB950]">{availableProducts}</span>
        </div>
      </div>
    </div>
  );
}
