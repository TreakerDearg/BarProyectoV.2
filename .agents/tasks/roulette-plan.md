# Plan de Implementación — Remodelación del Ecosistema de Ruleta

> Generado por el agente de planificación tras leer todos los archivos fuente.  
> Stack confirmado: Backend ES Modules, Desktop Electron/Vite/React 19 TypeScript, Web Next.js 16/React 19, Mobile Expo 57/React Native 0.86.3.

---

## Hallazgos de la Exploración

### Estado actual vs. lo que hay que crear

| Área | Ya existe | Hay que crear / modificar |
|------|-----------|--------------------------|
| Desktop `useRoulette.ts` | Hook completo con `spinning` booleano, `lastResult` | Añadir `SpinPhase`, `pendingResult`, `revealedResult`, `targetAngle` |
| Desktop `RouletteWheelRoyale.tsx` | SVG con slices, 24 luces CSS, animación 6s | Añadir 36 remaches SVG, bisel dorado, efecto rebote aguja, chase lighting |
| Desktop `RoulettePreview.tsx` | Wrapper + stats debajo de la rueda | Conectar a SpinPhase (hoy recibe `spinning` booleano) |
| Desktop `RoulettePage.tsx` | Playroom + Control Deck completo, tabs, modal | Integrar audio hook, JackpotBanner, WinnerCard, TheLab |
| Desktop `ProbabilityEngine.tsx` | Tabla de pesos, simulador, tab Pity Config (básico) | Separar Pity en `PityVault.tsx`; añadir `FaderMixer.tsx`, `SmartPresets.tsx` |
| Desktop `PityTrackerPanel.tsx` | Panel empleados con barras de pity | Fusionar con la config de pity en `PityVault.tsx` |
| Desktop `rouletteService.ts` | CRUD, socket, simulate, config, employee stats | Añadir `onJackpot` / `offJackpot` socket listeners |
| Desktop `types/roulette.ts` | Tipos completos | Añadir `SpinPhase`, `PendingResult` |
| Web `useRoulette.ts` | Hook con 7 fases (`RoulettePhase`) y `calculateTargetAngle` — **ya resuelve el spoiler problem** | **NO modificar** (ya es correcto) |
| Web `RouletteWheel.tsx` | Rueda SVG con framer-motion, hub, pointer | Solo colores: paleta Obsidian & Gold |
| Mobile `RouletteScreen.tsx` | Fase básica: círculo animado + haptics fijos cada 80ms | Reemplazar círculo por `MobileWheel`, añadir haptics progresivos |
| Mobile `MobileWheel.tsx` | **No existe** | Crear con react-native-svg |
| Mobile `GoldenTicket.tsx` | **No existe** | Crear con QR + countdown |
| Mobile `package.json` | `react-native-svg: 15.15.4` ✅ `expo-haptics: ~57.0.3` ✅ | Instalar `react-native-qrcode-svg` para Task 8 |
| Backend `roulette.controller.js` | ES Modules (`import/export`) ✅, emite `roulette:spin`, `roulette:admin:spin`, `roulette:update` | Añadir emisión `roulette:jackpot_alert` en LEGENDARY |
| Backend `roulette.routes.js` | Rutas REST completas | Añadir `POST /generate-ticket` y `POST /redeem-ticket` |
| Backend `rouletteTicket.controller.js` | **No existe** | Crear con HMAC nativo |

### Dependencias entre Tasks

```
Task 1 (SpinPhase Desktop)
  └── Task 2 (Audio hook) — necesita fases launching/spinning/revealed
  └── Task 3 (Visual Upgrade) — necesita phase para chase lighting
  └── Task 9 (JackpotBanner) — necesita SpinPhase.revealed para timing correcto
  └── Task 10 (WinnerCard) — necesita SpinPhase.revealed como trigger

Task 7 (The Lab) — depende de que ProbabilityEngine y PityTrackerPanel existan (ya existen); independiente de Task 1
Task 8 (Golden Ticket) — independiente, pero requiere instalar react-native-qrcode-svg en mobile

Task 4 (Web paleta) — completamente independiente
Task 5 (MobileWheel) — independiente
Task 6 (Hápticos) — depende de Task 5 (MobileWheel debe estar integrado primero)
```

### Riesgos de imports
- `RoulettePage.tsx` importa `PityTrackerPanel` directamente; Task 7 lo reemplaza por `PityVault` — hay que actualizar el import.
- `ProbabilityEngine.tsx` tiene tab "pity" embebido; Task 7 lo extrae — hay que eliminar ese tab y pasar la prop de config a `PityVault`.
- Task 9 añade `onJackpot`/`offJackpot` a `rouletteSocket` en `rouletteService.ts`; `offAll()` debe incluir el nuevo listener.
- Backend usa `import { io } from "../server.js"` — el nuevo controller de ticket también usará este patrón.

