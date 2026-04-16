import { Pencil, Trash2 } from "lucide-react";
import type { Menu } from "../../../types/menu";

interface Props {
  menu: Menu;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
}

export default function MenuCard({ menu, onEdit, onDelete }: Props) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold">{menu.name}</h3>
      <p className="text-sm text-gray-400">{menu.description}</p>

      <div className="flex justify-between items-center mt-3">
        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
          {menu.category}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded ${
            menu.available
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {menu.available ? "Disponible" : "No Disponible"}
        </span>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => onEdit(menu)}
          className="p-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => onDelete(menu._id!)}
          className="p-2 bg-red-500 rounded hover:bg-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}