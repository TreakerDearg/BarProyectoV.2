"use client";

import { LayoutDashboard, Loader2 } from "lucide-react";
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
          <div key={i} className="nebula-panel rounded-xl p-4 space-y-4">
            <div className="h-32 bg-surface-3 rounded-lg animate-pulse" />
            <div className="h-4 bg-surface-3 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-surface-3 rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <LayoutDashboard size={48} className="text-violet-300/40 mb-4" />
        <p className="text-muted text-sm">No se encontraron cartas</p>
      </div>
    );
  }

  return (
    <div>
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
                    className="w-5 h-5 rounded border-white/20 bg-surface-2 text-gold focus:ring-gold/50 cursor-pointer"
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

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-8">
          {loading ? (
            <div className="flex items-center gap-2 text-muted text-sm">
              <Loader2 size={16} className="animate-spin" />
              Cargando más cartas...
            </div>
          ) : (
            <div className="text-muted text-xs">Desplázate para cargar más</div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(MenusGrid);
