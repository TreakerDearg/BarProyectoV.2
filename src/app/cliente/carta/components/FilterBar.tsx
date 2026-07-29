"use client";

import { Filter } from "../page";
import { UtensilsCrossed, Wine, Glasses } from "lucide-react";
import clsx from "clsx";
import ui from "../../cliente-ui.module.css";
import type { PublicMenu } from "@/lib/types/api";

interface Props {
  filter: Filter;
  setFilter: (f: Filter) => void;
  menus: PublicMenu[];
}

// Icon mapping para categorías
function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase();
  if (name.includes("bebida") || name.includes("trago") || name.includes("cocktail")) {
    return Wine;
  }
  if (name.includes("comida") || name.includes("plato") || name.includes("entrada")) {
    return UtensilsCrossed;
  }
  return Glasses;
}

// Generar filtros dinámicos desde categorías del backend
function generateDynamicFilters(menus: PublicMenu[]) {
  // Extraer todas las categorías únicas de todos los menús
  const categoryMap = new Map<string, { count: number; name: string }>();
  
  menus.forEach(menu => {
    menu.categories?.forEach(cat => {
      const existing = categoryMap.get(cat.name);
      const productCount = cat.products?.filter(p => p.product?.available !== false).length || 0;
      
      if (existing) {
        existing.count += productCount;
      } else {
        categoryMap.set(cat.name, { count: productCount, name: cat.name });
      }
    });
  });

  // Convertir a array y ordenar por cantidad de productos
  const sortedCategories = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      value: name.toLowerCase() as Filter,
      label: name,
      icon: getCategoryIcon(name),
      count: data.count
    }))
    .sort((a, b) => b.count - a.count);

  // Siempre incluir "Todo" al principio
  return [
    { value: "all" as Filter, label: "Todo", icon: Glasses, count: 0 },
    ...sortedCategories
  ];
}

export default function FilterBar({ filter, setFilter, menus }: Props) {
  const filters = generateDynamicFilters(menus);

  return (
    <div className={ui.filterBarContainer}>
      <div className={ui.filterBarContent}>
        <div className={ui.filterBarOptions}>
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={clsx(ui.filterBarBtn, isActive && ui.filterBarBtnActive)}
              >
                <Icon className={ui.filterBarIcon} />
                <span>{f.label}</span>
                {f.count > 0 && f.value !== "all" && (
                  <span className={ui.filterBarCount}>{f.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}