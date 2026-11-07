/**
 * TableNode — Card individual de mesa.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * - Paleta nueva en todos los estados visuales
 * - Transiciones mejoradas (scale + border glow)
 * - Estado seleccionado más evidente
 * - Sillas dinámicas en vista espacial (lógica sin cambios)
 */
import React from "react";
import {
  CheckCircle, Users, Clock, Lock, Calendar,
  AlertCircle, Coffee, Check, Utensils,
} from "lucide-react";
import type { Table } from "../types/table";

interface TableNodeProps {
  table:          Table;
  selected:       boolean;
  onClick:        () => void;
  viewType?:      "grid" | "spatial";
  isEditMode?:    boolean;
  onDragEnd?:     (id: string, x: number, y: number) => void;
  containerRef?:  React.RefObject<HTMLDivElement | null>;
}

export default function TableNode({
  table, selected, onClick,
  viewType = "grid", isEditMode = false,
  onDragEnd, containerRef,
}: TableNodeProps) {

  /* ── HTML5 Drag & Drop (sin cambios) ───────────────────────── */
  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditMode || viewType !== "spatial") { e.preventDefault(); return; }
    e.dataTransfer.setData("text/plain", table._id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (!isEditMode || viewType !== "spatial" || !onDragEnd || !containerRef?.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const tableNode     = e.target as HTMLElement;
    if (tableNode) {
      const tableRect = tableNode.getBoundingClientRect();
      const centerX   = tableRect.left + tableRect.width / 2;
      const centerY   = tableRect.top  + tableRect.height / 2;
      const newX = ((centerX - containerRect.left) / containerRect.width)  * 100;
      const newY = ((centerY - containerRect.top)  / containerRect.height) * 100;
      onDragEnd(table._id, Math.max(5, Math.min(95, newX)), Math.max(5, Math.min(95, newY)));
    }
  };

  /* ── Cálculos financieros (sin cambios) ────────────────────── */
  const now           = new Date().getTime();
  const openedMinutes = table.openedAt ? Math.floor((now - new Date(table.openedAt).getTime()) / 60000) : 0;
  const totalAmount   = table.totalAmount   || (table.orders?.reduce((s, o) => s + (o.total || 0), 0) || 0);
  const totalItems    = table.totalItems    || table.orders?.length || 0;
  const totalPaid     = table.totalPaid     || table.totalPayments  || 0;
  const balanceDue    = table.balanceDue    !== undefined ? table.balanceDue : Math.max(0, totalAmount - totalPaid);

  /* ── Visual status (lógica sin cambios) ────────────────────── */
  let visualStatus: "available" | "reserved" | "maintenance" |
    "occupied_empty" | "occupied_consuming" | "occupied_partial" | "occupied_paid" = "available";

  if      (table.status === "available")   visualStatus = "available";
  else if (table.status === "reserved")    visualStatus = "reserved";
  else if (table.status === "maintenance") visualStatus = "maintenance";
  else if (table.status === "occupied") {
    if      (totalAmount === 0)                     visualStatus = "occupied_empty";
    else if (balanceDue > 0.01 && totalPaid > 0)    visualStatus = "occupied_partial";
    else if (balanceDue > 0.01)                     visualStatus = "occupied_consuming";
    else if (totalAmount > 0 && balanceDue <= 0.01) visualStatus = "occupied_paid";
    else                                            visualStatus = "occupied_consuming";
  }

  /* ── Config visual por estado — Paleta Slate Elegante ─────── */
  const statusConfig = {
    available: {
      label:       "Disponible",
      color:       "#F0B429",
      bgAlpha:     "rgba(240,180,41,0.06)",
      borderNormal:"rgba(240,180,41,0.20)",
      borderSel:   "#F0B429",
      glowSel:     "0 0 20px rgba(240,180,41,0.35)",
      dotColor:    "#F0B429",
      icon:        <CheckCircle size={14} style={{ color: "#F0B429" }} />,
    },
    reserved: {
      label:       "Reservada",
      color:       "#388BFD",
      bgAlpha:     "rgba(56,139,253,0.06)",
      borderNormal:"rgba(56,139,253,0.20)",
      borderSel:   "#388BFD",
      glowSel:     "0 0 20px rgba(56,139,253,0.35)",
      dotColor:    "#388BFD",
      icon:        <Clock size={14} style={{ color: "#388BFD" }} />,
    },
    maintenance: {
      label:       "Mantenimiento",
      color:       "#F85149",
      bgAlpha:     "rgba(248,81,73,0.06)",
      borderNormal:"rgba(248,81,73,0.20)",
      borderSel:   "#F85149",
      glowSel:     "0 0 20px rgba(248,81,73,0.35)",
      dotColor:    "#F85149",
      icon:        <Lock size={14} style={{ color: "#F85149" }} />,
    },
    occupied_empty: {
      label:       "Abierta",
      color:       "#F0B429",
      bgAlpha:     "rgba(240,180,41,0.08)",
      borderNormal:"rgba(240,180,41,0.25)",
      borderSel:   "#F0B429",
      glowSel:     "0 0 20px rgba(240,180,41,0.40)",
      dotColor:    "#F0B429",
      icon:        <Users size={14} style={{ color: "#F0B429" }} />,
    },
    occupied_consuming: {
      label:       "Consumiendo",
      color:       "#FF7B54",
      bgAlpha:     "rgba(255,123,84,0.08)",
      borderNormal:"rgba(255,123,84,0.25)",
      borderSel:   "#FF7B54",
      glowSel:     "0 0 20px rgba(255,123,84,0.40)",
      dotColor:    "#FF7B54",
      icon:        <Users size={14} style={{ color: "#FF7B54" }} />,
    },
    occupied_partial: {
      label:       "Pago Parcial",
      color:       "#A371F7",
      bgAlpha:     "rgba(163,113,247,0.08)",
      borderNormal:"rgba(163,113,247,0.25)",
      borderSel:   "#A371F7",
      glowSel:     "0 0 20px rgba(163,113,247,0.40)",
      dotColor:    "#A371F7",
      icon:        <Users size={14} style={{ color: "#A371F7" }} />,
    },
    occupied_paid: {
      label:       "Pagada",
      color:       "#3FB950",
      bgAlpha:     "rgba(63,185,80,0.08)",
      borderNormal:"rgba(63,185,80,0.25)",
      borderSel:   "#3FB950",
      glowSel:     "0 0 20px rgba(63,185,80,0.40)",
      dotColor:    "#3FB950",
      icon:        <Users size={14} style={{ color: "#3FB950" }} />,
    },
  };

  const config    = statusConfig[visualStatus];
  const isCircle  = table.shape === "circle";
  const isSquare  = table.shape === "square";

  /* ── Shape classes ──────────────────────────────────────────── */
  let shapeClass = "";
  if (viewType === "grid") {
    shapeClass = isCircle
      ? "aspect-square rounded-full p-4 flex flex-col items-center justify-center text-center"
      : isSquare
      ? "aspect-square rounded-2xl p-4 flex flex-col justify-between"
      : "aspect-[1.4] rounded-2xl p-4 flex flex-col justify-between";
  } else {
    shapeClass = isCircle
      ? "w-full h-full rounded-full p-3 flex flex-col items-center justify-center text-center"
      : "w-full h-full rounded-2xl p-3 flex flex-col justify-between";
  }

  /* ── Coordenadas espaciales (sin cambios) ───────────────────── */
  const getSafeCoordinates = () => {
    if (
      typeof table.x === "number" && typeof table.y === "number" &&
      !isNaN(table.x) && !isNaN(table.y) && (table.x > 0 || table.y > 0)
    ) {
      return { x: Math.max(8, Math.min(92, table.x)), y: Math.max(5, Math.min(90, table.y)) };
    }
    const num   = Math.max(1, table.number || 1);
    const index = num - 1;
    const cols  = 5;
    const col   = index % cols;
    const row   = Math.floor(index / cols);
    let baseX   = 14 + col * 18;
    let baseY   = 20 + row * 22;
    if (table.location === "bar") { baseY = 78; baseX = 18 + (index % 4) * 22; }
    else if (table.location === "outdoor") baseX = Math.min(88, 48 + (col % 3) * 18);
    return { x: Math.max(8, Math.min(92, baseX)), y: Math.max(10, Math.min(90, baseY)) };
  };

  const safeCoords   = getSafeCoordinates();
  const widthVal     = table.width  || 120;
  const heightVal    = table.height || 120;
  const spatialStyle = viewType === "spatial" ? {
    position:  "absolute" as const,
    left:      `${safeCoords.x}%`,
    top:       `${safeCoords.y}%`,
    width:     `${widthVal}px`,
    height:    `${heightVal}px`,
    marginLeft:`-${widthVal / 2}px`,
    marginTop: `-${heightVal / 2}px`,
    zIndex:    selected ? 30 : 10,
  } : {};

  /* ── Sillas dinámicas (lógica sin cambios, colores nuevos) ─── */
  const renderChairs = () => {
    if (viewType !== "spatial") return null;
    const chairs: Array<{ id: string; style: React.CSSProperties; cls: string }> = [];
    const cap = table.capacity || 4;

    if (isCircle) {
      const radius = 54;
      for (let i = 0; i < cap; i++) {
        const angle = (i * 2 * Math.PI) / cap - Math.PI / 2;
        chairs.push({
          id:    `chair-${i}`,
          style: { left: `${50 + Math.cos(angle) * radius}%`, top: `${50 + Math.sin(angle) * radius}%`, transform: "translate(-50%, -50%)" },
          cls:   "rounded-full aspect-square w-3 h-3",
        });
      }
    } else {
      if (cap <= 2) {
        chairs.push({ id: "l", style: { left: "-7px", top: "50%", transform: "translateY(-50%)" }, cls: "w-2 h-5 rounded-l-md" });
        chairs.push({ id: "r", style: { right: "-7px", top: "50%", transform: "translateY(-50%)" }, cls: "w-2 h-5 rounded-r-md" });
      } else if (cap === 3) {
        chairs.push({ id: "t",  style: { top: "-7px",    left: "50%", transform: "translateX(-50%)" }, cls: "w-5 h-2 rounded-t-md" });
        chairs.push({ id: "l",  style: { left: "-7px",   top: "60%",  transform: "translateY(-50%)" }, cls: "w-2 h-4 rounded-l-md" });
        chairs.push({ id: "r",  style: { right: "-7px",  top: "60%",  transform: "translateY(-50%)" }, cls: "w-2 h-4 rounded-r-md" });
      } else if (cap === 4) {
        chairs.push({ id: "t", style: { top: "-7px",    left: "50%", transform: "translateX(-50%)" }, cls: "w-5 h-2 rounded-t-md" });
        chairs.push({ id: "b", style: { bottom: "-7px", left: "50%", transform: "translateX(-50%)" }, cls: "w-5 h-2 rounded-b-md" });
        chairs.push({ id: "l", style: { left: "-7px",   top: "50%",  transform: "translateY(-50%)" }, cls: "w-2 h-5 rounded-l-md" });
        chairs.push({ id: "r", style: { right: "-7px",  top: "50%",  transform: "translateY(-50%)" }, cls: "w-2 h-5 rounded-r-md" });
      } else if (cap <= 6) {
        ["t1","t2","b1","b2"].forEach((id, i) => {
          const isTop    = i < 2;
          const xPos     = i % 2 === 0 ? "30%" : "70%";
          chairs.push({ id, style: isTop ? { top: "-7px", left: xPos, transform: "translateX(-50%)" } : { bottom: "-7px", left: xPos, transform: "translateX(-50%)" }, cls: "w-4 h-2 rounded-t-md" });
        });
        chairs.push({ id: "l", style: { left: "-7px", top: "50%", transform: "translateY(-50%)" }, cls: "w-2 h-4 rounded-l-md" });
        chairs.push({ id: "r", style: { right: "-7px", top: "50%", transform: "translateY(-50%)" }, cls: "w-2 h-4 rounded-r-md" });
      } else {
        ["t1","t2","b1","b2","l1","l2","r1","r2"].forEach((id, i) => {
          const configs = [
            { top: "-7px",    left: "30%", transform: "translateX(-50%)" },
            { top: "-7px",    left: "70%", transform: "translateX(-50%)" },
            { bottom: "-7px", left: "30%", transform: "translateX(-50%)" },
            { bottom: "-7px", left: "70%", transform: "translateX(-50%)" },
            { left: "-7px",   top: "30%",  transform: "translateY(-50%)" },
            { left: "-7px",   top: "70%",  transform: "translateY(-50%)" },
            { right: "-7px",  top: "30%",  transform: "translateY(-50%)" },
            { right: "-7px",  top: "70%",  transform: "translateY(-50%)" },
          ];
          chairs.push({ id, style: configs[i] as React.CSSProperties, cls: i < 4 ? "w-4 h-2 rounded-t-md" : "w-2 h-4 rounded-l-md" });
        });
      }
    }

    let chairBg = "rgba(48,54,61,0.6)";
    let chairBorder = "#30363D";
    if (table.status === "occupied") {
      if (visualStatus === "occupied_paid")      { chairBg = "rgba(63,185,80,0.55)";  chairBorder = "rgba(63,185,80,0.40)"; }
      else if (visualStatus === "occupied_consuming") { chairBg = "rgba(255,123,84,0.55)"; chairBorder = "rgba(255,123,84,0.40)"; }
      else if (visualStatus === "occupied_partial")   { chairBg = "rgba(163,113,247,0.55)"; chairBorder = "rgba(163,113,247,0.40)"; }
      else                                        { chairBg = "rgba(240,180,41,0.45)"; chairBorder = "rgba(240,180,41,0.30)"; }
    } else if (table.status === "reserved") {
      chairBg = "rgba(56,139,253,0.20)"; chairBorder = "rgba(56,139,253,0.30)";
    }

    return (
      <div className="absolute inset-0 pointer-events-none z-0">
        {chairs.map((chair) => (
          <div
            key={chair.id}
            style={{ ...chair.style, background: chairBg, border: `1px solid ${chairBorder}`, transition: "all 0.3s ease" }}
            className={`absolute ${chair.cls}`}
          />
        ))}
      </div>
    );
  };

  /* ── Widgets flotantes de estado (colores nuevos) ───────────── */
  const renderStatusWidget = () => {
    if (table.status !== "occupied") return null;
    if (visualStatus === "occupied_paid") {
      return (
        <div
          className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center z-30 animate-pulse"
          style={{ background: "#3FB950", border: "2px solid #161B22", boxShadow: "0 0 10px rgba(63,185,80,0.5)" }}
          title="Cuenta pagada"
        >
          <Check size={12} style={{ color: "#0D1117", strokeWidth: 3 }} />
        </div>
      );
    }
    if (visualStatus === "occupied_consuming") {
      return (
        <div
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center z-30 animate-bounce"
          style={{ background: "#FF7B54", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 0 8px rgba(255,123,84,0.5)" }}
        >
          {table.location === "bar"
            ? <Coffee  size={9} style={{ color: "#0D1117" }} />
            : <Utensils size={9} style={{ color: "#0D1117" }} />}
        </div>
      );
    }
    if (visualStatus === "occupied_partial") {
      const pct = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
      return (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-30 animate-pulse"
          style={{ background: "#A371F7", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 0 8px rgba(163,113,247,0.5)" }}
          title={`Pago parcial: ${pct}%`}
        >
          <span style={{ fontSize: 7, fontWeight: 900, color: "#fff" }}>{pct}%</span>
        </div>
      );
    }
    return null;
  };

  const formatReservationTime = (iso?: string | null) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  };

  /* ── Estilos del card principal ─────────────────────────────── */
  const cardBg      = selected
    ? `${config.bgAlpha.replace("0.06", "0.12").replace("0.08", "0.14")}`
    : config.bgAlpha;
  const cardBorder  = selected ? config.borderSel : config.borderNormal;
  const cardShadow  = selected ? config.glowSel   : "none";
  const cardScale   = isEditMode ? 1 : undefined;

  return (
    <div
      style={{
        ...spatialStyle,
        background:   cardBg,
        border:       `1.5px solid ${cardBorder}`,
        boxShadow:    cardShadow,
        transform:    selected && !isEditMode ? "translateY(-2px)" : undefined,
        transition:   "all 0.2s ease",
        cursor:       isEditMode ? "move" : "pointer",
        opacity:      isEditMode ? 0.9 : 1,
      }}
      draggable={viewType === "spatial" && isEditMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => { if (!isEditMode) onClick(); }}
      className={`table-node relative ${shapeClass}
        ${isEditMode ? "ring-2 ring-[#F0B429]/40" : "hover:scale-[1.02]"}
        ${selected && !isEditMode ? "ring-1 ring-inset ring-white/10" : ""}
      `}
      onMouseEnter={(e) => {
        if (!selected && !isEditMode) {
          (e.currentTarget as HTMLDivElement).style.borderColor = config.borderSel;
          (e.currentTarget as HTMLDivElement).style.boxShadow   = `0 0 12px ${config.color}25`;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected && !isEditMode) {
          (e.currentTarget as HTMLDivElement).style.borderColor = config.borderNormal;
          (e.currentTarget as HTMLDivElement).style.boxShadow   = "none";
        }
      }}
    >
      {/* Sillas (spatial) */}
      {renderChairs()}

      {/* Widget de estado flotante */}
      {renderStatusWidget()}

      {/* Dot de estado */}
      <div
        className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full animate-pulse z-10"
        style={{ background: config.dotColor, boxShadow: `0 0 5px ${config.dotColor}` }}
      />

      {isCircle ? (
        /* ── Vista circular ─────────────────────────────────── */
        <div className="flex flex-col items-center justify-center h-full w-full relative z-10">
          <div className="text-2xl md:text-3xl font-black leading-none tracking-tighter" style={{ color: "#E6EDF3" }}>
            #{table.number}
          </div>
          <div className="text-[7px] font-black uppercase tracking-[0.2em] mt-0.5" style={{ color: config.color }}>
            {viewType === "spatial" ? `${table.capacity} Pax` : `${table.location} · ${table.capacity}p`}
          </div>
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5 mt-1"
            style={{ background: `${config.color}15`, border: `1px solid ${config.color}30` }}
          >
            <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: config.color }} />
            <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
          {table.status === "occupied" && totalAmount > 0 && (
            <div
              className="mt-1 rounded-full px-2 py-0.5"
              style={{
                background: `${config.color}12`,
                border:     `1px solid ${config.color}25`,
                color:      config.color,
                fontSize:   7,
                fontWeight: 900,
              }}
            >
              ${totalAmount.toFixed(0)}
            </div>
          )}
        </div>
      ) : (
        /* ── Vista rectangular / cuadrada ───────────────────── */
        <>
          {/* Header */}
          <div className="flex justify-between items-start w-full relative z-10">
            <div>
              <div className="text-xl md:text-2xl font-black leading-none tracking-tight" style={{ color: "#E6EDF3" }}>
                #{table.number}
              </div>
              <div className="text-[7px] font-black uppercase tracking-[0.18em] mt-0.5" style={{ color: config.color }}>
                {table.location || "Sin zona"}
              </div>
            </div>

            {/* Timer ocupada */}
            {table.status === "occupied" && table.openedAt && (
              <div
                className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5"
                style={{ background: "rgba(48,54,61,0.8)", border: "1px solid #30363D" }}
              >
                <Clock size={8} style={{ color: "#566270" }} />
                <span className="text-[7px] font-bold" style={{ color: "#8B949E" }}>
                  {openedMinutes}m
                </span>
              </div>
            )}

            {/* Badge reserva */}
            {table.status === "reserved" && table.reservationStart && (
              <div
                className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5"
                style={{ background: "rgba(56,139,253,0.10)", border: "1px solid rgba(56,139,253,0.25)" }}
              >
                <Calendar size={8} style={{ color: "#388BFD" }} />
                <span className="text-[7px] font-bold" style={{ color: "#388BFD" }}>
                  {formatReservationTime(table.reservationStart)}
                </span>
              </div>
            )}
          </div>

          {/* Centro */}
          <div className="my-auto py-1 relative z-10 space-y-1">
            {viewType !== "spatial" && (
              <div className="flex items-center gap-1">
                <Users size={9} style={{ color: "#566270" }} />
                <span className="text-[8px] font-bold" style={{ color: "#8B949E" }}>
                  {table.capacity} {table.capacity === 1 ? "persona" : "personas"}
                </span>
              </div>
            )}
            <div
              className="flex items-center gap-1.5 rounded-md px-2 py-1 w-max"
              style={{ background: `${config.color}15`, border: `1px solid ${config.color}25` }}
            >
              {config.icon}
              <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: config.color }}>
                {config.label}
              </span>
            </div>
            {table.status === "occupied" && totalItems > 0 && (
              <div
                className="flex items-center gap-1 rounded-md px-2 py-1 w-max"
                style={{ background: "rgba(255,123,84,0.10)", border: "1px solid rgba(255,123,84,0.20)" }}
              >
                <span className="text-[7px] font-black uppercase" style={{ color: "#FF7B54" }}>
                  {totalItems} ítems
                </span>
              </div>
            )}
          </div>

          {/* Footer ocupada */}
          {table.status === "occupied" && (
            <div
              className="pt-1.5 w-full flex items-center justify-between relative z-10"
              style={{ borderTop: "1px solid rgba(48,54,61,0.8)" }}
            >
              <div>
                <span className="text-[6.5px] font-bold uppercase tracking-wider" style={{ color: "#566270" }}>
                  Ítems
                </span>
                <div className="text-[10px] font-black" style={{ color: "#8B949E" }}>
                  {totalItems}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[6.5px] font-bold uppercase tracking-wider" style={{ color: "#566270" }}>
                  Total
                </span>
                <div
                  className="text-[11px] font-black"
                  style={{
                    color: totalAmount > 0
                      ? visualStatus === "occupied_paid"    ? "#3FB950"
                      : visualStatus === "occupied_partial" ? "#A371F7"
                      : "#E6EDF3"
                      : "#566270",
                  }}
                >
                  ${totalAmount.toFixed(0)}
                </div>
              </div>
            </div>
          )}

          {/* Código de mesa */}
          {table.status === "occupied" && table.tableCode && viewType === "grid" && (
            <div
              className="mt-1 flex items-center justify-center gap-1 rounded-lg px-2 py-0.5 relative z-10"
              style={{ background: "rgba(240,180,41,0.08)", border: "1px solid rgba(240,180,41,0.25)" }}
            >
              <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: "rgba(240,180,41,0.60)" }}>
                Cód
              </span>
              <span className="text-[10px] font-black font-mono tracking-widest" style={{ color: "#F0B429" }}>
                {table.tableCode}
              </span>
            </div>
          )}
        </>
      )}

      {/* Alerta capacidad */}
      {table.status === "occupied" && table.capacity > 0 && table.orders &&
       table.orders.length >= table.capacity - 1 && (
        <div className="absolute bottom-2 left-2 z-10">
          <AlertCircle size={10} className="animate-pulse" style={{ color: "#FF7B54" }} />
        </div>
      )}
    </div>
  );
}