---

## Plan de Implementación

- [ ] **0. Documentación de referencia**
  Crear `ROULETTE_PLAN.md` (plan maestro legible para el equipo) y `ROULETTE_MEMORIA.md` (decisiones técnicas, patrones, riesgos) en la raíz del workspace.
  
  Files:
  - `c:\Users\Usuario\OneDrive\Escuela\Proyecto bartender\bartender-system\ROULETTE_PLAN.md`
  - `c:\Users\Usuario\OneDrive\Escuela\Proyecto bartender\bartender-system\ROULETTE_MEMORIA.md`
  
  Verify: los archivos existen y tienen contenido; `npm run build` en Desktop no falla.

---

- [ ] **1. Desktop: State Machine (SpinPhase) — Eliminar Spoiler Problem**
  
  **Contexto:** El hook actual usa un booleano `spinning` que setea `lastResult` mientras la rueda todavía gira, causando que el resultado se muestre antes de que la animación termine (spoiler problem). La web ya resuelve esto con `RoulettePhase`; hay que replicar el mismo patrón en Desktop.
  
  **Qué hacer:**
  
  1. En `types/roulette.ts` añadir:
     ```typescript
     export type SpinPhase =
       | 'idle'       // en reposo
       | 'launching'  // botón presionado, antes de llamar al backend
       | 'spinning'   // llamada al backend en vuelo, rueda girando libre
       | 'revealing'  // resultado recibido, rueda frenando hacia targetAngle
       | 'landing'    // rueda llegó al ángulo, reproducir sonido de impacto
       | 'revealed';  // resultado visible para el usuario
     ```
  
  2. En `useRoulette.ts`:
     - Añadir estado: `phase: SpinPhase` (inicia en `'idle'`), `pendingResult: RouletteSpinResult | null`, `revealedResult: RouletteSpinResult | null`, `targetAngle: number | null`.
     - Mantener `spinning` como alias derivado: `spinning = phase !== 'idle' && phase !== 'revealed'` (retrocompatibilidad con RouletteStats, etc.).
     - Modificar `spin()`: `launching` → llamada al backend → `spinning` → recibir resultado en `pendingResult` → `revealing` con `targetAngle` calculado (usar `calculateTargetAngle` del web como referencia).
     - Añadir `onWheelLanded()`: llamado por la rueda cuando termina la animación → `landing` → timeout 400ms → `revealed`, mover `pendingResult` a `revealedResult`.
     - Exportar `{ phase, pendingResult, revealedResult, targetAngle, onWheelLanded }` además de los campos actuales.
  
  3. En `RouletteWheelRoyale.tsx`:
     - Cambiar props: recibir `phase: SpinPhase` y `targetAngle: number | null` además de `drinks`, `totalWeight`.
     - Eliminar la prop `result` y `spinning` (reemplazadas por `phase`).
     - `useEffect` reacciona a `phase`:
       - `'revealing'`: parar loop libre, animar hacia `targetAngle` con easing de desaceleración `cubic-bezier(0.15, 0.8, 0.3, 1)`, al terminar llamar a callback `onLanded`.
       - `'idle'`/`'revealed'`: detener animación.
       - Resto: sin cambio.
     - `isWinner` en `RouletteSliceRoyale` solo se activa cuando `phase === 'revealed'`.
  
  4. En `RoulettePreview.tsx`:
     - Actualizar props para recibir `phase`, `targetAngle`, `onWheelLanded` en lugar de `spinning`/`result`.
     - Pasar al `RouletteWheelRoyale`.
     - El overlay de resultado (ticket style) solo se muestra cuando `phase === 'revealed'`.
  
  5. En `RoulettePage.tsx`:
     - Desestructurar `phase`, `revealedResult`, `targetAngle`, `onWheelLanded` de `useRoulette`.
     - Pasar correctamente a `RoulettePreview`.
     - El panel "Último ganador" usa `revealedResult` en lugar de `lastResult` (que pasa a ser alias interno).
     - El botón Lanzar deshabilitado cuando `phase !== 'idle'`.
  
  Files:
  - `bartender-desktop/src/modules/roulette/types/roulette.ts`
  - `bartender-desktop/src/modules/roulette/hooks/useRoulette.ts`
  - `bartender-desktop/src/modules/roulette/components/RoulettePreview/RouletteWheelRoyale.tsx`
  - `bartender-desktop/src/modules/roulette/components/RoulettePreview/RoulettePreview.tsx`
  - `bartender-desktop/src/modules/roulette/pages/RoulettePage.tsx`
  
  Verify: `npm run build` en `bartender-desktop/` pasa sin errores TypeScript. La app carga, se puede girar y el resultado aparece solo después de que la rueda frena.

