"use client";

import { useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import type { Menu } from "../../../types/menu";

interface Props {
  menus: Menu[];
}

export default function MenuAdvancedPanel({ menus }: Props) {
  const analytics = useMemo(() => {
    const totalProducts = menus.reduce(
      (sum: number, menu) =>
        sum +
        (menu.categories?.reduce((acc: number, cat: any) => acc + (cat.products?.length || 0), 0) || 0),
      0
    );

    const activeMenus = menus.filter((m) => m.active).length;

    return {
      totalProducts,
      activeMenus,
    };
  }, [menus]);

  if (menus.length === 0) return null;

  return (
    <div className="nebula-discounts-panel p-6 rounded-3xl border border-white/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300">
          <LayoutDashboard size={20} />
        </div>
        <h3 className="text-lg font-bold text-ivory">Resumen de Cartas</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-2xl bg-surface-3/50">
          <p className="text-xs text-muted mb-1">Total</p>
          <p className="text-2xl font-black text-ivory">{menus.length}</p>
        </div>
        <div className="text-center p-4 rounded-2xl bg-surface-3/50">
          <p className="text-xs text-muted mb-1">Activos</p>
          <p className="text-2xl font-black text-emerald-400">{analytics.activeMenus}</p>
        </div>
        <div className="text-center p-4 rounded-2xl bg-surface-3/50">
          <p className="text-xs text-muted mb-1">Productos</p>
          <p className="text-2xl font-black text-ivory">{analytics.totalProducts}</p>
        </div>
      </div>
    </div>
  );
}