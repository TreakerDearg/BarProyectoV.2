import User from "../models/User.js";

//  Crear empleado (solo admin)
export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    const user = new User({
      name,
      email,
      password,
      role,
    });

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Error creando usuario", error });
  }
};

// Obtener empleados (no clientes)
export const getEmployees = async (req, res) => {
  const users = await User.find({
    role: { $ne: "client" },
  });

  res.json(users);
};

//  Desactivar empleado
export const deactivateUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    isActive: false,
  });

  res.json({ msg: "Usuario desactivado" });
};