import React from "react";
import { 
  CheckCircle, 
  Users, 
  Clock, 
  Lock, 
  Calendar,
  AlertCircle,
  Coffee,
  Check,
  Utensils
} from "lucide-react";
import type { Table } from "../types/table";

interface TableNodeProps {
  table: Table;
  selected: boolean;
  onClick: () => void;
  viewType?: "grid" | "spatial";
  isEditMode?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export default function TableNode({ 
  table, 
  selected, 
  onClick, 
  viewType = "grid", 
  isEditMode = false, 
  onDragEnd, 
  containerRef 
}: TableNodeProps) {
  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditMode || viewType !== "spatial") {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", table._id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (!isEditMode || viewType !== "spatial" || !onDragEnd || !containerRef?.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tableNode = e.target as HTMLElement;
    
    if (tableNode) {
      const tableRect = tableNode.getBoundingClientRect();
      const centerX = tableRect.left + tableRect.width / 2;
      const centerY = tableRect.top + tableRect.height / 2;
      
      const newX = ((centerX - containerRect.left) / containerRect.width) * 100;
      const newY = ((centerY - containerRect.top) / containerRect.height) * 100;
      
      const clampedX = Math.max(5, Math.min(95, newX));
      const clampedY = Math.max(5, Math.min(95, newY));
      
      onDragEnd(table._id, clampedX, clampedY);
    }
  };

  // Usar valores calculados por el backend si están disponibles
  const totalAmount = table.totalAmount || (table.orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0);
  const totalItems = table.totalItems || table.orders?.length || 0;
  const totalPaid = table.totalPayments || 0;
  
  let visualStatus: "available" | "reserved" | "maintenance" | "occupied_empty" | "occupied_consuming" | "occupied_partial" | "occupied_paid" = "available";

  if (table.status === "available") {
    visualStatus = "available";
  } else if (table.status === "reserved") {
    visualStatus = "reserved";
  } else if (table.status === "maintenance") {
    visualStatus = "maintenance";
  } else if (table.status === "occupied") {
    if (totalAmount === 0) {
      visualStatus = "occupied_empty";
    } else if (totalPaid === 0) {
      visualStatus = "occupied_consuming";
    } else if (totalPaid < totalAmount) {
      visualStatus = "occupied_partial";
    } else {
      visualStatus = "occupied_paid";
    }
  }

  const statusConfig = {
    available: {
      icon: <CheckCircle size={16} className="text-gold" />,
      label: "Disponible",
      color: "text-gold",
      bgColor: "bg-gold/5",
      borderColor: selected ? "border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]" : "border-gold/20 hover:border-gold/40",
      glow: selected ? "shadow-[0_0_15px_rgba(212,175,55,0.2)]" : "",
      badgeColor: "bg-gold/15 text-gold border-gold/30"
    },
    reserved: {
      icon: <Clock size={16} className="text-blue-400" />,
      label: "Reservada",
      color: "text-blue-400",
      bgColor: "bg-blue-400/5",
      borderColor: selected ? "border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]" : "border-blue-400/20 hover:border-blue-400/40",
      glow: selected ? "shadow-[0_0_15px_rgba(96,165,250,0.2)]" : "",
      badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30"
    },
    maintenance: {
      icon: <Lock size={16} className="text-red-500" />,
      label: "Mantenimiento",
      color: "text-red-500",
      bgColor: "bg-red-500/5",
      borderColor: selected ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "border-red-500/20 hover:border-red-500/40",
      glow: selected ? "shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "",
      badgeColor: "bg-red-500/15 text-red-400 border-red-500/30"
    },
    occupied_empty: {
      icon: <Users size={16} className="text-amber-400" />,
      label: "Abierta",
      color: "text-amber-400",
      bgColor: "bg-amber-400/5",
      borderColor: selected ? "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]" : "border-amber-400/20 hover:border-amber-400/40",
      glow: selected ? "shadow-[0_0_15px_rgba(251,191,36,0.2)]" : "",
      badgeColor: "bg-amber-400/15 text-amber-400 border-amber-400/30"
    },
    occupied_consuming: {
      icon: <Users size={16} className="text-orange" />,
      label: "Consumiendo",
      color: "text-orange",
      bgColor: "bg-orange/5",
      borderColor: selected ? "border-orange shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "border-orange/20 hover:border-orange/40",
      glow: selected ? "shadow-[0_0_15px_rgba(249,115,22,0.2)]" : "",
      badgeColor: "bg-orange/15 text-orange border-orange/30"
    },
    occupied_partial: {
      icon: <Users size={16} className="text-purple-400" />,
      label: "Pago Parcial",
      color: "text-purple-400",
      bgColor: "bg-purple-400/5",
      borderColor: selected ? "border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.4)] animate-pulse" : "border-purple-400/20 hover:border-purple-400/40",
      glow: selected ? "shadow-[0_0_15px_rgba(192,132,252,0.2)]" : "",
      badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30"
    },
    occupied_paid: {
      icon: <Users size={16} className="text-emerald-400" />,
      label: "Pagada",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/5",
      borderColor: selected ? "border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-pulse" : "border-emerald-400/20 hover:border-emerald-400/40",
      glow: selected ? "shadow-[0_0_15px_rgba(52,211,153,0.2)]" : "",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    }
  };

