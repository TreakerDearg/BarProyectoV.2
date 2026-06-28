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
    <div className="bg-gradient-to-br from-surface-2 to-surface-3 w-full h-[85vh] rounded-[2.5rem] border border-white/10 shadow-2xl flex overflow-hidden relative">
      
      {/* LEFT: PRODUCT CATALOG */}
      <div className="flex-[2] flex flex-col border-r border-white/5 bg-black/20">
        <header className="p-6 pb-4 space-y-4">
           <div className="flex justify-between items-center">
              <div>
                 <h2 className="text-xl font-bold text-white tracking-tight">Menú Digital</h2>
                 <p className="text-xs text-white/50 font-medium uppercase tracking-wider mt-1">Selection Interface</p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
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
                    ? 'bg-emerald/20 text-emerald-400 border border-emerald/30'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveDietaryFilter("vegan")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeDietaryFilter === "vegan"
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                Vegano
              </button>
              <button
                onClick={() => setActiveDietaryFilter("vegetarian")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeDietaryFilter === "vegetarian"
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                Vegetariano
              </button>
              <button
                onClick={() => setActiveDietaryFilter("gluten-free")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeDietaryFilter === "gluten-free"
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                Sin Gluten
              </button>
           </div>

           <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white outline-none focus:border-cyan/40 transition-all"
                 placeholder="Buscar por nombre o ingrediente..."
              />
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar">
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCategory === "menu" ? (
                filteredMenus.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => addMenu(m)}
                    className="group relative bg-gradient-to-br from-gold/10 to-amber-500/5 hover:from-gold/20 hover:to-amber-500/10 border border-gold/30 hover:border-gold/50 p-4 rounded-xl transition-all text-left flex flex-col justify-between aspect-square"
                  >
                    <div className="flex justify-between items-start">
                       <div className="p-2 rounded-lg bg-gold/20 text-gold border border-gold/30">
                          <Check size={14} />
                       </div>
                       <Plus size={18} className="text-white/40 group-hover:text-gold transition-colors" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gold uppercase tracking-wider mb-1">MENÚ</p>
                       <h4 className="text-sm font-bold text-white group-hover:text-gold transition-colors leading-tight line-clamp-2">{m.name}</h4>
                       <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mt-2">{m.categories.length} categorías</p>
                    </div>
                  </button>
                ))
              ) : (
                filteredProducts.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => addProduct(p)}
                    className="group relative bg-white/5 hover:bg-cyan/10 border border-white/5 hover:border-cyan/30 p-4 rounded-xl transition-all text-left flex flex-col justify-between aspect-square"
                  >
                    <div className="flex justify-between items-start">
                       <div className={`p-2 rounded-lg ${p.type === 'food' ? 'bg-emerald/20 text-emerald-400 border-emerald/30' : 'bg-cyan/20 text-cyan-400 border-cyan/30'} border`}>
                          {p.type === 'food' ? <Utensils size={14} /> : <Wine size={14} />}
                       </div>
                       <Plus size={18} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">{p.category}</p>
                       <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight line-clamp-2">{p.name}</h4>
                       {p.dietaryRestrictions && p.dietaryRestrictions.length > 0 && (
                         <div className="flex flex-wrap gap-1 mt-2">
                           {p.dietaryRestrictions.slice(0, 2).map((dr) => (
                             <span key={dr} className="text-[8px] font-bold px-2 py-0.5 rounded bg-emerald/20 text-emerald-400 border border-emerald/30 uppercase">
                               {dr === 'vegan' ? 'VG' : dr === 'vegetarian' ? 'VEG' : dr === 'gluten-free' ? 'SG' : dr === 'dairy-free' ? 'SL' : dr === 'nut-free' ? 'SF' : 'SA'}
                             </span>
                           ))}
                           {p.dietaryRestrictions.length > 2 && (
                             <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-white/10 text-white/50">
                               +{p.dietaryRestrictions.length - 2}
                             </span>
                           )}
                         </div>
                       )}
                       <p className="text-lg font-bold text-cyan-400 mt-2">${p.price}</p>
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
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-white/50 hover:text-white transition-all border border-white/5 z-10"
        >
          <X size={20} />
        </button>

        <div className="flex-1 flex flex-col min-h-0 p-6 pt-12 space-y-6">
           
           {/* TABLE PICKER (If missing) */}
           {!initialTableId && (
             <section className="space-y-3">
                <div className="flex items-center gap-2">
                   <Hash size={12} className="text-cyan-400" />
                   <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Asignar Mesa</h3>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-28 overflow-y-auto custom-scrollbar">
                   {tables.map(t => (
                     <button
                        key={t._id}
                        type="button"
                        onClick={() => {
                          setSelectedTableId(t._id);
                          setSelectedTableNumber(t.number);
                        }}
                        className={`
                          py-2 rounded-lg border text-[10px] font-bold transition-all
                          ${selectedTableId === t._id 
                            ? "bg-cyan-400 text-black border-cyan-400" 
                            : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"}
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
              <div className="p-4 bg-gradient-to-r from-cyan/10 to-cyan/5 rounded-xl border border-cyan/20 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-400 text-black flex items-center justify-center font-black text-lg">
                       {selectedTableNumber}
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Comanda Activa</p>
                       <p className="text-xs font-bold text-white uppercase tracking-wider">Mesa de Servicio</p>
                    </div>
                 </div>
                 <Check className="text-cyan-400" size={18} />
              </div>
           )}

           {/* ITEMS LIST */}
           <div className="flex-1 space-y-3 min-h-0 flex flex-col">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <ShoppingCart size={14} className="text-white/40" />
                   <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Ticket de Consumo</h3>
                 </div>
                 <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{items.length} items</span>
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
                        className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-cyan/20 transition-all"
                      >
                         <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2">
                              {i.type === "menu" && <Check size={12} className="text-cyan-400" />}
                              <h5 className="text-sm font-bold text-white truncate uppercase">{i.name}</h5>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-white/40 font-medium">${i.price} / unidad</p>
                              <p className="text-xs font-bold text-cyan-400">x{i.quantity}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <button type="button" onClick={() => updateQty(i.product || i.menu!, i.quantity - 1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all border border-white/5">
                               <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold text-cyan-400 w-4 text-center">{i.quantity}</span>
                            <button type="button" onClick={() => updateQty(i.product || i.menu!, i.quantity + 1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-cyan/20 text-white/50 hover:text-cyan-400 transition-all border border-white/5">
                               <Plus size={14} />
                            </button>
                         </div>
                      </motion.div>
                    ))}
                 </AnimatePresence>
                 {items.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 py-12">
                      <ShoppingCart size={32} className="mb-3" />
                      <p className="text-xs font-bold uppercase tracking-wider">Ticket Vacío</p>
                   </div>
                 )}
              </div>
           </div>

           {/* TOTAL & SUBMIT */}
           <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Monto Total</p>
                    <p className="text-4xl font-bold text-white tracking-tight">${total.toFixed(2)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Impuestos Incl.</p>
                    <p className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{items.length} items</p>
                 </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`
                  w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2
                  ${canSubmit 
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500 shadow-lg shadow-cyan/20" 
                    : "bg-white/5 text-white/50 border border-white/10 opacity-50"}
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
        px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all
        ${active ? "bg-gold text-bg shadow-gold-glow" : "text-muted hover:text-white hover:bg-white/5"}
      `}
    >
      {icon}
      {label}
    </button>
  );
}