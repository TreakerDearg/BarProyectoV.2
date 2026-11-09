"use client";

import { LayoutDashboard, Loader2, Layers } from "lucide-react";
import { useEffect, useRef, memo } from "react";
import MenuCard from "./MenuCard";
import type { Menu } from "../../../types/menu";

interface Props {
  menus: Menu[];
  loading: boolean;
  view: 'grid' | 'list';
  selectedMenus: Set<string>;
  onToggleSelection: (menuId: string) => void;
  onEdit: (menu: Menu) => void;
  onDelete: (menuId: string) => void;
  simplified: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

function MenusGrid({
  menus,
  loading,
  view,
  selectedMenus,
  onToggleSelection,
  onEdit,
  onDelete,
  simplified,
  onLoadMore,
  hasMore = false,
}: Props) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onLoadMore, hasMore]);

  if (loading && menus.length === 0) {
    return (
      <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3.5">
            <div className="aspect-[16/10] bg-[#1C2333] rounded-lg animate-pulse" />
            <div className="h-4 bg-[#1C2333] rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-[#1C2333] rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <div className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D]">
          <Layers size={36} className="text-[#8B949E]" />
        </div>
        <p className="text-sm font-semibold text-[#E6EDF3]">No se encontraron cartas registradas</p>
        <p className="text-xs text-[#8B949E] max-w-sm">
          Crea una nueva carta desde cero o utiliza una de las plantillas preconfiguradas para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {menus.map((menu) => {
          const menuId = menu._id || '';
          const isSelected = selectedMenus.has(menuId);
          return (
            <div key={menuId} className="relative">
              {selectedMenus.size > 0 && (
                <div className="absolute top-3 left-3 z-20">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(menuId)}
                    className="w-4 h-4 rounded border-[#30363D] bg-[#1C2333] accent-[#F0B429] cursor-pointer"
                  />
                </div>
              )}
              <MenuCard
                menu={menu}
                onEdit={() => onEdit(menu)}
                onDelete={() => onDelete(menuId)}
                simplified={simplified}
              />
            </div>
          );
        })}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-6">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-[#8B949E]">
              <Loader2 size={15} className="animate-spin text-[#F0B429]" />
              Cargando más cartas...
            </div>
          ) : (
            <div className="text-xs text-[#8B949E]">Desplázate para ver más</div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(MenusGrid);
