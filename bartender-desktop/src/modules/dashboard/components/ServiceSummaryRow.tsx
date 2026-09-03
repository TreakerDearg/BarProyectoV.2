/**
 * ServiceSummaryRow — Fila de resumen de servicio para modo Standard.
 * Muestra carga de cocina/barra + reservas próximas + stock crítico
 * en una sola línea horizontal que no genera espacio muerto.
 */
import { ChefHat, GlassWater, CalendarClock, PackageX } from "lucide-react";
import type { DashboardStats } from "../services/dashboardService";

interface Props {
  data: DashboardStats;
  loading?: boolean;
}

function MiniMetric({
  icon, label, value, sub, colorCls,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  colorCls: string;
}) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className={`p-2.5 rounded-xl flex-shrink-0 ${colorCls}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-muted uppercase tracking-widest truncate">{label}</p>
        <p className="text-lg font-extrabold text-ivory leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-muted/60 truncate">{sub}</p>}
      </div>
    </div>
  );
}

export default function ServiceSummaryRow({ data, loading = false }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/8 bg-surface-3/50 px-5 py-4 flex items-center gap-6 animate-pulse">
        {[0,1,2,3].map((i) => (
          <div key={i} className="flex-1 space-y-2">
            <div className="h-2.5 rounded-full bg-white/10 w-16" />
            <div className="h-5 rounded-xl bg-white/15 w-12" />
          </div>
        ))}
      </div>
    );
  }

  const kitchen = data.kitchenLoad ?? 0;
  const bar     = data.barLoad ?? 0;
  const low     = data.inventory?.lowStock ?? 0;
  const out     = data.inventory?.outOfStock ?? 0;
  const reserv  = data.reservationsToday ?? 0;

  const kitchenColor = kitchen > 80 ? "bg-red-500/15 text-red-400"
    : kitchen > 50 ? "bg-amber-500/15 text-amber-400"
    : "bg-emerald-500/15 text-emerald-400";

  const barColor = bar > 80 ? "bg-red-500/15 text-red-400"
    : bar > 50 ? "bg-amber-500/15 text-amber-400"
    : "bg-emerald-500/15 text-emerald-400";

  const stockColor = out > 0 ? "bg-red-500/15 text-red-400"
    : low > 0 ? "bg-amber-500/15 text-amber-400"
    : "bg-emerald-500/15 text-emerald-400";

  const stockValue = out > 0 ? `${out} sin stock`
    : low > 0 ? `${low} bajo`
    : "Estable";

  return (
    <div className="rounded-2xl border border-white/8 bg-surface-3/50 px-5 py-4">
      <div className="flex items-center gap-4 flex-wrap md:flex-nowrap divide-x divide-white/6">
        <div className="flex-1 min-w-[140px] pr-4">
          <MiniMetric
            icon={<ChefHat size={16} />}
            label="Cocina"
            value={`${kitchen}%`}
            sub={kitchen > 80 ? "Sobrecargada" : kitchen > 50 ? "Ocupada" : "Normal"}
            colorCls={kitchenColor}
          />
        </div>
        <div className="flex-1 min-w-[140px] px-4">
          <MiniMetric
            icon={<GlassWater size={16} />}
            label="Barra"
            value={`${bar}%`}
            sub={bar > 80 ? "Sobrecargada" : bar > 50 ? "Ocupada" : "Normal"}
            colorCls={barColor}
          />
        </div>
        <div className="flex-1 min-w-[140px] px-4">
          <MiniMetric
            icon={<CalendarClock size={16} />}
            label="Reservas hoy"
            value={String(reserv)}
            sub={reserv === 0 ? "Sin reservas" : reserv === 1 ? "1 confirmada" : `${reserv} confirmadas`}
            colorCls="bg-violet-500/15 text-violet-300"
          />
        </div>
        <div className="flex-1 min-w-[140px] pl-4">
          <MiniMetric
            icon={<PackageX size={16} />}
            label="Inventario"
            value={stockValue}
            sub={out > 0 ? "Reposición urgente" : low > 0 ? "Revisar pronto" : "Sin alertas"}
            colorCls={stockColor}
          />
        </div>
      </div>
    </div>
  );
}
