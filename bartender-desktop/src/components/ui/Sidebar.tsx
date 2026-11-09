"use client";

import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, ClipboardList,
  CalendarDays, Armchair, Package, Wine, LogOut,
  BookOpen, Users, Dices, Percent, ChevronLeft,
  Settings, ChevronDown, BarChart3, Shield, Clock,
  Activity, Calendar, TrendingUp, Bell, FlaskConical,
  Layers, GlassWater, Gift, ChefHat,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { canAccessPath } from "../../config/accessControl";

/* ── Rutas (sin cambios) ───────────────────────────────────────── */
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
  RECIPES_NEW: "/recipes/new",
  EMPLOYEES: "/employees",
  EMPLOYEES_DASHBOARD: "/employees/dashboard",
  EMPLOYEES_ROLES: "/employees/roles",
  EMPLOYEES_PERMISSIONS: "/employees/permissions",
  EMPLOYEES_SHIFTS: "/employees/shifts",
  EMPLOYEES_ACTIVITY: "/employees/activity",
  EMPLOYEES_SHIFT_MANAGEMENT: "/employees/shift-management",
  EMPLOYEES_SHIFT_METRICS: "/employees/shift-metrics",
  ROULETTE: "/roulette",
  REWARDS: "/rewards",
  SETTINGS: "/settings",
};

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  submenu?: NavItem[];
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* ── Tooltip para sidebar colapsado ──────────────────────────── */
function Tooltip({ label }: { label: string }) {
  return (
    <span className="
      absolute left-full ml-3 z-50 px-3 py-1.5 text-xs font-semibold
      bg-[#1C2333] border border-[#30363D] rounded-lg
      shadow-[0_4px_20px_rgba(0,0,0,0.5)]
      opacity-0 group-hover:opacity-100
      translate-x-2 group-hover:translate-x-0
      transition-all duration-150
      whitespace-nowrap pointer-events-none text-[#E6EDF3]
    ">
      {label}
    </span>
  );
}

/* ── Ítem de navegación simple ───────────────────────────────── */
function NavItemLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === "/recipes"}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
         text-sm font-medium transition-all duration-200 cursor-pointer
         ${isActive
          ? "bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/25 shadow-[0_0_12px_rgba(240,180,41,0.08)]"
          : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-white/5 border border-transparent"
        }
         ${collapsed ? "justify-center" : ""}
        `
      }
    >
      {({ isActive }) => (
        <>
          {/* Borde izquierdo indicador de activo */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[#F0B429] shadow-[0_0_8px_rgba(240,180,41,0.7)]" />
          )}

          <item.icon
            size={18}
            className={`flex-shrink-0 transition-colors ${isActive ? "text-[#F0B429]" : "text-[#566270] group-hover:text-[#E6EDF3]"
              }`}
          />

          {!collapsed && (
            <span className="truncate leading-none">{item.name}</span>
          )}

          {!collapsed && item.badge && (
            <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/25">
              {item.badge}
            </span>
          )}

          {collapsed && <Tooltip label={item.name} />}
        </>
      )}
    </NavLink>
  );
}

/* ── Ítem de navegación con submenu ──────────────────────────── */
function NavItemSubmenu({
  item, collapsed, expanded, onToggle,
}: {
  item: NavItem;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div>
      <button
        type="button"
        onClick={() => collapsed ? navigate(item.path) : onToggle()}
        className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          text-sm font-medium transition-all duration-200 cursor-pointer
          border
          ${expanded && !collapsed
            ? "bg-[#F0B429]/10 text-[#F0B429] border-[#F0B429]/20"
            : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-white/5 border-transparent"
          }
          ${collapsed ? "justify-center" : ""}
        `}
      >
        <item.icon
          size={18}
          className={`flex-shrink-0 transition-colors ${expanded && !collapsed ? "text-[#F0B429]" : "text-[#566270] group-hover:text-[#E6EDF3]"
            }`}
        />

        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate leading-none">{item.name}</span>
            <ChevronDown
              size={14}
              className={`flex-shrink-0 text-[#566270] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </>
        )}

        {collapsed && <Tooltip label={item.name} />}
      </button>

      {/* Submenu expandido */}
      {!collapsed && expanded && (
        <div className="mt-1 ml-4 pl-3 border-l-2 border-[#30363D] space-y-0.5">
          {item.submenu!.map((sub) => {
            const currentFull = location.pathname + location.search;
            const isSubActive = sub.path.includes("?")
              ? currentFull === sub.path
              : location.pathname === sub.path && !location.search;

            return (
              <NavLink
                key={sub.name}
                to={sub.path}
                end
                className={
                  `group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium
                   transition-all duration-150
                   ${isSubActive
                    ? "text-[#F0B429] bg-[#F0B429]/8 border border-[#F0B429]/20"
                    : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-white/4 border border-transparent"
                  }`
                }
              >
                <sub.icon
                  size={14}
                  className={`flex-shrink-0 ${isSubActive ? "text-[#F0B429]" : "text-[#566270] group-hover:text-[#8B949E]"}`}
                />
                <span className="truncate leading-none">{sub.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────── */
export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);

  const [expanded, setExpanded] = useState<string | null>("Fichas Técnicas");

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };
  const toggleSection = (name: string) =>
    setExpanded((prev) => (prev === name ? null : name));

  /* ── Secciones de menú (sin cambios en lógica) ───────────── */
  const menuSections: NavSection[] = [
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
        {
          name: "Fichas Técnicas",
          path: PATHS.RECIPES,
          icon: BookOpen,
          submenu: [
            { name: "Catálogo General", path: PATHS.RECIPES, icon: BookOpen },
            { name: "Barra & Cócteles", path: `${PATHS.RECIPES}?type=drink`, icon: Wine },
            { name: "Cocina & Platos", path: `${PATHS.RECIPES}?type=food`, icon: ChefHat },
            { name: "Centro de Control", path: `${PATHS.RECIPES}?view=dashboard`, icon: BarChart3 },
          ],
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          name: "Empleados",
          path: PATHS.EMPLOYEES,
          icon: Users,
          submenu: [
            { name: "Directorio & Plantilla", path: PATHS.EMPLOYEES, icon: Users },
            { name: "Turnos & Asistencia", path: PATHS.EMPLOYEES_SHIFTS, icon: Clock },
            { name: "Roles & Permisos", path: PATHS.EMPLOYEES_ROLES, icon: Shield },
            { name: "Inteligencia Laboral", path: PATHS.EMPLOYEES_DASHBOARD, icon: BarChart3 },
          ],
        },
        { name: "Ruleta", path: PATHS.ROULETTE, icon: Dices },
        { name: "Recompensas", path: PATHS.REWARDS, icon: Gift },
        { name: "Configuración", path: PATHS.SETTINGS, icon: Settings },
      ],
    },
  ].map((section) => ({
    ...section,
    items: section.items.filter((item) => canAccessPath(user?.role, item.path)),
  })).filter((section) => section.items.length > 0);

  /* ── Iniciales del usuario ───────────────────────────────── */
  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside
      className={`
        h-full flex flex-col relative overflow-hidden
        bg-[#0D1117]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[68px]" : "w-[240px]"}
      `}
    >
      {/* Separador derecho visible */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-[#30363D]" />

      {/* ── Logo / Toggle ──────────────────────────────────── */}
      <div
        className={`
          flex items-center border-b border-[#30363D] flex-shrink-0
          ${collapsed ? "justify-center px-3 py-4" : "justify-between px-4 py-4"}
        `}
      >
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-black tracking-[0.15em] text-[#E6EDF3] leading-none">
              BARTENDER
            </p>
            <p className="text-[10px] text-[#F0B429]/70 font-bold tracking-[0.20em] uppercase mt-0.5">
              Bar Control
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-white/8 transition-colors flex-shrink-0 group"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <ChevronLeft
            size={16}
            className={`text-[#566270] group-hover:text-[#E6EDF3] transition-all duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ── Perfil del usuario ─────────────────────────────── */}
      {!collapsed && user && (
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#30363D] flex-shrink-0 bg-[#161B22]/50">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F0B429]/50 to-[#C8920F]/30 border-2 border-[#F0B429]/30 flex items-center justify-center">
              <span className="text-xs font-black text-[#F0B429]">{initials}</span>
            </div>
            {/* Punto online */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#3FB950] border-2 border-[#0D1117] shadow-[0_0_6px_#3FB950]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#E6EDF3] truncate leading-none">
              {user.name?.split(" ")[0] || "Usuario"}
            </p>
            <p className="text-xs text-[#566270] capitalize truncate mt-0.5">
              {user.role || "staff"}
            </p>
          </div>
        </div>
      )}

      {/* Avatar colapsado */}
      {collapsed && user && (
        <div className="flex justify-center py-3 border-b border-[#30363D] flex-shrink-0">
          <div className="relative group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F0B429]/50 to-[#C8920F]/30 border-2 border-[#F0B429]/30 flex items-center justify-center">
              <span className="text-xs font-black text-[#F0B429]">{initials}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#3FB950] border-2 border-[#0D1117]" />
            <Tooltip label={user.name?.split(" ")[0] || "Usuario"} />
          </div>
        </div>
      )}

      {/* ── Navegación ─────────────────────────────────────── */}
      <nav
        className={`
          flex-1 overflow-y-auto py-4 space-y-5 relative z-10
          scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#30363D]
          ${collapsed ? "px-2" : "px-3"}
        `}
      >
        {menuSections.map((section) => (
          <div key={section.title}>
            {/* Título de sección */}
            {!collapsed ? (
              <p className="text-[10px] font-black text-[#566270] tracking-[0.18em] uppercase mb-2 px-3">
                {section.title}
              </p>
            ) : (
              <div className="h-px bg-[#30363D] my-1 mx-2" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) =>
                item.submenu ? (
                  <NavItemSubmenu
                    key={item.name}
                    item={item}
                    collapsed={collapsed}
                    expanded={expanded === item.name}
                    onToggle={() => toggleSection(item.name)}
                  />
                ) : (
                  <NavItemLink
                    key={item.name}
                    item={item}
                    collapsed={collapsed}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="border-t border-[#30363D] p-2 space-y-1 flex-shrink-0">
        {/* Notificaciones */}
        <button
          type="button"
          title="Notificaciones"
          className={`
            group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-sm text-[#566270] hover:text-[#E6EDF3] hover:bg-white/5
            transition-all duration-200 border border-transparent
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <Bell size={17} className="flex-shrink-0" />
          {!collapsed && <span className="font-medium">Notificaciones</span>}
          {collapsed && <Tooltip label="Notificaciones" />}
        </button>

        {/* Cerrar sesión */}
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          className={`
            group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-sm text-[#F85149]/60 hover:text-[#F85149] hover:bg-[#F85149]/8
            border border-transparent hover:border-[#F85149]/20
            transition-all duration-200
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span className="font-medium">Cerrar sesión</span>}
          {collapsed && <Tooltip label="Cerrar sesión" />}
        </button>

        {/* Indicador de estado — solo expandido */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 pt-2 pb-1">
            <div className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse shadow-[0_0_6px_#3FB950]" />
            <span className="text-[10px] font-bold text-[#566270] uppercase tracking-[0.18em]">
              Sistema online
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
