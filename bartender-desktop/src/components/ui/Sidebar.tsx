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
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import styles from "../../styles/Sidebar.module.css";

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
      items: [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
    },
    {
      title: "Operación",
      items: [
        { name: "Pedidos", path: "/orders", icon: ClipboardList },
        { name: "Mesas", path: "/tables", icon: Armchair },
        { name: "Reservas", path: "/reservations", icon: CalendarDays },
      ],
    },
    {
      title: "Gestión",
      items: [
        { name: "Productos", path: "/products", icon: Wine },
        { name: "Menús", path: "/menus", icon: UtensilsCrossed },
        { name: "Inventario", path: "/inventory", icon: Package },
        { name: "Recetas", path: "/recipes", icon: BookOpen },
      ],
    },
    {
      title: "Sistema",
      items: [
        { name: "Empleados", path: "/employees", icon: Users },
        { name: "Ruleta", path: "/roulette", icon: Dices },
      ],
    },
  ];

  return (
    <aside className={styles.sidebar}>
      {/* LOGO */}
      <div className={styles.logo}>
        <div className={styles.brand}>
          <span className={styles.brandAccent}>🍸</span>
          Bartender
        </div>
        <div className={styles.subtitle}>Panel de control</div>
      </div>

      {/* NAV */}
      <nav className={styles.nav}>
        {menuSections.map((section) => (
          <div key={section.title}>
            <div className={styles.sectionTitle}>{section.title}</div>

            {section.items.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={name}
                to={path}
                className={({ isActive }) =>
                  `${styles.item} ${isActive ? styles.active : ""}`
                }
              >
                <Icon className={styles.icon} size={18} />
                <span className="text-sm">{name}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logout}>
          <LogOut size={18} />
          <span className="text-sm">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}