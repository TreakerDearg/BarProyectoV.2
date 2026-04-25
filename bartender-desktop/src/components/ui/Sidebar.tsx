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
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";

/* ==============================
   ROUTES CENTRALIZADAS (PRO)
============================== */
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
    <aside className="h-full w-64 bg-void/50 border-r border-obsidian/40 flex flex-col font-mono relative overflow-hidden text-gray-400">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-[-5%] left-[-20%] w-48 h-48 bg-[#00FFFF]/5 blur-[60px] pointer-events-none" />

      {/* HEADER / LOGO */}
      <div className="p-6 border-b border-obsidian/40 flex flex-col items-center justify-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#00FFFF]/30 bg-[#00FFFF]/10 flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.2)]">
            <span className="text-xl">🍸</span>
          </div>
          <div>
            <h1 className="text-white font-black tracking-widest text-lg leading-none">BARTENDER</h1>
            <p className="text-[#00FFFF] text-[9px] tracking-widest font-bold mt-1">SYS_CORE // V.4.0</p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 relative z-10">
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-[9px] text-gray-500 tracking-widest mb-3 uppercase font-bold pl-3">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map(({ name, path, icon: Icon }) => (
                <NavLink
                  key={name}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 group ${
                      isActive
                        ? "bg-[#00FFFF]/10 border border-[#00FFFF]/30 text-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.1)]"
                        : "text-gray-400 border border-transparent hover:border-obsidian/60 hover:bg-obsidian/30 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={16}
                        className={`transition-colors ${
                          isActive ? "text-[#00FFFF]" : "text-gray-500 group-hover:text-gray-300"
                        }`}
                      />
                      <span className="mt-0.5">{name.toUpperCase()}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* STATUS / FOOTER */}
      <div className="p-4 border-t border-obsidian/40 bg-void/80 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-bar-green shadow-[0_0_5px_#34B964] animate-pulse" />
          <span className="text-[9px] tracking-widest text-gray-500">SYS_STATUS:</span>
          <span className="text-[9px] font-bold tracking-widest text-bar-green">NOMINAL</span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-bar-red/5 hover:bg-bar-red/10 border border-bar-red/20 hover:border-bar-red/40 text-bar-red rounded-lg text-xs font-bold tracking-widest transition-all duration-300"
        >
          <LogOut size={14} />
          <span>TERMINATE_SESSION</span>
        </button>
      </div>
    </aside>
  );
}