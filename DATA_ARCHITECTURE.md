# DATA ARCHITECTURE - Bartender System

## 1. Executive Summary

El sistema bartender-system sigue una arquitectura de tres capas con separación clara de responsabilidades:

- **Backend**: Fuente única de verdad para lógica de negocio, persistencia y estado
- **Desktop App**: Herramienta de operación interna que modifica datos vía API
- **Client Web**: Interfaz de clientes que consume datos públicos y crea transacciones

La regla fundamental es: **El backend es la autoridad sobre la lógica y el estado de negocio.**

---

## 2. Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MONGODB                             │
│                  Persistencia de estado                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers (32 endpoints)                     │  │
│  │  Services (Business Logic)                        │  │
│  │  Models (Mongoose Schemas)                      │  │
│  │  Socket.IO (Real-time Events)                     │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                       │                                     │
│         ┌─────────────┴─────────────┐                   │
│         │                           │                   │
│    REST  API                      Socket.IO               │
│         │                           │                   │
└─────────┼───────────────────────────┼───────────────────┘
          │                           │
┌─────────▼───────────┐   ┌───────▼───────────┐
│   CLIENTE WEB        │   │   DESKTOP APP     │
│   (Next.js)          │   │   (Electron)       │
│                      │   │                    │
│  - Explore          │   │  - Admin operations│
│  - Create orders    │   │  - Manage orders   │
│  - Create reservations│  │  - Manage tables   │
│  - Cart (local)     │   │  - Socket.IO client │
└──────────────────────┘   └────────────────────┘
```

---

## 3. System Responsibilities

### 3.1 Backend

**Fuente única de verdad para:**
- Productos reales
- Precios
- Disponibilidad
- Promociones
- Descuentos
- Pedidos
- Reservas
- Mesas
- Sesiones
- Usuarios
- Permisos
- Estados
- Reglas de negocio
- Validaciones
- Cálculos finales
- Persistencia
- Eventos realtime

**NO:**
- Estado UI del cliente
- Carrito local temporal
- Estado de navegación
- Filtros de búsqueda activos

### 3.2 Bartender Desktop

**Responsable de:**
- Administrar productos
- Administrar menús
- Gestionar pedidos
- Gestionar reservas
- Gestionar mesas
- Actualizar estados
- Operaciones del personal
- Visualizar información operativa

**PERO:**
- Desktop NO es la fuente de verdad
- Toda modificación pasa por API
- No accede directamente a MongoDB

### 3.3 Cliente Web

**Responsable de:**
- Mostrar información
- Permitir explorar
- Crear pedidos
- Crear reservas
- Gestionar carrito local
- Mostrar estado del pedido
- Autenticación del cliente
- Interacción UX

**NO debe decidir:**
- Precio final
- Descuento real
- Disponibilidad real
- Estado final del pedido

---

## 4. Data Flow Principles

### 4.1 Master Data Flow

```
Desktop Admin
    ↓
API (POST/PUT/DELETE)
    ↓
Backend Validation
    ↓
Business Rules
    ↓
MongoDB
    ↓
Socket.IO Events
    ↓
Desktop & Web
```

### 4.2 Transaction Data Flow

```
Client Web
    ↓
API (POST)
    ↓
Backend Validation
    ↓
Business Rules
    ↓
MongoDB
    ↓
Socket.IO Events
    ↓
Desktop Notification
```

### 4.3 Session Data Flow

```
Client
    ↓
Local Storage (Cart)
    ↓
Checkout
    ↓
API (POST)
    ↓
Backend → Order
    ↓
