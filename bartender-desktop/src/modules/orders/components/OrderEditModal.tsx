"use client";

/**
 * OrderEditModal — Modal para editar ítems de una orden existente.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * AÑADIDO: input de notas por ítem (modificaciones especiales).
 */
import { useEffect, useMemo, useState } from "react";
import { X, Plus, Minus, Trash2, Loader2, Save, MessageSquare, Pencil } from "lucide-react";
import { getProducts }     from "../../products/services/productService";
import { getMenus }        from "../../menus/services/menuService";
import { updateOrderItems } from "../services/orderService";
import type { Product }    from "../../../types/product";
import type { Menu }       from "../../menus/types/menu";
import type { Order }      from "../types/order";

interface LocalItem {
  _id?:     string;
  product?: string;
  menu?:    string;
  name:     string;
  quantity: number;
  price:    number;
  type:     "drink" | "food" | "menu";
  status?:  string;
  notes?:   string;
}

interface Props {
  order:     Order;
  onClose:   () => void;
  onSuccess: () => void;
}

export default function OrderEditModal({ order, onClose, onSuccess }: Props) {
  const [products, setProducts]     = useState<Product[]>([]);
  const [menus, setMenus]           = useState<Menu[]>([]);
  const [items, setItems]           = useState<LocalItem[]>([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [editingItemIndex, setEditingItemIndex]   = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prodData, menuData] = await Promise.all([getProducts(), getMenus()]);
        setProducts(prodData || []);
        setMenus(menuData   || []);

        const localItems = order.items.map((item) => ({
          _id:      item._id,
          product:  typeof item.product === "string" ? item.product : item.product?._id,
          menu:     typeof item.menu    === "string" ? item.menu    : undefined,
          name:     typeof item.product === "object" ? (item.product as any).name : item.name,
          quantity: item.quantity,
          price:    item.price,
          type:     item.type,
          status:   item.status,
          notes:    item.notes,
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

  const filteredProducts = useMemo(
    () => products.filter((p) => {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) ||
             p.description?.toLowerCase().includes(q) ||
             p.category?.toLowerCase().includes(q);
    }),
    [products, search]
  );

  const filteredMenus = useMemo(
    () => menus.filter((m) => {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) ||
             m.description?.toLowerCase().includes(q);
    }),
    [menus, search]
  );

  /* ── Mutaciones del estado de ítems ─────────────────────── */
  const updateQty = (index: number, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((_, i) => i !== index)
        : prev.map((it, i) => (i === index ? { ...it, quantity: qty } : it))
    );
  };

  const updateNotes = (index: number, value: string) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, notes: value } : it))
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const replaceProduct = (index: number, product: Product) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? { ...it, product: product._id, menu: undefined, name: product.name, price: product.price, type: product.type as "drink" | "food" }
          : it
      )
    );
    setEditingItemIndex(null);
    setSearch("");
  };

  const replaceMenu = (index: number, menu: Menu) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? { ...it, menu: menu._id, product: undefined, name: menu.name, price: 0, type: "menu" as const }
          : it
      )
    );
    setEditingItemIndex(null);
    setSearch("");
  };

  const addNewItem = (product: Product) => {
    setItems((prev) => [
      ...prev,
      { product: product._id, name: product.name, quantity: 1, price: product.price, type: product.type as "drink" | "food", status: "pending" },
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
      alert("La orden debe tener al menos un ítem");
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

  /* ── Loading state ──────────────────────────────────────── */
  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: "#F0B429" }} />
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#1C2333", border: "1px solid #30363D" }}
      >

        {/* ── Modal Header ──────────────────────────────── */}
        <div
          className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid #30363D" }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#E6EDF3" }}>
              Editar comanda
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#566270" }}>
              #{order._id?.slice(-6)} · Modifica ítems y modificaciones especiales
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "#21283A", border: "1px solid #30363D", color: "#566270" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Contenido ─────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* Lista de ítems */}
          <div
            className="flex-1 p-6 overflow-y-auto"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item._id || index}
                  className="p-4 rounded-xl transition-colors"
                  style={{ background: "#21283A", border: "1px solid #30363D" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {editingItemIndex === index ? (
                        /* Buscador inline */
                        <div className="space-y-2">
                          <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar producto…"
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                            style={{ background: "#293042", border: "1px solid #30363D", color: "#E6EDF3" }}
                            autoFocus
                            onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(240,180,41,0.50)"; }}
                            onBlur={(e)  => { (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D"; }}
                          />
                          {search && (
                            <div
                              className="max-h-48 overflow-y-auto space-y-1 rounded-lg p-2"
                              style={{ background: "#293042", border: "1px solid #30363D" }}
                            >
                              {filteredProducts.map((p) => (
                                <button
                                  key={p._id}
                                  onClick={() => replaceProduct(index, p)}
                                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                                  style={{ color: "#E6EDF3" }}
                                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,180,41,0.08)"; }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                                >
                                  {p.name} — ${p.price}
                                </button>
                              ))}
                              {filteredMenus.map((m) => (
                                <button
                                  key={m._id}
                                  onClick={() => replaceMenu(index, m)}
                                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                                  style={{ color: "#F0B429" }}
                                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,180,41,0.08)"; }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                                >
                                  Menú: {m.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <h4
                            className="text-sm font-bold uppercase truncate"
                            style={{ color: "#E6EDF3" }}
                          >
                            {item.name}
                          </h4>
                          <p className="text-xs mt-0.5" style={{ color: "#566270" }}>
                            {item.type === "menu" ? "Menú" : item.type === "food" ? "Comida" : "Bebida"}
                            {" — "}
                            <span style={{ color: "#F0B429", fontWeight: 600 }}>${item.price}</span>
                            {" / unidad"}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingItemIndex(index)}
                        className="p-2 rounded-lg transition-colors"
                        title="Cambiar producto"
                        style={{ color: "#566270" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F0B429"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQty(index, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "#293042", border: "1px solid #30363D", color: "#8B949E" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F85149"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-sm font-black w-6 text-center" style={{ color: "#F0B429" }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(index, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "#293042", border: "1px solid #30363D", color: "#8B949E" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#3FB950"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
                      >
                        <Plus size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 rounded-lg transition-colors"
                        title="Eliminar ítem"
                        style={{ color: "#566270" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F85149"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* ── Campo de notas / modificación especial ── */}
                  <div className="mt-3 flex items-center gap-2">
                    <MessageSquare size={12} style={{ color: "#566270", flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Modificación especial (ej: sin cebolla, término medio…)"
                      value={item.notes ?? ""}
                      onChange={(e) => updateNotes(index, e.target.value)}
                      className="flex-1 text-xs rounded-lg px-3 py-2 outline-none transition-colors"
                      style={{
                        background:  "#293042",
                        border:      "1px solid #30363D",
                        color:       "#E6EDF3",
                      }}
                      onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,123,84,0.50)"; }}
                      onBlur={(e)  => { (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D"; }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Agregar ítem */}
            <button
              type="button"
              onClick={() => { setShowProductPicker(true); setSearch(""); }}
              className="w-full mt-4 p-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors"
              style={{ border: "1px dashed #30363D", color: "#566270" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,180,41,0.40)";
                (e.currentTarget as HTMLButtonElement).style.color       = "#F0B429";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363D";
                (e.currentTarget as HTMLButtonElement).style.color       = "#566270";
              }}
            >
              <Plus size={16} /> Agregar ítem
            </button>

            {/* Product picker para nuevo ítem */}
            {showProductPicker && (
              <div
                className="mt-3 p-4 rounded-xl space-y-2"
                style={{ background: "#21283A", border: "1px solid #30363D" }}
              >
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto para agregar…"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: "#293042", border: "1px solid #30363D", color: "#E6EDF3" }}
                  autoFocus
                  onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(240,180,41,0.50)"; }}
                  onBlur={(e)  => { (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D"; }}
                />
                {search && (
                  <div
                    className="max-h-48 overflow-y-auto space-y-1"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
                  >
                    {filteredProducts.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => addNewItem(p)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                        style={{ color: "#E6EDF3" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,180,41,0.08)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      >
                        {p.name} — ${p.price}
                      </button>
                    ))}
                    {filteredMenus.map((m) => (
                      <button
                        key={m._id}
                        onClick={() => addNewItem(m as any)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                        style={{ color: "#F0B429" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,180,41,0.08)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      >
                        Menú: {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar de resumen ──────────────────────── */}
          <div
            className="w-64 p-6 flex flex-col gap-4 flex-shrink-0"
            style={{ borderLeft: "1px solid #30363D", background: "#161B22" }}
          >
            <h3
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "#566270" }}
            >
              Resumen
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "#8B949E" }}>Ítems</span>
                <span className="text-sm font-bold" style={{ color: "#E6EDF3" }}>{items.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "#8B949E" }}>Total</span>
                <span className="text-xl font-black" style={{ color: "#F0B429" }}>
                  ${total.toFixed(2)}
                </span>
              </div>
              {/* Ítems con notas */}
              {items.filter((i) => i.notes).length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "#8B949E" }}>Modificaciones</span>
                  <span
                    className="text-sm font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: "rgba(255,123,84,0.12)", color: "#FF7B54", border: "1px solid rgba(255,123,84,0.25)" }}
                  >
                    {items.filter((i) => i.notes).length}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || items.length === 0}
                className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                style={{
                  background:   saving || items.length === 0 ? "#21283A" : "#F0B429",
                  color:        saving || items.length === 0 ? "#566270" : "#0D1117",
                  opacity:      saving || items.length === 0 ? 0.6 : 1,
                  boxShadow:    saving || items.length === 0 ? "none" : "0 4px 16px rgba(240,180,41,0.25)",
                }}
              >
                {saving
                  ? <><Loader2 size={16} className="animate-spin" /> Guardando…</>
                  : <><Save size={16} /> Guardar</>}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors"
                style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
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
