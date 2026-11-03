// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Responsive layout
// Fuente única para decisiones de ancho en teléfonos, tablets y split-screen.
// ─────────────────────────────────────────────────────────────────────────────

import { useWindowDimensions } from 'react-native';

export const LayoutBreakpoint = {
  compact: 360,
  medium: 480,
  tablet: 720,
} as const;

export function getProductColumns(width: number): 1 | 2 | 3 {
  if (width < LayoutBreakpoint.compact) return 1;
  if (width >= LayoutBreakpoint.tablet) return 3;
  return 2;
}

export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();

  return {
    width,
    height,
    fontScale,
    isCompact: width < LayoutBreakpoint.compact,
    isTablet: width >= LayoutBreakpoint.tablet,
    productColumns: getProductColumns(width),
    pageGutter: width < LayoutBreakpoint.compact ? 16 : 20,
  } as const;
}
