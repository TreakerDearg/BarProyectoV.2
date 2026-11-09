import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { X, Sparkles } from "lucide-react";

interface JackpotBannerProps {
  visible: boolean;
  drinkName: string;
  onClose: () => void;
}

export default function JackpotBanner({ visible, drinkName, onClose }: JackpotBannerProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-bg via-gold/20 to-bg border-b-2 border-gold shadow-[0_10px_30px_rgba(240,180,41,0.25)] backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gold text-bg font-black shadow-gold-glow animate-bounce">
                <Sparkles size={18} />
              </div>
              <div>
                <span className="text-xs font-black text-gold uppercase tracking-widest block">
                  ¡JACKPOT LEGENDARIO ROYALE!
                </span>
                <span className="text-xs text-muted">Premio estelar desbloqueado</span>
              </div>
            </div>

            <div className="text-center truncate">
              <span className="text-base sm:text-xl font-black text-ivory tracking-tight uppercase">
                {drinkName}
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Cerrar banner jackpot"
              className="p-2 rounded-xl bg-surface-3 hover:bg-surface-4 text-muted hover:text-ivory border border-border transition-all cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
