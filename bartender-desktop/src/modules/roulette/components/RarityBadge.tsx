import type { RouletteRarity } from '../types/roulette';
import { Sparkles, Star, Zap, Flame } from 'lucide-react';

interface Props {
  rarity: RouletteRarity;
  size?: 'sm' | 'md' | 'lg';
}

const RARITY_CONFIG = {
  COMMON: {
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/20',
    label: 'COMÚN',
    icon: <Zap size={10} />,
    glow: ''
  },
  RARE: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    label: 'RARO',
    icon: <Star size={10} />,
    glow: 'shadow-emerald-400/20'
  },
  EPIC: {
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    label: 'ÉPICO',
    icon: <Sparkles size={10} />,
    glow: 'shadow-purple-400/30 shadow-[0_0_15px_rgba(192,132,252,0.3)]'
  },
  LEGENDARY: {
    color: 'text-gold',
    bg: 'bg-gold/10',
    border: 'border-gold/20',
    label: 'LEGENDARIO',
    icon: <Flame size={10} />,
    glow: 'shadow-gold-glow animate-pulse'
  }
};

export default function RarityBadge({ rarity, size = 'md' }: Props) {
  const config = RARITY_CONFIG[rarity || 'COMMON'];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[8px]' : size === 'lg' ? 'px-4 py-1.5 text-xs' : 'px-3 py-1 text-[10px]';

  return (
    <div className={`
      flex items-center gap-1.5 font-black uppercase tracking-[0.2em] rounded-full border
      ${config.bg} ${config.color} ${config.border} ${config.glow} ${sizeClasses}
      transition-all duration-500
    `}>
      {config.icon}
      {config.label}
    </div>
  );
}
