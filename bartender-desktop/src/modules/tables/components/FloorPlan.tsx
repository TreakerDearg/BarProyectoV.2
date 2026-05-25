import { useRef } from "react";
import { Loader2, LayoutGrid, CheckCircle, Clock, Lock } from "lucide-react";
import type { Table } from "../types/table";
import TableNode from "./TableNode";

interface FloorPlanProps {
  tables: Table[];
  loading: boolean;
  selectedTable: Table | null;
  onSelect: (table: Table) => void;
  viewType: "grid" | "spatial";
  isEditMode: boolean;
  onTableLayoutChange: (id: string, x: number, y: number) => void;
}

export default function FloorPlan({
  tables,
  loading,
  selectedTable,
  onSelect,
  viewType,
  isEditMode,
  onTableLayoutChange,
}: FloorPlanProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full w-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-xl bg-gold/10 border border-gold/20 text-gold shadow-gold-glow/20">
            <LayoutGrid size={16} className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-black text-grad-gold tracking-tight uppercase">
              {viewType === "spatial" ? "Plano del Salón" : "Lista de Mesas"}
            </h2>
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
              <p className="text-[8px] md:text-[9px] text-dim font-bold uppercase tracking-[0.2em]">
                {viewType === "spatial" ? "VISTA ESPACIAL" : "CUADRÍCULA"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 bg-black/40 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 overflow-hidden group/floor shadow-2xl min-h-[400px] lg:min-h-0">
        {/* LOADING OVERLAY */}
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={32} className="w-8 h-8 md:w-10 md:h-10 text-gold animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gold animate-pulse">Sincronizando</span>
            </div>
          </div>
        )}

        {/* CONDITIONAL RENDER BY VIEWTYPE */}
        {viewType === "spatial" ? (
          /* SPATIAL CANVAS VIEW */
          <div 
            ref={containerRef}
            className="absolute inset-0 p-4 md:p-6 overflow-hidden bg-black/60 rounded-[2rem] md:rounded-[2.5rem] select-none"
            onDragOver={(e) => {
              if (isEditMode) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }
            }}
            onDrop={(e) => {
              if (isEditMode) {
                e.preventDefault();
              }
            }}
          >
            {/* COMPACT BLUEPRINT PATTERN OVERLAY */}
            <div 
              className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
                isEditMode ? "opacity-[0.09]" : "opacity-[0.03]"
              }`}
              style={{ 
                backgroundImage: 'radial-gradient(circle, white 1.2px, transparent 1.2px), linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)', 
                backgroundSize: '24px 24px, 48px 48px, 48px 48px' 
              }} 
            />

            {isEditMode && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-md shadow-black/80 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="text-[8px] md:text-[9.5px] font-black uppercase tracking-widest text-gold">Modo Editor: Arrastra las mesas a su lugar</span>
              </div>
            )}

            {!isEditMode && tables.length > 0 && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-md shadow-black/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] md:text-[9.5px] font-black uppercase tracking-widest text-emerald-400">Vista Operativa</span>
              </div>
            )}

            {tables.map((table) => (
              <TableNode
                key={table._id}
                table={table}
                selected={selectedTable?._id === table._id}
                onClick={() => onSelect(table)}
                viewType="spatial"
                isEditMode={isEditMode}
                onDragEnd={onTableLayoutChange}
                containerRef={containerRef}
              />
            ))}
            
            {tables.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 p-4">
                <LayoutGrid size={32} className="w-8 h-8 md:w-12 md:h-12 mb-4" />
                <p className="text-xs md:text-sm font-black uppercase tracking-widest text-center">
                  No hay mesas en esta zona
                </p>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD GRID VIEW */
          <div className="absolute inset-0 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {tables.map((table) => (
                <TableNode
                  key={table._id}
                  table={table}
                  selected={selectedTable?._id === table._id}
                  onClick={() => onSelect(table)}
                  viewType="grid"
                />
              ))}
            </div>

            {tables.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 p-4">
                <LayoutGrid size={32} className="w-8 h-8 md:w-12 md:h-12 mb-4" />
                <p className="text-xs md:text-sm font-black uppercase tracking-widest text-center">
                  No hay mesas en esta zona
                </p>
              </div>
            )}
          </div>
        )}

        {/* LEGEND (FLOATING BOTTOM RIGHT) */}
        <div className="absolute bottom-4 right-4 flex flex-wrap items-center justify-center gap-2 md:gap-3.5 bg-black/90 backdrop-blur-2xl px-3 md:px-5 py-2.5 rounded-xl md:rounded-2xl border border-white/10 shadow-2xl max-w-[95%] z-20">
          <LegendItem icon={<CheckCircle size={10} className="text-gold" />} label="Libre" color="text-gold" />
          <LegendItem icon={<div className="w-1.5 h-1.5 rounded-full bg-amber-400" />} label="Abierta" color="text-amber-400" />
          <LegendItem icon={<div className="w-1.5 h-1.5 rounded-full bg-orange" />} label="Consumiendo" color="text-orange" />
          <LegendItem icon={<div className="w-1.5 h-1.5 rounded-full bg-purple-400" />} label="Parcial" color="text-purple-400" />
          <LegendItem icon={<div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />} label="Pagada" color="text-emerald-400" />
          <LegendItem icon={<Clock size={10} className="text-blue-400" />} label="Reserva" color="text-blue-400" />
          <LegendItem icon={<Lock size={10} className="text-red-500" />} label="Bloqueo" color="text-red-500" />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ icon, label, color }: { icon?: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1 md:gap-1.5">
      {icon || <div className={`w-1.5 h-1.5 rounded-full ${color} shadow-lg`} />}
      <span className="text-[7.5px] md:text-[8px] font-black uppercase text-white/50 tracking-tighter">{label}</span>
    </div>
  );
}
