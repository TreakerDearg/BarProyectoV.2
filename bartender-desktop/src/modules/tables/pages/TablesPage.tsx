"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  RefreshCcw,
  Search,
  LayoutGrid,
} from "lucide-react";

import TableCard from "../components/TableCard";
import TableForm from "../components/TableForm";
import OrderForm from "../../orders/components/OrderForm";

import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  openTable,
  closeTable,
} from "../services/tableService";

import type { Table } from "../types/table";
import { io, Socket } from "socket.io-client";

/* =========================
   SOCKET SINGLETON (FIX REAL)
========================= */
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

  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "available" | "occupied" | "reserved" | "maintenance"
  >("all");

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
      setError("No se pudieron cargar las mesas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  /* =========================
     SOCKET INIT (ONLY ONCE)
  ========================= */
  useEffect(() => {
    const s = getSocket();
    socketRef.current = s;

    /* =========================
       TABLE UPDATE (PATCH STYLE)
    ========================= */
    const handleUpdate = (updated: Table) => {
      setTables((prev) => {
        const index = prev.findIndex((t) => t._id === updated._id);

        if (index === -1) return prev;

        const copy = [...prev];
        copy[index] = { ...copy[index], ...updated };

        return copy;
      });
    };

    /* =========================
       TABLE CREATED
    ========================= */
    const handleCreated = (table: Table) => {
      setTables((prev) => [...prev, table]);
    };

    /* =========================
       TABLE DELETED
    ========================= */
    const handleDeleted = (id: string) => {
      setTables((prev) => prev.filter((t) => t._id !== id));
    };

    s.on("table:update", handleUpdate);
    s.on("table:created", handleCreated);
    s.on("table:deleted", handleDeleted);

    return () => {
      s.off("table:update", handleUpdate);
      s.off("table:created", handleCreated);
      s.off("table:deleted", handleDeleted);
    };
  }, []);

  /* =========================
     SAVE (NO REFETCH)
  ========================= */
  const handleSave = async (table: Table) => {
    try {
      if (table._id) {
        const updated = await updateTable(table._id, table);

        setTables((prev) =>
          prev.map((t) => (t._id === updated._id ? updated : t))
        );
      } else {
        const created = await createTable(table);
        setTables((prev) => [...prev, created]);
      }

      setIsFormOpen(false);
      setEditingTable(null);
    } catch {
      setError("Error al guardar mesa");
    }
  };

  /* =========================
     DELETE (OPTIMISTIC)
  ========================= */
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar mesa?")) return;

    try {
      await deleteTable(id);
      setTables((prev) => prev.filter((t) => t._id !== id));
    } catch {
      setError("Error al eliminar mesa");
    }
  };

  /* =========================
     OPEN TABLE
  ========================= */
  const handleOpen = async (table: Table) => {
    try {
      const updated = await openTable(table._id!);

      setTables((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );

      setActiveTable(updated);
      setIsOrderOpen(true);
    } catch (err: any) {
      setError(err.message || "Error al abrir mesa");
    }
  };

  /* =========================
     CLOSE TABLE
  ========================= */
  const handleClose = async (table: Table) => {
    try {
      await closeTable(table._id!);

      // backend hará transición automática
      setTables((prev) =>
        prev.map((t) =>
          t._id === table._id
            ? { ...t, status: "maintenance" }
            : t
        )
      );
    } catch (err: any) {
      setError(err.message || "Error al cerrar mesa");
    }
  };

  /* =========================
     SELECT TABLE
  ========================= */
  const handleSelectTable = (table: Table) => {
    setError(null);

    if (table.status === "reserved") {
      return setError("Mesa reservada");
    }

    if (table.status === "maintenance") {
      return setError("Mesa en mantenimiento");
    }

    if (table.status === "available") {
      return handleOpen(table);
    }

    if (table.status === "occupied") {
      setActiveTable(table);
      setIsOrderOpen(true);
    }
  };

  /* =========================
     FILTER
  ========================= */
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchSearch =
        String(t.number).includes(search) ||
        t.location?.toLowerCase().includes(search.toLowerCase());

      const matchFilter = filter === "all" || t.status === filter;

      return matchSearch && matchFilter;
    });
  }, [tables, search, filter]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid size={22} />
            Mesas
          </h1>
          <p className="text-gray-500 text-sm">
            POS en tiempo real
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchTables}
            className="p-2 bg-gray-800 rounded-lg"
          >
            <RefreshCcw size={18} />
          </button>

          <button
            onClick={() => {
              setEditingTable({
                number: Math.max(...tables.map((t) => t.number || 0), 0) + 1,
                capacity: 1,
                status: "available",
                location: "indoor",
                notes: "",
                tags: [],
              });

              setIsFormOpen(true);
            }}
            className="bg-amber-500 text-black px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Nueva
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-gray-900 px-3 rounded-lg w-full">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar mesa..."
            className="bg-transparent w-full p-2 outline-none"
          />
        </div>

        {(["all", "available", "occupied", "reserved", "maintenance"] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-sm border ${
                filter === f
                  ? "bg-amber-500 text-black"
                  : "bg-gray-900 text-gray-400"
              }`}
            >
              {f}
            </button>
          )
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 text-red-300 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => (
          <TableCard
            key={table._id}
            table={table}
            onSelect={handleSelectTable}
            onEdit={(t) => {
              setEditingTable(t);
              setIsFormOpen(true);
            }}
            onDelete={handleDelete}
            onOpenTable={() => handleOpen(table)}
            onCloseTable={() => handleClose(table)}
          />
        ))}
      </div>

      {/* FORM */}
      {isFormOpen && (
        <TableForm
          table={editingTable}
          onSave={handleSave}
          onClose={() => setIsFormOpen(false)}
          existingTables={tables}
        />
      )}

      {/* ORDER */}
      {isOrderOpen && activeTable && (
        <OrderForm
          tableId={activeTable._id!}
          tableNumber={activeTable.number}
          sessionId={activeTable.currentSessionId || ""}
          onClose={() => {
            setIsOrderOpen(false);
            setActiveTable(null);
          }}
          onSuccess={fetchTables}
        />
      )}
    </div>
  );
}