"use client";

import { useMemo } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Utensils,
  Martini,
} from "lucide-react";
import type { Menu } from "../../../types/menu";

interface Props {
  menus: Menu[];
}

export default function MenuAdvancedPanel({ menus }: Props) {
  const analytics = useMemo(() => {
    // Calculate type distribution
    const typeDistribution = menus.reduce((acc, menu) => {
      const type = menu.type || "mixed";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total products across all menus
    const totalProducts = menus.reduce(
      (sum: number, menu) =>
        sum +
        (menu.categories?.reduce((acc: number, cat: any) => acc + (cat.products?.length || 0), 0) || 0),
      0
    );

    // Calculate average products per menu
    const avgProductsPerMenu =
      menus.length > 0 ? (totalProducts / menus.length).toFixed(1) : 0;

    // Calculate active vs inactive
    const activeMenus = menus.filter((m) => m.active).length;
    const inactiveMenus = menus.length - activeMenus;

    // Find menu with most products
    const menuWithMostProducts = menus.reduce((max: Menu, menu: Menu) => {
      const productCount =
        menu.categories?.reduce((acc: number, cat: any) => acc + (cat.products?.length || 0), 0) || 0;
      const maxCount =
        max.categories?.reduce((acc: number, cat: any) => acc + (cat.products?.length || 0), 0) || 0;
      return productCount > maxCount ? menu : max;
    }, menus[0]);

    return {
      typeDistribution,
      totalProducts,
      avgProductsPerMenu,
      activeMenus,
      inactiveMenus,
      menuWithMostProducts,
    };
  }, [menus]);

  if (menus.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Menu Overview */}
      <div className="nebula-panel rounded-3xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300">
            <LayoutDashboard size={20} />
          </div>
          <h3 className="text-lg font-bold text-ivory">Resumen de Cartas</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-2xl bg-surface-3/50">
            <p className="text-xs text-muted mb-1">Total Menús</p>
            <p className="text-2xl font-black text-ivory">{menus.length}</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-surface-3/50">
            <p className="text-xs text-muted mb-1">Activos</p>
            <p className="text-2xl font-black text-emerald-400">
              {analytics.activeMenus}
            </p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-surface-3/50">
            <p className="text-xs text-muted mb-1">Inactivos</p>
            <p className="text-2xl font-black text-muted">
              {analytics.inactiveMenus}
            </p>
          </div>
        </div>
      </div>

      {/* Type Distribution */}
      <div className="nebula-panel rounded-3xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gold/20 text-gold">
            <BarChart3 size={20} />
          </div>
          <h3 className="text-lg font-bold text-ivory">Distribución por Tipo</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(analytics.typeDistribution).map(([type, count]: [string, number]) => (
            <div key={type} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted capitalize">{type}</span>
                  <span className="text-sm font-bold text-ivory">{count}</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-gold/60 rounded-full"
                    style={{
                      width: `${(count / menus.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu with Most Products */}
      {analytics.menuWithMostProducts && (
        <div className="nebula-panel rounded-3xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Utensils size={20} />
            </div>
            <h3 className="text-lg font-bold text-ivory">Carta con Más Items</h3>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-3/50 border border-white/5">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Martini size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ivory">
                {analytics.menuWithMostProducts.name}
              </p>
              <p className="text-xs text-muted capitalize">
                {analytics.menuWithMostProducts.type}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-400">
                {analytics.menuWithMostProducts.categories?.reduce(
                  (acc: number, cat: any) => acc + (cat.products?.length || 0),
                  0
                )}
              </p>
              <p className="text-xs text-muted">Productos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}