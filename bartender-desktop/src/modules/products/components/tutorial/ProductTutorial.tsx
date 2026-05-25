"use client";

import { useState } from "react";
import {
  BookOpen,
  X,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Zap,
  CheckCircle,
} from "lucide-react";
import { productTutorialSteps } from "./productTutorialSteps";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function ProductTutorial({
  isOpen,
  onClose,
  onComplete,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = productTutorialSteps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === productTutorialSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
      setCurrentStep(0);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(0);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl nebula-panel overflow-hidden shadow-2xl border-violet-400/20">
        <div className="flex items-center justify-between p-6 border-b border-white/8 bg-violet-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-200">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ivory">
                Tutorial · Catálogo de Productos
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Guía para usar el sistema de productos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 text-muted hover:text-ivory"
            aria-label="Cerrar tutorial"
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-1 bg-surface-3">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / productTutorialSteps.length) * 100}%`,
            }}
          />
        </div>

        <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-violet-500/15 text-violet-300 shrink-0">
              <Icon size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-300/90 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-400/20">
                Paso {currentStep + 1} de {productTutorialSteps.length}
              </span>
              <h3 className="text-xl font-bold text-ivory mt-2 mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{step.content}</p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="text-emerald-400" size={18} />
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                Consejos
              </h4>
            </div>
            <ul className="space-y-2">
              {step.tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-muted/90"
                >
                  <span className="text-emerald-400 shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {step.examples && step.examples.length > 0 && (
            <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="text-violet-300" size={18} />
                <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wide">
                  Ejemplos
                </h4>
              </div>
              <ul className="space-y-2">
                {step.examples.map((ex, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted/90">
                    <span className="text-violet-300 shrink-0">→</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-white/8 bg-surface-3/30 gap-4">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-30 hover:bg-white/5 text-muted"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <div className="flex items-center gap-1.5">
            {productTutorialSteps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep
                    ? "bg-violet-400 scale-125"
                    : i < currentStep
                      ? "bg-violet-400/50"
                      : "bg-white/20"
                }`}
                aria-label={`Ir al paso ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-xs font-semibold hover:opacity-90"
          >
            {isLast ? (
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