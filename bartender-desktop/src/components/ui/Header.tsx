import { useAuthStore } from "../../store/authStore";
import { NavLink, useLocation } from "react-router-dom";
import { routesConfig } from "../../routes/routes.config";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const currentRoute = [...routesConfig]
    .sort((a, b) => b.path.length - a.path.length)
    .find((route) => location.pathname.startsWith(route.path));

  const tabs = currentRoute?.children ?? [];

  return (
    <header className="
      w-full 
      border-b border-obsidian/40 
      bg-void/80 backdrop-blur-xl 
      font-mono 
      relative z-20
    ">

      {/* ================= TOP BAR ================= */}
      <div className="h-16 flex items-center justify-between px-6">

        {/* LEFT */}
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-white tracking-widest uppercase">
            {currentRoute?.title || "SYSTEM_DASHBOARD"}
          </h1>

          <span className="text-[9px] text-[#00FFFF] tracking-widest font-bold mt-1">
            OBSIDIAN_CONTROL_CENTER
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6">

          {/* SYSTEM STATUS */}
          <div className="
            flex items-center gap-3 px-4 py-1.5 rounded-lg
            bg-obsidian/30 border border-obsidian/60
            shadow-[0_0_15px_rgba(52,185,100,0.1)]
          ">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-bar-green opacity-60"></span>
              <span className="relative h-2 w-2 rounded-full bg-bar-green shadow-[0_0_8px_#34B964]"></span>
            </span>
            <span className="text-[10px] text-bar-green font-bold tracking-widest">
              SYSTEM_ACTIVE
            </span>
          </div>

          {/* USER */}
          <div className="
            flex items-center gap-3 px-4 py-1.5 rounded-lg
            bg-obsidian/30 border border-obsidian/60
            hover:border-gray-500 transition cursor-pointer
          ">
            <div className="
              h-6 w-6 rounded border border-[#8B5CF6]/40 
              bg-[#8B5CF6]/10 flex items-center justify-center 
              text-xs font-bold text-[#8B5CF6]
              shadow-[0_0_8px_rgba(139,92,246,0.2)]
            ">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-white font-bold tracking-wider uppercase">
                {user?.name || "SYS_ADMIN"}
              </span>
              <span className="text-[9px] text-gray-500 tracking-widest uppercase">
                {user?.role || "ACCESS_LEVEL_1"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      {tabs.length > 0 && (
        <div className="
          flex items-center gap-2 px-6 pb-2
          border-t border-obsidian/30
        ">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `
                relative text-[10px] px-3 py-1.5 rounded-md 
                font-bold tracking-widest uppercase transition

                ${
                  isActive
                    ? `
                      text-[#8B5CF6]
                      bg-[#8B5CF6]/10
                      border border-[#8B5CF6]/30
                      shadow-[0_0_10px_rgba(139,92,246,0.25)]
                    `
                    : `
                      text-gray-500
                      hover:text-white
                      hover:bg-obsidian/40
                    `
                }
              `
              }
            >
              {tab.name}

              {/* ACTIVE GLOW LINE */}
              <span
                className={`
                  absolute bottom-0 left-0 w-full h-[1px]
                  transition-all duration-300
                  ${
                    location.pathname === tab.path
                      ? "bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6]"
                      : "opacity-0"
                  }
                `}
              />
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}