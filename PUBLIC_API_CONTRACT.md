# PUBLIC API CONTRACT - Bartender System

## 1. API Envelope

### 1.1 Standard Response

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

### 1.2 Paginated Response

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

### 1.3 Error Response

```typescript
interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}
```

---

## 2. Public Endpoints

### 2.1 Products

#### GET /api/products

**Purpose:** List public products

**Auth:** Not required

**Query Parameters:**
```typescript
interface GetProductsParams {
  type?: "drink" | "food"
  available?: boolean
  isActiveForPOS?: boolean
  search?: string
  category?: string
  featured?: boolean
}
```

**Response:**
```typescript
interface ProductPublicDTO {
  id: string
  name: string
  description: string
  price: number
  dynamicPrice: number
  image: string
  type: "drink" | "food"
  drinkStyle?: "author" | "classic"
  available: boolean
  featured: boolean
  category: string
  tags: string[]
  dietaryRestrictions: ("vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free" | "sugar-free")[]
}
```

**Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_abc123",
      "name": "mojito clásico",
      "description": "ron blanco, menta fresca, lima, soda",
      "price": 8500,
      "dynamicPrice": 8500,
      "image": "https://res.cloudinary.com/.../mojito.jpg",
      "type": "drink",
      "drinkStyle": "classic",
      "available": true,
      "featured": true,
      "category": "cocktails",
      "tags": ["popular", "refreshing"],
      "dietaryRestrictions": []
    }
  ]
}
```

---

#### GET /api/products/:id

**Purpose:** Get single product by ID

**Auth:** Not required

**Response:** `ProductPublicDTO`

---

### 2.2 Menus

#### GET /api/menus/public

**Purpose:** List public menus

**Auth:** Not required

**Query Parameters:**
```typescript
interface GetPublicMenusParams {
  type?: "drink" | "food" | "mixed"
  hideUnavailable?: boolean
  featured?: boolean
}
```

**Response:**
```typescript
interface MenuPublicDTO {
  id: string
  name: string
  slug: string
  description: string
  image: string
  type: "drink" | "food" | "mixed"
  drinkStyle?: "author" | "classic" | "mixed"
  featured: boolean
  minPrice?: number
  maxPrice?: number
  categories: MenuCategoryPublicDTO[]
}

interface MenuCategoryPublicDTO {
  id: string
  name: string
  description: string
  image: string
  order: number
  products: MenuProductPublicDTO[]
}

interface MenuProductPublicDTO {
  product: ProductPublicDTO
  price?: number // Override price
  available: boolean
  featured: boolean
  order: number
}
```

**Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "menu_xyz789",
      "name": "Cocktails Clásicos",
      "slug": "cocktails-clasicos",
      "description": "Nuestra selección de tragos clásicos",
      "image": "https://res.cloudinary.com/.../menu.jpg",
      "type": "drink",
      "drinkStyle": "classic",
      "featured": true,
      "minPrice": 7500,
      "maxPrice": 12000,
      "categories": [
        {
          "id": "cat_def456",
          "name": "Cócteles de Ron",
          "description": "Tragos a base de ron",
          "image": "https://res.cloudinary.com/.../ron.jpg",
          "order": 1,
          "products": [
            {
              "product": {
                "id": "prod_abc123",
                "name": "mojito clásico",
                "description": "ron blanco, menta fresca, lima, soda",
                "price": 8500,
                "dynamicPrice": 8500,
                "image": "https://res.cloudinary.com/.../mojito.jpg",
                "type": "drink",
                "drinkStyle": "classic",
                "available": true,
                "featured": true,
                "category": "cocktails",
                "tags": ["popular"],
                "dietaryRestrictions": []
              },
              "price": 8500,
              "available": true,
              "featured": true,
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}
```

---

#### GET /api/menus/public/slug/:slug

**Purpose:** Get menu by slug

**Auth:** Not required

**Response:** `MenuPublicDTO`

---

#### GET /api/menus/public/featured

**Purpose:** Get featured menus

**Auth:** Not required

**Response:** `MenuPublicDTO[]`

---

### 2.3 Promotions

#### GET /api/promotions/public

**Purpose:** List active public promotions

**Auth:** Not required

