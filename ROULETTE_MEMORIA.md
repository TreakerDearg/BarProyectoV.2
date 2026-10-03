# ROULETTE_MEMORIA.md — Decisiones Técnicas (ADR)

> Archivo de contexto para agentes y futuros desarrolladores.  
> Cada sección documenta una decisión arquitectónica con su justificación.

---

## ADR-001: SpinPhase State Machine

**Decisión**: El estado de la ruleta se modela como una máquina de estados explícita con 6 fases:
`idle → launching → spinning → revealing → landing → revealed`

**Problema que resuelve**: El spoiler problem — el resultado del backend llegaba antes de que la animación terminara, causando que la UI mostrara el ganador mientras la rueda seguía girando.

**Solución**:
- `pendingResult` almacena el resultado del backend (invisible al template).
- Solo cuando la animación llama `onWheelLanded()` se mueve a `revealedResult` (visible al template).
- `spinning` queda como alias derivado: `phase !== 'idle' && phase !== 'revealed'` para backward compat.
- `lastResult` es alias de `revealedResult` para no romper RouletteStats.

**Referencia**: La web hook (`src/hooks/useRoulette.ts`) ya tenía este patrón con `revealing/result`.  
El Desktop replica la misma lógica adaptada a la arquitectura Electron/Vite.

---

## ADR-002: Web Audio API en lugar de librería de audio

**Decisión**: `useRouletteAudio.ts` usa la Web Audio API nativa del browser (AudioContext, OscillatorNode, GainNode) sin dependencias externas.

**Justificación**:
- Electron ejecuta Chromium — Web Audio API disponible 100%.
- Sin dependencias adicionales que aumenten el bundle de Electron.
- Control granular de frecuencia, timing y envolvente (ADSR).
- El AudioContext se crea lazy (primer play), evitando el error "AudioContext suspended" en navegadores que requieren gesto del usuario.

**Diseño de sonidos**:
- `playTick(speed)`: OscillatorNode triangle 180Hz, gain decae en 80ms. Amplitud escala con `speed` (0→1). Se llama en requestAnimationFrame loop durante `spinning/revealing`.
- `playImpact()`: Sawtooth 60Hz + white noise burst 50ms. Representa la aguja aterrizando.
- `playFanfare(rarity)`: Escala de complejidad por rareza:
  - COMMON: 2 notas (C5, E5), 300ms total
  - RARE: 3 notas (C5, E5, G5), 500ms con delay chain
  - EPIC: 4 notas + sub (C4, E5, G5, B5), 700ms
  - LEGENDARY: Arpegio de 5 notas + parcial de campana + convolver reverb, 1.2s

---

## ADR-003: Enfoque SVG-only para mejoras visuales

**Decisión**: Remaches, bisel dorado y luces chase se implementan como elementos SVG puros dentro del `<svg viewBox="0 0 200 200">` existente.

**Justificación**:
- Sin dependencias de canvas o WebGL.
- SVG escala perfectamente en todos los tamaños de ventana Electron.
- Los 36 remaches son `<circle>` con `transform="rotate(N*10) translate(96,0)"` — O(1) render.
- El bisel dorado usa `<linearGradient>` en `<defs>` + dos `<circle>` con stroke.
- Las luces chase son 12 `<circle>` con opacidad animada via requestAnimationFrame.

**Notas de implementación**:
- Los remaches están en r=96 (dentro del radio 98 del bisel, fuera del radio 94 de las slices).
- El gradiente del bisel simula metal: `#D4A340 → #F7E08A → #8B6914 → #D4A340`.
- Chase lights: 12 puntos en r=98 (sobre el bisel), la opacidad activa rotates con offset de fase `(i/12 * 2π + time * speed)`.

---

## ADR-004: Needle Bounce via CSS class toggle

**Decisión**: La animación de rebote de la aguja se implementa añadiendo la clase CSS `needle-bounce` al elemento pointer div cuando `phase === 'landing'`, removiéndola tras 400ms.

**Justificación**:
- Evita introducir framer-motion en un elemento decorativo pequeño.
- La clase CSS puede definirse con `@keyframes` en el CSS global del desktop (index.css o equivalente).
- El timeout de 400ms coincide con la transición `landing → revealed` en el hook.

**Keyframe sugerido**:
```css
@keyframes needle-bounce {
  0%   { transform: translateX(-50%) translateY(-8px) rotate(0deg); }
  20%  { transform: translateX(-50%) translateY(-2px) rotate(-5deg); }
  40%  { transform: translateX(-50%) translateY(-6px) rotate(3deg); }
  60%  { transform: translateX(-50%) translateY(-3px) rotate(-2deg); }
  80%  { transform: translateX(-50%) translateY(-5px) rotate(1deg); }
  100% { transform: translateX(-50%) translateY(-8px) rotate(0deg); }
}
.needle-bounce { animation: needle-bounce 0.4s ease-out; }
```

---

## ADR-005: calculateTargetAngle (Desktop)

**Decisión**: La lógica de cálculo del ángulo de destino en Desktop replica la del web hook pero adaptada al tipo `RouletteDrink` (usa `weight/totalWeight` en lugar de `probability`).

**Fórmula**:
1. Calcular `startAngle` acumulado para cada slice: `(cumulativeWeight / totalWeight) * 360`.
2. `sliceAngle = (drink.weight / totalWeight) * 360`.
3. `centerOfSlice = startAngle + sliceAngle / 2`.
4. `baseOffset = (270 - centerOfSlice + 360) % 360` — lleva el centro al top (posición del pointer).
5. `totalAngle = (8 + random(0,4)) * 360 + baseOffset` — 8-12 vueltas completas.

**Por qué 270°**: El SVG viewBox tiene el pointer en la parte superior. En coordenadas SVG donde 0° = derecha y los ángulos crecen clockwise, la posición superior equivale a 270°. Esto es consistente con `polarToCartesian` en `RouletteSliceRoyale.tsx`.

---

## ADR-006: Backward Compatibility

**Decisión**: Mantener `spinning` y `lastResult` como aliases exportados para no romper componentes que no son parte de FEAT-001.

| Alias | Valor real |
|---|---|
| `spinning` | `phase !== 'idle' && phase !== 'revealed'` |
| `lastResult` | `revealedResult` |

**Componentes que dependen de esto**:
- `RouletteStats.tsx` — usa `lastResult?.result.name` y `lastResult?.meta.rarity`
- `PityTrackerPanel.tsx` — posiblemente usa `spinning`
- Cualquier consumidor futuro que no haya migrado aún

---

## Dependencias relevantes (Desktop)

```json
{
  "framer-motion": "^12.38.0",
  "lucide-react": "latest",
  "electron": "41.x",
  "vite": "8.x",
  "tailwindcss": "v4"
}
```

**Web Audio API**: nativa de Chromium (Electron). No requiere instalación.
