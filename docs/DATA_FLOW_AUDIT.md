# Auditoría de Flujo de Datos - Nebula Recipe Studio

**Fecha:** 2026-08-04  
**Objetivo:** Convertir el sistema en un ecosistema donde el backend sea la única fuente de verdad

---

## 1. MAPA DE DATOS EXISTENTES

### 1.1 MongoDB Models

#### Recipe Model
**Campos almacenados:**
- product (ObjectId ref Product)
- isPrimary (Boolean)
- variantName (String)
- parentId (ObjectId ref Recipe)
- type (Enum: drink, food)
- drinkStyle (Enum: author, classic)
- ingredients [{ inventoryItem, quantity, unit, order, baseUnitMultiplier }]
- method (String)
- steps [{ stepNumber, instruction }]
- category (String)
- image (String)
- imagePublicId (String)
- specifications { glass, ice }
- totalCost (Number) - **CALCULADO AUTOMÁTICAMENTE**
- isActive (Boolean)
- timestamps

**Campos virtuales:**
- margin (calculated from product.price - totalCost)

**Cálculos en backend:**
- `calculateCost()` - Calcula totalCost normalizando unidades
- Sync con Product (hasRecipe, cost)
- Sync con InventoryItem (usedInRecipes)

#### Product Model
**Campos almacenados:**
- name, description, price, cost, category, type
- drinkStyle, subcategory
- recipeId (ObjectId ref Recipe)
- preparationTime, available, autoAvailable, featured
- image, imagePublicId, gallery [{ url, publicId, order }]
- tags [String], dietaryRestrictions [String]
- menuIds [ObjectId ref Menu]
- stockImpact, isAlcohol, isActiveForPOS
- timestamps

**Campos virtuales:**
- hasRecipe (from recipeId)
- recipe (virtual ref Recipe)
- profit (price - cost)
- margin ((price - cost) / price * 100)

#### InventoryItem Model
**Campos almacenados:**
- name, description
- stock, minStock, maxStock
- unit, sector, category, location
- cost, supplier, costHistory [{ cost, date, supplier }]
- isActive
- image, imagePublicId
- movements [{ type, quantity, reason, costAtMoment, relatedOrder, createdAt }]
- usedInProducts [ObjectId ref Product]
- usedInRecipes [ObjectId ref Recipe]

**Campos virtuales:**
- stockStatus (empty, critical, low, optimal)

**Cálculos en backend:**
- Sync con Recipe (recalcula totalCost cuando cost cambia)

---

## 2. ENDPOINTS EXISTENTES

### 2.1 Recipe Routes
```
GET    /recipes                          - getAll
GET    /recipes/product/:productId      - byProduct
GET    /recipes/product/:productId/with-variants - withVariants
GET    /recipes/drinks/with-recipes     - drinkProductsWithRecipes
GET    /recipes/:id/protocol            - protocol (bartender view)
GET    /recipes/:id/availability        - checkAvailability
GET    /recipes/:id                     - getOne
POST   /recipes                         - create
PATCH  /recipes/:id                     - update
DELETE /recipes/:id                     - delete
```

### 2.2 Product Routes
```
GET    /products                        - getAll
GET    /products/with-recipes           - withRecipes
GET    /products/with-inventory         - withInventory
GET    /products/stats                  - stats
GET    /products/:id                    - getOne
POST   /products/sync-availability      - syncAvailability
PATCH  /products/:id/toggle-availability - toggleAvailability
POST   /products                        - create
PUT    /products/:id                    - update
DELETE /products/:id                    - delete
```

### 2.3 Inventory Routes
```
GET    /inventory                       - getAll
GET    /inventory/with-products         - withProducts
GET    /inventory/stats                - stats
GET    /inventory/categories           - categories
GET    /inventory/:id                   - getOne
POST   /inventory                       - create
PATCH  /inventory/:id/stock             - adjustStock
PATCH  /inventory/:id                   - update
DELETE /inventory/:id                   - delete
```

---

## 3. ENDPOINTS FALTANTES

### 3.1 Dashboard
```
GET    /recipes/dashboard/stats         - Stats agregados para dashboard
GET    /recipes/dashboard/recent        - Recetas recientes con metadata
GET    /recipes/dashboard/warnings      - Warnings generados por backend
GET    /recipes/dashboard/suggestions   - Suggestions inteligentes
```

### 3.2 Analytics
```
GET    /recipes/analytics/:id           - Analytics completos de una receta
GET    /recipes/analytics/popular       - Recetas más populares
GET    /recipes/analytics/trends        - Tendencias de consumo
```

### 3.3 Timeline
```
GET    /recipes/:id/timeline           - Historial de cambios ordenado
POST   /recipes/:id/timeline/event     - Agregar evento al timeline
```

