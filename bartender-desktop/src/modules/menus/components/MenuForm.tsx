"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  AlertTriangle,
  Star,
  Search,
  Layers,
  Box,
  Plus,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle,
  Sparkles,
  LayoutGrid,
  Zap,
  Target
} from "lucide-react";

import ImageUploader from "../../../components/shared/ImageUploader";

import { getProducts } from "../../products/services/productService";
import type { Product } from "../../../types/product";

type MenuType = "drink" | "food" | "mixed";

interface MenuProduct {
  product: string;
  position: number;
  featured?: boolean;
  available?: boolean;
}

interface Category {
  name: string;
  products: MenuProduct[];
}

interface Payload {
  name: string;
  description: string;
  active: boolean;
  type: MenuType;
  image?: string;
  imagePublicId?: string;
  categories: Category[];
}

const CATEGORY_OPTIONS = ["Barra Royale", "Gastronomía", "Especiales VIP", "Temporada Umbra", "Premium Selection"];
const TYPE_OPTIONS: { value: MenuType; label: string; icon: any }[] = [
  { value: "drink", label: "Drink List", icon: <Zap size={16} /> },
  { value: "food", label: "Menu Food", icon: <Box size={16} /> },
  { value: "mixed", label: "Mixed Exper.", icon: <LayoutGrid size={16} /> },
];

interface Props {
  menu?: any;
  onSave: (menu: Payload) => void;
  onClose: () => void;
}

export default function MenuForm({ menu, onSave, onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<Payload>({
    name: "",
    description: "",
    active: true,
    type: "mixed",
    image: "",
    categories: [{ name: CATEGORY_OPTIONS[0], products: [] }],
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (menu) {
      setForm({
        name: menu.name,
        description: menu.description,
        active: menu.active,
        type: menu.type || "mixed",
        image: menu.image || "",
        categories: menu.categories?.length
          ? menu.categories
          : [{ name: CATEGORY_OPTIONS[0], products: [] }],
      });
    }
    loadProducts();
  }, [menu]);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data || []);
  };

  const currentCategory = form.categories[0];

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const toggleProduct = (id: string) => {
    const exists = currentCategory.products.find(p => p.product === id);
    let updated;
    if (exists) {
      updated = currentCategory.products.filter(p => p.product !== id);
    } else {
      updated = [
        ...currentCategory.products,
        {
          product: id,
          position: currentCategory.products.length,
          featured: false,
          available: true,
        },
      ];
    }
    updateProducts(updated);
  };

  const toggleFeatured = (id: string) => {
    updateProducts(
      currentCategory.products.map(p =>
        p.product === id ? { ...p, featured: !p.featured } : p
      )
    );
  };

  const moveProduct = (index: number, dir: "up" | "down") => {
    const arr = [...currentCategory.products];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    updateProducts(arr.map((p, i) => ({ ...p, position: i })));
  };

  const updateProducts = (products: MenuProduct[]) => {
    setForm(prev => ({
      ...prev,
      categories: [{ ...prev.categories[0], products }],
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setForm(prev => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const validate = () => {
    const err: string[] = [];
    if (!form.name.trim()) err.push("Se requiere un nombre estratégico");
    if (form.categories[0].products.length === 0) err.push("Debe vincular al menos un producto");
    setErrors(err);
    return err.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      
      <div className="w-full max-w-6xl bg-surface-2 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 bg-surface-3 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold/20 rounded-xl">
              <Layers className="text-gold" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {menu ? "Editar Menú" : "Nuevo Menú"}
              </h2>
              <p className="text-sm text-muted">
                Gestión de menús
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} className="text-muted" />
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Menú</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Signature Cocktails 2026"
                  className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción del menú..."
                  className="w-full px-4 py-3 bg-surface-3 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                <div className="flex gap-4">
                  <button onClick={() => setForm({ ...form, type: 'drink' })} className={`flex-1 py-3 px-4 rounded-lg border ${form.type === 'drink' ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-surface-3 border-white/10 text-gray-400'}`}>
                    Bebidas
                  </button>
                  <button onClick={() => setForm({ ...form, type: 'food' })} className={`flex-1 py-3 px-4 rounded-lg border ${form.type === 'food' ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-surface-3 border-white/10 text-gray-400'}`}>
                    Comida
                  </button>
                  <button onClick={() => setForm({ ...form, type: 'mixed' })} className={`flex-1 py-3 px-4 rounded-lg border ${form.type === 'mixed' ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-surface-3 border-white/10 text-gray-400'}`}>
                    Mixto
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Imagen</label>
              <ImageUploader
                onImageUpload={handleImageUpload}
                currentImage={form.image}
                folder="menus"
                mode="advanced"
                label="Subir imagen"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Productos</label>
            <div className="space-y-2">
              {form.categories[0]?.products.map((p, idx) => (
                <div key={idx} className="bg-surface-3 p-4 rounded-lg border border-white/10 flex justify-between items-center">
                  <span className="text-gray-300">{p.product}</span>
                  <button onClick={() => toggleProduct(p.product)} className="text-red-400 hover:text-red-300">
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => {}} className="mt-4 py-2 px-4 bg-surface-3 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors">
              + Agregar producto
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-surface-3 border-t border-white/10 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-3 rounded-lg bg-gold text-black font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : menu ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}