# Auditoría del Sistema de Recetas - Fase 1

**Fecha:** 2 de agosto de 2026  
**Versión:** 1.0  
**Estado:** Completado  
**Objetivo:** Realizar una auditoría completa del sistema de recetas para comprender la arquitectura, flujo de datos, relaciones, dependencias y oportunidades de mejora.

---

## Resumen Ejecutivo

El sistema de recetas actual cumple su función básica pero presenta una arquitectura que puede mejorarse tanto a nivel funcional como visual. Las relaciones entre entidades existen pero no siguen una arquitectura clara y unificada. La experiencia del usuario continúa pareciendo un CRUD tradicional cuando el objetivo es convertir este módulo en el centro de conocimiento gastronómico del ecosistema Bartender.

---

## 1. Estado Actual

### 1.1 Arquitectura Frontend

**Estructura del módulo de recetas:**

```
src/modules/recipes/
├── components/
│   ├── RecipeCard.tsx
│   ├── RecipeDetailModal.tsx
│   ├── RecipeExpandedPanel.tsx
│   ├── RecipeForm.tsx
│   └── VariantSelector.tsx
├── pages/
│   └── RecipesPage.tsx
├── services/
│   └── recipeService.ts
└── types/
    └── recipe.ts
```

**Página principal:** `RecipesPage.tsx`
- Vista de lista de recetas con grid
- Búsqueda y filtros (todos, drinks, food)
- Modos de vista (list, create, edit)
- Historial de cambios en tiempo real
- Estadísticas (total, drinks, foods, totalCost)
- Integración con Socket.IO para actualizaciones en tiempo real

**Componentes principales:**
- `RecipeCard`: Tarjeta de receta con información básica
- `RecipeForm`: Formulario completo de receta (3 columnas)
- `RecipeDetailModal`: Modal de detalle de receta
- `RecipeExpandedPanel`: Panel expandido con ingredientes y costos
- `VariantSelector`: Selector de variantes

---

### 1.2 Tipos de Datos

**Recipe (src/modules/recipes/types/recipe.ts):**

```typescript
export interface Recipe {
  _id?: string;
  product: {
    _id: string;
    name: string;
  };
  ingredients: RecipeIngredient[];
  type: "drink" | "food";
  drinkStyle?: "author" | "classic";
  method?: string;
  steps?: RecipeStep[];
  category: string;
  image?: string;
  totalCost?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeIngredient {
  inventoryItem: {
    _id: string;
    name: string;
  };
  quantity: number;
  unit: "ml" | "l" | "g" | "kg" | "unit" | "oz" | "portion";
  order?: number;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
}
```

**Product (src/types/product.ts):**

```typescript
export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  subcategory?: string;
  type: "drink" | "food";
  drinkStyle?: "author" | "classic";
  image?: string;
  available: boolean;
  featured: boolean;
  tags: string[];
  dietaryRestrictions: ("vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free")[];
  preparationTime: number;
  dynamicPrice?: number;
  createdAt?: string;
  updatedAt?: string;
  hasRecipe?: boolean;
  recipeId?: string;
  recipe?: any;
  menuIds?: string[];
}
```

**InventoryItem (src/modules/inventory/types/inventory.ts):**

```typescript
export interface InventoryItem {
  _id?: string;
  name: string;
  description?: string;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: "ml" | "l" | "g" | "kg" | "unit" | "oz" | "portion";
  sector: "bar" | "kitchen" | "general";
  category: string;
  cost: number;
  supplier: string;
  location: "bar" | "kitchen" | "storage";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  stockStatus?: "critical" | "low" | "optimal";
  isLowStock?: boolean;
  usagePercent?: number;
  predictedStockDate?: string;
  daysUntilEmpty?: number;
  suggestedRestockQuantity?: number;
  consumptionRate?: number;
  forecastConfidence?: number;
  usedInProducts?: string[];
  usedInRecipes?: Array<{
    recipeId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    unit: string;
  }>;
}
```

**Menu (src/modules/menus/types/menu.ts):**

