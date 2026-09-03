"use client";

import { AlertTriangle, PackageX, PackageSearch } from "lucide-react";
import "../../../../styles/dashboard-theme.css";

interface Props {
  lowStock: number;
  outOfStock: number;
}

export default function InventoryAlerts({ lowStock, outOfStock }: Props) {
  if (outOfStock === 0 && lowStock === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center opacity-40">
        <div className="w-14 h-14 rounded-full bg-emerald-400/10 flex items-center justify-center mb-4 border border-emerald-400/20">
          <PackageSearch size={24} className="text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-1">Inventario estable</p>
        <p className="text-xs text-muted/60">No existen alertas críticas de stock</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {outOfStock > 0 && (
        <div className="flex items-center gap-5 p-5 rounded-[2rem] border border-red/20 bg-red/5 group hover:bg-red/10 transition-all neon-glow-fusion">
          <div className="w-12 h-12 rounded-2xl bg-red/10 flex items-center justify-center flex-shrink-0 border border-red/20">
            <PackageX size={20} className="text-red" />
          </div>
          <div>
            <p className="text-xs font-black text-ivory uppercase tracking-tighter">{outOfStock} ACTIVOS AGOTADOS</p>
            <p className="text-[9px] text-red font-black uppercase tracking-widest mt-1">ACCIÓN INMEDIATA REQUERIDA</p>
          </div>
        </div>
      )}

      {lowStock > 0 && (
        <div className="flex items-center gap-5 p-5 rounded-[2rem] border border-gold/20 bg-gold/5 group hover:bg-gold/10 transition-all neon-glow-gold-fusion">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center flex-shrink-0 border border-gold/20">
            <AlertTriangle size={20} className="text-gold" />
          </div>
          <div>
            <p className="text-xs font-black text-ivory uppercase tracking-tighter">{lowStock} ACTIVOS EN NIVEL BAJO</p>
            <p className="text-[9px] text-gold font-black uppercase tracking-widest mt-1">CONSIDERAR REABASTECIMIENTO</p>
          </div>
        </div>
      )}
    </div>
  );
}
