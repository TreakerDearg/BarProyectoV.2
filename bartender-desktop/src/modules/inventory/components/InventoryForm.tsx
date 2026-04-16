import { useEffect, useState } from "react";
import type { InventoryItem } from "../types/inventory";

interface Props {
  item?: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}

const EMPTY_FORM: InventoryItem = {
  name: "",
  quantity: 0,
  unit: "",
  minStock: 0,
  cost: 0,
  supplier: "",
};

export default function InventoryForm({
  item,
  onSave,
  onClose,
}: Props) {
  const [formData, setFormData] = useState<InventoryItem>(EMPTY_FORM);

  //  FIX CLAVE: nunca meter item directo
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name ?? "",
        quantity: Number(item.quantity ?? 0),
        unit: item.unit ?? "",
        minStock: Number(item.minStock ?? 0),
        cost: Number(item.cost ?? 0),
        supplier: item.supplier ?? "",
        _id: item._id,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [item]);

  //  FIX INPUT CONTROLADO
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-xl w-[400px]"
      >
        <h2 className="text-xl font-bold mb-4">
          {item ? "Editar Insumo" : "Nuevo Insumo"}
        </h2>

        <input
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          className="input"
        />

        <input
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          className="input"
        />

        <input
          name="unit"
          placeholder="Unidad"
          value={formData.unit}
          onChange={handleChange}
          className="input"
        />

        <input
          name="minStock"
          type="number"
          value={formData.minStock}
          onChange={handleChange}
          className="input"
        />

        <input
          name="cost"
          type="number"
          value={formData.cost}
          onChange={handleChange}
          className="input"
        />

        <input
          name="supplier"
          placeholder="Proveedor"
          value={formData.supplier}
          onChange={handleChange}
          className="input"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="btn-gray">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}