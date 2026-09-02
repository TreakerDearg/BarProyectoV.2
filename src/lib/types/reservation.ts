/**
 * Tipos compartidos del sistema de reservas.
 */

import type { ReactNode } from "react";

export type DietaryRestriction =
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "dairy-free"
  | "nut-free"
  | "sugar-free"
  | "shellfish-free"
  | "kosher"
  | "halal"
  | "low-sodium"
  | "other";

export interface GuestDietaryEntry {
  guestName: string;
  restrictions: DietaryRestriction[];
  notes?: string;
}

export interface DietaryOption {
  value: DietaryRestriction;
  label: string;
  /** Nombre del ícono Lucide para renderizar — ver getDietaryIcon() */
  iconName: string;
  color: string;
}

export const DIETARY_OPTIONS: DietaryOption[] = [
  { value: "vegan",          label: "Vegano",           iconName: "Leaf",          color: "bg-green-500/15 border-green-500/30 text-green-300"   },
  { value: "vegetarian",     label: "Vegetariano",      iconName: "Salad",         color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" },
  { value: "gluten-free",    label: "Sin Gluten",       iconName: "WheatOff",      color: "bg-amber-500/15 border-amber-500/30 text-amber-300"   },
  { value: "dairy-free",     label: "Sin Lácteos",      iconName: "MilkOff",       color: "bg-blue-500/15 border-blue-500/30 text-blue-300"     },
  { value: "nut-free",       label: "Sin Frutos Secos", iconName: "CircleOff",     color: "bg-orange-500/15 border-orange-500/30 text-orange-300" },
  { value: "sugar-free",     label: "Sin Azúcar",       iconName: "CandyOff",      color: "bg-purple-500/15 border-purple-500/30 text-purple-300" },
  { value: "shellfish-free", label: "Sin Mariscos",     iconName: "FishOff",       color: "bg-red-500/15 border-red-500/30 text-red-300"        },
  { value: "kosher",         label: "Kosher",           iconName: "Star",          color: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" },
  { value: "halal",          label: "Halal",            iconName: "Moon",          color: "bg-teal-500/15 border-teal-500/30 text-teal-300"    },
  { value: "low-sodium",     label: "Bajo en Sodio",    iconName: "Droplets",      color: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"    },
  { value: "other",          label: "Otra",             iconName: "AlertTriangle", color: "bg-zinc-500/15 border-zinc-500/30 text-zinc-300"    },
];
