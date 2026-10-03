# ROULETTE_PLAN.md — Roulette Ecosystem Overhaul

> Última actualización: 2025-01  
> Estado global: **En progreso** — FEAT-001 en curso

---

## Resumen ejecutivo

Migración completa del sistema de ruleta del bartender a una arquitectura basada en una **máquina de estados SpinPhase**, con mejoras visuales SVG (bisel dorado, remaches, luces chase), audio sintetizado por Web Audio API, y generación de tickets HMAC-firmados. El trabajo abarca Desktop (Electron), Web (Next.js), Mobile (Expo) y Backend (Express).

---

## Tareas y dependencias

| ID    | Título                                           | Apps          | Depende de    | Estado      |
|-------|--------------------------------------------------|---------------|---------------|-------------|
| T-0   | Documentación (ROULETTE_PLAN.md + MEMORIA.md)   | —             | —             | ✅ Done      |
| T-1   | SpinPhase type + useRoulette rewrite (Desktop)   | Desktop       | T-0           | ✅ Done      |
| T-2   | RouletteWheelRoyale visual upgrade               | Desktop       | T-1           | ✅ Done      |
| T-3   | useRouletteAudio + integración RoulettePage      | Desktop       | T-1, T-2      | ✅ Done      |
| T-4   | SpinPhase web (Next.js) — ya existe en src/hooks | Web           | —             | ✅ Pre-exists |
| T-5   | RouletteWheel upgrade (Web)                      | Web           | T-4           | ⬜ Pendiente |
| T-6   | Mobile SpinPhase + Haptics curve                 | Mobile        | T-1           | ⬜ Pendiente |
| T-7   | Mobile audio (expo-av or Tone.js)                | Mobile        | T-6           | ⬜ Pendiente |
| T-8   | Backend HMAC ticket signing                      | Backend       | —             | ⬜ Pendiente |
| T-9   | Ticket QR overlay (Desktop + Web)                | Desktop, Web  | T-8           | ⬜ Pendiente |
| T-10  | E2E smoke tests + CI step                        | All           | T-1…T-9       | ⬜ Pendiente |

---

## Archivos modificados / creados en FEAT-001

### Desktop (`bartender-desktop/src/modules/roulette/`)

| Archivo | Cambio |
|---|---|
| `types/roulette.ts` | + `SpinPhase` export (6 valores) |
| `hooks/useRoulette.ts` | Rewrite: SpinPhase machine, pendingResult, revealedResult, targetAngle, onWheelLanded, calculateTargetAngle |
| `hooks/useRouletteAudio.ts` | **Nuevo** — Web Audio API synthesizer (tick, impact, fanfare x4 rarities, mute) |
| `components/RoulettePreview/RouletteWheelRoyale.tsx` | Props → phase/targetAngle/onLanded; 36 remaches SVG; bisel dorado; chase lights; needle-bounce |
| `components/RoulettePreview/RoulettePreview.tsx` | Props → phase/targetAngle/onWheelLanded; overlay solo en `revealed` |
| `pages/RoulettePage.tsx` | Consume phase, revealedResult, targetAngle, onWheelLanded; mute button |

### Raíz del proyecto

| Archivo | Tipo |
|---|---|
| `ROULETTE_PLAN.md` | Plan maestro (este archivo) |
| `ROULETTE_MEMORIA.md` | Decisiones técnicas y ADRs |

---

## Descripción de tareas futuras

### T-5 — RouletteWheel upgrade (Web)
Aplicar el mismo tratamiento visual (remaches, bisel, chase lights) al componente `src/components/cliente/roulette/RouletteWheel.tsx`. La lógica SpinPhase ya existe en `src/hooks/useRoulette.ts`.

### T-6 — Mobile SpinPhase + Haptics
Migrar `mobile-client/src/screens/RouletteScreen.tsx` a usar la misma máquina de estados. Integrar `expo-haptics` con la curva progresiva (frecuencia creciente durante `spinning`, impacto fuerte en `landing`).

### T-7 — Mobile audio
Usar `expo-av` para reproducir archivos de audio pregenerados (tick, impact, fanfare) o sintetizar con un approach compatible con React Native.

### T-8 — Backend HMAC ticket
Endpoint `POST /roulette/spin` retorna `{ result, ticket }` donde `ticket` es un JWT/HMAC firmado con `TICKET_SECRET`. Agregar `TICKET_SECRET` a `backend/.env`.

### T-9 — Ticket QR overlay
Mostrar el ticket HMAC como QR en la pantalla de resultado (`revealed`), tanto en Desktop como en Web.

### T-10 — E2E smoke tests
Añadir `playwright` o `vitest` para flujos críticos: spin → landing → revealed → ticket visible.

---

## Convenciones de código

- **Desktop**: Tailwind v4, tokens `gold/ivory/muted/bg/surface-3`, framer-motion ^12.38.0.
- **Web**: Next.js 16, Tailwind v4, mismos tokens.
- **Mobile**: StyleSheet.create, Animated.Value, expo-haptics.
- **Backend**: ES Modules, helpers `ok()/badRequest()/created()`, Socket.IO `io` desde `server.js`.
- **SpinPhase** es el contrato entre UI y hook — nunca exponer `pendingResult` al template.
