import axios from "axios";
import { getToken, removeToken } from "../utils/tokenStorage";

/* =========================
   NORMALIZER GLOBAL (CLAVE)
========================= */
const normalizePayload = (data: any) => {
  if (!data || typeof data !== "object") return data;

  const clean: any = {};

  for (const key in data) {
    const value = data[key];

    if (value === "" || value === undefined || value === null) {
      continue; // elimina basura del frontend
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

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    
    if (config.data) {
      config.data = normalizePayload(config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      removeToken();
      delete api.defaults.headers.common.Authorization;
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
  }
);

/* =========================
   SET TOKEN
========================= */
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;