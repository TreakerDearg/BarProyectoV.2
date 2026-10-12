// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — RarityIcon
// Icono de rareza usando lucide-react-native. Sin emojis.
// COMMON → Circle, RARE → Droplets, EPIC → Flame, LEGENDARY → Crown
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Circle, Droplets, Flame, Crown } from 'lucide-react-native';
import { Colors, NocturneColors } from '../../theme/colors';

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export const RARITY_ICON_COLOR: Record<Rarity, string> = {
  COMMON:    Colors.outline,
  RARE:      Colors.info,
  EPIC:      Colors.wine,
  LEGENDARY: NocturneColors.vipGold,
};

export const RARITY_LABEL: Record<Rarity, string> = {
  COMMON:    'COMMON',
  RARE:      'RARE',
  EPIC:      'EPIC',
  LEGENDARY: 'LEGENDARY',
};

interface RarityIconProps {
  rarity:    string;
  size?:     number;
  color?:    string;
}

export const RarityIcon: React.FC<RarityIconProps> = ({
  rarity,
  size  = 16,
  color,
}) => {
  const resolvedColor = color ?? (RARITY_ICON_COLOR[rarity as Rarity] ?? Colors.outline);

  switch (rarity) {
    case 'RARE':
      return <Droplets size={size} color={resolvedColor} />;
    case 'EPIC':
      return <Flame size={size} color={resolvedColor} />;
    case 'LEGENDARY':
      return <Crown size={size} color={resolvedColor} />;
    case 'COMMON':
    default:
      return <Circle size={size} color={resolvedColor} />;
  }
};

export default RarityIcon;