**Query Parameters:**
```typescript
interface GetPublicPromotionsParams {
  type?: "PERCENT" | "FLAT" | "2X1" | "CUSTOM"
  applicableTo?: string // product ID or category
}
```

**Response:**
```typescript
interface PromotionPublicDTO {
  id: string
  name: string
  description: string
  image: string
  type: "PERCENT" | "FLAT" | "2X1" | "CUSTOM"
  value: number
  applicableProducts: string[]
  applicableCategories: string[]
  startsAt: string // ISO 8601
  endsAt: string // ISO 8601
  daysOfWeek: string[] // ["Monday", "Tuesday", ...]
  startTime: string // "16:00"
  endTime: string // "19:00"
  active: boolean
}
```

**Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "promo_ghi012",
      "name": "Happy Hour 2x1",
      "description": "Dos cócteles por el precio de uno",
      "image": "https://res.cloudinary.com/.../happyhour.jpg",
      "type": "2X1",
      "value": 0,
      "applicableProducts": ["prod_abc123", "prod_def456"],
      "applicableCategories": ["cocktails"],
      "startsAt": "2024-01-01T00:00:00Z",
      "endsAt": "2024-12-31T23:59:59Z",
      "daysOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "startTime": "16:00",
      "endTime": "19:00",
      "active": true
    }
  ]
}
```

---

### 2.4 Tables

#### GET /api/tables

**Purpose:** List public tables

**Auth:** Not required

**Query Parameters:**
```typescript
interface GetTablesParams {
  location?: "indoor" | "outdoor" | "bar"
  status?: "available" | "reserved" | "occupied"
  minCapacity?: number
}
```

**Response:**
```typescript
interface TablePublicDTO {
  id: string
  number: number
  capacity: number
  location: "indoor" | "outdoor" | "bar"
  status: "available" | "reserved" | "occupied" | "maintenance"
  currentSessionId?: string | null
}
```

**Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "table_1",
      "number": 1,
      "capacity": 4,
      "location": "indoor",
      "status": "available",
      "currentSessionId": null
    },
    {
      "id": "table_2",
      "number": 2,
      "capacity": 6,
      "location": "outdoor",
      "status": "occupied",
      "currentSessionId": "session_abc123"
    }
  ]
}
```

---

#### POST /api/tables/:id/open

**Purpose:** Open a table session

**Auth:** Not required (or token-based for registered users)

**Response:**
```typescript
interface TableSessionResponse {
  sessionId: string
  table: TablePublicDTO
}
```

**Example:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_abc123",
    "table": {
      "id": "table_1",
      "number": 1,
      "capacity": 4,
      "location": "indoor",
      "status": "occupied",
      "currentSessionId": "session_abc123"
    }
  }
}
```

---

### 2.5 Orders

#### POST /api/orders

**Purpose:** Create an order

**Auth:** Required (token)

**Request Body:**
```typescript
interface CreateOrderRequest {
  table: string // table ID
  sessionId: string
  items: OrderItemRequest[]
  notes?: string
  priority?: "low" | "normal" | "high"
}

