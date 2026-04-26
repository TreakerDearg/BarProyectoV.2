"use client";

import { useState } from "react";
import {
  Play,
  Wrench,
  Pencil,
  Trash2,
  ClipboardList,
} from "lucide-react";

import TableForm from "./TableForm";
import type { Table } from "../types/table";

/* =========================
   PROPS TYPED
========================= */
interface Props {
  table: Table | null;
  tables: Table[];
  onOpen: (id: string) => void;
  onClose: (id: string) => void;
  onSave: (table: Table) => void;
  onDelete: (id: string) => void;
  onOrder: () => void;
}

/* =========================
   STATUS STYLES
========================= */
const statusStyles: Record<string, string> = {
  available: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  occupied: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  reserved: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  maintenance: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

/* =========================
   COMPONENT
========================= */
export default function TableInspector({
  table,
  tables,
  onOpen,
  onClose,
  onSave,
  onDelete,
  onOrder,
}: Props) {
  const [editing, setEditing] = useState(false);

  /* =========================
     EMPTY STATE
  ========================= */
  if (!table) {
    return (
      <div className="w-80 border border-obsidian rounded-xl p-6 text-center text-gray-500">
        <p className="text-xs tracking-widest uppercase">
          No table selected
        </p>
      </div>
    );
  }

  /* =========================
     EDIT MODE
  ========================= */
  if (editing) {
    return (
      <div className="w-80">
        <TableForm
          table={table}
          existingTables={tables}
          onSave={(t) => {
            onSave(t);
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      </div>
    );
  }

  /* =========================
     VIEW MODE
  ========================= */
  return (
    <div className="w-80 border border-obsidian rounded-xl p-5 space-y-5 bg-void/60 backdrop-blur">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold tracking-wide">
          Table {table.number}
        </h2>

        <span
          className={`text-[10px] px-2 py-1 rounded border uppercase tracking-widest ${
            statusStyles[table.status] || statusStyles.maintenance
          }`}
        >
          {table.status}
        </span>
      </div>

      {/* INFO */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Capacity</span>
          <span className="text-white font-bold">
            {table.capacity} pax
          </span>
        </div>

        <div className="flex justify-between text-gray-400">
          <span>Location</span>
          <span className="text-white font-bold capitalize">
            {table.location}
          </span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col gap-2 pt-3 border-t border-obsidian">

        {table.status === "available" && (
          <button
            onClick={() => onOpen(table._id!)}
            className="flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 py-2 rounded-lg text-xs uppercase font-bold hover:bg-cyan-500/20 transition"
          >
            <Play size={14} />
            Open Table
          </button>
        )}

        {table.status === "occupied" && (
          <button
            onClick={onOrder}
            className="flex items-center justify-center gap-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 py-2 rounded-lg text-xs uppercase font-bold hover:bg-pink-500/20 transition"
          >
            <ClipboardList size={14} />
            Manage Orders
          </button>
        )}

        <button
          onClick={() => onClose(table._id!)}
          className="flex items-center justify-center gap-2 bg-gray-700/40 border border-gray-600 text-gray-300 py-2 rounded-lg text-xs uppercase font-bold hover:bg-gray-700 transition"
        >
          <Wrench size={14} />
          Maintenance
        </button>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center justify-center gap-1 bg-obsidian border border-obsidian text-white py-2 rounded-lg text-xs uppercase font-bold hover:bg-gray-800 transition"
          >
            <Pencil size={12} />
            Edit
          </button>

          <button
            onClick={() => onDelete(table._id!)}
            className="flex items-center justify-center gap-1 bg-red-500/10 border border-red-500/30 text-red-400 py-2 rounded-lg text-xs uppercase font-bold hover:bg-red-500/20 transition"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}