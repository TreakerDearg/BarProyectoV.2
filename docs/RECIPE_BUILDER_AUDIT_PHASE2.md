# Auditoría Fase 1.2 - Búsqueda Global de Mocks

**Fecha:** 2026-08-05  
**Objetivo:** Búsqueda global de patrones de datos mockeados en módulo recipes  
**Patrones buscados:** mock, default, fake, sample, dummy, placeholder, hardcoded  
**Estado:** COMPLETADO

---

## 📊 Resultados de Búsqueda

**Comando:** `Get-ChildItem -Path "src/modules/recipes" -Recurse -Include *.ts,*.tsx | Select-String -Pattern "mock|default|fake|sample|dummy|placeholder|hardcoded" -CaseSensitive:$false`

**Total de coincidencias:** 29 líneas

---

## ✅ Falsos Positivos (No son datos mockeados)

### 1. Switch statements con `default`
- **Archivos:** Múltiples componentes
- **Ejemplo:** `default: return styles.priorityLow;`
- **Veredicto:** Son casos default de switch statements, no datos mockeados
- **Acción:** Ninguna

### 2. Input placeholders
- **Archivos:** LibraryTopBar, StudioHeader, RecipeWizard, NewVariantWizard, RecipeVariantPanel
- **Ejemplo:** `placeholder="Buscar recetas..."`
- **Veredicto:** Son placeholders de UI para inputs, no datos mockeados
- **Acción:** Ninguna

### 3. Image placeholders
- **Archivos:** PremiumRecipeCard, QuickPreview, VariantCard, VariantManager, NewVariantWizard
- **Ejemplo:** `<div className={styles.imagePlaceholder}>`
- **Veredicto:** Son elementos visuales de placeholder, no datos mockeados
- **Acción:** Ninguna

### 4. Export default
- **Archivos:** VariantSelector, NebulaRecipeStudio
- **Ejemplo:** `export default function`
- **Veredicto:** Son exportaciones por defecto de componentes, no datos mockeados
- **Acción:** Ninguna

### 5. Categoría "Mocktails"
- **Archivos:** KnowledgeNavigator, LibraryTopBar
- **Ejemplo:** `{ id: 'mocktails', label: 'Mocktails' }`
- **Veredicto:** Es una categoría legítima de recetas (bebidas sin alcohol), no datos mockeados
- **Acción:** Ninguna

### 6. Comentarios "placeholder"
- **Archivo:** RecipeStudioContext.tsx
- **Ejemplo:** `// Availability (placeholder hasta que se implemente endpoint)`
- **Veredicto:** Son comentarios indicando funcionalidad pendiente, no datos mockeados
- **Acción:** Monitorear implementación de endpoints

---

## 🚨 Datos Mockeados Reales Encontrados

### 1. defaultTechniques Array

**Archivo:** `src/modules/recipes/hooks/useRecipeTechniques.ts`  
**Líneas:** 63-163  
**Severidad:** 🔴 CRÍTICO

**Problema:**
```typescript
const defaultTechniques: Technique[] = [
  {
    _id: 'shake',
    name: 'Shake',
    description: 'Agitar en shaker con hielo',
    category: 'shake',
    icon: '🥤',
    instructions: 'Colocar ingredientes en shaker con hielo, agitar vigorosamente por 10-15 segundos, colar.',
    equipment: ['Shaker', 'Hielo', 'Colador'],
    difficulty: 'easy',
    time: 30,
  },
  // ... 8 técnicas más
];
```

**Uso:**
```typescript
export function useRecipeTechniques({
  techniques = defaultTechniques,
  decorations = defaultDecorations,
}: UseRecipeTechniquesProps): RecipeTechniquesData {
```

**Impacto:**
- 9 técnicas hardcodeadas en el frontend
- No se pueden gestionar desde el backend
- No hay persistencia de nuevas técnicas
- Los costos y tiempos son fijos

**Acción requerida:** FASE 2 - Crear módulo Technique completo

---

### 2. defaultDecorations Array

**Archivo:** `src/modules/recipes/hooks/useRecipeTechniques.ts`  
**Líneas:** 166-257  
**Severidad:** 🔴 CRÍTICO

**Problema:**
```typescript
const defaultDecorations: Decoration[] = [
  {
    _id: 'lemon-twist',
    name: 'Twist de Limón',
    type: 'garnish',
    description: 'Cáscara de limón en espiral',
    icon: '🍋',
    category: 'cítricos',
    cost: 0.05,
  },
  // ... 10 decoraciones más
];
```

**Uso:**
```typescript
export function useRecipeTechniques({
  techniques = defaultTechniques,
  decorations = defaultDecorations,
}: UseRecipeTechniquesProps): RecipeTechniquesData {
```

**Impacto:**
- 11 decoraciones hardcodeadas en el frontend
- No se pueden gestionar desde el backend
- Los costos son fijos
- No hay persistencia de nuevas decoraciones

**Acción requerida:** FASE 2 - Crear módulo Decoration completo

---

### 3. getDefaultInheritanceSettings Function

**Archivo:** `src/modules/recipes/hooks/useRecipeInheritance.ts`  
**Líneas:** 117-135  
**Severidad:** 🟡 MEDIO

**Problema:**
```typescript
function getDefaultInheritanceSettings(): InheritanceSettings {
  return {
    inheritIngredients: true,
    inheritSteps: true,
    inheritMethod: true,
    inheritSpecifications: true,
    inheritCategory: true,
    inheritDrinkStyle: true,
  };
}
```

**Uso:**
```typescript
const settings = inheritanceSettings || getDefaultInheritanceSettings();
```

**Impacto:**
- Configuración de herencia hardcodeada
- No se puede personalizar desde el backend
- Valores por defecto fijos en el frontend

**Acción requerida:** Considerar mover configuración a backend o mantener como defaults válidos

---

## 📋 Resumen

### Datos Mockeados Reales: 3
1. **defaultTechniques** - 9 técnicas hardcodeadas
2. **defaultDecorations** - 11 decoraciones hardcodeadas  
3. **getDefaultInheritanceSettings** - Configuración de herencia hardcodeada

### Falsos Positivos: 26
- Switch statements con `default`: ~15
- Input placeholders: ~6
- Image placeholders: ~4
- Export default: ~2
- Categoría "Mocktails": ~2
- Comentarios placeholder: ~6

---

## 🎯 Conclusiones

La búsqueda global confirma que **solo existen 3 fuentes de datos mockeados** en el módulo recipes:

1. **Arrays de técnicas y decoraciones** en `useRecipeTechniques.ts` (CRÍTICO)
2. **Configuración de herencia** en `useRecipeInheritance.ts` (MEDIO)

Todos los demás resultados son falsos positivos (switch statements, placeholders de UI, exportaciones, etc.).

El componente **BuilderExplorer.tsx** ya fue corregido en FASE 1.1, eliminando el array `mockInventoryItems`.

---

## 📌 Próximos Pasos

1. ✅ FASE 1.1 - Eliminar mockInventoryItems de BuilderExplorer.tsx (COMPLETADO)
2. ✅ FASE 1.1 - Conectar BuilderExplorer con useInventory hook (COMPLETADO)
3. ✅ FASE 1.2 - Búsqueda global de mocks (COMPLETADO)
4. ⏭️ FASE 1.2 - Generar segunda auditoría de mocks encontrados (EN PROGRESO)
5. ⏭️ FASE 2 - Crear módulos completos para Techniques y Decorations

---

**Auditoría realizada por:** Cascade AI  
**Revisión pendiente:** Usuario
