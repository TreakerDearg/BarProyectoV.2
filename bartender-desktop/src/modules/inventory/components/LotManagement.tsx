"use client";

import { useMemo, useState } from "react";
import {
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Search,
  Filter
} from "lucide-react";
import type { InventoryLot } from "../types/inventory";

interface Props {
  itemId: string;
  itemName: string;
  lots: InventoryLot[];
  onAddLot?: (lot: Omit<InventoryLot, '_id'>) => void;
  onDeleteLot?: (lotId: string) => void;
}

export default function LotManagement({ itemId, itemName, lots, onAddLot, onDeleteLot }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expiring" | "expired">("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredLots = useMemo(() => {
    let filtered = lots.filter((lot) => lot.itemId === itemId);

    if (search.trim()) {
      const lower = search.toLowerCase();
      filtered = filtered.filter((lot) =>
        lot.lotNumber.toLowerCase().includes(lower) ||
        lot.supplier.toLowerCase().includes(lower)
      );
    }

    if (filter !== "all") {
      filtered = filtered.filter((lot) => lot.status === filter);
    }

    return filtered.sort((a, b) => {
      // Sort by expiration date (earliest first)
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    });
  }, [lots, itemId, search, filter]);

  const lotStatus = (lot: InventoryLot) => {
    const today = new Date();
    const expDate = new Date(lot.expirationDate);
    const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { status: "expired", label: "Vencido", color: "red" };
    if (daysUntilExpiry <= 7) return { status: "expiring", label: "Por Vencer", color: "amber" };
    return { status: "active", label: "Activo", color: "emerald" };
  };

  const statusCounts = useMemo(() => {
    return lots.reduce((acc, lot) => {
      const status = lotStatus(lot).status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [lots]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-violet-500/20">
            <Package size={20} className="text-violet-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gestión de Lotes</h3>
            <p className="text-xs text-white/50">{itemName}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan/20 border border-cyan/30 text-cyan hover:bg-cyan/30 transition-colors"
        >
          <Plus size={16} />
          <span className="text-xs font-bold">Nuevo Lote</span>
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-xs text-white/50">Activos</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{statusCounts.active || 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <span className="text-xs text-white/50">Por Vencer</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{statusCounts.expiring || 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-xs text-white/50">Vencidos</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{statusCounts.expired || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Buscar lote..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "expiring", "expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === f
                  ? "bg-cyan text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {f === "all" ? "Todos" : f === "active" ? "Activos" : f === "expiring" ? "Por Vencer" : "Vencidos"}
            </button>
          ))}
        </div>
      </div>

      {/* Lots List */}
      <div className="space-y-3">
        {filteredLots.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay lotes registrados</p>
          </div>
        ) : (
          filteredLots.map((lot) => {
            const status = lotStatus(lot);
            const daysUntilExpiry = Math.ceil(
              (new Date(lot.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={lot._id}
                className={`rounded-xl p-4 border transition-all hover:scale-[1.01] ${
                  status.color === "red"
                    ? "bg-red-500/10 border-red/30"
                    : status.color === "amber"
                    ? "bg-amber-500/10 border-amber/30"
                    : "bg-emerald-500/10 border-emerald/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-sm font-bold text-white">{lot.lotNumber}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          status.color === "red"
                            ? "bg-red-500/20 text-red-400"
                            : status.color === "amber"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-white/50">Cantidad</p>
                        <p className="text-white font-semibold">
                          {lot.remainingQuantity} / {lot.quantity} {lot.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50">Proveedor</p>
                        <p className="text-white font-semibold">{lot.supplier}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Vencimiento</p>
                        <p className={`font-semibold ${
                          status.color === "red" ? "text-red-400" : 
                          status.color === "amber" ? "text-amber-400" : 
                          "text-white"
                        }`}>
                          {new Date(lot.expirationDate).toLocaleDateString()}
                          {daysUntilExpiry >= 0 && ` (${daysUntilExpiry} días)`}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50">Costo</p>
                        <p className="text-white font-semibold">${lot.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  {onDeleteLot && (
                    <button
                      onClick={() => onDeleteLot(lot._id!)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red/20 text-white/50 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Lot Form (Simplified) */}
      {showAddForm && (
        <div className="p-6 rounded-2xl border border-cyan/30 bg-cyan/5">
          <h4 className="text-sm font-bold text-white mb-4">Agregar Nuevo Lote</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Número de Lote</label>
              <input
                type="text"
                placeholder="Ej: L-2024-001"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Cantidad</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Fecha de Vencimiento</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Proveedor</label>
              <input
                type="text"
                placeholder="Nombre del proveedor"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button className="flex-1 px-4 py-2 rounded-lg bg-cyan text-black font-bold hover:bg-cyan/80 transition-colors">
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
