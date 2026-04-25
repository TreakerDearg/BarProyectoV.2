export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ message: "Usuario desactivado" });
      }

      /* si no mandás roles → solo auth */
      if (allowedRoles.length === 0) return next();

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Rol no autorizado",
          required: allowedRoles,
          current: req.user.role,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        message: "Error roles",
        error: err.message,
      });
    }
  };
};