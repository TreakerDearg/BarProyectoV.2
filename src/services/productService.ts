const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const PRODUCTS_API = `${API}/api/products`;

/* ================================
   INTERFAZ DE PRODUCTO
================================ */
export interface Product {
  _id: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ================================
   FUNCIÓN GENÉRICA PARA FETCH
================================ */
async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Error ${res.status}: ${errorText || res.statusText}`
    );
  }

  // Evita errores si la respuesta está vacía
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

/* ================================
   OBTENER PRODUCTOS
================================ */
export const getProducts = async (): Promise<Product[]> => {
  return fetchAPI<Product[]>(PRODUCTS_API);
};

/* ================================
   CREAR PRODUCTO
================================ */
export const createProduct = async (
  data: Omit<Product, "_id">
): Promise<Product> => {
  return fetchAPI<Product>(PRODUCTS_API, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/* ================================
   ACTUALIZAR PRODUCTO
================================ */
export const updateProduct = async (
  id: string,
  data: Partial<Omit<Product, "_id">>
): Promise<Product> => {
  return fetchAPI<Product>(`${PRODUCTS_API}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/* ================================
   ELIMINAR PRODUCTO
================================ */
export const deleteProduct = async (
  id: string
): Promise<void> => {
  await fetchAPI<void>(`${PRODUCTS_API}/${id}`, {
    method: "DELETE",
  });
};