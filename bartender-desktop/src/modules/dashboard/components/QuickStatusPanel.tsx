/**
 * QuickStatusPanel — Estado del servicio + alertas críticas.
 * Visible en modo Simple. Compacto y directo.
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import { ChefHat, GlassWater, ShieldAlert, CheckCircle2, AlertTriangle, X } from "lucide-react";
import type { DashboardStats } from "../services/dashboardService";
import { useDashboardStore }   from "../store/dashboardStore";

interface Props {
  data:     DashboardStats;
  loading?: boolean;
}

/* ── Barra de carga ────────────────────────────────────────── */
function LoadBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 bg-[#21283A] rounded-full overflow-hidden w-full">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  );
}

function statusFromLoad(load: number) {
  if (load > 80) return { label: "Crítico",  color: "#F85149", bar: "#F85149" };
  if (load > 50) return { label: "Ocupado",  color: "#FF7B54", bar: "#FF7B54" };
  return             { label: "Normal",   color: "#3FB950", bar: "#3FB950" };
}

export default function QuickStatusPanel({ data, loading = false }: Props) {
  const alerts  = useDashboardStore((s) => s.alerts);
  const dismiss = useDashboardStore((s) => s.dismissAlert);

  const kitchenLoad = data.kitchenLoad ?? 0;
  const barLoad     = data.barLoad     ?? 0;
  const lowStock    = data.inventory?.lowStock  ?? 0;
  const outOfStock  = data.inventory?.outOfStock ?? 0;

  const kitchen = statusFromLoad(kitchenLoad);
  const bar     = statusFromLoad(barLoad);

  const criticalAlerts = alerts.filter((a) => a.severity === "high");

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-6 animate-pulse space-y-4">
        <div className="h-4 w-32 rounded-full bg-[#21283A]" />
        <div className="h-3 w-full rounded-full bg-[#21283A]" />
        <div className="h-3 w-3/4 rounded-full bg-[#21283A]" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-6 space-y-5">
      <h3 className="text-xs font-black text-[#566270] uppercase tracking-[0.18em]">
        Estado del servicio
      </h3>

      {/* Cocina + Barra */}
      <div className="grid grid-cols-2 gap-5">
        {[
          { label: "Cocina", icon: <ChefHat size={15} />, load: kitchenLoad, s: kitchen },
          { label: "Barra",  icon: <GlassWater size={15} />, load: barLoad,  s: bar     },
        ].map(({ label, icon, load, s }) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[#8B949E]">
                {icon} {label}
              </span>
              <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
            </div>
            <LoadBar pct={load} color={s.bar} />
            <p className="text-xs text-[#566270]">{load}% de carga</p>
          </div>
        ))}
      </div>

      {/* Inventario */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
        outOfStock > 0 ? "bg-[#F85149]/8 border-[#F85149]/25" :
        lowStock   > 0 ? "bg-[#FF7B54]/8 border-[#FF7B54]/25" :
                         "bg-[#3FB950]/8 border-[#3FB950]/25"
      }`}>
        <div className="flex items-center gap-2.5">
          {outOfStock > 0 || lowStock > 0
            ? <AlertTriangle size={16} className={outOfStock > 0 ? "text-[#F85149]" : "text-[#FF7B54]"} />
            : <CheckCircle2 size={16} className="text-[#3FB950]" />
          }
          <span className="text-sm font-semibold text-[#8B949E]">Inventario</span>
        </div>
        <span className="text-sm font-bold" style={{
          color: outOfStock > 0 ? "#F85149" : lowStock > 0 ? "#FF7B54" : "#3FB950",
        }}>
          {outOfStock > 0 ? `${outOfStock} sin stock` :
           lowStock   > 0 ? `${lowStock} por agotarse` :
                            "Estable"}
        </span>
      </div>

      {/* Alertas críticas */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-2">
          {criticalAlerts.slice(0, 3).map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-[#F85149]/8 border border-[#F85149]/25"
            >
              <ShieldAlert size={14} className="text-[#F85149] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#FF6B63] flex-1 leading-relaxed">{a.message}</p>
              <button
                type="button"
                onClick={() => dismiss(a.id)}
                className="text-[#F85149]/50 hover:text-[#F85149] transition-colors flex-shrink-0"
                aria-label="Descartar alerta"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
