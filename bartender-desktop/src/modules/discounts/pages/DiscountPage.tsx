import { useState, useEffect, useCallback } from "react";
import OrderList from "../components/OrderList";
import OrderDetails from "../components/OrderDetails";
import DiscountKeypad from "../components/DiscountKeypad";
import DiscountReasonForm from "../components/DiscountReasonForm";
import DiscountStats from "../components/DiscountStats";
import DiscountTrendChart from "../components/DiscountTrendChart";
import DiscountReasonPieChart from "../components/DiscountReasonPieChart";

import { useDiscount } from "../hooks/useDiscount";
import { discountService } from "../services/discountService";
import DiscountsSuiteHeader from "../components/DiscountsSuiteHeader";
import TourGuide from "../components/TourGuide";
import type { TourStep } from "../components/TourGuide";

import type { Order, SelectedItem } from "../types/discounts";
import { Sparkles, Save, Loader2, Info, CheckCircle, ChevronDown, ChevronUp, Zap, X, RefreshCw, TrendingDown, AlertTriangle } from "lucide-react";

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
  const [stats, setStats] = useState<{
    todayTotal: number;
    averagePercent: number;
    appliedCount: number;
    byType?: any;
    byReason?: any;
    byEmployee?: any;
    byTable?: any;
  }>({
    todayTotal: 0,
    averagePercent: 0,
    appliedCount: 0,
  });
  const [dailyLimit, setDailyLimit] = useState<{
    remainingAmount: number;
    remainingCount: number;
    maxAmount: number;
    maxCount: number;
  } | null>(null);
  
  // Estados mejorados para UX
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);
  const [seccionesColapsadas, setSeccionesColapsadas] = useState({
    ordenes: false,
    detalles: false,
    descuento: false,
    razon: false,
    estadisticas: true
  });
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todas" | "en-curso" | "completadas">("todas");

  // Configuración de presets de descuento (puede venir de settings en el futuro)
  const discountPresets = {
    PERCENT: [5, 10, 15, 20, 25, 50],
    FLAT: [5, 10, 15, 20, 50, 100],
  };

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

  const cargarLimiteDiario = async () => {
    try {
      const datos = await discountService.getDailyLimitRemaining();
      setDailyLimit(datos.remaining);
    } catch {
      // el límite diario no debe bloquear la pantalla
    }
  };

  useEffect(() => {
    cargarOrdenes();
    cargarEstadisticas();
    cargarLimiteDiario();
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
        <p className="text-xs font-bold tracking-wider uppercase text-[#00E5FF]">Flujo de descuentos en vivo</p>
        <p className="text-xs text-white/50">Selecciona pedido, calcula y aplica</p>
      </div>
      {/* ENCABEZADO AMIGABLE NEBULA */}
      <div className="nebula-discounts-panel p-3 md:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #00E5FF, #9D4EDD)' }}>
              <Sparkles className="text-black" size={24} />
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
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${mode === "simple" ? "bg-[#00E5FF] text-black" : "text-white/50 hover:text-white"}`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode("advanced")}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${mode === "advanced" ? "bg-[#00E5FF] text-black" : "text-white/50 hover:text-white"}`}
              >
                Avanzado
              </button>
            </div>
            <button
              onClick={() => aplicarDescuentoRapido(10)}
              className="px-3 py-2 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border border-[#00E5FF]/20"
              disabled={!selectedOrder}
            >
              <Zap size={14} />
              <span className="hidden sm:inline">-10%</span>
            </button>
            <button
              onClick={() => aplicarDescuentoRapido(15)}
              className="px-3 py-2 bg-[#9D4EDD]/10 hover:bg-[#9D4EDD]/20 text-[#9D4EDD] rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border border-[#9D4EDD]/20"
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

        {/* INDICADOR DE IMPACTO FINANCIERO */}
        {dailyLimit && mode === "advanced" && (
          <div className="mt-4 p-4 rounded-2xl border" style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderColor: 'rgba(255, 255, 255, 0.08)'
          }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-[#FFD166]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Límite Diario Restante</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Monto:</span>
                <span className={`text-sm font-bold ${dailyLimit.remainingAmount < 100 ? 'text-[#FF4D6D]' : dailyLimit.remainingAmount < 300 ? 'text-[#FFD166]' : 'text-[#00FF95]'}`}>
                  ${dailyLimit.remainingAmount.toFixed(2)}
                </span>
                <span className="text-xs text-white/50">/ ${dailyLimit.maxAmount}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  dailyLimit.remainingAmount < 100
                    ? 'bg-[#FF4D6D]'
                    : dailyLimit.remainingAmount < 300
                    ? 'bg-[#FFD166]'
                    : 'bg-[#00FF95]'
                }`}
                style={{ width: `${(dailyLimit.remainingAmount / dailyLimit.maxAmount) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-white/40">
                {dailyLimit.remainingCount} descuentos restantes de {dailyLimit.maxCount}
              </span>
              {dailyLimit.remainingAmount < 100 && (
                <div className="flex items-center gap-1 text-[10px] text-[#FF4D6D]">
                  <AlertTriangle size={12} />
                  <span className="font-bold">Límite crítico</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* INDICADOR DE PASOS MEJORADO NEBULA */}
        <div className={`mt-4 ${mode === "simple" ? "hidden" : ""}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <div 
                onClick={() => selectedOrder && setPasoActual(1)}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  pasoActual >= 1 
                    ? "bg-[#00E5FF] text-black shadow-lg" 
                    : "bg-white/5 text-white/50"
                }`}
              >
                <div className="w-5 h-5 md:w-6 md:h-6 bg-black/20 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span className="text-xs font-semibold hidden sm:block">Seleccionar</span>
              </div>
              
              <div className={`flex-1 h-1 rounded-full transition-all ${pasoActual >= 2 ? "bg-[#00E5FF]" : "bg-white/10"}`} />
              
              <div 
                onClick={() => items.some(i => i.selected) && setPasoActual(2)}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  pasoActual >= 2 
                    ? "bg-[#00E5FF] text-black shadow-lg" 
                    : "bg-white/5 text-white/50"
                } ${!items.some(i => i.selected) && "opacity-50 cursor-not-allowed"}`}
              >
                <div className="w-5 h-5 md:w-6 md:h-6 bg-black/20 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span className="text-xs font-semibold hidden sm:block">Calcular</span>
              </div>
              
              <div className={`flex-1 h-1 rounded-full transition-all ${pasoActual >= 3 ? "bg-[#00E5FF]" : "bg-white/10"}`} />
              
              <div 
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  pasoActual >= 3 
                    ? "bg-[#00E5FF] text-black shadow-lg" 
                    : "bg-white/5 text-white/50"
                } ${!discount.isValid && "opacity-50 cursor-not-allowed"}`}
              >
                <div className="w-5 h-5 md:w-6 md:h-6 bg-black/20 rounded-full flex items-center justify-center text-xs font-bold">
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
                <div className="p-2 bg-[#00E5FF]/10 rounded-xl">
                  <Sparkles size={18} className="text-[#00E5FF]" />
                </div>
                <h3 className="text-sm font-bold text-white">Órdenes Activas</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-1 rounded-full">
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
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#00E5FF] transition-colors text-white"
                  />
                  <div className="flex gap-2">
                    {["todas", "en-curso", "completadas"].map((estado) => (
                      <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          filtroEstado === estado
                            ? "bg-[#00E5FF] text-black"
                            : "bg-white/5 text-white/50 hover:bg-white/10"
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
                <div className="p-2 bg-[#9D4EDD]/10 rounded-xl">
                  <Sparkles size={18} className="text-[#9D4EDD]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Detalles de Orden</h3>
                  {selectedOrder && (
                    <p className="text-xs text-white/50">
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
                    <div className="p-2 bg-[#00FF95]/10 rounded-xl">
                      <Sparkles size={18} className="text-[#00FF95]" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Calcular Descuento</h3>
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
                  presets={discountPresets}
                  data-tour="discount-keypad"
                />

                {/* TARJETA DE RESUMEN */}
                <div className="p-4 rounded-xl border space-y-3" style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(255, 255, 255, 0.08)'
                }} data-tour="discount-summary">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Resumen del descuento
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/50">Subtotal</span>
                      <span className="font-bold text-white">${discount.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/50">Descuento</span>
                      <span className={`font-bold ${discount.type === 'PERCENT' ? 'text-[#00E5FF]' : 'text-[#9D4EDD]'}`}>
                        -${discount.discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">Total a pagar</span>
                      <span className="text-xl font-bold text-[#00E5FF]">${discount.finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* FORMULARIO DE RAZÓN */}
                <div data-tour="discount-reason">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#FFD166]/10 rounded-xl">
                        <Sparkles size={18} className="text-[#FFD166]" />
                      </div>
                      <h3 className="text-sm font-bold text-white">Motivo</h3>
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
                  <div className="p-3 rounded-xl border space-y-2" style={{
                    background: 'rgba(255, 77, 109, 0.1)',
                    borderColor: 'rgba(255, 77, 109, 0.2)'
                  }}>
                    <p className="text-xs font-bold text-[#FF4D6D] uppercase tracking-wider">
                      Por favor corrige:
                    </p>
                    {discount.errors.map((error, i) => (
                      <p key={i} className="text-xs text-[#FF4D6D] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D]" />
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
                    className="w-full py-3 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-white/10"
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
                className="w-full py-3 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-[#00E5FF]/20"
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
            <div className="p-2 bg-[#00FF95]/10 rounded-xl">
              <Sparkles size={18} className="text-[#00FF95]" />
            </div>
            <h3 className="text-sm font-bold text-white">Estadísticas del Día</h3>
          </div>
          <button
            onClick={() => toggleSeccion('estadisticas')}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
          >
            {seccionesColapsadas.estadisticas ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>

        {!seccionesColapsadas.estadisticas && (
          <div className="space-y-4">
            <DiscountStats
              data={stats}
              loading={loadingStats}
            />
            
            {/* New Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <DiscountTrendChart
                  data={stats.byEmployee?.slice(0, 7).map((e: any) => ({
                    date: e.name || 'N/A',
                    amount: e.amount || 0,
                    count: e.count || 0,
                  })) || []}
                  loading={loadingStats}
                />
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <DiscountReasonPieChart
                  data={stats.byReason || {}}
                  loading={loadingStats}
                />
              </div>
            </div>
          </div>
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

