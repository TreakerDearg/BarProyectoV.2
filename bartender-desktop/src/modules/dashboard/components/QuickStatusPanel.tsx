/**
 * QuickStatusPanel — Estado del servicio + alertas críticas.
 * Visible en modo Basic. Compacto, sin información secundaria.
 */
import { ChefHat, GlassWater, ShieldAlert, CheckCircle2, AlertTriangle, X } from "lucide-react";
import type { DashboardStats } from "../services/dashboardService";
import { useDashboardStore } from "../store/dashboardStore";

interface Props {
  data:    DashboardStats;
  loading?: boolean;
}

function LoadBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 bg-black/30 rounded-full overflow-hidden w-full">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function statusFromLoad(load: number): { label: string; color: string; bar: string } {
  if (load > 80) return { label: "Crítico",  color: "text-red-400",     bar: "bg-red-400"     };
  if (load > 50) return { label: "Ocupado",  color: "text-amber-400",   bar: "bg-amber-400"   };
  return             { label: "Normal",   color: "text-emerald-400", bar: "bg-emerald-400" };
}

export default function QuickStatusPanel({ data, loading = false }: Props) {
  const alerts    = useDashboardStore((s) => s.alerts);
  const dismiss   = useDashboardStore((s) => s.dismissAlert);

  const kitchenLoad = data.kitchenLoad ?? 0;
  const barLoad     = data.barLoad     ?? 0;
  const lowStock    = data.inventory?.lowStock  ?? 0;
  const outOfStock  = data.inventory?.outOfStock ?? 0;

  const kitchen = statusFromLoad(kitchenLoad);
  const bar     = statusFromLoad(barLoad);

  const criticalAlerts = alerts.filter((a) => a.severity === "high");

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/8 bg-surface-3/40 p-5 animate-pulse space-y-4">
        <div className="h-4 w-32 rounded-full bg-white/10" />
        <div className="h-3 w-full rounded-full bg-white/8" />
        <div className="h-3 w-3/4 rounded-full bg-white/8" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-surface-3/50 p-5 space-y-5">
      <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em]">Estado del servicio</h3>

      {/* Cocina + Barra */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Cocina", icon: <ChefHat size={15} />, load: kitchenLoad, s: kitchen },
          { label: "Barra",  icon: <GlassWater size={15} />, load: barLoad,    s: bar     },
        ].map(({ label, icon, load, s }) => (
          <div key={label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-text-dim">
                {icon} {label}
              </span>
              <span className={`text-xs font-bold ${s.color}`}>{s.label}</span>
            </div>
            <LoadBar pct={load} color={s.bar} />
            <p className="text-[10px] text-muted/60">{load}% de carga</p>
          </div>
        ))}
      </div>

      {/* Inventario crítico */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
        outOfStock > 0 ? "bg-red-500/8 border-red-500/20" :
        lowStock   > 0 ? "bg-amber-500/8 border-amber-500/20" :
                         "bg-emerald-500/8 border-emerald-500/20"
      }`}>
        <div className="flex items-center gap-2.5">
          {outOfStock > 0 || lowStock > 0
            ? <AlertTriangle size={15} className={outOfStock > 0 ? "text-red-400" : "text-amber-400"} />
            : <CheckCircle2 size={15} className="text-emerald-400" />
          }
          <span className="text-xs font-semibold text-text-dim">Inventario</span>
        </div>
        <span className={`text-xs font-bold ${
          outOfStock > 0 ? "text-red-400" :
          lowStock   > 0 ? "text-amber-400" :
                           "text-emerald-400"
        }`}>
          {outOfStock > 0 ? `${outOfStock} sin stock` :
           lowStock   > 0 ? `${lowStock} por agotarse` :
                            "Estable"}
        </span>
      </div>

      {/* Alertas críticas activas */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-2">
          {criticalAlerts.slice(0, 3).map((a) => (
            <div key={a.id}
              className="flex items-start gap-2.5 px-3 py-2 rounded-xl bg-red-500/8 border border-red-500/20"
            >
              <ShieldAlert size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300 flex-1 leading-relaxed">{a.message}</p>
              <button
                type="button"
                onClick={() => dismiss(a.id)}
                className="text-red-400/50 hover:text-red-300 transition-colors flex-shrink-0"
                aria-label="Descartar alerta"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
