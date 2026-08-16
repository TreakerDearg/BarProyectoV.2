# DATA TYPES SPEC - Bartender System

## 1. ID Conventions

### 1.1 External IDs

All IDs exposed to frontend are strings:

```typescript
id: string
```

### 1.2 Internal IDs

MongoDB uses ObjectIds internally:

```javascript
_id: ObjectId
```

### 1.3 Relationship IDs

All relationships use consistent naming:

```typescript
productId: string
menuId: string
tableId: string
orderId: string
reservationId: string
userId: string
sessionId: string
cartId: string
paymentId: string
```

### 1.4 Format Rules

- ✅ **USE**: `productId`, `tableId`, `orderId`
- ❌ **DON'T**: `_id`, `id`, `product`, `table` (inconsistent)
- ✅ **ALWAYS**: snake_case for relationship IDs
- ✅ **ALWAYS**: string type externally

---

## 2. Money Representation

### 2.1 Backend

All monetary values are numbers:

```typescript
price: number
cost: number
subtotal: number
discountTotal: number
total: number
deposit: number
```

### 2.2 API Response

API always sends numeric values:

```json
{
  "price": 8500,
  "total": 12500
}
```

### 2.3 Frontend Display

Frontend is responsible for:
- Receiving numeric value
- Formatting to local currency
- Applying currency symbol

```typescript
8500 → "$8.500"
```

### 2.4 Rules

- ✅ **Backend**: Send numbers
- ✅ **API**: Send numbers
- ✅ **Frontend**: Format for display
- ❌ **NEVER**: Send strings like "$8.500" from backend
- ❌ **NEVER**: Parse currency strings in backend

### 2.5 Currency Context

The currency (CLP, USD, etc.) is:
- Configured at system level
- Not included in every monetary value
- Applied by frontend based on locale/context

---

## 3. Date & Time Representation

### 3.1 Backend

Backend uses JavaScript Date objects:

```javascript
createdAt: Date
updatedAt: Date
startTime: Date
endTime: Date
seatedAt: Date
cancelledAt: Date
```

### 3.2 API Response

API sends ISO 8601 strings:

```json
{
  "createdAt": "2024-01-15T18:30:00Z",
  "startTime": "2024-01-20T20:00:00Z"
}
```

### 3.3 Frontend

Frontend receives ISO 8601 strings and:
- Parses to Date objects for logic
- Formats to locale-specific display
- Uses libraries like date-fns or luxon

### 3.4 Time Slots

Time slots use "HH:mm" format:

```typescript
timeSlot: "18:00"
startTime: "16:00"
endTime: "19:00"
```

### 3.5 Day Keys

Day keys use "YYYY-MM-DD" format:

```typescript
dayKey: "2024-01-20"
```

### 3.6 Rules

- ✅ **Backend**: Use Date objects
- ✅ **API**: Send ISO 8601 strings
- ✅ **Frontend**: Parse and format as needed
- ❌ **NEVER**: Send timestamps as numbers
- ❌ **NEVER**: Use locale-specific formats in API

---

## 4. Enums

### 4.1 Order Status

```typescript
enum OrderStatus {
  PENDING = "pending"
  IN_PROGRESS = "in-progress"
  COMPLETED = "completed"
  CANCELLED = "cancelled"
}
```

### 4.2 Order Item Status

```typescript
enum OrderItemStatus {
  PENDING = "pending"
  PREPARING = "preparing"
  READY = "ready"
  SERVED = "served"
  CANCELLED = "cancelled"
}
```

### 4.3 Reservation Status

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

### 4.4 Table Status

```typescript
enum TableStatus {
  AVAILABLE = "available"
  RESERVED = "reserved"
  OCCUPIED = "occupied"
  MAINTENANCE = "maintenance"
}
```

### 4.5 Payment Status

```typescript
enum PaymentStatus {
  UNPAID = "unpaid"
  PARTIAL = "partial"
  PAID = "paid"
  REFUNDED = "refunded"
}
```

### 4.6 Payment Method

```typescript
enum PaymentMethod {
  CASH = "cash"
  TRANSFER = "transfer"
  CARD = "card"
  QR = "qr"
  MIXED = "mixed"
}
```

### 4.7 Product Type

```typescript
enum ProductType {
  DRINK = "drink"
  FOOD = "food"
}
```

### 4.8 Drink Style

```typescript
enum DrinkStyle {
  AUTHOR = "author"
  CLASSIC = "classic"
}
```

### 4.9 Menu Type

```typescript
enum MenuType {
  DRINK = "drink"
  FOOD = "food"
  MIXED = "mixed"
}
```

### 4.10 Table Location

```typescript
enum TableLocation {
  INDOOR = "indoor"
  OUTDOOR = "outdoor"
  BAR = "bar"
}
```

### 4.11 Table Shape

