import mongoose from "mongoose";
import Order from "../models/Order.js";
import Recipe from "../models/Recipe.js";
import InventoryItem from "../models/InventoryItem.js";
import Product from "../models/Product.js";

/* ==============================
   GET ORDERS (FILTRADO PRO)
============================== */
export const getOrders = async (req, res) => {
  try {
    const { status, type, table } = req.query;

    const validStatus = ["pending", "in-progress", "completed", "cancelled"];
    const validType = ["drink", "food"];

    const filter = {};

    if (status) {
      if (!validStatus.includes(status)) {
        return res.status(400).json({ error: "Estado inválido" });
      }
      filter.status = status;
    }

    if (table) {
      filter.table = table;
    }

    if (type) {
      if (!validType.includes(type)) {
        return res.status(400).json({ error: "Tipo inválido" });
      }

      filter.items = {
        $elemMatch: { type },
      };
    }

    let orders = await Order.find(filter)
      .populate("items.product")
      .sort({ createdAt: -1 });

    //  filtrar items por tipo (vista cocina/bar)
    if (type) {
      orders = orders.map(order => {
        const obj = order.toObject();
        obj.items = obj.items.filter(i => i.type === type);
        return obj;
      });
    }

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   GET ONE
============================== */
export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const order = await Order.findById(req.params.id)
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   CREATE ORDER (CORE)
============================== */
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { items, table, notes } = req.body;

    if (!items?.length) {
      throw new Error("Pedido vacío");
    }

    //  productos
    const productIds = items.map(i => i.product);

    const products = await Product.find({
      _id: { $in: productIds },
    }).session(session);

    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = p;
    });

    // recetas
    const recipes = await Recipe.find({
      product: { $in: productIds },
    }).session(session);

    const recipeMap = {};
    recipes.forEach(r => {
      recipeMap[r.product.toString()] = r;
    });

    //  inventario
    const ingredientIds = recipes.flatMap(r =>
      r.ingredients.map(i => i.inventoryItem)
    );

    const inventoryItems = await InventoryItem.find({
      _id: { $in: ingredientIds },
    }).session(session);

    const inventoryMap = {};
    inventoryItems.forEach(i => {
      inventoryMap[i._id.toString()] = i;
    });

    //  validar stock
    for (const item of items) {
      const recipe = recipeMap[item.product];

      if (!recipe) {
        throw new Error("Producto sin receta");
      }

      for (const ing of recipe.ingredients) {
        const inv = inventoryMap[ing.inventoryItem];

        if (!inv) continue;

        const required = ing.quantity * item.quantity;

        if (inv.stock < required) {
          throw new Error(`Stock insuficiente: ${inv.name}`);
        }
      }
    }

    //  descontar stock
    for (const item of items) {
      const recipe = recipeMap[item.product];

      for (const ing of recipe.ingredients) {
        const inv = inventoryMap[ing.inventoryItem];

        if (!inv) continue;

        const required = ing.quantity * item.quantity;

        inv.stock -= required;
      }
    }

    for (const inv of Object.values(inventoryMap)) {
      await inv.save({ session });
    }

    //  armar orden
    let total = 0;

    const orderItems = items.map(item => {
      const product = productMap[item.product];

      if (!product) throw new Error("Producto inválido");

      const price = product.price || 0;
      const subtotal = price * item.quantity;

      total += subtotal;

      return {
        product: product._id,
        quantity: item.quantity,
        price,
        type: product.type,
        status: "pending",
      };
    });

    const [order] = await Order.create(
      [
        {
          items: orderItems,
          total,
          table,
          notes,
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json(order);

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

/* ==============================
   UPDATE ORDER STATUS
============================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const validStatus = ["pending", "in-progress", "completed", "cancelled"];
    const { status } = req.body;

    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("items.product");

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==============================
   UPDATE ITEM STATUS (CLAVE)
============================== */
export const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const validStatus = ["pending", "preparing", "ready", "delivered"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item no encontrado" });
    }

    item.status = status;

    // auto estado global
    const allDelivered = order.items.every(i => i.status === "delivered");

    order.status = allDelivered ? "completed" : "in-progress";

    await order.save();

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};