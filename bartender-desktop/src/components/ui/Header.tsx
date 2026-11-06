"use client";

import { useAuthStore }   from "../../store/authStore";
import { NavLink, useLocation } from "react-router-dom";
import { routesConfig }   from "../../routes/routes.config";
import { canAccessPath }  from "../../config/accessControl";
import { Wifi }           from "lucide-react";

export default function Header() {
  const user     = useAuthStore((state) => state.user);
  const location = useLocation();

  /* Ruta activa (lógica sin cambios) */
  const currentRoute = [...routesConfig]
    .sort((a, b) => b.path.length - a.path.length)
    .find((route) => location.pathname.startsWith(route.path));

  const tabs = (currentRoute?.children ?? []).filter((tab) =>
    canAccessPath(user?.role, tab.path)
  );

  /* Iniciales */
  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div
      className="flex flex-col bg-[#161B22] border-b border-[#30363D]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 h-16 gap-4">

        {/* Título de la sección actual */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[#E6EDF3] truncate leading-tight">
              {currentRoute?.title ?? "Dashboard"}
            </h1>
            <p className="text-[11px] text-[#566270] font-medium tracking-widest uppercase leading-none mt-0.5">
              bartender&nbsp;·&nbsp;control center
            </p>
          </div>
        </div>

        {/* Controles derechos */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* Indicador de estado Online */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#3FB950]/8 border border-[#3FB950]/20">
            <div className="relative flex-shrink-0">
              {/* Punto pulsante */}
              <div className="w-2 h-2 rounded-full bg-[#3FB950] shadow-[0_0_6px_#3FB950]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#3FB950] animate-ping opacity-60" />
            </div>
            <Wifi size={13} className="text-[#3FB950]" />
            <span className="text-xs font-bold text-[#3FB950] uppercase tracking-wider">
              Online
            </span>
          </div>

          {/* Chip del usuario */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#1C2333] border border-[#30363D] cursor-pointer hover:bg-[#21283A] hover:border-[#3D444D] transition-all duration-200">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F0B429]/50 to-[#C8920F]/30 border-2 border-[#F0B429]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-black text-[#F0B429] leading-none">{initials}</span>
            </div>
            {/* Info */}
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-sm font-semibold text-[#E6EDF3]">
                {user?.name?.split(" ")[0] ?? "Usuario"}
              </span>
              <span className="text-[11px] text-[#566270] capitalize">
                {user?.role ?? "staff"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-tabs (si existen) ─────────────────────────────── */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-1 px-6 pb-0 border-t border-[#30363D]/50">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `relative px-4 py-3 text-sm font-medium tracking-wide
                 transition-all duration-200
                 ${isActive
                   ? "text-[#F0B429]"
                   : "text-[#8B949E] hover:text-[#E6EDF3]"
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {tab.name}
                  {/* Underline activo */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-[#F0B429] shadow-[0_0_8px_rgba(240,180,41,0.5)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
