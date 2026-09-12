"use client";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, ClipboardList,
  CalendarDays, Armchair, Package, Wine, LogOut,
  BookOpen, Users, Dices, Percent, ChevronLeft,
  Settings, ChevronDown, BarChart3, Shield, Clock,
  Activity, Calendar, TrendingUp, Bell, FlaskConical,
  Layers, GlassWater,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import { useUIStore }   from "../../store/uiStore";
import { canAccessPath } from "../../config/accessControl";
import { useNotificationBell } from "../../components/shared/NotificationCenter";

/* ── Rutas ─────────────────────────────────────────────────────── */
const PATHS = {
  DASHBOARD:                "/dashboard",
  ORDERS:                   "/orders",
  TABLES:                   "/tables",
  RESERVATIONS:             "/reservations",
  DISCOUNTS:                "/discounts",
  PRODUCTS:                 "/products",
  MENUS:                    "/menus",
  INVENTORY:                "/inventory",
  RECIPES:                  "/recipes",
  RECIPES_NEW:              "/recipes/new",
  EMPLOYEES:                "/employees",
  EMPLOYEES_DASHBOARD:      "/employees/dashboard",
  EMPLOYEES_ROLES:          "/employees/roles",
  EMPLOYEES_PERMISSIONS:    "/employees/permissions",
  EMPLOYEES_SHIFTS:         "/employees/shifts",
  EMPLOYEES_ACTIVITY:       "/employees/activity",
  EMPLOYEES_SHIFT_MANAGEMENT: "/employees/shift-management",
  EMPLOYEES_SHIFT_METRICS:  "/employees/shift-metrics",
  ROULETTE:                 "/roulette",
  SETTINGS:                 "/settings",
};

/* ── Tipo de item ──────────────────────────────────────────────── */
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

