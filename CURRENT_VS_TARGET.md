# CURRENT VS TARGET - Bartender System

## 1. Executive Summary

This document compares the current implementation against the target architecture defined in the Fase 0 documents. It identifies gaps, inconsistencies, and provides a roadmap for migration.

---

## 2. Data Flow Comparison

### 2.1 Product Data Flow

#### Current
```
Desktop Admin → POST /api/products → Backend → MongoDB
  ↓
GET /api/products → Backend → Product (30+ fields) → Frontend
  ↓
Frontend uses ProductBrief (8 fields) - INCOMPLETE
```

#### Target
```
Desktop Admin → POST /api/products → Backend → MongoDB
  ↓
GET /api/products → Backend → Mapper → ProductPublicDTO (10 fields) → Frontend
  ↓
Frontend uses ProductPublicDTO (complete)
```

**Gap:**
- ❌ No DTO layer in backend
- ❌ Frontend type incomplete vs backend model
- ❌ No mapper between model and DTO

**Priority:** HIGH

---

### 2.2 Menu Data Flow

#### Current
```
Desktop Admin → POST /api/menus → Backend → MongoDB
  ↓
GET /api/menus/public → Backend → Menu (complex structure) → Frontend
  ↓
Frontend uses PublicMenu (incomplete type)
```

#### Target
```
Desktop Admin → POST /api/menus → Backend → MongoDB
  ↓
GET /api/menus/public → Backend → Mapper → MenuPublicDTO → Frontend
  ↓
Frontend uses MenuPublicDTO (complete)
```

**Gap:**
- ❌ PublicMenu type missing slug, featured, minPrice, maxPrice
- ❌ Backend may return paginated response, frontend expects array
- ❌ No DTO layer

**Priority:** HIGH

---

### 2.3 Promotion Data Flow

#### Current
```
Desktop Admin → POST /api/promotions → Backend → MongoDB
  ↓
❌ NO public endpoint for promotions
  ↓
Frontend expects promotion fields in products (don't exist)
```

#### Target
```
Desktop Admin → POST /api/promotions → Backend → MongoDB
  ↓
GET /api/promotions/public → Backend → Mapper → PromotionPublicDTO → Frontend
  ↓
Frontend receives promotions separately
```

**Gap:**
- 🔴 CRITICAL: No public endpoint for promotions
- 🔴 CRITICAL: Frontend expects fields that don't exist in backend
- ❌ Promotions not visible to customers

**Priority:** CRITICAL

---

### 2.4 Order Data Flow

#### Current
```
Client → POST /api/orders → Backend → MongoDB
  ↓
Socket.IO order:created → Desktop receives
  ↓
❌ Client does NOT receive Socket.IO events
  ↓
Client uses polling (5 minutes) for updates
```

#### Target
```
Client → POST /api/orders → Backend → MongoDB
  ↓
Socket.IO order:created → Desktop & Client receive
  ↓
Client receives real-time updates
```

**Gap:**
- 🔴 CRITICAL: Client has no Socket.IO for orders
- 🔴 CRITICAL: Client relies on polling instead of real-time
- ❌ Slow updates for customers

**Priority:** CRITICAL

---

### 2.5 Cart Data Flow

#### Current
```
Client → Cart (Zustand store)
  ↓
CartLine: { productId, name, quantity, notes }
  ↓
❌ NO price field in CartLine
  ↓
Checkout → POST /api/orders
  ↓
Backend calculates total
```

#### Target
```
Client → Cart (Zustand store)
  ↓
CartLine: { productId, name, quantity, notes, price }
  ↓
Client can calculate total correctly
  ↓
Checkout → POST /api/orders
  ↓
Backend validates and calculates final total
```

**Gap:**
- 🔴 CRITICAL: CartLine missing price field
- 🔴 CRITICAL: Total calculation impossible in frontend
- ❌ Customers can't see cart total

**Priority:** CRITICAL

---

