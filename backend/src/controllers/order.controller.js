import mongoose from "mongoose";
import Order from "../models/Order.js";
import Recipe from "../models/Recipe.js";
import Ingredient from "../models/Ingredient.js";

// GET ALL
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  GET ONE ( CLAVE)
export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const order = await Order.findById(req.params.id)
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  CREATE ORDER (OPTIMIZADO)
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { items, total } = req.body;

    if (!items?.length) {
      throw new Error("Pedido vacío");
    }

    //  1. RECETAS EN BLOQUE
    const productIds = items.map(i => i.productId);

    const recipes = await Recipe.find({
      productId: { $in: productIds },
    }).session(session);

    const recipeMap = {};
    recipes.forEach(r => {
      recipeMap[r.productId.toString()] = r;
    });

    //  2. TRAER TODOS LOS INGREDIENTES DE UNA
    const ingredientIds = recipes.flatMap(r =>
      r.ingredients.map(i => i.ingredientId)
    );

    const ingredients = await Ingredient.find({
      _id: { $in: ingredientIds },
    }).session(session);

    const ingredientMap = {};
    ingredients.forEach(i => {
      ingredientMap[i._id.toString()] = i;
    });

    //  3. VALIDAR STOCK
    for (const item of items) {
      const recipe = recipeMap[item.productId];

      if (!recipe) {
        throw new Error("Producto sin receta");
      }

      for (const ing of recipe.ingredients) {
        const ingredient = ingredientMap[ing.ingredientId];

        if (!ingredient) continue;

        const required = ing.quantity * item.quantity;

        if (ingredient.stock < required) {
          throw new Error(`Stock insuficiente: ${ingredient.name}`);
        }
      }
    }

    //  4. DESCONTAR STOCK (EN MEMORIA)
    for (const item of items) {
      const recipe = recipeMap[item.productId];

      for (const ing of recipe.ingredients) {
        const ingredient = ingredientMap[ing.ingredientId];

        if (!ingredient) continue;

        const required = ing.quantity * item.quantity;

        ingredient.stock -= required;
      }
    }

    //  5. GUARDAR TODOS LOS INGREDIENTES
    for (const ing of Object.values(ingredientMap)) {
      await ing.save({ session });
    }

    //  6. CREAR ORDEN
    const [order] = await Order.create(
      [
        {
          items,
          total,
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();

    res.status(400).json({
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// UPDATE STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = [
      "pending",
      "preparing",
      "ready",
      "delivered",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        error: "Estado inválido",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("items.productId");

    if (!order) {
      return res.status(404).json({
        error: "Orden no encontrada",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};