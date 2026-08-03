/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      /* ============================================================
         COLORES UNIFICADOS — Bartender Dashboard v3.0
         Sistema unificado para consistencia visual
      ============================================================ */
      colors: {
        /* ============================================================
           NEBULA DESIGN SYSTEM - Phase 10
           Professional dark theme inspired by Figma, Obsidian, VSCode
        ============================================================ */

        /* Background Layers */
        nebula: {
          bg: {
            DEFAULT: "#070B16",
            1: "#0B1220",
            2: "#111827",
          },
          panel: {
            DEFAULT: "#151C2E",
            1: "#182234",
            2: "#1B2537",
          },
          hover: "#202E46",
        },

        /* Accent Colors - Violet/Indigo */
        accent: {
          DEFAULT: "#6366F1",
          1: "#7C3AED",
          2: "#8B5CF6",
          50: "rgba(99,102,241,0.05)",
          100: "rgba(99,102,241,0.10)",
          200: "rgba(99,102,241,0.20)",
          300: "rgba(99,102,241,0.30)",
        },

        /* Semantic Colors */
        success: {
          DEFAULT: "#10B981",
          50: "rgba(16,185,129,0.05)",
          100: "rgba(16,185,129,0.10)",
          200: "rgba(16,185,129,0.20)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50: "rgba(245,158,11,0.05)",
          100: "rgba(245,158,11,0.10)",
          200: "rgba(245,158,11,0.20)",
        },
        danger: {
          DEFAULT: "#EF4444",
          50: "rgba(239,68,68,0.05)",
          100: "rgba(239,68,68,0.10)",
          200: "rgba(239,68,68,0.20)",
        },

        /* Text Colors */
        text: {
          DEFAULT: "#FFFFFF",
          1: "#D1D5DB",
          2: "#9CA3AF",
          3: "#6B7280",
        },

        /* Legacy colors for backward compatibility */
        gold: {
          DEFAULT: "#D4A340",
          light: "#E8BC5A",
          dark: "#A87C28",
          50: "rgba(212,163,64,0.05)",
          100: "rgba(212,163,64,0.10)",
          200: "rgba(212,163,64,0.20)",
          300: "rgba(212,163,64,0.30)",
        },
        red: {
          DEFAULT: "#C83228",
          light: "#E05444",
          dark: "#981E16",
          50: "rgba(200,50,40,0.05)",
          100: "rgba(200,50,40,0.12)",
          200: "rgba(200,50,40,0.20)",
          300: "rgba(200,50,40,0.30)",
        },
        emerald: {
          DEFAULT: "#34B964",
          light: "#4AD07C",
          dark: "#228A46",
          50: "rgba(52,185,100,0.05)",
          100: "rgba(52,185,100,0.12)",
          200: "rgba(52,185,100,0.20)",
          300: "rgba(52,185,100,0.30)",
        },
        neutral: {
          DEFAULT: "#3D4150",
          light: "#565D70",
          dark: "#252830",
        },
        bg: {
          DEFAULT: "#08090C",
          deep: "#050608",
        },
        surface: {
          DEFAULT: "#0D0F14",
          2: "#12151C",
          3: "#171B24",
          4: "#1E232E",
        },
        ivory: "#F5F0E8",
        muted: "rgba(255,255,255,0.6)",
        brand: {
          DEFAULT: "#C83228",
          light: "#E05444",
          dark: "#981E16",
        },
        ember: {
          DEFAULT: "#E07828",
          light: "#F09040",
          dark: "#B05A18",
        },
        lime: {
          DEFAULT: "#34B964",
          light: "#4AD07C",
          dark: "#228A46",
        },
        obsidian: {
          DEFAULT: "#0D0F14",
          light: "#12151C",
          dark: "#08090C",
        },
        void: "#030207",
      },

      /* ============================================================
         FUENTES UNIFICADAS
      ============================================================ */
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },

      /* ============================================================
         ESPACIADO UNIFICADO (Base 4px)
      ============================================================ */
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
      },

      /* ============================================================
         GRADIENTES
      ============================================================ */
      backgroundImage: {
        "grad-gold":   "linear-gradient(135deg, #D4A340 0%, #E8BC5A 50%, #A87C28 100%)",
        "grad-red":    "linear-gradient(135deg, #981E16 0%, #C83228 50%, #E05444 100%)",
        "grad-orange": "linear-gradient(135deg, #B05A18 0%, #E07828 50%, #F09040 100%)",
        "grad-green":  "linear-gradient(135deg, #228A46 0%, #34B964 50%, #4AD07C 100%)",
        "grad-brand":  "linear-gradient(135deg, #C83228 0%, #D4A340 60%, #E07828 100%)",
        "grad-dark":   "linear-gradient(180deg, #0D0F14 0%, #08090C 100%)",
        "grad-surface":"linear-gradient(180deg, #12151C 0%, #0D0F14 100%)",
      },

      /* ============================================================
         BORDER RADIUS UNIFICADO
      ============================================================ */
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },

      /* ============================================================
         BOX SHADOWS
      ============================================================ */
      boxShadow: {
        xs:    "0 2px 8px rgba(0,0,0,0.35)",
        sm:    "0 4px 16px rgba(0,0,0,0.45)",
        DEFAULT:"0 8px 32px rgba(0,0,0,0.60)",
        lg:    "0 16px 56px rgba(0,0,0,0.75)",
        gold:  "0 4px 24px rgba(212,163,64,0.22)",
        red:   "0 4px 24px rgba(200,50,40,0.22)",
        orange:"0 4px 24px rgba(224,120,40,0.18)",
        green: "0 4px 24px rgba(52,185,100,0.18)",
        glow:  "0 0 32px rgba(212,163,64,0.18)",
      },

      /* ============================================================
         ANIMACIONES
      ============================================================ */
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,163,64,0)" },
          "50%":      { boxShadow: "0 0 0 6px rgba(212,163,64,0.15)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },

      animation: {
        "fade-in":    "fadeIn 0.38s cubic-bezier(0,0,0.2,1) both",
        "slide-left": "slideLeft 0.38s cubic-bezier(0,0,0.2,1) both",
        "pulse-gold": "pulseGold 2s ease infinite",
        "shimmer":    "shimmer 1.8s linear infinite",
        "spin-slow":  "spin 1.2s linear infinite",
      },

      /* ============================================================
         TRANSICIONES
      ============================================================ */
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        out:    "cubic-bezier(0, 0, 0.2, 1)",
        in:     "cubic-bezier(0.4, 0, 1, 1)",
      },

      transitionDuration: {
        fast:   "140ms",
        DEFAULT:"220ms",
        slow:   "380ms",
      },
    },
  },

  plugins: [],
};