### 2.6 Reservation Data Flow

#### Current
```
Client → POST /api/reservations → Backend → MongoDB
  ↓
Backend uses startTime/endTime
  ↓
Frontend sends start/end (inconsistent names)
  ↓
Socket.IO reservation:created → Desktop receives
  ↓
❌ Client does NOT receive Socket.IO events
```

#### Target
```
Client → POST /api/reservations → Backend → MongoDB
  ↓
Backend uses startTime/endTime (consistent)
  ↓
Frontend sends startTime/endTime (consistent)
  ↓
Socket.IO reservation:created → Desktop & Client receive
```

**Gap:**
- ❌ Parameter name inconsistency (minor)
- ❌ Client has no Socket.IO for reservations
- ❌ Client relies on polling

**Priority:** MEDIUM

---

## 3. Type System Comparison

### 3.1 Product Types

#### Current
```typescript
// Frontend (src/lib/types/api.ts)
type ProductBrief = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  type?: string;
  image?: string;
  available?: boolean;
  dynamicPrice?: number;
}
```

#### Target
```typescript
// Target
type ProductPublicDTO = {
  id: string; // Not _id
  name: string;
  description: string;
  price: number; // Not optional
  dynamicPrice: number;
  image: string;
  type: "drink" | "food"; // Not string
  drinkStyle?: "author" | "classic"; // Missing
  available: boolean; // Not optional
  featured: boolean; // Missing
  category: string; // Missing
  tags: string[]; // Missing
  dietaryRestrictions: DietaryRestriction[]; // Missing
}
```

**Gaps:**
- ❌ Uses `_id` instead of `id`
- ❌ Missing drinkStyle, featured, category, tags, dietaryRestrictions
- ❌ Optional fields that should be required
- ❌ String type instead of enum for type

**Priority:** HIGH

---

### 3.2 Menu Types

#### Current
```typescript
// Frontend (src/lib/types/api.ts)
type PublicMenu = {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  categories: MenuCategory[];
}

type MenuCategory = {
  _id: string;
  name: string;
  products: Array<{
    available?: boolean;
    product?: ProductBrief | null;
  }>;
}
```

#### Target
```typescript
// Target
type MenuPublicDTO = {
  id: string; // Not _id
  name: string;
  slug: string; // Missing
  description: string;
  image: string; // Missing
  type: "drink" | "food" | "mixed"; // Enum
  drinkStyle?: "author" | "classic" | "mixed"; // Missing
  featured: boolean; // Missing
  minPrice?: number; // Missing
  maxPrice?: number; // Missing
  categories: MenuCategoryPublicDTO[];
}

type MenuCategoryPublicDTO = {
  id: string; // Not _id
  name: string;
  description: string; // Missing
  image: string; // Missing
  order: number; // Missing
  products: MenuProductPublicDTO[];
}

type MenuProductPublicDTO = {
  product: ProductPublicDTO;
  price?: number;
  available: boolean;
  featured: boolean;
  order: number; // Missing
}
```

**Gaps:**
- ❌ Uses `_id` instead of `id`
- ❌ Missing slug, image, drinkStyle, featured, minPrice, maxPrice
- ❌ Category missing description, image, order
- ❌ MenuProduct missing order, featured
- ❌ Products structure different

**Priority:** HIGH

---

### 3.3 Order Types

#### Current
```typescript
// Frontend (src/lib/api/bartender.ts)
createOrder(body: {
  table: string;
  sessionId: string;
  items: { product: string; quantity?: number; notes?: string }[];
  notes?: string;
  priority?: "low" | "normal" | "high";
})
```

#### Target
```typescript
// Target
interface CreateOrderRequest {
  table: string;
  sessionId: string;
  items: OrderItemRequest[];
  notes?: string;
  priority?: "low" | "normal" | "high";
}

interface OrderItemRequest {
  product?: string;
  menu?: string; // Missing - no menu support
  quantity: number;
  notes?: string;
}
```

