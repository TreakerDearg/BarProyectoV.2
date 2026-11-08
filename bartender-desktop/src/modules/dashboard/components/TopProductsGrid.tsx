/**
 * TopProductsGrid — Top bebidas y comidas en 2 columnas.
 * Usa datos reales de dashboardStats.topDrinks / topFoods.
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import { GlassWater, ChefHat } from "lucide-react";
import type { TopProduct } from "../services/dashboardService";

interface Props {
  topDrinks: TopProduct[];
  topFoods: TopProduct[];
  loading?: boolean;
}

/* ── Skeleton ──────────────────────────────────────────────── */
function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 rounded-full bg-[#21283A] flex-shrink-0" />
          <div className="flex-1 h-3 rounded-full bg-[#21283A]" />
          <div className="w-8 h-3 rounded-full bg-[#21283A]" />
        </div>
      ))}
    </div>
  );
}

/* ── Product list ──────────────────────────────────────────── */
function ProductList({
  items = [], accentColor, iconBg, icon, label, loading,
}: {
  items: TopProduct[];
  accentColor: string;
  iconBg: string;
  icon: React.ReactNode;
  label: string;
  loading?: boolean;
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const maxQty = safeItems[0]?.qty ?? 1;

  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-6 flex flex-col gap-5 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</span>
        <h3 className="text-xs font-black text-[#566270] uppercase tracking-[0.18em]">{label}</h3>
      </div>

      {/* Contenido */}
      {loading ? (
        <ListSkeleton />
      ) : safeItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <div className="text-[#30363D]">{icon}</div>
          <p className="text-sm text-[#566270]">Sin ventas en el período</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {safeItems.slice(0, 5).map((p, i) => {
            const pct = Math.round((p.qty / maxQty) * 100);
            return (
              <li key={p.name} className="flex items-center gap-3 group">
                {/* Posición */}
                <span className={`text-xs font-black w-5 flex-shrink-0 text-center ${i === 0 ? accentColor : "text-[#566270]"
                  }`}>
                  {i + 1}
                </span>

                {/* Nombre + barra */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#E6EDF3] truncate">{p.name}</span>
                    <span className="text-xs font-bold text-[#8B949E] flex-shrink-0">{p.qty}</span>
                  </div>
                  {/* Barra de progreso */}
                  <div className="h-1.5 bg-[#21283A] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: i === 0
                          ? accentColor.includes("F0B429") ? "#F0B429" : "#3FB950"
                          : "rgba(255,255,255,0.2)",
                      }}
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

/* ── Grid ─────────────────────────────────────────────────── */
export default function TopProductsGrid({ topDrinks, topFoods, loading = false }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ProductList
        items={topDrinks}
        accentColor="text-[#F0B429]"
        iconBg="bg-[#F0B429]/15 text-[#F0B429]"
        icon={<GlassWater size={17} />}
        label="Top bebidas"
        loading={loading}
      />
      <ProductList
        items={topFoods}
        accentColor="text-[#3FB950]"
        iconBg="bg-[#3FB950]/15 text-[#3FB950]"
        icon={<ChefHat size={17} />}
        label="Top comidas"
        loading={loading}
      />
    </div>
  );
}
