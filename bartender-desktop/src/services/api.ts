import axios from "axios";
import { getToken, removeToken } from "../utils/tokenStorage";

/* =========================================================
   NORMALIZER GLOBAL
   Limpia payloads antes de enviarlos al backend
========================================================= */
const normalizePayload = (data: any) => {
  if (!data || typeof data !== "object") return data;

  const clean: any = {};

  for (const key in data) {
    const value = data[key];

    // elimina valores vacíos reales
    if (value === "" || value === undefined || value === null) {
      continue;
    }

    if (typeof value === "string") {
      clean[key] = value.trim();
    } else if (typeof value === "number") {
      clean[key] = Number(value);
    } else {
      clean[key] = value;
    }
  }

  return clean;
};

/* =========================================================
   AXIOS INSTANCE
========================================================= */
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

/* =========================================================
   REQUEST INTERCEPTOR
   - Inyecta token
   - Normaliza payload
   - Previene headers corruptos
========================================================= */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    // 🔐 AUTH HEADER SAFE
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🧼 CLEAN PAYLOAD
    if (config.data) {
      config.data = normalizePayload(config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
   - Manejo global de auth expirado
   - Estandarización de respuestas
========================================================= */
api.interceptors.response.use(
  (response) => {
    // Si el backend usa { success, data, message }, devolvemos data directo si se prefiere,
    // o simplemente devolvemos response.data para tener todo (es mejor para tener el message)
    return response.data;
  },
  (error) => {
    const status = error?.response?.status;
    const backendData = error?.response?.data;

    /* =========================
       TOKEN EXPIRADO O INVÁLIDO
    ========================= */
    if (status === 401) {
      removeToken();
      delete api.defaults.headers.common.Authorization;
      window.dispatchEvent(new Event("auth:logout"));
    }

    // Normalizar el error para el frontend usando el response estándar del backend
    const normalizedError = {
      message: backendData?.message || "Ocurrió un error inesperado",
      success: false,
      data: backendData?.data || null,
      status: status || 500,
    };

    return Promise.reject(normalizedError);
  }
);

/* =========================================================
   SET AUTH TOKEN MANUAL
   (login / refresh)
========================================================= */
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;