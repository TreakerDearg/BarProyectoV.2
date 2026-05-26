import { useState, useEffect, useCallback } from "react";
import OrderList from "../components/OrderList";
import OrderDetails from "../components/OrderDetails";
import DiscountKeypad from "../components/DiscountKeypad";
import DiscountReasonForm from "../components/DiscountReasonForm";
import DiscountStats from "../components/DiscountStats";

import { useDiscount } from "../hooks/useDiscount";
import { discountService } from "../services/discountService";
import DiscountsSuiteHeader from "../components/DiscountsSuiteHeader";
import DiscountsSuiteTutorial from "../components/DiscountsSuiteTutorial";

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
  const [tutorialOpen, setTutorialOpen] = useState(false);
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
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todas" | "en-curso" | "completadas">("todas");

  useEffect(() => {
    try {
      localStorage.setItem("nebula_discount_mode", mode);
    } catch {
      // ignore
    }
  }, [mode]);

  useEffect(() => {
    try {
      const key = "nebula_discount_tutorial_v1";
      const done = localStorage.getItem(key) === "done";
      if (!done) setTutorialOpen(true);
    } catch {
      // ignore
    }
  }, []);

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
    <div className="discounts-root">
      <div className="discounts-shell">
      <div>
        <DiscountsSuiteHeader
          title="Sistema Nebula de Descuentos"
          subtitle="Operación asistida para caja y salón"
          onOpenTutorial={() => setTutorialOpen(true)}
        />
      </div>
      {/* ENCABEZADO AMIGABLE NEBULA */}
      <div className="discounts-panel p-4 md:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 md:p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Sistema Nebula de Descuentos
              </h1>
              <p className="text-sm text-gray-500">
                Aplica descuentos de forma rápida y segura
              </p>
            </div>
          </div>
          
          {/* ACCIONES RÁPIDAS */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setMode("simple")}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${mode === "simple" ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode("advanced")}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${mode === "advanced" ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
              >
                Avanzado
              </button>
            </div>
            <button
              onClick={() => setTutorialOpen(true)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            >
              <HelpCircle size={16} />
              Tutorial
            </button>
            <button
              onClick={() => aplicarDescuentoRapido(10)}
              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              disabled={!selectedOrder}
            >
              <Zap size={16} />
              <span className="hidden sm:inline">-10% Rápido</span>
              <span className="sm:hidden">-10%</span>
            </button>
            <button
              onClick={() => aplicarDescuentoRapido(15)}
              className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              disabled={!selectedOrder}
            >
              <Zap size={16} />
              <span className="hidden sm:inline">-15% Rápido</span>
              <span className="sm:hidden">-15%</span>
            </button>
            <button
              onClick={() => { cargarOrdenes(); cargarEstadisticas(); }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            >
              <RefreshCw size={16} className={loadingOrders || loadingStats ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>

        {/* INDICADOR DE PASOS MEJORADO NEBULA */}
        <div className={`mt-6 ${mode === "simple" ? "hidden" : ""}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4 flex-1">
              <div 
                onClick={() => selectedOrder && setPasoActual(1)}
                className={`flex-1 flex items-center gap-2 px-3 py-3 rounded-2xl transition-all cursor-pointer ${
                  pasoActual >= 1 
                    ? "bg-blue-500 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center text-xs md:text-sm font-bold">
                  1
                </div>
                <span className="text-xs md:text-sm font-semibold hidden sm:block">Seleccionar</span>
              </div>
              
              <div className={`flex-1 h-1 rounded-full transition-all ${pasoActual >= 2 ? "bg-blue-500" : "bg-gray-200"}`} />
              
              <div 
                onClick={() => items.some(i => i.selected) && setPasoActual(2)}
                className={`flex-1 flex items-center gap-2 px-3 py-3 rounded-2xl transition-all cursor-pointer ${
                  pasoActual >= 2 
                    ? "bg-blue-500 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-400"
                } ${!items.some(i => i.selected) && "opacity-50 cursor-not-allowed"}`}
              >
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center text-xs md:text-sm font-bold">
                  2
                </div>
                <span className="text-xs md:text-sm font-semibold hidden sm:block">Calcular</span>
              </div>
              
              <div className={`flex-1 h-1 rounded-full transition-all ${pasoActual >= 3 ? "bg-blue-500" : "bg-gray-200"}`} />
              
              <div 
                className={`flex-1 flex items-center gap-2 px-3 py-3 rounded-2xl transition-all cursor-pointer ${
                  pasoActual >= 3 
                    ? "bg-blue-500 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-400"
                } ${!discount.isValid && "opacity-50 cursor-not-allowed"}`}
              >
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center text-xs md:text-sm font-bold">
                  3
                </div>
                <span className="text-xs md:text-sm font-semibold hidden sm:block">Aplicar</span>
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
      <div className="discounts-grid-ops">
        {/* =========================
            IZQUIERDA: LISTA DE ÓRDENES
        ========================= */}
        <div>
          <div className="discounts-panel p-4 md:p-5 flex flex-col">
            {/* ENCABEZADO COLAPSABLE */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Sparkles size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Órdenes Activas</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {ordenesFiltradas.length}
                </span>
                <button
                  onClick={() => toggleSeccion('ordenes')}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {seccionesColapsadas.ordenes ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
              </div>
            </div>

            {/* BÚSQUEDA Y FILTRO */}
            {!seccionesColapsadas.ordenes && (
              <>
                <div className="mb-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Buscar por mesa o producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                  <div className="flex gap-2">
                    {["todas", "en-curso", "completadas"].map((estado) => (
                      <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          filtroEstado === estado
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
        <div>
          <div className="discounts-panel p-4 md:p-5 flex flex-col min-h-[420px] xl:h-[680px]">
            {/* ENCABEZADO COLAPSABLE */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Sparkles size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Detalles de Orden</h3>
                  {selectedOrder && (
                    <p className="text-xs text-gray-500">
                      Mesa {typeof selectedOrder.table === "object" ? selectedOrder.table?.number : selectedOrder.table}
                    </p>
                  )}
                </div>
              </div>
              {selectedOrder && (
                <button
                  onClick={() => toggleSeccion('detalles')}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {seccionesColapsadas.detalles ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
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
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <div className="p-6 bg-gray-100 rounded-full mb-4">
                      <Info size={48} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Selecciona una orden
                    </h3>
                    <p className="text-gray-500 text-sm">
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
        <div>
          <div className="discounts-panel discounts-callout-critical p-4 md:p-5 flex flex-col space-y-4">
            {/* TECLADO DE DESCUENTOS */}
            {!seccionesColapsadas.descuento && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <Sparkles size={20} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Calcular Descuento</h3>
                  </div>
                  <button
                    onClick={() => toggleSeccion('descuento')}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronUp size={20} />
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
                />

                {/* TARJETA DE RESUMEN */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4 md:p-6 space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Resumen del descuento
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-bold text-gray-800">${discount.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Descuento</span>
                      <span className={`font-bold ${discount.type === 'PERCENT' ? 'text-blue-600' : 'text-green-600'}`}>
                        -${discount.discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-px bg-blue-200 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-700">Total a pagar</span>
                      <span className="text-2xl font-bold text-blue-600">${discount.finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* FORMULARIO DE RAZÓN */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-xl">
                        <Sparkles size={20} className="text-amber-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Motivo</h3>
                    </div>
                    <button
                      onClick={() => toggleSeccion('razon')}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {seccionesColapsadas.razon ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
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
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                      Por favor corrige:
                    </p>
                    {discount.errors.map((error, i) => (
                      <p key={i} className="text-sm text-red-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}

                {/* BOTONES DE ACCIÓN */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleAplicarDescuento}
                    disabled={!discount.isValid || loadingApply}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingApply ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Aplicar Descuento
                      </>
                    )}
                  </button>

                  <button
                    onClick={reiniciarFormulario}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {seccionesColapsadas.descuento && (
              <button
                onClick={() => toggleSeccion('descuento')}
                className="w-full py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
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
      <div className="discounts-panel discounts-callout-success p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Sparkles size={20} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Estadísticas del Día</h3>
          </div>
          <button
            onClick={() => toggleSeccion('estadisticas')}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {seccionesColapsadas.estadisticas ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
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

      <DiscountsSuiteTutorial
        isOpen={tutorialOpen}
        onClose={() => {
          try { localStorage.setItem("nebula_discount_tutorial_v1", "done"); } catch {}
          setTutorialOpen(false);
        }}
      />
      </div>
    </div>
  );
}
