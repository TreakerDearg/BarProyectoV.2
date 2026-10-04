import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Reward, RewardCategory } from "../types/reward";

interface RewardFormProps {
  reward?:  Reward | null;
  onSave:   (data: Partial<Reward>) => void;
  onClose:  () => void;
}

const CATEGORIES: { value: RewardCategory; label: string }[] = [
  { value: "drink",      label: "Bebida"       },
  { value: "food",       label: "Comida"       },
  { value: "experience", label: "Experiencia"  },
  { value: "discount",   label: "Descuento"    },
];

const DEFAULT_FORM: Partial<Reward> = {
  name:        "",
  description: "",
  pointsCost:  100,
  category:    "drink",
  stock:       -1,
  active:      true,
};

export default function RewardForm({ reward, onSave, onClose }: RewardFormProps) {
  const [form, setForm] = useState<Partial<Reward>>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (reward) {
      setForm({
        name:        reward.name        ?? "",
        description: reward.description ?? "",
        pointsCost:  reward.pointsCost  ?? 100,
        category:    reward.category    ?? "drink",
        stock:       reward.stock       ?? -1,
        active:      reward.active      ?? true,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
  }, [reward]);

  const set = <K extends keyof Reward>(key: K, value: Reward[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name?.trim())       next.name       = "El nombre es requerido";
    if (!form.pointsCost || form.pointsCost < 1) next.pointsCost = "Debe ser mayor a 0";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-zinc-900 to-zinc-950 border border-gold/20 rounded-[2.5rem] shadow-2xl animate-fade-in overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/6 bg-gold/5">
          <h2 className="text-base font-black text-ivory uppercase tracking-tighter">
            {reward ? "Editar Recompensa" : "Nueva Recompensa"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-ivory transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej: Cóctel gratis"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-ivory placeholder-muted/40 focus:outline-none focus:border-gold/40 transition-colors"
            />
            {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5">
              Descripción
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Descripción opcional..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-ivory placeholder-muted/40 focus:outline-none focus:border-gold/40 transition-colors resize-none"
            />
          </div>

          {/* Points cost + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5">
                Costo en puntos *
              </label>
              <input
                type="number"
                min={1}
                value={form.pointsCost ?? ""}
                onChange={(e) => set("pointsCost", Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-gold/40 transition-colors"
              />
              {errors.pointsCost && <p className="text-[10px] text-red-400 mt-1">{errors.pointsCost}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5">
                Categoría
              </label>
              <select
                value={form.category ?? "drink"}
                onChange={(e) => set("category", e.target.value as RewardCategory)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-gold/40 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5">
              Stock <span className="text-muted/50 normal-case font-normal">(-1 = ilimitado)</span>
            </label>
            <input
              type="number"
              min={-1}
              value={form.stock ?? -1}
              onChange={(e) => set("stock", Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/6">
            <div>
              <p className="text-xs font-bold text-ivory">Activo</p>
              <p className="text-[10px] text-muted">La recompensa es visible y canjeable</p>
            </div>
            <button
              type="button"
              onClick={() => set("active", !form.active)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                form.active ? "bg-gold" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  form.active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-ivory text-xs font-bold uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gold/15 hover:bg-gold/25 text-gold border border-gold/20 text-xs font-black uppercase tracking-widest transition-all"
            >
              {reward ? "Guardar cambios" : "Crear recompensa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
