import xss from "xss";

/* ==============================
   SAFE CLEANER (POS READY)
============================== */
const clean = (value) => {
  if (typeof value === "string") {
    return xss(value.trim());
  }

  if (Array.isArray(value)) {
    return value.map(clean);
  }

  if (value && typeof value === "object") {
    const obj = {};

    for (const key of Object.keys(value)) {
      obj[key] = clean(value[key]);
    }

    return obj;
  }

  return value;
};

/* ==============================
   SANITIZE MIDDLEWARE (FIXED)
============================== */
export const sanitize = (req, res, next) => {
  try {
    if (req.body) {
      req.body = clean(req.body);
    }

    // IMPORTANTE: NO MUTAR req.query DIRECTAMENTE
    if (req.query) {
      const cleanedQuery = {};

      for (const key of Object.keys(req.query)) {
        cleanedQuery[key] = clean(req.query[key]);
      }

      req.query = cleanedQuery;
    }

    if (req.params) {
      const cleanedParams = {};

      for (const key of Object.keys(req.params)) {
        cleanedParams[key] = clean(req.params[key]);
      }

      req.params = cleanedParams;
    }

    next();
  } catch (err) {
    next(err);
  }
};