/* ── Tooltip ───────────────────────────────────────────────────── */
function Tooltip({ label }: { label: string }) {
  return (
    <span className="
      absolute left-full ml-3 z-50 px-2.5 py-1.5 text-[10px] font-semibold
      bg-[#12121A] border border-white/10 rounded-lg
      shadow-[0_4px_20px_rgba(0,0,0,0.5)]
      opacity-0 group-hover:opacity-100
      translate-x-2 group-hover:translate-x-0
      transition-all duration-150
      whitespace-nowrap pointer-events-none text-ivory
    ">
      {label}
    </span>
  );
}

/* ── Nav item simple ───────────────────────────────────────────── */
function NavItemLink({
  item, collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={item.path}
      end={item.path === "/recipes"}
      className={({ isActive }) =>
        `group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium
        transition-all duration-200 cursor-pointer
        ${isActive
          ? "bg-gold/10 text-gold border border-gold/20 shadow-[0_0_12px_rgba(212,163,64,0.08)]"
          : "text-muted hover:text-ivory hover:bg-white/5"
        }
        ${collapsed ? "justify-center" : ""}
        `
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-gold shadow-[0_0_8px_rgba(212,163,64,0.6)]" />
          )}
          <item.icon
            size={16}
            className={`flex-shrink-0 transition-colors ${isActive ? "text-gold" : "text-muted group-hover:text-ivory"}`}
          />
          {!collapsed && <span className="truncate leading-none">{item.name}</span>}
          {collapsed && <Tooltip label={item.name} />}
          {item.badge && !collapsed && (
            <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gold/15 text-gold border border-gold/20">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

/* ── Nav item con submenu ──────────────────────────────────────── */
function NavItemSubmenu({
  item, collapsed, expanded, onToggle,
}: {
  item: NavItem;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div>
      <button
        type="button"
        onClick={() => collapsed ? navigate(item.path) : onToggle()}
        className={`group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium
          transition-all duration-200 cursor-pointer
          ${expanded && !collapsed
            ? "bg-gold/8 text-gold border border-gold/15"
            : "text-muted hover:text-ivory hover:bg-white/5"
          }
          ${collapsed ? "justify-center" : ""}
        `}
      >
        <item.icon
          size={16}
          className={`flex-shrink-0 transition-colors ${
            expanded && !collapsed ? "text-gold" : "text-muted group-hover:text-ivory"
          }`}
        />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate leading-none">{item.name}</span>
            <ChevronDown
              size={12}
              className={`flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </>
        )}
        {collapsed && <Tooltip label={item.name} />}
      </button>

      {!collapsed && expanded && (
        <div className="mt-1 ml-3 pl-3 border-l border-white/8 space-y-0.5">
          {item.submenu!.map((sub) => (
            <NavLink
              key={sub.name}
              to={sub.path}
              end
              className={({ isActive }) =>
                `group relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium
                transition-all duration-150
                ${isActive
                  ? "text-gold bg-gold/8 border border-gold/15"
                  : "text-muted/70 hover:text-ivory hover:bg-white/4"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <sub.icon size={13} className={`flex-shrink-0 ${isActive ? "text-gold" : "text-muted/50"}`} />
                  <span className="truncate leading-none">{sub.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Componente principal ──────────────────────────────────────── */
export default function Sidebar() {
  const logout   = useAuthStore((s) => s.logout);
  const user     = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle    = useUIStore((s) => s.toggleSidebar);

  const [expanded, setExpanded] = useState<string | null>("Nebula Recipe Studio");

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };
  const toggleSection = (name: string) =>
    setExpanded((prev) => (prev === name ? null : name));

  /* ── Secciones ───────────────────────────────────────────────── */
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
        { name: "Pedidos",   path: PATHS.ORDERS,       icon: ClipboardList },
        { name: "Mesas",     path: PATHS.TABLES,        icon: Armchair },
        { name: "Reservas",  path: PATHS.RESERVATIONS,  icon: CalendarDays },
        { name: "Descuentos",path: PATHS.DISCOUNTS,     icon: Percent },
      ],
    },
    {
      title: "Gestión",
      items: [
        { name: "Productos", path: PATHS.PRODUCTS, icon: Wine },
        { name: "Menús",     path: PATHS.MENUS,    icon: UtensilsCrossed },
        { name: "Inventario",path: PATHS.INVENTORY, icon: Package },
        {
          name: "Nebula Recipe Studio",
          path: PATHS.RECIPES,
          icon: FlaskConical,
          submenu: [
            { name: "Biblioteca",  path: PATHS.RECIPES,      icon: BookOpen },
            { name: "Constructor", path: PATHS.RECIPES_NEW,  icon: GlassWater },
            { name: "Técnicas",    path: `${PATHS.RECIPES}?view=techniques`, icon: Layers },
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
            { name: "Lista",            path: PATHS.EMPLOYEES,                  icon: Users },
            { name: "Dashboard",        path: PATHS.EMPLOYEES_DASHBOARD,        icon: BarChart3 },
            { name: "Roles",            path: PATHS.EMPLOYEES_ROLES,            icon: Shield },
            { name: "Permisos",         path: PATHS.EMPLOYEES_PERMISSIONS,      icon: Shield },
            { name: "Turnos",           path: PATHS.EMPLOYEES_SHIFTS,           icon: Clock },
            { name: "Actividad",        path: PATHS.EMPLOYEES_ACTIVITY,         icon: Activity },
            { name: "Gestión Turnos",   path: PATHS.EMPLOYEES_SHIFT_MANAGEMENT, icon: Calendar },
            { name: "Métricas Turnos",  path: PATHS.EMPLOYEES_SHIFT_METRICS,    icon: TrendingUp },
          ],
        },
        { name: "Ruleta",        path: PATHS.ROULETTE, icon: Dices },
        { name: "Configuración", path: PATHS.SETTINGS, icon: Settings },
      ],
    },
  ].map((section) => ({
    ...section,
    items: section.items.filter((item) => canAccessPath(user?.role, item.path)),
  })).filter((section) => section.items.length > 0);

  /* ── Avatar ──────────────────────────────────────────────────── */
  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside className={`
      h-full flex flex-col relative overflow-hidden
      transition-all duration-300 ease-in-out
      ${collapsed ? "w-[64px]" : "w-[230px]"}
    `}>

      {/* ── Atmósfera ────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gold/4 blur-[80px]" />
        <div className="absolute -bottom-10 -right-5 w-32 h-32 bg-violet-500/4 blur-[70px]" />
      </div>

      {/* ── Logo / toggle ─────────────────────────────────── */}
      <div className={`
        relative z-10 flex items-center border-b border-white/6 flex-shrink-0
        ${collapsed ? "justify-center px-3 py-4" : "justify-between px-4 py-4"}
      `}>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[11px] font-black tracking-[0.18em] text-ivory leading-none">BARTENDER</p>
            <p className="text-[8px] text-gold/60 font-bold tracking-[0.25em] uppercase mt-0.5">Bar Control</p>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-white/6 transition-colors flex-shrink-0"
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          <ChevronLeft
            size={14}
            className={`text-muted transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ── Perfil compacto ───────────────────────────────── */}
      {!collapsed && user && (
        <div className="relative z-10 flex items-center gap-2.5 px-4 py-3 border-b border-white/6 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/40 to-amber-600/30 border border-gold/25 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-black text-gold">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-ivory truncate leading-none">
              {user.name?.split(" ")[0] || "Usuario"}
            </p>
            <p className="text-[9px] text-muted/60 capitalize truncate mt-0.5">{user.role || "staff"}</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] flex-shrink-0" />
        </div>
      )}

      {/* ── Navegación ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5 relative z-10 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/8">
        {menuSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-[8px] font-black text-muted/35 tracking-[0.22em] uppercase mb-1.5 px-2">
                {section.title}
              </p>
            )}
            {collapsed && <div className="h-px bg-white/6 my-1.5 mx-2" />}

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
      <div className="relative z-10 border-t border-white/6 p-2 space-y-1 flex-shrink-0">
        {/* Notificaciones */}
        <button
          type="button"
          title="Notificaciones"
          className={`
            group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs
            text-muted hover:text-ivory hover:bg-white/5 transition-all duration-200
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <Bell size={15} className="flex-shrink-0" />
          {!collapsed && <span className="text-xs font-medium">Notificaciones</span>}
          {collapsed && <Tooltip label="Notificaciones" />}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          className={`
            group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs
            text-red-400/70 hover:text-red-300 hover:bg-red-500/8 border border-transparent
            hover:border-red-500/15 transition-all duration-200
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={15} className="flex-shrink-0" />
          {!collapsed && <span className="text-xs font-medium">Cerrar sesión</span>}
          {collapsed && <Tooltip label="Cerrar sesión" />}
        </button>

        {/* Status */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 pt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_#34d399]" />
            <span className="text-[8px] font-bold text-muted/40 uppercase tracking-[0.2em]">Sistema online</span>
          </div>
        )}
      </div>
    </aside>
  );
}
