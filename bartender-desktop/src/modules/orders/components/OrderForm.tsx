"use client";

/**
 * OrderForm — Formulario de creación de comanda.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * - Paleta completa actualizada
 * - Cards de producto sin aspect-square (altura natural)
 * - Campo de notas/modificaciones por ítem
 * - CategoryTab en lugar de CategoryBtn
 * - Indicador visual de cantidad en card si ya está en ticket
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Search, Plus, Minus, Loader2, X,
  ChevronRight, ShoppingCart, Utensils,
  Wine, Check, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getProducts } from "../../../modules/products/services/productService";
import { getTables }   from "../../tables/services/tableService";
import { createOrder } from "../services/orderService";
import { getMenus }    from "../../../modules/menus/services/menuService";
import type { Product } from "../../../types/product";
import type { Table }   from "../../tables/types/table";
import type { Menu }    from "../../../modules/menus/types/menu";

/* ── Tipos locales ─────────────────────────────────────────── */
interface LocalItem {
  product?: string;
  menu?:    string;
  name:     string;
  quantity: number;
  price:    number;
  type:     "drink" | "food" | "menu";
  notes?:   string;
}

interface Props {
  tableId?:     string;
  tableNumber?: number;
  sessionId?:   string;
  onClose:      () => void;
  onSuccess?:   () => void;
}

/* ── Opciones dietéticas ───────────────────────────────────── */
type DietaryFilter = "vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free" | null;

const DIETARY_OPTIONS: { value: DietaryFilter; label: string; color: string }[] = [
  { value: null,          label: "Todos",       color: "#8B949E" },
  { value: "vegan",       label: "Vegano",      color: "#3FB950" },
  { value: "vegetarian",  label: "Vegetariano", color: "#3FB950" },
  { value: "gluten-free", label: "Sin Gluten",  color: "#F0B429" },
];

