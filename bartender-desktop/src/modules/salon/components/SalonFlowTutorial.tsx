"use client";

import { useState } from "react";
import {
  BookOpen,
  X,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import { salonTutorialSteps } from "./salonTutorialSteps";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function SalonFlowTutorial({ isOpen, onClose, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = salonTutorialSteps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === salonTutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl nebula-panel overflow-hidden border-violet-400/20">
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-200">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ivory">Tutorial · Salón Nebula</h2>
              <p className="text-xs text-muted">Reservas → Mesas → Pedidos</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-muted">
            <X size={20} />
          </button>
        </div>

        <div className="h-1 bg-surface-3">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all"
            style={{
              width: `${((currentStep + 1) / salonTutorialSteps.length) * 100}%`,
            }}
          />
        </div>

        <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto custom-scrollbar">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-violet-500/15 text-violet-300 shrink-0">
              <Icon size={26} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-violet-300 uppercase">
                Paso {currentStep + 1} de {salonTutorialSteps.length}
              </span>
              <h3 className="text-xl font-bold text-ivory mt-1 mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.content}</p>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase">Consejos</span>
            </div>
            <ul className="space-y-1.5 text-sm text-muted">
              {step.tips.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-400">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t border-white/8">
          <button
            type="button"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => s - 1)}
            className="flex items-center gap-1 text-xs font-semibold text-muted disabled:opacity-30"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <button
            type="button"
            onClick={() => {
              if (isLast) {
                onComplete();
                setCurrentStep(0);
              } else setCurrentStep((s) => s + 1);
            }}
            className="nebula-btn-primary flex items-center gap-1 px-5 py-2.5 text-xs"
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