---

- [ ] **2. Desktop: useRouletteAudio (Web Audio API)**
  
  **Decisión de diseño:** No usar archivos MP3 para evitar dependencias de assets; sintetizar todo con `AudioContext` + `OscillatorNode`. Los ticks se generan con un oscilador decayente tipo "reloj mecánico". Las fanfarrias son acordes arpeggiados cuya complejidad escala con la rareza.
  
  **Qué hacer:**
  
  1. Crear `useRouletteAudio.ts`:
     - `AudioContext` creado lazy en el primer `play` (requerimiento de navegadores: no crear antes de interacción del usuario).
     - `playTick(speed: number)`: oscilador `triangle` 180Hz, decay 80ms, ganancia modulada por `speed` (más fuerte cuando va rápido).
     - `playImpact()`: `sawtooth` 60Hz + ruido blanco 50ms para el golpe de la aguja al frenar.
     - `playFanfare(rarity: RouletteRarity)`: acorde arpeggiado, duración y complejidad según rareza:
       - COMMON: 2 notas, 300ms
       - RARE: 3 notas, 500ms, ligero reverb
       - EPIC: 4 notas + subgrave, 700ms
       - LEGENDARY: arpeggio 5 notas + campana + reverb largo 1.2s
     - Hook retorna `{ playTick, playImpact, playFanfare, isMuted, toggleMute }`.
  
  2. Integrar en `RoulettePage.tsx`:
     - Llamar `playTick` en cada frame de animación durante `spinning`/`revealing` (via `requestAnimationFrame` o callback del componente rueda).
     - Llamar `playImpact` cuando `phase === 'landing'`.
     - Llamar `playFanfare(revealedResult.result.rarity)` cuando `phase === 'revealed'`.
     - Añadir botón de mute en el header (icono speaker).
  
  Files:
  - `bartender-desktop/src/modules/roulette/hooks/useRouletteAudio.ts` (nuevo)
  - `bartender-desktop/src/modules/roulette/pages/RoulettePage.tsx` (modificar)
  
  Verify: `npm run build` en `bartender-desktop/` sin errores. TypeScript compila. Al girar la ruleta se escuchan ticks que se ralentizan al frenar.

---

- [ ] **3. Desktop: Visual Upgrade de RouletteWheelRoyale**
  
  **Decisión de diseño:** Todo en SVG para mantener el renderer vectorial existente. Los remaches son `<circle>` SVG en el anillo exterior. El chase lighting son 12 `<circle>` SVG animados con `keyTimes` calculados dinámicamente. El bisel dorado es un `<circle>` con `stroke` y gradiente radial. El rebote de la aguja es una animación CSS `keyframes` aplicada al puntero cuando `phase === 'landing'`.
  
  **Qué hacer en `RouletteWheelRoyale.tsx`:**
  
  1. **36 remaches:** Añadir dentro del SVG un anillo de 36 `<circle r="2">` posicionados con `transform="rotate(N) translate(96,0)"` (radio 96 sobre viewBox 200). Color: `rgba(212,163,64,0.6)` con `stroke="#D4A340" strokeWidth="0.5"`.
  
  2. **Chase lighting:** 12 `<circle r="1.5">` adicionales en radio 98, animados con `<animateTransform>` o `useEffect` + `requestAnimationFrame`. Durante `spinning`/`revealing`, cada círculo pulsa en dorado con 30° de desfase entre ellos creando efecto de luz que corre. Durante `idle`/`revealed`, se vuelven `opacity: 0.1`.
  
  3. **Bisel dorado:** Reemplazar el `<circle cx="100" cy="100" r="100" fill="none" stroke="rgba(255,255,255,0.05)">` actual por un doble anillo:
     - Exterior: `r="99"`, `stroke="url(#goldenBezel)"`, `strokeWidth="2"`.
     - Definir `<defs><linearGradient id="goldenBezel">` con stops en dorado y caoba.
  
  4. **Rebote de la aguja:** El puntero superior (`.absolute.top-0` en el JSX) recibe la clase CSS `animate-needle-bounce` cuando `phase === 'landing'`. Definir en Tailwind (usando `@keyframes` en `globals.css` o en el componente con `style` inline):
     ```css
     @keyframes needle-bounce {
       0%   { transform: translateY(-2px) rotate(0deg); }
       40%  { transform: translateY(4px) rotate(3deg); }
       70%  { transform: translateY(-1px) rotate(-1deg); }
       100% { transform: translateY(0) rotate(0deg); }
     }
     ```
     La animación dura 400ms (coincide con la fase `landing` del hook).
  
  Files:
  - `bartender-desktop/src/modules/roulette/components/RoulettePreview/RouletteWheelRoyale.tsx`
  
  Verify: `npm run build` sin errores. La rueda muestra remaches dorados, la aguja rebota al frenar.

