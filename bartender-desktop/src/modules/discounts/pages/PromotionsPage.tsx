"use client";

import { useState, useEffect } from "react";
import { pricingService, type Promotion } from "../services/pricingService";
import { getProducts } from "../../products/services/productService";
import type { Product } from "../../../types/product";
import { Plus, Calendar, Clock, Tag, Loader2, Sparkles, Power, PackageSearch, Search, Info } from "lucide-react";
import TourGuide from "../components/TourGuide";
import type { TourStep } from "../components/TourGuide";

export default function NebulaPromotionsPage() {
  const [tourOpen, setTourOpen] = useState(false);
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
      {/* ATMOSPHERIC GLOW */}
      <div className="nebula-discounts-aurora" />

      {/* MASTER SWITCH */}
      <div className="nebula-discounts-panel p-3 rounded-2xl flex items-center gap-4 mb-4" data-tour="master-switch">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 relative z-10">
        {/* =========================
            COLUMNA IZQUIERDA: LISTA DE PROMOCIONES (3 columnas)
        ========================= */}
        <div className="lg:col-span-3">
          <div className="nebula-discounts-panel p-4 rounded-3xl h-full">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan/10 rounded-xl">
                  <Tag size={18} className="text-cyan-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Activas</h3>
              </div>
              <span className="text-xs font-semibold text-cyan bg-cyan/10 px-2 py-1 rounded-full">
                {promotions.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {promotions.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl">
                  <Tag size={24} className="text-white/20 mb-2" />
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Sin campañas</p>
                </div>
              ) : (
                promotions.map((promo) => (
                  <div key={promo._id} className="p-3 rounded-xl border border-cyan/20 bg-cyan/5 hover:border-cyan/40 transition-all cursor-pointer">
                    <p className="text-ivory font-bold text-sm tracking-tight uppercase truncate">
                      {promo.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-cyan/20 border border-cyan/30 text-cyan rounded text-[9px] font-black">
                        {promo.type === "PERCENT" ? `-${promo.value}%` : promo.type === "FLAT" ? `-$${promo.value}` : promo.type}
                      </span>
                      <span className="text-[9px] text-white/50 font-black uppercase">
                        {promo.schedule.startTime} - {promo.schedule.endTime}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDelete(promo._id)}
                      className="w-full mt-2 py-1.5 bg-red/10 border border-red/20 text-red rounded-lg text-[10px] font-black uppercase hover:bg-red hover:text-white transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =========================
            COLUMNA CENTRO: FORMULARIO DE CREACIÓN (6 columnas)
        ========================= */}
        <div className="lg:col-span-6">
          <div className="nebula-discounts-panel p-4 rounded-3xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-violet/10 rounded-xl">
                  <Plus size={18} className="text-violet-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Nueva Promoción</h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* BASIC INFO */}
              <div className="grid grid-cols-12 gap-3" data-tour="promo-type-value">
                <div className="col-span-12 space-y-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1" data-tour="promo-name">Nombre</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej. Happy Hour Golden"
                    className="w-full bg-surface-3 border border-white/10 rounded-xl px-4 h-10 text-sm font-medium text-ivory focus:border-violet-400 outline-none transition-all"
                  />
                </div>
                
                <div className="col-span-6 space-y-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Tipo</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-surface-3 border border-white/10 rounded-xl px-4 h-10 text-sm font-medium text-ivory focus:border-violet-400 outline-none appearance-none cursor-pointer"
                  >
                    <option value="PERCENT">Descuento (%)</option>
                    <option value="FLAT">Monto Fijo ($)</option>
                    <option value="2X1">2x1</option>
                  </select>
                </div>

                <div className="col-span-6 space-y-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Valor</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    className="w-full bg-surface-3 border border-white/10 rounded-xl px-4 h-10 text-sm font-medium text-ivory focus:border-violet-400 outline-none"
                  />
                </div>
              </div>

              {/* SCHEDULE */}
              <div className="grid grid-cols-12 gap-3 p-3 rounded-xl border border-violet/20 bg-violet/5" data-tour="promo-schedule">
                <div className="col-span-12 md:col-span-5 space-y-1.5">
                  <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Clock size={12} /> Horario
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 h-9 text-sm text-ivory outline-none focus:border-violet-400" 
                    />
                    <span className="text-white/30 font-black">-</span>
                    <input 
                      type="time" 
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full bg-surface-3 border border-white/10 rounded-lg px-3 h-9 text-sm text-ivory outline-none focus:border-violet-400" 
                    />
                  </div>
                </div>

                <div className="col-span-12 md:col-span-7 space-y-1.5" data-tour="promo-days">
                  <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={12} /> Días
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {ALL_DAYS.map((d) => {
                      const active = form.days.includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDay(d)}
                          className={`px-2 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all border flex-1
                            ${active 
                              ? 'bg-violet-500 text-white border-violet-400' 
                              : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
                        >
                          {d.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PRODUCT SELECTOR */}
              <div className="space-y-2" data-tour="promo-products">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <PackageSearch size={12} className="text-violet-400" /> Productos ({form.applicableProducts.length})
                  </label>
                  <div className="relative w-48">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      placeholder="Buscar..."
                      value={searchProd}
                      onChange={e => setSearchProd(e.target.value)}
                      className="w-full h-8 bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 text-xs text-white outline-none focus:border-violet-400"
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
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-violet-500/10 border-violet-500/50' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="truncate">
                          <p className={`text-[10px] font-bold truncate ${isSelected ? 'text-violet-400' : 'text-ivory'}`}>{prod.name}</p>
                          <p className="text-[8px] text-muted font-black uppercase">{prod.category}</p>
                        </div>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={handleCreate}
                disabled={creating}
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                data-tour="promo-create-btn"
              >
                {creating ? <Loader2 size={18} className="animate-spin" /> : "Crear Promoción"}
              </button>
            </div>
          </div>
        </div>

        {/* =========================
            COLUMNA DERECHA: CONFIGURACIÓN (3 columnas)
        ========================= */}
        <div className="lg:col-span-3">
          <div className="flex flex-col gap-4">
            {/* MASTER SWITCH */}
            <div className="nebula-discounts-panel p-4 rounded-3xl" data-tour="master-switch">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-lime/10 rounded-xl">
                  <Power size={18} className="text-lime" />
                </div>
                <h3 className="text-sm font-bold text-white">Motor</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted font-black uppercase tracking-widest">Estado</p>
                  <p className={`text-sm font-black uppercase tracking-wider ${autoEnabled ? 'text-lime' : 'text-red'}`}>
                    {autoEnabled ? 'EN LÍNEA' : 'SUSPENDIDO'}
                  </p>
                </div>
                <button 
                  onClick={toggleAutoPromotions}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                    autoEnabled 
                      ? 'bg-lime/20 border border-lime/40 text-lime hover:bg-lime/30' 
                      : 'bg-red/20 border border-red/40 text-red hover:bg-red/30'
                  }`}
                >
                  <Power size={20} />
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="nebula-discounts-panel p-4 rounded-3xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-violet/10 rounded-xl">
                  <Sparkles size={18} className="text-violet-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Resumen</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-muted font-black uppercase tracking-widest">Activas</p>
                  <p className="text-2xl font-bold text-white">{promotions.length}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-muted font-black uppercase tracking-widest">Productos</p>
                  <p className="text-2xl font-bold text-white">{products.length}</p>
                </div>
              </div>
            </div>

            {/* INFO */}
            <div className="nebula-discounts-panel p-4 rounded-3xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-cyan/10 rounded-xl">
                  <Info size={18} className="text-cyan-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Info</h3>
              </div>
              <div className="text-[10px] text-muted space-y-2">
                <p>Las promociones se aplican automáticamente según el horario configurado.</p>
                <p>Selecciona al menos un producto para cada promoción.</p>
              </div>
            </div>
          </div>
        </div>
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


