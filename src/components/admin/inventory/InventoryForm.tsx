"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/inventory/InventoryForm.module.css";
import {
  Beaker,
  PackagePlus,
  Layers,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  createItem,
  updateItem,
  InventoryItem,
} from "@/services/inventoryService";

interface InventoryFormProps {
  onCreated: () => void;
  editingItem?: InventoryItem | null;
  onCancelEdit?: () => void;
}

interface FormState {
  name: string;
  stock: number | "";
  unit: string;
  category: string;
}

interface FormErrors {
  name?: string;
  stock?: string;
}

const defaultForm: FormState = {
  name: "",
  stock: "",
  unit: "ml",
  category: "Alcohol Base",
};

export default function InventoryForm({
  onCreated,
  editingItem,
  onCancelEdit,
}: InventoryFormProps) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  /* ===============================
     CARGAR DATOS EN MODO EDICIÓN
  =============================== */
  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name,
        stock: editingItem.stock,
        unit: editingItem.unit,
        category: editingItem.category,
      });
    } else {
      setForm(defaultForm);
    }
  }, [editingItem]);

  /* ===============================
     DETECTAR UNIDAD SEGÚN CATEGORÍA
  =============================== */
  useEffect(() => {
    const unitByCategory: Record<string, string> = {
      "Alcohol Base": "ml",
      Mixers: "ml",
      Frutas: "unit",
      Endulzantes: "ml",
      Garnish: "unit",
      Otros: "unit",
    };

    setForm((prev) => ({
      ...prev,
      unit: unitByCategory[prev.category] || prev.unit,
    }));
  }, [form.category]);

  /* ===============================
     VALIDACIÓN
  =============================== */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }

    if (form.stock === "" || Number(form.stock) <= 0) {
      newErrors.stock = "El stock debe ser mayor que cero.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===============================
     MANEJO DE CAMBIOS
  =============================== */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "stock" ? Number(value) || "" : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /* ===============================
     NORMALIZAR TEXTO
  =============================== */
  const normalizeText = (text: string) =>
    text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  /* ===============================
     ENVÍO DEL FORMULARIO
  =============================== */
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: normalizeText(form.name),
        stock: Number(form.stock),
        unit: form.unit,
        category: form.category,
      };

      if (editingItem) {
        await updateItem(editingItem._id, payload);
      } else {
        await createItem(payload);
      }

      setForm(defaultForm);
      setErrors({});
      onCreated();
      onCancelEdit?.();
    } catch (error) {
      console.error("Error al guardar el ingrediente:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className={styles.card}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2>
          <Beaker size={18} />
          {editingItem
            ? "EDITAR INGREDIENTE"
            : "NUEVO INGREDIENTE"}
        </h2>
        <span className={styles.badge}>DATA_BLOCK_01</span>
      </div>

      {/* FORM */}
      <div className={styles.formGrid}>
        {/* NOMBRE */}
        <div className={styles.inputGroup}>
          <label>
            <PackagePlus size={14} /> Ingrediente
          </label>
          <input
            type="text"
            name="name"
            placeholder="Ej: Tequila Blanco"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? styles.inputError : ""}
          />
          {errors.name && (
            <span className={styles.errorText}>
              <AlertTriangle size={14} />
              {errors.name}
            </span>
          )}
        </div>

        {/* STOCK */}
        <div className={styles.inputGroup}>
          <label>
            <Layers size={14} /> Stock
          </label>
          <input
            type="number"
            name="stock"
            placeholder="Cantidad disponible"
            value={form.stock}
            onChange={handleChange}
            min="0"
            className={errors.stock ? styles.inputError : ""}
          />
          {errors.stock && (
            <span className={styles.errorText}>
              <AlertTriangle size={14} />
              {errors.stock}
            </span>
          )}
        </div>

        {/* UNIDAD */}
        <div className={styles.inputGroup}>
          <label>Unidad</label>
          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
          >
            <option value="ml">Mililitros (ml)</option>
            <option value="g">Gramos (g)</option>
            <option value="unit">Unidades</option>
            <option value="oz">Onzas (oz)</option>
          </select>
        </div>

        {/* CATEGORÍA */}
        <div className={styles.inputGroup}>
          <label>Categoría</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option>Alcohol Base</option>
            <option>Mixers</option>
            <option>Frutas</option>
            <option>Endulzantes</option>
            <option>Garnish</option>
            <option>Otros</option>
          </select>
        </div>
      </div>

      {/* BOTONES */}
      <div className={styles.actions}>
        {editingItem && (
          <button
            className={styles.cancelBtn}
            onClick={onCancelEdit}
            type="button"
          >
            <X size={16} />
            Cancelar
          </button>
        )}

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading}
          type="button"
        >
          <Save size={16} />
          {loading
            ? "Guardando..."
            : editingItem
            ? "Actualizar"
            : "Crear"}
        </button>
      </div>
    </div>
  );
}