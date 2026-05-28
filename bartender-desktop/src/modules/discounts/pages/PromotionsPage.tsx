import { useState, useEffect } from "react";
import { pricingService, type Promotion } from "../services/pricingService";
import { getProducts } from "../../products/services/productService";
import type { Product } from "../../../types/product";
import { Plus, Minus, Trash2, Calendar, Clock, Tag, Loader2, Sparkles, Power, PackageSearch, Search } from "lucide-react";
import DiscountsSuiteHeader from "../components/DiscountsSuiteHeader";
import TourGuide from "../components/TourGuide";
import type { TourStep } from "../components/TourGuide";

export default function NebulaPromotionsPage() {
  const [tourOpen, setTourOpen] = useState(false);
  const [promoFormCollapsed, setPromoFormCollapsed] = useState(false);
  const [promoListCollapsed, setPromoListCollapsed] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "PERCENT",
    value: 10,
    startTime: "16:00",
    endTime: "19:00",
    days: [] as string[],
    applicableProducts: [] as string[],
  });

  const [searchProd, setSearchProd] = useState("");

  const ALL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [promoData, prodData, autoStatus] = await Promise.all([
        pricingService.getPromotions(),
        getProducts(),
        pricingService.getAutoPromotionsStatus()
      ]);
      setPromotions(promoData);
      setProducts(prodData);
      setAutoEnabled(autoStatus);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pricingService.deletePromotion(id);
      setPromotions(promotions.filter((p) => p._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async () => {
    if (!form.name || form.days.length === 0 || form.applicableProducts.length === 0) {
      alert("Por favor completa el nombre, al menos un día y un producto.");
      return;
    }

    try {
      setCreating(true);
      const newPromo = await pricingService.createPromotion({
        name: form.name,
        type: form.type as any,
        value: Number(form.value),
        isActive: true,
        applicableProducts: form.applicableProducts,
        schedule: {
          startTime: form.startTime,
          endTime: form.endTime,
          daysOfWeek: form.days
        }
      });
      setPromotions([newPromo, ...promotions]);
      setForm({ ...form, name: "", days: [], applicableProducts: [] });
    } catch (error) {
      console.error(error);
      alert("Error al crear promoción.");
    } finally {
      setCreating(false);
    }
  };

  const toggleAutoPromotions = async () => {
    try {
      const newStatus = !autoEnabled;
      setAutoEnabled(newStatus);
      await pricingService.toggleAutoPromotionsStatus(newStatus);
    } catch (error) {
      console.error(error);
      setAutoEnabled(!autoEnabled); // revert on error
    }
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  const toggleProduct = (productId: string) => {
    setForm(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(productId) 
        ? prev.applicableProducts.filter(id => id !== productId) 
        : [...prev.applicableProducts, productId]
    }));
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchProd.toLowerCase()));

  // Tour steps configuration
  const tourSteps: TourStep[] = [
    {
      target: "[data-tour='master-switch']",
      title: "Motor Automático",
      content: "Activa o desactiva el motor automático de promociones. Cuando está en línea, las promociones se aplican automáticamente según el horario configurado.",
      position: "bottom"
    },
    {
      target: "[data-tour='promo-name']",
      title: "Nombre de Campaña",
      content: "Define un nombre descriptivo para tu promoción. Ej: 'Happy Hour Golden', '2x1 Cócteles', etc.",
      position: "bottom"
    },
    {
      target: "[data-tour='promo-type-value']",
      title: "Tipo y Valor",
      content: "Selecciona el tipo de descuento (porcentaje, monto fijo o 2x1) y define su valor. Esto determina cómo se calculará el descuento.",
      position: "bottom"
    },
    {
      target: "[data-tour='promo-schedule']",
      title: "Rango Horario",
      content: "Configura el horario de vigencia de la promoción. Solo se aplicará entre la hora de inicio y fin especificadas.",
      position: "bottom"
    },
    {
      target: "[data-tour='promo-days']",
      title: "Días de Aplicación",
      content: "Selecciona los días de la semana en los que la promoción estará activa. Puedes elegir múltiples días.",
      position: "bottom"
    },
    {
      target: "[data-tour='promo-products']",
      title: "Productos Vinculados",
      content: "Busca y selecciona los productos específicos a los que se aplicará esta promoción. Debes seleccionar al menos uno.",
      position: "bottom"
    },
    {
      target: "[data-tour='promo-create-btn']",
      title: "Crear Promoción",
      content: "Haz clic para desplegar la promoción. Una vez creada, aparecerá en la lista de campañas en ejecución.",
      position: "top"
    },
    {
      target: "[data-tour='promo-list']",
      title: "Campañas en Ejecución",
      content: "Aquí verás todas las promociones activas. Puedes eliminarlas haciendo clic en el botón de papelera al pasar el mouse.",
      position: "top"
    }
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin shadow-[0_0_30px_rgba(139,92,246,0.3)]"></div>
      <p className="text-violet-400 font-black uppercase tracking-[0.2em] animate-pulse text-sm">Sincronizando Precios...</p>
    </div>
  );

  return (
    <div className="nebula-discounts-root">
      <div className="nebula-discounts-shell nebula-discounts-page-frame relative overflow-hidden">
      <DiscountsSuiteHeader
        title="Promociones Programadas"
        subtitle="Promociones programadas por horario y producto"
        onOpenTutorial={() => setTourOpen(true)}
      />
      {/* ATMOSPHERIC GLOW */}
      <div className="nebula-discounts-aurora" />

      <div className="nebula-discounts-title-band">
        <p className="text-xs font-bold tracking-wider uppercase text-violet-300">Promociones por horario y producto</p>
        <p className="text-xs text-violet-200/70">Crea, activa y controla campañas del turno</p>
      </div>
      {/* ================= HEADER & MASTER SWITCH ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-violet-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-2xl" />
            <div className="relative p-4 glass-card border border-violet-500/40 rounded-2xl">
              <Sparkles className="text-violet-400" size={28} />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-violet-400 font-black uppercase tracking-[0.4em] mb-1 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
              Marketing & Operaciones
            </p>
            <h1 className="text-3xl font-black text-ivory tracking-tighter uppercase leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              Gestor de <span className="text-violet-400">Promociones</span>
            </h1>
          </div>
        </div>

        {/* MASTER SWITCH */}
        <div className="nebula-discounts-panel p-3 rounded-2xl flex items-center gap-4" data-tour="master-switch">
          <div>
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">Motor Automático</p>
            <p className={`text-sm font-black uppercase tracking-wider ${autoEnabled ? 'text-lime' : 'text-red'}`}>
              {autoEnabled ? 'EN LÍNEA' : 'SUSPENDIDO'}
            </p>
          </div>
          <button 
            onClick={toggleAutoPromotions}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg ${
              autoEnabled 
                ? 'bg-lime/20 border border-lime/40 text-lime hover:bg-lime/30 shadow-lime/20' 
                : 'bg-red/20 border border-red/40 text-red hover:bg-red/30 shadow-red/20'
            }`}
          >
            <Power size={20} />
          </button>
        </div>
      </div>

      <div className="nebula-discounts-view-grid relative z-10">
        {/* ================= NEW PROMO FORM ================= */}
        <section className="relative group p-[1px] rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-violet-500/30 to-violet-500/0 opacity-30 group-hover:opacity-100 transition-opacity duration-1000 blur-xl rounded-3xl" />
          <div className="relative bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-royale">
            
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3">
                <Plus size={16} className="text-violet-400" />
                Forjar Nueva Promoción
              </h2>
              <button
                onClick={() => setPromoFormCollapsed(!promoFormCollapsed)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                {promoFormCollapsed ? <Plus size={16} /> : <Minus size={16} />}
              </button>
            </div>

            {!promoFormCollapsed && (
              <div className="space-y-5">
              {/* BASIC INFO */}
              <div className="grid grid-cols-12 gap-4" data-tour="promo-type-value">
                <div className="col-span-12 md:col-span-6 space-y-2 group/input">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 group-hover/input:text-violet-400 transition-colors" data-tour="promo-name">Nombre de Campaña</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej. Happy Hour Golden"
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 h-12 text-sm font-medium text-ivory focus:border-violet-400 focus:ring-1 focus:ring-violet-400/50 hover:border-white/20 transition-all outline-none"
                  />
                </div>
                
                <div className="col-span-6 md:col-span-3 space-y-2 group/input">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 group-hover/input:text-violet-400 transition-colors">Tipo</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 h-12 text-sm font-medium text-ivory focus:border-violet-400 focus:ring-1 focus:ring-violet-400/50 hover:border-white/20 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="PERCENT">Descuento (%)</option>
                    <option value="FLAT">Monto Fijo ($)</option>
                    <option value="2X1">Promoción 2x1</option>
                  </select>
                </div>

                <div className="col-span-6 md:col-span-3 space-y-2 group/input">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 group-hover/input:text-violet-400 transition-colors">Valor</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 h-12 text-sm font-medium text-ivory focus:border-violet-400 focus:ring-1 focus:ring-violet-400/50 hover:border-white/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* SCHEDULE */}
              <div className="grid grid-cols-12 gap-4 p-4 rounded-2xl border border-violet-500/10 bg-violet-500/5" data-tour="promo-schedule">
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Clock size={12} /> Rango Horario
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 h-10 text-sm text-ivory outline-none focus:border-violet-400" 
                    />
                    <span className="text-white/30 font-black">-</span>
                    <input 
                      type="time" 
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 h-10 text-sm text-ivory outline-none focus:border-violet-400" 
                    />
                  </div>
                </div>

                <div className="col-span-12 md:col-span-8 space-y-2" data-tour="promo-days">
                  <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={12} /> Días de Aplicación
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {ALL_DAYS.map((d) => {
                      const active = form.days.includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDay(d)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 border flex-1
                            ${active 
                              ? 'bg-violet-500 text-white border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.4)]' 
                              : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white'}`}
                        >
                          {d.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PRODUCT SELECTOR */}
              <div className="space-y-3" data-tour="promo-products">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <PackageSearch size={14} className="text-violet-400" /> Productos Vinculados ({form.applicableProducts.length})
                  </label>
                  <div className="relative w-56">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      placeholder="Buscar producto..."
                      value={searchProd}
                      onChange={e => setSearchProd(e.target.value)}
                      className="w-full h-8 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 text-xs text-white outline-none focus:border-violet-400"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredProducts.map(prod => {
                    const prodId = prod._id || '';
                    const isSelected = form.applicableProducts.includes(prodId);
                    return (
                      <div
                        key={prodId}
                        onClick={() => toggleProduct(prodId)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-violet-500/10 border-violet-500/50 shadow-inner' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="truncate">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-violet-400' : 'text-ivory'}`}>{prod.name}</p>
                          <p className="text-[9px] text-muted font-black tracking-widest uppercase">{prod.category}</p>
                        </div>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={handleCreate}
                disabled={creating}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-black text-sm uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-3 mt-2"
                data-tour="promo-create-btn"
              >
                {creating ? <Loader2 size={20} className="animate-spin" /> : "Desplegar Promoción"}
              </button>
              </div>
            )}
          </div>
        </section>

        {/* ================= ACTIVE PROMOTIONS ================= */}
        <section className="relative group p-[1px] rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/0 via-cyan/20 to-cyan/0 opacity-30 group-hover:opacity-100 transition-opacity duration-1000 blur-xl rounded-3xl" />
          <div className="relative bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-royale h-full" data-tour="promo-list">
            
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3">
                <Tag size={16} className="text-cyan-400" />
                Campañas en Ejecución
              </h2>
              <button
                onClick={() => setPromoListCollapsed(!promoListCollapsed)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                {promoListCollapsed ? <Plus size={16} /> : <Minus size={16} />}
              </button>
            </div>
            
            {!promoListCollapsed && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {promotions.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center">
                    <Tag size={24} className="text-white/20 mb-3" />
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">No hay campañas activas</p>
                  </div>
                ) : (
                  promotions.map((promo) => (
                    <div key={promo._id} className="p-4 rounded-2xl border border-cyan/20 bg-cyan/5 group/card relative hover:border-cyan/40 transition-all shadow-inner overflow-hidden">
                      {/* Background decoration */}
                      <div className="absolute -right-4 -top-4 w-20 h-20 bg-cyan/10 rounded-full blur-2xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                      
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <p className="text-ivory font-black text-lg tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                            {promo.name}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-cyan/20 border border-cyan/30 text-cyan rounded-md text-[10px] font-black tracking-widest shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                              {promo.type === "PERCENT" ? `-${promo.value}%` : promo.type === "FLAT" ? `-$${promo.value}` : promo.type}
                            </span>
                            <span className="text-[10px] text-white/50 font-bold tracking-widest uppercase flex items-center gap-1">
                              <Clock size={10} /> {promo.schedule.startTime} - {promo.schedule.endTime}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(promo._id)}
                          className="w-9 h-9 rounded-xl bg-red/10 border border-red/20 text-red flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all hover:bg-red hover:text-white shadow-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-white/5 relative z-10">
                        <p className="text-[8px] text-white/40 font-black tracking-widest uppercase mb-2">Días Activos</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {promo.schedule.daysOfWeek.map(d => (
                            <span key={d} className="text-[9px] bg-[#12121a] text-white/60 px-2 py-1 rounded border border-white/10 font-black uppercase tracking-wider">
                              {d.substring(0, 3)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              )}
          </div>
        </section>
      </div>
      <TourGuide
        steps={tourSteps}
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        storageKey="nebula_promotions_tour_v1"
      />
      </div>
    </div>
  );
}


