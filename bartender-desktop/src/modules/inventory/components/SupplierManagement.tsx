"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  Plus,
  Search,
  Clock,
  X,
  Edit,
  Trash2,
  User
} from "lucide-react";
import type { Supplier } from "../types/inventory";

interface Props {
  suppliers: Supplier[];
  onAdd?: (supplier: Omit<Supplier, '_id'>) => void;
  onEdit?: (id: string, supplier: Supplier) => void;
  onDelete?: (id: string) => void;
}

export default function SupplierManagement({ suppliers, onAdd, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return suppliers;
    const lower = search.toLowerCase();
    return suppliers.filter((s) =>
      s.name.toLowerCase().includes(lower) ||
      s.contactPerson?.toLowerCase().includes(lower) ||
      s.email?.toLowerCase().includes(lower) ||
      s.city?.toLowerCase().includes(lower)
    );
  }, [suppliers, search]);

  const statusCounts = useMemo(() => {
    return {
      active: suppliers.filter((s) => s.isActive).length,
      inactive: suppliers.filter((s) => !s.isActive).length,
      total: suppliers.length,
    };
  }, [suppliers]);

  const averageRating = useMemo(() => {
    const ratedSuppliers = suppliers.filter((s) => s.rating);
    if (ratedSuppliers.length === 0) return 0;
    return ratedSuppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / ratedSuppliers.length;
  }, [suppliers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-violet-500/20">
            <Building2 size={20} className="text-violet-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gestión de Proveedores</h3>
            <p className="text-xs text-white/50">{statusCounts.total} proveedor(es)</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan/20 border border-cyan/30 text-cyan hover:bg-cyan/30 transition-colors"
        >
          <Plus size={16} />
          <span className="text-xs font-bold">Nuevo Proveedor</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald/30">
          <p className="text-xs text-white/50 mb-1">Activos</p>
          <p className="text-2xl font-bold text-emerald-400">{statusCounts.active}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber/30">
          <p className="text-xs text-white/50 mb-1">Inactivos</p>
          <p className="text-2xl font-bold text-amber-400">{statusCounts.inactive}</p>
        </div>
        <div className="p-4 rounded-xl bg-gold/10 border border-gold/30">
          <div className="flex items-center gap-2 mb-1">
            <Star size={14} className="text-gold" />
            <p className="text-xs text-white/50">Rating Promedio</p>
          </div>
          <p className="text-2xl font-bold text-gold">{averageRating.toFixed(1)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Buscar proveedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
        />
      </div>

      {/* Suppliers List */}
      <div className="space-y-3">
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <Building2 size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay proveedores registrados</p>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div
              key={supplier._id}
              className={`rounded-xl p-4 border transition-all hover:scale-[1.01] ${
                supplier.isActive
                  ? "bg-white/5 border-white/10"
                  : "bg-white/5 border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white">{supplier.name}</h4>
                    {!supplier.isActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">
                        Inactivo
                      </span>
                    )}
                  </div>
                  
                  {supplier.contactPerson && (
                    <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                      <User size={12} />
                      <span>{supplier.contactPerson}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    {supplier.email && (
                      <div className="flex items-center gap-1 text-white/50">
                        <Mail size={12} />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-1 text-white/50">
                        <Phone size={12} />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.city && (
                      <div className="flex items-center gap-1 text-white/50">
                        <MapPin size={12} />
                        <span>{supplier.city}</span>
                      </div>
                    )}
                    {supplier.leadTime && (
                      <div className="flex items-center gap-1 text-white/50">
                        <Clock size={12} />
                        <span>{supplier.leadTime} días</span>
                      </div>
                    )}
                  </div>

                  {supplier.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={star <= (supplier.rating || 0) ? "text-gold fill-gold" : "text-white/20"}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {onEdit && (
                    <button
                      onClick={() => setEditingSupplier(supplier)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-cyan/20 text-white/50 hover:text-cyan-400 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(supplier._id!)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red/20 text-white/50 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingSupplier) && (
        <div className="p-6 rounded-2xl border border-cyan/30 bg-cyan/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white">
              {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
            </h4>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingSupplier(null);
              }}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-white/50" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Nombre *</label>
              <input
                type="text"
                defaultValue={editingSupplier?.name}
                placeholder="Nombre del proveedor"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Contacto</label>
              <input
                type="text"
                defaultValue={editingSupplier?.contactPerson}
                placeholder="Persona de contacto"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Email</label>
              <input
                type="email"
                defaultValue={editingSupplier?.email}
                placeholder="email@ejemplo.com"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Teléfono</label>
              <input
                type="tel"
                defaultValue={editingSupplier?.phone}
                placeholder="+1 234 567 890"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Ciudad</label>
              <input
                type="text"
                defaultValue={editingSupplier?.city}
                placeholder="Ciudad"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Tiempo de Entrega (días)</label>
              <input
                type="number"
                defaultValue={editingSupplier?.leadTime}
                placeholder="7"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                defaultValue={editingSupplier?.rating}
                placeholder="5"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Condiciones de Pago</label>
              <input
                type="text"
                defaultValue={editingSupplier?.paymentTerms}
                placeholder="Net 30"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan/30"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingSupplier(null);
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button className="flex-1 px-4 py-2 rounded-lg bg-cyan text-black font-bold hover:bg-cyan/80 transition-colors">
              {editingSupplier ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
