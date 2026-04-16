export const validateProduct = (req, res, next) => {
  const { name, price } = req.body;

  if (!name || typeof price !== "number") {
    return res.status(400).json({
      error: "Datos inválidos",
    });
  }

  next();
};