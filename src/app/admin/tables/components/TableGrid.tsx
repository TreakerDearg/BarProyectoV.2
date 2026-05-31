import React from "react";
import { LayoutGrid, CheckCircle, XCircle, AlertCircle, Zap } from "lucide-react";
import type { Table } from "../types/table";

interface TableGridProps {
  tables: Table[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function TableGrid({ tables, selectedId, onSelect }: TableGridProps) {
  const statusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-400";
      case "reserved":
        return "bg-yellow-500/20 text-yellow-400";
      case "occupied":
        return "bg-red-500/20 text-red-400";
      case "maintenance":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-muted/20 text-muted";
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {tables.map((t) => (
        <button
          key={t._id}
          onClick={() => onSelect(t._id)}
          className={`flex flex-col items-center p-4 rounded-xl border border-white/10 hover:border-gold/30 hover:shadow-gold-glow transition-all ${
            selectedId === t._id ? "ring-2 ring-gold" : ""
          } ${statusColor(t.status)}`}
        >
          <div className="text-2xl font-bold mb-2">{t.number}</div>
          <div className="text-sm capitalize">{t.location}</div>
          <div className="mt-2 text-xs uppercase opacity-80">{t.status}</div>
        </button>
      ))}
    </div>
  );
}
