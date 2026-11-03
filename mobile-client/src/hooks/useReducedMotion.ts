import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Respeta la preferencia del sistema antes de iniciar animaciones no esenciales. */
export function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  return reduceMotion;
}
