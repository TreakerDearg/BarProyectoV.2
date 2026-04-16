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
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Productos", path: "/products", icon: Wine },
    { name: "Menús", path: "/menus", icon: UtensilsCrossed },
    { name: "Pedidos", path: "/orders", icon: ClipboardList },
    { name: "Reservas", path: "/reservations", icon: CalendarDays },
    { name: "Mesas", path: "/tables", icon: Armchair },
    { name: "Inventario", path: "/inventory", icon: Package },
    { name: "Recetas", path: "/recipes", icon: BookOpen },
    { name: "Empleados", path: "/employees", icon: Users },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 text-xl font-bold text-amber-400 border-b border-gray-800">
        🍸 Bartender
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-2 px-4 py-4 overflow-y-auto">
        {menuItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-amber-500 text-black font-semibold"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Botón de cierre de sesión */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full p-3 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}