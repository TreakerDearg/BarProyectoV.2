import xss from "xss";

/* ==============================
   CLEANER
============================== */
const clean = (value) => {
  if (typeof value === "string") {
    return xss(value);
  }

  if (Array.isArray(value)) {
    return value.map(clean);
  }

  if (value && typeof value === "object") {
    const obj = {};
    for (const key in value) {
      obj[key] = clean(value[key]);
    }
    return obj;
  }

  return value;
};

/* ==============================
   SANITIZE MIDDLEWARE FIXED
============================== */
export const sanitize = (req, res, next) => {
  try {
    //  NO reasignar req.query (rompe Express)
    if (req.query) {
      for (const key in req.query) {
        req.query[key] = clean(req.query[key]);
      }
    }

    if (req.body) {
      req.body = clean(req.body);
    }

    if (req.params) {
      for (const key in req.params) {
        req.params[key] = clean(req.params[key]);
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};