```typescript
export interface Menu {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  imagePublicId?: string;
  color: string;
  type: "drink" | "food" | "mixed";
  categories: MenuCategory[];
  active: boolean;
  isPublic: boolean;
  featured?: boolean;
  schedule: any;
  createdAt: string;
  updatedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  tags?: string[];
  dietaryRestrictions?: ("vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free")[];
  availableHours?: { start: string; end: string };
  availableDays?: string[];
  gallery?: GalleryImage[];
  minPrice?: number;
  maxPrice?: number;
  drinkStyle?: "author" | "classic" | "mixed";
}

export interface MenuCategory {
  name: string;
  description: string;
  image: string;
  products: MenuProduct[];
  order: number;
}

export interface MenuProduct {
  product: string;
  price: number | null;
  available: boolean;
  featured: boolean;
  order: number;
}
```

---

### 1.3 Servicios

**Recipe Service (src/modules/recipes/services/recipeService.ts):**

```typescript
// Endpoints
GET /recipes
GET /recipes/:id
POST /recipes
PATCH /recipes/:id
DELETE /recipes/:id
GET /recipes/:id/protocol
GET /recipes/:id/availability
GET /recipes/product/:productId
```

**Product Service (src/modules/products/services/productService.ts):**

```typescript
// Endpoints
GET /products
POST /products
PUT /products/:id
DELETE /products/:id
```

**Inventory Service (src/modules/inventory/services/inventoryService.ts):**

```typescript
// Endpoints
GET /inventory
POST /inventory
PATCH /inventory/:id
DELETE /inventory/:id
```

**Menu Service (src/modules/menus/services/menuService.ts):**

```typescript
// Endpoints
GET /menus
GET /menus/:id
POST /menus
PUT /menus/:id
DELETE /menus/:id
```

---

## 2. Arquitectura Encontrada

### 2.1 Mapa de Relaciones Actuales

**Relaciones verificadas en el código:**

```
Recipe
│
├── Product (1:1 obligatorio)
│   └── Menu (1:N opcional)
│       └── MenuCategory (1:N)
│           └── MenuProduct (1:N)
│
├── Ingredients (1:N)
│   └── InventoryItem (1:1)
│       ├── Stock
│       ├── Cost
│       ├── Unit
│       ├── Supplier
│       ├── Location
│       └── usedInRecipes (computed)
│
├── Steps (1:N opcional)
│
├── Method (opcional)
│
├── Category (string)
│
└── totalCost (computed)
```

**Relaciones clave:**

1. **Recipe ← Product (1:1 obligatorio)**
   - Recipe tiene un campo `product` con `_id` y `name`
   - Product tiene campos opcionales `hasRecipe`, `recipeId`, `recipe`
   - **Pregunta:** ¿Puede existir un producto sin receta? Sí, según el tipo Product.
   - **Pregunta:** ¿Puede existir una receta sin producto? No, según el tipo Recipe.

2. **Recipe ← Ingredients (1:N)**
   - Recipe tiene un array de `ingredients`
   - Cada ingrediente tiene un `inventoryItem` con `_id` y `name`
   - **Pregunta:** ¿Se reutilizan ingredientes? Sí, múltiples recetas pueden usar el mismo inventoryItem.

3. **Ingredients ← InventoryItem (1:1)**
   - Ingredient referencia a InventoryItem por `_id`
   - InventoryItem tiene campos de stock, cost, unit, supplier, location
   - **Pregunta:** ¿La receta mantiene copias de esos datos? No, solo referencia.

4. **Product ← Menu (1:N opcional)**
   - Product tiene un array `menuIds`
   - Menu tiene categorías que contienen productos
   - **Pregunta:** ¿Puede existir un producto sin menú? Sí.

5. **InventoryItem ← usedInRecipes (computed)**
   - InventoryItem tiene un array `usedInRecipes` calculado por el backend
   - Contiene información sobre qué recetas usan el ítem

---

### 2.2 Flujo de Datos Actual

**Flujo documentado (basado en el código):**

```
Inventario (InventoryItem)
↓
Ingrediente (RecipeIngredient)
↓
Receta (Recipe)
↓
Producto (Product)
↓
Menú (Menu)
↓
Venta (no analizado en frontend)
↓
Descuento de Inventario (no analizado en frontend)
```

**Flujo de creación de receta:**

1. Usuario selecciona un producto existente
2. Usuario selecciona ingredientes del inventario
3. Usuario define cantidades y unidades
4. Usuario agrega pasos opcionales
5. Usuario define método opcional
6. Sistema calcula costo total de ingredientes
7. Sistema guarda receta

**Flujo de cálculo de costos:**

