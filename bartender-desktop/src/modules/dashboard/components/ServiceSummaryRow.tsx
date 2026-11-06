/**
 * ServiceSummaryRow — Fila de resumen de servicio para modo Standard.
 * Muestra carga de cocina/barra + reservas próximas + stock crítico
 * en una sola línea horizontal que no genera espacio muerto.
 *
 * REDISEÑO v3.0 — Slate Elegante
 * Números más grandes, labels legibles, divisores visibles.
 */
import { ChefHat, GlassWater, CalendarClock, PackageX } from "lucide-react";
import type { DashboardStats } from "../services/dashboardService";

interface Props {
  data:     DashboardStats;
  loading?: boolean;
}

/* ── Mini métrica individual ───────────────────────────────── */
function MiniMetric({
  icon, label, value, sub, colorCls,
}: {
  icon:     React.ReactNode;
  label:    string;
  value:    string;
  sub?:     string;
  colorCls: string;
}) {
  return (
    <div className="flex items-center gap-3.5 flex-1 min-w-0">
      <span className={`p-3 rounded-xl flex-shrink-0 ${colorCls}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#566270] uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-xl font-bold text-[#E6EDF3] leading-tight mt-0.5">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-[#566270] truncate mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ── ServiceSummaryRow ─────────────────────────────────────── */
export default function ServiceSummaryRow({ data, loading = false }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 px-6 py-5 flex items-center gap-6 animate-pulse">
        {[0,1,2,3].map((i) => (
          <div key={i} className="flex-1 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#21283A]" />
            <div className="space-y-2">
              <div className="h-2.5 rounded-full bg-[#21283A] w-16" />
              <div className="h-5 rounded-xl bg-[#21283A] w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const kitchen = data.kitchenLoad ?? 0;
  const bar     = data.barLoad     ?? 0;
  const low     = data.inventory?.lowStock  ?? 0;
  const out     = data.inventory?.outOfStock ?? 0;
  const reserv  = data.reservationsToday ?? 0;

  /* Clases de color según carga */
  const kitchenColor =
    kitchen > 80 ? "bg-[#F85149]/15 text-[#F85149]" :
    kitchen > 50 ? "bg-[#FF7B54]/15 text-[#FF7B54]" :
                   "bg-[#3FB950]/15 text-[#3FB950]";

  const barColor =
    bar > 80 ? "bg-[#F85149]/15 text-[#F85149]" :
    bar > 50 ? "bg-[#FF7B54]/15 text-[#FF7B54]" :
               "bg-[#3FB950]/15 text-[#3FB950]";

  const stockColor =
    out > 0 ? "bg-[#F85149]/15 text-[#F85149]" :
    low > 0 ? "bg-[#FF7B54]/15 text-[#FF7B54]" :
              "bg-[#3FB950]/15 text-[#3FB950]";

  const stockValue =
    out > 0 ? `${out} sin stock` :
    low > 0 ? `${low} bajo mínimo` :
              "Estable";

  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 px-6 py-5">
      <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">

        <div className="flex-1 min-w-[150px] pr-4">
          <MiniMetric
            icon={<ChefHat size={18} />}
            label="Cocina"
            value={`${kitchen}%`}
            sub={kitchen > 80 ? "Sobrecargada" : kitchen > 50 ? "Ocupada" : "Normal"}
            colorCls={kitchenColor}
          />
        </div>

        {/* Divisor */}
        <div className="hidden md:block w-px self-stretch bg-[#30363D]" />

        <div className="flex-1 min-w-[150px] px-4">
          <MiniMetric
            icon={<GlassWater size={18} />}
            label="Barra"
            value={`${bar}%`}
            sub={bar > 80 ? "Sobrecargada" : bar > 50 ? "Ocupada" : "Normal"}
            colorCls={barColor}
          />
        </div>

        <div className="hidden md:block w-px self-stretch bg-[#30363D]" />

        <div className="flex-1 min-w-[150px] px-4">
          <MiniMetric
            icon={<CalendarClock size={18} />}
            label="Reservas hoy"
            value={String(reserv)}
            sub={
              reserv === 0 ? "Sin reservas" :
              reserv === 1 ? "1 confirmada" :
              `${reserv} confirmadas`
            }
            colorCls="bg-[#388BFD]/15 text-[#388BFD]"
          />
        </div>

        <div className="hidden md:block w-px self-stretch bg-[#30363D]" />

        <div className="flex-1 min-w-[150px] pl-4">
          <MiniMetric
            icon={<PackageX size={18} />}
            label="Inventario"
            value={stockValue}
            sub={
              out > 0 ? "Reposición urgente" :
              low > 0 ? "Revisar pronto" :
              "Sin alertas"
            }
            colorCls={stockColor}
          />
        </div>

      </div>
    </div>
  );
}
