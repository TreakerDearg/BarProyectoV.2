import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
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

  //  Obtener datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setItems(data);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Guardar (crear / editar)
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
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  //  Eliminar (FIX REAL)
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este insumo?")) return;

    try {
      await deleteInventoryItem(id);
      fetchData(); // refresca UI
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventario</h1>

        <button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
          className="btn-primary flex gap-2"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400">Cargando inventario...</p>
      )}

      {/* EMPTY STATE */}
      {!loading && items.length === 0 && (
        <p className="text-gray-500">
          No hay insumos cargados todavía.
        </p>
      )}

      {/* GRID */}
      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => (
          <InventoryCard
            key={item._id}
            item={item}
            onEdit={(i) => {
              setSelected(i);
              setOpen(true);
            }}
            onDelete={handleDelete} 
          />
        ))}
      </div>

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