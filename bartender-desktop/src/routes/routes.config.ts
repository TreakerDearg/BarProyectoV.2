export const routesConfig = [
  {
    path: "/dashboard",
    title: "Dashboard",
  },

  /* ===============================
     EMPLOYEES MODULE (ADMIN CORE)
  =============================== */
  {
    path: "/employees",
    title: "Gestión de Empleados",
    children: [
      {
        path: "/employees",
        name: "Activos",
      },
      {
        path: "/employees/permissions",
        name: "Permisos",
      },
      {
        path: "/employees/roles",
        name: "Roles",
      },
      {
        path: "/employees/shifts",
        name: "Permisos Turno",
      },
      {
        path: "/employees/activity",
        name: "Tracking Actividad",
      },
      {
        path: "/employees/shift-management",
        name: "Gestión Turnos",
      },
      {
        path: "/employees/shift-metrics",
        name: "Métricas Turnos",
      },
    ],
  },

  /* ===============================
     OPERATIONS
  =============================== */
  {
    path: "/orders",
    title: "Gestión de Pedidos",
    children: [
      {
        path: "/orders",
        name: "Activos",
      },
      {
        path: "/orders/history",
        name: "Historial",
      },
    ],
  },
  {
    path: "/discounts",
    title: "Descuentos Manuales",
  },

  /* ===============================
     PRODUCTS / INVENTORY
  =============================== */
  {
    path: "/products",
    title: "Productos & Inventario",
    children: [
      {
        path: "/products",
        name: "Productos",
      },
      {
        path: "/inventory",
        name: "Inventario",
      },
      {
        path: "/recipes",
        name: "Recetas",
      },
      {
        path: "/menus",
        name: "Menús",
      },
    ],
  },

  /* ===============================
     RESERVATIONS & TABLES
  =============================== */
  {
    path: "/tables",
    title: "Mesas",
  },
  {
    path: "/reservations",
    title: "Reservas",
  },

  /* ===============================
     FUN MODULE (ROULETTE SYSTEM)
  =============================== */
  {
    path: "/roulette",
    title: "Ruleta de Tragos",
  },

  /* ===============================
     SETTINGS
  =============================== */
  {
    path: "/settings",
    title: "Configuración",
  },
];