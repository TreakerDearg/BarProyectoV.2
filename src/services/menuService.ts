const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const MENU_API = `${API_URL}/menus`;

// Obtener todos los menús
export const getMenus = async () => {
  const res = await fetch(MENU_API);
  if (!res.ok) throw new Error("Error al obtener los menús");
  return res.json();
};

// Crear un menú
export const createMenu = async (data: {
  name: string;
  products: string[];
}) => {
  const res = await fetch(MENU_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al crear el menú");
  return res.json();
};

// Eliminar un menú
export const deleteMenu = async (id: string) => {
  const res = await fetch(`${MENU_API}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Error al eliminar el menú");
};