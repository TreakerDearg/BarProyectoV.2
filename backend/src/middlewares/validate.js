import { z } from "zod";
import { badRequest } from "../utils/response.js";

/* =========================================================
   MIDDLEWARE DE VALIDACIÓN ZOD
   Uso: router.post("/ruta", validate(miSchema), controller)
========================================================= */
export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return badRequest(res, "Datos inválidos", errors);
    }

    /* Reemplaza req.body con datos validados y sanitizados */
    req.body = result.data;
    next();
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   MIDDLEWARE DE VALIDACIÓN DE PARAMS
   Uso: router.get("/:id", validateParams(schema), controller)
========================================================= */
export const validateParams = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return badRequest(res, "Parámetros inválidos", errors);
    }

    req.params = result.data;
    next();
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   MIDDLEWARE DE VALIDACIÓN DE QUERY
   Uso: router.get("/", validateQuery(schema), controller)
========================================================= */
export const validateQuery = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return badRequest(res, "Query inválida", errors);
    }

    req.query = result.data;
    next();
  } catch (err) {
    next(err);
  }
};