MongoDB
```

---

## 5. Entity Classification

### 5.1 Master Data

Datos administrados por el sistema, relativamente estáticos:

- **Product**: Productos del menú
- **Menu**: Estructura del menú
- **Category**: Categorías dentro de menús
- **Table**: Mesas del restaurante
- **Promotion**: Promociones y descuentos

### 5.2 Transaction Data

Datos generados por acciones transaccionales:

- **Order**: Pedidos de clientes
- **Reservation**: Reservas de mesas
- **Payment**: Pagos asociados

### 5.3 Session Data

Datos temporales, no persistentes:

- **TableSession**: Sesión activa de una mesa
- **Cart**: Carrito local del cliente
- **CustomerSession**: Sesión del cliente web

### 5.4 Derived Data

Datos calculados en tiempo real:

- **finalPrice**: Precio con promociones aplicadas
- **discountTotal**: Total de descuentos
- **orderTotal**: Total final del pedido
- **availability**: Disponibilidad real considerando inventario
- **estimatedPreparationTime**: Tiempo estimado de preparación

### 5.5 Presentation Data

Datos específicos de UI, no afectan negocio:

- **isFavorite**: Producto favorito del cliente
- **isExpanded**: Elemento UI expandido
- **activeCategory**: Categoría seleccionada
- **isCartOpen**: Estado del drawer del carrito

---

## 6. Data Ownership Rules

### 6.1 Write Authority

| Entidad       | Backend | Desktop | Client |
| ------------ | ------- | ------- | ------ |
| Product       | ✓       | ✓*     | ✗     |
| Menu          | ✓       | ✓*     | ✗     |
| Category      | ✓       | ✓*     | ✗     |
| Table         | ✓       | ✓*     | ✗     |
| Promotion     | ✓       | ✓*     | ✗     |
| Order         | ✓       | ✓*     | ✓     |
| Reservation   | ✓       | ✓*     | ✓     |
| Cart          | ✗       | ✗     | ✓     |
| UI State      | ✗       | ✗     | ✓     |

*Desktop modifica vía API, no directamente

### 6.2 Read Authority

| Entidad       | Backend | Desktop | Client |
| ------------ | ------- | ------- | ------ |
| Product       | ✓       | ✓      | ✓     |
| Menu          | ✓       | ✓      | ✓     |
| Category      | ✓       | ✓      | ✓     |
| Table         | ✓       | ✓      | ✓     |
| Promotion     | ✓       | ✓      | ✓     |
| Order         | ✓       | ✓      | ✓*    |
| Reservation   | ✓       | ✓      | ✓*    |
| Cart          | ✗       | ✗      | ✓     |
| UI State      | ✗       | ✗      | ✓     |

*Client solo lee sus propias transacciones

---

## 7. Model vs DTO Separation

### 7.1 Current Problem

Actualmente el frontend recibe directamente modelos de Mongoose, lo que:

- Expone detalles internos de implementación
- Acopla frontend a cambios de esquema
- Envía más datos de los necesarios
- Hace difícil evolucionar el backend

### 7.2 Target Architecture

```
Mongo Model
      ↓
Backend Service
      ↓
Mapper
      ↓
DTO
      ↓
API
      ↓
