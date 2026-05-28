import { useState, useEffect, useCallback } from "react";
import OrderList from "../components/OrderList";
import OrderDetails from "../components/OrderDetails";
import DiscountKeypad from "../components/DiscountKeypad";
import DiscountReasonForm from "../components/DiscountReasonForm";
import DiscountStats from "../components/DiscountStats";

import { useDiscount } from "../hooks/useDiscount";
import { discountService } from "../services/discountService";
import DiscountsSuiteHeader from "../components/DiscountsSuiteHeader";
import TourGuide from "../components/TourGuide";
import type { TourStep } from "../components/TourGuide";

import type { Order, SelectedItem } from "../types/discounts";
import { Sparkles, Save, Loader2, Info, CheckCircle, ChevronDown, ChevronUp, Zap, X, RefreshCw, HelpCircle } from "lucide-react";

export default function NebulaDiscountPage() {
  const [mode, setMode] = useState<"simple" | "advanced">(() => {
    try {
      const v = localStorage.getItem("nebula_discount_mode");
      return v === "advanced" ? "advanced" : "simple";
    } catch {
      return "simple";
    }
  });
  const [tourOpen, setTourOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingApply, setLoadingApply] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    todayTotal: 0,
    averagePercent: 0,
    appliedCount: 0,
  });
  
  // Estados mejorados para UX
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);
  const [seccionesColapsadas, setSeccionesColapsadas] = useState({
    ordenes: false,
    detalles: false,
    descuento: false,
    razon: false,
    estadisticas: true
  });
  const [compactMode, setCompactMode] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todas" | "en-curso" | "completadas">("todas");

  useEffect(() => {
    try {
      localStorage.setItem("nebula_discount_mode", mode);
    } catch {
      // ignore
    }
  }, [mode]);

  // Tour steps configuration
  const tourSteps: TourStep[] = [
    {
      target: "[data-tour='mode-toggle']",
      title: "Modo de Operación",
      content: "Selecciona entre modo Simple (básico) o Avanzado (con estadísticas y pasos detallados).",
      position: "bottom"
    },
    {
      target: "[data-tour='orders-list']",
      title: "Órdenes Activas",
      content: "Lista de todas las órdenes activas en el sistema. Usa la búsqueda para filtrar por mesa o producto.",
      position: "right"
    },
    {
      target: "[data-tour='order-details']",
      title: "Detalles de Orden",
      content: "Muestra los items de la orden seleccionada. Marca los items a los que quieres aplicar el descuento.",
      position: "left"
    },
    {
      target: "[data-tour='discount-keypad']",
      title: "Teclado de Descuentos",
      content: "Selecciona el tipo de descuento (porcentaje o monto fijo) e ingresa el valor usando el teclado numérico.",
      position: "left"
    },
    {
      target: "[data-tour='discount-summary']",
      title: "Resumen del Descuento",
      content: "Vista previa del cálculo: subtotal, descuento aplicado y total final a pagar.",
      position: "left"
    },
    {
      target: "[data-tour='discount-reason']",
      title: "Motivo del Descuento",
      content: "Selecciona el motivo del descuento (ej: competencia, cortesía) y agrega notas adicionales si es necesario.",
      position: "left"
    },
    {
      target: "[data-tour='apply-btn']",
      title: "Aplicar Descuento",
      content: "Confirma y aplica el descuento a la orden seleccionada. Esta acción es irreversible.",
      position: "top"
    },
    {
      target: "[data-tour='quick-actions']",
      title: "Acciones Rápidas",
      content: "Botones para aplicar descuentos predefinidos rápidamente (-10%, -15%) y actualizar la lista de órdenes.",
      position: "bottom"
    },
    {
      target: "[data-tour='stats-section']",
      title: "Estadísticas del Día",
      content: "Resumen de descuentos aplicados hoy: total, promedio y cantidad. Solo visible en modo avanzado.",
      position: "top"
    }
  ];

  /* =========================
     HOOK CENTRAL NEBULA
  ========================= */
  const discount = useDiscount({ items });

  /* =========================
     FUNCIONES AUXILIARES
  ========================= */
  const toggleSeccion = (seccion: keyof typeof seccionesColapsadas) => {
    setSeccionesColapsadas(prev => ({ ...prev, [seccion]: !prev[seccion] }));
  };

  const aplicarDescuentoRapido = useCallback(async (porcentaje: number) => {
    if (!selectedOrder) return;
    
    try {
      // Seleccionar todos los items
      const todosSeleccionados = items.map(i => ({ ...i, selected: true }));
      setItems(todosSeleccionados);
      
      // Configurar descuento rápido
      discount.setType("PERCENT");
      discount.setValue(porcentaje.toString());
      discount.setReason("COMP");
      
      setPasoActual(3);
    } catch {
      setError("Error al aplicar descuento rápido");
    }
  }, [selectedOrder, items, discount]);

  const reiniciarFormulario = useCallback(() => {
    discount.reset();
    setPasoActual(1);
    setError(null);
    setFeedback(null);
  }, [discount]);

  /* =========================
     FILTRADO Y BÚSQUEDA
  ========================= */
  const ordenesFiltradas = orders.filter(orden => {
    const coincideBusqueda = busqueda === "" || 
      orden.table.toString().toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.items.some(item => item.name.toLowerCase().includes(busqueda.toLowerCase()));
    
    const coincideEstado = filtroEstado === "todas" || 
      (filtroEstado === "en-curso" && orden.status !== "completed") ||
      (filtroEstado === "completadas" && orden.status === "completed");
    
    return coincideBusqueda && coincideEstado;
  });

  const cargarOrdenes = async () => {
    try {
      setLoadingOrders(true);
      const datos = await discountService.getActiveOrders();
      setOrders(datos);

      setSelectedOrder((prev) => {
        if (!prev) return datos[0] ?? null;
        return datos.find((o) => o._id === prev._id) ?? datos[0] ?? null;
      });
    } catch (err: any) {
      setError(err.message || "Error al cargar órdenes");
    } finally {
      setLoadingOrders(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      setLoadingStats(true);
      const datos = await discountService.getTodayStats();
      setStats(datos);
    } catch {
      // las estadísticas no deben bloquear la pantalla
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    cargarOrdenes();
    cargarEstadisticas();
  }, []);

  /* =========================
     CUANDO CAMBIA LA ORDEN
  ========================= */
  useEffect(() => {
    if (!selectedOrder) {
      setPasoActual(1);
      return;
    }

    const itemsMapeados: SelectedItem[] = selectedOrder.items.map((item) => ({
      ...item,
      selected: false,
    }));

    setItems(itemsMapeados);
    discount.reset();
    setPasoActual(1);
  }, [selectedOrder, discount]);

  /* =========================
     APLICAR DESCUENTO
  ========================= */
  const handleAplicarDescuento = async () => {
    if (!selectedOrder) return;

    if (!discount.isValid) {
      setError(discount.errors[0] || "Datos de descuento inválidos");
      return;
    }

    try {
      setLoadingApply(true);
      setError(null);
      setFeedback(null);
      const payload = discount.buildPayload(selectedOrder._id);

      await discountService.applyDiscount(payload);

      setFeedback("¡Descuento aplicado correctamente! ✨");
      discount.reset();
      setPasoActual(1);
      await Promise.all([cargarOrdenes(), cargarEstadisticas()]);
    } catch (err: any) {
      setError(err.message || "Error al aplicar descuento");
    } finally {
      setLoadingApply(false);
    }
  };

  return (
    <div className="nebula-discounts-root">
      <div className="nebula-discounts-shell nebula-discounts-page-frame">
      <div>
        <DiscountsSuiteHeader
          title="Sistema Nebula de Descuentos"
          subtitle="Operación asistida para caja y salón"
          onOpenTutorial={() => setTourOpen(true)}
        />
      </div>
      <div className="nebula-discounts-aurora" />
      <div className="nebula-discounts-title-band">
        <p className="text-xs font-bold tracking-wider uppercase text-violet-300">Flujo de descuentos en vivo</p>
        <p className="text-xs text-violet-200/70">Selecciona pedido, calcula y aplica</p>
      </div>
      {/* ENCABEZADO AMIGABLE NEBULA */}
      <div className="nebula-discounts-panel p-3 md:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-2xl shadow-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-ivory">
                Sistema Nebula de Descuentos
              </h1>
              <p className="text-xs text-muted">
                Aplica descuentos de forma rápida y segura
              </p>
            </div>
          </div>
          
          {/* ACCIONES RÁPIDAS */}
          <div className="flex items-center gap-2 flex-wrap" data-tour="quick-actions">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10" data-tour="mode-toggle">
              <button
                onClick={() => setMode("simple")}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${mode === "simple" ? "bg-violet-500 text-white" : "text-muted hover:text-ivory"}`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode("advanced")}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${mode === "advanced" ? "bg-violet-500 text-white" : "text-muted hover:text-ivory"}`}
              >
                Avanzado
              </button>
            </div>
            <button
              onClick={() => aplicarDescuentoRapido(10)}
              className="px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border border-violet-500/20"
              disabled={!selectedOrder}
            >
              <Zap size={14} />
              <span className="hidden sm:inline">-10%</span>
            </button>
            <button
              onClick={() => aplicarDescuentoRapido(15)}
              className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border border-cyan-500/20"
              disabled={!selectedOrder}
            >
              <Zap size={14} />
              <span className="hidden sm:inline">-15%</span>
            </button>
            <button
              onClick={() => { cargarOrdenes(); cargarEstadisticas(); }}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-ivory rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border border-white/10"
            >
              <RefreshCw size={14} className={loadingOrders || loadingStats ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* INDICADOR DE PASOS MEJORADO NEBULA */}
        <div className={`mt-4 ${mode === "simple" ? "hidden" : ""}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <div 
                onClick={() => selectedOrder && setPasoActual(1)}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  pasoActual >= 1 
                    ? "bg-violet-500 text-white shadow-lg" 
                    : "bg-white/5 text-muted"
                }`}
              >
                <div className="w-5 h-5 md:w-6 md:h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span className="text-xs font-semibold hidden sm:block">Seleccionar</span>
              </div>
              
              <div className={`flex-1 h-1 rounded-full transition-all ${pasoActual >= 2 ? "bg-violet-500" : "bg-white/10"}`} />
              
              <div 
                onClick={() => items.some(i => i.selected) && setPasoActual(2)}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  pasoActual >= 2 
                    ? "bg-violet-500 text-white shadow-lg" 
                    : "bg-white/5 text-muted"
                } ${!items.some(i => i.selected) && "opacity-50 cursor-not-allowed"}`}
              >
                <div className="w-5 h-5 md:w-6 md:h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span className="text-xs font-semibold hidden sm:block">Calcular</span>
              </div>
              
              <div className={`flex-1 h-1 rounded-full transition-all ${pasoActual >= 3 ? "bg-violet-500" : "bg-white/10"}`} />
              
              <div 
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  pasoActual >= 3 
                    ? "bg-violet-500 text-white shadow-lg" 
                    : "bg-white/5 text-muted"
                } ${!discount.isValid && "opacity-50 cursor-not-allowed"}`}
              >
                <div className="w-5 h-5 md:w-6 md:h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span className="text-xs font-semibold hidden sm:block">Aplicar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MENSAJES DE FEEDBACK */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-4 md:mb-6 flex items-center gap-3 shadow-md animate-bounce">
          <Info size={20} className="flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl mb-4 md:mb-6 flex items-center gap-3 shadow-md animate-fade-in">
          <CheckCircle size={20} className="flex-shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL - LAYOUT RESPONSIVE NEBULA */}
      <div className="nebula-discounts-grid-ops">
        {/* =========================
            IZQUIERDA: LISTA DE ÓRDENES
        ========================= */}
        <div className="min-h-0">
          <div className="nebula-discounts-panel p-3 md:p-4 flex flex-col" data-tour="orders-list">
            {/* ENCABEZADO COLAPSABLE */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-violet-500/10 rounded-xl">
                  <Sparkles size={18} className="text-violet-400" />
                </div>
                <h3 className="text-sm font-bold text-ivory">Órdenes Activas</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full">
                  {ordenesFiltradas.length}
                </span>
                <button
                  onClick={() => toggleSeccion('ordenes')}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                >
                  {seccionesColapsadas.ordenes ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
              </div>
            </div>

            {/* BÚSQUEDA Y FILTRO */}
            {!seccionesColapsadas.ordenes && (
              <>
                <div className="mb-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Buscar por mesa o producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-violet-400 transition-colors text-ivory"
                  />
                  <div className="flex gap-2">
                    {["todas", "en-curso", "completadas"].map((estado) => (
                      <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          filtroEstado === estado
                            ? "bg-violet-500 text-white"
                            : "bg-white/5 text-muted hover:bg-white/10"
                        }`}
                      >
                        {estado === "todas" ? "Todas" : estado === "en-curso" ? "En curso" : "Completadas"}
                      </button>
                    ))}
                  </div>
                </div>

                <OrderList
                  orders={ordenesFiltradas}
                  selectedOrderId={selectedOrder?._id}
                  loading={loadingOrders}
                  onSelectOrder={(orden) => {
                    setSelectedOrder(orden);
                    setPasoActual(1);
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* =========================
            CENTRO: DETALLES DE ORDEN (SE EXPANDE EN MÓVIL)
        ========================= */}
        <div className="min-h-0">
          <div className="nebula-discounts-panel p-3 md:p-4 flex flex-col min-h-[350px] xl:h-[600px]" data-tour="order-details">
            {/* ENCABEZADO COLAPSABLE */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 rounded-xl">
                  <Sparkles size={18} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ivory">Detalles de Orden</h3>
                  {selectedOrder && (
                    <p className="text-xs text-muted">
                      Mesa {typeof selectedOrder.table === "object" ? selectedOrder.table?.number : selectedOrder.table}
                    </p>
                  )}
                </div>
              </div>
              {selectedOrder && (
                <button
                  onClick={() => toggleSeccion('detalles')}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                >
                  {seccionesColapsadas.detalles ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
              )}
            </div>

            {!seccionesColapsadas.detalles && (
              <>
                {selectedOrder ? (
                  <OrderDetails
                    order={selectedOrder}
                    items={items}
                    setItems={(itemsActualizados) => {
                      setItems(itemsActualizados);
                      const tieneSeleccion = itemsActualizados.some(i => i.selected);
                      if (tieneSeleccion && pasoActual === 1) {
                        setPasoActual(2);
                      }
                    }}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="p-4 bg-white/5 rounded-full mb-3">
                      <Info size={32} className="text-white/30" />
                    </div>
                    <h3 className="text-sm font-bold text-ivory mb-2">
                      Selecciona una orden
                    </h3>
                    <p className="text-muted text-xs">
                      Elige una orden activa de la lista para comenzar
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* =========================
            DERECHA: PANEL DE DESCUENTOS NEBULA (SE EXPANDE EN MÓVIL CUANDO ES NECESARIO)
        ========================= */}
        <div className="min-h-0">
          <div className="nebula-discounts-panel nebula-discounts-callout-critical p-3 md:p-4 flex flex-col space-y-3">
            {/* TECLADO DE DESCUENTOS */}
            {!seccionesColapsadas.descuento && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-lime/10 rounded-xl">
                      <Sparkles size={18} className="text-lime" />
                    </div>
                    <h3 className="text-sm font-bold text-ivory">Calcular Descuento</h3>
                  </div>
                  <button
                    onClick={() => toggleSeccion('descuento')}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                  >
                    <ChevronUp size={18} />
                  </button>
                </div>

                <DiscountKeypad
                  type={discount.type}
                  setType={(tipo) => {
                    discount.setType(tipo);
                    if (pasoActual === 1) setPasoActual(2);
                  }}
                  value={discount.value}
                  valueInput={discount.valueInput}
                  appendNumber={discount.appendNumber}
                  removeLast={discount.removeLast}
                  data-tour="discount-keypad"
                />

                {/* TARJETA DE RESUMEN */}
                <div className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border-2 border-violet-500/20 rounded-2xl p-4 space-y-3" data-tour="discount-summary">
                  <h4 className="text-xs font-bold text-ivory uppercase tracking-wider">
                    Resumen del descuento
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted">Subtotal</span>
                      <span className="font-bold text-ivory">${discount.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted">Descuento</span>
                      <span className={`font-bold ${discount.type === 'PERCENT' ? 'text-violet-400' : 'text-cyan-400'}`}>
                        -${discount.discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-px bg-violet-500/20 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-ivory">Total a pagar</span>
                      <span className="text-xl font-bold text-violet-400">${discount.finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* FORMULARIO DE RAZÓN */}
                <div data-tour="discount-reason">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gold/10 rounded-xl">
                        <Sparkles size={18} className="text-gold" />
                      </div>
                      <h3 className="text-sm font-bold text-ivory">Motivo</h3>
                    </div>
                    <button
                      onClick={() => toggleSeccion('razon')}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                    >
                      {seccionesColapsadas.razon ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                  </div>

                  {!seccionesColapsadas.razon && (
                    <DiscountReasonForm
                      reason={discount.reason}
                      setReason={(razon) => {
                        discount.setReason(razon);
                        if (pasoActual === 2) setPasoActual(3);
                      }}
                      note={discount.note}
                      setNote={discount.setNote}
                    />
                  )}
                </div>

                {/* VISUALIZACIÓN DE ERRORES */}
                {!discount.isValid && discount.valueInput && (
                  <div className="bg-red/5 border border-red/20 p-3 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-red uppercase tracking-wider">
                      Por favor corrige:
                    </p>
                    {discount.errors.map((error, i) => (
                      <p key={i} className="text-xs text-red flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}

                {/* BOTONES DE ACCIÓN */}
                <div className="space-y-2 pt-3">
                  <button
                    onClick={handleAplicarDescuento}
                    disabled={!discount.isValid || loadingApply}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    data-tour="apply-btn"
                  >
                    {loadingApply ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Aplicar Descuento
                      </>
                    )}
                  </button>

                  <button
                    onClick={reiniciarFormulario}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-ivory rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 border border-white/10"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {seccionesColapsadas.descuento && (
              <button
                onClick={() => toggleSeccion('descuento')}
                className="w-full py-3 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 border border-violet-500/20"
              >
                <Sparkles size={18} />
                Mostrar Panel de Descuento
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================
          SECCIÓN DE ESTADÍSTICAS NEBULA (COLAPSABLE)
      ========================= */}
      {mode === "advanced" && (
      <div className="nebula-discounts-panel nebula-discounts-callout-success p-3 md:p-4" data-tour="stats-section">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 rounded-xl">
              <Sparkles size={18} className="text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-ivory">Estadísticas del Día</h3>
          </div>
          <button
            onClick={() => toggleSeccion('estadisticas')}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
          >
            {seccionesColapsadas.estadisticas ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>

        {!seccionesColapsadas.estadisticas && (
          <DiscountStats 
            data={stats} 
            loading={loadingStats}
          />
        )}
      </div>
      )}

      <TourGuide
        steps={tourSteps}
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        storageKey="nebula_discount_tour_v1"
      />
      </div>
    </div>
  );
}

