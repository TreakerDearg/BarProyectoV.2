import { useEffect, useRef, useState } from "react";
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

import FloorPlan from "../components/FloorPlan";
import TableInspector from "../components/TableInspector.tsx";
import TableStats from "../components/TableStats";
import TableHeader from "../components/TableHeader";

import OrderForm from "../../orders/components/OrderForm";

let socket: Socket;

const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
    });
  }
  return socket;
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  /* =========================
     FETCH
  ========================= */
  const fetchTables = async () => {
    setLoading(true);
    const data = await getTables();
    setTables(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  /* =========================
     SOCKETS
  ========================= */
  useEffect(() => {
    const s = getSocket();
    socketRef.current = s;

    s.on("table:update", (updated: Table) => {
      setTables((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
    });

    s.on("table:created", (t: Table) =>
      setTables((prev) => [...prev, t])
    );

    s.on("table:deleted", (id: string) =>
      setTables((prev) => prev.filter((t) => t._id !== id))
    );

    return () => {
      s.removeAllListeners();
    };
  }, []);

  /* =========================
     ACTIONS
  ========================= */
  const handleOpen = async (id: string) => {
    const updated = await openTable(id);
    setSelectedTable(updated);
    setIsOrderOpen(true);
  };

  const handleClose = async (id: string) => {
    await closeTable(id);
  };

  const handleSave = async (table: Table) => {
    if (table._id) return updateTable(table._id, table);
    return createTable(table);
  };

  const handleDelete = async (id: string) => {
    await deleteTable(id);
    setSelectedTable(null);
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="flex flex-col h-full bg-void text-white space-y-6">

      <TableHeader />

      <div className="flex flex-1 gap-6">

        <FloorPlan
          tables={tables}
          loading={loading}
          selectedTable={selectedTable}
          onSelect={setSelectedTable}
        />

        <TableInspector
          table={selectedTable}
          tables={tables}
          onOpen={handleOpen}
          onClose={handleClose}
          onSave={handleSave}
          onDelete={handleDelete}
          onOrder={() => setIsOrderOpen(true)}
        />

      </div>

      <TableStats tables={tables} />

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