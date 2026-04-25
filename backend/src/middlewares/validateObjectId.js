import mongoose from "mongoose";

export const validateObjectId = (param) => {
  return (req, res, next) => {
    const id = req.params[param];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: `Invalid ${param}`,
      });
    }

    next(); // ✅ ahora sí existe
  };
};