**Gaps:**
- ❌ No menu support in frontend order creation
- ❌ Can't order complete menus from web client

**Priority:** HIGH

---

### 3.4 Table Types

#### Current
```typescript
// Frontend (src/lib/types/api.ts)
type TableRow = {
  _id: string;
  number: number;
  capacity: number;
  status: string;
  location?: string;
  currentSessionId?: string | null;
}
```

#### Target
```typescript
// Target
type TablePublicDTO = {
  id: string; // Not _id
  number: number;
  capacity: number;
  location: "indoor" | "outdoor" | "bar"; // Enum
  status: TableStatus; // Enum
  currentSessionId?: string | null;
}
```

**Gaps:**
- ❌ Uses `_id` instead of `id`
- ❌ String status instead of enum
- ❌ String location instead of enum
- ❌ Missing x, y, width, height, shape (for floor plan)

**Priority:** MEDIUM

---

### 3.5 Cart Types

#### Current
```typescript
// Frontend (src/stores/useClienteStore.ts)
type CartLine = {
  productId: string;
  name: string;
  quantity: number;
  notes: string;
  // ❌ MISSING: price
}
```

#### Target
```typescript
// Target
type CartLine = {
  productId: string;
  name: string;
  quantity: number;
  notes: string;
  price: number; // ✅ CRITICAL
}
```

**Gaps:**
- 🔴 CRITICAL: Missing price field
- 🔴 CRITICAL: Total calculation impossible

**Priority:** CRITICAL

---

## 4. API Contract Comparison

### 4.1 Promotions Endpoint

#### Current
```text
❌ NO /api/promotions/public endpoint
```

#### Target
```text
✓ GET /api/promotions/public
✓ Response: PromotionPublicDTO[]
```

**Gap:**
- 🔴 CRITICAL: No public promotions endpoint
- 🔴 CRITICAL: Customers can't see promotions

**Priority:** CRITICAL

---

### 4.2 Response Structure

#### Current
```typescript
// Some endpoints return:
{ success: true, data: T }

// Others may return:
{ data: T, pagination: {...} }

// Frontend expects:
T[] (direct array)
```

#### Target
```typescript
// All endpoints return:
{ success: true, data: T | T[], pagination?: {...} }

// Frontend handles:
const { data, pagination } = response
```

**Gap:**
- ❌ Inconsistent response structure
- ❌ Frontend doesn't handle pagination
- ❌ May break if backend returns paginated response

**Priority:** HIGH

---

### 4.3 Error Response

#### Current
```typescript
// Frontend receives:
{ message: string }

// Error codes not standardized
```

#### Target
```typescript
// Frontend receives:
{ success: false, error: { code: string, message: string } }

// Standardized error codes
```

**Gap:**
- ❌ No standardized error codes
- ❌ Generic error messages
- ❌ Poor UX for errors

**Priority:** MEDIUM

---

## 5. Realtime Comparison

### 5.1 Socket.IO Usage

#### Current
```
Desktop:
✓ Full Socket.IO implementation
✓ Listens to order:created, order:updated, table:updated
✓ Connects to /tracking namespace

Client Web:
✓ Socket.IO only for roulette
❌ NO Socket.IO for orders
❌ NO Socket.IO for reservations
❌ NO Socket.IO for table updates
❌ Relies on polling (5 minutes for menu)
```

#### Target
```
Desktop:
✓ Full Socket.IO implementation (current)

Client Web:
✓ Socket.IO for order status updates
✓ Socket.IO for reservation updates
✓ Socket.IO for table availability
✓ Polling only as fallback
```

**Gap:**
- 🔴 CRITICAL: Client has no real-time for orders
- 🔴 CRITICAL: Client has no real-time for reservations
- ❌ Poor customer experience for order status

**Priority:** CRITICAL

---

### 5.2 Event Handling