Frontend Type
```

### 7.3 Example: Product

**Mongo Model** (30+ campos):
```javascript
{
  _id, name, description, price, cost,
  category, type, drinkStyle, subcategory,
  recipeId, preparationTime,
  available, autoAvailable, featured,
  image, imagePublicId, gallery,
  tags, dietaryRestrictions,
  menuIds, stockImpact, isAlcohol,
  isActiveForPOS, createdAt, updatedAt
}
```

**Public DTO** (10 campos):
```typescript
{
  id: string
  name: string
  description: string
  price: number
  dynamicPrice: number
  image: string
  type: "drink" | "food"
  available: boolean
  featured: boolean
  category: string
}
```

---

## 8. ID Convention

### 8.1 External IDs

Externamente (API, frontend, desktop):

```typescript
id: string
```

### 8.2 Internal IDs

Internamente (MongoDB):

```javascript
_id: ObjectId
```

### 8.3 Relationship IDs

Todas las relaciones usan:

```typescript
productId: string
menuId: string
tableId: string
orderId: string
reservationId: string
userId: string
sessionId: string
```

### 8.4 Convention

**NEVER mezclar** para el mismo propósito:
- ❌ `_id` vs `id` vs `product` vs `productId`
- ✓ `productId` consistently

---

## 9. Money Representation

### 9.1 Backend

Todos los valores monetarios son:

```javascript
price: Number
cost: Number
total: Number
discountTotal: Number
```

### 9.2 API Response

La API SIEMPRE envía valores numéricos:

```json
{
  "price": 8500,
  "total": 12500
}
```

### 9.3 Frontend

El frontend es responsable de:
- Recibir valor numérico
- Transformar a formato local
- Aplicar símbolo de moneda

```typescript
8500 → "$8.500"
```

**NUNCA al revés.**

---

## 10. State Definitions

### 10.1 Order Status

```typescript
enum OrderStatus {
  PENDING = "pending"
  IN_PROGRESS = "in-progress"
  COMPLETED = "completed"
  CANCELLED = "cancelled"
}
```

### 10.2 OrderItem Status

```typescript
enum OrderItemStatus {
  PENDING = "pending"
  PREPARING = "preparing"
  READY = "ready"
  SERVED = "served"
  CANCELLED = "cancelled"
}
```

### 10.3 Reservation Status

```typescript
enum ReservationStatus {
  PENDING = "pending"
  CONFIRMED = "confirmed"
  SEATED = "seated"
  COMPLETED = "completed"
  CANCELLED = "cancelled"
  NO_SHOW = "no-show"
}
```

### 10.4 Table Status

```typescript
enum TableStatus {
  AVAILABLE = "available"
  RESERVED = "reserved"
  OCCUPIED = "occupied"
  MAINTENANCE = "maintenance"
}
```

### 10.5 Payment Status

```typescript
enum PaymentStatus {
  UNPAID = "unpaid"
  PARTIAL = "partial"
  PAID = "paid"
  REFUNDED = "refunded"
}
```

---

## 11. Derived Data Rules

### 11.1 Backend Calculations

**Backend debe calcular:**
- `subtotal`: Suma de items
- `discountTotal`: Total de descuentos aplicados
- `total`: subtotal - discountTotal
- `finalPrice`: Precio con promociones
- `availability`: Disponibilidad real considerando inventario
- `reservation availability`: Disponibilidad de mesas

### 11.2 Frontend Calculations

**Frontend puede calcular:**
- `cart item count`: Cantidad de items en carrito
- `isCartOpen`: Estado del drawer
- `formattedPrice`: Display de precio en formato local
- `filteredProducts`: Resultados de filtros de búsqueda
- `searchResults`: Resultados de búsqueda
- `visual sorting`: Ordenamiento visual de UI

### 11.3 Rule

> Si afecta dinero, disponibilidad, permisos o estado de negocio → backend.

---

## 12. Cart Definition

### 12.1 Concept

El carrito es TEMPORAL y diferente de un pedido:

```
Cliente
  ↓
Cart (local)
  ↓
Checkout
  ↓
Order (persistente)
```

### 12.2 Cart Data

```typescript
interface CartLine {
  productId: string
  name: string
  quantity: number
  notes: string
  price: number  // ← CRITICAL para cálculo de total
}
```

### 12.3 Cart Behavior

- El backend NO depende de que el carrito local sea correcto
- Cuando llega `POST /orders`, el backend valida todo
- El backend puede rechazar items incorrectos, productos no disponibles, etc.

---

## 13. Promotion Architecture

### 13.1 Current Problem

Actualmente el frontend espera campos en productos que no existen:

```typescript
product.promotion
product.discount
product.discountPrice
```

### 13.2 Target Architecture

```
Promotion (entity)
  ↓
Business Rules
  ↓
Product/Menu pricing
  ↓
Public pricing response
```

### 13.3 Promotion Types

```typescript
enum PromotionType {
  PERCENT = "PERCENT"
  FLAT = "FLAT"
  TWO_FOR_ONE = "2X1"
  CUSTOM = "CUSTOM"
}
```

### 13.4 Promotion Application

Las promociones se aplican en el backend al crear el pedido, no en el frontend.

---

## 14. Availability Architecture

### 14.1 Availability Layers

```
Product active
  ↓
