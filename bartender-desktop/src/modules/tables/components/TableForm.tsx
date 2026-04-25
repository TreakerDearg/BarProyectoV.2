import { useEffect, useMemo, useState } from "react";
import type { Table } from "../types/table";

interface Props {
  table?: Table | null;
  onSave: (table: Table) => void;
  onClose: () => void;
  existingTables?: Table[];
}

const emptyTable: Table = {
  number: 0,
  capacity: 1,
  status: "available",
  location: "indoor",
  notes: "",
  tags: [],
  _id: "",
  orders: []
};

export default function TableForm({
  table,
  onSave,
  onClose,
  existingTables = [],
}: Props) {
  const [formData, setFormData] = useState<Table>(emptyTable);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  /* =========================
     SAFE NEXT NUMBER
  ========================= */
  const nextTableNumber = useMemo(() => {
    const numbers = existingTables.map((t) => t.number || 0);
    return numbers.length ? Math.max(...numbers) + 1 : 1;
  }, [existingTables]);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    if (table) {
      setFormData({
        ...emptyTable,
        ...table,
        tags: table.tags || [],
      });
    } else {
      setFormData({
        ...emptyTable,
        number: nextTableNumber,
        status: "available",
      });
    }
  }, [table, nextTableNumber]);

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity" ? Math.max(1, Number(value)) : value,
    }));
  };

  /* =========================
     TAG NORMALIZER
  ========================= */
  const normalizeTag = (tag: string) => tag.trim().toLowerCase();

  const addTag = () => {
    const value = normalizeTag(tagInput);
    if (!value) return;

    const exists = formData.tags?.some(
      (t) => normalizeTag(t.label) === value
    );

    if (exists) return;

    setFormData((prev) => ({
      ...prev,
      tags: [
        ...(prev.tags || []),
        {
          label: value,
          type: "other",
          priority: "low",
        },
      ],
    }));

    setTagInput("");
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index),
    }));
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.capacity < 1) {
      setError("La capacidad debe ser mayor a 0");
      return;
    }

    onSave({
      ...formData,
      number: table ? formData.number : nextTableNumber,
      status: table ? formData.status : "available",
    });
  };

  /* =========================
     UI
  ========================= */
  return (
    <form className="flex flex-col h-full space-y-5" onSubmit={handleSubmit}>
      {/* ID */}
      <div>
        <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-2">
          Table Identifier
        </p>

        <div className="flex gap-3">
          <div className="flex-1 bg-obsidian/30 border border-obsidian rounded-lg p-2.5 flex items-center">
            <span className="text-[#00FFFF] font-bold mr-2">T-</span>
            <input
              value={table ? formData.number : nextTableNumber}
              disabled
              className="bg-transparent text-white font-bold tracking-widest w-full outline-none opacity-70 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* CAPACITY */}
      <div>
        <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-2">
          Capacity (PAX)
        </p>
        <input
          type="number"
          name="capacity"
          min={1}
          value={formData.capacity}
          onChange={handleChange}
          className="w-full bg-obsidian/30 border border-obsidian rounded-lg p-2.5 text-white outline-none"
        />
      </div>

      {/* LOCATION */}
      <div>
        <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-2">
          Zone Assignment
        </p>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full bg-obsidian/30 border border-obsidian rounded-lg p-2.5 text-white outline-none cursor-pointer"
        >
          <option value="indoor">ZONE 01: MAIN FLOOR</option>
          <option value="outdoor">ZONE 02: TERRACE</option>
          <option value="bar">ZONE 03: BAR HIGH</option>
          <option value="lounge">ZONE 04: VIP LOUNGE</option>
        </select>
      </div>

      {/* NOTES */}
      <div>
        <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-2">
          Operational Notes
        </p>
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          rows={3}
          className="w-full bg-obsidian/30 border border-obsidian rounded-lg p-2.5 text-white text-xs outline-none resize-none"
        />
      </div>

      {/* TAGS */}
      <div>
        <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase mb-2">
          Element Tags
        </p>

        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            className="flex-1 bg-obsidian/30 border border-obsidian rounded-lg p-2 text-xs text-white outline-none uppercase"
            placeholder="ADD TAG..."
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 bg-obsidian/50 border border-obsidian rounded-lg text-white"
          >
            +
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {formData.tags?.map((t, i) => (
            <span
              key={i}
              className="bg-obsidian/50 border border-obsidian px-2 py-1 rounded text-[9px] uppercase flex gap-2"
            >
              {t.label}
              <button type="button" onClick={() => removeTag(i)}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="text-red-400 text-[10px] border border-red-500/30 p-2 rounded">
          ERR: {error}
        </div>
      )}

      {/* ACTIONS */}
      <div className="mt-auto pt-4 border-t border-obsidian/40 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-obsidian/50 border border-obsidian text-white py-3 rounded-lg text-xs uppercase"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="flex-1 bg-[#8B5CF6] text-white py-3 rounded-lg text-xs uppercase"
        >
          {table ? "Update" : "Deploy"}
        </button>
      </div>
    </form>
  );
}