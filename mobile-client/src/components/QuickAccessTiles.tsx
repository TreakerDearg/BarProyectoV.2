// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — QuickAccessTiles
// Dos tiles de acceso rápido: La Carta y Ruleta Nebula.
// Reemplaza al CategoryHeroRow en la posición inmediatamente debajo del
// HeroCarousel de promos. Alta visibilidad, press scale, sin scroll.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Utensils, RotateCw } from 'lucide-react-native';

import { Colors, NocturneColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { usePressScale } from '../hooks/usePressScale';

// Touchable con soporte de estilo animado (press scale)
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface QuickAccessTilesProps {
  onCartaPress:   () => void;
  onRuletaPress:  () => void;
}

// ── Tile individual ───────────────────────────────────────────────────────────
interface TileProps {
  icon:     React.ReactNode;
  label:    string;
  sub:      string;
  onPress:  () => void;
  tileStyle: object;
  a11yLabel: string;
}

function QuickTile({ icon, label, sub, onPress, tileStyle, a11yLabel }: TileProps) {
  const press = usePressScale(0.97);

  return (
    <AnimatedTouchable
      style={[styles.tile, tileStyle, press.animatedStyle]}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
    >
      <View style={styles.iconWrap}>
        {icon}
      </View>
      <Text style={styles.tileLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.tileSub} numberOfLines={2}>{sub}</Text>
    </AnimatedTouchable>
  );
}

// ── QuickAccessTiles ──────────────────────────────────────────────────────────
export function QuickAccessTiles({ onCartaPress, onRuletaPress }: QuickAccessTilesProps) {
  return (
    <View style={styles.row}>
      <QuickTile
        icon={<Utensils size={28} color={Colors.primary} />}
        label="La Carta"
        sub="Ver menú completo"
        onPress={onCartaPress}
        tileStyle={styles.tileEmber}
        a11yLabel="Explorar la carta del restaurante"
      />
      <QuickTile
        icon={<RotateCw size={28} color={Colors.primary} />}
        label="Ruleta Nebula"
        sub="Descubrí tu próximo trago"
        onPress={onRuletaPress}
        tileStyle={styles.tileWine}
        a11yLabel="Abrir la ruleta de cócteles Nebula"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap:           Spacing.sm,
  },
  tile: {
    flex:             1,
    height:           96,
    borderRadius:     Radius.xl,
    borderWidth:      1,
    paddingHorizontal: Spacing.smMd,
    paddingVertical:  Spacing.smMd,
    justifyContent:   'center',
    gap:              2,
    overflow:         'hidden',
  },
  tileEmber: {
    backgroundColor: NocturneColors.emberMuted,
    borderColor:     NocturneColors.emberBorder,
  },
  tileWine: {
    backgroundColor: NocturneColors.wineMuted,
    borderColor:     NocturneColors.borderSubtle,
  },
  iconWrap: {
    marginBottom: 2,
  },
  tileLabel: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
  },
  tileSub: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
});

export default QuickAccessTiles;
