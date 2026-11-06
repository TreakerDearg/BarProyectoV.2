"use client";

/**
 * InventoryAlerts — Alertas críticas de stock.
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import { AlertTriangle, PackageX, PackageSearch } from "lucide-react";

interface Props {
  lowStock:   number;
  outOfStock: number;
}

export default function InventoryAlerts({ lowStock, outOfStock }: Props) {
  /* Sin alertas */
  if (outOfStock === 0 && lowStock === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#3FB950]/12 flex items-center justify-center mb-3 border border-[#3FB950]/25">
          <PackageSearch size={22} className="text-[#3FB950]" />
        </div>
        <p className="text-sm font-semibold text-[#3FB950]">Inventario estable</p>
        <p className="text-xs text-[#566270] mt-1">No hay alertas críticas de stock</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sin stock — máxima urgencia */}
      {outOfStock > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-[#F85149]/30 bg-[#F85149]/10 hover:bg-[#F85149]/15 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#F85149]/15 flex items-center justify-center flex-shrink-0 border border-[#F85149]/25">
            <PackageX size={18} className="text-[#F85149]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#E6EDF3]">
              {outOfStock} {outOfStock === 1 ? "producto agotado" : "productos agotados"}
            </p>
            <p className="text-xs text-[#F85149] font-semibold mt-0.5 uppercase tracking-wide">
              Acción inmediata requerida
            </p>
          </div>
        </div>
      )}

      {/* Stock bajo — advertencia */}
      {lowStock > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-[#F0B429]/25 bg-[#F0B429]/8 hover:bg-[#F0B429]/12 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#F0B429]/15 flex items-center justify-center flex-shrink-0 border border-[#F0B429]/25">
            <AlertTriangle size={18} className="text-[#F0B429]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#E6EDF3]">
              {lowStock} {lowStock === 1 ? "producto" : "productos"} en nivel bajo
            </p>
            <p className="text-xs text-[#F0B429] font-semibold mt-0.5 uppercase tracking-wide">
              Considerar reabastecimiento
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
