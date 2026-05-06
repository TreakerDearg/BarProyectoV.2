"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  RefreshCcw, 
  Search, 
  ChefHat, 
  Zap, 
  Flame, 
  Clock, 
  History, 
  LayoutGrid,
  Filter,
  X,
  AlertCircle,
  Command,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";

import OrderCard from "../components/OrderCard/Card";
import OrderForm from "../components/OrderForm";
import FocusPanel from "../components/FocusPanel";

import {
  getOrders,
  deleteOrder,
  updateOrderStatus,
} from "../services/orderService";

import type { Order } from "../types/order";
import socket from "../../../services/socket";

/* =========================
   PRIORITY SYSTEM
========================= */
function getOrderPriority(order: Order) {
  if (!order.createdAt) return 0;
  const minutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  if (minutes > 20) return 3; // CRITICAL
  if (minutes > 10) return 2; // WARNING
  return 1; // NORMAL
}

type FilterStatus = "all" | "pending" | "in-progress" | "completed" | "cancelled";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError("Fallo en la sincronización con el Command Center");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleNewOrder = (order: Order) => setOrders(prev => [order, ...prev]);
    const handleUpdateOrder = (updated: Order) => setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
    const handleDeleteOrder = (id: string) => setOrders(prev => prev.filter(o => o._id !== id));

    socket.on("order:created", handleNewOrder);
    socket.on("order:updated", handleUpdateOrder);
    socket.on("order:deleted", handleDeleteOrder);

    return () => {
      socket.off("order:created", handleNewOrder);
      socket.off("order:updated", handleUpdateOrder);
      socket.off("order:deleted", handleDeleteOrder);
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteOrder(id);
    } catch {
      setError("No se pudo anular la comanda");
    }
  };

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    try {
      const updatedOrder = await updateOrderStatus(id, status);
      // Optimistic/Immediate update
      setOrders(prev => prev.map(o => o._id === id ? updatedOrder : o));
    } catch {
      setError("Error al procesar el cambio de estado en el servidor");
    }
  };

  const processedOrders = useMemo(() => {
    let list = orders.filter((o) => (filter === "all" ? true : o.status === filter));
    if (searchQuery) {
      list = list.filter(o => 
        (o.table as any)?.number?.toString().includes(searchQuery) ||
        o.items.some(i => (i.product as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return list.sort((a, b) => {
      const pa = getOrderPriority(a);
      const pb = getOrderPriority(b);
      if (pb !== pa) return pb - pa;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [orders, filter, searchQuery]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    inProgress: orders.filter(o => o.status === "in-progress").length,
    critical: orders.filter(o => getOrderPriority(o) === 3 && o.status !== "completed").length
  }), [orders]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg p-6 gap-6">
      
      {/* SIDEBAR NAVIGATION (COMMAND STYLE) */}
      <div className="w-24 flex flex-col items-center py-8 bg-surface-2 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
        <div className="p-4 rounded-3xl bg-gold/10 text-gold shadow-gold-glow/20 mb-4">
           <Command size={24} />
        </div>
        
        <NavIcon active={filter === "pending"} onClick={() => setFilter("pending")} icon={<Clock size={20} />} label="PEND" />
        <NavIcon active={filter === "in-progress"} onClick={() => setFilter("in-progress")} icon={<Zap size={20} />} label="LIVE" />
        <NavIcon active={filter === "completed"} onClick={() => setFilter("completed")} icon={<History size={20} />} label="HIST" />
        <NavIcon active={filter === "all"} onClick={() => setFilter("all")} icon={<LayoutGrid size={20} />} label="ALL" />

        <div className="flex-1" />
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 rounded-2xl bg-gold text-bg shadow-gold-glow flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 space-y-6">
        
        {/* HEADER BAR */}
        <header className="flex items-end justify-between px-2">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[8px] font-black text-gold uppercase tracking-[0.2em]">System Online</div>
                 <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em]">Kitchen Command v4.0</p>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white leading-none">
                GUEST <span className="text-grad-gold">ORDERS</span>
              </h1>
           </div>

           <div className="flex items-center gap-4">
              <div className="relative group">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold transition-colors" />
                <input 
                  type="text"
                  placeholder="Buscar mesa o plato..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-surface-2 border border-white/5 rounded-[1.5rem] py-4 pl-14 pr-6 text-xs font-black text-ivory outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all w-72"
                />
              </div>

              <button
                onClick={fetchOrders}
                className="btn btn-ghost !p-4 rounded-2xl border border-white/5"
              >
                <RefreshCcw size={18} className={loading ? "animate-spin" : "opacity-40"} />
              </button>
           </div>
        </header>

        {/* METRICS ROW */}
        <div className="grid grid-cols-4 gap-6">
           <MetricCard label="Total" value={stats.total} icon={<Activity size={16} />} color="blue" />
           <MetricCard label="Pendientes" value={stats.pending} icon={<Clock size={16} />} color="gold" />
           <MetricCard label="En Cocina" value={stats.inProgress} icon={<Zap size={16} />} color="green" />
           <MetricCard label="Críticos" value={stats.critical} icon={<Flame size={16} />} color="red" />
        </div>

        {/* ERROR FEEDBACK */}
        {error && (
          <div className="glass-red p-4 rounded-2xl flex items-center justify-between border border-red-500/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" size={18} />
              <p className="text-[10px] font-black text-red-200/80 uppercase tracking-widest">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ORDERS GRID */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
           {processedOrders.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {processedOrders.map((order) => (
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
           ) : (
             <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-6">
                <ChefHat size={64} />
                <p className="text-xs font-black uppercase tracking-[0.5em]">No hay comandas activas</p>
             </div>
           )}
        </div>
      </div>

      {/* RIGHT FOCUS PANEL */}
      <div className="w-[420px] flex flex-col min-h-0">
         <FocusPanel selectedItem={selectedItem} />
      </div>

      {/* MODALS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
           <div className="w-full max-w-4xl">
              <OrderForm
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchOrders}
              />
           </div>
        </div>
      )}
    </div>
  );
}

function NavIcon({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 transition-all group
        ${active ? 'text-gold' : 'text-muted hover:text-white'}
      `}
    >
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center transition-all border
        ${active ? 'bg-gold/10 border-gold/30 shadow-gold-glow/20' : 'bg-white/5 border-white/5 group-hover:bg-white/10'}
      `}>
        {icon}
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function MetricCard({ label, value, icon, color }: any) {
  const colorMap: any = {
    gold: "text-gold bg-gold/10 border-gold/20",
    green: "text-green-400 bg-green-400/10 border-green-400/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20"
  };

  return (
    <div className="bg-surface-2 border border-white/5 p-5 rounded-[2rem] flex items-center gap-5 group hover:border-white/10 transition-all">
       <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          {icon}
       </div>
       <div>
          <p className="text-[9px] font-black text-muted uppercase tracking-widest leading-none">{label}</p>
          <p className="text-2xl font-black text-white mt-1 leading-none">{value}</p>
       </div>
       <div className="flex-1" />
       <TrendingUp size={14} className="text-muted opacity-20 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}