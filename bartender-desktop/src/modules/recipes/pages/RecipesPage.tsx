import { useEffect, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import RecipeForm from "../components/RecipeForm";
import {
  getRecipes,
  createRecipe,
  deleteRecipe,
} from "../service/recipeService";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    const data = await getRecipes();
    setRecipes(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <button onClick={() => setOpen(true)} className="btn-primary mb-4">
        Nueva Receta
      </button>

      <div className="grid grid-cols-3 gap-4">
        {recipes.map((r: any) => (
          <RecipeCard key={r._id} recipe={r} onDelete={deleteRecipe} />
        ))}
      </div>

      {open && (
        <RecipeForm
          onSave={async (data: any) => {
            await createRecipe(data);
            setOpen(false);
            fetchData();
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}