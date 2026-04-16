import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import MenuCard from "../components/MenuCard";
import MenuForm from "../components/MenuForm";
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from "../../../services/menuService";
import type { Menu } from "../../../types/menu";

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMenus = async () => {
    const data = await getMenus();
    setMenus(data);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleSave = async (menu: Menu) => {
    if (menu._id) {
      await updateMenu(menu._id, menu);
    } else {
      await createMenu(menu);
    }
    setIsModalOpen(false);
    setSelectedMenu(null);
    fetchMenus();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar menú?")) {
      await deleteMenu(id);
      fetchMenus();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menús</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg"
        >
          <Plus size={18} /> Nuevo Menú
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {menus.map((menu) => (
          <MenuCard
            key={menu._id}
            menu={menu}
            onEdit={(m) => {
              setSelectedMenu(m);
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isModalOpen && (
        <MenuForm
          menu={selectedMenu}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMenu(null);
          }}
        />
      )}
    </div>
  );
}