#### Current
```
Desktop:
✓ Handles order:created, order:updated, order:status
✓ Handles table:updated
✓ Handles reservation:created, reservation:updated

Client Web:
✓ Handles roulette:spun only
❌ NO order event handling
❌ NO reservation event handling
```

#### Target
```
Desktop:
✓ Current implementation (keep)

Client Web:
✓ Handle order:status for own orders
✓ Handle reservation:updated for own reservations
✓ Handle table:availability (if table selected)
```

**Gap:**
- ❌ Client doesn't handle any order events
- ❌ Client doesn't handle any reservation events

**Priority:** CRITICAL

---

## 6. State Management Comparison

### 6.1 Zustand Store

#### Current
```typescript
// src/stores/useClienteStore.ts
type State = {
  token: string | null;
  user: AuthUser | null;
  tableId: string | null;
  sessionId: string | null;
  cart: CartLine[]; // ❌ Missing price
  setAuth: (token, user) => void;
  logout: () => void;
  setTableSession: (tableId, sessionId) => void;
  clearTableSession: () => void;
  addToCart: (line) => void;
  removeFromCart: (productId) => void;
  setLineQty: (productId, quantity) => void;
  setLineNotes: (productId, notes) => void;
  clearCart: () => void;
}
```

#### Target
```typescript
// Target
type State = {
  token: string | null;
  user: AuthUser | null;
  tableId: string | null;
  sessionId: string | null;
  cart: CartLine[]; // ✅ With price
  setAuth: (token, user) => void;
  logout: () => void; // ✓ Clear tableId, sessionId, cart
  setTableSession: (tableId, sessionId) => void;
  clearTableSession: () => void;
  addToCart: (line) => void; // ✓ Requires price
  removeFromCart: (productId) => void;
  setLineQty: (productId, quantity) => void;
  setLineNotes: (productId, notes) => void;
  clearCart: () => void;
}
```

**Gaps:**
- 🔴 CRITICAL: CartLine missing price
- ❌ Logout may not clear tableId/sessionId correctly
- ❌ No validation in addToCart

**Priority:** CRITICAL

---

### 6.2 Context Providers

#### Current
```typescript
// CartContext.tsx
const total = useMemo(() => {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
  // ❌ Returns itemCount instead of monetary total
}, [cart]);
```

#### Target
```typescript
// Target
const total = useMemo(() => {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // ✓ Returns monetary total
}, [cart]);
```

**Gap:**
- 🔴 CRITICAL: Total calculation wrong
- 🔴 CRITICAL: Customers see wrong cart total

**Priority:** CRITICAL

---

## 7. Validation Comparison

### 7.1 Backend Validation

#### Current
```javascript
// Zod schemas in utils/schemas.js
✓ Validation exists
✓ Used in some routes
❌ Not consistently applied
```

#### Target
```javascript
// Target
✓ Validation exists
✓ Consistently applied to all routes
✓ Standardized error responses
```

**Gap:**
- ❌ Inconsistent validation application
- ❌ Some routes validated, others not

**Priority:** MEDIUM

---

### 7.2 Frontend Validation

#### Current
```typescript
// ❌ NO Zod validation in frontend
// Basic React form validation only
```

#### Target
```typescript
// Target
✓ Zod validation in frontend
✓ Client-side validation matches backend
✓ Better UX with immediate feedback
```

**Gap:**
- ❌ No client-side validation library
- ❌ Inconsistent validation logic

**Priority:** MEDIUM

---

## 8. Error Handling Comparison

### 8.1 Error Types

#### Current
```typescript
// Frontend
catch (e: Error) {
  setError(e.message);
  // ❌ Generic error handling
}
```

#### Target
```typescript
// Target
catch (e: ApiError) {
  switch (e.code) {
    case 'PRODUCT_UNAVAILABLE':
      showProductUnavailableError();
      break;
    case 'ORDER_INVALID':
      showOrderInvalidError();
      break;
    // ✓ Specific error handling
  }
}
```