  const config = statusConfig[visualStatus] || statusConfig.available;

  // Formatear hora de reserva
  const formatReservationTime = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Clases CSS específicas de formas físicas
  const isCircle = table.shape === "circle";
  const isSquare = table.shape === "square";

  // Determinar clases de forma basados en la vista
  let shapeClass = "";
  if (viewType === "grid") {
    shapeClass = "aspect-[1.4] rounded-[2rem] p-4 md:p-6 flex flex-col justify-between";
    if (isCircle) {
      shapeClass = "aspect-square rounded-full p-4 flex flex-col items-center justify-center text-center";
    } else if (isSquare) {
      shapeClass = "aspect-square rounded-3xl p-4 md:p-6 flex flex-col justify-between";
    }
  } else {
    // Spatial: No aspect ratio because sizes are absolute
    shapeClass = "w-full h-full p-4 flex flex-col justify-between";
    if (isCircle) {
      shapeClass = "w-full h-full rounded-full p-4 flex flex-col items-center justify-center text-center";
    } else if (isSquare) {
      shapeClass = "w-full h-full rounded-3xl p-4 flex flex-col justify-between";
    } else {
      shapeClass = "w-full h-full rounded-[2rem] p-4 flex flex-col justify-between";
    }
  }

  // Estilos de texturas de salón realistas
  let textureStyle = "from-neutral-900/90 to-neutral-950/90 border-white/5";
  if (table.location === "indoor") {
    // Madera elegante oscura
    textureStyle = "from-amber-950/80 to-neutral-900/90 border-amber-900/20";
  } else if (table.location === "outdoor") {
    // Piedra/terraza fresca
    textureStyle = "from-stone-800/80 to-neutral-950/90 border-stone-700/20";
  } else if (table.location === "bar") {
    // Barra de metal/mahogany oscuro
    textureStyle = "from-amber-900/70 to-neutral-950/95 border-amber-800/20";
  }

  // Estilos de posicionamiento espacial absoluto
  const widthVal = table.width || 120;
  const heightVal = table.height || 120;
  const spatialStyle = viewType === "spatial" ? {
    position: "absolute" as const,
    left: `${table.x}%`,
    top: `${table.y}%`,
    width: `${widthVal}px`,
    height: `${heightVal}px`,
    marginLeft: `-${widthVal / 2}px`,
    marginTop: `-${heightVal / 2}px`,
    zIndex: selected ? 30 : 10,
  } : {};

