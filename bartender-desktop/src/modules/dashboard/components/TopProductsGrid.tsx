/**
 * TopProductsGrid — Top bebidas y comidas en 2 columnas.
 * Usa datos reales de dashboardStats.topDrinks / topFoods.
 * Incluye barra de proporción relativa al #1.
 */
import { GlassWater, ChefHat, TrendingUp } from "lucide-react";
import type { TopProduct } from "../services/dashboardService";

interface Props {
  topDrinks: TopProduct[];
  topFoods:  TopProduct[];
  loading?:  boolean;
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {[0,1,2,3,4].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
          <div className="w-5 h-5 rounded-full bg-white/10 flex-shrink-0" />
          <div className="flex-1 h-3 rounded-full bg-white/10" />
          <div className="w-10 h-3 rounded-full bg-white/8" />
        </div>
      ))}
    </div>
  );
}

function ProductList({
  items,
  barColor,
  icon,
  label,
  loading,
}: {
  items:     TopProduct[];
  barColor:  string;
  icon:      React.ReactNode;
  label:     string;
  loading?:  boolean;
}) {
  const maxQty = items[0]?.qty ?? 1;

  return (
    <div className="rounded-2xl border border-white/8 bg-surface-3/50 p-5 flex flex-col gap-4 min-w-0">
      <div className="flex items-center gap-2.5">
        <span className={`p-2 rounded-xl ${barColor.replace("bg-", "bg-").replace(/\//g, "/").includes("gold") ? "bg-gold/15 text-gold" : "bg-emerald-500/15 text-emerald-400"}`}>
          {icon}
        </span>
        <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em]">{label}</h3>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-center">
          <div>
            <div className="text-muted/30 mb-2">{icon}</div>
            <p className="text-xs text-muted">Sin ventas en el período</p>
          </div>
        </div>
      ) : (
        <ol className="space-y-2.5">
          {items.slice(0, 5).map((p, i) => {
            const pct = Math.round((p.qty / maxQty) * 100);
            return (
              <li key={p.name} className="flex items-center gap-3 group">
                <span className={`text-[10px] font-black w-4 flex-shrink-0 ${
                  i === 0 ? "text-gold" : "text-muted/50"
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-ivory truncate">{p.name}</span>
                    <span className="text-[10px] font-bold text-muted flex-shrink-0">{p.qty}</span>
                  </div>
                  <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        barColor.includes("gold") ? "bg-gold" : "bg-emerald-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default function TopProductsGrid({ topDrinks, topFoods, loading = false }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ProductList
        items={topDrinks}
        barColor="bg-gold"
        icon={<GlassWater size={16} />}
        label="Top bebidas"
        loading={loading}
      />
      <ProductList
        items={topFoods}
        barColor="bg-emerald-400"
        icon={<ChefHat size={16} />}
        label="Top comidas"
        loading={loading}
      />
    </div>
  );
}