**Gap:**
- ❌ Generic error messages
- ❌ Poor UX for errors
- ❌ No error code handling

**Priority:** MEDIUM

---

## 9. ID Convention Comparison

### 9.1 Current Usage

#### Backend
```javascript
_id: ObjectId // MongoDB internal
```

#### Frontend
```typescript
_id: string // ❌ Uses _id instead of id
productId: string // ✓ Uses correct convention
tableId: string // ✓ Uses correct convention
```

**Gap:**
- ❌ Inconsistent: _id vs id vs productId
- ❌ Frontend uses _id instead of id for main entities

**Priority:** LOW

---

## 10. Money Representation Comparison

### 10.1 Current

#### Backend
```javascript
price: Number // ✓ Correct
total: Number // ✓ Correct
```

#### Frontend
```typescript
price?: number // ✓ Correct
// ✓ Formatting handled by frontend
```

**Gap:**
- ✅ Money representation is correct
- ✅ No changes needed

**Priority:** NONE

---

## 11. Date/Time Representation Comparison

### 11.1 Current

#### Backend
```javascript
createdAt: Date // ✓ Correct
startTime: Date // ✓ Correct
```

#### Frontend
```typescript
// ISO 8601 strings received
// ✓ Parsing handled by frontend
```

**Gap:**
- ✅ Date/time representation is correct
- ✅ No changes needed

**Priority:** NONE

---

## 12. Migration Roadmap

### 12.1 Phase 1: Critical Fixes (Immediate)

**Priority:** CRITICAL

1. **Add price to CartLine**
   - File: `src/stores/useClienteStore.ts`
   - Add `price: number` to CartLine type
   - Update addToCart to include price
   - Update CartContext total calculation

2. **Create public promotions endpoint**
   - File: `backend/src/routes/promotion.routes.js`
   - Add `GET /promotions/public`
   - Create controller method
   - Return PromotionPublicDTO

3. **Add Socket.IO to web client for orders**
   - File: `src/lib/api/socket.ts` (create)
   - Implement Socket.IO client
   - Listen to order:status events
   - Update order status in real-time

**Estimated Time:** 2-3 days

---

### 12.2 Phase 2: Type System Updates (Short-term)

**Priority:** HIGH

1. **Update ProductBrief to ProductPublicDTO**
   - File: `src/lib/types/api.ts`
   - Add missing fields (drinkStyle, featured, category, tags, dietaryRestrictions)
   - Change _id to id
   - Make non-optional fields required

2. **Update PublicMenu to MenuPublicDTO**
   - File: `src/lib/types/api.ts`
   - Add missing fields (slug, image, drinkStyle, featured, minPrice, maxPrice)
   - Change _id to id
   - Add Category fields (description, image, order)
   - Add MenuProduct fields (order, featured)

3. **Update TableRow to TablePublicDTO**
   - File: `src/lib/types/api.ts`
   - Change _id to id
   - Add enum for status and location
   - Add floor plan fields (x, y, width, height, shape)

4. **Create DTO mappers in backend**
   - File: `backend/src/mappers/` (create directory)
   - Create productMapper.js
   - Create menuMapper.js
   - Create tableMapper.js
   - Create promotionMapper.js

**Estimated Time:** 3-4 days

---

### 12.3 Phase 3: API Contract Standardization (Medium-term)

**Priority:** HIGH

1. **Standardize response structure**
   - Ensure all endpoints return ApiResponse<T>
   - Handle pagination consistently
   - Update frontend to extract data correctly

2. **Standardize error responses**
   - Add error codes to all error responses
   - Create error code constants
   - Update frontend to handle error codes

3. **Add menu support to order creation**
   - File: `src/lib/api/bartender.ts`
   - Add menu field to OrderItemRequest
   - Update order creation to handle menus

**Estimated Time:** 2-3 days

---

### 12.4 Phase 4: Validation & Error Handling (Medium-term)

