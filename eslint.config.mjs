// Configuración ESLint (flat config) alineada al template de Next.js 16.
//
// Nota: antes se usaba FlatCompat para cargar "next/core-web-vitals" y
// "next/typescript", pero con eslint 9.39 + eslint-config-next 16 el interop
// fallaba al cargar la config ("Converting circular structure to JSON").
// eslint-config-next ya exporta flat configs nativos: se importan directo.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Ignorados por defecto de eslint-config-next + subproyectos del repo
  // (cada uno tiene su propio tooling de lint/typecheck).
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "dist-electron/**",
    "next-env.d.ts",
    "mobile-client/**",
    "backend/**",
    "bartender-desktop/**",
  ]),
]);

export default eslintConfig;
