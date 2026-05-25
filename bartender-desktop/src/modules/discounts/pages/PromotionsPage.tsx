import { useState, useEffect } from "react";
import { pricingService, type Promotion } from "../services/pricingService";
import { getProducts } from "../../products/services/productService";
import type { Product } from "../../../types/product";
import { Plus, Trash2, Calendar, Clock, Tag, Loader2, Sparkles, Power, PackageSearch, Search } from "lucide-react";

export default function NebulaPromotionsPage() {
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-16 h-16 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin shadow-[0_0_30px_rgba(244,63,94,0.3)]"></div>
      <p className="text-rose-400 font-black uppercase tracking-[0.2em] animate-pulse">Sincronizando Precios...</p>
    </div>
  );

  return (
    <div className="space-y-6 p-8 relative overflow-hidden">
      {/* ATMOSPHERIC GLOW */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* ================= HEADER & MASTER SWITCH ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 animate-fade-in-up">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-rose-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-2xl" />
            <div className="relative p-5 glass-card border border-rose-500/40 rounded-2xl">
              <Sparkles className="text-rose-400" size={36} />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-rose-400 font-black uppercase tracking-[0.4em] mb-1 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
              Marketing & Operaciones
            </p>
            <h1 className="text-4xl font-black text-ivory tracking-tighter uppercase leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              Constructor de <span className="text-rose-400">Promociones Nebula</span>
            </h1>
          </div>
        </div>

        {/* MASTER SWITCH */}
        <div className="glass-card p-4 rounded-2xl flex items-center gap-6 border border-white/5 bg-[#0a0a0f]/80">
          <div>
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">Motor Automático</p>
            <p className={`text-sm font-black uppercase tracking-wider ${autoEnabled ? 'text-lime' : 'text-red'}`}>
              {autoEnabled ? 'EN LÍNEA' : 'SUSPENDIDO'}
            </p>
          </div>
          <button 
            onClick={toggleAutoPromotions}
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg ${
              autoEnabled 
                ? 'bg-lime/20 border border-lime/40 text-lime hover:bg-lime/30 shadow-lime/20' 
                : 'bg-red/20 border border-red/40 text-red hover:bg-red/30 shadow-red/20'
            }`}
          >
            <Power size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 relative z-10">
        {/* ================= NEW PROMO FORM ================= */}
        <section className="col-span-12 xl:col-span-7 relative group p-[1px] rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 via-rose-500/30 to-rose-500/0 opacity-30 group-hover:opacity-100 transition-opacity duration-1000 blur-xl rounded-3xl" />
          <div className="relative bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-royale">
            
            <h2 className="text-sm font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3 mb-8">
              <Plus size={18} className="text-rose-400" />
              Forjar Nueva Promoción
            </h2>

            <div className="space-y-6">
              {/* BASIC INFO */}
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 md:col-span-6 space-y-2 group/input">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 group-hover/input:text-rose-400 transition-colors">Nombre de Campaña</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej. Happy Hour Golden"
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl px-5 h-14 text-sm font-medium text-ivory focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 hover:border-white/20 transition-all outline-none"
                  />
                </div>
                
                <div className="col-span-6 md:col-span-3 space-y-2 group/input">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 group-hover/input:text-rose-400 transition-colors">Tipo</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl px-5 h-14 text-sm font-medium text-ivory focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 hover:border-white/20 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="PERCENT">Descuento (%)</option>
                    <option value="FLAT">Monto Fijo ($)</option>
                    <option value="2X1">Promoción 2x1</option>
                  </select>
                </div>

                <div className="col-span-6 md:col-span-3 space-y-2 group/input">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 group-hover/input:text-rose-400 transition-colors">Valor</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl px-5 h-14 text-sm font-medium text-ivory focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 hover:border-white/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* SCHEDULE */}
              <div className="grid grid-cols-12 gap-5 p-5 rounded-2xl border border-rose-500/10 bg-rose-500/5">
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Clock size={12} /> Rango Horario
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 h-12 text-sm text-ivory outline-none focus:border-rose-400" 
                    />
                    <span className="text-white/30 font-black">-</span>
                    <input 
                      type="time" 
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 h-12 text-sm text-ivory outline-none focus:border-rose-400" 
                    />
                  </div>
                </div>

                <div className="col-span-12 md:col-span-8 space-y-2">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={12} /> Días de Aplicación
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {ALL_DAYS.map((d) => {
                      const active = form.days.includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDay(d)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 border flex-1
                            ${active 
                              ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <PackageSearch size={14} className="text-rose-400" /> Productos Vinculados ({form.applicableProducts.length})
                  </label>
                  <div className="relative w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      placeholder="Buscar producto..."
                      value={searchProd}
                      onChange={e => setSearchProd(e.target.value)}
                      className="w-full h-9 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 text-xs text-white outline-none focus:border-rose-400"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredProducts.map(prod => {
                    const prodId = prod._id || '';
                    const isSelected = form.applicableProducts.includes(prodId);
                    return (
                      <div
                        key={prodId}
                        onClick={() => toggleProduct(prodId)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-rose-500/10 border-rose-500/50 shadow-inner' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="truncate">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-rose-400' : 'text-ivory'}`}>{prod.name}</p>
                          <p className="text-[9px] text-muted font-black tracking-widest uppercase">{prod.category}</p>
                        </div>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={handleCreate}
                disabled={creating}
                className="w-full h-16 bg-gradient-to-r from-rose-600 to-pink-500 text-white font-black text-sm uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:shadow-[0_0_40px_rgba(244,63,94,0.5)] hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-3 mt-4"
              >
                {creating ? <Loader2 size={24} className="animate-spin" /> : "Desplegar Promoción"}
              </button>
            </div>
          </div>
        </section>

        {/* ================= ACTIVE PROMOTIONS ================= */}
        <section className="col-span-12 xl:col-span-5 relative group p-[1px] rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-lime/0 via-lime/20 to-lime/0 opacity-30 group-hover:opacity-100 transition-opacity duration-1000 blur-xl rounded-3xl" />
          <div className="relative bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-royale h-full">
            
            <h2 className="text-sm font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3 mb-8">
              <Tag size={18} className="text-lime" />
              Campañas en Ejecución
            </h2>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {promotions.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center">
                  <Tag size={32} className="text-white/20 mb-4" />
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">No hay campañas activas</p>
                </div>
              ) : (
                promotions.map((promo) => (
                  <div key={promo._id} className="p-5 rounded-2xl border border-lime/20 bg-lime/5 group/card relative hover:border-lime/40 transition-all shadow-inner overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-lime/10 rounded-full blur-2xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-ivory font-black text-xl tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                          {promo.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 bg-lime/20 border border-lime/30 text-lime rounded-md text-[10px] font-black tracking-widest shadow-[0_0_10px_rgba(163,230,53,0.2)]">
                            {promo.type === "PERCENT" ? `-${promo.value}%` : promo.type === "FLAT" ? `-$${promo.value}` : promo.type}
                          </span>
                          <span className="text-[10px] text-white/50 font-bold tracking-widest uppercase flex items-center gap-1">
                            <Clock size={10} /> {promo.schedule.startTime} - {promo.schedule.endTime}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(promo._id)}
                        className="w-10 h-10 rounded-xl bg-red/10 border border-red/20 text-red flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all hover:bg-red hover:text-white shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
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
          </div>
        </section>
      </div>
    </div>
  );
}
