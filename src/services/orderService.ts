const API = "http://localhost:5000/api/orders";

// GET ALL
export const getOrders = async () => {
  const res = await fetch(API);

  if (!res.ok) {
    throw new Error("Error al obtener pedidos");
  }

  return res.json();
};

// GET ONE ( CLAVE PARA STATUS PAGE)
export const getOrderById = async (id: string) => {
  const res = await fetch(`${API}/${id}`);

  if (!res.ok) {
    throw new Error("Pedido no encontrado");
  }

  return res.json();
};

// ➕ CREATE ORDER
export const createOrder = async (data: any) => {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear pedido");
  }

  return res.json();
};

// UPDATE STATUS
export const updateOrderStatus = async (
  id: string,
  status: string
) => {
  const res = await fetch(`${API}/${id}/status`, { // 🔥 FIX
    method: "PATCH", // 🔥 FIX
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar estado");
  }

  return res.json();
};