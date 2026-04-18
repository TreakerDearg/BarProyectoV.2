export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      /* ==============================
         VALIDAR USUARIO
      ============================== */
      if (!req.user) {
        const error = new Error("No autenticado");
        error.statusCode = 401;
        throw error;
      }

      /* ==============================
         VALIDAR ROL
      ============================== */
      if (!allowedRoles.includes(req.user.role)) {
        const error = new Error(
          `Acceso denegado. Rol requerido: ${allowedRoles.join(", ")}`
        );
        error.statusCode = 403;
        throw error;
      }

      next();

    } catch (error) {
      next(error);
    }
  };
};a