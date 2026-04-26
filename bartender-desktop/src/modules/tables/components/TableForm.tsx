import { useEffect, useState, useMemo } from "react";
import { Table as TableIcon, Users, MapPin, Wrench } from "lucide-react";
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
  orders: [],
};

/* =========================
   STATUS CONFIG (🔥 CLAVE)
========================= */
const statusConfig = {
  available: {
    label: "AVAILABLE",
    color: "bg-green-500/10 border-green-500/30 text-green-400",
  },
  occupied: {
    label: "OCCUPIED",
    color: "bg-red-500/10 border-red-500/30 text-red-400",
  },
  reserved: {
    label: "RESERVED",
    color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  },
  maintenance: {
    label: "MAINTENANCE",
    color: "bg-gray-500/10 border-gray-500/30 text-gray-400",
  },
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
     NEXT NUMBER
  ========================= */
  const nextTableNumber = useMemo(() => {
    const numbers = existingTables.map((t) => t.number || 0);
    return numbers.length ? Math.max(...numbers) + 1 : 1;
  }, [existingTables]);

  /* =========================
     LOAD
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
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity" ? Math.max(1, Number(value)) : value,
    }));
  };

  /* =========================
     STATUS CHANGE (🔥 UI)
  ========================= */
  const setStatus = (status: Table["status"]) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  /* =========================
     TAGS
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
      setError("Capacidad inválida");
      return;
    }

    onSave({
      ...formData,
      number: table ? formData.number : nextTableNumber,
    });
  };

  /* =========================
     UI
  ========================= */
  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">

      {/* PREVIEW 🔥 */}
      <div className={`p-4 rounded-xl border ${statusConfig[formData.status].color}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400">TABLE</p>
            <p className="text-2xl font-black">
              T-{formData.number || nextTableNumber}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400">STATUS</p>
            <p className="text-sm font-bold">
              {statusConfig[formData.status].label}
            </p>
          </div>
        </div>
      </div>

      {/* CAPACITY */}
      <Input
        icon={<Users size={14} />}
        name="capacity"
        type="number"
        value={formData.capacity}
        onChange={handleChange}
        label="Capacity"
      />

      {/* LOCATION */}
      <div>
        <Label>Zone</Label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="input"
        >
          <option value="indoor">MAIN FLOOR</option>
          <option value="outdoor">TERRACE</option>
          <option value="bar">BAR</option>
          <option value="lounge">VIP</option>
        </select>
      </div>

      {/* STATUS SELECTOR 🔥 */}
      <div>
        <Label>Status</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(statusConfig).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatus(key as Table["status"])}
              className={`p-2 rounded border text-xs font-bold transition ${
                formData.status === key
                  ? s.color
                  : "border-obsidian text-gray-500"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* NOTES */}
      <div>
        <Label>Notes</Label>
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          className="input resize-none"
          rows={3}
        />
      </div>

      {/* TAGS */}
      <div>
        <Label>Tags</Label>

        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="input flex-1"
            placeholder="vip / window / birthday..."
          />
          <button type="button" onClick={addTag} className="btn">
            +
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags?.map((t, i) => (
            <span
              key={i}
              className="px-2 py-1 text-[10px] bg-obsidian border border-obsidian rounded flex gap-1"
            >
              {t.label}
              <button onClick={() => removeTag(i)}>×</button>
            </span>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="text-red-400 text-xs border border-red-500/30 p-2 rounded">
          {error}
        </div>
      )}

      {/* ACTIONS */}
      <div className="mt-auto flex gap-3 pt-4 border-t border-obsidian">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>

        <button type="submit" className="btn-primary">
          {table ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

/* =========================
   UI HELPERS
========================= */

function Label({ children }: any) {
  return (
    <p className="text-[10px] text-gray-400 uppercase mb-2 font-bold tracking-widest">
      {children}
    </p>
  );
}

function Input({ icon, label, ...props }: any) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <div className="absolute left-2 top-2.5 text-gray-500">
          {icon}
        </div>
        <input {...props} className="input pl-8" />
      </div>
    </div>
  );
}