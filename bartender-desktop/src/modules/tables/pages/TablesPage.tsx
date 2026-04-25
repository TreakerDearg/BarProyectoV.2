import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, CheckCircle2, RotateCcw, MonitorPlay, Save, Users } from "lucide-react";
import { io, Socket } from "socket.io-client";

import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  openTable,
  closeTable,
} from "../services/tableService";

import type { Table } from "../types/table";
import OrderForm from "../../orders/components/OrderForm";
import TableForm from "../components/TableForm";

let socket: Socket;

const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
      reconnection: true,
    });
  }
  return socket;
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  /* =========================
     INITIAL LOAD
  ========================= */
  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await getTables();
      setTables(data || []);
    } catch {
      setError("Error Loading Tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  /* =========================
     SOCKET INIT
  ========================= */
  useEffect(() => {
    const s = getSocket();
    socketRef.current = s;

    const handleUpdate = (updated: Table) => {
      setTables((prev) => {
        const index = prev.findIndex((t) => t._id === updated._id);
        if (index === -1) return prev;
        const copy = [...prev];
        copy[index] = { ...copy[index], ...updated };
        if (selectedTable?._id === updated._id) setSelectedTable({ ...copy[index] });
        return copy;
      });
    };

    const handleCreated = (table: Table) => setTables((prev) => [...prev, table]);
    const handleDeleted = (id: string) => {
      setTables((prev) => prev.filter((t) => t._id !== id));
      if (selectedTable?._id === id) setSelectedTable(null);
    };

    s.on("table:update", handleUpdate);
    s.on("table:created", handleCreated);
    s.on("table:deleted", handleDeleted);

    return () => {
      s.off("table:update", handleUpdate);
      s.off("table:created", handleCreated);
      s.off("table:deleted", handleDeleted);
    };
  }, [selectedTable]);

  /* =========================
     ACTIONS
  ========================= */
  const handleSave = async (table: Table) => {
    try {
      if (table._id) {
        const updated = await updateTable(table._id, table);
        setTables((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        setSelectedTable(updated);
      } else {
        const created = await createTable(table);
        setTables((prev) => [...prev, created]);
        setSelectedTable(created);
      }
      setIsEditing(false);
    } catch {
      setError("Error saving table");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove table from map?")) return;
    try {
      await deleteTable(id);
      setTables((prev) => prev.filter((t) => t._id !== id));
      setSelectedTable(null);
    } catch {
      setError("Error deleting table");
    }
  };

  const handleOpen = async (id: string) => {
    try {
      const updated = await openTable(id);
      setTables((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setSelectedTable(updated);
      setIsOrderOpen(true);
    } catch (err: any) {
      setError(err.message || "Error opening table");
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeTable(id);
      setTables((prev) => prev.map((t) => t._id === id ? { ...t, status: "maintenance" } : t));
      if (selectedTable?._id === id) setSelectedTable({ ...selectedTable, status: "maintenance" });
    } catch (err: any) {
      setError(err.message || "Error closing table");
    }
  };

  /* =========================
     STATS
  ========================= */
  const totalCapacity = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);
  const activeTables = tables.filter(t => t.status === "occupied").length;
  
  // Status Colors for Table Inspector
  const getStatusColor = (status: string) => {
    if (status === "available") return "text-[#00FFFF] border-[#00FFFF]/50 bg-[#00FFFF]/10";
    if (status === "occupied") return "text-[#FF007F] border-[#FF007F]/50 bg-[#FF007F]/10";
    if (status === "reserved") return "text-[#D4A340] border-[#D4A340]/50 bg-[#D4A340]/10";
    return "text-gray-400 border-gray-600 bg-gray-800"; // maintenance
  };

  return (
    <div className="flex flex-col h-full bg-void text-white font-mono space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">ZONE EDITOR</h1>
          <p className="text-sm text-gray-500">Configure spatial mapping, table hierarchies, and server assignments in the digital twin environment.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 px-4 py-2 border border-[#00FFFF]/30 bg-[#00FFFF]/5 rounded-lg">
             <MonitorPlay size={16} className="text-[#00FFFF]" />
             <div className="flex flex-col leading-none">
               <span className="text-[#00FFFF] text-[9px] tracking-widest font-bold">LIVE SYNC</span>
               <span className="text-[#00FFFF] text-[9px] tracking-widest">ACTIVE</span>
             </div>
          </div>
          <button className="flex items-center gap-2 border border-obsidian bg-obsidian/40 hover:bg-obsidian/60 hover:text-white px-6 py-2 rounded-lg text-sm font-bold tracking-widest transition">
            <Save size={16} /> SAVE LAYOUT
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
        
        {/* ================= FLOOR PLAN (LEFT) ================= */}
        <div className="flex-1 border border-obsidian/60 bg-obsidian/10 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[500px]">
          
          {/* Blueprint Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#8B5CF6 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          
          <div className="relative w-full h-full p-8 flex flex-wrap gap-6 items-start justify-start overflow-y-auto custom-scrollbar content-start">
             
             {loading ? (
               <div className="text-gray-500 text-sm tracking-widest uppercase">Initializing Layout...</div>
             ) : (
               tables.map((table) => {
                 const isOccupied = table.status === "occupied";
                 const isSelected = selectedTable?._id === table._id;
                 const glow = isOccupied ? "shadow-[0_0_15px_rgba(255,0,127,0.3)] border-[#FF007F]" : "border-[#00FFFF]/40";
                 const selectedGlow = isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-void shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "";
                 
                 return (
                   <div 
                     key={table._id}
                     onClick={() => { setSelectedTable(table); setIsEditing(false); }}
                     className={`w-24 h-24 rounded-xl border bg-void/80 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${glow} ${selectedGlow}`}
                   >
                     <span className={`text-sm font-bold tracking-widest ${isOccupied ? "text-[#FF007F]" : "text-[#00FFFF]"}`}>
                       T-{table.number}
                     </span>
                     <div className="mt-2 text-gray-500 flex items-center gap-1">
                       <span className="text-[10px]">{table.capacity} PAX</span>
                     </div>
                     {isOccupied && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FF007F] rounded-full animate-pulse" />}
                   </div>
                 );
               })
             )}

          </div>

          {/* Map Controls */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button className="w-8 h-8 rounded bg-obsidian/80 border border-obsidian flex items-center justify-center hover:bg-gray-700 transition"><Plus size={14} /></button>
            <button className="w-8 h-8 rounded bg-obsidian/80 border border-obsidian flex items-center justify-center hover:bg-gray-700 transition"><RotateCcw size={14} /></button>
          </div>
        </div>

        {/* ================= TABLE INSPECTOR (RIGHT) ================= */}
        <div className="w-full xl:w-96 flex flex-col gap-6">
          <div className="flex-1 border border-obsidian/60 bg-void/50 rounded-xl p-6 shadow-glass overflow-y-auto custom-scrollbar">
            
            <h2 className="text-sm font-bold tracking-widest text-white flex items-center gap-2 mb-8 uppercase">
               <span className="text-[#8B5CF6]">📝</span> TABLE INSPECTOR
            </h2>

            {selectedTable ? (
              isEditing ? (
                <div className="animate-fade-in">
                  <TableForm
                    table={selectedTable}
                    onSave={handleSave}
                    onClose={() => setIsEditing(false)}
                    existingTables={tables}
                  />
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* SELECTION INFO */}
                  <div className="bg-obsidian/30 border border-obsidian p-4 rounded-xl flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${getStatusColor(selectedTable.status)}`}>
                       <span className="text-xl">🪑</span>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#00FFFF] tracking-widest font-bold uppercase">Selection</p>
                      <p className="text-xl font-bold tracking-wider text-white">Table {selectedTable.number}</p>
                    </div>
                  </div>

                  {/* TABLE STATUS */}
                  <div>
                    <p className="text-[10px] text-gray-500 tracking-widest font-bold mb-3 uppercase">Table Status</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`flex flex-col items-center justify-center py-3 border rounded-lg ${selectedTable.status === "available" ? getStatusColor("available") : "border-obsidian bg-obsidian/20 text-gray-500"}`}>
                         <CheckCircle2 size={16} className="mb-1" />
                         <span className="text-[9px] font-bold tracking-widest">ACTIVE</span>
                      </div>
                      <div className={`flex flex-col items-center justify-center py-3 border rounded-lg ${selectedTable.status === "occupied" ? getStatusColor("occupied") : "border-obsidian bg-obsidian/20 text-gray-500"}`}>
                         <Users size={16} className="mb-1" />
                         <span className="text-[9px] font-bold tracking-widest">OCCUP.</span>
                      </div>
                      <div className={`flex flex-col items-center justify-center py-3 border rounded-lg ${selectedTable.status === "maintenance" ? getStatusColor("maintenance") : "border-obsidian bg-obsidian/20 text-gray-500"}`}>
                         <Trash2 size={16} className="mb-1" />
                         <span className="text-[9px] font-bold tracking-widest">MAINT.</span>
                      </div>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div>
                    <p className="text-[10px] text-gray-500 tracking-widest font-bold mb-3 uppercase">Details</p>
                    <div className="bg-obsidian/20 border border-obsidian rounded-lg p-3 space-y-2">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">Capacity</span>
                          <span className="font-bold text-white">{selectedTable.capacity} PAX</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">Location</span>
                          <span className="font-bold text-white capitalize">{selectedTable.location || "Indoor"}</span>
                       </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="pt-4 border-t border-obsidian/40 flex flex-col gap-3">
                     {selectedTable.status === "available" && (
                       <button onClick={() => handleOpen(selectedTable._id!)} className="w-full bg-[#00FFFF]/10 border border-[#00FFFF]/30 hover:bg-[#00FFFF]/20 text-[#00FFFF] py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                         Open Table Session
                       </button>
                     )}
                     {selectedTable.status === "occupied" && (
                       <button onClick={() => setIsOrderOpen(true)} className="w-full bg-[#FF007F]/10 border border-[#FF007F]/30 hover:bg-[#FF007F]/20 text-[#FF007F] py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition shadow-[0_0_10px_rgba(255,0,127,0.1)]">
                         Manage Orders
                       </button>
                     )}
                     {(selectedTable.status === "occupied" || selectedTable.status === "available") && (
                       <button onClick={() => handleClose(selectedTable._id!)} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition border border-gray-700">
                         Set to Maintenance
                       </button>
                     )}

                     <div className="grid grid-cols-2 gap-3 mt-2">
                       <button onClick={() => setIsEditing(true)} className="bg-obsidian/50 hover:bg-obsidian border border-obsidian/80 text-white py-2 rounded-lg text-xs font-bold tracking-widest transition uppercase">
                         Edit
                       </button>
                       <button onClick={() => handleDelete(selectedTable._id!)} className="bg-bar-red/10 hover:bg-bar-red/20 border border-bar-red/30 text-bar-red py-2 rounded-lg text-xs font-bold tracking-widest transition uppercase">
                         Remove
                       </button>
                     </div>
                  </div>

                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                 <MonitorPlay className="w-12 h-12 text-gray-600 mb-4" />
                 <p className="text-[10px] tracking-widest uppercase font-bold text-gray-500">NO TABLE SELECTED</p>
                 <p className="text-[9px] text-gray-600 mt-2 text-center max-w-[200px]">Click a table on the floor plan to inspect its telemetry and manage operations.</p>
              </div>
            )}

          </div>

          {/* ELEMENT LIBRARY */}
          <div className="border border-obsidian/60 bg-void/50 rounded-xl p-6 shadow-glass">
            <p className="text-[10px] text-gray-500 tracking-widest font-bold mb-4 uppercase">Element Library</p>
            <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => {
                   setSelectedTable({ number: Math.max(...tables.map(t => t.number || 0), 0) + 1, capacity: 2, status: "available", location: "indoor" });
                   setIsEditing(true);
                 }}
                 className="bg-obsidian/30 border border-obsidian hover:border-gray-500 text-white p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition"
               >
                 <Plus size={16} className="text-[#8B5CF6]" />
                 <span className="text-[9px] font-bold tracking-widest">ADD TABLE</span>
               </button>
               <button className="bg-obsidian/30 border border-obsidian hover:border-gray-500 text-white p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition opacity-50 cursor-not-allowed">
                 <span className="text-[#00FFFF]">⌘</span>
                 <span className="text-[9px] font-bold tracking-widest">NEW ZONE</span>
               </button>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM STATS */}
      <div className="grid grid-cols-3 border-t border-obsidian/40 pt-6">
         <div>
            <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-1">Total Capacity</p>
            <p className="text-2xl font-black text-[#FF007F]">{totalCapacity} Pax</p>
         </div>
         <div>
            <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-1">Active Units</p>
            <p className="text-2xl font-black text-[#00FFFF]">{activeTables}</p>
         </div>
         <div>
            <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-1">Tables Configured</p>
            <p className="text-2xl font-black text-white">{tables.length}</p>
         </div>
      </div>

      {/* ORDER MODAL */}
      {isOrderOpen && selectedTable && (
        <OrderForm
          tableId={selectedTable._id!}
          tableNumber={selectedTable.number}
          sessionId={selectedTable.currentSessionId || ""}
          onClose={() => setIsOrderOpen(false)}
          onSuccess={fetchTables}
        />
      )}

    </div>
  );
}