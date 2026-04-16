"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  getMenus,
  createMenu,
  deleteMenu,
} from "@/services/menuService";
import { getProducts } from "@/services/productService";
import { Menu, Product } from "@/types/menu";

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menusData, productsData] = await Promise.all([
        getMenus(),
        getProducts(),
      ]);

      setMenus(menusData);
      setProducts(productsData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!name || selectedProducts.length === 0) return;

    try {
      await createMenu({
        name,
        products: selectedProducts,
      });

      setName("");
      setSelectedProducts([]);
      loadData();
    } catch (error) {
      console.error("Error al crear el menú:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenu(id);
      loadData();
    } catch (error) {
      console.error("Error al eliminar el menú:", error);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl neon-text mb-6">MENÚS</h1>

      {/* CREAR MENÚ */}
      <div className="card mb-6">
        <input
          placeholder="Nombre del menú"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {products.map((p) => (
            <label key={p._id} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={selectedProducts.includes(p._id)}
                onChange={() => toggleProduct(p._id)}
              />
              {p.name}
            </label>
          ))}
        </div>

        <button
          onClick={handleCreate}
          className="bg-[var(--neon-purple)] px-4 py-2 rounded"
        >
          Crear Menú
        </button>
      </div>

      {/* LISTA DE MENÚS */}
      {loading ? (
        <p className="text-zinc-400">Cargando menús...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {menus.map((menu) => (
            <div key={menu._id} className="card">
              <h2 className="neon-cyan">{menu.name}</h2>

              <ul className="text-sm text-zinc-400">
                {menu.products.map((p) => (
                  <li key={p._id}>• {p.name}</li>
                ))}
              </ul>

              <button
                onClick={() => handleDelete(menu._id)}
                className="text-red-400 mt-2"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}