---

- [ ] **4. Web: Paleta Obsidian & Gold en RouletteWheel**
  
  **Decisión de diseño:** Solo reemplazar la constante `WHEEL_COLORS` y los colores del hub/pointer en `RouletteWheel.tsx`. No tocar ninguna lógica, ni `useRoulette.ts` del web, ni el `RouletteWheel.module.css` más allá de los valores de color.
  
  **Qué hacer en `RouletteWheel.tsx`:**
  
  Reemplazar `WHEEL_COLORS`:
  ```typescript
  const WHEEL_COLORS = [
    "#0F0F14",  // Obsidian profundo
    "#D4A340",  // Gold dorado
    "#1A1A22",  // Obsidian claro
    "#B8922E",  // Gold cobre
    "#111118",  // Obsidian medio
    "#F0C060",  // Gold brillante
    "#0A0A0E",  // Obsidian muy oscuro
    "#C49030",  // Gold oscuro
  ];
  ```
  
  En el hub central (`styles.hubOuter`, `styles.hubInner`, `styles.hubCore`), si usan colores inline, actualizarlos a `backgroundColor: '#D4A340'` para el core y `'#1A1A22'` para el outer.
  
  En el pointer (`.pointer`, `.pointerArrow`), si usan colores inline, cambiar a `backgroundColor: '#D4A340'`.
  
  Files:
  - `src/components/cliente/roulette/RouletteWheel.tsx`
  
  Verify: `npm run build` en raíz Next.js sin errores. La rueda del cliente web muestra la paleta oscuro/dorado.

---

- [ ] **5. Mobile: MobileWheel.tsx con SVG real**
  
  **Decisión de diseño:** Usar `react-native-svg` (ya instalado v15.15.4). La rueda es un `Svg` con `G` rotado por `Animated.Value`. Los segmentos son `Path` calculados con trigonometría. El puntero es un `Polygon` SVG posicionado encima, fuera del grupo que rota.
  
  **Qué hacer:**
  
  1. Crear `mobile-client/src/components/roulette/MobileWheel.tsx`:
     - Props: `drinks: RouletteDrinkDTO[]`, `spinAnim: Animated.Value`, `size?: number` (default 280).
     - Función `segmentPath(startAngle, endAngle, r)` que retorna un string `d` de arco SVG.
     - Renderizar `<Svg>` con `<G>` animado cuya rotación viene de `spinAnim`.
     - Cada segmento: `<Path>` con color de rareza (`COMMON=#9b8f7d`, `RARE=#38BDF8`, `EPIC=#a855f7`, `LEGENDARY=#D4A340`) si el drink no tiene `color` propio.
     - Label de cada segmento: `<SvgText>` posicionado en el centro del arco, rotado, truncado a 10 chars. Solo renderizar si `sliceAngle > 25°`.
     - Hub central: `<Circle>` con `fill="#1A1A22"` y `<Circle>` interior dorado.
     - Puntero: fuera del `<G>` animado, un `<Polygon>` dorado apuntando al segmento superior.
  
  2. Modificar `RouletteScreen.tsx`:
     - Importar `MobileWheel` y reemplazar el bloque `<Animated.View style={[styles.circleOuter, ...]}><View style={styles.circleInner}>...</View></Animated.View>` por `<MobileWheel drinks={drinks} spinAnim={rotateAnim} />`.
     - Ajustar `styles.heroSection` si es necesario para el nuevo tamaño.
     - Mantener toda la lógica de spin existente (el `rotateAnim` sigue siendo el mismo `Animated.Value`).
  
  Files:
  - `mobile-client/src/components/roulette/MobileWheel.tsx` (nuevo)
  - `mobile-client/src/screens/RouletteScreen.tsx` (modificar)
  
  Verify: `npx expo export --platform android` (o `expo start`) sin errores de TypeScript. La rueda SVG se renderiza en el simulador.

