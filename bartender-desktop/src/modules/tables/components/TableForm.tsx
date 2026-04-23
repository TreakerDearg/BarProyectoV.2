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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity"
          ? Math.max(1, Number(value))
          : value,
    }));
  };

  /* =========================
     TAG NORMALIZER
  ========================= */
  const normalizeTag = (tag: string) =>
    tag.trim().toLowerCase();

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
     SUBMIT (SAFE POS RULES)
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

      // 🔥 IMPORTANTE: no forzar status en edición
      status: table ? formData.status : "available",
    });
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <form className="bg-gray-900 w-[450px] p-6 rounded-xl space-y-4 border border-gray-800">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {table ? "Editar Mesa" : `Nueva Mesa #${nextTableNumber}`}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* NUMBER */}
        <input
          value={table ? formData.number : nextTableNumber}
          disabled
          className="w-full p-2 bg-gray-800 rounded opacity-70"
        />

        {/* CAPACITY */}
        <input
          type="number"
          name="capacity"
          min={1}
          value={formData.capacity}
          onChange={handleChange}
          className="w-full p-2 bg-gray-800 rounded"
        />

        {/* LOCATION */}
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 bg-gray-800 rounded"
        >
          <option value="indoor">Interior</option>
          <option value="outdoor">Exterior</option>
          <option value="bar">Barra</option>
        </select>

        {/* NOTES */}
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          className="w-full p-2 bg-gray-800 rounded"
        />

        {/* TAGS */}
        <div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 p-2 bg-gray-800 rounded"
            />

            <button
              type="button"
              onClick={addTag}
              className="px-3 bg-amber-500 text-black rounded"
            >
              +
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags?.map((t, i) => (
              <span
                key={i}
                className="bg-gray-800 px-2 py-1 rounded text-xs flex gap-2"
              >
                {t.label}
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  className="text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Cancelar
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-amber-500 text-black rounded font-medium"
          >
            Guardar
          </button>
        </div>

      </form>
    </div>
  );
}