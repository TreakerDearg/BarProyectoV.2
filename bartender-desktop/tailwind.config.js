/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      /* ============================================================
         PALETA SLATE ELEGANTE — Bartender Desktop v3.0
         Sincronizada con src/index.css :root
         REGLA: Si cambias un color aquí, cámbialo también en index.css
      ============================================================ */
      colors: {

        /* ── Fondos ─────────────────────────────────────────────── */
        bg: {
          DEFAULT: "#0D1117",
          deep:    "#090E14",
        },
        surface: {
          DEFAULT: "#161B22",
          2:       "#1C2333",
          3:       "#21283A",
          4:       "#293042",
        },

        /* ── Primario — Dorado vivo ──────────────────────────────── */
        gold: {
          DEFAULT: "#F0B429",
          light:   "#F5C842",
          dark:    "#C8920F",
          50:  "rgba(240,180,41,0.05)",
          100: "rgba(240,180,41,0.10)",
          200: "rgba(240,180,41,0.20)",
          300: "rgba(240,180,41,0.30)",
        },

        /* ── Éxito — Verde GitHub ────────────────────────────────── */
        emerald: {
          DEFAULT: "#3FB950",
          light:   "#56D364",
          dark:    "#2EA043",
          50:  "rgba(63,185,80,0.05)",
          100: "rgba(63,185,80,0.12)",
          200: "rgba(63,185,80,0.20)",
          300: "rgba(63,185,80,0.30)",
        },

        /* ── Peligro — Rojo claro ────────────────────────────────── */
        red: {
          DEFAULT: "#F85149",
          light:   "#FF6B63",
          dark:    "#D1322A",
          50:  "rgba(248,81,73,0.05)",
          100: "rgba(248,81,73,0.12)",
          200: "rgba(248,81,73,0.20)",
          300: "rgba(248,81,73,0.30)",
        },

        /* ── Advertencia — Naranja suave ─────────────────────────── */
        ember: {
          DEFAULT: "#FF7B54",
          light:   "#FF9A7A",
          dark:    "#D95830",
          50:  "rgba(255,123,84,0.05)",
          100: "rgba(255,123,84,0.12)",
          200: "rgba(255,123,84,0.20)",
          300: "rgba(255,123,84,0.30)",
        },

        /* ── Amber (acento cálido secundario) ────────────────────── */
        amber: {
          DEFAULT: "#F5A623",
          light:   "#F7BC52",
          dark:    "#C87D0F",
          50:  "rgba(245,166,35,0.05)",
          100: "rgba(245,166,35,0.12)",
          200: "rgba(245,166,35,0.20)",
          300: "rgba(245,166,35,0.30)",
        },

        /* ── Texto ──────────────────────────────────────────────── */
        ivory:  "#E6EDF3",       /* --text  */
        muted:  "#8B949E",       /* --text-dim */

        /* ── Borde ──────────────────────────────────────────────── */
        border: {
          DEFAULT: "#30363D",
          strong:  "#3D444D",
        },

        /* ── Neutro ─────────────────────────────────────────────── */
        neutral: {
          DEFAULT: "#3D444D",
          light:   "#566270",
          dark:    "#21262D",
        },

        /* ── Colores semánticos (aliases para Tailwind) ─────────── */
        success: {
          DEFAULT: "#3FB950",
          50:  "rgba(63,185,80,0.05)",
          100: "rgba(63,185,80,0.10)",
          200: "rgba(63,185,80,0.20)",
        },
        warning: {
          DEFAULT: "#FF7B54",
          50:  "rgba(255,123,84,0.05)",
          100: "rgba(255,123,84,0.10)",
          200: "rgba(255,123,84,0.20)",
        },
        danger: {
          DEFAULT: "#F85149",
          50:  "rgba(248,81,73,0.05)",
          100: "rgba(248,81,73,0.10)",
          200: "rgba(248,81,73,0.20)",
        },

        /* ── Legacy names — backward compat ────────────────────── */
        brand: {
          DEFAULT: "#F85149",
          light:   "#FF6B63",
          dark:    "#D1322A",
        },
        lime: {
          DEFAULT: "#3FB950",
          light:   "#56D364",
          dark:    "#2EA043",
        },
        obsidian: {
          DEFAULT: "#161B22",
          light:   "#1C2333",
          dark:    "#0D1117",
        },
        void: "#090E14",

        /* ── Nebula aliases ─────────────────────────────────────── */
        nebula: {
          bg:    { DEFAULT: "#090E14", 1: "#0D1117", 2: "#161B22" },
          panel: { DEFAULT: "#1C2333", 1: "#21283A", 2: "#293042" },
          hover: "#21283A",
        },
        accent: {
          DEFAULT: "#F0B429",
          1: "#3FB950",
          2: "#FF7B54",
          50:  "rgba(240,180,41,0.05)",
          100: "rgba(240,180,41,0.10)",
          200: "rgba(240,180,41,0.20)",
          300: "rgba(240,180,41,0.30)",
        },
        text: {
          DEFAULT: "#E6EDF3",
          1: "#C8D3E0",
          2: "#8B949E",
          3: "#566270",
        },
      },

      /* ============================================================
         FUENTES
      ============================================================ */
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },

      /* ============================================================
         GRADIENTES
      ============================================================ */
      backgroundImage: {
        "grad-gold":    "linear-gradient(135deg, #C8920F 0%, #F0B429 50%, #F5C842 100%)",
        "grad-green":   "linear-gradient(135deg, #2EA043 0%, #3FB950 50%, #56D364 100%)",
        "grad-red":     "linear-gradient(135deg, #D1322A 0%, #F85149 50%, #FF6B63 100%)",
        "grad-orange":  "linear-gradient(135deg, #D95830 0%, #FF7B54 50%, #FF9A7A 100%)",
        "grad-brand":   "linear-gradient(135deg, #F85149 0%, #F0B429 60%, #FF7B54 100%)",
        "grad-dark":    "linear-gradient(180deg, #161B22 0%, #0D1117 100%)",
        "grad-surface": "linear-gradient(180deg, #1C2333 0%, #161B22 100%)",
      },

      /* ============================================================
         BORDER RADIUS
      ============================================================ */
      borderRadius: {
        sm:     "6px",
        DEFAULT:"10px",
        md:     "12px",
        lg:     "16px",
        xl:     "24px",
        "2xl":  "32px",
      },

      /* ============================================================
         SOMBRAS
      ============================================================ */
      boxShadow: {
        xs:     "0 2px 8px rgba(0,0,0,0.40)",
        sm:     "0 4px 16px rgba(0,0,0,0.50)",
        DEFAULT:"0 8px 32px rgba(0,0,0,0.65)",
        lg:     "0 16px 56px rgba(0,0,0,0.80)",
        gold:   "0 4px 24px rgba(240,180,41,0.20)",
        red:    "0 4px 24px rgba(248,81,73,0.20)",
        green:  "0 4px 24px rgba(63,185,80,0.18)",
        orange: "0 4px 24px rgba(255,123,84,0.18)",
        glow:   "0 0 32px rgba(240,180,41,0.18)",
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
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(240,180,41,0)" },
          "50%":      { boxShadow: "0 0 0 6px rgba(240,180,41,0.15)" },
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
        fast:    "140ms",
        DEFAULT: "220ms",
        slow:    "380ms",
      },

      /* ============================================================
         ESPACIADO (Base 4px)
      ============================================================ */
      spacing: {
        1:  "4px",
        2:  "8px",
        3:  "12px",
        4:  "16px",
        5:  "20px",
        6:  "24px",
        8:  "32px",
        10: "40px",
        12: "48px",
      },
    },
  },

  plugins: [],
};
