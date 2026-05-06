import { useState, useEffect } from "react";
import { pricingService, type Promotion } from "../services/pricingService";
import { Plus, Trash2, Calendar, Clock, Tag, Loader2, Sparkles } from "lucide-react";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "PERCENT",
    value: 10,
    startTime: "16:00",
    endTime: "19:00",
    days: [] as string[]
  });

  const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const data = await pricingService.getPromotions();
      setPromotions(data);
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
    if (!form.name || form.days.length === 0) {
      alert("Por favor completa el nombre y selecciona al menos un día.");
      return;
    }

    try {
      setCreating(true);
      const newPromo = await pricingService.createPromotion({
        name: form.name,
        type: form.type as any,
        value: Number(form.value),
        isActive: true,
        applicableProducts: [],
        schedule: {
          startTime: form.startTime,
          endTime: form.endTime,
          daysOfWeek: form.days
        }
      });
      setPromotions([newPromo, ...promotions]);
      setForm({ ...form, name: "", days: [] });
    } catch (error) {
      console.error(error);
      alert("Error al crear promoción.");
    } finally {
      setCreating(false);
    }
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  if (loading) return <div className="p-10 text-ivory text-sm">Cargando...</div>;

  return (
    <div className="space-y-6 glass-royale p-8 rounded-[3rem] shadow-royale animate-fade-in relative overflow-hidden">
      {/* ATMOSPHERIC GLOW */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-surface-3 border border-white/5 rounded-2xl shadow-inner">
            <Sparkles className="text-rose-400" size={32} />
          </div>
          <div>
            <p className="text-[10px] text-rose-400 font-black uppercase tracking-[0.4em] mb-1">
              Marketing & Operaciones
            </p>
            <h1 className="text-3xl font-black text-ivory tracking-tighter uppercase leading-none">
              Promotions Builder
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 relative z-10">
        {/* ================= NEW PROMO FORM ================= */}
        <section className="col-span-12 xl:col-span-6 bg-surface-3/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-royale">
          <h2 className="text-xs font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3 mb-6">
            <Plus size={16} className="text-rose-400" />
            Nueva Promoción
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Nombre Comercial</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej. Happy Hour Golden"
                className="w-full bg-surface-2 border border-white/10 rounded-2xl px-4 h-12 text-sm text-ivory focus:border-rose-400/50 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Tipo de Ajuste</label>
                <select 
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-surface-2 border border-white/10 rounded-2xl px-4 h-12 text-sm text-ivory focus:border-rose-400/50 focus:outline-none transition-all"
                >
                  <option value="PERCENT">Porcentaje (%)</option>
                  <option value="FLAT">Monto Fijo ($)</option>
                  <option value="2X1">2x1</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Valor</label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  className="w-full bg-surface-2 border border-white/10 rounded-2xl px-4 h-12 text-sm text-ivory focus:border-rose-400/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Clock size={12} className="text-rose-400" /> Hora Inicio
                </label>
                <input 
                  type="time" 
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full bg-surface-2 border border-white/10 rounded-2xl px-4 h-12 text-sm text-ivory focus:border-rose-400/50 focus:outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Clock size={12} className="text-rose-400" /> Hora Fin
                </label>
                <input 
                  type="time" 
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full bg-surface-2 border border-white/10 rounded-2xl px-4 h-12 text-sm text-ivory focus:border-rose-400/50 focus:outline-none transition-all" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar size={12} className="text-rose-400" /> Días Activos
              </label>
              <div className="flex gap-2 flex-wrap">
                {ALL_DAYS.map((d) => {
                  const active = form.days.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border
                        ${active 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
                          : 'bg-surface-2 text-muted border-white/5 hover:border-white/20'}`}
                    >
                      {d.substring(0, 3).toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={handleCreate}
              disabled={creating}
              className="w-full h-14 bg-grad-gold text-bg font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-gold/30 hover:shadow-gold-glow transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {creating ? <Loader2 size={18} className="animate-spin" /> : "Desplegar Promoción"}
            </button>
          </div>
        </section>

        {/* ================= ACTIVE PROMOTIONS ================= */}
        <section className="col-span-12 xl:col-span-6 bg-surface-2 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-royale">
          <h2 className="text-xs font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3 mb-6">
            <Tag size={16} className="text-lime" />
            Campañas Activas
          </h2>
          
          <div className="space-y-4">
            {promotions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-xs text-muted font-bold uppercase tracking-widest">No hay campañas en ejecución</p>
              </div>
            ) : (
              promotions.map((promo) => (
                <div key={promo._id} className="p-5 rounded-2xl border border-lime/20 bg-lime/5 group relative hover:border-lime/40 transition-all shadow-inner">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-ivory font-black text-lg tracking-tight uppercase">{promo.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-lime/10 text-lime rounded text-[10px] font-black tracking-widest">
                          {promo.type === "PERCENT" ? `-${promo.value}%` : promo.type === "FLAT" ? `-$${promo.value}` : promo.type}
                        </span>
                        <span className="text-[10px] text-muted font-bold tracking-widest uppercase">
                          {promo.schedule.startTime} - {promo.schedule.endTime}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(promo._id)}
                      className="w-8 h-8 rounded-full bg-red/10 text-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex gap-1 mt-3">
                    {promo.schedule.daysOfWeek.map(d => (
                      <span key={d} className="text-[8px] bg-black/40 text-muted px-1.5 py-0.5 rounded font-black uppercase tracking-wider border border-white/5">
                        {d.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
