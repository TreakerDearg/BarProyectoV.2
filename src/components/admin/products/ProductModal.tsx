"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2, Martini } from "lucide-react";
import styles from "@/styles/products/ProductModal.module.css";
import {
  createProduct,
  updateProduct,
} from "@/services/productService";
import { getInventory } from "@/services/inventoryService";

interface Ingredient {
  _id: string;
  name: string;
  unit: string;
  stock: number;
}

interface RecipeItem {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingProduct?: any;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
}: ProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Clásico");
  const [price, setPrice] = useState(0);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);

  /* ================================
     CARGAR INVENTARIO
  ================================= */
  useEffect(() => {
    const loadIngredients = async () => {
      const data = await getInventory();
      setIngredients(data);
    };

    if (isOpen) loadIngredients();
  }, [isOpen]);

  /* ================================
     CARGAR PRODUCTO EN EDICIÓN
  ================================= */
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || "");
      setCategory(editingProduct.category || "Clásico");
      setPrice(editingProduct.price || 0);
      setRecipe(editingProduct.recipe || []);
    } else {
      resetForm();
    }
  }, [editingProduct, isOpen]);

  /* ================================
     REINICIAR FORMULARIO
  ================================= */
  const resetForm = () => {
    setName("");
    setCategory("Clásico");
    setPrice(0);
    setRecipe([]);
  };

  /* ================================
     AGREGAR INGREDIENTE
  ================================= */
  const addIngredient = () => {
    setRecipe([
      ...recipe,
      {
        ingredientId: "",
        name: "",
        quantity: 0,
        unit: "",
      },
    ]);
  };

  const updateIngredient = (
    index: number,
    field: string,
    value: any
  ) => {
    const updated = [...recipe];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "ingredientId") {
      const selected = ingredients.find(
        (ing) => ing._id === value
      );
      if (selected) {
        updated[index].name = selected.name;
        updated[index].unit = selected.unit;
      }
    }

    setRecipe(updated);
  };

  const removeIngredient = (index: number) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };

  /* ================================
     COSTO AUTOMÁTICO (SIMULADO)
  ================================= */
  const totalCost = useMemo(() => {
    return recipe.reduce(
      (total, item) => total + item.quantity * 0.05,
      0
    );
  }, [recipe]);

  /* ================================
     GUARDAR PRODUCTO
  ================================= */
  const handleSave = async () => {
    if (!name.trim()) return;

    const payload = {
      name,
      category,
      price,
      recipe,
      cost: totalCost,
    };

    if (editingProduct) {
      await updateProduct(editingProduct._id, payload);
    } else {
      await createProduct(payload);
    }

    resetForm();
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>
            <Martini size={20} />
            {editingProduct
              ? "EDITAR CÓCTEL"
              : "COCKTAIL BUILDER"}
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* FORMULARIO */}
        <div className={styles.form}>
          <input
            type="text"
            placeholder="Nombre del cóctel"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="number"
            placeholder="Precio de venta"
            value={price}
            onChange={(e) =>
              setPrice(Number(e.target.value))
            }
          />
        </div>

        {/* RECETA */}
        <div className={styles.recipe}>
          <h3>Ingredientes</h3>

          {recipe.map((item, index) => (
            <div key={index} className={styles.recipeRow}>
              <select
                value={item.ingredientId}
                onChange={(e) =>
                  updateIngredient(
                    index,
                    "ingredientId",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Seleccionar ingrediente
                </option>
                {ingredients.map((ing) => (
                  <option key={ing._id} value={ing._id}>
                    {ing.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Cantidad"
                value={item.quantity}
                onChange={(e) =>
                  updateIngredient(
                    index,
                    "quantity",
                    Number(e.target.value)
                  )
                }
              />

              <span className={styles.unit}>
                {item.unit}
              </span>

              <button
                onClick={() => removeIngredient(index)}
                className={styles.deleteBtn}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            onClick={addIngredient}
            className={styles.addBtn}
          >
            <Plus size={16} /> Añadir Ingrediente
          </button>
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <div className={styles.cost}>
            Costo estimado: ${totalCost.toFixed(2)}
          </div>

          <button
            onClick={handleSave}
            className={styles.saveBtn}
          >
            Guardar Cóctel
          </button>
        </div>
      </div>
    </div>
  );
}