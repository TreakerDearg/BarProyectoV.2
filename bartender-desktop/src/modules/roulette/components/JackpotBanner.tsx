import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

interface JackpotBannerProps {
  visible: boolean;
  drinkName: string;
  onClose: () => void;
}

export default function JackpotBanner({ visible, drinkName, onClose }: JackpotBannerProps) {
  // Auto-close after 8 seconds when banner becomes visible
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
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: "linear-gradient(135deg, #0A0A0E 0%, rgba(212,163,64,0.20) 100%)",
            borderBottom: "2px solid #D4A340",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
              padding: "0.875rem 1.5rem",
            }}
          >
            {/* Left: label */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>⚡</span>
              <span
                style={{
                  color: "#D4A340",
                  fontWeight: 900,
                  fontSize: "0.625rem",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                }}
              >
                JACKPOT LEGENDARIO
              </span>
            </div>

            {/* Center: drink name */}
            <span
              style={{
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: "1.125rem",
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              {drinkName}
            </span>

            {/* Right: close button */}
            <button
              onClick={onClose}
              aria-label="Cerrar banner jackpot"
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2rem",
                height: "2rem",
                borderRadius: "0.5rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#9CA3AF",
                cursor: "pointer",
                fontSize: "1rem",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
