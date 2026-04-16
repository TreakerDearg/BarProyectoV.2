"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FlaskConical,
  Martini,
  Image as ImageIcon,
  Beaker,
  Plus,
  Trash2,
  Save,
} from "lucide-react";

import {
  createRecipe,
  updateRecipe,
  Recipe,
} from "@/services/recipeService";

import { Product } from "@/services/productService";
import { InventoryItem } from "@/services/inventoryService";

import styles from "@/styles/recipes/RecipeModalV2.module.css";

/* =========================
   TYPES
========================= */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;

  products: Product[];
  inventory: InventoryItem[];

  editingRecipe: Recipe | null;
}

interface IngredientBuilder {
  ingredientId: string;
  quantity: number;
}

/* =========================
   MODAL V2
========================= */
export default function RecipeModal({
  isOpen,
  onClose,
  onSuccess,
  products,
  inventory,
  editingRecipe,
}: Props) {
  const [productId, setProductId] = useState("");
  const [method, setMethod] = useState("");
  const [image, setImage] = useState("");

  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");

  const [ingredients, setIngredients] = useState<
    IngredientBuilder[]
  >([]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p._id === productId);
  }, [productId, products]);

  /* =========================
     HYDRATION EDIT MODE
  ========================= */
  useEffect(() => {
    if (!editingRecipe) {
      setProductId("");
      setMethod("");
      setImage("");
      setIngredients([]);
      return;
    }

    const raw: any = editingRecipe;

    setProductId(
      typeof raw.productId === "object"
        ? raw.productId._id
        : raw.productId
    );

    setMethod(raw.method || "");
    setImage(raw.image || "");

    setIngredients(
      (raw.ingredients || []).map((i: any) => ({
        ingredientId:
          typeof i.ingredientId === "object"
            ? i.ingredientId._id
            : i.ingredientId,
        quantity: i.quantity,
      }))
    );
  }, [editingRecipe]);

  /* =========================
     INGREDIENT ACTIONS
  ========================= */
  const addIngredient = () => {
    if (!ingredientId || !quantity) return;

    setIngredients((prev) => [
      ...prev,
      {
        ingredientId,
        quantity: Number(quantity),
      },
    ]);

    setIngredientId("");
    setQuantity("");
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) =>
      prev.filter((i) => i.ingredientId !== id)
    );
  };

  /* =========================
     SAVE
  ========================= */
  const handleSave = async () => {
    if (!productId || ingredients.length === 0) return;

    const payload = {
      productId,
      ingredients,
      method,
      image,
    };

    if (editingRecipe) {
      await updateRecipe(editingRecipe._id, payload);
    } else {
      await createRecipe(payload);
    }

    onSuccess();
    onClose();
  };

  /* =========================
     ANIMATION
  ========================= */
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* HEADER */}
            <div className={styles.header}>
              <div className={styles.title}>
                <Martini size={18} />
                <h2>
                  {editingRecipe
                    ? "Editar Receta"
                    : "Nueva Receta"}
                </h2>
              </div>

              <button
                onClick={onClose}
                className={styles.closeBtn}
              >
                <X size={18} />
              </button>
            </div>

            {/* PRODUCT */}
            <div className={styles.section}>
              <label>Producto</label>

              <div className={styles.inputGroup}>
                <FlaskConical size={16} />
                <select
                  value={productId}
                  onChange={(e) =>
                    setProductId(e.target.value)
                  }
                >
                  <option value="">
                    Seleccionar cóctel
                  </option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* IMAGE */}
            <div className={styles.section}>
              <label>Imagen</label>

              <div className={styles.inputGroup}>
                <ImageIcon size={16} />
                <input
                  placeholder="URL imagen (opcional)"
                  value={image}
                  onChange={(e) =>
                    setImage(e.target.value)
                  }
                />
              </div>
            </div>

            {/* METHOD */}
            <div className={styles.section}>
              <label>Método de preparación</label>

              <textarea
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value)
                }
                placeholder="Ej: Shake con hielo, strain fino..."
              />
            </div>

            {/* INGREDIENT BUILDER */}
            <div className={styles.section}>
              <label>Ingredientes</label>

              <div className={styles.builder}>
                <select
                  value={ingredientId}
                  onChange={(e) =>
                    setIngredientId(e.target.value)
                  }
                >
                  <option value="">Ingrediente</option>
                  {inventory.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.name} ({i.unit})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Qty"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                />

                <button onClick={addIngredient}>
                  <Plus size={16} />
                </button>
              </div>

              {/* LIST */}
              <div className={styles.list}>
                {ingredients.map((ing) => {
                  const item = inventory.find(
                    (i) => i._id === ing.ingredientId
                  );

                  return (
                    <div
                      key={ing.ingredientId}
                      className={styles.item}
                    >
                      <span>
                        <Beaker size={14} />
                        {item?.name} — {ing.quantity}{" "}
                        {item?.unit}
                      </span>

                      <button
                        onClick={() =>
                          removeIngredient(
                            ing.ingredientId
                          )
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PREVIEW */}
            {selectedProduct && (
              <div className={styles.preview}>
                🍸 {selectedProduct.name}
              </div>
            )}

            {/* SAVE */}
            <button
              onClick={handleSave}
              className={styles.saveBtn}
            >
              <Save size={16} />
              {editingRecipe
                ? "Actualizar Receta"
                : "Crear Receta"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}