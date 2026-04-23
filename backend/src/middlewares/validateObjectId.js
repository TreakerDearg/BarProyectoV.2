// middlewares/validateObjectId.js

import mongoose from "mongoose";

export const validateObjectId = (param) => (req, res, next) => {
  const value = req.params[param];

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({
      error: `ID inválido: ${param}`,
    });
  }

  next();
};