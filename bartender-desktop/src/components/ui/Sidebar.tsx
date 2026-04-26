"use client";

import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  CalendarDays,
  Armchair,
  Package,
  Wine,
  LogOut,
  BookOpen,
  Users,
  Dices,
  Percent,
  ChevronLeft,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";

/* ============================== */
const PATHS = {
  DASHBOARD: "/dashboard",
  ORDERS: "/orders",
  TABLES: "/tables",
  RESERVATIONS: "/reservations",
  DISCOUNTS: "/discounts",
  PRODUCTS: "/products",
  MENUS: "/menus",
  INVENTORY: "/inventory",
  RECIPES: "/recipes",
  EMPLOYEES: "/employees",
  ROULETTE: "/roulette",
};

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const menuSections = [
    {
      title: "General",
      items: [
        { name: "Dashboard", path: PATHS.DASHBOARD, icon: LayoutDashboard },
      ],
    },
    {
      title: "Operación",
      items: [
        { name: "Pedidos", path: PATHS.ORDERS, icon: ClipboardList },
        { name: "Mesas", path: PATHS.TABLES, icon: Armchair },
        { name: "Reservas", path: PATHS.RESERVATIONS, icon: CalendarDays },
        { name: "Descuentos", path: PATHS.DISCOUNTS, icon: Percent },
      ],
    },
    {
      title: "Gestión",
      items: [
        { name: "Productos", path: PATHS.PRODUCTS, icon: Wine },
        { name: "Menús", path: PATHS.MENUS, icon: UtensilsCrossed },
        { name: "Inventario", path: PATHS.INVENTORY, icon: Package },
        { name: "Recetas", path: PATHS.RECIPES, icon: BookOpen },
      ],
    },
    {
      title: "Sistema",
      items: [
        { name: "Empleados", path: PATHS.EMPLOYEES, icon: Users },
        { name: "Ruleta", path: PATHS.ROULETTE, icon: Dices },
      ],
    },
  ];

  return (
    <aside
      className={`
        h-full flex flex-col relative
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
        bg-void/70 border-r border-obsidian/40
        backdrop-blur-xl
      `}
    >
      {/* ================= ATMOSPHERE ================= */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-cyan-400/5 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-violet-500/5 blur-[100px]" />
      </div>

      {/* ================= HEADER ================= */}
      <div className="p-4 border-b border-obsidian/40 flex items-center justify-between relative z-10">

        {!collapsed && (
          <div className="leading-tight">
            <h1 className="text-white font-black tracking-widest text-sm">
              BARTENDER
            </h1>
            <p className="text-cyan-400 text-[9px] font-bold tracking-widest">
              CONTROL_CORE
            </p>
          </div>
        )}

        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-obsidian/40 transition group"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform group-hover:scale-110 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* ================= NAV ================= */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6 relative z-10">

        {menuSections.map((section) => (
          <div key={section.title}>

            {!collapsed && (
              <p className="text-[9px] text-gray-500 tracking-widest mb-2 uppercase font-bold pl-3">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map(({ name, path, icon: Icon }) => (
                <NavLink
                  key={name}
                  to={path}
                  className={({ isActive }) =>
                    `
                    group relative flex items-center
                    ${collapsed ? "justify-center" : "gap-3"}
                    px-3 py-2 rounded-lg text-xs font-bold tracking-wider
                    transition-all duration-300

                    ${
                      isActive
                        ? "text-cyan-400"
                        : "text-gray-400 hover:text-white"
                    }
                  `
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* ACTIVE BAR */}
                      {isActive && (
                        <div className="absolute left-0 top-0 h-full w-[3px] bg-cyan-400 shadow-[0_0_10px_#00FFFF]" />
                      )}

                      {/* ICON */}
                      <Icon
                        size={18}
                        className={`
                          transition-all
                          ${
                            isActive
                              ? "text-cyan-400 drop-shadow-[0_0_6px_#00FFFF]"
                              : "text-gray-500 group-hover:text-white"
                          }
                        `}
                      />

                      {/* TEXT */}
                      {!collapsed && (
                        <span className="mt-[1px]">{name}</span>
                      )}

                      {/* TOOLTIP PRO */}
                      {collapsed && (
                        <span
                          className="
                          absolute left-full ml-3 px-3 py-1.5 text-[10px]
                          bg-[#020617] border border-cyan-400/20
                          rounded-lg shadow-[0_0_12px_rgba(0,255,255,0.2)]
                          opacity-0 group-hover:opacity-100
                          translate-x-2 group-hover:translate-x-0
                          transition-all duration-200
                          whitespace-nowrap pointer-events-none
                        "
                        >
                          {name}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

      </nav>

      {/* ================= FOOTER ================= */}
      <div className="p-3 border-t border-obsidian/40 relative z-10">

        {!collapsed && (
          <div className="flex items-center gap-2 mb-3 text-[9px]">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_#34B964]" />
            <span className="text-gray-500">SYSTEM</span>
            <span className="text-green-400 font-bold">ONLINE</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="
            w-full flex items-center justify-center gap-2 py-2
            bg-red-500/10 hover:bg-red-500/20
            border border-red-500/20 hover:border-red-500/40
            text-red-400 rounded-lg text-xs font-bold
            transition-all duration-300
            hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]
          "
        >
          <LogOut size={14} />
          {!collapsed && "LOGOUT"}
        </button>
      </div>
    </aside>
  );
}