1. RecipeForm calcula costo total de ingredientes
2. Convierte unidades (ml ↔ l, g ↔ kg)
3. Multiplica cantidad por costo unitario del inventario
4. Suma todos los ingredientes
5. Muestra costo total en UI

---

### 2.3 Integración con Inventario

**Verificación de integración:**

- **Stock:** RecipeExpandedPanel muestra stock disponible vs requerido
- **Unidad:** RecipeIngredient tiene campo `unit` independiente de InventoryItem
- **Precio:** RecipeIngredient usa `cost` de InventoryItem para cálculos
- **Proveedor:** InventoryItem tiene campo `supplier`, pero Recipe no lo referencia
- **Lote:** InventoryItem no tiene campo de lote en el tipo principal (solo en InventoryLot)
- **Caducidad:** InventoryItem no tiene campo de caducidad (solo en InventoryLot)

**Comportamiento:**
- La receta NO mantiene copias de datos del inventario
- La receta referencia al InventoryItem por `_id`
- El frontend calcula costos en tiempo real usando datos del inventario
- El frontend verifica disponibilidad de stock en RecipeExpandedPanel

---

### 2.4 Integración con Productos

**Verificación de integración:**

- **¿Puede existir producto sin receta?** Sí, según el tipo Product (`hasRecipe?: boolean`, `recipeId?: string`)
- **¿Puede existir receta sin producto?** No, según el tipo Recipe (`product` es obligatorio)
- **¿Relación 1:1?** Sí, Recipe tiene un solo `product`
- **¿Relación 1:N?** No, Recipe no puede tener múltiples productos
- **¿Reutilización de recetas?** No, cada receta está asociada a un solo producto

**Comportamiento:**
- RecipeForm requiere seleccionar un producto
- Product puede tener una receta asociada (opcional)
- No hay reutilización de recetas entre productos

---

## 3. Problemas Detectados

### 3.1 Duplicaciones

**Duplicación de lógica:**
- Cálculo de costos en RecipeForm (líneas 136-159)
- Cálculo de costos en RecipeCostCalculator (líneas 426-432)
- Cálculo de costos en RecipeExpandedPanel (líneas 32-35)

**Duplicación de datos:**
- Product tiene `cost` y Recipe tiene `totalCost`
- Product tiene `type` y Recipe tiene `type`
- Product tiene `drinkStyle` y Recipe tiene `drinkStyle`

**Campos redundantes:**
- Product `hasRecipe`, `recipeId`, `recipe` (redundantes)
- Recipe `totalCost` (puede calcularse en tiempo real)

---

### 3.2 Inconsistencias

**Inconsistencias de tipos:**
- RecipeIngredient usa `unit` independiente de InventoryItem
- Conversión de unidades se hace en frontend (RecipeForm)
- No hay validación de consistencia de unidades

**Inconsistencias de cálculo:**
- Cálculo de costos se hace en frontend
- No hay validación de que el cálculo del backend coincida
- `totalCost` en Recipe puede estar desactualizado

---

### 3.3 Dependencias

**Dependencias circulares:**
- No detectadas en el frontend

**Dependencias fuertes:**
- Recipe depende de Product (obligatorio)
- Recipe depende de InventoryItem (a través de ingredients)
- Product depende de Recipe (opcional)

**Consultas innecesarias:**
- RecipeForm carga todos los productos y todo el inventario
- No hay paginación ni lazy loading

---

### 3.4 Limitaciones

**Limitaciones funcionales:**
- No hay reutilización de recetas
- No hay variantes de recetas
- No hay historial de versiones de recetas
- No hay validación de disponibilidad de stock al crear receta
- No hay alertas de ingredientes faltantes
- No hay sugerencias de sustituciones

**Limitaciones de UX:**
- RecipeForm es complejo (3 columnas)
- No hay wizard paso a paso
- No hay vista previa en tiempo real
- No hay validación visual de costos
- No hay comparación de recetas

---

### 3.5 Problemas de Arquitectura

**Problemas de arquitectura:**
- Recipe no es el núcleo del sistema, Product sí
- No hay separación clara entre receta y producto
- Cálculo de costos se hace en frontend
- No hay validación de consistencia de datos
- No hay normalización de unidades

**Problemas de escalabilidad:**
- Carga completa de inventario en RecipeForm
- No hay memoización de cálculos
- No hay caché de recetas
- No hay optimización de renders

---

## 4. Componentes Reutilizables

### 4.1 Componentes Actuales