### 3.4 Variants
```
GET    /recipes/:id/variants           - Obtener variantes de una receta
POST   /recipes/:id/variants           - Crear variante
PATCH  /recipes/:id/variants/:variantId - Actualizar variante
```

### 3.5 Collections
```
GET    /recipes/collections             - Obtener colecciones
POST   /recipes/collections             - Crear colección
PATCH  /recipes/collections/:id        - Actualizar colección
```

### 3.6 Techniques & Decorations
```
GET    /recipes/techniques             - Catálogo de técnicas
GET    /recipes/decorations            - Catálogo de decoraciones
```

---

## 4. FRONTEND - SERVICES

### 4.1 recipeService.ts
**Funciones:**
- getRecipes()
- getRecipe(id)
- createRecipe(recipe)
- updateRecipe(id, recipe)
- deleteRecipe(id)
- getRecipeProtocol(id)
- checkRecipeAvailability(id)
- getRecipesByProduct(productId)
- getDrinkProductsWithRecipes(params)

**Problemas:**
- ❌ No usa TanStack Query
- ❌ No tiene optimización de caché
- ❌ No tiene revalidación automática

### 4.2 inventoryService.ts
**Funciones:**
- getInventory()
- createInventoryItem(item)
- updateInventoryItem(id, item)
- deleteInventoryItem(id)

**Problemas:**
- ❌ No usa TanStack Query
- ❌ No tiene optimización de caché

---

## 5. FRONTEND - HOOKS

### 5.1 useRecipeCost.ts
**Calcula:**
- totalCost
- ingredientCosts (Map)
- ingredientPercentages (Map)
- averageCostPerIngredient

**Problema:**
- ❌ DUPLICACIÓN: Backend ya calcula totalCost en Recipe model
- ❌ DUPLICACIÓN: Backend ya tiene margin virtual en Recipe model

### 5.2 useRecipeAvailability.ts
**Calcula:**
- isAvailable
- missingIngredients
- availableIngredients
- totalIngredients

**Problema:**
- ❌ DUPLICACIÓN: Backend tiene endpoint checkRecipeAvailability

### 5.3 useRecipeHealthScore.ts
**Calcula:**
- overall health score
- costScore, availabilityScore, timeScore
- complexityScore, profitabilityScore
- consistencyScore, presentationScore, productionScore

**Problema:**
- ❌ DUPLICACIÓN: Backend podría calcular esto
- ❌ Usa useRecipeCost y useRecipeAvailability (cascada de duplicaciones)

### 5.4 Otros Hooks
- useRecipeData.ts
- useRecipeInheritance.ts
- useRecipeLibrary.ts
- useRecipeRelations.ts
- useRecipeTechniques.ts
- useRecipeVariants.ts
- useRecipeVersions.ts

**Problema:**
- ❌ No centralizados
- ❌ Posible duplicación de lógica

---

## 6. FRONTEND - COMPONENTES CON MOCKS

### 6.1 Dashboard.tsx
**Datos mockeados:**
```typescript
const stats = [
  { id: 'variants', value: 8 }, // HARDCODED
  { id: 'ingredients', value: 156 }, // HARDCODED
  { id: 'avg-cost', value: '$2.45' }, // HARDCODED
  { id: 'avg-health', value: '78' }, // HARDCODED
];

const warnings = [
  { id: 'low-stock', description: '3 ingredientes con stock crítico' }, // HARDCODED
  { id: 'no-image', description: '5 recetas sin fotografía' }, // HARDCODED
];

const suggestions = [
  { id: 'create-variant', description: 'Margarita tiene potencial...' }, // HARDCODED
];

const activities = [
  { id: 'activity-1', title: 'Nueva receta creada' }, // HARDCODED
];
```

**Problema:**
- ❌ Todos los datos son estáticos
- ❌ No se conecta a backend
- ❌ No refleja estado real del sistema

### 6.2 RecipeAnalyticsMini.tsx
**Datos del contexto:**
- analytics.popularity (calculado en RecipeStudioContext con Math.random())
- analytics.margin (viene de productionAnalysis)
- analytics.cost (viene de totalCost del hook)
- analytics.time (viene de productionAnalysis)
- analytics.complexity (viene de productionAnalysis)

**Problema:**
- ❌ popularity es RANDOM (no real)
- ❌ No viene del backend

### 6.3 RecipeTimeline.tsx
**Datos del contexto:**
- versions (viene de useRecipeVersions)

**Problema:**
- ❌ useRecipeVersions probablemente no tiene implementación real
- ❌ No hay endpoint de timeline en backend

