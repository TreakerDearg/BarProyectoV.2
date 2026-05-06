import type { Table } from "../types/table";
import { Users, LayoutGrid, CheckCircle2 } from "lucide-react";

export default function TableStats({ tables }: { tables: Table[] }) {
  const total = tables.length;
  const occupied = tables.filter(t => t.status === "occupied").length;
  const available = tables.filter(t => t.status === "available").length;
  const capacity = tables.reduce((a, t) => a + t.capacity, 0);

  return (
    <div className="flex gap-6 items-center px-6 py-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md shadow-xl">
      <StatItem 
        icon={<LayoutGrid size={14} className="text-gold" />} 
        label="Total Mesas" 
        value={total} 
      />
      <div className="w-px h-8 bg-white/10" />
      <StatItem 
        icon={<CheckCircle2 size={14} className="text-green-400" />} 
        label="Libres" 
        value={available} 
      />
      <div className="w-px h-8 bg-white/10" />
      <StatItem 
        icon={<Users size={14} className="text-blue-400" />} 
        label="Capacidad" 
        value={capacity} 
      />
    </div>
  );
}

function StatItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
        {icon}
      </div>
      <div>
        <p className="text-[8px] font-black text-muted uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-white/80 leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}