/* ── Componente principal ──────────────────────────────────── */
export default function OrderForm({
  tableId:     initialTableId,
  tableNumber: initialTableNumber,
  sessionId:   initialSessionId,
  onClose,
  onSuccess,
}: Props) {
  const [products, setProducts]   = useState<Product[]>([]);
  const [menus, setMenus]         = useState<Menu[]>([]);
  const [tables, setTables]       = useState<Table[]>([]);
  const [items, setItems]         = useState<LocalItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState("");
  const [activeCategory, setActiveCategory] =
    useState<"all" | "food" | "drink" | "menu">("all");
  const [activeDietaryFilter, setActiveDietaryFilter] =
    useState<DietaryFilter>(null);
  const [sessionId]               = useState(initialSessionId || "");
  const [selectedTableId, setSelectedTableId]       = useState(initialTableId     || "");
  const [selectedTableNumber, setSelectedTableNumber] = useState(initialTableNumber || 0);

  /* ── Carga de datos ──────────────────────────────────────── */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodData, menuData, tableData] = await Promise.all([
          getProducts(),
          getMenus(),
          !initialTableId ? getTables() : Promise.resolve([]),
        ]);
        setProducts(prodData  || []);
        setMenus(menuData     || []);
        setTables(tableData   || []);
      } catch (err) {
        console.error("Error loading form data", err);
      }
    };
    loadData();
  }, [initialTableId]);

  /* ── Filtrado ────────────────────────────────────────────── */
  const filteredProducts = useMemo(() =>
    products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.dietaryRestrictions?.some((d) => d.toLowerCase().includes(q));
      const matchCat = activeCategory === "all" || p.type === activeCategory || activeCategory === "menu";
      const matchDiet = !activeDietaryFilter || p.dietaryRestrictions?.includes(activeDietaryFilter);
      return matchSearch && matchCat && matchDiet;
    }),
  [products, search, activeCategory, activeDietaryFilter]);

  const filteredMenus = useMemo(() =>
    menus.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch =
        m.name.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q)) ||
        m.dietaryRestrictions?.some((d) => d.toLowerCase().includes(q));
      const matchCat  = activeCategory === "all" || activeCategory === "menu";
      const matchDiet = !activeDietaryFilter || m.dietaryRestrictions?.includes(activeDietaryFilter);
      return matchSearch && matchCat && matchDiet && m.active;
    }),
  [menus, search, activeCategory, activeDietaryFilter]);

  /* ── Mutaciones del ticket ───────────────────────────────── */
  const addProduct = (product: Product) => {
    if (!product._id) return;
    setItems((prev) => {
      const exists = prev.find((i) => i.product === product._id);
      if (exists) return prev.map((i) => i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product: product._id, name: product.name, quantity: 1, price: product.price, type: product.type as "drink" | "food" }];
    });
  };

  const addMenu = (menu: Menu) => {
    if (!menu._id) return;
    setItems((prev) => {
      const exists = prev.find((i) => i.menu === menu._id);
      if (exists) return prev.map((i) => i.menu === menu._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menu: menu._id, name: menu.name, quantity: 1, price: 0, type: "menu" }];
    });
  };

  const updateQty = (itemId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product !== itemId && i.menu !== itemId)
        : prev.map((i) => (i.product === itemId || i.menu === itemId) ? { ...i, quantity: qty } : i)
    );
  };

  const updateNotes = (itemId: string, value: string) => {
    setItems((prev) =>
      prev.map((i) =>
        (i.product === itemId || i.menu === itemId) ? { ...i, notes: value } : i
      )
    );
  };

  /* ── Totales ─────────────────────────────────────────────── */
  const total     = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const canSubmit = items.length > 0 && !!selectedTableId && !loading;

  /* ── Submit ──────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) { alert("SessionId is required"); return; }
    if (!canSubmit) return;
    try {
      setLoading(true);
      await createOrder({
        table:     selectedTableId,
        sessionId: sessionId,
        items: items.map((i) => ({
          product:  i.product,
          menu:     i.menu,
          quantity: i.quantity,
          price:    i.price,
          notes:    i.notes?.trim() || undefined,
        })),
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Error creando pedido");
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div
      className="flex h-[88vh] w-full rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: "#1C2333", border: "1px solid #30363D" }}
    >

      {/* ══════════════════════════════════════════
          LEFT — Catálogo de productos
      ══════════════════════════════════════════ */}
      <div
        className="flex-[3] flex flex-col min-w-0"
        style={{ borderRight: "1px solid #30363D" }}
      >

        {/* Header del catálogo */}
        <div
          className="px-6 pt-5 pb-4 flex-shrink-0 space-y-3"
          style={{ borderBottom: "1px solid #30363D" }}
        >
          {/* Título + cerrar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#E6EDF3" }}>
                Nueva comanda
              </h2>
              {selectedTableId && (
                <p className="text-xs mt-0.5" style={{ color: "#566270" }}>
                  Mesa {selectedTableNumber} · Sesión activa
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "#21283A", border: "1px solid #30363D", color: "#566270" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
            >
              <X size={17} />
            </button>
          </div>

          {/* Tabs de categoría */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: "#161B22", border: "1px solid #30363D" }}
          >
            {([
              { value: "all",   label: "Todos",   icon: <ShoppingCart size={13} /> },
              { value: "food",  label: "Comida",  icon: <Utensils     size={13} /> },
              { value: "drink", label: "Bebidas", icon: <Wine         size={13} /> },
              { value: "menu",  label: "Menús",   icon: <Check        size={13} /> },
            ] as const).map(({ value, label, icon }) => (
              <CategoryTab
                key={value}
                active={activeCategory === value}
                onClick={() => setActiveCategory(value)}
                icon={icon}
                label={label}
              />
            ))}
          </div>

          {/* Chips dietéticos */}
          <div className="flex items-center gap-2 flex-wrap">
            {DIETARY_OPTIONS.map(({ value, label, color }) => {
              const isActive = activeDietaryFilter === value;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveDietaryFilter(value)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all"
                  style={{
                    background:  isActive ? `${color}20` : "#21283A",
                    border:      `1px solid ${isActive ? `${color}40` : "#30363D"}`,
                    color:       isActive ? color : "#566270",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#566270" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o ingrediente..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{ background: "#21283A", border: "1px solid #30363D", color: "#E6EDF3" }}
              onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(240,180,41,0.50)"; }}
              onBlur={(e)  => { (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D"; }}
            />
          </div>
        </div>

        {/* Grid de productos */}
        <div
          className="flex-1 overflow-y-auto p-5"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
        >
          {activeCategory === "menu" ? (
            filteredMenus.length === 0 ? (
              <EmptyState icon={<Check size={24} />} text="Sin menús disponibles" />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredMenus.map((m) => (
                  <MenuCard
                    key={m._id}
                    menu={m}
                    onAdd={() => addMenu(m)}
                    inTicket={items.find((i) => i.menu === m._id)?.quantity}
                  />
                ))}
              </div>
            )
          ) : filteredProducts.length === 0 ? (
            <EmptyState icon={<ShoppingCart size={24} />} text="Sin productos en este filtro" />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onAdd={() => addProduct(p)}
                  inTicket={items.find((i) => i.product === p._id)?.quantity}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Ticket + acciones
      ══════════════════════════════════════════ */}
      <div
        className="flex-[2] flex flex-col min-w-0"
        style={{ background: "#161B22" }}
      >

        {/* Selector de mesa (solo si no viene por prop) */}
        {!initialTableId && (
          <div
            className="px-5 pt-5 pb-4 flex-shrink-0"
            style={{ borderBottom: "1px solid #30363D" }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3"
              style={{ color: "#566270" }}
            >
              Seleccionar mesa
            </p>
            <div
              className="space-y-1.5 max-h-40 overflow-y-auto"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
            >
              {tables.map((t) => {
                const sel = selectedTableId === t._id;
                return (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => { setSelectedTableId(t._id); setSelectedTableNumber(t.number); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all"
                    style={{
                      background:  sel ? "rgba(240,180,41,0.15)" : "#21283A",
                      border:      `1px solid ${sel ? "rgba(240,180,41,0.40)" : "#30363D"}`,
                      color:       sel ? "#F0B429" : "#8B949E",
                    }}
                  >
                    <span className="font-bold text-sm">Mesa {t.number}</span>
                    {sel && <Check size={13} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Info de mesa seleccionada */}
        {selectedTableId && (
          <div className="px-5 pt-4 pb-2 flex-shrink-0">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(240,180,41,0.08)", border: "1px solid rgba(240,180,41,0.20)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                style={{ background: "#F0B429", color: "#0D1117" }}
              >
                {selectedTableNumber}
              </div>
              <div className="min-w-0">
                <p
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "#F0B429" }}
                >
                  Comanda activa
                </p>
                <p className="text-xs font-semibold" style={{ color: "#E6EDF3" }}>
                  Mesa de servicio
                </p>
              </div>
              <Check size={15} className="ml-auto flex-shrink-0" style={{ color: "#F0B429" }} />
            </div>
          </div>
        )}

        {/* Header del ticket */}
        <div className="px-5 pt-3 pb-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={13} style={{ color: "#566270" }} />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "#566270" }}
            >
              Ticket de consumo
            </span>
          </div>
          {items.length > 0 && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-lg"
              style={{
                background: "rgba(240,180,41,0.12)",
                color:      "#F0B429",
                border:     "1px solid rgba(240,180,41,0.25)",
              }}
            >
              {items.length} {items.length === 1 ? "ítem" : "ítems"}
            </span>
          )}
        </div>

        {/* Lista de ítems en el ticket */}
        <div
          className="flex-1 min-h-0 overflow-y-auto px-5 pb-3 space-y-2"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.product || item.menu}
                layout
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="rounded-xl p-3"
                style={{ background: "#21283A", border: "1px solid #30363D" }}
              >
                {/* Fila nombre + controles */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h5
                      className="text-sm font-bold truncate uppercase"
                      style={{ color: "#E6EDF3" }}
                    >
                      {item.name}
                    </h5>
                    {item.price > 0 && (
                      <p className="text-xs mt-0.5" style={{ color: "#566270" }}>
                        ${item.price.toLocaleString("es-AR")} / unidad
                      </p>
                    )}
                  </div>
                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQty(item.product || item.menu!, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: "#293042", border: "1px solid #30363D", color: "#8B949E" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F85149"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
                    >
                      <Minus size={12} />
                    </button>
                    <span
                      className="text-sm font-black w-5 text-center"
                      style={{ color: "#F0B429" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.product || item.menu!, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: "#293042", border: "1px solid #30363D", color: "#8B949E" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#3FB950"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Input de notas / modificación especial */}
                <div className="mt-2 flex items-center gap-1.5">
                  <MessageSquare
                    size={10}
                    style={{ color: "#566270", flexShrink: 0 }}
                  />
                  <input
                    type="text"
                    placeholder="Modificación especial…"
                    value={item.notes ?? ""}
                    onChange={(e) => updateNotes(item.product || item.menu!, e.target.value)}
                    className="flex-1 text-[11px] rounded-lg px-2.5 py-1.5 outline-none transition-colors"
                    style={{
                      background: "#293042",
                      border:     "1px solid #30363D",
                      color:      "#E6EDF3",
                    }}
                    onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,123,84,0.50)"; }}
                    onBlur={(e)  => { (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D"; }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Estado vacío */}
          {items.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-12 gap-3"
              style={{ opacity: 0.35 }}
            >
              <ShoppingCart size={28} style={{ color: "#8B949E" }} />
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "#8B949E" }}
              >
                Ticket vacío
              </p>
            </div>
          )}
        </div>

        {/* Footer: total + botón */}
        <div
          className="flex-shrink-0 p-5"
          style={{ borderTop: "1px solid #30363D" }}
        >
          <div className="flex items-end justify-between mb-4">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "#566270" }}
              >
                Monto total
              </p>
              <p className="text-3xl font-black" style={{ color: "#E6EDF3" }}>
                ${total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "#566270" }}
              >
                Impuestos incl.
              </p>
              <p className="text-xs font-bold" style={{ color: "#8B949E" }}>
                {items.length} {items.length === 1 ? "ítem" : "ítems"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            style={{
              background:  canSubmit ? "#F0B429"  : "#21283A",
              color:       canSubmit ? "#0D1117"  : "#566270",
              boxShadow:   canSubmit ? "0 4px 20px rgba(240,180,41,0.30)" : "none",
              border:      canSubmit ? "none"     : "1px solid #30363D",
              opacity:     canSubmit ? 1 : 0.6,
            }}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Procesando…</>
              : <><ChevronRight size={16} /> Confirmar comanda</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SUBCOMPONENTES
══════════════════════════════════════════════════════════════ */

/* ── Tab de categoría ──────────────────────────────────────── */
function CategoryTab({
  active, onClick, icon, label,
}: {
  active:  boolean;
  onClick: () => void;
  icon:    ReactNode;
  label:   string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex-1 justify-center"
      style={{
        background:  active ? "rgba(240,180,41,0.20)" : "transparent",
        color:       active ? "#F0B429"               : "#566270",
        border:      active ? "1px solid rgba(240,180,41,0.35)" : "1px solid transparent",
      }}
    >
      {icon} {label}
    </button>
  );
}

/* ── Estado vacío ──────────────────────────────────────────── */
function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-3"
      style={{ opacity: 0.35 }}
    >
      <div style={{ color: "#566270" }}>{icon}</div>
      <p
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: "#566270" }}
      >
        {text}
      </p>
    </div>
  );
}

/* ── Card de producto ──────────────────────────────────────── */
function ProductCard({
  product, onAdd, inTicket,
}: {
  product:   Product;
  onAdd:     () => void;
  inTicket?: number;
}) {
  const isFood     = product.type === "food";
  const accent     = isFood ? "#3FB950" : "#388BFD";
  const accentBg   = isFood ? "rgba(63,185,80,0.10)"  : "rgba(56,139,253,0.10)";
  const accentBord = isFood ? "rgba(63,185,80,0.25)"  : "rgba(56,139,253,0.25)";

  return (
    <button
      type="button"
      onClick={onAdd}
      className="group relative text-left flex flex-col gap-2 p-4 rounded-xl transition-all"
      style={{ background: "#21283A", border: "1px solid #30363D" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = `${accent}50`;
        (e.currentTarget as HTMLButtonElement).style.background  = accentBg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363D";
        (e.currentTarget as HTMLButtonElement).style.background  = "#21283A";
      }}
    >
      {/* Badge de cantidad si ya está en ticket */}
      {inTicket != null && inTicket > 0 && (
        <div
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
          style={{ background: "#F0B429", color: "#0D1117" }}
        >
          {inTicket}
        </div>
      )}

      {/* Ícono + Plus */}
      <div className="flex items-start justify-between">
        <div
          className="p-2 rounded-lg"
          style={{ background: accentBg, color: accent, border: `1px solid ${accentBord}` }}
        >
          {isFood ? <Utensils size={13} /> : <Wine size={13} />}
        </div>
        <Plus
          size={15}
          className="opacity-20 group-hover:opacity-100 transition-opacity"
          style={{ color: accent }}
        />
      </div>

      {/* Categoría */}
      <p
        className="text-[9px] font-bold uppercase tracking-widest"
        style={{ color: "#566270" }}
      >
        {product.category}
      </p>

      {/* Nombre */}
      <h4
        className="text-sm font-bold leading-snug line-clamp-2"
        style={{ color: "#E6EDF3" }}
      >
        {product.name}
      </h4>

      {/* Badges dietéticos */}
      {product.dietaryRestrictions && product.dietaryRestrictions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {product.dietaryRestrictions.slice(0, 2).map((dr) => (
            <span
              key={dr}
              className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase"
              style={{
                background: "rgba(63,185,80,0.12)",
                color:      "#3FB950",
                border:     "1px solid rgba(63,185,80,0.25)",
              }}
            >
              {dr === "vegan"       ? "VG"  :
               dr === "vegetarian" ? "VEG" :
               dr === "gluten-free"? "SG"  :
               dr === "dairy-free" ? "SL"  : "+"}
            </span>
          ))}
          {product.dietaryRestrictions.length > 2 && (
            <span
              className="text-[8px] px-1.5 py-0.5 rounded"
              style={{ background: "#293042", color: "#566270" }}
            >
              +{product.dietaryRestrictions.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Precio */}
      <p
        className="text-lg font-black mt-auto"
        style={{ color: accent }}
      >
        ${product.price.toLocaleString("es-AR")}
      </p>
    </button>
  );
}

/* ── Card de menú ──────────────────────────────────────────── */
function MenuCard({
  menu, onAdd, inTicket,
}: {
  menu:      Menu;
  onAdd:     () => void;
  inTicket?: number;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="group relative text-left flex flex-col gap-2 p-4 rounded-xl transition-all"
      style={{
        background: "rgba(240,180,41,0.06)",
        border:     "1px solid rgba(240,180,41,0.20)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background   = "rgba(240,180,41,0.12)";
        (e.currentTarget as HTMLButtonElement).style.borderColor  = "rgba(240,180,41,0.40)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background   = "rgba(240,180,41,0.06)";
        (e.currentTarget as HTMLButtonElement).style.borderColor  = "rgba(240,180,41,0.20)";
      }}
    >
      {inTicket != null && inTicket > 0 && (
        <div
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
          style={{ background: "#F0B429", color: "#0D1117" }}
        >
          {inTicket}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div
          className="p-2 rounded-lg"
          style={{
            background: "rgba(240,180,41,0.15)",
            color:      "#F0B429",
            border:     "1px solid rgba(240,180,41,0.30)",
          }}
        >
          <Check size={13} />
        </div>
        <Plus
          size={15}
          className="opacity-20 group-hover:opacity-100 transition-opacity"
          style={{ color: "#F0B429" }}
        />
      </div>

      <p
        className="text-[9px] font-bold uppercase tracking-widest"
        style={{ color: "#566270" }}
      >
        Menú
      </p>

      <h4
        className="text-sm font-bold leading-snug line-clamp-2"
        style={{ color: "#E6EDF3" }}
      >
        {menu.name}
      </h4>

      <p className="text-xs" style={{ color: "#8B949E" }}>
        {(menu as any).categories?.length ?? 0} categorías
      </p>
    </button>
  );
}
