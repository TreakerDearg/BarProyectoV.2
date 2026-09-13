"use client";

import { useAuthStore } from "../../store/authStore";
import { NavLink, useLocation } from "react-router-dom";
import { routesConfig } from "../../routes/routes.config";
import { canAccessPath } from "../../config/accessControl";
import { Wifi } from "lucide-react";

export default function Header() {
  const user     = useAuthStore((state) => state.user);
  const location = useLocation();

  /* Ruta activa y sus sub-tabs */
  const currentRoute = [...routesConfig]
    .sort((a, b) => b.path.length - a.path.length)
    .find((route) => location.pathname.startsWith(route.path));

  const tabs = (currentRoute?.children ?? []).filter((tab) =>
    canAccessPath(user?.role, tab.path)
  );

  /* Iniciales del usuario */
  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 h-14 gap-4">

        {/* Título de la ruta actual */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-ivory truncate leading-none">
              {currentRoute?.title ?? "Dashboard"}
            </h1>
            <p className="text-[9px] text-muted/50 font-medium tracking-widest uppercase mt-0.5 leading-none">
              bartender&nbsp;·&nbsp;control center
            </p>
          </div>
        </div>

        {/* Controles derechos */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
            <Wifi size={11} className="text-emerald-400" />
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
              Online
            </span>
          </div>

          {/* User chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 cursor-pointer hover:bg-white/6 transition-colors">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold/40 to-amber-600/30 border border-gold/25 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-black text-gold leading-none">{initials}</span>
            </div>
            <div className="hidden sm:flex flex-col leading-none gap-0.5">
              <span className="text-[11px] font-semibold text-ivory">
                {user?.name?.split(" ")[0] ?? "Usuario"}
              </span>
              <span className="text-[9px] text-muted/60 capitalize">
                {user?.role ?? "staff"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-tabs (si existen) ─────────────────────────────── */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-0.5 px-5 pb-2 border-t border-white/[0.04]">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `relative px-3.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide
                 transition-all duration-200
                 ${isActive
                   ? "bg-gold/10 text-gold border border-gold/20"
                   : "text-muted hover:text-ivory hover:bg-white/5"
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {tab.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-gold/60" />
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