---

- [ ] **6. Mobile: Hápticos progresivos + fase revealing**
  
  **Decisión de diseño:** Reemplazar el intervalo fijo de 80ms por un sistema que acorta el intervalo al principio (rueda rápida → ticks rápidos) y lo alarga al final (rueda frenando → ticks lentos). Esto se sincroniza con una curva de desaceleración lineal en el tiempo. Al recibir el resultado, se añade una fase `'revealing'` local en `RouletteScreen`.
  
  **Qué hacer en `RouletteScreen.tsx`:**
  
  1. Añadir el tipo `SpinState = 'idle' | 'spinning' | 'revealing' | 'result'` (ya tiene este tipo, extender).
  
  2. En `handleSpin`, después de recibir `res`:
     - Antes de llamar `spinPublicRoulette()`, iniciar la secuencia háptica progresiva:
       ```
       Duración total: 3000ms
       Fase rápida (0-1000ms): intervalo 60ms → ImpactFeedbackStyle.Light
       Fase media (1000-2200ms): intervalo 120ms → ImpactFeedbackStyle.Light
       Fase lenta (2200-3000ms): intervalo 220ms → ImpactFeedbackStyle.Medium
       ```
       Usar un único `setInterval` que ajusta su propio intervalo via `clearInterval`+`setInterval`.
     - Al recibir el resultado: cambiar a `setSpinState('revealing')`, disparar `Haptics.impactAsync(ImpactFeedbackStyle.Heavy)`.
     - Después de 600ms de revealing: `setSpinState('result')`, disparar `Haptics.notificationAsync(NotificationFeedbackType.Success)`.
  
  3. Actualizar el render del círculo/rueda para mostrar el estado `'revealing'` (efecto de desaceleración visual si aplica).
  
  Files:
  - `mobile-client/src/screens/RouletteScreen.tsx`
  
  Verify: Sin errores TypeScript. Los hápticos se sienten progresivos en un dispositivo físico / simulador con haptics habilitados.

---

- [ ] **7. Desktop: The Lab — PityVault + FaderMixer + SmartPresets**
  
  **Decisión de diseño:** No eliminar `ProbabilityEngine.tsx` ni `PityTrackerPanel.tsx`; en cambio crear los nuevos componentes y hacer que `RoulettePage.tsx` los use en lugar de los viejos dentro del Control Deck. Esto preserva retrocompatibilidad si otros módulos los usan.
  
  **Qué hacer:**
  
  1. Crear `TheLab/PityVault.tsx`:
     - Fusión visual de `PityTrackerPanel` (barras de progreso por empleado) + la pestaña "Pity Config" de `ProbabilityEngine` (sliders de thresholds).
     - Props: las mismas que `PityTrackerPanel` (ninguna) + las de config (`config`, `onSaveConfig`).
     - Internamente usa `getAllUserRouletteStats()` y `getRouletteConfig()`/`updateRouletteConfig()` (igual que los componentes originales).
     - Layout: header con tabs "Live Tracker" | "Config". Ambas secciones integradas verticalmente.
  
  2. Crear `TheLab/FaderMixer.tsx`:
     - Props: `drinks: RouletteDrink[]`, `onUpdate: (id, updates) => void`.
     - Renderiza faders verticales (sliders HTML `orient` no existe, usar `transform: rotate(-90deg)`) por cada drink activo.
     - Cada fader muestra el nombre del drink rotado y el porcentaje en tiempo real.
     - Máximo 12 faders visibles, scroll horizontal si hay más.
  
  3. Crear `TheLab/SmartPresets.tsx`:
     - Props: `onAutoBalance: (mode) => void`, `drinks: RouletteDrink[]`.
     - Tres tarjetas con preview de probabilidades resultantes:
       - **Happy Hour** → `autoBalance('equal')` + message "Iguala todas las probabilidades — ideal para rush de clientes".
       - **Inventory Pusher** → `autoBalance('smart')` + message "Prioriza tragos con más stock — mueve el inventario".
       - **Profit Maximizer** → Custom: aumenta peso de drinks con `dynamicPrice` alto. Calcular internamente sin llamar al backend (solo llama `onUpdate` para cada drink afectado).
     - Cada tarjeta muestra un mini bar chart de las probabilidades proyectadas.
  
  4. Modificar `ProbabilityEngine.tsx`:
     - Eliminar la pestaña "pity" y su contenido (ahora está en `PityVault`).
     - Las pestañas quedan: "Pesos" | "Simulador".
  
  5. Modificar `RoulettePage.tsx`:
     - En el Control Deck, reemplazar la columna derecha (actualmente solo el botón "Añadir Trago") por una sección The Lab con tres sub-secciones:
       - `<FaderMixer>` — vista compacta de faders
       - `<SmartPresets>` — presets
       - `<PityVault>` — reemplaza la importación directa de `PityTrackerPanel`
     - Eliminar la pestaña "pity" del toggle del header (ahora está integrada en el Control Deck).
     - Actualizar import: `import PityVault from "../components/TheLab/PityVault"` en lugar de `PityTrackerPanel`.
  
  Files:
  - `bartender-desktop/src/modules/roulette/components/TheLab/PityVault.tsx` (nuevo)
  - `bartender-desktop/src/modules/roulette/components/TheLab/FaderMixer.tsx` (nuevo)
  - `bartender-desktop/src/modules/roulette/components/TheLab/SmartPresets.tsx` (nuevo)
  - `bartender-desktop/src/modules/roulette/components/ProbabilityEngine.tsx` (modificar: eliminar tab pity)
  - `bartender-desktop/src/modules/roulette/pages/RoulettePage.tsx` (modificar: integrar The Lab)
  
  Verify: `npm run build` en `bartender-desktop/` sin errores. El Control Deck muestra FaderMixer, SmartPresets y PityVault integrados.

