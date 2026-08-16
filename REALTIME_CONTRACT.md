# REALTIME CONTRACT - Bartender System

## 1. Socket.IO Architecture

### 1.1 Connection Details

**Server URL:** Configurable via environment variable

**Transports:** WebSocket, Polling (fallback)

**Namespaces:**
- Default (`/`) - General events
- `/tracking` - Analytics and KPIs

**Rooms:**
- `table:{tableId}` - Table-specific events
- `orders:global` - All orders
- `role:kitchen` - Kitchen staff
- `role:bartender` - Bartenders
- `payments:global` - All payments
- `user:{userId}` - User-specific notifications
- `roulette:global` - Roulette events

### 1.2 Connection Flow

```
Client connects
    ↓
Socket.IO handshake
    ↓
Authentication (if applicable)
    ↓
Join relevant rooms
    ↓
Listen for events
    ↓
Receive and process events
```

---

## 2. Required Events

### 2.1 Product Events

#### product:created

**Purpose:** Notify when a new product is created

**Emit to:** `orders:global`, `role:kitchen`, `role:bartender`

**Payload:**
```typescript
interface ProductCreatedEvent {
  event: "product:created"
  product: ProductPublicDTO
  createdBy: string
  timestamp: string // ISO 8601
}
```

**Example:**
```json
{
  "event": "product:created",
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
  "createdBy": "user_xyz789",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

#### product:updated

**Purpose:** Notify when a product is updated

**Emit to:** `orders:global`, `role:kitchen`, `role:bartender`

**Payload:**
```typescript
interface ProductUpdatedEvent {
  event: "product:updated"
  product: ProductPublicDTO
  updatedBy: string
  changes: Record<string, { from: unknown; to: unknown }>
  timestamp: string // ISO 8601
}
```

---

#### product:deleted

**Purpose:** Notify when a product is deleted

**Emit to:** `orders:global`, `role:kitchen`, `role:bartender`

**Payload:**
```typescript
interface ProductDeletedEvent {
  event: "product:deleted"
  productId: string
  deletedBy: string
  timestamp: string // ISO 8601
}
```

---

#### product:availability_changed

**Purpose:** Notify when product availability changes

**Emit to:** `orders:global`, `role:kitchen`, `role:bartender`

**Payload:**
```typescript
interface ProductAvailabilityChangedEvent {
  event: "product:availability_changed"
  productId: string
  available: boolean
  reason?: string
  changedBy: string
  timestamp: string // ISO 8601
}
```

---

### 2.2 Order Events

#### order:created

**Purpose:** Notify when a new order is created

**Emit to:** `orders:global`, `role:kitchen`, `role:bartender`, `table:{tableId}`

**Payload:**
```typescript
interface OrderCreatedEvent {
  event: "order:created"
  order: OrderPublicDTO
  createdBy: string
  timestamp: string // ISO 8601
}
```

**Example:**
```json
{
  "event": "order:created",
  "order": {
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
  },
  "createdBy": "user_def456",
  "timestamp": "2024-01-15T18:30:00Z"
}
```

---

#### order:updated

**Purpose:** Notify when an order is updated

**Emit to:** `orders:global`, `table:{tableId}`, `user:{userId}` (if owned by customer)

**Payload:**
```typescript
interface OrderUpdatedEvent {
  event: "order:updated"
  orderId: string
  changes: Record<string, { from: unknown; to: unknown }>
  updatedBy: string
  timestamp: string // ISO 8601
}
```

---

#### order:status

**Purpose:** Notify when order status changes

**Emit to:** `orders:global`, `table:{tableId}`, `user:{userId}` (if owned by customer)

**Payload:**
```typescript
interface OrderStatusEvent {
  event: "order:status"
  orderId: string
  previousStatus: OrderStatus
  newStatus: OrderStatus
  updatedBy: string
  timestamp: string // ISO 8601
}
```

**Example:**
```json
{
  "event": "order:status",
  "orderId": "order_xyz789",
  "previousStatus": "pending",
  "newStatus": "in-progress",
  "updatedBy": "user_def456",
  "timestamp": "2024-01-15T18:35:00Z"
}
```

---

#### order:deleted

**Purpose:** Notify when an order is deleted

**Emit to:** `orders:global`, `table:{tableId}`, `user:{userId}` (if owned by customer)

**Payload:**
```typescript
interface OrderDeletedEvent {
  event: "order:deleted"
  orderId: string
  deletedBy: string
  timestamp: string // ISO 8601
}
```

---

### 2.3 Order Item Events

#### item:ready

**Purpose:** Notify when an order item is ready

**Emit to:** `role:bartender`, `table:{tableId}`, `user:{userId}` (if owned by customer)

**Payload:**
```typescript
interface ItemReadyEvent {
  event: "item:ready"
  orderId: string
  itemId: string
  itemName: string
  tableId: string
  timestamp: string // ISO 8601
}
```

**Example:**
```json
{
  "event": "item:ready",
  "orderId": "order_xyz789",
  "itemId": "item_abc123",
  "itemName": "mojito clásico",
  "tableId": "table_1",
  "timestamp": "2024-01-15T18:40:00Z"
}
```

---

#### item:status

**Purpose:** Notify when order item status changes

**Emit to:** `role:kitchen`, `role:bartender`, `table:{tableId}`, `user:{userId}` (if owned by customer)

**Payload:**
```typescript
interface ItemStatusEvent {
  event: "item:status"
  orderId: string
  itemId: string
  previousStatus: OrderItemStatus
  newStatus: OrderItemStatus
  updatedBy: string
  timestamp: string // ISO 8601
}
```

---

### 2.4 Reservation Events

#### reservation:created

**Purpose:** Notify when a new reservation is created

**Emit to:** `orders:global`, `user:{userId}` (if owned by customer)

**Payload:**
```typescript
interface ReservationCreatedEvent {
  event: "reservation:created"
  reservation: ReservationPublicDTO
  createdBy: string
  timestamp: string // ISO 8601
}
```

**Example:**
```json
{
  "event": "reservation:created",
  "reservation": {
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
  },
  "createdBy": "user_jkl345",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

#### reservation:updated

**Purpose:** Notify when a reservation is updated

**Emit to:** `orders:global`, `user:{userId}` (if owned by customer)

**Payload:**
```typescript
interface ReservationUpdatedEvent {
  event: "reservation:updated"
  reservationId: string
  changes: Record<string, { from: unknown; to: unknown }>
  updatedBy: string
  timestamp: string // ISO 8601
}
```

---

#### reservation:cancelled

**Purpose:** Notify when a reservation is cancelled

**Emit to:** `orders:global`, `user:{userId}` (if owned by customer)

**Payload:**
```typescript
interface ReservationCancelledEvent {
  event: "reservation:cancelled"
  reservationId: string
  cancelledBy: string
  reason?: string
  timestamp: string // ISO 8601
}
```

---

### 2.5 Table Events

#### table:updated

**Purpose:** Notify when a table is updated

**Emit to:** `orders:global`, `table:{tableId}`

**Payload:**
```typescript
interface TableUpdatedEvent {
  event: "table:updated"
  table: TablePublicDTO
  updatedBy: string
  timestamp: string // ISO 8601
}
```

**Example:**
```json
{
  "event": "table:updated",
  "table": {
    "id": "table_1",
    "number": 1,
    "capacity": 4,
    "location": "indoor",
    "status": "occupied",
    "currentSessionId": "session_abc123"
  },
  "updatedBy": "user_mno678",
  "timestamp": "2024-01-15T18:30:00Z"
}
```

---

#### table:availability

**Purpose:** Notify when table availability changes

**Emit to:** `orders:global`

**Payload:**
```typescript
interface TableAvailabilityEvent {
  event: "table:availability"
  tableId: string
  previousStatus: TableStatus
  newStatus: TableStatus
  sessionId?: string
  timestamp: string // ISO 8601
}
```

---

#### table:session_opened

**Purpose:** Notify when a table session is opened

**Emit to:** `orders:global`, `table:{tableId}`

**Payload:**
```typescript
interface TableSessionOpenedEvent {
  event: "table:session_opened"
  tableId: string
  sessionId: string
  openedBy: string
  timestamp: string // ISO 8601
}
```

---

#### table:session_closed

**Purpose:** Notify when a table session is closed

**Emit to:** `orders:global`, `table:{tableId}`

**Payload:**
```typescript
interface TableSessionClosedEvent {
  event: "table:session_closed"
  tableId: string
  sessionId: string
  closedBy: string
  timestamp: string // ISO 8601
}
```

---

### 2.6 Menu Events

#### menu:updated

**Purpose:** Notify when a menu is updated

**Emit to:** `orders:global`, `role:kitchen`, `role:bartender`

**Payload:**
```typescript
interface MenuUpdatedEvent {
  event: "menu:updated"
  menu: MenuPublicDTO
  updatedBy: string
  timestamp: string // ISO 8601
}
```

---

#### menu:product_availability

**Purpose:** Notify when product availability in menu changes

**Emit to:** `orders:global`, `role:kitchen`, `role:bartender`

**Payload:**
```typescript
interface MenuProductAvailabilityEvent {
  event: "menu:product_availability"
  menuId: string
  productId: string
  available: boolean
  updatedBy: string
  timestamp: string // ISO 8601
}
```

---

### 2.7 Payment Events

#### payment:created

**Purpose:** Notify when a payment is created

**Emit to:** `payments:global`, `orders:global`, `user:{userId}` (if owned by customer)

**Payload:**
```typescript
interface PaymentCreatedEvent {
  event: "payment:created"
  payment: PaymentPublicDTO
  orderId: string
  timestamp: string // ISO 8601
}
```

---

#### payment:updated

**Purpose:** Notify when a payment is updated

**Emit to:** `payments:global`, `orders:global`, `user:{userId}` (if owned by customer)

**Payload:**
```typescript
interface PaymentUpdatedEvent {
  event: "payment:updated"
  paymentId: string
  changes: Record<string, { from: unknown; to: unknown }>
  updatedBy: string
  timestamp: string // ISO 8601
}
```

---

### 2.8 Roulette Events

#### roulette:spun

**Purpose:** Notify when roulette is spun

**Emit to:** `roulette:global`

**Payload:**
```typescript
interface RouletteSpunEvent {
  event: "roulette:spun"
  result: RouletteDrinkPublicDTO
  userId: string
  timestamp: string // ISO 8601
}
```

---

## 3. Tracking Namespace Events

### 3.1 Namespace: `/tracking`

**Purpose:** Analytics and KPIs

**Rooms:** None (broadcast to all connected)

### 3.2 Events

#### activity:event

**Purpose:** Track user activity

**Payload:**
```typescript
interface ActivityEvent {
  event: "activity:event"
  userId?: string
  platform: "web" | "desktop"
  action: string
  context?: Record<string, unknown>
  timestamp: string // ISO 8601
}
```

---

#### kpi:event

**Purpose:** Track KPI changes

**Payload:**
```typescript
interface KPIEvent {
  event: "kpi:event"
  metric: string
  value: number
  previousValue?: number
  timestamp: string // ISO 8601
}
```

---

#### alert:event

**Purpose:** Track system alerts

**Payload:**
```typescript
interface AlertEvent {
  event: "alert:event"
  severity: "low" | "medium" | "high" | "critical"
  type: string
  message: string
  context?: Record<string, unknown>
  timestamp: string // ISO 8601
}
```

---

#### shift:event

**Purpose:** Track shift events

**Payload:**
```typescript
interface ShiftEvent {
  event: "shift:event"
  shiftId: string
  type: "started" | "ended" | "break_started" | "break_ended"
  userId: string
  timestamp: string // ISO 8601
}
```

---

#### metrics:event

**Purpose:** Track custom metrics

**Payload:**
```typescript
interface MetricsEvent {
  event: "metrics:event"
  category: string
  action: string
  label?: string
  value?: number
  context?: Record<string, unknown>
  timestamp: string // ISO 8601
}
```

---

#### discount:event

**Purpose:** Track discount applications

**Payload:**
```typescript
interface DiscountEvent {
  event: "discount:event"
  discountId: string
  type: string
  value: number
  orderId: string
  appliedBy: string
  timestamp: string // ISO 8601
}
```

---

## 4. Client-Side Event Handling

### 4.1 Desktop Connection

```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL, {
  transports: ['websocket', 'polling'],
  auth: {
    token: getAccessToken()
  }
});

// Join rooms based on user role
socket.emit('join', {
  rooms: ['orders:global', `role:${user.role}`]
});

// Listen for order events
socket.on('order:created', (data: OrderCreatedEvent) => {
  handleOrderCreated(data);
});

socket.on('order:updated', (data: OrderUpdatedEvent) => {
  handleOrderUpdated(data);
});

socket.on('order:status', (data: OrderStatusEvent) => {
  handleOrderStatusChange(data);
});
```

### 4.2 Web Client Connection

```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL, {
  transports: ['websocket', 'polling']
});

// Join user-specific room if authenticated
if (user) {
  socket.emit('join', {
    rooms: [`user:${user.id}`]
  });
}

// Listen for order status updates
socket.on('order:status', (data: OrderStatusEvent) => {
  if (data.orderId === currentOrderId) {
    updateOrderStatus(data.newStatus);
  }
});

// Listen for reservation updates
socket.on('reservation:updated', (data: ReservationUpdatedEvent) => {
  if (data.reservationId === currentReservationId) {
    updateReservation(data);
  }
});
```

---

## 5. Event Broadcasting Rules

### 5.1 When to Broadcast

**Broadcast when:**
- Order status changes
- Reservation status changes
- Table status changes
- Product availability changes
- Menu structure changes
- Payment status changes

**Don't broadcast when:**
- Internal cache updates
- Non-business-critical data changes
- Test data changes

### 5.2 Who Receives

**Desktop receives:**
- All order events
- All reservation events
- All table events
- All menu events
- All payment events

**Web Client receives:**
- Own order status updates
- Own reservation updates
- Roulette events

**Kitchen receives:**
- Order creation events
- Item status events
- Menu updates

**Bartender receives:**
- Order creation events
- Item ready events
- Table updates

---

## 6. Error Handling

### 6.1 Connection Errors

```typescript
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  // Fallback to polling API
  startPolling();
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  // Attempt reconnection
  if (reason === 'io server disconnect') {
    socket.connect();
  }
});
```

### 6.2 Event Processing Errors

```typescript
socket.on('order:created', (data) => {
  try {
    validateOrderEvent(data);
    handleOrderCreated(data);
  } catch (error) {
    console.error('Error processing order:created event:', error);
    // Don't crash, log and continue
  }
});
```

---

## 7. Reconnection Strategy

### 7.1 Automatic Reconnection

```typescript
const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
});
```

### 7.2 State Synchronization on Reconnect

```typescript
socket.on('reconnect', async () => {
  // Fetch current state
  const currentOrders = await fetchCurrentOrders();
  const currentReservations = await fetchCurrentReservations();
  
  // Update local state
  updateOrders(currentOrders);
  updateReservations(currentReservations);
});
```

---

## 8. Performance Considerations

### 8.1 Event Throttling

Throttle high-frequency events:

```typescript
const throttledTableUpdate = throttle((data: TableUpdatedEvent) => {
  handleTableUpdate(data);
}, 1000);

socket.on('table:updated', throttledTableUpdate);
```

### 8.2 Event Batching

Batch similar events when possible:

```typescript
const eventQueue: SocketEvent[] = [];
let batchTimeout: NodeJS.Timeout;

function queueEvent(event: SocketEvent) {
  eventQueue.push(event);
  
  clearTimeout(batchTimeout);
  batchTimeout = setTimeout(() => {
    processBatch(eventQueue);
    eventQueue.length = 0;
  }, 100);
}
```

---

## 9. Security

### 9.1 Authentication

```typescript
const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL, {
  auth: {
    token: getAccessToken()
  }
});

// Refresh token on 401
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication error') {
    refreshToken().then(newToken => {
      socket.auth.token = newToken;
      socket.connect();
    });
  }
});
```

### 9.2 Room Authorization

Backend must validate room join requests:

```typescript
socket.on('join', (data: { rooms: string[] }) => {
  const user = getUserFromSocket(socket);
  const allowedRooms = getAllowedRooms(user.role);
  
  const validRooms = data.rooms.filter(room => 
    allowedRooms.includes(room)
  );
  
  validRooms.forEach(room => socket.join(room));
});
```

---

## 10. Event Priority

### 10.1 High Priority

Events that require immediate attention:
- `order:status` - Changes to order status
- `item:ready` - Item ready for service
- `table:availability` - Table availability changes
- `alert:event` - System alerts

### 10.2 Medium Priority

Events that should be processed soon:
- `order:created` - New orders
- `reservation:created` - New reservations
- `payment:created` - New payments

### 10.3 Low Priority

Events that can be processed later:
- `menu:updated` - Menu structure changes
- `product:updated` - Product updates
- `activity:event` - Analytics events

---

## 11. Event Replay (Future)

### 11.1 Event History

Store event history for replay:

```typescript
interface EventHistory {
  events: SocketEvent[]
  fromTimestamp: string
  toTimestamp: string
}
```

### 11.2 Replay Request

```typescript
socket.emit('replay:events', {
  fromTimestamp: '2024-01-15T10:00:00Z',
  toTimestamp: '2024-01-15T18:00:00Z',
  eventTypes: ['order:created', 'order:status']
});
```

---

## 12. Success Criteria

The REALTIME_CONTRACT phase is complete when:

✓ **Socket.IO architecture defined** - Namespaces, rooms, transports
✓ **All order events defined** - Creation, update, status, items
✓ **All reservation events defined** - Creation, update, cancellation
✓ **All table events defined** - Updates, availability, sessions
✓ **All menu events defined** - Updates, product availability
✓ **All payment events defined** - Creation, updates
✓ **All product events defined** - Creation, update, deletion, availability
✓ **Tracking events defined** - Analytics, KPIs, alerts
✓ **Roulette events defined** - Spin results
✓ **Event payloads defined** - Complete type definitions
✓ **Broadcasting rules defined** - When and who receives
✓ **Client handling defined** - Connection and event handling
✓ **Error handling defined** - Connection and processing errors
✓ **Reconnection strategy defined** - Automatic reconnection
✓ **Performance considerations defined** - Throttling, batching
✓ **Security defined** - Authentication, room authorization
✓ **Event priority defined** - High, medium, low priority
✓ **Event replay strategy defined** - Future capability