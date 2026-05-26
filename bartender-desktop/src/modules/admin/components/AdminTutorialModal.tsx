import { useState } from "react";
import { HelpCircle, X, ChevronLeft, ChevronRight } from "lucide-react";

export interface TutorialStep {
  title: string;
  description: string;
  highlight?: string;
}

interface AdminTutorialModalProps {
  title: string;
  subtitle: string;
  steps: TutorialStep[];
  triggerLabel?: string;
}

export default function AdminTutorialModal({
  title,
  subtitle,
  steps,
  triggerLabel = "Tutorial"
}: AdminTutorialModalProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const current = steps[index];

  const close = () => {
    setOpen(false);
    setIndex(0);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-11 px-4 rounded-xl border border-[#d4af37]/40 text-[#f4e4a6] hover:bg-[#d4af37]/10 transition-all flex items-center gap-2 text-sm font-semibold"
      >
        <HelpCircle size={17} />
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0f1117] text-white shadow-2xl overflow-hidden">
            <div className="px-5 sm:px-7 py-5 border-b border-white/10 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-bold">Guia rapida</p>
                <h3 className="text-xl sm:text-2xl font-black">{title}</h3>
                <p className="text-sm text-white/70 mt-1">{subtitle}</p>
              </div>
              <button onClick={close} className="p-2 rounded-lg hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-7 space-y-4">
              <div className="text-xs text-white/60 uppercase tracking-wider">
                Paso {index + 1} de {steps.length}
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-[#f4e4a6]">{current.title}</h4>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">{current.description}</p>
              {current.highlight && (
                <div className="rounded-xl border border-[#00d4ff]/40 bg-[#00d4ff]/10 p-3 text-sm text-[#b8f3ff]">
                  {current.highlight}
                </div>
              )}
            </div>

            <div className="px-5 sm:px-7 pb-5 sm:pb-7 flex items-center justify-between">
              <button
                onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
                disabled={index === 0}
                className="h-10 px-4 rounded-lg border border-white/15 text-white/80 disabled:opacity-40 flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              {index < steps.length - 1 ? (
                <button
                  onClick={() => setIndex((prev) => Math.min(prev + 1, steps.length - 1))}
                  className="h-10 px-4 rounded-lg bg-[#d4af37] text-black font-semibold flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={close} className="h-10 px-4 rounded-lg bg-[#00ff88] text-black font-semibold">
                  Finalizar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