Product available
  ↓
Inventory available
  ↓
Menu available
  ↓
Public response
```

### 14.2 Availability Flags

- `isActiveForPOS`: Producto activo para POS
- `available`: Producto disponible en menú
- `autoAvailable`: Disponibilidad automática basada en inventario
- `stockImpact`: Si el producto afecta inventario

### 14.3 Menu Availability

Los menús pueden anular disponibilidad de productos individuales:

```javascript
menuProduct.available = false  // Override específico
```

---

## 15. Table Session Architecture

### 15.1 Distinction

```
Table ≠ TableSession ≠ Order
```

### 15.2 Relationship

```javascript
Table
  id: "table_12"
  number: 12
  status: "available"

TableSession
  id: "session_abc123"
  tableId: "table_12"
  status: "open"
  openedAt: Date

Order
  id: "order_xyz789"
  sessionId: "session_abc123"
  tableId: "table_12"
  status: "pending"
```

### 15.3 Session Lifecycle

```
Table available
  ↓
Session opened (POST /tables/:id/open)
  ↓
Orders created
  ↓
Session closed (POST /tables/:id/close)
  ↓
Table available again
```

---

## 16. Authentication Architecture

### 16.1 Token Types

```typescript
interface AccessToken {
  token: string
  expires: Date
}

interface RefreshToken {
  token: string
  expires: Date
}
```

### 16.2 User Data Sent to Client

```typescript
interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}
```

**NO enviar**: todo el modelo User completo

### 16.3 Token Storage

- **Web Client**: localStorage
- **Desktop**: localStorage
- **Refresh**: Automático en 401

---

## 17. Error Contract

### 17.1 Error Structure

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_UNAVAILABLE",
    "message": "El producto ya no está disponible."
  }
}
```

### 17.2 Error Codes

```typescript
enum ErrorCode {
  // Auth
  AUTH_REQUIRED = "AUTH_REQUIRED"
  AUTH_EXPIRED = "AUTH_EXPIRED"
  AUTH_INVALID = "AUTH_INVALID"
  
  // Products
  PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND"
  PRODUCT_UNAVAILABLE = "PRODUCT_UNAVAILABLE"
  PRODUCT_OUT_OF_STOCK = "PRODUCT_OUT_OF_STOCK"
  
  // Orders
  ORDER_INVALID = "ORDER_INVALID"
  ORDER_NOT_FOUND = "ORDER_NOT_FOUND"
  ORDER_CANNOT_MODIFY = "ORDER_CANNOT_MODIFY"
  
  // Tables
  TABLE_NOT_FOUND = "TABLE_NOT_FOUND"
  TABLE_NOT_AVAILABLE = "TABLE_NOT_AVAILABLE"
  TABLE_ALREADY_OCCUPIED = "TABLE_ALREADY_OCCUPIED"
  
  // Reservations
  RESERVATION_UNAVAILABLE = "RESERVATION_UNAVAILABLE"
  RESERVATION_CONFLICT = "RESERVATION_CONFLICT"
  RESERVATION_NOT_FOUND = "RESERVATION_NOT_FOUND"
  
  // Promotions
  PROMOTION_EXPIRED = "PROMOTION_EXPIRED"
  PROMOTION_NOT_APPLICABLE = "PROMOTION_NOT_APPLICABLE"
  
  // Validation
  INVALID_QUANTITY = "INVALID_QUANTITY"
  INVALID_EMAIL = "INVALID_EMAIL"
  INVALID_PHONE = "INVALID_PHONE"
  INVALID_DATE = "INVALID_DATE"
  
  // General
  VALIDATION_ERROR = "VALIDATION_ERROR"
  SERVER_ERROR = "SERVER_ERROR"
  NETWORK_ERROR = "NETWORK_ERROR"
}
```

---

## 18. API Envelope

### 18.1 Standard Response

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
  }
}
```

### 18.2 Paginated Response

```typescript
interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

