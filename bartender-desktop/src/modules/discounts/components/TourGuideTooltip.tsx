import { X, ChevronRight, ChevronLeft } from "lucide-react";

type Position = "top" | "bottom" | "left" | "right";

type Props = {
  title: string;
  content: string;
  position?: Position;
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
  targetRect: DOMRect;
};

export default function TourGuideTooltip({
  title,
  content,
  position = "bottom",
  step,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  targetRect,
}: Props) {
  const getPositionStyles = () => {
    const styles: React.CSSProperties = {
      position: "fixed",
      zIndex: 1000,
    };

    const arrowSize = 12;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (position) {
      case "top":
        styles.top = `${targetRect.top - tooltipHeight - arrowSize}px`;
        styles.left = `${targetRect.left + targetRect.width / 2 - tooltipWidth / 2}px`;
        break;
      case "bottom":
        styles.top = `${targetRect.bottom + arrowSize}px`;
        styles.left = `${targetRect.left + targetRect.width / 2 - tooltipWidth / 2}px`;
        break;
      case "left":
        styles.top = `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`;
        styles.left = `${targetRect.left - tooltipWidth - arrowSize}px`;
        break;
      case "right":
        styles.top = `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`;
        styles.left = `${targetRect.right + arrowSize}px`;
        break;
    }

    return styles;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
        onClick={onClose}
      />

      {/* Highlighted element */}
      <div
        className="fixed z-[998] pointer-events-none"
        style={{
          top: `${targetRect.top - 4}px`,
          left: `${targetRect.left - 4}px`,
          width: `${targetRect.width + 8}px`,
          height: `${targetRect.height + 8}px`,
          border: `3px solid rgba(139, 92, 246, 0.8)`,
          borderRadius: "12px",
          boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.4)`,
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[1000] w-[320px] bg-[#0b0f18] border border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
        style={getPositionStyles()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border-b border-violet-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-500/30 border border-violet-500/50 flex items-center justify-center">
              <span className="text-xs font-bold text-violet-300">{step}</span>
            </div>
            <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">
              Paso {step} de {totalSteps}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{content}</p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-violet-500/10 flex items-center justify-between bg-black/20">
          <button
            onClick={onSkip}
            className="text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors"
          >
            Saltar tour
          </button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={onPrevious}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Anterior
              </button>
            )}
            <button
              onClick={onNext}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold transition-all flex items-center gap-1"
            >
              {step === totalSteps ? "Finalizar" : "Siguiente"}
              {step < totalSteps && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