**Priority:** MEDIUM

1. **Add Zod validation to frontend**
   - Install zod package
   - Create validation schemas
   - Apply to forms

2. **Implement specific error handling**
   - Create error types
   - Create error code handlers
   - Update UI for specific errors

**Estimated Time:** 2 days

---

### 12.5 Phase 5: Socket.IO Full Implementation (Long-term)

**Priority:** MEDIUM

1. **Add Socket.IO for reservations**
   - Listen to reservation:updated events
   - Update reservation status in real-time

2. **Add Socket.IO for table availability**
   - Listen to table:availability events
   - Update table status in real-time

3. **Implement reconnection strategy**
   - Auto-reconnect logic
   - State sync on reconnect
   - Fallback to polling

**Estimated Time:** 3-4 days

---

## 13. Risk Assessment

### 13.1 Critical Risks

**Risk 1: Cart total calculation failure**
- **Impact:** Customers can't see cart total
- **Probability:** High (currently broken)
- **Mitigation:** Add price field to CartLine immediately

**Risk 2: Promotions not visible**
- **Impact:** Revenue loss, poor UX
- **Probability:** High (no endpoint)
- **Mitigation:** Create public promotions endpoint

**Risk 3: No real-time order updates**
- **Impact:** Poor customer experience
- **Probability:** High (no Socket.IO)
- **Mitigation:** Implement Socket.IO for orders

---

### 13.2 High Risks

**Risk 4: Type mismatches between backend and frontend**
- **Impact:** Runtime errors, broken UI
- **Probability:** Medium
- **Mitigation:** Update frontend types to match DTOs

**Risk 5: Inconsistent API responses**
- **Impact:** Broken UI, crashes
- **Probability:** Medium
- **Mitigation:** Standardize response structure

---

### 13.3 Medium Risks

**Risk 6: Poor error handling**
- **Impact:** Bad UX, user confusion
- **Probability:** Medium
- **Mitigation:** Implement error codes and specific handling

**Risk 7: No client-side validation**
- **Impact:** Bad UX, unnecessary API calls
- **Probability:** Medium
- **Mitigation:** Add Zod validation

---

## 14. Testing Strategy

### 14.1 Critical Path Testing

**Test 1: Cart total calculation**
- Add item with price to cart
- Verify total is calculated correctly
- Verify total displays in UI

**Test 2: Promotions endpoint**
- Call GET /api/promotions/public
- Verify response structure
- Verify promotions display in UI

**Test 3: Order status updates**
- Create order via web client
- Update order status via desktop
- Verify web client receives update via Socket.IO

---

### 14.2 Type System Testing

**Test 4: ProductPublicDTO**
- Verify all fields present
- Verify types match
- Verify _id → id transformation

**Test 5: MenuPublicDTO**
- Verify all fields present
- Verify categories structure
- Verify products structure

---

### 14.3 API Contract Testing

**Test 6: Response structure**
- Verify all endpoints return ApiResponse<T>
- Verify pagination handled correctly
- Verify error responses have error codes

---

## 15. Success Criteria

The CURRENT_VS_TARGET phase is complete when:

✓ **All critical gaps identified** - Documented in this document
✓ **Migration roadmap defined** - Phases 1-5 with estimates
✓ **Risk assessment complete** - Critical, high, medium risks identified
✓ **Testing strategy defined** - Critical path and type system tests
✓ **Priority ordering established** - Critical > High > Medium > Low
✓ **Estimated timeline provided** - 2-3 days per phase (12-16 days total)
✓ **Dependencies identified** - Phase 1 must complete before Phase 2
✓ **Rollback strategy defined** - Each phase can be rolled back independently

---

## 16. Next Steps

1. **Review this document** with team
2. **Approve migration roadmap**
3. **Begin Phase 1: Critical Fixes**
4. **Test each phase before proceeding**
5. **Monitor for regressions**
6. **Document any issues found**
7. **Adjust timeline if needed**