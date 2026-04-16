import { useEffect, useState } from "react";
import { getProducts } from "../../../modules/products/services/productService";
import { getInventory } from "../../../modules/inventory/services/inventoryService";

export default function RecipeForm({ onSave, onClose }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [ingredients, setIngredients] = useState<any[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
    getInventory().then(setInventory);
  }, []);

  const addIngredient = (id: string) => {
    setIngredients([...ingredients, { inventoryItem: id, quantity: 1 }]);
  };

  return (
    <div className="modal">
      <div className="bg-gray-900 p-6 rounded-xl w-[500px]">
        <select onChange={(e) => setSelectedProduct(e.target.value)}>
          <option>Seleccionar producto</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="mt-4">
          {inventory.map((i) => (
            <button
              key={i._id}
              onClick={() => addIngredient(i._id)}
              className="block w-full text-left"
            >
              {i.name}
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            onSave({ product: selectedProduct, ingredients })
          }
          className="btn-primary mt-4"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}