import { motion } from "framer-motion";
import { Loader2, LayoutGrid } from "lucide-react";
import type { Table } from "../types/table";
import TableNode from "./TableNode";

interface FloorPlanProps {
  tables: Table[];
  loading: boolean;
  selectedTable: Table | null;
  onSelect: (table: Table) => void;
}

export default function FloorPlan({
  tables,
  loading,
  selectedTable,
  onSelect,
}: FloorPlanProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gold/10 border border-gold/20 text-gold shadow-gold-glow/20">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-grad-gold tracking-tight uppercase">Vista de Salón</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <p className="text-[10px] text-dim font-bold uppercase tracking-[0.2em]">Grid View · Central Ops</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden group/floor shadow-2xl">
        {/* GRID BACKGROUND */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* LOADING OVERLAY */}
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={40} className="text-gold animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold animate-pulse">Sincronizando Activos</span>
            </div>
          </div>
        )}

        {/* TABLES GRID */}
        <div className="absolute inset-0 p-10 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tables.map((table) => (
              <TableNode
                key={table._id}
                table={table}
                selected={selectedTable?._id === table._id}
                onClick={() => onSelect(table)}
              />
            ))}
          </div>

          {tables.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <LayoutGrid size={48} className="mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">No hay mesas en esta zona</p>
            </div>
          )}
        </div>

        {/* LEGEND (FLOATING) */}
        <div className="absolute bottom-8 right-8 flex items-center gap-6 bg-black/80 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-2xl">
          <LegendItem color="bg-gold" label="Disponible" />
          <LegendItem color="bg-orange" label="Ocupada" />
          <LegendItem color="bg-blue-500" label="Reservada" />
          <LegendItem color="bg-red-500" label="Mantenimiento" />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color} shadow-lg`} />
      <span className="text-[9px] font-black uppercase text-white/50 tracking-tighter">{label}</span>
    </div>
  );
}