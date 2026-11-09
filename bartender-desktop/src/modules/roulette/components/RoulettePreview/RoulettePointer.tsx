"use client";

interface Props {
  needleBounce?: boolean;
  isActive?: boolean;
}

export default function RoulettePointer({ needleBounce = false, isActive = false }: Props) {
  return (
    <div
      className={`absolute -top-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none transition-transform duration-150 ${
        needleBounce ? "scale-110 -translate-y-1" : ""
      }`}
    >
      {/* Sombra proyectada sobre el bisel */}
      <div className="absolute top-8 w-8 h-3 bg-black/60 blur-xs rounded-full pointer-events-none" />

      {/* Cuerpo principal del puntero — Daga Royale */}
      <div className="relative flex flex-col items-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
        {/* Cabezal / Base de fijación de oro pulido */}
        <div className="w-9 h-3.5 bg-gradient-to-b from-[#F5C842] via-[#F0B429] to-[#C8920F] rounded-t-md border-t border-x border-[#F5C842] flex items-center justify-center shadow-md">
          {/* Remache central joya */}
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              isActive ? "bg-emerald animate-pulse shadow-[0_0_8px_#3FB950]" : "bg-[#0D1117] border border-[#F0B429]"
            }`}
          />
        </div>

        {/* Hoja / Flecha triangular de oro con bisel central */}
        <svg width="28" height="28" viewBox="0 0 28 28" className="overflow-visible -mt-0.5">
          <defs>
            <linearGradient id="pointer-gold-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5C842" />
              <stop offset="100%" stopColor="#F0B429" />
            </linearGradient>
            <linearGradient id="pointer-gold-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C8920F" />
              <stop offset="100%" stopColor="#8A6008" />
            </linearGradient>
            <filter id="pointer-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Faceta Izquierda Iluminada */}
          <path
            d="M 14 26 L 2 2 L 14 5 Z"
            fill="url(#pointer-gold-left)"
            filter="url(#pointer-glow)"
          />

          {/* Faceta Derecha en Sombra */}
          <path
            d="M 14 26 L 26 2 L 14 5 Z"
            fill="url(#pointer-gold-right)"
            filter="url(#pointer-glow)"
          />

          {/* Nervio Central */}
          <line x1="14" y1="5" x2="14" y2="25" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.7" />

          {/* Acento en la punta */}
          <circle cx="14" cy="24" r="1.2" fill="#FFFFFF" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}
