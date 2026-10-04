import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

const RARITY_COLORS = {
  COMMON: '#9b8f7d', RARE: '#38BDF8', EPIC: '#a855f7', LEGENDARY: '#D4A340',
};
const PARTICLE_COUNTS = { COMMON: 10, RARE: 16, EPIC: 24, LEGENDARY: 36 };

interface Props {
  rarity: string;
  visible: boolean;
  onComplete?: () => void;
}

export const RevealExplosion: React.FC<Props> = ({ rarity, visible, onComplete }) => {
  const count  = PARTICLE_COUNTS[rarity as keyof typeof PARTICLE_COUNTS] ?? 10;
  const color  = RARITY_COLORS[rarity  as keyof typeof RARITY_COLORS]    ?? '#9b8f7d';
  
  const particles = useRef(
    Array.from({ length: count }, () => ({
      x:   new Animated.Value(SW / 2),
      y:   new Animated.Value(SH * 0.35),
      op:  new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;
    
    particles.forEach(p => { p.x.setValue(SW/2); p.y.setValue(SH*0.35); p.op.setValue(1); });
    
    const anims = particles.map((p, i) => {
      const angle    = (i / count) * 2 * Math.PI + Math.random() * 0.4;
      const distance = 80 + Math.random() * 120;
      const duration = 1000 + Math.random() * 600;
      
      return Animated.parallel([
        Animated.timing(p.x, { toValue: SW/2 + Math.cos(angle)*distance, duration, useNativeDriver: true }),
        Animated.timing(p.y, { toValue: SH*0.35 + Math.sin(angle)*distance + 40, duration, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(duration * 0.4),
          Animated.timing(p.op, { toValue: 0, duration: duration * 0.6, useNativeDriver: true }),
        ]),
      ]);
    });
    
    Animated.stagger(20, anims).start(() => {
      onComplete?.();
    });
  }, [visible]);

  if (!visible) return null;
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position:  'absolute',
            width:     rarity === 'LEGENDARY' ? 8 : 6,
            height:    rarity === 'LEGENDARY' ? 8 : 6,
            borderRadius: 9999,
            backgroundColor: color,
            opacity:   p.op,
            transform: [{ translateX: p.x }, { translateY: p.y }],
            left:      -((rarity === 'LEGENDARY' ? 8 : 6) / 2),
            top:       -((rarity === 'LEGENDARY' ? 8 : 6) / 2),
          }}
        />
      ))}
    </View>
  );
};

export default RevealExplosion;