interface OrderItemRequest {
  product?: string // product ID
  menu?: string // menu ID (for menu orders)
  quantity: number
  notes?: string
}
```

**Response:**
```typescript
interface OrderPublicDTO {
  id: string
  items: OrderItemPublicDTO[]
  subtotal: number
  discountTotal: number
  total: number
  status: "pending" | "in-progress" | "completed" | "cancelled"
  paymentStatus: "unpaid" | "partial" | "paid" | "refunded"
  table: string
  sessionId: string
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

interface OrderItemPublicDTO {
  id: string
  product?: ProductPublicDTO
  menu?: MenuPublicDTO
  name: string
  quantity: number
  price: number
  type: "drink" | "food" | "menu"
  status: "pending" | "preparing" | "ready" | "served" | "cancelled"
  notes: string
}
```

**Example:**
```json
{
  "success": true,
  "data": {
    "id": "order_xyz789",
    "items": [
      {
        "id": "item_abc123",
        "product": {
          "id": "prod_abc123",
          "name": "mojito clásico",
          "description": "ron blanco, menta fresca, lima, soda",
          "price": 8500,
          "dynamicPrice": 8500,
          "image": "https://res.cloudinary.com/.../mojito.jpg",
          "type": "drink",
          "drinkStyle": "classic",
          "available": true,
          "featured": true,
          "category": "cocktails",
          "tags": ["popular"],
          "dietaryRestrictions": []
        },
        "name": "mojito clásico",
        "quantity": 2,
        "price": 8500,
        "type": "drink",
        "status": "pending",
        "notes": "extra menta"
      }
    ],
    "subtotal": 17000,
    "discountTotal": 0,
    "total": 17000,
    "status": "pending",
    "paymentStatus": "unpaid",
    "table": "table_1",
    "sessionId": "session_abc123",
    "createdAt": "2024-01-15T18:30:00Z",
    "updatedAt": "2024-01-15T18:30:00Z"
  }
}
```

---

#### GET /api/orders/:id

**Purpose:** Get order by ID

**Auth:** Required (token, must be owner or admin)

**Response:** `OrderPublicDTO`

---

### 2.6 Reservations

#### POST /api/reservations

**Purpose:** Create a reservation

**Auth:** Not required

**Request Body:**
```typescript
interface CreateReservationRequest {
  customerName: string
  customerPhone: string
  customerEmail?: string
  startTime: string // ISO 8601
  endTime: string // ISO 8601
  guests: number
  tableId?: string
  notes?: string
  source?: "web" | "app" | "admin"
}
```

**Response:**
```typescript
interface ReservationPublicDTO {
  id: string
  customerName: string
  customerPhone: string
  startTime: string // ISO 8601
  endTime: string // ISO 8601
  guests: number
  status: "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "no-show"
  table?: TablePublicDTO
  createdAt: string // ISO 8601
}
```

**Example:**
```json
{
  "success": true,
  "data": {
    "id": "res_ghi012",
    "customerName": "Juan Pérez",
    "customerPhone": "+56912345678",
    "startTime": "2024-01-20T20:00:00Z",
    "endTime": "2024-01-20T22:00:00Z",
    "guests": 4,
    "status": "pending",
    "table": {
      "id": "table_1",
      "number": 1,
      "capacity": 4,
      "location": "indoor",
      "status": "reserved",
      "currentSessionId": null
    },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### GET /api/reservations/available/tables

**Purpose:** Get available tables for reservation

**Auth:** Not required

**Query Parameters:**
```typescript
interface GetAvailableTablesParams {
  startTime: string // ISO 8601
  endTime: string // ISO 8601
  guests: number
}
```

**Response:** `TablePublicDTO[]`

---

#### GET /api/reservations/check-availability

**Purpose:** Check if reservation is available

**Auth:** Not required

**Query Parameters:**
```typescript
interface CheckAvailabilityParams {
  start: string // ISO 8601
  end: string // ISO 8601
  guests: number
}
```

**Response:**
```typescript
interface AvailabilityResponse {
  available: boolean
  message?: string
}
```

---

### 2.7 Authentication

#### POST /api/auth/login

**Purpose:** Login user

**Auth:** Not required

**Request Body:**
```typescript
interface LoginRequest {
  email: string
  password: string
}
```

**Response:**
```typescript
interface LoginResponse {
  token: string
  refreshToken: string
  user: AuthUserDTO
}

interface AuthUserDTO {
  id: string
  name: string
  email: string
  role: string
}
```

**Example:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_abc123",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "customer"
    }
  }
}
```

---

#### POST /api/auth/register

**Purpose:** Register new user

**Auth:** Not required

**Request Body:**
```typescript
interface RegisterRequest {
  name: string
  email: string
  password: string
}
```

**Response:** `LoginResponse`

---

#### POST /api/auth/refresh

**Purpose:** Refresh access token

**Auth:** Not required (uses refresh token)

**Request Body:**
```typescript
interface RefreshRequest {
  refreshToken: string
}
```

**Response:**
```typescript
interface RefreshResponse {
  token: string
  refreshToken: string
}
```

---

#### POST /api/auth/logout

**Purpose:** Logout user

**Auth:** Required (token)

**Response:**
```typescript
interface LogoutResponse {
  success: true
  message: string
}
```

---

### 2.8 Roulette

#### GET /api/roulette/public

**Purpose:** Get public roulette drinks

**Auth:** Not required

**Response:**
```typescript
interface RouletteDrinkPublicDTO {
  id: string
  name: string
  weight: number
  color?: string
  rarity?: string
  probability?: number
  active: boolean
  product?: ProductPublicDTO
}
```

---

#### POST /api/roulette/public/spin

**Purpose:** Spin the roulette

**Auth:** Required (token)

**Response:**
```typescript
interface RouletteSpinResponse {
  result: RouletteDrinkPublicDTO
  meta?: Record<string, unknown>
}
```

---

## 3. Admin Endpoints (Private)

### 3.1 Products Admin

#### POST /api/products
**Auth:** Admin/Manager
**Request:** ProductCreateRequest
**Response:** ProductPublicDTO

#### PUT /api/products/:id
**Auth:** Admin/Manager
**Request:** ProductUpdateRequest
**Response:** ProductPublicDTO

#### DELETE /api/products/:id
**Auth:** Admin/Manager
**Response:** Success

#### PATCH /api/products/:id/toggle-availability
**Auth:** Admin/Manager
**Response:** ProductPublicDTO

---

### 3.2 Menus Admin

#### POST /api/menus
**Auth:** Admin/Manager
**Request:** MenuCreateRequest
**Response:** MenuPublicDTO

#### PUT /api/menus/:id
**Auth:** Admin/Manager
**Request:** MenuUpdateRequest
**Response:** MenuPublicDTO

#### DELETE /api/menus/:id
**Auth:** Admin/Manager
**Response:** Success

---

### 3.3 Orders Admin

#### GET /api/orders
**Auth:** Admin/Manager
**Query:** status, table, date range
**Response:** OrderPublicDTO[]

#### PATCH /api/orders/:id/status
**Auth:** Admin/Manager
**Request:** { status: OrderStatus }
**Response:** OrderPublicDTO

#### DELETE /api/orders/:id
**Auth:** Admin/Manager
**Response:** Success

---

### 3.4 Reservations Admin

#### GET /api/reservations
**Auth:** Admin/Manager
**Query:** status, date range
**Response:** ReservationPublicDTO[]

#### PATCH /api/reservations/:id/status
**Auth:** Admin/Manager
**Request:** { status: ReservationStatus }
**Response:** ReservationPublicDTO

#### DELETE /api/reservations/:id
**Auth:** Admin/Manager
**Response:** Success

---

### 3.5 Tables Admin

#### POST /api/tables
**Auth:** Admin/Manager
**Request:** TableCreateRequest
**Response:** TablePublicDTO

#### PUT /api/tables/:id
**Auth:** Admin/Manager
**Request:** TableUpdateRequest
**Response:** TablePublicDTO

#### DELETE /api/tables/:id
**Auth:** Admin/Manager
**Response:** Success

#### POST /api/tables/:id/close
**Auth:** Admin/Manager
**Response:** TablePublicDTO

---

### 3.6 Promotions Admin

#### POST /api/promotions
**Auth:** Admin/Manager
**Request:** PromotionCreateRequest
**Response:** PromotionPublicDTO

#### PUT /api/promotions/:id
**Auth:** Admin/Manager
**Request:** PromotionUpdateRequest
**Response:** PromotionPublicDTO

#### DELETE /api/promotions/:id
**Auth:** Admin/Manager
**Response:** Success

---

## 4. Request Headers

### 4.1 Standard Headers

```typescript
{
  "Content-Type": "application/json",
  "Accept": "application/json, text/plain, */*",
  "X-Platform": "web" | "desktop",
  "X-Client-Version": "1.0.0"
}
```

### 4.2 Auth Headers

```typescript
{
  "Authorization": "Bearer <token>"
}
```

---

## 5. Error Codes

### 5.1 Authentication Errors

- `AUTH_REQUIRED`: Token required
- `AUTH_EXPIRED`: Token expired
- `AUTH_INVALID`: Invalid token
- `AUTH_REFRESH_FAILED`: Refresh token invalid

### 5.2 Product Errors

- `PRODUCT_NOT_FOUND`: Product does not exist
- `PRODUCT_UNAVAILABLE`: Product not available
- `PRODUCT_OUT_OF_STOCK`: Product out of stock

### 5.3 Order Errors

- `ORDER_INVALID`: Invalid order data
- `ORDER_NOT_FOUND`: Order does not exist
- `ORDER_CANNOT_MODIFY`: Order cannot be modified in current state
- `ORDER_NOT_OWNER`: User does not own this order

### 5.4 Table Errors

- `TABLE_NOT_FOUND`: Table does not exist
- `TABLE_NOT_AVAILABLE`: Table not available
- `TABLE_ALREADY_OCCUPIED`: Table already occupied
- `TABLE_SESSION_INVALID`: Invalid table session

### 5.5 Reservation Errors

- `RESERVATION_UNAVAILABLE`: No availability for requested time
- `RESERVATION_CONFLICT`: Conflict with existing reservation
- `RESERVATION_NOT_FOUND`: Reservation does not exist
- `RESERVATION_NOT_OWNER`: User does not own this reservation

### 5.6 Promotion Errors

- `PROMOTION_EXPIRED`: Promotion has expired
- `PROMOTION_NOT_APPLICABLE`: Promotion not applicable to this order
- `PROMOTION_NOT_FOUND`: Promotion does not exist

### 5.7 Validation Errors

- `INVALID_QUANTITY`: Invalid quantity
- `INVALID_EMAIL`: Invalid email format
- `INVALID_PHONE`: Invalid phone format
- `INVALID_DATE`: Invalid date format
- `INVALID_CAPACITY`: Invalid capacity value

### 5.8 General Errors

- `VALIDATION_ERROR`: Validation failed
- `SERVER_ERROR`: Internal server error
- `NETWORK_ERROR`: Network error
- `UNKNOWN_ERROR`: Unknown error

---

## 6. Response Examples

### 6.1 Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### 6.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_UNAVAILABLE",
    "message": "El producto ya no está disponible."
  }
}
```

