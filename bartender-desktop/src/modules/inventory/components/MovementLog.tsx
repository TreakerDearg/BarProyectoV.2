"use client";

import { useMemo, useState } from "react";
import {
  History,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  RefreshCw,
  ShoppingCart,
  RotateCcw,
  Download,
  Search,
  Filter,
  Calendar,
  User
} from "lucide-react";
import type { InventoryMovement, MovementFilter } from "../types/inventory";

interface Props {
  movements: InventoryMovement[];
  onExport?: () => void;
}

export default function MovementLog({ movements, onExport }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MovementFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredMovements = useMemo(() => {
    let filtered = [...movements];

    if (search.trim()) {
      const lower = search.toLowerCase();
      filtered = filtered.filter((m) =>
        m.itemName.toLowerCase().includes(lower) ||
        m.reason.toLowerCase().includes(lower) ||
        m.userName?.toLowerCase().includes(lower)
      );
    }

    if (filter.type) {
      filtered = filtered.filter((m) => m.type === filter.type);
    }

    if (filter.itemId) {
      filtered = filtered.filter((m) => m.itemId === filter.itemId);
    }

    if (filter.userId) {
      filtered = filtered.filter((m) => m.userId === filter.userId);
    }

    if (filter.startDate) {
      filtered = filtered.filter((m) => new Date(m.timestamp) >= new Date(filter.startDate));
    }

    if (filter.endDate) {
      filtered = filtered.filter((m) => new Date(m.timestamp) <= new Date(filter.endDate));
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [movements, search, filter]);

  const movementTypeConfig = {
    stock_in: {
      label: "Entrada",
      icon: <ArrowDown size={16} className="text-emerald-400" />,
      bg: "bg-emerald-500/10",
      border: "border-emerald/30",
      color: "text-emerald-400",
    },
    stock_out: {
      label: "Salida",
      icon: <ArrowUp size={16} className="text-red-400" />,
      bg: "bg-red-500/10",
      border: "border-red/30",
      color: "text-red-400",
    },
    adjustment: {
      label: "Ajuste",
      icon: <RefreshCw size={16} className="text-amber-400" />,
      bg: "bg-amber-500/10",
      border: "border-amber/30",
      color: "text-amber-400",
    },
    transfer: {
      label: "Transferencia",
      icon: <ArrowRight size={16} className="text-cyan-400" />,
      bg: "bg-cyan-500/10",
      border: "border-cyan/30",
      color: "text-cyan-400",
    },
    sale: {
      label: "Venta",
      icon: <ShoppingCart size={16} className="text-violet-400" />,
      bg: "bg-violet-500/10",
      border: "border-violet/30",
      color: "text-violet-400",
    },
    return: {
      label: "Devolución",
      icon: <RotateCcw size={16} className="text-gold" />,
      bg: "bg-gold/10",
      border: "border-gold/30",
      color: "text-gold",
    },
  };

  const typeCounts = useMemo(() => {
    return movements.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [movements]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-violet-500/20">
            <History size={20} className="text-violet-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Auditoría de Movimientos</h3>
            <p className="text-xs text-white/50">{movements.length} movimiento(s) registrado(s)</p>
          </div>
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet/20 border border-violet/30 text-violet hover:bg-violet/30 transition-colors"
          >
            <Download size={16} />
            <span className="text-xs font-bold">Exportar</span>
          </button>
        )}
      </div>

      {/* Type Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(typeCounts).map(([type, count]) => {
          const config = movementTypeConfig[type as keyof typeof movementTypeConfig];
          return (
            <div key={type} className={`p-3 rounded-xl ${config.bg} ${config.border}`}>
              <p className="text-[10px] text-white/50 mb-1">{config.label}</p>
              <p className={`text-xl font-bold ${config.color}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Buscar movimiento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-xl transition-colors ${
            showFilters ? "bg-cyan/20 text-cyan" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          <Filter size={16} />
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Tipo</label>
              <select
                value={filter.type || "all"}
                onChange={(e) => setFilter({ ...filter, type: e.target.value as any || undefined })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan/30"
              >
                <option value="">Todos</option>
                {Object.entries(movementTypeConfig).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Desde</label>
              <input
                type="date"
                value={filter.startDate || ""}
                onChange={(e) => setFilter({ ...filter, startDate: e.target.value || undefined })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Hasta</label>
              <input
                type="date"
                value={filter.endDate || ""}
                onChange={(e) => setFilter({ ...filter, endDate: e.target.value || undefined })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({})}
                className="w-full px-3 py-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movements List */}
      <div className="space-y-3">
        {filteredMovements.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <History size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay movimientos registrados</p>
          </div>
        ) : (
          filteredMovements.map((movement) => {
            const config = movementTypeConfig[movement.type];
            const date = new Date(movement.timestamp);
            const isPositive = ['stock_in', 'sale', 'return'].includes(movement.type);

            return (
              <div
                key={movement._id}
                className={`rounded-xl p-4 border transition-all hover:scale-[1.01] ${config.bg} ${config.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${config.bg} ${config.border}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white">{movement.itemName}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 mb-2">{movement.reason}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-white/40" />
                          <span className="text-white/50">{date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={12} className="text-white/40" />
                          <span className="text-white/50">{movement.userName || 'Sistema'}</span>
                        </div>
                        {movement.location && (
                          <div className="flex items-center gap-1">
                            <span className="text-white/40">Ubicación:</span>
                            <span className="text-white/50">{movement.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-lg font-bold ${config.color}`}>
                      {isPositive ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-[10px] text-white/40">
                      {movement.previousStock} → {movement.newStock}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
