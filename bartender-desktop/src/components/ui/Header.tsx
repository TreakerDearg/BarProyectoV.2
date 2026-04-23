import { useAuthStore } from "../../store/authStore";
import { NavLink, useLocation } from "react-router-dom";
import { routesConfig } from "../../routes/routes.config";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  /* ===============================
     SMART ROUTE DETECTION
  =============================== */
  const currentRoute = [...routesConfig]
    .sort((a, b) => b.path.length - a.path.length)
    .find((route) => location.pathname.startsWith(route.path));

  const tabs = currentRoute?.children ?? [];

  return (
    <header className="w-full border-b border-[rgba(255,255,255,0.06)] bg-[#0E131B]/70 backdrop-blur-xl">

      {/* ================= TOP BAR ================= */}
      <div className="h-16 flex items-center justify-between px-6">

        {/* LEFT */}
        <div className="flex flex-col">
          <h1 className="text-sm md:text-base font-semibold text-white tracking-wide">
            {currentRoute?.title || "Sistema"}
          </h1>

          <span className="text-xs text-[#71717A]">
            Obsidian Control Center
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* SYSTEM STATUS */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827]/40 border border-[rgba(255,255,255,0.06)]">

            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute h-full w-full rounded-full bg-[#34D399] opacity-60"></span>
              <span className="relative h-2.5 w-2.5 rounded-full bg-[#34D399]"></span>
            </span>

            <span className="text-xs text-[#71717A]">
              Sistema activo
            </span>

          </div>

          {/* USER CARD */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#111827]/50 border border-[rgba(255,255,255,0.06)] shadow-[0_0_25px_rgba(0,0,0,0.35)]">

            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#34D399] flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-sm text-white font-medium">
                {user?.name || "Usuario"}
              </span>

              <span className="text-[10px] text-[#71717A]">
                Administrador
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* ================= AUTO TABS ================= */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-2 px-6 pb-3 overflow-x-auto">

          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `
                relative text-xs px-3 py-1.5 rounded-lg border transition whitespace-nowrap

                ${
                  isActive
                    ? "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/30 shadow-[0_0_12px_rgba(167,139,250,0.15)]"
                    : "text-[#71717A] border-transparent hover:text-white hover:bg-[#111827]/40"
                }
              `
              }
            >
              {tab.name}

              {/* ACTIVE INDICATOR */}
              {({ isActive }: any) =>
                isActive && (
                  <span className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
                )
              }
            </NavLink>
          ))}

        </div>
      )}
    </header>
  );
}