---

- [ ] **8. Backend + Mobile: Golden Ticket VIP**
  
  **Decisión de diseño:** HMAC con `crypto` nativo de Node.js (módulo built-in, sin instalar nada en backend). El ticket es un JSON `{ drinkId, rarity, tableId, iat, exp }` firmado con HMAC-SHA256 usando `process.env.TICKET_SECRET`. En mobile, QR generado con `react-native-qrcode-svg` (a instalar). El countdown se implementa con `useEffect` + `setInterval`.
  
  **Qué hacer:**
  
  1. **Backend** — crear `backend/src/controllers/rouletteTicket.controller.js`:
     ```javascript
     import crypto from "crypto";
     import { ok, badRequest } from "../utils/response.js";
     
     const SECRET = process.env.TICKET_SECRET ?? "bartender-ticket-secret";
     const TTL_MS = 30 * 60 * 1000; // 30 minutos
     
     function sign(payload) {
       const str = JSON.stringify(payload);
       return crypto.createHmac("sha256", SECRET).update(str).digest("hex");
     }
     
     export async function generateTicket(req, res) {
       const { drinkId, rarity, drinkName } = req.body;
       if (!drinkId || !rarity) return badRequest(res, "drinkId y rarity son requeridos");
       const now = Date.now();
       const payload = { drinkId, drinkName, rarity, tableId: req.body.tableId ?? null, iat: now, exp: now + TTL_MS };
       const sig = sign(payload);
       return ok(res, { ticket: JSON.stringify({ ...payload, sig }), expiresAt: payload.exp });
     }
     
     export async function redeemTicket(req, res) {
       const { ticket } = req.body;
       if (!ticket) return badRequest(res, "ticket requerido");
       try {
         const { sig, ...payload } = JSON.parse(ticket);
         if (Date.now() > payload.exp) return badRequest(res, "Ticket expirado");
         const expected = sign(payload);
         if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
           return badRequest(res, "Ticket inválido");
         }
         return ok(res, { valid: true, drink: { id: payload.drinkId, name: payload.drinkName, rarity: payload.rarity } });
       } catch {
         return badRequest(res, "Ticket malformado");
       }
     }
     ```
  
  2. **Backend** — modificar `roulette.routes.js`:
     ```javascript
     import { generateTicket, redeemTicket } from "../controllers/rouletteTicket.controller.js";
     // Añadir después de las rutas public:
     router.post("/generate-ticket", protect, generateTicket);
     router.post("/redeem-ticket",   ...adminOnly, redeemTicket);
     ```
  
  3. **Mobile** — instalar `react-native-qrcode-svg`:
     ```bash
     cd mobile-client && npx expo install react-native-qrcode-svg
     ```
     Verificar que la versión instalada es compatible con `react-native-svg 15.15.4` (el paquete es un wrapper de react-native-svg, mismo árbol de dependencias).
  
  4. **Mobile** — crear `mobile-client/src/components/roulette/GoldenTicket.tsx`:
     - Props: `ticket: string`, `expiresAt: number`, `drinkName: string`, `rarity: string`, `onClose: () => void`.
     - `useEffect` con `setInterval(1000)` para actualizar el countdown `mm:ss`.
     - Cuando `remainingMs <= 0`, mostrar "EXPIRADO" y deshabilitar el QR.
     - `QRCode` de `react-native-qrcode-svg` con `value={ticket}`, `size={200}`, color dorado sobre fondo oscuro.
     - Diseño: modal full-screen con borde dorado, badge de rareza, nombre del trago, QR centrado, countdown prominente.
     - El QR codifica el string `ticket` completo (que el bartender escanea en desktop para redimir).
  
  5. **Mobile** — integrar en `RouletteScreen.tsx`:
     - Después de `spinState === 'result'`, añadir botón "🎫 Generar Ticket VIP" que llama a `POST /roulette/generate-ticket` con el resultado y muestra `<GoldenTicket>` en un modal.
  
  Files:
  - `backend/src/controllers/rouletteTicket.controller.js` (nuevo)
  - `backend/src/routes/roulette.routes.js` (modificar: añadir 2 rutas)
  - `mobile-client/src/components/roulette/GoldenTicket.tsx` (nuevo)
  - `mobile-client/src/screens/RouletteScreen.tsx` (modificar: botón + modal)
  
  Verify: `npm run dev` en backend arranca sin errores. `curl -X POST /api/roulette/generate-ticket` con body válido retorna ticket. `curl /api/roulette/redeem-ticket` valida correctamente. Mobile compila sin errores.

