# AGENTS.md
## Contexto general
Este proyecto es una plataforma de bartender con múltiples aplicaciones:
- `backend/`: API y lógica de negocio (Express 5 + MongoDB).
- `bartender-desktop/`: app de escritorio para operación interna (Electron + React).
- `.` (raíz): frontend web con rutas de cliente y admin (Next.js 16).
  - `/` -> landing page
  - `/admin` -> panel de administración
  - `/cliente/*` -> app de clientes (carta, cuenta, reservas, ruleta, pedido)

## Stack detectado (según `package.json`)
### Web (raíz)
- Next.js `16.2.2` + React `19` + TypeScript
- Tailwind CSS v4, ESLint, `eslint-config-next`
- Scripts: `npm run dev`, `npm run build`, `npm run lint`

### Backend (`backend/`)
- Node.js + Express `5` (ES Modules) + MongoDB (`mongoose`)
- Auth: `bcryptjs`, `jsonwebtoken`. Seguridad: `helmet`, `cors`, `zod`
- Tiempo real: `socket.io`
- Scripts: `npm run dev` (usa nodemon), `npm run start`

### Desktop (`bartender-desktop/`)
- Electron `41` + React `19` + Vite `8` + TypeScript
- Build: `npm run build`, `npm run dist` (genera instalador)
- Scripts: `npm run dev`, `npm run lint`

## Reglas para agentes
1. Mantener compatibilidad entre backend, web y desktop al cambiar APIs, auth o eventos Socket.IO.
2. No editar artefactos generados (`.next/`, `dist/`, `dist-electron/`, `release/`).
