// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — usePressScale
// Micro-interacción de press: escala con spring y native driver.
// Uso: const press = usePressScale(0.97);
//      <Animated.View style={press.animatedStyle}> ...
// Se conecta a onPressIn / onPressOut del TouchableOpacity o Pressable.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo, useRef } from 'react';
import { Animated } from 'react-native';

import { SpringPress } from '../theme/motion';

export function usePressScale(scaleTo = 0.97) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, { toValue: scaleTo, ...SpringPress }).start();
  }, [scale, scaleTo]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, ...SpringPress }).start();
  }, [scale]);

  const animatedStyle = useMemo(
    () => ({ transform: [{ scale }] }),
    [scale],
  );

  return { scale, animatedStyle, onPressIn, onPressOut };
}
