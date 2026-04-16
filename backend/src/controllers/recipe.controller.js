import Recipe from "../models/Recipe.js";

/* ================================
   GET ALL RECIPES
================================ */
export const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate("productId")
      .populate("ingredients.ingredientId");

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   GET ONE RECIPE
================================ */
export const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("productId")
      .populate("ingredients.ingredientId");

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   CREATE RECIPE (ENHANCED)
================================ */
export const createRecipe = async (req, res) => {
  try {
    const { productId, ingredients, method, image } =
      req.body;

    if (!productId || !Array.isArray(ingredients) || !ingredients.length) {
      return res.status(400).json({
        error: "Product and ingredients are required",
      });
    }

    const recipe = new Recipe({
      productId,
      ingredients,
      method: method || "",
      image: image || "",
    });

    const saved = await recipe.save();

    const populated = await saved.populate([
      "productId",
      "ingredients.ingredientId",
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   UPDATE RECIPE (SAFE)
================================ */
export const updateRecipe = async (req, res) => {
  try {
    const allowedFields = [
      "productId",
      "ingredients",
      "method",
      "image",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updated = await Recipe.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    )
      .populate("productId")
      .populate("ingredients.ingredientId");

    if (!updated) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   DELETE RECIPE
================================ */
export const deleteRecipe = async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
    PROTOCOL VIEW (CLAVE DEL SISTEMA)
================================ */
export const getRecipeProtocol = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("productId")
      .populate("ingredients.ingredientId");

    if (!recipe) {
      return res.status(404).json({ error: "Not found" });
    }

    const protocol = {
      product: recipe.productId,
      ingredients: recipe.ingredients.map((i) => ({
        name: i.ingredientId?.name,
        unit: i.ingredientId?.unit,
        quantity: i.quantity,
      })),
      method:
        recipe.method ||
        "Standard bartender preparation",
      steps: [
        "Prepare all ingredients",
        "Measure accurately",
        "Mix according to method",
        "Serve appropriately",
      ],
    };

    res.json(protocol);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
    RECIPES BY PRODUCT
================================ */
export const getRecipesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const recipes = await Recipe.find({ productId })
      .populate("productId")
      .populate("ingredients.ingredientId");

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};