**Componentes del módulo de recetas:**
- `RecipeCard`: Tarjeta de receta con información básica ✅ Reutilizable
- `RecipeDetailModal`: Modal de detalle de receta ✅ Reutilizable
- `RecipeExpandedPanel`: Panel expandido con ingredientes y costos ✅ Reutilizable
- `RecipeForm`: Formulario completo de receta ⚠️ Necesita refactorización
- `VariantSelector`: Selector de variantes ✅ Reutilizable

**Componentes de módulos relacionados:**
- `ProductCard`: Tarjeta de producto ✅ Reutilizable
- `InventoryCard`: Tarjeta de inventario ✅ Reutilizable
- `MenuCard`: Tarjeta de menú ✅ Reutilizable

---

### 4.2 Componentes a Mantener

**Componentes recomendados para mantener:**
- `RecipeCard` (con mejoras de diseño)
- `RecipeDetailModal` (con mejoras de diseño)
- `RecipeExpandedPanel` (con mejoras de diseño)
- `VariantSelector` (sin cambios)

---

## 5. Componentes a Reemplazar

### 5.1 Componentes a Rediseñar

**RecipeForm:**
- **Problema:** Muy complejo (3 columnas), no wizard, no validación visual
- **Recomendación:** Rediseñar como wizard paso a paso
- **Componentes a crear:**
  - `RecipeWizard` (wizard principal)
  - `RecipeProductSelector` (selector de producto)
  - `RecipeIngredientBuilder` (constructor de ingredientes)
  - `RecipeMethodEditor` (editor de método)
  - `RecipeStepBuilder` (constructor de pasos)
  - `RecipeCostCalculator` (calculadora de costos)
  - `RecipePreview` (vista previa)

**RecipesPage:**
- **Problema:** Layout tradicional, no dashboard, no analytics
- **Recomendación:** Rediseñar como Recipe Workspace
- **Componentes a crear:**
  - `RecipeWorkspace` (workspace principal)
  - `RecipeLibrary` (biblioteca de recetas)
  - `RecipeFilters` (filtros avanzados)
  - `RecipeStats` (estadísticas)
  - `RecipeHeader` (header de recetas)

---

### 5.2 Componentes a Eliminar

**Componentes obsoletos:**
- Ninguno detectado

**Componentes duplicados:**
- Cálculo de costos en múltiples componentes (consolidar en un solo hook)

---

## 6. Arquitectura Propuesta

### 6.1 Arquitectura Objetivo

**Nueva arquitectura con Recipe como núcleo:**

```
Inventario (InventoryItem)
↓
Ingredientes (Ingredient)
↓
Receta (Recipe)
↓
Producto (Product)
↓
POS
↓
Ventas
↓
Analytics
```

**Principios:**
- Recipe es el núcleo gastronómico
- Product es una presentación de Recipe
- InventoryItem es la fuente de verdad para stock y costos
- Cálculos se hacen en backend
- Frontend solo presenta datos

---

### 6.2 Nuevo Modelo de Datos

**Recipe (propuesto):**

```typescript
export interface Recipe {
  _id?: string;
  
  // Identidad
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  image?: string;
  imagePublicId?: string;
  
  // Tipo
  type: "drink" | "food";
  drinkStyle?: "author" | "classic";
  
  // Ingredientes (núcleo)
  ingredients: RecipeIngredient[];
  
  // Preparación
  method?: string;
  steps?: RecipeStep[];
  preparationTime?: number;
  difficulty?: "easy" | "medium" | "hard";
  
  // Costos (calculados por backend)
  totalCost?: number;
  costPerPortion?: number;
  margin?: number;
  
  // Productos asociados (1:N)
  productIds?: string[];
  
  // Estado
  isActive?: boolean;
  isPublic?: boolean;
  
  // Versionado
  version?: number;
  parentRecipeId?: string;
  
  // Metadata
  tags?: string[];
  dietaryRestrictions?: string[];
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RecipeIngredient {
  inventoryItemId: string;
  quantity: number;
  unit: "ml" | "l" | "g" | "kg" | "unit" | "oz" | "portion";
  order?: number;
  isOptional?: boolean;
  substitutionId?: string;
}
```

**Product (propuesto):**

