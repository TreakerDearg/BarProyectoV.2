import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../../../modules/products/services/productService";
import { getInventory } from "../../../modules/inventory/services/inventoryService";
import type { Recipe } from "../types/recipe";

interface Props {
  onSave: (recipe: Recipe) => void;
  onClose: () => void;
}

const EMPTY_INGREDIENT = {
  inventoryItem: "",
  quantity: 1,
  unit: "ml",
};

const EMPTY_STEP = {
  stepNumber: 1,
  instruction: "",
};

export default function RecipeForm({ onSave, onClose }: Props) {
  const [step, setStep] = useState(1);

  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  const [form, setForm] = useState<Recipe>({
    product: "",
    type: "drink",
    method: "",
    category: "general",
    image: "",
    ingredients: [],
    steps: [],
  });

  const [ingredientDraft, setIngredientDraft] = useState(EMPTY_INGREDIENT);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    getProducts().then(setProducts);
    getInventory().then(setInventory);
  }, []);

  /* =========================
     STEP CONTROL
  ========================= */
  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  /* =========================
     INGREDIENT LOGIC
  ========================= */
  const addIngredient = () => {
    if (!ingredientDraft.inventoryItem) return;

    const exists = form.ingredients.find(
      (i) => i.inventoryItem === ingredientDraft.inventoryItem
    );

    if (exists) return alert("Este ingrediente ya está agregado");

    setForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          ...ingredientDraft,
          quantity: Number(ingredientDraft.quantity),
        },
      ],
    }));

    setIngredientDraft(EMPTY_INGREDIENT);
  };

  const removeIngredient = (index: number) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  /* =========================
     STEP LOGIC (PRO)
  ========================= */
  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          stepNumber: prev.steps.length + 1,
          instruction: "",
        },
      ],
    }));
  };

  const updateStep = (index: number, value: string) => {
    setForm((prev) => {
      const steps = [...prev.steps];
      steps[index].instruction = value;
      return { ...prev, steps };
    });
  };

  const removeStep = (index: number) => {
    setForm((prev) => {
      const steps = prev.steps
        .filter((_, i) => i !== index)
        .map((s, i) => ({
          ...s,
          stepNumber: i + 1,
        }));

      return { ...prev, steps };
    });
  };

  const moveStep = (index: number, dir: "up" | "down") => {
    setForm((prev) => {
      const steps = [...prev.steps];
      const newIndex = dir === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= steps.length) return prev;

      [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];

      return {
        ...prev,
        steps: steps.map((s, i) => ({
          ...s,
          stepNumber: i + 1,
        })),
      };
    });
  };

  /* =========================
     VALIDATION (SMART)
  ========================= */
  const canNext = useMemo(() => {
    switch (step) {
      case 1:
        return !!form.product;
      case 2:
        return form.ingredients.length > 0;
      case 3:
        return true;
      case 4:
        return form.steps.length > 0;
      default:
        return true;
    }
  }, [step, form]);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = () => {
    if (!form.product) return alert("Selecciona producto");
    if (form.ingredients.length === 0)
      return alert("Agrega ingredientes");
    if (form.steps.length === 0)
      return alert("Agrega al menos un paso");

    onSave(form);
  };

  /* =========================
     RENDER STEP
  ========================= */
  const renderStep = () => {
    switch (step) {
      /* =======================
         STEP 1 - PRODUCT
      ======================= */
      case 1:
        return (
          <div className="space-y-3">
            <h3 className="font-bold">1. Producto</h3>

            <select
              value={form.product as string}
              onChange={(e) =>
                setForm({ ...form, product: e.target.value })
              }
              className="w-full p-2 bg-gray-800 rounded"
            >
              <option value="">Seleccionar producto</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as any })
              }
              className="w-full p-2 bg-gray-800 rounded"
            >
              <option value="drink">Drink</option>
              <option value="food">Food</option>
            </select>
          </div>
        );

      /* =======================
         STEP 2 - INGREDIENTS
      ======================= */
      case 2:
        return (
          <div className="space-y-3">
            <h3 className="font-bold">2. Ingredientes</h3>

            <div className="flex gap-2">
              <select
                value={ingredientDraft.inventoryItem}
                onChange={(e) =>
                  setIngredientDraft({
                    ...ingredientDraft,
                    inventoryItem: e.target.value,
                  })
                }
                className="flex-1 p-2 bg-gray-800 rounded"
              >
                <option value="">Ingrediente</option>
                {inventory.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={ingredientDraft.quantity}
                onChange={(e) =>
                  setIngredientDraft({
                    ...ingredientDraft,
                    quantity: Number(e.target.value),
                  })
                }
                className="w-20 p-2 bg-gray-800 rounded"
              />

              <button
                onClick={addIngredient}
                className="bg-amber-500 px-3 rounded"
              >
                +
              </button>
            </div>

            <div className="space-y-1 max-h-40 overflow-auto">
              {form.ingredients.map((i, idx) => (
                <div
                  key={idx}
                  className="flex justify-between bg-gray-800 p-2 rounded"
                >
                  <span>
                    {
                      inventory.find(
                        (x) => x._id === i.inventoryItem
                      )?.name
                    }
                  </span>

                  <span>
                    {i.quantity} {i.unit}
                  </span>

                  <button
                    onClick={() => removeIngredient(idx)}
                    className="text-red-400"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      /* =======================
         STEP 3 - METHOD
      ======================= */
      case 3:
        return (
          <div className="space-y-2">
            <h3 className="font-bold">3. Método</h3>

            <input
              value={form.method}
              onChange={(e) =>
                setForm({ ...form, method: e.target.value })
              }
              className="w-full p-2 bg-gray-800 rounded"
              placeholder="Shake, Stir, Blend..."
            />
          </div>
        );

      /* =======================
         STEP 4 - STEPS
      ======================= */
      case 4:
        return (
          <div className="space-y-3">
            <h3 className="font-bold">4. Pasos</h3>

            {form.steps.map((s, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  value={s.instruction}
                  onChange={(e) =>
                    updateStep(idx, e.target.value)
                  }
                  className="flex-1 p-2 bg-gray-800 rounded"
                />

                <button
                  onClick={() => moveStep(idx, "up")}
                  className="px-2 bg-gray-700 rounded"
                >
                  ↑
                </button>

                <button
                  onClick={() => moveStep(idx, "down")}
                  className="px-2 bg-gray-700 rounded"
                >
                  ↓
                </button>

                <button
                  onClick={() => removeStep(idx)}
                  className="text-red-400"
                >
                  x
                </button>
              </div>
            ))}

            <button
              onClick={addStep}
              className="text-amber-400 text-sm"
            >
              + Agregar paso
            </button>
          </div>
        );

      /* =======================
         STEP 5 - PREVIEW
      ======================= */
      case 5:
        return (
          <div className="space-y-2">
            <h3 className="font-bold">5. Preview</h3>

            <p className="text-sm text-gray-400">
              Ingredientes: {form.ingredients.length}
            </p>

            <p className="text-sm text-gray-400">
              Pasos: {form.steps.length}
            </p>

            <button
              onClick={handleSubmit}
              className="w-full bg-amber-500 text-black py-2 rounded"
            >
              Crear receta
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-gray-900 w-[600px] p-5 rounded-xl space-y-4">

        {/* HEADER */}
        <div className="flex justify-between">
          <h2 className="font-bold">Crear receta</h2>
          <button onClick={onClose}>X</button>
        </div>

        {/* STEP INDICATOR */}
        <div className="text-xs text-gray-400">
          Paso {step} / 5
        </div>

        {/* CONTENT */}
        {renderStep()}

        {/* NAVIGATION */}
        <div className="flex justify-between pt-3">
          <button
            onClick={back}
            disabled={step === 1}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-30"
          >
            Atrás
          </button>

          <button
            onClick={next}
            disabled={!canNext || step === 5}
            className="px-3 py-1 bg-amber-500 text-black rounded disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}