"use client";

/**
 * ServiceHealth — Estado detallado de cocina y barra con barras de carga.
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import type { DashboardStats } from "../../services/dashboardService";
import { Clock, ShieldCheck, ChefHat, GlassWater } from "lucide-react";

interface Props {
  data: DashboardStats;
}

/* ── Barra segmentada ──────────────────────────────────────── */
function SegmentBar({ segments, total = 8, critical }: { segments: number; total?: number; critical: boolean }) {
  return (
    <div className="flex gap-1.5 h-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-500"
          style={{
            background: i < segments
              ? critical ? "#F85149" : "#3FB950"
              : "#21283A",
            boxShadow: i < segments && i === segments - 1
              ? critical
                ? "0 0 6px rgba(248,81,73,0.5)"
                : "0 0 6px rgba(63,185,80,0.4)"
              : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function ServiceHealth({ data }: Props) {
  const kitchenLoad   = data.kitchenLoad    || 0;
  const barLoad       = data.barLoad        || 0;
  const activeOrders  = data.activeOrdersCount || 0;

  const kitchenSegments = Math.ceil((kitchenLoad / 100) * 8);
  const barSegments     = Math.ceil((barLoad     / 100) * 8);

  const isKitchenCritical = kitchenLoad > 75;
  const isBarCritical     = barLoad     > 75;

  const estimatedWait = barLoad > 0 ? Math.ceil(barLoad / 10) : 0;

  return (
    <div className="space-y-5 h-full flex flex-col">

      {/* Cocina */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: isKitchenCritical ? "#F85149" : "#3FB950",
                boxShadow: isKitchenCritical
                  ? "0 0 6px rgba(248,81,73,0.6)"
                  : "0 0 6px rgba(63,185,80,0.5)",
              }}
            />
            <div className="flex items-center gap-1.5">
              <ChefHat size={14} className="text-[#8B949E]" />
              <span className="text-sm font-semibold text-[#E6EDF3]">Cocina</span>
            </div>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-lg font-semibold border"
            style={{
              color:       isKitchenCritical ? "#F85149" : "#3FB950",
              borderColor: isKitchenCritical ? "rgba(248,81,73,0.25)" : "rgba(63,185,80,0.25)",
              background:  isKitchenCritical ? "rgba(248,81,73,0.10)" : "rgba(63,185,80,0.10)",
            }}
          >
            {isKitchenCritical ? "Muy ocupada" : "Normal"}
          </span>
        </div>
        <p className="text-xs text-[#566270]">
          {activeOrders} {activeOrders === 1 ? "orden" : "órdenes"} en preparación
        </p>
        <SegmentBar segments={kitchenSegments} critical={isKitchenCritical} />
        <div className="flex justify-between text-xs text-[#566270]">
          <span>Ocupación</span>
          <span className="font-semibold text-[#E6EDF3]">{kitchenLoad}%</span>
        </div>
      </div>

      {/* Separador */}
      <div className="h-px bg-[#30363D]" />

      {/* Barra */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: isBarCritical ? "#F85149" : "#F0B429",
                boxShadow: isBarCritical
                  ? "0 0 6px rgba(248,81,73,0.6)"
                  : "0 0 6px rgba(240,180,41,0.5)",
              }}
            />
            <div className="flex items-center gap-1.5">
              <GlassWater size={14} className="text-[#8B949E]" />
              <span className="text-sm font-semibold text-[#E6EDF3]">Barra</span>
            </div>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-lg font-semibold border"
            style={{
              color:       isBarCritical ? "#F85149" : "#F0B429",
              borderColor: isBarCritical ? "rgba(248,81,73,0.25)" : "rgba(240,180,41,0.25)",
              background:  isBarCritical ? "rgba(248,81,73,0.10)" : "rgba(240,180,41,0.10)",
            }}
          >
            {isBarCritical ? "Demora alta" : "Rápido"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#566270]">
          <Clock size={12} />
          <span>Tiempo espera: ~{estimatedWait} min</span>
        </div>
        <SegmentBar segments={barSegments} critical={isBarCritical} />
        <div className="flex justify-between text-xs text-[#566270]">
          <span>Ocupación</span>
          <span className="font-semibold text-[#E6EDF3]">{barLoad}%</span>
        </div>
      </div>

      {/* Sistema OK */}
      <div className="mt-auto p-3 rounded-xl bg-[#21283A] border border-[#30363D] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#3FB950]" />
          <span className="text-xs font-medium text-[#8B949E]">Sistema en línea</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse shadow-[0_0_5px_#3FB950]" />
          <span className="text-xs font-bold text-[#3FB950]">OK</span>
        </div>
      </div>
    </div>
  );
}