```typescript
enum TableShape {
  RECT = "rect"
  CIRCLE = "circle"
  SQUARE = "square"
}
```

### 4.12 Promotion Type

```typescript
enum PromotionType {
  PERCENT = "PERCENT"
  FLAT = "FLAT"
  TWO_FOR_ONE = "2X1"
  CUSTOM = "CUSTOM"
}
```

### 4.13 Dietary Restriction

```typescript
enum DietaryRestriction {
  VEGAN = "vegan"
  VEGETARIAN = "vegetarian"
  GLUTEN_FREE = "gluten-free"
  DAIRY_FREE = "dairy-free"
  NUT_FREE = "nut-free"
  SUGAR_FREE = "sugar-free"
}
```

### 4.14 Order Priority

```typescript
enum OrderPriority {
  LOW = "low"
  NORMAL = "normal"
  HIGH = "high"
}
```

### 4.15 User Role

```typescript
enum UserRole {
  ADMIN = "admin"
  MANAGER = "manager"
  WAITER = "waiter"
  BARTENDER = "bartender"
  CUSTOMER = "customer"
}
```

### 4.16 Source

```typescript
enum Source {
  WEB = "web"
  APP = "app"
  ADMIN = "admin"
}
```

### 4.17 Tag Type

```typescript
enum TagType {
  ALLERGY = "allergy"
  DIET = "diet"
  PREFERENCE = "preference"
  VIP = "vip"
  WARNING = "warning"
  OTHER = "other"
}
```

### 4.18 Tag Priority

```typescript
enum TagPriority {
  LOW = "low"
  MEDIUM = "medium"
  HIGH = "high"
}
```

---

## 5. String Lengths

### 5.1 Product

```typescript
name: string // min: 2, max: 100
description: string // max: 300
category: string // required
subcategory: string // max: 100
```

### 5.2 Menu

```typescript
name: string // required
slug: string // unique, lowercase
description: string // max: 500
```

### 5.3 Category

```typescript
name: string // required
description: string // max: 300
```

### 5.4 Reservation

```typescript
customerName: string // required, trim
customerPhone: string // required, trim
customerEmail: string // optional, trim
notes: string // max: 500
```

### 5.5 Order

```typescript
notes: string // max: 500
```

### 5.6 Order Item

```typescript
name: string // required
notes: string // max: 200
```

### 5.7 Promotion

```typescript
name: string // required
description: string // max: 500
```

---

## 6. Number Ranges

### 6.1 Product

```typescript
price: number // min: 0
cost: number // min: 0, default: 0
preparationTime: number // min: 0, default: 0
```

### 6.2 Table

```typescript
number: number // required, unique, positive
capacity: number // min: 1
x: number // default: 0
y: number // default: 0
width: number // default: 120
height: number // default: 120
```

### 6.3 Reservation

```typescript
guests: number // min: 1
deposit: number // min: 0, default: 0
```

### 6.4 Order Item

```typescript
quantity: number // min: 1
price: number // min: 0
```

### 6.5 Promotion

```typescript
value: number // min: 0
```

---

## 7. Boolean Flags

### 7.1 Product

```typescript
available: boolean // default: true
autoAvailable: boolean // default: true
featured: boolean // default: false
stockImpact: boolean // default: true
isAlcohol: boolean // default: false
isActiveForPOS: boolean // default: true
```

### 7.2 Menu

```typescript
active: boolean // default: true
isPublic: boolean // default: true
allowEmptyCategories: boolean // default: false
featured: boolean // default: false
```

### 7.3 Table

```typescript
isLocked: boolean // default: false
checkoutInProgress: boolean // default: false
```

### 7.4 Reservation

```typescript
isVIP: boolean // default: false
isLocked: boolean // default: false
```

### 7.5 Promotion

```typescript
isActive: boolean // default: true
```

---

## 8. Array Types

### 8.1 Product Tags

```typescript
tags: string[] // default: []
```

### 8.2 Dietary Restrictions

```typescript
dietaryRestrictions: DietaryRestriction[] // default: []
```

### 8.3 Menu IDs

```typescript
menuIds: string[] // default: []
```

### 8.4 Image Gallery

```typescript
gallery: {
  url: string
  publicId: string
  order: number
}[] // default: []
```

### 8.5 Reservation Tags

```typescript
tags: {
  label: string
  type: TagType
  priority: TagPriority
}[] // default: []
```

### 8.6 Menu Products

```typescript
products: {
  product: string
  price?: number
  available: boolean
  featured: boolean
  order: number
}[] // default: []
```

### 8.7 Order Items

```typescript
items: {
  product?: string
  menu?: string
  name: string
  quantity: number
  price: number
  type: ProductType | "menu"
  menuItems?: string[]
  status: OrderItemStatus
  startedAt?: string
  readyAt?: string
  notes: string
}[] // default: []
```