---

- [ ] **9. Desktop + Backend: Banner Escénico WebSocket (JackpotBanner)**
  
  **Decisión de diseño:** El backend ya emite `roulette:spin` al completar un spin. Añadir una emisión adicional `roulette:jackpot_alert` solo cuando `result.rarity === 'LEGENDARY'`. En desktop, escuchar este evento y mostrar el banner 8 segundos con animación de entrada/salida Framer Motion.
  
  **Qué hacer:**
  
  1. **Backend** — en `roulette.controller.js`, dentro de la función `spinRoulette`, después de la línea `io.emit("roulette:spin", payload)` (ya existente), añadir:
     ```javascript
     if (selectedDrink.rarity === "LEGENDARY") {
       io.emit("roulette:jackpot_alert", {
         drinkName: selectedDrink.name,
         rarity:    selectedDrink.rarity,
         timestamp: Date.now(),
       });
     }
     ```
  
  2. **Desktop** — en `rouletteService.ts`, añadir a `rouletteSocket`:
     ```typescript
     onJackpot: (cb: (data: { drinkName: string; rarity: RouletteRarity; timestamp: number }) => void) => {
       getSocket()?.on("roulette:jackpot_alert", cb);
     },
     offJackpot: () => {
       getSocket()?.off("roulette:jackpot_alert");
     },
     ```
     También actualizar `offAll()` para incluir `getSocket()?.off("roulette:jackpot_alert")`.
  
  3. **Desktop** — crear `components/JackpotBanner.tsx`:
     - Props: `drinkName: string`, `visible: boolean`, `onClose: () => void`.
     - Animación Framer Motion: entrada desde `y: -100, opacity: 0` a `y: 0, opacity: 1` en 600ms con spring. Salida: `y: -100, opacity: 0` en 400ms.
     - Fondo: gradiente negro → dorado, borde dorado, partículas CSS (`::before`, `::after` con pseudo-elements o divs absolutos animados con CSS `@keyframes float`).
     - Texto: "⚡ JACKPOT LEGENDARIO ⚡", nombre del trago en grande, "Premio especial conseguido".
     - Se cierra solo después de 8s (`useEffect` + `setTimeout`).
  
  4. **Desktop** — en `RoulettePage.tsx`:
     - Añadir estado `jackpot: { drinkName: string } | null`.
     - `useEffect` que llama `rouletteSocket.onJackpot(data => { setJackpot(data); setTimeout(() => setJackpot(null), 8000); })` y en cleanup `offJackpot()`.
     - Renderizar `<JackpotBanner visible={!!jackpot} drinkName={jackpot?.drinkName ?? ''} onClose={() => setJackpot(null)} />` en el JSX (fuera del scroll, fijo al top).
  
  Files:
  - `backend/src/controllers/roulette.controller.js` (modificar: añadir emit jackpot)
  - `bartender-desktop/src/modules/roulette/services/rouletteService.ts` (modificar: onJackpot, offJackpot, offAll)
  - `bartender-desktop/src/modules/roulette/components/JackpotBanner.tsx` (nuevo)
  - `bartender-desktop/src/modules/roulette/pages/RoulettePage.tsx` (modificar: socket listener + banner)
  
  Verify: `npm run build` en `bartender-desktop/` sin errores TypeScript. Con un spin que retorna LEGENDARY, el banner aparece y desaparece en 8s.