### 6.3 Validation Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "phone": "Invalid phone format"
    }
  }
}
```

---

## 7. Rate Limiting

### 7.1 Public Endpoints

- 100 requests per minute per IP
- 1000 requests per hour per IP

### 7.2 Authenticated Endpoints

- 200 requests per minute per user
- 2000 requests per hour per user

### 7.3 Response Headers

```typescript
{
  "X-RateLimit-Limit": "100",
  "X-RateLimit-Remaining": "95",
  "X-RateLimit-Reset": "1640995200"
}
```

---

## 8. Pagination

### 8.1 Query Parameters

```typescript
interface PaginationParams {
  page?: number // default: 1
  limit?: number // default: 20, max: 100
}
```

### 8.2 Response Structure

```typescript
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 9. Caching

### 9.1 Cache Headers

```typescript
{
  "Cache-Control": "public, max-age=300",
  "ETag": "\"abc123\""
}
```

### 9.2 Cacheable Endpoints

- GET /api/products (5 minutes)
- GET /api/menus/public (5 minutes)
- GET /api/tables (1 minute)
- GET /api/promotions/public (5 minutes)

### 9.3 Non-Cacheable Endpoints

- POST endpoints
- Authenticated GET endpoints
- Real-time data endpoints

---

## 10. Versioning

