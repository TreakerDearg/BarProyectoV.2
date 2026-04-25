import { useEffect, useState } from "react";
import { Plus, RefreshCcw, ShieldAlert } from "lucide-react";

import OrderCard from "../components/OrderCard";
import OrderForm from "../components/OrderForm";

import {
  getOrders,
  deleteOrder,
  updateOrderStatus,
} from "../services/orderService";

import type { Order } from "../types/order";
import api from "../../../services/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* FOCUSED_DETAIL STATES */
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [recipeData, setRecipeData] = useState<any>(null);

  /* =========================
     POS CONTEXT (REAL FLOW)
  ========================= */
  const [tableId, setTableId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [filter, setFilter] = useState<
    "all" | "pending" | "in-progress" | "completed" | "cancelled"
  >("all");

  /* =========================
     FETCH ORDERS
  ========================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedItem?.product) {
      const pId = typeof selectedItem.product === 'object' ? selectedItem.product._id : selectedItem.product;
      setRecipeData(null);
      api.get(`/recipes/product/${pId}`).then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setRecipeData(res.data.data[0]); // first recipe
        }
      }).catch(console.error);
    }
  }, [selectedItem]);

  /* =========================
     DELETE ORDER
  ========================= */
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar pedido?")) return;

    try {
      setActionLoading(true);
      await deleteOrder(id);

      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error(err);
      setError("Error al eliminar pedido");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================
     STATUS UPDATE
  ========================= */
  const handleStatusChange = async (
    id: string,
    status: Order["status"]
  ) => {
    try {
      setActionLoading(true);

      await updateOrderStatus(id, status);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, status } : o
        )
      );
    } catch (err) {
      console.error(err);
      setError("Error al actualizar estado");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================
     OPEN ORDER (FROM TABLE ONLY)
  ========================= */
  const openOrderFromTable = (table: {
    _id: string;
    number: number;
    currentSessionId?: string | null;
    status?: string;
  }) => {
    if (!table._id || !table.currentSessionId) {
      setError("La mesa no tiene sesión activa");
      return;
    }

    if (table.status !== "occupied") {
      setError("La mesa debe estar abierta");
      return;
    }

    setTableId(table._id);
    setTableNumber(table.number);
    setSessionId(table.currentSessionId);

    setIsModalOpen(true);
  };

  /* =========================
     FILTER
  ========================= */
  const filteredOrders = orders.filter((o) =>
    filter === "all" ? true : o.status === filter
  );

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-gray-500 text-sm">
            Sistema POS - Cocina & Bar (Mesa obligatoria)
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={fetchOrders}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
          >
            <RefreshCcw size={18} />
          </button>

          {/* 🚨 BLOQUEADO: no se puede crear sin mesa */}
          <button
            onClick={() =>
              setError("Debes seleccionar una mesa desde el módulo de mesas")
            }
            className="flex items-center gap-2 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-medium"
          >
            <Plus size={18} />
            Nuevo Pedido
          </button>

        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">

        {(["all", "pending", "in-progress", "completed", "cancelled"] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-sm border transition ${
                filter === f
                  ? "bg-amber-500 text-black border-amber-500"
                  : "bg-gray-900 border-gray-800 text-gray-400"
              }`}
            >
              {f.toUpperCase()}
            </button>
          )
        )}

      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* LIST & FOCUSED DETAIL LAYOUT */}
      {loading ? (
        <div className="text-gray-400">Cargando pedidos...</div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onSelectItem={setSelectedItem}
                selectedItemId={selectedItem?._id}
              />
            ))}
          </div>

          {/* FOCUSED DETAIL */}
          <div className="w-full xl:w-96 border border-obsidian/60 bg-void/50 p-6 rounded-xl shadow-glass flex flex-col min-h-[600px] xl:sticky xl:top-6">
            {selectedItem ? (
              <>
                <div className="mb-6">
                  <span className="px-3 py-1 rounded-full text-[9px] tracking-widest font-bold border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6] mb-3 inline-block">
                    FOCUSED_DETAIL
                  </span>
                  <h2 className="text-xl font-black tracking-tight mb-1 leading-tight text-white">
                    {(selectedItem.name || "PRODUCT").toUpperCase().replace(/\s+/g, '_')}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                    SPEC_VERSION: 2.4.1 // UNIT_02
                  </p>
                </div>

                {recipeData ? (
                  <div className="space-y-6 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <div>
                      <p className="text-[10px] text-gray-400 tracking-widest font-bold mb-3 uppercase">SPECIFICATIONS</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-obsidian/30 border border-obsidian rounded p-3 flex flex-col items-center justify-center text-center gap-2">
                          <span className="text-[#8B5CF6] text-xl">🍸</span>
                          <span className="text-[9px] font-bold tracking-widest">{recipeData.specifications?.glass || "ROCKS_GLASS"}</span>
                        </div>
                        <div className="bg-obsidian/30 border border-obsidian rounded p-3 flex flex-col items-center justify-center text-center gap-2">
                          <span className="text-[#00FFFF] text-xl">❄️</span>
                          <span className="text-[9px] font-bold tracking-widest">{recipeData.specifications?.ice || "LARGE_CUBE"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-400 tracking-widest font-bold mb-3 uppercase">RECIPE_SEQUENCE</p>
                      <div className="space-y-3">
                        {recipeData.steps?.length > 0 ? recipeData.steps.map((step: any, i: number) => (
                          <div key={i} className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6] text-[9px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                              {(i + 1).toString().padStart(2, '0')}
                            </span>
                            <p className="text-xs text-gray-300 leading-relaxed uppercase">{step.instruction}</p>
                          </div>
                        )) : (
                          <p className="text-xs text-gray-500 italic">No sequence data available.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-400 tracking-widest font-bold mb-3 uppercase">INVENTORY_TELEMETRY</p>
                      <div className="space-y-2">
                        {recipeData.ingredients?.map((ing: any, i: number) => {
                          const isLow = ing.inventoryItem?.stock <= (ing.inventoryItem?.minStock || 1);
                          return (
                            <div key={i} className={`flex justify-between items-center ${isLow ? 'bg-bar-red/10 border-bar-red/30' : 'bg-obsidian/20 border-obsidian'} border p-2 rounded`}>
                              <span className={`text-[10px] font-bold ${isLow ? 'text-bar-red' : 'text-gray-300'}`}>{ing.inventoryItem?.name?.toUpperCase() || "UNKNOWN"}</span>
                              <span className={`text-[10px] ${isLow ? 'text-bar-red font-bold' : 'text-bar-green'}`}>
                                {isLow ? `CRITICAL (${ing.inventoryItem?.stock}${ing.unit})` : `NOMINAL (${ing.inventoryItem?.stock}${ing.unit})`}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                     <ShieldAlert className="w-8 h-8 mb-2 text-gray-500" />
                     <p className="text-[10px] text-gray-500 tracking-widest uppercase font-bold">FETCHING_TELEMETRY...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-xs text-gray-500 tracking-widest uppercase font-bold">NO_ITEM_SELECTED</p>
                <p className="text-[10px] text-gray-600 mt-2 max-w-[200px] mx-auto">Select an item from the active units to view its telemetry and specifications.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ORDER FORM (STRICT POS FLOW) */}
      {isModalOpen && tableId && sessionId && (
        <OrderForm
          tableId={tableId}
          tableNumber={tableNumber ?? undefined}
          sessionId={sessionId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchOrders}
        />
      )}

    </div>
  );
}