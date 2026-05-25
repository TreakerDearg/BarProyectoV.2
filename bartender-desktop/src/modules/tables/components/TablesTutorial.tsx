"use client";

import { useState } from "react";
import { 
  BookOpen, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  LayoutGrid,
  Users,
  CreditCard,
  Edit3,
  Zap,
  HelpCircle,
  Lightbulb,
  CheckCircle
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  icon: any;
  content: string;
  tips: string[];
  examples?: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "intro",
    title: "¿Qué es el Sistema de Mesas?",
    icon: LayoutGrid,
    content: "El Sistema de Mesas es el centro de control operativo para gestionar todas las mesas del salón. Permite visualizar el estado en tiempo real, gestionar pedidos, procesar pagos y organizar el plano físico del establecimiento.",
    tips: [
      "Vista en tiempo real de todas las mesas y su estado",
      "Gestión completa de pedidos y pagos desde una mesa",
      "Plano espacial interactivo para organizar el salón",
      "Sincronización automática con otros dispositivos"
    ],
    examples: [
      "Ver rápidamente qué mesas están ocupadas, disponibles o reservadas",
      "Abrir una mesa, tomar pedidos y procesar pagos sin salir de la vista",
      "Reorganizar el plano del salón arrastrando las mesas en modo edición"
    ]
  },
  {
    id: "states",
    title: "Estados de Mesa",
    icon: CheckCircle,
    content: "Cada mesa puede tener diferentes estados que indican su situación actual. Los estados se muestran con colores y animaciones para identificación rápida.",
    tips: [
      "DISPONIBLE (Dorado): Mesa libre y lista para recibir clientes",
      "RESERVADA (Azul): Mesa reservada para una hora específica",
      "MANTENIMIENTO (Rojo): Mesa fuera de servicio",
      "ABIERTA (Ámbar): Mesa abierta pero sin pedidos aún",
      "CONSUMIENDO (Naranja): Mesa con pedidos activos",
      "PAGO PARCIAL (Púrpura): Mesa con pagos parciales",
      "PAGADA (Verde): Cuenta completa pagada, lista para limpieza"
    ],
    examples: [
      "Una mesa verde con check significa que los clientes ya pagaron",
      "Una mesa naranja animada indica que están consumiendo activamente",
      "Una mesa púrpura pulsante muestra que hay un pago parcial pendiente"
    ]
  },
  {
    id: "views",
    title: "Vistas: Plano vs Lista",
    icon: LayoutGrid,
    content: "El sistema ofrece dos modos de visualización: Vista Plano (espacial) y Vista Lista (cuadrícula). Cada vista está optimizada para diferentes necesidades operativas.",
    tips: [
      "VISTA PLANO: Representación espacial real del salón con posiciones exactas",
      "VISTA LISTA: Cuadrícula compacta para ver muchas mesas a la vez",
      "Cambia entre vistas según tu necesidad actual",
      "El plano es ideal para visualizar distribución y flujo"
    ],
    examples: [
      "Usa el Plano para ver la distribución real y organizar mesas",
      "Usa la Lista para tener una visión general rápida de todas las mesas",
      "En móvil, la Lista puede ser más fácil de usar"
    ]
  },
  {
    id: "edit",
    title: "Modo Edición del Plano",
    icon: Edit3,
    content: "El Modo Edición permite reorganizar el plano del salón arrastrando las mesas a nuevas posiciones. Es ideal para ajustar la distribución según necesidades operativas.",
    tips: [
      "Activa el modo edición con el botón de candado abierto",
      "Arrastra las mesas a su posición deseada en el plano",
      "Las posiciones se guardan automáticamente",
      "Desactiva el modo edición para bloquear las posiciones",
      "Solo disponible en Vista Plano"
    ],
    examples: [
      "Mueve una mesa cerca de la barra para acceso rápido",
      "Reorganiza mesas para crear más espacio de paso",
      "Ajusta la distribución para un evento especial"
    ]
  },
  {
    id: "operations",
    title: "Operaciones de Mesa",
    icon: Users,
    content: "Desde el inspector de mesa puedes realizar todas las operaciones necesarias: abrir sesión, agregar pedidos, procesar pagos, cerrar mesa y más.",
    tips: [
      "ABRIR MESA: Inicia una nueva sesión de clientes",
      "AGREGAR PEDIDO: Añade productos a la cuenta actual",
      "PROCESAR PAGO: Cobra la cuenta con diferentes métodos",
      "CERRAR MESA: Finaliza la sesión y libera la mesa",
      "VER HISTORIAL: Revisa todos los pagos de la sesión"
    ],
    examples: [
      "Selecciona una mesa disponible y haz clic en 'Abrir Mesa'",
      "Agrega pedidos desde el inspector o formulario de órdenes",
      "Procesa pagos en efectivo, tarjeta, transferencia o divididos",
      "Cierra la mesa cuando los clientes se van"
    ]
  },
  {
    id: "payments",
    title: "Sistema de Pagos",
    icon: CreditCard,
    content: "El sistema soporta múltiples métodos de pago y opciones flexibles para cobrar cuentas, desde pagos simples hasta divisiones complejas.",
    tips: [
      "EFECTIVO: Pago completo en efectivo",
      "TARJETA: Procesamiento con terminal de tarjetas",
      "TRANSFERENCIA: Pago vía transferencia bancaria",
      "DIVIDIDO: Divide la cuenta entre varias personas",
      "PARCIAL: Cobro parcial de la cuenta total"
    ],
    examples: [
      "4 clientes dividen la cuenta en partes iguales",
      "Un cliente paga la mitad y el resto después",
      "Cobro completo con tarjeta generando recibo",
      "Pago parcial mientras siguen consumiendo"
    ]
  },
  {
    id: "filters",
    title: "Filtros por Zona",
    icon: Zap,
    content: "Los filtros por zona permiten ver solo las mesas de áreas específicas del establecimiento: Interior, Terraza, Barra o todas las mesas.",
    tips: [
      "TODOS: Muestra todas las mesas del establecimiento",
      "INTERIOR: Solo mesas del área interior",
      "TERRAZA: Solo mesas de la terraza exterior",
      "BARRA: Solo mesas de la barra",
      "Los filtros funcionan en ambas vistas (Plano y Lista)"
    ],
    examples: [
      "Filtra por Terraza para ver solo mesas al aire libre",
      "Filtra por Barra para gestionar mesas de consumo rápido",
      "Usa 'Todos' para tener una visión completa del salón"
    ]
  },
  {
    id: "analytics",
    title: "Analíticas y Reportes",
    icon: HelpCircle,
    content: "El sistema proporciona analíticas detalladas por mesa, incluyendo historial de pedidos, rendimiento, tickets promedio y más.",
    tips: [
      "HISTORIAL DE PAGOS: Revisa todos los cobros de una mesa",
      "ANALÍTICAS: Estadísticas de rendimiento por mesa",
      "RECIBOS: Genera y reimprime recibos",
      "TICKET PROMEDIO: Valor promedio por sesión",
      "FRECUENCIA DE USO: Qué tan usada es cada mesa"
    ],
    examples: [
      "Revisa qué mesas generan más ingresos",
      "Identifica mesas con problemas operativos",
      "Genera recibes para contabilidad",
      "Optimiza asignación de personal según rendimiento"
    ]
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TablesTutorial({ isOpen, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-gold/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-gold/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gold/10 text-gold">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-ivory tracking-tighter uppercase">
                Tutorial del Sistema de Mesas
              </h2>
              <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] mt-1">
                Guía completa para gestionar el salón
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-ivory transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-surface-3">
          <div 
            className="h-full bg-grad-gold transition-all duration-500"
            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          {/* Step Header */}
          <div className="flex items-start gap-6">
            <div className="p-4 rounded-2xl bg-gold/10 text-gold flex-shrink-0">
              <Icon size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-gold/20 text-gold text-[9px] font-black uppercase tracking-widest rounded-full">
                  Paso {currentStep + 1} de {tutorialSteps.length}
                </span>
              </div>
              <h3 className="text-3xl font-black text-ivory tracking-tighter uppercase mb-4">
                {step.title}
              </h3>
              <p className="text-base text-muted/90 leading-relaxed">
                {step.content}
              </p>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="text-emerald-400" size={20} />
              <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest">
                Consejos Clave
              </h4>
            </div>
            <ul className="space-y-3">
              {step.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-muted/90">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Examples Section */}
          {step.examples && step.examples.length > 0 && (
            <div className="bg-gold/5 border border-gold/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-gold" size={20} />
                <h4 className="text-sm font-black text-gold uppercase tracking-widest">
                  Ejemplos Prácticos
                </h4>
              </div>
              <ul className="space-y-3">
                {step.examples.map((example, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-muted/90">
                    <span className="text-gold mt-1">→</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-8 border-t border-white/5 bg-surface-3/20">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-muted"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          {/* Step Indicators */}
          <div className="flex items-center gap-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentStep 
                    ? "bg-gold scale-125" 
                    : index < currentStep 
                      ? "bg-gold/50" 
                      : "bg-white/20 hover:bg-white/30"
                }`}
              />
            ))}
          </div>

          <button
            onClick={currentStep === tutorialSteps.length - 1 ? onClose : handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-grad-gold text-black text-[10px] font-black tracking-widest uppercase hover:opacity-90 transition-all"
          >
            {currentStep === tutorialSteps.length - 1 ? (
              <>
                <CheckCircle size={16} />
                Entendido
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
