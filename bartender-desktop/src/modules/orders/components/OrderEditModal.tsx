"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus, Minus, Trash2, Loader2, Save } from "lucide-react";
import { getProducts } from "../../products/services/productService";
import { getMenus } from "../../menus/services/menuService";
import { updateOrderItems } from "../services/orderService";
import type { Product } from "../../../types/product";
import type { Menu } from "../../menus/types/menu";
import type { Order } from "../types/order";

interface LocalItem {
  _id?: string;
  product?: string;
  menu?: string;
  name: string;
  quantity: number;
  price: number;
  type: "drink" | "food" | "menu";
  status?: string;
  notes?: string;
}

interface Props {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderEditModal({ order, onClose, onSuccess }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [items, setItems] = useState<LocalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prodData, menuData] = await Promise.all([
          getProducts(),
          getMenus(),
        ]);
        setProducts(prodData || []);
        setMenus(menuData || []);

        // Convert order items to local items
        const localItems = order.items.map((item) => ({
          _id: item._id,
          product: typeof item.product === "string" ? item.product : item.product?._id,
          menu: typeof item.menu === "string" ? item.menu : undefined,
          name: typeof item.product === "object" ? item.product.name : item.name,
          quantity: item.quantity,
          price: item.price,
          type: item.type,
          status: item.status,
          notes: item.notes,
        }));
        setItems(localItems);
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [order]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const searchLower = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    });
  }, [products, search]);

  const filteredMenus = useMemo(() => {
    return menus.filter((m) => {
      const searchLower = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(searchLower) ||
        m.description?.toLowerCase().includes(searchLower)
      );
    });
  }, [menus, search]);

  const updateQty = (index: number, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((_, i) => i !== index)
        : prev.map((i, idx) => (idx === index ? { ...i, quantity: qty } : i))
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const replaceProduct = (index: number, product: Product) => {
    setItems((prev) =>
      prev.map((i, idx) =>
        idx === index
          ? {
              ...i,
              product: product._id,
              menu: undefined,
              name: product.name,
              price: product.price,
              type: product.type as "drink" | "food",
            }
          : i
      )
    );
    setEditingItemIndex(null);
    setShowProductPicker(false);
    setSearch("");
  };

  const replaceMenu = (index: number, menu: Menu) => {
    setItems((prev) =>
      prev.map((i, idx) =>
        idx === index
          ? {
              ...i,
              menu: menu._id,
              product: undefined,
              name: menu.name,
              price: 0,
              type: "menu",
            }
          : i
      )
    );
    setEditingItemIndex(null);
    setShowProductPicker(false);
    setSearch("");
  };

  const addNewItem = (product: Product) => {
    setItems((prev) => [
      ...prev,
      {
        product: product._id,
        name: product.name,
        quantity: 1,
        price: product.price,
        type: product.type as "drink" | "food",
        status: "pending",
      },
    ]);
    setShowProductPicker(false);
    setSearch("");
  };

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const handleSave = async () => {
    if (items.length === 0) {
      alert("La orden debe tener al menos un item");
      return;
    }

    try {
      setSaving(true);
      await updateOrderItems(order._id!, items);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Error al actualizar la orden");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
      <div className="nebula-luxury-panel w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-ivory">Editar Orden</h2>
            <p className="text-xs text-muted mt-1">
              Modificar items de la orden #{order._id?.slice(-6)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-white/50 hover:text-white transition-all border border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Items List */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item._id || index}
                  className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-cyan/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {editingItemIndex === index ? (
                        <div className="space-y-2">
                          <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar producto..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan/40"
                            autoFocus
                          />
                          {search && (
                            <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                              {filteredProducts.map((p) => (
                                <button
                                  key={p._id}
                                  onClick={() => replaceProduct(index, p)}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan/10 text-sm text-white transition-colors"
                                >
                                  {p.name} - ${p.price}
                                </button>
                              ))}
                              {filteredMenus.map((m) => (
                                <button
                                  key={m._id}
                                  onClick={() => replaceMenu(index, m)}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gold/10 text-sm text-white transition-colors"
                                >
                                  MENÚ: {m.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <h4 className="text-sm font-bold text-white truncate uppercase">
                            {item.name}
                          </h4>
                          <p className="text-xs text-white/50 mt-1">
                            {item.type === "menu" ? "Menú" : item.type === "food" ? "Comida" : "Bebida"}
                          </p>
                          <p className="text-sm font-bold text-cyan-400 mt-1">
                            ${item.price} / unidad
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingItemIndex(index)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                        title="Cambiar producto"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQty(index, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all border border-white/5"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold text-cyan-400 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(index, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-cyan/20 text-white/50 hover:text-cyan-400 transition-all border border-white/5"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all"
                        title="Eliminar item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Item Button */}
            <button
              type="button"
              onClick={() => {
                setShowProductPicker(true);
                setSearch("");
              }}
              className="w-full mt-4 p-4 rounded-xl border border-dashed border-white/20 hover:border-cyan/40 text-white/50 hover:text-cyan-400 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Agregar Item
              </span>
            </button>

            {/* Product Picker for New Item */}
            {showProductPicker && (
              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto para agregar..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan/40 mb-3"
                  autoFocus
                />
                {search && (
                  <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                    {filteredProducts.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => addNewItem(p)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan/10 text-sm text-white transition-colors"
                      >
                        {p.name} - ${p.price}
                      </button>
                    ))}
                    {filteredMenus.map((m) => (
                      <button
                        key={m._id}
                        onClick={() => addNewItem(m as any)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gold/10 text-sm text-white transition-colors"
                      >
                        MENÚ: {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="w-64 p-6 border-l border-white/10 bg-black/20">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">
              Resumen
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Items</span>
                <span className="text-sm font-bold text-white">{items.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Total</span>
                <span className="text-lg font-bold text-cyan-400">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={handleSave}
                disabled={saving || items.length === 0}
                className={`
                  w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2
                  ${saving || items.length === 0
                    ? "bg-white/5 text-white/50 border border-white/10 opacity-50"
                    : "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500 shadow-lg shadow-cyan/20"
                  }
                `}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