  // Generar sillas dinámicas a los costados
  const renderChairs = () => {
    if (viewType !== "spatial") return null;

    const chairs: Array<{ id: string; style: React.CSSProperties; sideClass: string }> = [];
    const capacity = table.capacity || 4;

    if (isCircle) {
      const radius = 54; // porcentaje del radio para colocarlas ligeramente afuera
      for (let i = 0; i < capacity; i++) {
        const angle = (i * 2 * Math.PI) / capacity - Math.PI / 2; // Iniciar desde arriba
        const cX = 50 + Math.cos(angle) * radius;
        const cY = 50 + Math.sin(angle) * radius;
        chairs.push({
          id: `chair-${i}`,
          style: {
            left: `${cX}%`,
            top: `${cY}%`,
            transform: "translate(-50%, -50%)",
          },
          sideClass: "rounded-full aspect-square w-3.5 h-3.5"
        });
      }
    } else {
      // Cuadrado / Rectángulo
      if (capacity <= 2) {
        // Izquierda y Derecha
        chairs.push({ id: "left", style: { left: "-8px", top: "50%", transform: "translateY(-50%)" }, sideClass: "w-2 h-5 rounded-l-md" });
        chairs.push({ id: "right", style: { right: "-8px", top: "50%", transform: "translateY(-50%)" }, sideClass: "w-2 h-5 rounded-r-md" });
      } else if (capacity === 3) {
        // Top, Izquierda, Derecha
        chairs.push({ id: "top", style: { top: "-8px", left: "50%", transform: "translateX(-50%)" }, sideClass: "w-5 h-2 rounded-t-md" });
        chairs.push({ id: "left", style: { left: "-8px", top: "60%", transform: "translateY(-50%)" }, sideClass: "w-2 h-4 rounded-l-md" });
        chairs.push({ id: "right", style: { right: "-8px", top: "60%", transform: "translateY(-50%)" }, sideClass: "w-2 h-4 rounded-r-md" });
      } else if (capacity === 4) {
        // Uno en cada borde
        chairs.push({ id: "top", style: { top: "-8px", left: "50%", transform: "translateX(-50%)" }, sideClass: "w-5 h-2 rounded-t-md" });
        chairs.push({ id: "bottom", style: { bottom: "-8px", left: "50%", transform: "translateX(-50%)" }, sideClass: "w-5 h-2 rounded-b-md" });
        chairs.push({ id: "left", style: { left: "-8px", top: "50%", transform: "translateY(-50%)" }, sideClass: "w-2 h-5 rounded-l-md" });
        chairs.push({ id: "right", style: { right: "-8px", top: "50%", transform: "translateY(-50%)" }, sideClass: "w-2 h-5 rounded-r-md" });
      } else if (capacity <= 6) {
        // 2 Arriba, 2 Abajo, 1 Izquierda, 1 Derecha
        chairs.push({ id: "top-1", style: { top: "-8px", left: "30%", transform: "translateX(-50%)" }, sideClass: "w-4 h-2 rounded-t-md" });
        chairs.push({ id: "top-2", style: { top: "-8px", left: "70%", transform: "translateX(-50%)" }, sideClass: "w-4 h-2 rounded-t-md" });
        chairs.push({ id: "bottom-1", style: { bottom: "-8px", left: "30%", transform: "translateX(-50%)" }, sideClass: "w-4 h-2 rounded-b-md" });
        chairs.push({ id: "bottom-2", style: { bottom: "-8px", left: "70%", transform: "translateX(-50%)" }, sideClass: "w-4 h-2 rounded-b-md" });
        chairs.push({ id: "left", style: { left: "-8px", top: "50%", transform: "translateY(-50%)" }, sideClass: "w-2 h-4 rounded-l-md" });
        chairs.push({ id: "right", style: { right: "-8px", top: "50%", transform: "translateY(-50%)" }, sideClass: "w-2 h-4 rounded-r-md" });
      } else {
        // 8 o más: 2 en cada borde
        chairs.push({ id: "top-1", style: { top: "-8px", left: "30%", transform: "translateX(-50%)" }, sideClass: "w-4 h-2 rounded-t-md" });
        chairs.push({ id: "top-2", style: { top: "-8px", left: "70%", transform: "translateX(-50%)" }, sideClass: "w-4 h-2 rounded-t-md" });
        chairs.push({ id: "bottom-1", style: { bottom: "-8px", left: "30%", transform: "translateX(-50%)" }, sideClass: "w-4 h-2 rounded-b-md" });
        chairs.push({ id: "bottom-2", style: { bottom: "-8px", left: "70%", transform: "translateX(-50%)" }, sideClass: "w-4 h-2 rounded-b-md" });
        chairs.push({ id: "left-1", style: { left: "-8px", top: "30%", transform: "translateY(-50%)" }, sideClass: "w-2 h-4 rounded-l-md" });
        chairs.push({ id: "left-2", style: { left: "-8px", top: "70%", transform: "translateY(-50%)" }, sideClass: "w-2 h-4 rounded-l-md" });
        chairs.push({ id: "right-1", style: { right: "-8px", top: "30%", transform: "translateY(-50%)" }, sideClass: "w-2 h-4 rounded-r-md" });
        chairs.push({ id: "right-2", style: { right: "-8px", top: "70%", transform: "translateY(-50%)" }, sideClass: "w-2 h-4 rounded-r-md" });
      }
    }

    const isOccupied = table.status === "occupied";
    let chairBg = "bg-white/10 border-white/20";
    if (isOccupied) {
      if (visualStatus === "occupied_paid") {
        chairBg = "bg-emerald-500/60 border-emerald-400/40 shadow-[0_0_6px_rgba(52,211,153,0.4)]";
      } else if (visualStatus === "occupied_consuming") {
        chairBg = "bg-orange/60 border-orange/40 shadow-[0_0_6px_rgba(249,115,22,0.4)]";
      } else if (visualStatus === "occupied_partial") {
        chairBg = "bg-purple-500/60 border-purple-400/40 shadow-[0_0_6px_rgba(192,132,252,0.4)]";
      } else {
        chairBg = "bg-amber-500/60 border-amber-400/40";
      }
    } else if (table.status === "reserved") {
      chairBg = "bg-blue-500/20 border-blue-400/30";
    }

    return (
      <div className="absolute inset-0 pointer-events-none z-0">
        {chairs.map((chair) => (
          <div
            key={chair.id}
            style={chair.style}
            className={`absolute border transition-all duration-300 ${chairBg} ${chair.sideClass}`}
          />
        ))}
      </div>
    );
  };

