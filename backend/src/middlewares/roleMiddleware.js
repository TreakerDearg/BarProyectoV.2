export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      /* ==============================
         VALIDAR USUARIO
      ============================== */
      if (!req.user) {
        return res.status(401).json({
          message: "No autenticado",
        });
      }

      /* ==============================
         VALIDAR ESTADO
      ============================== */
      if (!req.user.isActive) {
        return res.status(403).json({
          message: "Usuario desactivado",
        });
      }

      /* ==============================
         SI NO SE DEFINEN ROLES → SOLO CHECK AUTH
      ============================== */
      if (allowedRoles.length === 0) {
        return next();
      }

      /* ==============================
         VALIDAR ROLES
      ============================== */
      const hasRole = allowedRoles.includes(req.user.role);

      if (!hasRole) {
        return res.status(403).json({
          message: "Acceso denegado",
          requiredRoles: allowedRoles,
          userRole: req.user.role,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error en autorización",
        error: error.message,
      });
    }
  };
};