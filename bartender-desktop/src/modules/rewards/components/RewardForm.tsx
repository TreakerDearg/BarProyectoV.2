import { useState, useEffect } from "react";
import { X, Coins, Package, Calendar, Image as ImageIcon, Check, Sparkles } from "lucide-react";
import type { Reward, RewardCategory, LinkedProduct } from "../types/reward";
import { getProducts } from "../../products/services/productService";
import type { Product } from "../../../types/product";

interface RewardFormProps {
  reward?:  Reward | null;
  onSave:   (data: Partial<Reward>) => void;
  onClose:  () => void;
}

const CATEGORIES: { value: RewardCategory; label: string }[] = [
  { value: "drink",      label: "Bebida / Cóctel" },
  { value: "food",       label: "Cocina / Plato"  },
  { value: "discount",   label: "Descuento en Cuenta" },
  { value: "experience", label: "Experiencia VIP" },
];

const DEFAULT_FORM: Partial<Reward> = {
  name:            "",
  description:     "",
  pointsCost:      100,
  category:        "drink",
  stock:           -1,
  active:          true,
  discountPercent: 0,
  image:           "",
  validFrom:       null,
  validUntil:      null,
  product:         null,
};

export default function RewardForm({ reward, onSave, onClose }: RewardFormProps) {
  const [form, setForm] = useState<Partial<Reward>>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isUnlimitedStock, setIsUnlimitedStock] = useState(true);

  useEffect(() => {
    // Cargar productos del POS para vincular
    getProducts()
      .then((data) => setAvailableProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error al cargar productos en RewardForm:", err));
  }, []);

  useEffect(() => {
    if (reward) {
      setForm({
        name:            reward.name            ?? "",
        description:     reward.description     ?? "",
        pointsCost:      reward.pointsCost      ?? 100,
        category:        reward.category        ?? "drink",
        stock:           reward.stock           ?? -1,
        active:          reward.active          ?? true,
        discountPercent: reward.discountPercent ?? 0,
        image:           reward.image           ?? "",
        validFrom:       reward.validFrom       ? reward.validFrom.split("T")[0] : "",
        validUntil:      reward.validUntil      ? reward.validUntil.split("T")[0] : "",
        product:         reward.product         ?? null,
      });
      setIsUnlimitedStock(reward.stock === -1);
    } else {
      setForm(DEFAULT_FORM);
      setIsUnlimitedStock(true);
    }
    setErrors({});
  }, [reward]);

  const set = <K extends keyof Reward>(key: K, value: Reward[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleProductSelect = (productId: string) => {
    if (!productId) {
      set("product", null);
      return;
    }
    const found = availableProducts.find((p) => p._id === productId);
    if (found) {
      set("product", found as unknown as LinkedProduct);
      // Sugerir nombre y categoría automáticamente si están vacíos
      if (!form.name || form.name === DEFAULT_FORM.name) {
        set("name", found.name);
      }
      if (found.type === "drink" || found.type === "food") {
        set("category", found.type);
      }
      if (found.image && !form.image) {
        set("image", found.image);
      }
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name?.trim()) next.name = "El nombre de la recompensa es requerido";
    if (!form.pointsCost || form.pointsCost < 1) next.pointsCost = "Debe ser al menos 1 punto";
    if (!isUnlimitedStock && (form.stock === undefined || form.stock < 0)) {
      next.stock = "El stock debe ser 0 o superior";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Partial<Reward> = {
      ...form,
      stock: isUnlimitedStock ? -1 : Number(form.stock),
      product: form.product ? ((form.product as LinkedProduct)._id as unknown as LinkedProduct) : null,
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#161B22] border border-[#30363D] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363D] bg-[#1C2333]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F0B429]/10 text-[#F0B429] border border-[#F0B429]/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#E6EDF3] tracking-tight">
                {reward ? "Editar Recompensa de Fidelidad" : "Nueva Recompensa para Clientes"}
              </h2>
              <p className="text-[11px] text-[#8B949E]">
                Configuración del premio visible y canjeable desde la app móvil
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#30363D]/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* Vinculación con Producto de Carta POS */}
          <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D]">
            <label className="block text-[11px] font-bold text-[#F0B429] uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Package size={14} />
              Vincular a Producto de la Carta (Opcional pero Recomendado)
            </label>
            <p className="text-[11px] text-[#8B949E] mb-2.5">
              Al seleccionar un ítem de la carta, el canje se añadirá directamente a las comandas con precio $0 y descontará insumos en barra/cocina.
            </p>
            <select
              value={form.product ? (typeof form.product === "object" ? form.product._id : form.product) : ""}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429] transition-colors"
            >
              <option value="">-- No vincular (Premio genérico o cupón de caja) --</option>
              {availableProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} {p.price ? `($${p.price})` : ""} - [{p.type === "drink" ? "Bebida" : "Cocina"}]
                </option>
              ))}
            </select>
          </div>

          {/* Nombre y Descripción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                Nombre de la Recompensa *
              </label>
              <input
                type="text"
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ej: Gin Tonic Clásico, Postre Brownie..."
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429] transition-colors"
              />
              {errors.name && <p className="text-[10px] text-[#F85149] mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                Categoría *
              </label>
              <select
                value={form.category ?? "drink"}
                onChange={(e) => set("category", e.target.value as RewardCategory)}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429] transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
              Descripción y Condiciones
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Detalla qué incluye el premio o términos especiales (ej. Válido en mesas asignadas)..."
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429] transition-colors resize-none"
            />
          </div>

          {/* Costo en Puntos y Descuento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Coins size={13} className="text-[#F0B429]" />
                Costo en Puntos *
              </label>
              <input
                type="number"
                min={1}
                value={form.pointsCost ?? 100}
                onChange={(e) => set("pointsCost", Number(e.target.value))}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#F0B429] focus:outline-none focus:border-[#F0B429] transition-colors"
              />
              {errors.pointsCost && <p className="text-[10px] text-[#F85149] mt-1">{errors.pointsCost}</p>}
            </div>

            {form.category === "discount" ? (
              <div>
                <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                  Porcentaje de Descuento (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.discountPercent ?? 10}
                  onChange={(e) => set("discountPercent", Number(e.target.value))}
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono text-[#3FB950] focus:outline-none focus:border-[#3FB950] transition-colors"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ImageIcon size={13} />
                  URL de Imagen (Cloudinary / CDN)
                </label>
                <input
                  type="text"
                  value={form.image ?? ""}
                  onChange={(e) => set("image", e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429] transition-colors"
                />
              </div>
            )}
          </div>

          {/* Control de Stock */}
          <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#E6EDF3]">Control de Cupos / Stock</p>
              <p className="text-[11px] text-[#8B949E]">
                {isUnlimitedStock
                  ? "Recompensa ilimitada (sujeta solo al stock de insumos del bar)"
                  : "Cupos limitados por promoción"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-[#E6EDF3] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnlimitedStock}
                  onChange={(e) => {
                    setIsUnlimitedStock(e.target.checked);
                    if (e.target.checked) set("stock", -1);
                    else set("stock", 10);
                  }}
                  className="rounded border-[#30363D] text-[#F0B429] focus:ring-0"
                />
                Ilimitado
              </label>

              {!isUnlimitedStock && (
                <div className="w-24">
                  <input
                    type="number"
                    min={0}
                    value={form.stock === -1 ? 10 : form.stock}
                    onChange={(e) => set("stock", Number(e.target.value))}
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-2.5 py-1 text-xs font-mono text-[#E6EDF3] text-center focus:outline-none focus:border-[#F0B429]"
                  />
                  {errors.stock && <p className="text-[9px] text-[#F85149]">{errors.stock}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Vigencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar size={12} />
                Disponible Desde (Opcional)
              </label>
              <input
                type="date"
                value={form.validFrom ?? ""}
                onChange={(e) => set("validFrom", e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar size={12} />
                Disponible Hasta (Opcional)
              </label>
              <input
                type="date"
                value={form.validUntil ?? ""}
                onChange={(e) => set("validUntil", e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429] transition-colors"
              />
            </div>
          </div>

          {/* Estado Activo */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D]">
            <div>
              <p className="text-xs font-bold text-[#E6EDF3]">Recompensa Activa</p>
              <p className="text-[11px] text-[#8B949E]">Visible para los clientes en el catálogo de su app móvil</p>
            </div>
            <button
              type="button"
              onClick={() => set("active", !form.active)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                form.active ? "bg-[#3FB950]" : "bg-[#30363D]"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  form.active ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#30363D]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2333] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-[#0D1117] bg-[#F0B429] hover:bg-[#F0B429]/90 transition-colors shadow-lg shadow-[#F0B429]/20"
            >
              {reward ? "Guardar Cambios" : "Crear Recompensa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