```typescript
export interface Product {
  _id?: string;
  
  // Identidad
  name: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  
  // Receta asociada (1:1 o 1:N)
  recipeId?: string;
  recipe?: Recipe;
  
  // Presentación
  price: number;
  dynamicPrice?: number;
  available: boolean;
  featured: boolean;
  
  // Categorización
  category: string;
  subcategory?: string;
  type: "drink" | "food";
  
  // Metadata
  tags?: string[];
  dietaryRestrictions?: string[];
  preparationTime?: number;
  
  // Menús
  menuIds?: string[];
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
```

---

### 6.3 Nuevo Flujo de Datos

**Flujo propuesto:**

```
Inventario (InventoryItem)
↓
Ingredientes (RecipeIngredient)
↓
Receta (Recipe)
↓
Producto (Product) [opcional]
↓
Menú (Menu) [opcional]
↓
POS
↓
Ventas
↓
Descuento de Inventario (backend)
↓
Analytics
```

**Flujo de creación de receta:**

1. Usuario crea receta sin producto asociado
2. Usuario selecciona ingredientes del inventario
3. Usuario define cantidades y unidades
4. Usuario agrega pasos y método
5. Backend calcula costos
6. Usuario puede asociar productos a la receta
7. Usuario puede publicar receta en menús

**Flujo de cálculo de costos:**

1. Backend calcula costo total de ingredientes
2. Backend convierte unidades automáticamente
3. Backend calcula costo por porción
4. Backend calcula margen basado en precio de producto
5. Frontend solo presenta datos calculados

---

## 7. Roadmap Validado

### 7.1 Preparación para Fases Posteriores

**Fase 2: Recipe Workspace Redesign**
- Recipe Workspace con dashboard
- Recipe Library con filtros avanzados
- Recipe Wizard paso a paso
- Recipe Preview en tiempo real

**Fase 3: Smart Formula Builder**
- Constructor inteligente de ingredientes
- Sugerencias de sustituciones
- Validación de disponibilidad de stock
- Alertas de ingredientes faltantes

**Fase 4: Recipe Library & Grimorio**
- Biblioteca de recetas con categorías
- Grimorio digital con búsqueda
- Comparación de recetas
- Historial de versiones

**Fase 5: Integración completa con Inventario y Productos**
- Integración real-time con inventario
- Descuento automático de stock
- Alertas de stock bajo
- Sugerencias de reabastecimiento

**Fase 6: Analytics & Formula Intelligence**
- Analytics de recetas
- Fórmulas inteligentes
- Predicción de consumo
- Optimización de costos

**Fase 7: Nebula UI/UX Final Pass**
- Diseño Nebula completo
- Animaciones y transiciones
- Accesibilidad
- Responsive design

---

## 8. Validación Final

### 8.1 Checklist de Validación

- ✅ Se analizó todo el sistema de recetas en frontend
- ✅ Se documentaron las relaciones reales entre recetas, productos, inventario y menús
- ✅ Se identificaron duplicaciones, dependencias y oportunidades de simplificación
- ✅ Se elaboró una arquitectura objetivo con la receta como núcleo del sistema
- ✅ No se modificó la lógica de negocio existente durante esta fase
- ✅ El informe resultante servirá como base para las siguientes fases de rediseño e integración

---

## 9. Conclusiones

### 9.1 Estado Actual

El sistema de recetas actual funciona pero presenta limitaciones arquitectónicas significativas. La receta no es el núcleo del sistema, sino que está subordinada al producto. Los cálculos de costos se hacen en frontend, lo que puede causar inconsistencias. No hay reutilización de recetas ni variantes.

### 9.2 Recomendaciones

**Prioridad alta:**
- Mover cálculos de costos al backend
- Separar receta de producto (receta como núcleo)
- Implementar reutilización de recetas
- Agregar validación de disponibilidad de stock

**Prioridad media:**
- Implementar wizard paso a paso para creación de recetas
- Agregar historial de versiones de recetas
- Implementar alertas de ingredientes faltantes
- Agregar sugerencias de sustituciones

**Prioridad baja:**
- Implementar analytics de recetas
- Agregar predicción de consumo
- Implementar optimización de costos
- Agregar inteligencia de fórmulas

---

## 10. Próximos Pasos

1. Aprobar auditoría y arquitectura propuesta
2. Comenzar Fase 2: Recipe Workspace Redesign
3. Seguir fases en orden de prioridad
4. Validar y documentar cada fase
5. Finalizar migración

---

**Estado de la auditoría:** ✅ Completado
