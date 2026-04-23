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
========================================================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    /* =========================
       TOKEN EXPIRADO O INVÁLIDO
    ========================= */
    if (status === 401) {
      removeToken();

      // limpia headers globales
      delete api.defaults.headers.common.Authorization;

      // evento global para logout UI
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
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