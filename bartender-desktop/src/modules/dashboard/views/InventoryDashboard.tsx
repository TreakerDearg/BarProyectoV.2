"use client";

import { PackageSearch, AlertTriangle, Boxes } from "lucide-react";
import type { DashboardStats } from "../services/dashboardService";
import InventoryAlerts from "../components/alerts/InventoryAlerts";
import CollapsibleSection from "../components/CollapsibleSection";
import type { DashboardMode } from "../store/dashboardUiStore";

interface Props {
  data: DashboardStats;
  mode: DashboardMode;
}

export default function InventoryDashboard({ data, mode }: Props) {
  const inv = data.inventory;
  const critical = inv?.criticalItems ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up-fusion">
      <div className="nebula-panel p-6 md:p-8" data-tutorial="inventory-panel">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-violet-500/15 text-violet-300">
            <PackageSearch size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ivory">Inventario</h2>
            <p className="text-sm text-muted mt-1 max-w-xl">
              Resumen de existencias, alertas de reposición y valor total en
              bodega. Los datos se actualizan con el resto del sistema Nebula.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <InventoryAlerts
            lowStock={inv?.lowStock ?? 0}
            outOfStock={inv?.outOfStock ?? 0}
          />
        </div>
      </div>

      {critical.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {critical.map((item: { _id: string; name: string; stock: number; unit?: string }) => (
            <div
              key={item._id}
              className="rounded-2xl border border-red/20 bg-red/5 p-5"
            >
              <div className="flex items-center gap-2 text-red mb-2">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  Reposición urgente
                </span>
              </div>
              <p className="font-semibold text-ivory">{item.name}</p>
              <p className="text-2xl font-bold text-red mt-2">
                {item.stock} {item.unit || "uds"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="nebula-panel p-8 text-center text-muted text-sm">
          No hay productos en nivel crítico en este momento.
        </div>
      )}

      {mode === "advanced" && (
        <CollapsibleSection
          title="Detalle de bodega"
          subtitle="Métricas ampliadas del inventario"
          defaultOpen
          mode={mode}
        >
          <div className="flex items-center gap-3 py-2 text-muted text-sm">
            <Boxes size={18} className="text-gold" />
            <span>
              Valor estimado del stock:{" "}
              <strong className="text-ivory">
                ${(inv?.stockValue ?? 0).toLocaleString("es-MX")}
              </strong>
            </span>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
