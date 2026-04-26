"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";

import MenuCard from "../components/MenuCard";
import MenuForm from "../components/MenuForm";

import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from "../../../services/menuService";

import type { Menu } from "../../../types/menu";

/* ============================== */
export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  /* ==============================
     LOAD MENUS
  ============================== */
  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMenus();
      setMenus(data);
      setFilteredMenus(data);
    } catch (err) {
      console.error("Error loading menus", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  /* ==============================
     SEARCH FILTER
  ============================== */
  useEffect(() => {
    if (!search.trim()) {
      setFilteredMenus(menus);
      return;
    }

    const lower = search.toLowerCase();

    setFilteredMenus(
      menus.filter((m) =>
        m.name.toLowerCase().includes(lower)
      )
    );
  }, [search, menus]);

  /* ==============================
     SAVE
  ============================== */
  const handleSave = async (menu: Menu) => {
    try {
      if (menu._id) {
        await updateMenu(menu._id, menu);
      } else {
        await createMenu(menu);
      }

      await fetchMenus();
      closeModal();
    } catch (err) {
      console.error("Save error", err);
    }
  };

  /* ==============================
     DELETE
  ============================== */
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar menú?")) return;

    try {
      await deleteMenu(id);
      await fetchMenus();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  /* ==============================
     MODAL CONTROL
  ============================== */
  const openCreate = () => {
    setSelectedMenu(null);
    setIsModalOpen(true);
  };

  const openEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMenu(null);
    setIsModalOpen(false);
  };

  /* ============================== */
  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            MENUS CONTROL
          </h1>
          <p className="text-xs text-gray-500">
            Gestión de cartas y configuraciones
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2 rounded-xl
            bg-gradient-to-r from-amber-400 to-yellow-300
            text-black font-bold shadow-lg
            hover:scale-[1.03] active:scale-[0.97]
            transition-all"
        >
          <Plus size={16} />
          NUEVO MENÚ
        </button>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar menú..."
          className="
            w-full pl-9 pr-3 py-2 text-sm
            bg-[#020617] border border-gray-800 rounded-lg
            focus:outline-none focus:border-amber-400/50
            text-white placeholder-gray-500
          "
        />
      </div>

      {/* ================= CONTENT ================= */}
      {loading ? (
        <div className="text-gray-500 text-sm">
          Cargando menús...
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No hay menús disponibles
        </div>
      ) : (
        <div className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          xl:grid-cols-4 
          gap-5
        ">
          {filteredMenus.map((menu) => (
            <MenuCard
              key={menu._id}
              menu={menu}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <MenuForm
          menu={selectedMenu}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}