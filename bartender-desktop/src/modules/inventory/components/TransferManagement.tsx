"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Package,
  Calendar,
  User,
  MapPin,
  X
} from "lucide-react";
import type { StockTransfer } from "../types/inventory";

interface Props {
  transfers: StockTransfer[];
  onCreate?: (transfer: Omit<StockTransfer, '_id'>) => void;
  onApprove?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const LOCATIONS = [
  "Bóveda Central",
  "Barra Principal",
  "Cocina VIP",
  "Bodega Externa",
];

export default function TransferManagement({ transfers, onCreate, onApprove, onCancel }: Props) {
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | StockTransfer['status']>("all");

  const filteredTransfers = useMemo(() => {
    let filtered = [...transfers];

    if (search.trim()) {
      const lower = search.toLowerCase();
      filtered = filtered.filter((t) =>
        t.transferNumber.toLowerCase().includes(lower) ||
        t.fromLocation.toLowerCase().includes(lower) ||
        t.toLocation.toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());
  }, [transfers, search, statusFilter]);

  const statusConfig = {
    pending: {
      label: "Pendiente",
      icon: <Clock size={16} className="text-amber-400" />,
      bg: "bg-amber-500/10",
      border: "border-amber/30",
      color: "text-amber-400",
    },
    approved: {
      label: "Aprobado",
      icon: <CheckCircle size={16} className="text-emerald-400" />,
      bg: "bg-emerald-500/10",
      border: "border-emerald/30",
      color: "text-emerald-400",
    },
    in_transit: {
      label: "En Tránsito",
      icon: <Truck size={16} className="text-cyan-400" />,
      bg: "bg-cyan-500/10",
      border: "border-cyan/30",
      color: "text-cyan-400",
    },
    completed: {
      label: "Completado",
      icon: <CheckCircle size={16} className="text-emerald-400" />,
      bg: "bg-emerald-500/10",
      border: "border-emerald/30",
      color: "text-emerald-400",
    },
    cancelled: {
      label: "Cancelado",
      icon: <XCircle size={16} className="text-red-400" />,
      bg: "bg-red-500/10",
      border: "border-red/30",
      color: "text-red-400",
    },
  };

  const statusCounts = useMemo(() => {
    return transfers.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [transfers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-violet-500/20">
            <ArrowRight size={20} className="text-violet-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Transferencias de Stock</h3>
            <p className="text-xs text-white/50">{transfers.length} transferencia(s)</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan/20 border border-cyan/30 text-cyan hover:bg-cyan/30 transition-colors"
        >
          <Plus size={16} />
          <span className="text-xs font-bold">Nueva Transferencia</span>
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className={`p-3 rounded-xl ${config.bg} ${config.border}`}>
            <div className="flex items-center gap-2 mb-1">
              {config.icon}
              <span className="text-[10px] text-white/50">{config.label}</span>
            </div>
            <p className={`text-xl font-bold ${config.color}`}>{statusCounts[status] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Buscar transferencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "in_transit", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === status
                  ? "bg-cyan text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {status === "all" ? "Todos" : status === "in_transit" ? "En Tránsito" : status === "pending" ? "Pendientes" : "Completados"}
            </button>
          ))}
        </div>
      </div>

      {/* Transfers List */}
      <div className="space-y-3">
        {filteredTransfers.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <ArrowRight size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay transferencias registradas</p>
          </div>
        ) : (
          filteredTransfers.map((transfer) => {
            const config = statusConfig[transfer.status];
            const date = new Date(transfer.requestedDate);

            return (
              <div
                key={transfer._id}
                className={`rounded-xl p-4 border transition-all hover:scale-[1.01] ${config.bg} ${config.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-bold text-white">{transfer.transferNumber}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={14} className="text-white/40" />
                        <span className="text-white/70">{transfer.fromLocation}</span>
                        <ArrowRight size={14} className="text-cyan-400" />
                        <span className="text-white/70">{transfer.toLocation}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1 text-white/50">
                        <Package size={12} />
                        <span>{transfer.items.length} item(s)</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/50">
                        <Calendar size={12} />
                        <span>{date.toLocaleDateString()}</span>
                      </div>
                      {transfer.requestedBy && (
                        <div className="flex items-center gap-1 text-white/50">
                          <User size={12} />
                          <span>{transfer.requestedBy}</span>
                        </div>
                      )}
                    </div>

                    {transfer.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="space-y-1">
                          {transfer.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-white/70">{item.itemName}</span>
                              <span className="text-white/50">{item.quantity} {item.unit}</span>
                            </div>
                          ))}
                          {transfer.items.length > 3 && (
                            <span className="text-xs text-white/40">+{transfer.items.length - 3} más</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {transfer.status === "pending" && onApprove && (
                      <button
                        onClick={() => onApprove(transfer._id!)}
                        className="p-2 rounded-lg bg-emerald/20 hover:bg-emerald/30 text-emerald-400 transition-colors"
                        title="Aprobar"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {(transfer.status === "pending" || transfer.status === "approved") && onCancel && (
                      <button
                        onClick={() => onCancel(transfer._id!)}
                        className="p-2 rounded-lg bg-red/20 hover:bg-red/30 text-red-400 transition-colors"
                        title="Cancelar"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Transfer Form */}
      {showCreateForm && (
        <div className="p-6 rounded-2xl border border-cyan/30 bg-cyan/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white">Nueva Transferencia</h4>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-white/50" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Desde</label>
              <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan/30">
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Hacia</label>
              <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan/30">
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-white/50 mb-1 block">Notas</label>
              <textarea
                placeholder="Notas adicionales..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button className="flex-1 px-4 py-2 rounded-lg bg-cyan text-black font-bold hover:bg-cyan/80 transition-colors">
              Crear Transferencia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
