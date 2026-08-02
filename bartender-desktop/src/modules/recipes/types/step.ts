export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  duration?: number;
  temperature?: number | null;
  technique?: string;
  utensils?: string[];
  notes?: string;
}
