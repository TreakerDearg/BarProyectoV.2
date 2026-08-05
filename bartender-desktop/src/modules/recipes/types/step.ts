import type { Technique } from './technique';

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  technique?: Technique | string;
  time?: number;
  temperature?: string;
  utensils?: string[];
  notes?: string;
}
