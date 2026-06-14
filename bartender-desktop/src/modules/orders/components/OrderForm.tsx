"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  Plus, 
  Minus, 
  Loader2, 
  X, 
  ChevronRight, 
  ShoppingCart, 
  Utensils, 
  Wine, 
  Check,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getProducts } from "../../../modules/products/services/productService";
import { getTables } from "../../tables/services/tableService";
import { createOrder } from "../services/orderService";
import { getMenus } from "../../../modules/menus/services/menuService";
import type { Product } from "../../../types/product";
import type { Table } from "../../tables/types/table";
import type { Menu } from "../../../modules/menus/types/menu";

interface LocalItem {
  product?: string;
  menu?: string;
  name: string;
  quantity: number;
  price: number;
  type: "drink" | "food" | "menu";
}

interface Props {
  tableId?: string;
  tableNumber?: number;
  sessionId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OrderForm({
  tableId: initialTableId,
  tableNumber: initialTableNumber,
  sessionId: initialSessionId,
  onClose,
  onSuccess,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [items, setItems] = useState<LocalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "food" | "drink" | "menu">("all");
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<"vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free" | null>(null);
  const [sessionId] = useState(initialSessionId || "");

  const [selectedTableId, setSelectedTableId] = useState(initialTableId || "");
  const [selectedTableNumber, setSelectedTableNumber] = useState(initialTableNumber || 0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodData, menuData, tableData] = await Promise.all([
          getProducts(),
          getMenus(),
          !initialTableId ? getTables() : Promise.resolve([])
        ]);
        setProducts(prodData || []);
        setMenus(menuData || []);
        setTables(tableData || []);
      } catch (err) {
        console.error("Error loading form data", err);
      }
    };
    loadData();
  }, [initialTableId]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        p.dietaryRestrictions?.some(dr => dr.toLowerCase().includes(searchLower));
      const matchesCategory = activeCategory === "all" || p.type === activeCategory || activeCategory === "menu";
      const matchesDietary = !activeDietaryFilter || p.dietaryRestrictions?.includes(activeDietaryFilter);
      return matchesSearch && matchesCategory && matchesDietary;
    });
  }, [products, search, activeCategory, activeDietaryFilter]);

  const filteredMenus = useMemo(() => {
    return menus.filter((m) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(searchLower) ||
        m.description?.toLowerCase().includes(searchLower) ||
        m.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        m.dietaryRestrictions?.some(dr => dr.toLowerCase().includes(searchLower));
      const matchesCategory = activeCategory === "all" || activeCategory === "menu";
      const matchesDietary = !activeDietaryFilter || m.dietaryRestrictions?.includes(activeDietaryFilter);
      return matchesSearch && matchesCategory && matchesDietary && m.active;
    });
  }, [menus, search, activeCategory, activeDietaryFilter]);

  const addProduct = (product: Product) => {
    if (!product._id) return;
    setItems((prev) => {
      const exists = prev.find((i) => i.product === product._id);
      if (exists) {
        return prev.map((i) => i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        product: product._id,
        name: product.name,
        quantity: 1,
        price: product.price,
        type: product.type as "drink" | "food",
      }];
    });
  };

  const addMenu = (menu: Menu) => {
    if (!menu._id) return;
    setItems((prev) => {
      const exists = prev.find((i) => i.menu === menu._id);
      if (exists) {
        return prev.map((i) => i.menu === menu._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        menu: menu._id,
        name: menu.name,
        quantity: 1,
        price: 0, // Precio del menú se calculará en el backend
        type: "menu",
      }];
    });
  };

  const updateQty = (itemId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product !== itemId && i.menu !== itemId)
        : prev.map((i) => (i.product === itemId || i.menu === itemId) ? { ...i, quantity: qty } : i)
    );
  };

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const canSubmit = items.length > 0 && selectedTableId && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!sessionId) {
    alert("SessionId is required");
    return;
  }

  if (!canSubmit) return;

  try {
    setLoading(true);

    await createOrder({
      table: selectedTableId,
      sessionId: sessionId,
      items: items.map((i) => ({
        product: i.product,
        menu: i.menu,
        quantity: i.quantity,
        price: i.price,
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

  return (
    <div className="bg-surface-2 w-full h-[85vh] rounded-[3rem] border border-white/10 shadow-3xl flex overflow-hidden relative">
      
      {/* LEFT: PRODUCT CATALOG */}
      <div className="flex-[2] flex flex-col border-r border-white/5 bg-black/20">
        <header className="p-10 pb-6 space-y-6">
           <div className="flex justify-between items-center">
              <div>
                 <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Menú Digital</h2>
                 <p className="text-[9px] text-muted font-black uppercase tracking-[0.4em] mt-2">Selection Interface v4.0</p>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                 <CategoryBtn active={activeCategory === "all"} onClick={() => setActiveCategory("all")} label="Todos" icon={<ShoppingCart size={14} />} />
                 <CategoryBtn active={activeCategory === "food"} onClick={() => setActiveCategory("food")} label="Comida" icon={<Utensils size={14} />} />
                 <CategoryBtn active={activeCategory === "drink"} onClick={() => setActiveCategory("drink")} label="Bebidas" icon={<Wine size={14} />} />
                 <CategoryBtn active={activeCategory === "menu"} onClick={() => setActiveCategory("menu")} label="Menús" icon={<Check size={14} />} />
              </div>
           </div>

           {/* Dietary Filter Chips */}
           <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveDietaryFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  !activeDietaryFilter
                    ? 'bg-emerald/10 text-emerald-400 border border-emerald/30'
                    : 'bg-white/5 text-muted border border-white/10 hover:bg-white/10'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveDietaryFilter("vegan")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeDietaryFilter === "vegan"
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-muted border border-white/10 hover:bg-white/10'
                }`}
              >
                Vegano
              </button>
              <button
                onClick={() => setActiveDietaryFilter("vegetarian")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeDietaryFilter === "vegetarian"
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-muted border border-white/10 hover:bg-white/10'
                }`}
              >
                Vegetariano
              </button>
              <button
                onClick={() => setActiveDietaryFilter("gluten-free")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeDietaryFilter === "gluten-free"
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-muted border border-white/10 hover:bg-white/10'
                }`}
              >
                Sin Gluten
              </button>
           </div>

           <div className="relative group">
              <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold transition-colors" />
              <input 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-xs font-black text-white outline-none focus:border-gold/40 transition-all"
                 placeholder="Buscar por nombre o ingrediente..."
              />
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 pt-0 custom-scrollbar">
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCategory === "menu" ? (
                filteredMenus.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => addMenu(m)}
                    className="group relative bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 p-6 rounded-[2rem] transition-all text-left flex flex-col justify-between aspect-square shadow-gold-glow/20"
                  >
                    <div className="flex justify-between items-start">
                       <div className="p-2.5 rounded-xl bg-gold/20 text-gold border border-gold/30">
                          <Check size={16} />
                       </div>
                       <Plus size={18} className="text-muted group-hover:text-gold transition-colors" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-gold uppercase tracking-widest mb-1">MENÚ</p>
                       <h4 className="text-sm font-black text-white group-hover:text-gold transition-colors leading-tight line-clamp-2">{m.name}</h4>
                       <p className="text-[8px] font-black text-muted uppercase tracking-widest mt-2">{m.categories.length} categorías</p>
                    </div>
                  </button>
                ))
              ) : (
                filteredProducts.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => addProduct(p)}
                    className="group relative bg-surface-3 hover:bg-gold/10 border border-white/5 hover:border-gold/30 p-6 rounded-[2rem] transition-all text-left flex flex-col justify-between aspect-square"
                  >
                    <div className="flex justify-between items-start">
                       <div className={`p-2.5 rounded-xl ${p.type === 'food' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'} border`}>
                          {p.type === 'food' ? <Utensils size={16} /> : <Wine size={16} />}
                       </div>
                       <Plus size={18} className="text-muted group-hover:text-gold transition-colors" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-muted uppercase tracking-widest mb-1">{p.category}</p>
                       <h4 className="text-sm font-black text-white group-hover:text-gold transition-colors leading-tight line-clamp-2">{p.name}</h4>
                       {p.dietaryRestrictions && p.dietaryRestrictions.length > 0 && (
                         <div className="flex flex-wrap gap-1 mt-2">
                           {p.dietaryRestrictions.slice(0, 2).map((dr) => (
                             <span key={dr} className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-emerald/10 text-emerald-400 border border-emerald/30 uppercase">
                               {dr === 'vegan' ? 'VG' : dr === 'vegetarian' ? 'VEG' : dr === 'gluten-free' ? 'SG' : dr === 'dairy-free' ? 'SL' : dr === 'nut-free' ? 'SF' : 'SA'}
                             </span>
                           ))}
                           {p.dietaryRestrictions.length > 2 && (
                             <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-muted border border-white/10">
                               +{p.dietaryRestrictions.length - 2}
                             </span>
                           )}
                         </div>
                       )}
                       <p className="text-lg font-black text-grad-gold mt-2">${p.price}</p>
                    </div>
                  </button>
                ))
              )}
           </div>
        </div>
      </div>

      {/* RIGHT: TICKET & TABLE SELECTION */}
      <div className="flex-1 flex flex-col bg-surface-2 relative">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/5 text-muted hover:text-white transition-all border border-white/5 z-10"
        >
          <X size={24} />
        </button>

        <div className="flex-1 flex flex-col min-h-0 p-10 pt-12 space-y-8">
           
           {/* TABLE PICKER (If missing) */}
           {!initialTableId && (
             <section className="space-y-4">
                <div className="flex items-center gap-2">
                   <Hash size={12} className="text-gold" />
                   <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Asignar Mesa</h3>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                   {tables.map(t => (
                     <button
                        key={t._id}
                        type="button"
                        onClick={() => {
                          setSelectedTableId(t._id);
                          setSelectedTableNumber(t.number);
                        }}
                        className={`
                          py-3 rounded-xl border text-[10px] font-black transition-all
                          ${selectedTableId === t._id 
                            ? "bg-gold text-bg border-gold shadow-gold-glow" 
                            : "bg-white/5 border-white/5 text-muted hover:bg-white/10"}
                        `}
                     >
                        #{t.number}
                     </button>
                   ))}
                </div>
             </section>
           )}

           {/* SELECTED TABLE INFO */}
           {selectedTableId && (
              <div className="p-6 bg-gold/5 rounded-3xl border border-gold/20 flex items-center justify-between shadow-gold-glow/10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gold text-bg flex items-center justify-center font-black text-xl shadow-gold-glow">
                       {selectedTableNumber}
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-gold uppercase tracking-[0.3em]">Comanda Activa</p>
                       <p className="text-xs font-black text-white uppercase tracking-widest">Mesa de Servicio</p>
                    </div>
                 </div>
                 <Check className="text-gold" size={20} />
              </div>
           )}

           {/* ITEMS LIST */}
           <div className="flex-1 space-y-4 min-h-0 flex flex-col">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <ShoppingCart size={12} className="text-muted" />
                   <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ticket de Consumo</h3>
                 </div>
                 <span className="text-[8px] font-black text-gold uppercase tracking-widest">{items.length} items</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 <AnimatePresence mode="popLayout">
                    {items.map((i) => (
                      <motion.div
                        key={i.product || i.menu}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-gold/20 transition-all"
                      >
                         <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2">
                              {i.type === "menu" && <Check size={12} className="text-gold" />}
                              <h5 className="text-[11px] font-black text-white truncate uppercase">{i.name}</h5>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-[9px] text-muted font-bold">${i.price} / unidad</p>
                              <p className="text-[9px] font-black text-gold">x{i.quantity}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <button type="button" onClick={() => updateQty(i.product || i.menu!, i.quantity - 1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 text-muted hover:text-red-500 transition-all border border-white/5">
                               <Minus size={14} />
                            </button>
                            <span className="text-xs font-black text-gold w-4 text-center">{i.quantity}</span>
                            <button type="button" onClick={() => updateQty(i.product || i.menu!, i.quantity + 1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-gold/20 text-muted hover:text-gold transition-all border border-white/5">
                               <Plus size={14} />
                            </button>
                         </div>
                      </motion.div>
                    ))}
                 </AnimatePresence>
                 {items.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 py-12">
                      <ShoppingCart size={40} className="mb-4" />
                      <p className="text-[9px] font-black uppercase tracking-widest">Ticket Vacío</p>
                   </div>
                 )}
              </div>
           </div>

           {/* TOTAL & SUBMIT */}
           <div className="pt-6 border-t border-white/10 space-y-6">
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Monto Total</p>
                    <p className="text-4xl font-black text-white tracking-tighter">${total.toFixed(2)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black text-muted uppercase tracking-widest">Impuestos Incl.</p>
                    <p className="text-xs font-black text-gold uppercase tracking-widest">{items.length} items</p>
                 </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`
                  w-full py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                  ${canSubmit 
                    ? "bg-gold text-bg shadow-gold-glow hover:scale-[1.02]" 
                    : "bg-white/5 text-muted border border-white/5 opacity-50"}
                `}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                {loading ? "Procesando..." : "Confirmar Comanda"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function CategoryBtn({ active, onClick, label, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all
        ${active ? "bg-gold text-bg shadow-gold-glow" : "text-muted hover:text-white hover:bg-white/5"}
      `}
    >
      {icon}
      {label}
    </button>
  );
}