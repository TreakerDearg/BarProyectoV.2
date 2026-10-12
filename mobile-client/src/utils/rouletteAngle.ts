// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — rouletteAngle
// Calcula el ángulo de destino para que la rueda decelere exactamente
// con el segmento ganador bajo el pointer (posición 270° = top).
//
// Replica la lógica de calculateTargetAngle del desktop (ADR-005),
// adaptada para mobile (6–8 vueltas en lugar de 8–12).
// ─────────────────────────────────────────────────────────────────────────────

import type { RouletteDrinkDTO } from '../types/api';

/**
 * Dado el array de tragos (con probabilidades), el ID del ganador y el
 * ángulo actual de la rueda (en grados absolutos), retorna el ángulo
 * destino que lleva el centro del segmento ganador al pointer (top).
 *
 * @param drinks     - Array de tragos con `probability` calculado por el backend
 * @param winnerId   - `_id` del trago ganador
 * @param currentDeg - Ángulo actual de `spinDeg` (grados absolutos, puede superar 360)
 * @returns          - Ángulo destino absoluto (siempre > currentDeg)
 */
export function calculateTargetAngle(
  drinks:     RouletteDrinkDTO[],
  winnerId:   string,
  currentDeg: number,
): number {
  const total = drinks.reduce((s, d) => s + (d.probability ?? 1), 0) || 1;

  let cursor        = 0;
  let centerOfSlice = 0;
  let found         = false;

  for (const d of drinks) {
    const sweep = ((d.probability ?? 1) / total) * 360;
    if (d._id === winnerId) {
      centerOfSlice = cursor + sweep / 2;
      found = true;
      break;
    }
    cursor += sweep;
  }

  // Fallback al centro del primer drink si no se encuentra el ID
  if (!found && drinks.length > 0) {
    const sweep = ((drinks[0].probability ?? 1) / total) * 360;
    centerOfSlice = sweep / 2;
  }

  // 270° = posición del pointer en coordenadas SVG (top, igual que desktop ADR-005)
  const baseOffset = (270 - centerOfSlice + 360) % 360;

  // 6–8 vueltas en mobile (desktop usa 8–12)
  const laps = 6 + Math.floor(Math.random() * 3);

  return currentDeg + laps * 360 + baseOffset;
}
