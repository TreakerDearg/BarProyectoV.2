/**
 * Mapeo de iconNames de DIETARY_OPTIONS a componentes Lucide React.
 */
import {
  Leaf, Salad, WheatOff, MilkOff, CircleOff,
  CandyOff, FishOff, Star, Moon, Droplets, AlertTriangle,
} from "lucide-react";
import type { ReactNode } from "react";

const ICON_MAP: Record<string, (size?: number) => ReactNode> = {
  Leaf:          (s = 12) => <Leaf          size={s} />,
  Salad:         (s = 12) => <Salad         size={s} />,
  WheatOff:      (s = 12) => <WheatOff      size={s} />,
  MilkOff:       (s = 12) => <MilkOff       size={s} />,
  CircleOff:     (s = 12) => <CircleOff     size={s} />,
  CandyOff:      (s = 12) => <CandyOff      size={s} />,
  FishOff:       (s = 12) => <FishOff       size={s} />,
  Star:          (s = 12) => <Star          size={s} />,
  Moon:          (s = 12) => <Moon          size={s} />,
  Droplets:      (s = 12) => <Droplets      size={s} />,
  AlertTriangle: (s = 12) => <AlertTriangle size={s} />,
};

export function getDietaryIcon(iconName: string, size = 12): ReactNode {
  return ICON_MAP[iconName]?.(size) ?? <AlertTriangle size={size} />;
}
