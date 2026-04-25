/* =========================================================
   RESPONSE HELPERS — Bartender System
   Respuesta estándar para TODOS los controllers:
   { success, data, message, meta? }
========================================================= */

/**
 * 200 OK
 */
export const ok = (res, data = null, message = "OK", meta = null) => {
  const payload = { success: true };
  if (data !== null) payload.data = data;
  if (message !== "OK") payload.message = message;
  if (meta) payload.meta = meta;
  return res.status(200).json(payload);
};

/**
 * 201 Created
 */
export const created = (res, data = null, message = "Recurso creado") => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};

/**
 * 400 Bad Request
 */
export const badRequest = (res, message = "Solicitud inválida", errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(400).json(payload);
};

/**
 * 401 Unauthorized
 */
export const unauthorized = (res, message = "No autenticado") => {
  return res.status(401).json({ success: false, message });
};

/**
 * 403 Forbidden
 */
export const forbidden = (res, message = "Acceso denegado") => {
  return res.status(403).json({ success: false, message });
};

/**
 * 404 Not Found
 */
export const notFound = (res, message = "Recurso no encontrado") => {
  return res.status(404).json({ success: false, message });
};

/**
 * 409 Conflict
 */
export const conflict = (res, message = "Conflicto de datos") => {
  return res.status(409).json({ success: false, message });
};

/**
 * 422 Unprocessable Entity
 */
export const unprocessable = (res, message = "Entidad no procesable", errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(422).json(payload);
};

/**
 * 500 Internal Server Error
 */
export const serverError = (res, message = "Error interno del servidor") => {
  return res.status(500).json({ success: false, message });
};