### 8.8 Menu Items (Expanded)

```typescript
menuItems: string[] // default: []
```

### 8.9 Applicable Products

```typescript
applicableProducts: string[] // default: []
```

### 8.10 Applicable Categories

```typescript
applicableCategories: string[] // default: []
```

### 8.11 Days of Week

```typescript
daysOfWeek: string[] // ["Monday", "Tuesday", ...]
```

---

## 9. Object Types

### 9.1 Location (Table)

```typescript
location: {
  x: number
  y: number
  width: number
  height: number
  shape: TableShape
}
```

### 9.2 Schedule (Promotion)

```typescript
schedule: {
  daysOfWeek: string[]
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  startDate?: string // ISO 8601
  endDate?: string // ISO 8601
}
```

### 9.3 Pagination

```typescript
pagination: {
  page: number
  limit: number
  total: number
  totalPages: number
}
```

### 9.4 Error

```typescript
error: {
  code: string
  message: string
  details?: Record<string, string>
}
```

---

## 10. Nullable vs Optional

### 10.1 Optional Fields

Fields that may or may not be present:

```typescript
interface ProductPublicDTO {
  description?: string // May be empty string
  image?: string // May be empty string
  drinkStyle?: DrinkStyle // May not apply
}
```

### 10.2 Nullable Fields

Fields that can be null:

```typescript
interface TablePublicDTO {
  currentSessionId: string | null // null if no session
}
```

### 10.3 Required Fields

Fields that must always be present:

```typescript
interface ProductPublicDTO {
  id: string // Always present
  name: string // Always present
  price: number // Always present
}
```

### 10.4 Rules

- ✅ **USE**: Optional (`?`) for fields that may not apply
- ✅ **USE**: Nullable (`| null`) for fields that may be null
- ✅ **USE**: Required for fields that must always exist
- ❌ **DON'T**: Use empty string for required fields
- ❌ **DON'T**: Use null for optional fields

---

## 11. Validation Rules

### 11.1 Email

```typescript
email: string // Must be valid email format
```

Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### 11.2 Phone

```typescript
phone: string // Must be valid phone format
```

Pattern: `^\+?[0-9]{10,15}$`

### 11.3 Slug

```typescript
slug: string // lowercase, hyphens, no spaces
```

Pattern: `^[a-z0-9-]+$`

### 11.4 URL

```typescript
url: string // Must be valid URL
```

Pattern: `^https?:\/\/.+$`

---

## 12. Special Types

### 12.1 Cart Line

```typescript
interface CartLine {
  productId: string
  name: string
  quantity: number
  notes: string
  price: number // CRITICAL for total calculation
}
```

### 12.2 Auth User

```typescript
interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}
```

### 12.3 Token

```typescript
interface Token {
  token: string
  refreshToken: string
  expiresAt: string // ISO 8601
}
```

### 12.4 Address (Future)

```typescript
interface Address {
  street: string
  number: string
  city: string
  country: string
  postalCode: string
}
```

---

## 13. Type Guards

### 13.1 Is Product

```typescript
function isProduct(item: OrderItem): item is OrderItem & { product: string } {
  return item.type !== "menu" && !!item.product;
}
```

### 13.2 Is Menu

```typescript
function isMenu(item: OrderItem): item is OrderItem & { menu: string } {
  return item.type === "menu" && !!item.menu;
}
```

### 13.3 Has Promotion

```typescript
function hasPromotion(product: ProductPublicDTO): boolean {
  return !!product.dynamicPrice && product.dynamicPrice < product.price;
}
```

---

## 14. Type Transformations

### 14.1 Mongo to DTO

```typescript
function toProductPublicDTO(mongoProduct: Product): ProductPublicDTO {
  return {
    id: mongoProduct._id.toString(),
    name: mongoProduct.name,
    description: mongoProduct.description,
    price: mongoProduct.price,
    dynamicPrice: mongoProduct.dynamicPrice,
    image: mongoProduct.image,
    type: mongoProduct.type,
    drinkStyle: mongoProduct.drinkStyle,
    available: mongoProduct.available,
    featured: mongoProduct.featured,
    category: mongoProduct.category,
    tags: mongoProduct.tags,
    dietaryRestrictions: mongoProduct.dietaryRestrictions
  };
}
```

### 14.2 DTO to Mongo

```typescript
function toProductCreateDTO(dto: ProductCreateDTO): Partial<Product> {
  return {
    name: dto.name.toLowerCase(),
    description: dto.description,
    price: dto.price,
    category: dto.category.toLowerCase(),
    type: dto.type,
    drinkStyle: dto.drinkStyle,
    // ... other fields
  };
}
```

---

## 15. Generic Types

### 15.1 API Response

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: ErrorInfo
}

