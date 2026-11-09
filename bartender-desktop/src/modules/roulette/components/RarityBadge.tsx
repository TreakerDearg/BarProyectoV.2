import type { RouletteRarity } from "../types/roulette";
import { Sparkles, Star, Zap, Flame } from "lucide-react";

interface Props {
  rarity: RouletteRarity | string;
  size?: "sm" | "md" | "lg";
}

const RARITY_CONFIG: Record<
  string,
  {
    color: string;
    bg: string;
    border: string;
    label: string;
    icon: React.ReactNode;
    glow: string;
  }
> = {
  COMMON: {
    color: "text-[#388BFD]",
    bg: "bg-[#388BFD]/10",
    border: "border-[#388BFD]/25",
    label: "COMÚN",
    icon: <Zap size={12} />,
    glow: "",
  },
  RARE: {
    color: "text-emerald",
    bg: "bg-emerald/10",
    border: "border-emerald/30",
    label: "RARO",
    icon: <Star size={12} />,
    glow: "shadow-[0_0_12px_rgba(63,185,80,0.18)]",
  },
  EPIC: {
    color: "text-[#A371F7]",
    bg: "bg-[#A371F7]/10",
    border: "border-[#A371F7]/30",
    label: "ÉPICO",
    icon: <Sparkles size={12} />,
    glow: "shadow-[0_0_16px_rgba(163,113,247,0.22)]",
  },
  LEGENDARY: {
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/35",
    label: "LEGENDARIO",
    icon: <Flame size={12} />,
    glow: "shadow-gold-glow",
  },
};

export default function RarityBadge({ rarity = "COMMON", size = "md" }: Props) {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.COMMON;
  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-0.5 text-xs gap-1.5"
      : size === "lg"
      ? "px-4 py-1.5 text-sm gap-2"
      : "px-3 py-1 text-xs gap-1.5";

  return (
    <div
      className={`inline-flex items-center font-black uppercase tracking-wider rounded-full border transition-all duration-300 ${config.bg} ${config.color} ${config.border} ${config.glow} ${sizeClasses}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
