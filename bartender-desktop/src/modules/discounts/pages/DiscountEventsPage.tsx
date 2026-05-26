import { useState, useEffect } from "react";
import { pricingService, type PricingEvent } from "../services/pricingService";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Activity, Clock, ShieldAlert, AlertCircle, CheckCircle2, Info } from "lucide-react";
import DiscountsSuiteHeader from "../components/DiscountsSuiteHeader";
import DiscountsSuiteTutorial from "../components/DiscountsSuiteTutorial";

export default function NebulaDiscountEventsPage() {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [events, setEvents] = useState<PricingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      const data = await pricingService.getPricingEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelConfig = (level: string) => {
    switch (level) {
      case "ok": 
        return { color: "text-lime", bg: "bg-lime/5", border: "border-lime/20", icon: <CheckCircle2 size={16} className="text-lime" /> };
      case "warn": 
        return { color: "text-amber-400", bg: "bg-amber-400/5", border: "border-amber-400/20", icon: <AlertCircle size={16} className="text-amber-400" /> };
      case "error": 
        return { color: "text-red", bg: "bg-red/5", border: "border-red/20", icon: <ShieldAlert size={16} className="text-red" /> };
      default: 
        return { color: "text-blue-400", bg: "bg-blue-400/5", border: "border-blue-400/20", icon: <Info size={16} className="text-blue-400" /> };
    }
  };

  if (loading) return <div className="p-10 text-ivory text-sm">Cargando...</div>;

  return (
    <div className="discounts-root">
      <div className="discounts-shell glass-royale p-4 md:p-6 rounded-[2rem] shadow-royale animate-fade-in relative overflow-hidden min-h-[80vh]">
      <DiscountsSuiteHeader
        title="Nebula Discount Events"
        subtitle="Trazabilidad y auditoría operativa"
        onOpenTutorial={() => setTutorialOpen(true)}
      />
      {/* ATMOSPHERIC GLOW */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-surface-3 border border-white/5 rounded-2xl shadow-inner">
            <Activity className="text-amber-400" size={32} />
          </div>
          <div>
            <p className="text-[10px] text-amber-400 font-black uppercase tracking-[0.4em] mb-1">
              Registro de Auditoría
            </p>
            <h1 className="text-3xl font-black text-ivory tracking-tighter uppercase leading-none">
              Eventos de Descuento Nebula
            </h1>
            <p className="text-xs text-muted font-bold tracking-widest uppercase mt-2">
              Trazabilidad operativa y de seguridad
            </p>
          </div>
        </div>
      </div>

      <section className="bg-surface-2 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-royale relative z-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <h2 className="text-xs font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3">
            <Clock size={16} className="text-amber-400" />
            Flujo de Eventos
          </h2>
          <span className="px-3 py-1 bg-black/40 border border-white/5 rounded text-[10px] font-black text-lime uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse"></span>
            Auto refresh: 30s
          </span>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-xs text-muted font-bold uppercase tracking-widest">No hay eventos recientes en el sistema.</p>
            </div>
          ) : (
            events.map((event) => {
              const config = getLevelConfig(event.level);
              return (
                <article key={event._id} className={`p-5 rounded-2xl border ${config.bg} ${config.border} flex gap-4 transition-all hover:scale-[1.01]`}>
                  <div className="mt-0.5">
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-black uppercase tracking-wider ${config.color}`}>{event.title}</h3>
                      <span className="text-[10px] text-muted font-bold tracking-widest uppercase">
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                    <p className="text-xs mt-2 text-ivory font-medium leading-relaxed opacity-80">{event.detail}</p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
      <DiscountsSuiteTutorial isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      </div>
    </div>
  );
}
