import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Package } from "lucide-react";

import InventoryCard from "../components/InventoryCard";
import InventoryForm from "../components/InventoryForm";

import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../services/inventoryService";

import type { InventoryItem } from "../types/inventory";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  /* =========================
     FETCH
  ========================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getInventory();

      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =========================
     FILTERED ITEMS (FAST UI)
  ========================= */
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;

    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  /* =========================
     SAVE
  ========================= */
  const handleSave = async (item: InventoryItem) => {
    try {
      if (item._id) {
        await updateInventoryItem(item._id, item);
      } else {
        await createInventoryItem(item);
      }

      setOpen(false);
      setSelected(null);
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Error al guardar item");
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("¿Eliminar este insumo?")) return;

    try {
      await deleteInventoryItem(id);
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar item");
    }
  };

  /* =========================
     UI SKELETON
  ========================= */
  const Skeleton = () => (
    <div className="bg-gray-800 animate-pulse h-40 rounded-xl" />
  );

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package size={22} />
            Inventario
          </h1>

          <p className="text-sm text-gray-500">
            Control de insumos del bar
          </p>
        </div>

        <button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <Plus size={18} />
          Nuevo insumo
        </button>
      </div>

      {/* =========================
          SEARCH BAR
      ========================= */}
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
        <Search size={18} className="text-gray-500" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar insumo o categoría..."
          className="bg-transparent w-full outline-none text-sm"
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredItems.length === 0 && (
        <p className="text-gray-500 text-sm">
          No hay insumos que coincidan con la búsqueda
        </p>
      )}

      {/* GRID */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <InventoryCard
              key={item._id}
              item={item}
              onEdit={(i) => {
                setSelected(i);
                setOpen(true);
              }}
              onDelete={() => handleDelete(item._id)}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      {open && (
        <InventoryForm
          item={selected}
          onSave={handleSave}
          onClose={() => {
            setOpen(false);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}