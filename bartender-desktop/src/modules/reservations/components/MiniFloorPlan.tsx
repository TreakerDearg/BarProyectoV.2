"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { getTables } from "../../tables/services/tableService";
import type { Table } from "../../tables/types/table";

interface Props {
  availableTables: any[]; // Tables returned by getAvailableTables (only available)
  selectedTableId: string;
  onSelectTable: (id: string) => void;
  guestsCount: number;
}

const LOCATION_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  indoor: { label: "Interior", icon: "🏠", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  outdoor: { label: "Terraza", icon: "☀️", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  bar: { label: "Barra", icon: "🍸", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  vip: { label: "Zona VIP", icon: "👑", color: "text-gold", bg: "bg-gold/10 border-gold/20" },
};

const getLocationConfig = (loc: string) => {
  const key = loc?.toLowerCase() || "indoor";
  return LOCATION_LABELS[key] || { label: loc || "Otra Zona", icon: "📍", color: "text-muted", bg: "bg-white/5 border-white/10" };
};

export default function MiniFloorPlan({
  availableTables,
  selectedTableId,
  onSelectTable,
  guestsCount,
}: Props) {
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeZone, setActiveZone] = useState<string>("indoor");

  // Load all tables with spatial layout on mount
  useEffect(() => {
    const fetchAllTables = async () => {
      try {
        setLoading(true);
        const data = await getTables();
        if (Array.isArray(data)) {
          setAllTables(data);
          // Set first available zone as active if there are tables
          const zones = Array.from(new Set(data.map((t) => t.location || "indoor")));
          if (zones.length > 0 && !zones.includes(activeZone as any)) {
            setActiveZone(zones[0]);
          }
        }
      } catch (error) {
        console.error("Error loading spatial tables:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTables();
  }, []);

  // Get unique zones
  const zones = useMemo(() => {
    const set = new Set(allTables.map((t) => t.location || "indoor"));
    return Array.from(set);
  }, [allTables]);

  // Filter tables by active zone
  const zoneTables = useMemo(() => {
    return allTables.filter((t) => (t.location || "indoor") === activeZone);
  }, [allTables, activeZone]);

  // Create lookup set for available table IDs
  const availableSet = useMemo(() => {
    return new Set(availableTables.map((t) => t._id));
  }, [availableTables]);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-black/20 border border-white/5 rounded-3xl p-6">
        <Loader2 className="animate-spin text-gold mb-3" size={24} />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Cargando Distribución Espacial...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zone Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {zones.map((zone) => {
          const config = getLocationConfig(zone);
          const isActive = activeZone === zone;
          return (
            <button
              key={zone}
              type="button"
              onClick={() => setActiveZone(zone)}
              className={`
                px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5
                ${isActive
                  ? "bg-gold/15 text-gold border-gold/30 shadow-gold-glow"
                  : "bg-surface-4 text-muted border-white/5 hover:border-white/10 hover:text-ivory"
                }
              `}
            >
              <span>{config.icon}</span>
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Spatial Blueprint Canvas */}
      <div className="relative w-full h-[320px] bg-black/60 rounded-3xl border border-white/5 overflow-hidden group select-none shadow-inner">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {zoneTables.map((table) => {
          const isAvailable = availableSet.has(table._id);
          const isSelected = selectedTableId === table._id;
          const capacityInsufficient = guestsCount > table.capacity;

          // Spatial styles
          const widthVal = table.width || 75;
          const heightVal = table.height || 75;
          
          // Make width and height 15% smaller for compact modal display
          const widthCompact = Math.max(50, widthVal * 0.75);
          const heightCompact = Math.max(50, heightVal * 0.75);

          const isCircle = table.shape === "circle";
          const shapeClass = isCircle ? "rounded-full" : "rounded-2xl";

          // Table visual status
          let borderStyle = "border-white/5 bg-white/5 text-muted opacity-40 cursor-not-allowed";
          let shadowStyle = "";
          let icon = <Lock size={12} className="text-red-500/70" />;

          if (isAvailable) {
            if (isSelected) {
              borderStyle = "border-gold bg-gold/20 text-gold scale-105 z-25";
              shadowStyle = "shadow-gold-glow";
              icon = <CheckCircle2 size={12} className="text-gold" />;
            } else if (capacityInsufficient) {
              borderStyle = "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:border-amber-500/50 cursor-pointer";
              icon = <AlertCircle size={12} className="text-amber-500" />;
            } else {
              borderStyle = "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 cursor-pointer";
              icon = <Sparkles size={12} className="text-emerald-400" />;
            }
          }

          return (
            <motion.button
              key={table._id}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelectTable(table._id)}
              style={{
                position: "absolute",
                left: `${table.x}%`,
                top: `${table.y}%`,
                width: `${widthCompact}px`,
                height: `${heightCompact}px`,
                marginLeft: `-${widthCompact / 2}px`,
                marginTop: `-${heightCompact / 2}px`,
              }}
              className={`
                absolute flex flex-col items-center justify-center border text-center transition-all ${borderStyle} ${shadowStyle} ${shapeClass}
              `}
              title={
                !isAvailable
                  ? `Mesa ${table.number} — Reservada/Ocupada`
                  : capacityInsufficient
                  ? `Mesa ${table.number} — Capacidad ${table.capacity}p (Invitados: ${guestsCount}p)`
                  : `Mesa ${table.number} — Disponible (${table.capacity}p)`
              }
            >
              <div className="font-black text-xs leading-none">M{table.number}</div>
              <div className="text-[7.5px] font-bold mt-1 opacity-70">
                {table.capacity} Pax
              </div>
              <div className="mt-1 flex items-center justify-center">
                {icon}
              </div>
            </motion.button>
          );
        })}

        {zoneTables.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <p className="text-[10px] font-black uppercase tracking-widest">No hay plano configurado para esta zona</p>
          </div>
        )}

        {/* Floating Legend */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 text-[8px] font-black uppercase tracking-widest text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-emerald-500/50" />
            <span>Libre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-amber-500/50" />
            <span>Capacidad Límite</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-gold-glow" />
            <span>Seleccionada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock size={8} className="text-red-500" />
            <span>Ocupada / Bloqueada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