  // Icono o widget de micro-estado dinámico
  const renderDynamicStatusWidget = () => {
    if (table.status !== "occupied") return null;

    if (visualStatus === "occupied_paid") {
      // Estado Pagada: Gran check verde vibrante
      return (
        <div 
          className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg shadow-emerald-500/40 z-30 animate-pulse"
          title="Cuenta Pagada - Lista para Limpieza"
        >
          <Check size={14} className="text-white font-black stroke-[3.5]" />
        </div>
      );
    }

    if (visualStatus === "occupied_consuming") {
      // Estado Consumiendo: Bebida o Comida flotando
      return (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange border border-white/20 flex items-center justify-center shadow-md z-30 animate-bounce"
        >
          {table.location === "bar" ? (
            <Coffee size={11} className="text-white fill-current" />
          ) : (
            <Utensils size={11} className="text-white" />
          )}
        </div>
      );
    }

    if (visualStatus === "occupied_partial") {
      // Pago parcial: Porcentaje en widget flotante
      const percentPaid = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
      return (
        <div
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-purple-600 border border-white/20 flex items-center justify-center shadow-md z-30 animate-pulse"
          title={`Pago Parcial: ${percentPaid.toFixed(0)}%`}
        >
          <span className="text-[8px] font-black text-white">{percentPaid.toFixed(0)}%</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      style={spatialStyle}
      // HTML5 Drag and Drop - conventional web standard
      draggable={viewType === "spatial" && isEditMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => {
        if (!isEditMode) onClick();
      }}
      className={`
        table-node relative bg-gradient-to-br ${textureStyle} 
        border ${config.borderColor} ${config.glow}
        ${isEditMode ? 'cursor-move opacity-90 ring-2 ring-gold/40 border-dashed border-gold/60' : 'cursor-pointer hover:scale-102'}
        backdrop-blur-sm transition-all duration-200
        ${shapeClass}
        ${selected && !isEditMode ? 'ring-2 ring-inset ring-white/20' : ''}
      `}
    >
      {/* Dynamic Sillas (Only visible in spatial mode) */}
      {renderChairs()}

      {/* Floating status widgets */}
      {renderDynamicStatusWidget()}

      {/* Background Micro Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
           style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '8px 8px' }} />

      {/* Corner Status Glow Dot */}
      <div className={`absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full ${config.color} animate-pulse z-10`} />

      {isCircle ? (
        <div className="flex flex-col items-center justify-center h-full w-full relative z-10">
          {/* Table Number */}
          <div className="text-3xl md:text-4xl font-black text-white leading-none tracking-tighter mb-0.5">
            #{table.number}
          </div>
          
          {/* Capacity or dimensions (extremely compact in spatial) */}
          <div className="text-[7.5px] font-black uppercase tracking-widest text-white/50 mb-1.5">
            {viewType === "spatial" ? `${table.capacity} Pax` : `${table.location || "Indoor"} · ${table.capacity} Pax`}
          </div>

          {/* Status Badge - Compact */}
          <div className={`flex items-center gap-1 ${config.bgColor} rounded-full px-2 py-0.5 border border-white/5`}>
            <span className={`w-1 h-1 rounded-full ${config.color} animate-pulse`} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${config.color}`}>
              {config.label}
            </span>
          </div>

          {/* Time & Total in Spatial */}
          {table.status === "occupied" && (
            <div className="mt-1.5 flex items-center gap-1">
              {table.openedAt && viewType !== "spatial" && (
                <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-full px-1.5 py-0.5">
                  <Clock size={8} className="text-white/60" />
                  <span className="text-[7px] font-bold text-white/60">
                    {Math.floor((Date.now() - new Date(table.openedAt).getTime()) / 60000)}m
                  </span>
                </div>
              )}
              {totalAmount > 0 && (
                <div className={`flex items-center gap-1 border rounded-full px-2 py-0.5 ${
                  visualStatus === "occupied_paid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                  visualStatus === "occupied_partial" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                  "bg-white/5 border-white/10 text-white/60"
                }`}>
                  <span className="text-[7.5px] font-black">
                    ${totalAmount.toFixed(0)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reservation Start Details */}
          {table.status === "reserved" && table.reservationStart && (
            <div className="mt-1 flex items-center gap-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-1.5 py-0.5">
              <Calendar size={8} className="text-blue-400" />
              <span className="text-[7px] font-bold text-blue-400">
                {formatReservationTime(table.reservationStart)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-start w-full relative z-10">
            <div>
              <div className="text-xl md:text-3xl font-black text-white leading-none tracking-tighter">
                #{table.number}
              </div>
              <div className={`text-[7.5px] font-black uppercase tracking-[0.2em] ${config.color} mt-0.5`}>
                {table.location || "Sin Zona"}
              </div>
            </div>
            
            {/* Session time or reservation badge top-right */}
            {table.status === "occupied" && table.openedAt && (
              <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-md px-1.5 py-0.5">
                <Clock size={8} className="text-white/40" />
                <span className="text-[7.5px] font-bold text-white/60">
                  {Math.floor((Date.now() - new Date(table.openedAt).getTime()) / 60000)}m
                </span>
              </div>
            )}
            
            {table.status === "reserved" && table.reservationStart && (
              <div className="flex items-center gap-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md px-1.5 py-0.5">
                <Calendar size={8} className="text-blue-500" />
                <span className="text-[7.5px] font-bold text-blue-500">
                  {formatReservationTime(table.reservationStart)}
                </span>
              </div>
            )}
          </div>

          {/* Middle: Capacity & status info */}
          <div className="my-auto py-1 relative z-10">
            {/* Capacidad */}
            {viewType !== "spatial" && (
              <div className="flex items-center gap-1 mb-1">
                <Users size={10} className="text-white/40" />
                <span className="text-[8px] md:text-[9.5px] font-bold text-white/60">
                  {table.capacity} {table.capacity === 1 ? 'Persona' : 'Personas'}
                </span>
              </div>
            )}

            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 ${config.bgColor} rounded-md px-2 py-1 w-max border border-white/5`}>
              {config.icon}
              <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest ${config.color}`}>
                {config.label}
              </span>
            </div>
          </div>

          {/* Footer: Orders detail / warning */}
          {table.status === "occupied" && (
            <div className="pt-1.5 border-t border-white/5 w-full flex items-center justify-between relative z-10">
              <div className="flex flex-col">
                <span className="text-[6.5px] md:text-[7.5px] font-bold text-white/30 uppercase tracking-wider">
                  Items
                </span>
                <span className="text-[10px] md:text-[11px] font-black text-white/70">
                  {totalItems}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[6.5px] md:text-[7.5px] font-bold text-white/30 uppercase tracking-wider">
                  Total
                </span>
                <span className={`text-[10px] md:text-[11px] font-black ${
                  visualStatus === "occupied_paid" ? "text-emerald-400" :
                  visualStatus === "occupied_partial" ? "text-purple-400" : "text-white/80"
                }`}>
                  ${totalAmount.toFixed(0)}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Warning for tables near capacity */}
      {table.status === "occupied" && table.capacity > 0 && table.orders && table.orders.length >= table.capacity - 1 && (
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <AlertCircle size={10} className="text-orange animate-pulse" />
        </div>
      )}
    </div>
  );
}