---

- [ ] **10. Desktop: WinnerCard con Ficha Técnica + Comanda POS**
  
  **Decisión de diseño:** Crear `WinnerCard.tsx` como componente completo que reemplaza el bloque "ÚLTIMO GANADOR" existente en `RoulettePage.tsx`. Incluye la ficha técnica del trago (ingredientes, método, categoría, rareza) y un botón de "Imprimir Comanda POS" que usa `window.print()` con una vista CSS `@media print` específica.
  
  **Qué hacer:**
  
  1. Crear `components/WinnerCard.tsx`:
     - Props: `result: RouletteSpinResult | null`, `phase: SpinPhase`, `onSpin: () => void`.
     - Visible solo cuando `phase === 'revealed'` o `phase === 'idle'` (con resultado previo).
     - Secciones:
       - **Hero**: imagen del producto (si existe), nombre grande, badge de rareza.
       - **Ficha Técnica**: categoría, probabilidad, precio, total de spins previos.
       - **Ingredientes** (si tiene `recipe`): lista compacta con cantidades y unidades. Copiar el estilo de `RecipeQuickView` existente pero inline.
       - **Comanda POS**: botón "🖨️ Imprimir Comanda". Al clickear, crear un `<div id="pos-print">` con los datos del trago (nombre, ingredientes, precio, timestamp, mesa), añadirlo al DOM con `visibility: hidden` excepto en `@media print`, y llamar `window.print()`. Limpiar el div después.
       - **Acción**: botón "LANZAR DE NUEVO" que llama `onSpin`.
  
  2. Modificar `RoulettePage.tsx`:
     - Reemplazar el bloque JSX del "ÚLTIMO GANADOR" (aprox. 60 líneas con la imagen, RarityBadge, stats y botón de spin) por `<WinnerCard result={revealedResult} phase={phase} onSpin={actions.spin} />`.
     - Eliminar la importación de `RecipeQuickView` si ya no se usa en otro lugar de la página.
  
  Files:
  - `bartender-desktop/src/modules/roulette/components/WinnerCard.tsx` (nuevo)
  - `bartender-desktop/src/modules/roulette/pages/RoulettePage.tsx` (modificar: reemplazar bloque ganador)
  
  Verify: `npm run build` en `bartender-desktop/` sin errores. La card muestra la ficha técnica completa. El botón de imprimir abre el diálogo del sistema con la comanda.

---

## Orden de Ejecución Recomendado

Las tasks tienen estas dependencias:

```
0 (docs)        → independiente, primero por orden
1 (SpinPhase)   → prerequisito de 2, 3, 9, 10
4 (Web colores) → independiente, paralela con 1
5 (MobileWheel) → independiente, paralela con 1
7 (The Lab)     → independiente, paralela con 1
8 (Ticket)      → independiente, pero instala dep en mobile (hacer antes de 6 para evitar conflictos)
2 (Audio)       → después de 1
3 (Visual)      → después de 1
6 (Haptics)     → después de 5
9 (Jackpot)     → después de 1
10 (WinnerCard) → después de 1
```

**Secuencia óptima:** 0 → 1 → 4 → 5 → 8 → 7 → 2 → 3 → 6 → 9 → 10

---

## Notas de Riesgo

1. **Task 1 rompe la interfaz de `RouletteWheelRoyale`**: los props cambian de `result/spinning` a `phase/targetAngle`. Si algún test o storybook los usa, actualizar también.

2. **Task 7 elimina la pestaña "pity" de `ProbabilityEngine`**: asegurarse de que el tab actual en `ProbabilityEngine` que carga `fetchConfig()` con `useEffect([activeTab])` no quede como código muerto que siga llamando a la API.

3. **Task 8 requiere `TICKET_SECRET` en el `.env` del backend**: añadir `TICKET_SECRET=<random-hex-32>` al `.env` antes de desplegar a producción. Sin él, cae al fallback hardcodeado (inseguro para producción).

4. **Task 9 cambia la lógica de `offAll()` en rouletteService**: si algún componente llama `rouletteSocket.offAll()` y espera que solo desactive los 3 listeners originales, ahora desactiva 4. Verificar usages con grep.

5. **react-native-qrcode-svg** para Task 8: este paquete depende de `react-native-svg`, que ya está instalado (`15.15.4`). Al instalar con `expo install`, Expo resolverá la versión compatible automáticamente. No usar `npm install` directamente para evitar conflictos de versiones.
