const normalizeRole = (role?: string | null) => (role || "").toLowerCase().trim();

const permissionsByRole: Record<string, string[]> = {
  admin: ["*"],
  manager: ["*"],
  bartender: [
    "/dashboard",
    "/orders",
    "/tables",
    "/reservations",
    "/discounts",
    "/discounts/events",
    "/discounts/dynamic",
    "/discounts/apply",
    "/promotions",
    "/roulette",
  ],
  waiter: [
    "/dashboard",
    "/orders",
    "/tables",
    "/reservations",
    "/discounts",
  ],
  cashier: [
    "/dashboard",
    "/orders",
    "/tables",
    "/reservations",
    "/discounts",
    "/discounts/events",
    "/discounts/dynamic",
    "/discounts/apply",
    "/promotions",
  ],
  kitchen: ["/dashboard", "/orders", "/inventory", "/recipes"],
};

export function canAccessPath(role: string | undefined | null, path: string): boolean {
  const normalizedRole = normalizeRole(role);
  const allowed = permissionsByRole[normalizedRole] || [];
  if (allowed.includes("*")) return true;
  return allowed.some((basePath) => path === basePath || path.startsWith(`${basePath}/`));
}
