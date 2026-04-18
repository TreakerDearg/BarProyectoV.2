export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      /* ==============================
         VALIDAR AUTENTICACIÓN
      ============================== */
      if (!req.user) {
        const error = new Error("No autenticado");
        error.statusCode = 401;
        throw error;
      }

      /* ==============================
         VALIDAR ESTADO DEL USUARIO
      ============================== */
      if (req.user.isActive === false) {
        const error = new Error("Usuario desactivado");
        error.statusCode = 403;
        throw error;
      }

      /* ==============================
         VALIDAR ROLES
      ============================== */
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(req.user.role)
      ) {
        const error = new Error(
          `Acceso denegado. Roles permitidos: ${allowedRoles.join(", ")}`
        );
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};