"use client";

/**
 * DiscountEventsPage — Log de auditoría del sistema de precios.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Estilo "terminal de logs": limpio, semántico, sin decoraciones.
 * Colores por severidad: verde/naranja/rojo/azul.
 * Auto-refresh cada 30 segundos.
 */
import { useState, useEffect, useRef } from "react";
import { pricingService, type PricingEvent } from "../services/pricingService";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, ShieldAlert, AlertCircle, CheckCircle2, Info, RefreshCw } from "lucide-react";

/* ── Config de severidad ───────────────────────────────────── */
function getLevelConfig(level: string) {
  switch (level) {
    case "ok":
      return {
        color:  "#3FB950",
        bg:     "rgba(63,185,80,0.06)",
        border: "rgba(63,185,80,0.20)",
        icon:   <CheckCircle2 size={15} style={{ color: "#3FB950", flexShrink: 0, marginTop: 1 }} />,
      };
    case "warn":
      return {
        color:  "#FF7B54",
        bg:     "rgba(255,123,84,0.06)",
        border: "rgba(255,123,84,0.20)",
        icon:   <AlertCircle size={15} style={{ color: "#FF7B54", flexShrink: 0, marginTop: 1 }} />,
      };
    case "error":
      return {
        color:  "#F85149",
        bg:     "rgba(248,81,73,0.06)",
        border: "rgba(248,81,73,0.20)",
        icon:   <ShieldAlert size={15} style={{ color: "#F85149", flexShrink: 0, marginTop: 1 }} />,
      };
    default:
      return {
        color:  "#388BFD",
        bg:     "rgba(56,139,253,0.06)",
        border: "rgba(56,139,253,0.20)",
        icon:   <Info size={15} style={{ color: "#388BFD", flexShrink: 0, marginTop: 1 }} />,
      };
  }
}

/* ── Componente ────────────────────────────────────────────── */
export default function DiscountEventsPage() {
  const [events,    setEvents]    = useState<PricingEvent[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [countdown, setCountdown] = useState(30);
  const intervalRef  = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const loadEvents = async () => {
    try {
      const data = await pricingService.getPricingEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setCountdown(30);
    }
  };

  useEffect(() => {
    let mounted = true;

    const doLoad = async () => {
      if (!mounted) return;
      setLoading(true);
      try {
        const data = await pricingService.getPricingEvents();
        if (mounted) { setEvents(data); setLoading(false); setCountdown(30); }
      } catch { if (mounted) setLoading(false); }
    };

    doLoad();
    intervalRef.current = window.setInterval(doLoad, 30000);

    // Countdown visual
    countdownRef.current = window.setInterval(() => {
      if (mounted) setCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);

    return () => {
      mounted = false;
      if (intervalRef.current)  window.clearInterval(intervalRef.current);
      if (countdownRef.current) window.clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0D1117" }}>

      {/* ── Header compacto tipo terminal ──────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid #30363D", background: "#161B22" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-lg"
            style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.25)" }}
          >
            <Clock size={14} style={{ color: "#F0B429" }} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#566270" }}>
              Flujo de eventos · Auditoría del sistema
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Contador visual */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: "#1C2333", border: "1px solid #30363D" }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#3FB950" }} />
            <span className="text-[10px] font-bold" style={{ color: "#566270" }}>
              Actualiza en {countdown}s
            </span>
          </div>

          {/* Refresh manual */}
          <button
            type="button"
            onClick={() => { setLoading(true); loadEvents(); }}
            className="p-2 rounded-lg transition-colors"
            style={{ border: "1px solid #30363D", color: "#566270" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
            title="Actualizar ahora"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Lista de eventos ───────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-2"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
      >
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ opacity: 0.4 }}>
            <div
              className="w-10 h-10 rounded-full border-2 animate-spin"
              style={{ borderColor: "rgba(240,180,41,0.30)", borderTopColor: "#F0B429" }}
            />
            <p className="text-sm" style={{ color: "#566270" }}>Cargando eventos…</p>
          </div>
        ) : events.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-2 text-center rounded-xl"
            style={{ border: "1px dashed #30363D", opacity: 0.50 }}
          >
            <Clock size={28} style={{ color: "#566270" }} />
            <p className="text-sm font-bold" style={{ color: "#566270" }}>
              Sin eventos recientes
            </p>
            <p className="text-xs" style={{ color: "#3D444D" }}>
              El sistema no registró actividad aún
            </p>
          </div>
        ) : (
          events.map((event) => {
            const cfg = getLevelConfig(event.level);
            return (
              <article
                key={event._id}
                className="flex gap-3 p-4 rounded-xl transition-all"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateX(2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "none";
                }}
              >
                {/* Ícono de severidad */}
                {cfg.icon}

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className="text-sm font-bold leading-tight"
                      style={{ color: cfg.color }}
                    >
                      {event.title}
                    </h3>
                    <span
                      className="text-[10px] font-medium flex-shrink-0"
                      style={{ color: "#566270" }}
                    >
                      {formatDistanceToNow(new Date(event.createdAt), {
                        addSuffix: true,
                        locale:    es,
                      })}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-1.5 leading-relaxed"
                    style={{ color: "#8B949E" }}
                  >
                    {event.detail}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* ── Footer con leyenda ─────────────────────────── */}
      <div
        className="flex-shrink-0 px-6 py-3 flex items-center gap-4"
        style={{ borderTop: "1px solid #30363D", background: "#161B22" }}
      >
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#3D444D" }}>
          Leyenda:
        </span>
        {[
          { color: "#3FB950", label: "OK"    },
          { color: "#FF7B54", label: "Aviso" },
          { color: "#F85149", label: "Error" },
          { color: "#388BFD", label: "Info"  },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[9px] font-medium" style={{ color: "#566270" }}>{label}</span>
          </div>
        ))}
        <span className="ml-auto text-[9px]" style={{ color: "#3D444D" }}>
          {events.length} evento{events.length !== 1 ? "s" : ""} registrado{events.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