### 18.3 Response Fields

- `success`: Si la operación fue exitosa
- `data`: Datos de respuesta (si aplica)
- `message`: Mensaje informativo (opcional)
- `error`: Detalles de error (si aplica)
- `pagination`: Metadatos de paginación (si aplica)

---

## 19. Realtime Contract

### 19.1 Required Events

**Orders:**
- `order:created`
- `order:updated`
- `order:status`

**Reservations:**
- `reservation:created`
- `reservation:updated`
- `reservation:cancelled`

**Tables:**
- `table:updated`
- `table:availability`

**Menu:**
- `menu:updated`
- `product:availability`

### 19.2 Event Structure

```typescript
interface SocketEvent {
  event: string
  payload: any
  recipient: string[] // rooms/namespaces
  purpose: string
}
```

### 19.3 Current Gap

- **Desktop**: Socket.IO completo ✓
- **Client Web**: Solo Socket.IO para ruleta ❌
- **Target**: Cliente web también debe conectarse para pedidos

---

## 20. Security Principles

### 20.1 Platform Headers

Cada cliente debe enviar:

```typescript
X-Platform: "web" | "desktop"
X-Client-Version: "1.0.0"
```

### 20.2 Token Validation

- Access tokens expiran
- Refresh tokens rotan
- 401 → intento de refresh automático
- 401 en refresh → logout forzado

### 20.3 Rate Limiting

- Rutas públicas tienen rate limiting
- Rutas privadas requieren auth válido
- Validación de roles en rutas de admin

---

## 21. Caching Strategy

### 21.1 Backend Caching

- **Menu Cache**: Memoria para menús públicos
- **Redis**: Cache distribuido (si está configurado)
- **TTL**: Menús cacheados por 5 minutos

### 21.2 Frontend Caching

- **React Query**: No implementado aún
- **Polling**: Carta cada 5 minutos
- **Socket.IO**: Desktop usa para realtime, web no

### 21.3 Target State

- Implementar React Query o SWR para frontend
- Reducir polling innecesario
- Implementar Socket.IO en web cliente

---

## 22. Deployment Architecture

### 22.1 Backend

- **Platform**: Node.js con Express 5
- **Database**: MongoDB
- **Realtime**: Socket.IO
- **Hosting**: Configurable (actualmente Render.com)

### 22.2 Desktop

- **Platform**: Electron 41
- **Frontend**: React 19 + Vite 8
- **Build**: Electron forge (en el futuro)
- **API**: Llama a backend remoto

### 22.3 Web Client

- **Platform**: Next.js 16
- **Runtime**: Vercel (ideal) o equivalente
- **SSR**: Compatible con Next.js SSR
- **API**: Llama a backend remoto

---

## 23. Data Consistency Rules

### 23.1 Single Source of Truth

```text
✓ MongoDB es la única fuente de persistencia
✓ Backend es la única autoridad de lógica de negocio
✓ Frontend confía en backend para estado real
✓ Desktop modifica vía API, no directamente
```

### 23.2 Eventual Consistency

```text
✓ Todos los cambios de estado van por backend
✓ Socket.IO notifica cambios a interesados
✓ Frontend no asume estado local sincronizado
✓ Polling es fallback, no método principal
```

### 23.3 Validation Rules

```text
✓ Backend valida toda entrada de datos
✓ Frontend puede validar UX pero no confía en ella
✓ Reglas de negocio están en backend
✓ Descuentos se calculan en backend
```

---

## 24. Mobile App Considerations

### 24.1 Shared Contracts

La futura app móvil debe usar los mismos:
- Public DTOs
- API endpoints
- Realtime events
- Error codes
- Authentication flow

### 24.2 Platform-Specific

Cada plataforma maneja:
- Local storage
- Push notifications
- Background sync
- Native navigation

Pero debe usar los mismos datos base.

---

## 25. Migration Path

### 25.1 Current State

- Backend: Modelos expuestos directamente
- Frontend: Types incompletos
- Desktop: Funcional, usa Socket.IO
- Web: Funcional pero con gaps

