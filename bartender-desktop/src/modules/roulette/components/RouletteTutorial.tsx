"use client";

import { useState, type ComponentType } from "react";
import { 
  BookOpen, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Scale, 
  TrendingUp, 
  Shield, 
  Zap, 
  Award,
  HelpCircle,
  Lightbulb,
  Sliders
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  icon: ComponentType<{ size?: number }>;
  content: string;
  tips: string[];
  examples?: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "intro",
    title: "¿Qué es este sistema?",
    icon: Sparkles,
    content: "Este sistema es una ruleta que elige tragos al azar para los clientes. Tú como empleado configuras qué tragos pueden salir y con qué probabilidad. Los clientes usan la ruleta para ganar tragos especiales.",
    tips: [
      "Este sistema es para los clientes, no para ti como empleado",
      "Tú configuras qué tragos salen y con qué frecuencia",
      "Los clientes giran la ruleta para ganar tragos",
      "El sistema hace que la experiencia sea divertida para los clientes"
    ],
    examples: [
      "Un cliente gira la ruleta y puede ganar un trago especial",
      "Tú configuras qué tragos están disponibles en la ruleta",
      "El sistema elige al azar qué trago gana el cliente"
    ]
  },
  {
    id: "control-deck",
    title: "¿Qué es el Control Deck?",
    icon: Sliders,
    content: "El Control Deck es donde tú configuras la ruleta. Aquí puedes añadir tragos, ajustar sus pesos, cambiar su rareza, y usar herramientas avanzadas como búsqueda, filtros y acciones en masa.",
    tips: [
      "Usa el botón 'Abrir Selector' para añadir nuevos tragos",
      "Ajusta los pesos para controlar qué tragos salen más",
      "Usa la búsqueda para encontrar tragos rápidamente",
      "Filtra por rareza o estado para organizar mejor",
      "Usa 'Activar Todos' o 'Desactivar Todos' para acciones rápidas"
    ],
    examples: [
      "Haz clic en 'Abrir Selector' para abrir la ventana de añadir tragos",
      "Busca 'Mojito' para encontrarlo rápidamente en la lista",
      "Filtra por 'Raro' para ver solo los tragos raros",
      "Usa 'Activar Todos' para activar todos los tragos de una vez"
    ]
  },
  {
    id: "weights",
    title: "¿Cómo funcionan los Pesos?",
    icon: Scale,
    content: "El peso es como un número que dice qué tan fácil es que salga un trago para el cliente. Número más alto = más fácil que salga. El sistema calcula automáticamente el porcentaje.",
    tips: [
      "Peso 10 = probabilidad normal para el cliente",
      "Peso 50 = 5 veces más fácil que el peso 10",
      "Peso 1 = muy difícil que salga para el cliente",
      "Tú ajustas esto para controlar qué tragos salen más"
    ],
    examples: [
      "Si pones peso 50 en Mojito, saldrá más veces para los clientes",
      "Si pones peso 1 en Trago Especial, saldrá muy pocas veces",
      "El sistema muestra el porcentaje de probabilidad para cada trago"
    ]
  },
  {
    id: "rarity",
    title: "Niveles de Tragos",
    icon: Award,
    content: "Los tragos tienen 4 niveles que afectan qué tan fácil es que salgan para el cliente: Común, Raro, Épico y Legendario. Los niveles más altos son más difíciles de conseguir.",
    tips: [
      "Común: Sale con frecuencia para los clientes",
      "Raro: Sale a veces para los clientes",
      "Épico: Sale pocas veces para los clientes",
      "Legendario: Muy difícil de conseguir, pero muy especial"
    ],
    examples: [
      "Un trago Legendario es un premio muy especial para el cliente",
      "Los colores indican el nivel: Grado, Azul, Púrpura, Dorado",
      "Los niveles más altos crean más emoción para los clientes"
    ]
  },
  {
    id: "pity",
    title: "Garantía para Clientes",
    icon: Shield,
    content: "El sistema garantiza que después de varios intentos sin premio especial, el próximo intento seguro dará ese premio. Así los clientes no se sienten con mala suerte.",
    tips: [
      "Raro: Garantizado después de 10 intentos sin premio raro",
      "Épico: Garantizado después de 25 intentos sin premio épico",
      "Legendario: Garantizado después de 50 intentos sin premio legendario",
      "El contador se reinicia cuando el cliente consigue el premio"
    ],
    examples: [
      "Un cliente lleva 9 intentos sin premio raro → Su próximo intento seguro da RARE",
      "Un cliente lleva 24 intentos sin premio épico → Su próximo intento seguro da EPIC",
      "El sistema es justo y los clientes siempre reciben premios especiales eventualmente"
    ]
  },
  {
    id: "kpi",
    title: "Desempeño y Suerte del Cliente",
    icon: TrendingUp,
    content: "El desempeño del cliente afecta su suerte en la ruleta. Si el desempeño es mayor al 80%, el cliente tiene más chances de conseguir tragos especiales.",
    tips: [
      "Desempeño ≥ 80%: Más suerte (1.2 a 2.0 veces más)",
      "Desempeño < 80%: Suerte normal",
      "El sistema calcula esto automáticamente",
      "Recompensa a los clientes con buen desempeño"
    ],
    examples: [
      "Un cliente con desempeño 90% → Sus chances de premios especiales se duplican",
      "Un cliente con desempeño 75% → Juega con chances normales",
      "El sistema premia a los clientes con buen comportamiento"
    ]
  },
  {
    id: "stock",
    title: "Ajuste por Inventario",
    icon: Zap,
    content: "El sistema ajusta automáticamente las probabilidades según cuántos tragos hay disponibles. Si hay pocos, reduce su probabilidad. Si hay muchos, la aumenta.",
    tips: [
      "Menos de 5: Reduce probabilidad (para no quedarse sin stock)",
      "Más de 15: Aumenta probabilidad (para vender más)",
      "Entre 5 y 15: Probabilidad normal",
      "El ajuste es automático"
    ],
    examples: [
      "Mojito tiene 3 unidades → Su probabilidad se reduce para no quedarse sin stock",
      "Margarita tiene 20 unidades → Su probabilidad aumenta para vender más",
      "El sistema protege tu inventario automáticamente"
    ]
  },
  {
    id: "modes",
    title: "Modos del Sistema",
    icon: Lightbulb,
    content: "El sistema tiene 4 modos: Playroom para ver la ruleta, Control Deck para configurar, Logs para ver el historial y Pity Tracker para ver las garantías.",
    tips: [
      "Playroom: Vista visual de la ruleta para clientes",
      "Control Deck: Para ajustar pesos y niveles de tragos",
      "Logs: Para ver todo lo que ha pasado con los clientes",
      "Pity Tracker: Para ver qué clientes necesitan premio garantizado"
    ],
    examples: [
      "Usa Playroom para ver cómo se ve la ruleta para los clientes",
      "Usa Control Deck para configurar qué tragos salen",
      "Usa Logs para revisar la actividad de los clientes",
      "Usa Pity Tracker para ver qué clientes necesitan premio garantizado"
    ]
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RouletteTutorial({ isOpen, onClose }: Props) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-surface-2 border border-border rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-7 border-b border-border bg-surface-3/50">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-gold/10 text-gold border border-gold/20">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-ivory tracking-tight uppercase">
                Tutorial del Sistema Roulette
              </h2>
              <p className="text-xs text-muted font-bold uppercase tracking-wider mt-0.5">
                Guía completa para operar y calibrar la ruleta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-surface-3 hover:bg-surface-4 text-muted hover:text-ivory border border-border transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-surface-3">
          <div 
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Step Header */}
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 rounded-2xl bg-gold/10 text-gold border border-gold/20 shrink-0">
              <Icon size={28} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-gold/15 text-gold text-xs font-bold uppercase tracking-wider rounded-full border border-gold/25">
                  Paso {currentStep + 1} de {tutorialSteps.length}
                </span>
              </div>
              <h3 className="text-2xl font-black text-ivory tracking-tight uppercase mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {step.content}
              </p>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-emerald/10 border border-emerald/20 rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <Lightbulb className="text-emerald" size={18} />
              <h4 className="text-xs font-black text-emerald uppercase tracking-wider">
                Consejos Clave
              </h4>
            </div>
            <ul className="space-y-2">
              {step.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-ivory/90 leading-relaxed">
                  <span className="text-emerald font-bold mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Examples Section */}
          {step.examples && step.examples.length > 0 && (
            <div className="bg-surface-3 border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <Sparkles className="text-gold" size={18} />
                <h4 className="text-xs font-black text-gold uppercase tracking-wider">
                  Ejemplos Prácticos
                </h4>
              </div>
              <ul className="space-y-2">
                {step.examples.map((example, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-ivory/90 leading-relaxed">
                    <span className="text-gold font-bold mt-0.5">→</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-t border-border bg-surface-3/40">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-3 text-muted hover:text-ivory"
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>

          {/* Step Indicators */}
          <div className="flex items-center gap-1.5">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? "bg-gold scale-125" 
                    : index < currentStep 
                      ? "bg-gold/50" 
                      : "bg-surface-4"
                }`}
              />
            ))}
          </div>

          <button
            onClick={currentStep === tutorialSteps.length - 1 ? onClose : handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-bg text-xs font-black tracking-wider uppercase shadow-gold-glow transition-all cursor-pointer"
          >
            {currentStep === tutorialSteps.length - 1 ? (
              <>
                <HelpCircle size={16} />
                <span>Entendido</span>
              </>
            ) : (
              <>
                <span>Siguiente</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
