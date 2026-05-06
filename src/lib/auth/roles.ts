/**
 * Roles devueltos por POST /auth/login y POST /auth/register.
 * El registro público en la API solo crea rol `client`.
 */
export const ROLE_CLIENT = "client";

/** Rutas por defecto tras iniciar sesión en la web */
export function destinationAfterLogin(role: string): string {
  if (role === ROLE_CLIENT) return "/cliente";
  return "/admin";
}

/** Etiqueta legible para cabeceras / UI */
export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    client: "Cliente",
    admin: "Administrador",
    manager: "Gerente",
    bartender: "Bartender",
    waiter: "Mozo",
    kitchen: "Cocina",
    cashier: "Caja",
  };
  return map[role] ?? role;
}

export function isStaffRole(role: string): boolean {
  return role !== ROLE_CLIENT;
}