### 25.2 Target State

- Backend: DTOs públicos separados
- Frontend: Types completos
- Desktop: Continúa usando API
- Web: Agrega Socket.IO, DTOs completos

### 25.3 Migration Strategy

1. Definir DTOs en backend
2. Crear mappers en controllers
3. Actualizar endpoints para usar DTOs
4. Actualizar types en frontend
5. Implementar Socket.IO en web cliente
6. Validar integración desktop
7. Validar integración web

---

## 26. Monitoring & Observability

### 26.1 Backend

- Winston logger
- Socket.IO events en `/tracking` namespace
- Performance tracking

### 26.2 Frontend

- **Actual**: Error handling básico
- **Target**: Error tracking específico
- **Target**: Analytics de usuario

### 26.3 Desktop

- Socket.IO events para analytics
- Performance tracking integrado

---

## 27. Testing Strategy

### 27.1 Backend

- Unit tests para controllers
- Integration tests para API endpoints
- Tests de contratos DTO

### 27.2 Frontend

- Unit tests para componentes
- Integration tests para API client
- E2E tests para flujos críticos

### 27.3 Contract Testing

- Validar que DTOs coinciden con contratos
- Validar que enums coinciden
- Validar que error codes son consistentes

---

## 28. Documentation Requirements

### 28.1 API Documentation

- Generar OpenAPI/Swagger desde backend
- Documentar todos los endpoints públicos
- Documentar estructura de request/response

### 28.2 Type Documentation

- Documentar todos los DTOs públicos
- Documentar enums y constantes
- Documentar reglas de negocio

### 28.3 Realtime Documentation

- Documentar todos los eventos Socket.IO
- Documentar payloads de eventos
- Documentar rooms y namespaces

---

## 29. Rollback Strategy

### 29.1 Backend Changes

- DTOs son aditivos, no reemplazan modelos
- Mappers pueden revertirse
- Endpoints antiguos pueden coexistir con nuevos

### 29.2 Frontend Changes

- Types nuevos no rompen compatibilidad
- Mappers de respuesta pueden mantenerse
- Deprecación gradual de contratos viejos

### 29.3 Desktop Changes

- Desktop usa API, adaptación automática
- Socket.IO events son aditivos, no breaking

---

## 30. Success Criteria

La Fase 0 se considera completa cuando:

✓ **DATA_ARCHITECTURE.md** - Documento de arquitectura general
✓ **ENTITY_OWNERSHIP.md** - Matriz de autoridad por entidad
✓ **PUBLIC_API_CONTRACT.md** - Contratos públicos específicos
✓ **DATA_TYPES_SPEC.md** - Tipos, IDs, enums, dinero, fechas
✓ **REALTIME_CONTRACT.md** - Eventos Socket.IO y payloads
✓ **CURRENT_VS_TARGET.md** - Diferencias entre actual y objetivo

Y cuando podamos responder claramente:

✓ ¿Quién es la fuente de verdad? (Backend)
✓ ¿Quién puede modificar cada entidad? (Definido)
✓ ¿Qué datos recibe el cliente? (DTOs públicos)
✓ ¿Qué datos NO debería recibir? (Detalles internos)
✓ ¿Qué datos calcula backend? (Cálculos de negocio)
✓ ¿Qué datos calcula frontend? (Cálculos de presentación)
✓ ¿Cómo se representan los IDs? (Strings consistentes)
✓ ¿Cómo se representan los precios? (Números numéricos)
✓ ¿Cuáles son los estados válidos? (Enums definidos)
✓ ¿Cómo se representan errores? (Contrato estándar)
✓ ¿Qué endpoints necesita realmente el cliente? (Públicos)
✓ ¿Qué eventos realtime necesita? (Definidos)
✓ ¿Qué datos pertenecen al carrito? (Temporal local)
✓ ¿Qué datos pertenecen al pedido? (Persistente backend)
✓ ¿Cómo se relacionan mesa, sesión y pedido? (Definido)