### 10.1 API Version

Current version: v1

### 10.2 Version Header

```typescript
{
  "X-API-Version": "1.0.0"
}
```

### 10.3 Version Path

Endpoints include version:
- `/api/v1/products`
- `/api/v1/menus/public`

---

## 11. Webhook Support (Future)

### 11.1 Order Created

```typescript
interface OrderCreatedWebhook {
  event: "order.created"
  data: OrderPublicDTO
  timestamp: string
}
```

### 11.2 Reservation Created

```typescript
interface ReservationCreatedWebhook {
  event: "reservation.created"
  data: ReservationPublicDTO
  timestamp: string
}
```

---

## 12. Success Criteria

The PUBLIC_API_CONTRACT phase is complete when:

✓ **API envelope defined** - Standard response structure
✓ **Public endpoints documented** - All client-facing endpoints
✓ **Admin endpoints documented** - All internal endpoints
✓ **DTOs defined** - All public data transfer objects
✓ **Request/Response examples** - Clear examples for each endpoint
✓ **Error codes defined** - All possible error codes
✓ **Headers defined** - Standard headers
✓ **Rate limiting defined** - Limits per endpoint type
✓ **Pagination defined** - Standard pagination
✓ **Caching strategy defined** - Cache rules
✓ **Versioning strategy defined** - How versioning works
✓ **Webhook contracts defined** - Future webhook support