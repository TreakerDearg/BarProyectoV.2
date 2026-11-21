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
    title: "Gestión de Personal & Turnos",
    children: [
      {
        path: "/employees",
        name: "Directorio & Plantilla",
      },
      {
        path: "/employees/shifts",
        name: "Turnos & Asistencia",
      },
      {
        path: "/employees/roles",
        name: "Roles & Permisos",
      },
      {
        path: "/employees/dashboard",
        name: "Inteligencia Laboral",
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
        name: "Nebula Recipe Studio",
        children: [
          {
            path: "/recipes",
            name: "Library",
          },
          {
            path: "/recipes/new",
            name: "Builder",
          },
          {
            path: "/recipes/:id",
            name: "Studio",
          },
          {
            path: "/recipes/edit/:id",
            name: "Edit",
          },
        ],
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