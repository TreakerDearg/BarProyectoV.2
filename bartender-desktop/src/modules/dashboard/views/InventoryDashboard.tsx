"use client";

import { PackageSearch, AlertTriangle, Boxes, CheckCircle } from "lucide-react";
import type { DashboardStats } from "../services/dashboardService";
import InventoryAlerts from "../components/alerts/InventoryAlerts";
import CollapsibleSection from "../components/CollapsibleSection";
import ImprovementSuggestions from "../components/ImprovementSuggestions";
import type { DashboardMode } from "../store/dashboardUiStore";

interface Props {
  data: DashboardStats;
  mode: DashboardMode;
}

export default function InventoryDashboard({ data, mode }: Props) {
  const inv = data.inventory;
  const critical = inv?.criticalItems ?? [];
  const isSimple = mode === "simple";

  // Generate improvement suggestions
  const generateSuggestions = () => {
    const suggestions = [];
    const lowStock = inv?.lowStock ?? 0;
    const outOfStock = inv?.outOfStock ?? 0;

    if (outOfStock > 0) {
      suggestions.push({
        id: "out-of-stock",
        text: `${outOfStock} productos sin stock: Reponer urgentemente`,
        type: "warning" as const,
        icon: <AlertTriangle size={16} className="text-gold" />,
      });
    }

    if (lowStock > 10) {
      suggestions.push({
        id: "low-stock",
        text: `${lowStock} productos por terminar: Haz pedido pronto`,
        type: "warning" as const,
        icon: <AlertTriangle size={16} className="text-gold" />,
      });
    }

    if (lowStock === 0 && outOfStock === 0) {
      suggestions.push({
        id: "stock-good",
        text: "Stock en buen estado: Mantén el control actual",
        type: "success" as const,
        icon: <CheckCircle size={16} className="text-emerald-400" />,
      });
    }

    if (critical.length > 5) {
      suggestions.push({
        id: "many-critical",
        text: "Muchos productos críticos: Revisa proveedores",
        type: "warning" as const,
        icon: <AlertTriangle size={16} className="text-gold" />,
      });
    }

    return suggestions.slice(0, 3);
  };

  const suggestions = generateSuggestions();

  return (
    <div className="space-y-6 animate-fade-in-up-fusion">
      <div className="nebula-panel p-6 md:p-8" data-tutorial="inventory-panel">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-violet-500/15 text-violet-300">
            <PackageSearch size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ivory">Stock</h2>
            <p className="text-sm text-muted mt-1 max-w-xl">
              Productos que faltan y valor del inventario
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

      {/* Improvement Suggestions - Medium and Advanced */}
      {!isSimple && (
        <ImprovementSuggestions suggestions={suggestions} />
      )}

      {critical.length > 0 ? (
        <div className={`grid gap-4 ${isSimple ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
          {critical.slice(0, isSimple ? 3 : 6).map((item: { _id: string; name: string; stock: number; unit?: string }) => (
            <div
              key={item._id}
              className="rounded-2xl border border-red/20 bg-red/5 p-5"
            >
              <div className="flex items-center gap-2 text-red mb-2">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  Reponer urgente
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
          No hay productos críticos
        </div>
      )}

      {!isSimple && (
        <CollapsibleSection
          title="Valor del inventario"
          subtitle="Dinero en productos"
          defaultOpen
          mode={mode}
        >
          <div className="flex items-center gap-3 py-2 text-muted text-sm">
            <Boxes size={18} className="text-gold" />
            <span>
              Valor total:{" "}
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