interface ErrorInfo {
  code: string
  message: string
  details?: Record<string, unknown>
}
```

### 15.2 Paginated Response

```typescript
interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: PaginationInfo
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}
```

### 15.3 Create Response

```typescript
interface CreateResponse<T> {
  success: boolean
  data: T
  message: string
}
```

### 15.4 Update Response

```typescript
interface UpdateResponse<T> {
  success: boolean
  data: T
  message: string
}
```

### 15.5 Delete Response

```typescript
interface DeleteResponse {
  success: boolean
  message: string
}
```

---

## 16. Special Values

### 16.1 Empty String

Use empty string `""` for:
- Optional text fields that are not provided
- Fields that may be blank

### 16.2 Zero

Use `0` for:
- Default cost
- Default deposit
- Default quantity (when not applicable)

### 16.3 Null

Use `null` for:
- Optional relationships that don't exist
- Fields that are explicitly not set

### 16.4 Empty Array

Use `[]` for:
- Default tags
- Default dietary restrictions
- Default gallery
- Default applicable products

---

## 17. Constants

### 17.1 Pagination Defaults

```typescript
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
```

### 17.2 Time Limits

```typescript
const MAX_RESERVATION_GUESTS = 20;
const MIN_RESERVATION_GUESTS = 1;
const MAX_ORDER_ITEMS = 50;
```

### 17.3 String Limits

```typescript
const MAX_PRODUCT_NAME = 100;
const MAX_PRODUCT_DESCRIPTION = 300;
const MAX_NOTES = 500;
```

### 17.4 Numeric Limits

```typescript
const MAX_PRICE = 1000000;
const MAX_QUANTITY = 100;
const MAX_CAPACITY = 50;
```

---

## 18. TypeScript Utility Types

### 18.1 Partial Required

```typescript
type PartialRequired<T, K extends keyof T> = Required<Pick<T, K>> & Partial<Omit<T, K>>;
```

### 18.2 Deep Partial

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### 18.3 ValueOf

```typescript
type ValueOf<T> = T[keyof T];
```

### 18.4 UnionToIntersection

```typescript
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
```

---

## 19. Naming Conventions

### 19.1 Interfaces

Use PascalCase:

```typescript
interface ProductPublicDTO {}
interface OrderPublicDTO {}
```

### 19.2 Types

Use PascalCase:

```typescript
type OrderStatus = "pending" | "in-progress" | "completed" | "cancelled";
type ProductType = "drink" | "food";
```

### 19.3 Enums

Use PascalCase for enum, UPPER_CASE for values:

```typescript
enum OrderStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}
```

### 19.4 Constants

Use UPPER_SNAKE_CASE:

```typescript
const DEFAULT_PAGE = 1;
const MAX_LIMIT = 100;
```

### 19.5 Functions

Use camelCase:

```typescript
function toProductPublicDTO() {}
function validateEmail() {}
function calculateTotal() {}
```

---

## 20. Type Safety Rules

### 20.1 No `any`

- ❌ **DON'T**: Use `any` unless absolutely necessary
- ✅ **USE**: `unknown` for unknown types
- ✅ **USE**: Specific types when possible

### 20.2 Strict Null Checks

- ✅ **ENABLE**: `strictNullChecks` in tsconfig
- ✅ **USE**: Explicit null checks
- ❌ **DON'T**: Assume non-null without validation

### 20.3 No Type Assertion

- ❌ **DON'T**: Use type assertion `as` unless necessary
- ✅ **USE**: Type guards
- ✅ **USE**: Type narrowing

### 20.4 Readonly

- ✅ **USE**: `readonly` for arrays that shouldn't change
- ✅ **USE**: `ReadonlyArray` for immutable arrays

---

## 21. Success Criteria

The DATA_TYPES_SPEC phase is complete when:

✓ **ID conventions defined** - Consistent ID naming
✓ **Money representation defined** - Numeric values, not strings
✓ **Date/time representation defined** - ISO 8601 format
✓ **All enums defined** - Complete enum definitions
✓ **String lengths defined** - Min/max for all text fields
✓ **Number ranges defined** - Min/max for all numeric fields
✓ **Boolean flags defined** - All boolean fields documented
✓ **Array types defined** - All array structures documented
✓ **Object types defined** - All complex objects documented
✓ **Nullable vs optional defined** - Clear distinction
✓ **Validation rules defined** - Patterns for validation
✓ **Special types defined** - Cart, auth, token types
✓ **Type guards defined** - Helper functions for type checking
✓ **Type transformations defined** - Mappers documented
✓ **Generic types defined** - Reusable generic types
✓ **Special values defined** - Empty, zero, null, empty array
✓ **Constants defined** - Default values and limits
✓ **Utility types defined** - TypeScript helpers
✓ **Naming conventions defined** - Consistent naming
✓ **Type safety rules defined** - TypeScript best practices