### 6.4 RecipeWarnings.tsx
**Datos del contexto:**
- warnings (viene de RecipeStudioContext, generado desde formulaIntelligence)

**Problema:**
- ❌ formulaIntelligence probablemente es mock o cálculo local
- ❌ No viene del backend

---

## 7. DATOS DUPLICADOS (BACKEND vs FRONTEND)

### 7.1 Cost Calculation
**Backend:**
- Recipe.totalCost calculado en pre-save hook
- Recipe.margin virtual field
- Product.margin virtual field

**Frontend:**
- useRecipeCost calcula totalCost
- useRecipeCost calcula ingredientCosts
- useRecipeCost calcula ingredientPercentages

**Duplicación:** ❌ CRÍTICA

### 7.2 Availability Check
**Backend:**
- checkRecipeAvailability endpoint
- Product.available sync con stock

**Frontend:**
- useRecipeAvailability calcula isAvailable
- useRecipeAvailability calcula missingIngredients

**Duplicación:** ❌ CRÍTICA

### 7.3 Health Score
**Backend:**
- No existe cálculo de health score

**Frontend:**
- useRecipeHealthScore calcula 8 métricas diferentes

**Duplicación:** ⚠️ PARCIAL (solo frontend, pero debería estar en backend)

### 7.4 Analytics
**Backend:**
- No existe endpoint de analytics

**Frontend:**
- RecipeStudioContext calcula analytics con Math.random para popularity

**Duplicación:** ❌ CRÍTICA (datos falsos en frontend)

---

## 8. FLUJO DE DATOS ACTUAL

```
MongoDB (Recipe, Product, InventoryItem)
    ↓
Models (con cálculos automáticos)
    ↓
Controllers (CRUD básico)
    ↓
Services (recipeService, inventoryService)
    ↓
API (REST endpoints)
    ↓
Frontend Services (sin TanStack Query)
    ↓
Hooks (recalculan todo: cost, availability, health)
    ↓
Components (usan datos recalculados + mocks)
```

**Problema:** Cada capa recalcula lo que la anterior ya calculó.

---

## 9. FLUJO DE DATOS DESEADO

```
MongoDB (Recipe, Product, InventoryItem)
    ↓
Models (cálculos automáticos: cost, margin, availability)
    ↓
Controllers (DTOs específicos por vista)
    ↓
Services (TanStack Query con caché)
    ↓
Custom Hooks (solo transformación UI)
    ↓
Components (conectados directamente a hooks)
```

**Objetivo:** Backend es única fuente de verdad, frontend solo presenta.

---

## 10. PLAN DE ACCIÓN

### 10.1 Prioridad ALTA

1. **Crear DTOs específicos:**
   - RecipeBuilderDTO (para Builder)
   - RecipeLibraryDTO (para Library)
   - RecipeDashboardDTO (para Dashboard)
   - RecipeAnalyticsDTO (para Analytics)

2. **Implementar endpoints faltantes:**
   - GET /recipes/dashboard/stats
   - GET /recipes/analytics/:id
   - GET /recipes/:id/timeline

3. **Eliminar cálculos duplicados en frontend:**
   - Remover useRecipeCost (usar backend)
   - Remover useRecipeAvailability (usar backend)
   - Mover useRecipeHealthScore al backend

### 10.2 Prioridad MEDIA

4. **Implementar TanStack Query:**
   - Migrar recipeService a useQuery
   - Migrar inventoryService a useQuery
   - Configurar invalidateQueries
   - Configurar select para transformación

5. **Fusionar hooks redundantes:**
   - Crear useRecipeData centralizado
   - Consolidar useRecipeRelations, useRecipeVariants, useRecipeVersions

### 10.3 Prioridad BAJA

6. **Conectar Dashboard con datos reales:**
   - Reemplazar stats mock con endpoint
   - Reemplazar warnings mock con endpoint
   - Reemplazar suggestions mock con endpoint

7. **Validar compatibilidad:**
   - Verificar POS sigue funcionando
   - Verificar Mobile sigue funcionando
   - Verificar Kitchen sigue funcionando

---

## 11. MÉTRICAS DE ÉXITO

### Antes
- ❌ Cálculos duplicados en 3 capas
- ❌ Dashboard con 100% datos mock
- ❌ Analytics con datos random
- ❌ Sin TanStack Query
- ❌ 10 hooks redundantes

### Después
- ✅ Backend como única fuente de verdad
- ✅ Dashboard con 100% datos reales
- ✅ Analytics con métricas reales
- ✅ TanStack Query implementado
- ✅ 2-3 hooks centralizados
- ✅ DTOs específicos por vista
- ✅ Reducción de requests HTTP
- ✅ Sistema compatible con POS, Mobile, Kitchen
