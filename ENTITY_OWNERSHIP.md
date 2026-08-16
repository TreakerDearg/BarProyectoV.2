# ENTITY OWNERSHIP - Bartender System

## 1. Ownership Matrix

| Entidad       | Backend |        Desktop |       Cliente |
| ----------- | ------: | -------------: | ------------: |
| Product     |   Owner |  Write via API |          Read |
| Menu        |   Owner |  Write via API |          Read |
| Category    |   Owner |  Write via API |          Read |
| Table       |   Owner |  Write via API |          Read |
| Promotion   |   Owner |  Write via API |          Read |
| Order       |   Owner | Update via API | Create / Read own |
| Reservation |   Owner | Update via API | Create / Read own |
| Payment     |   Owner | Update via API |          Read own |
| Cart        |       — |              — |         Owner |
| UI State    |       — |              — |         Owner |
| Session     |   Owner | Update via API |          Read own |

---

## 2. Detailed Ownership Rules

### 2.1 Master Data Ownership

#### Product
- **Owner**: Backend
- **Desktop**: Can create, update, delete via API
- **Client**: Can read only
- **Validation**: Backend validates all business rules
- **Persistence**: MongoDB

#### Menu
- **Owner**: Backend
- **Desktop**: Can create, update, delete via API
- **Client**: Can read only
- **Validation**: Backend validates structure and availability
- **Persistence**: MongoDB

#### Category
- **Owner**: Backend (embedded in Menu)
- **Desktop**: Can modify via Menu API
- **Client**: Can read only
- **Validation**: Backend validates within Menu context
- **Persistence**: MongoDB (subdocument)

#### Table
- **Owner**: Backend
- **Desktop**: Can create, update, delete via API
- **Client**: Can read only
- **Validation**: Backend validates capacity and state machine
- **Persistence**: MongoDB

#### Promotion
- **Owner**: Backend
- **Desktop**: Can create, update, delete via API
- **Client**: Can read only
- **Validation**: Backend validates business rules and scheduling
- **Persistence**: MongoDB

### 2.2 Transaction Data Ownership

#### Order
- **Owner**: Backend
- **Desktop**: Can update status via API
- **Client**: Can create, read own orders
- **Validation**: Backend validates items, pricing, availability
- **Persistence**: MongoDB

#### Reservation
- **Owner**: Backend
- **Desktop**: Can update status via API
- **Client**: Can create, read own reservations
- **Validation**: Backend validates availability, rules, conflicts
- **Persistence**: MongoDB

#### Payment
- **Owner**: Backend
- **Desktop**: Can create, update via API
- **Client**: Can read own payments
- **Validation**: Backend validates amount, order association
- **Persistence**: MongoDB

### 2.3 Session Data Ownership

#### TableSession
- **Owner**: Backend
- **Desktop**: Can open, close via API
- **Client**: Can read own session (via table selection)
- **Validation**: Backend validates table availability and state
- **Persistence**: MongoDB

#### Cart
- **Owner**: Client (local, temporary)
- **Desktop**: ❌ No access
- **Backend**: ❌ No access (only validates at checkout)
- **Validation**: Frontend validates UX, backend validates at conversion
- **Persistence**: localStorage (client only)

#### CustomerSession
- **Owner**: Backend
- **Desktop**: ❌ No access
- **Client**: Can read own session (via auth tokens)
- **Validation**: Backend validates token validity
- **Persistence**: Backend (session management)

### 2.4 Derived Data Ownership

#### Financial Calculations
- **Owner**: Backend
- **Desktop**: ❌ No calculation authority
- **Client**: ❌ No calculation authority
- **Examples**: subtotal, discountTotal, total, finalPrice

#### Availability Calculations
- **Owner**: Backend
- **Desktop**: Can read via API
- **Client**: Can read via API
- **Examples**: product availability, table availability, reservation availability

#### Time Estimates
- **Owner**: Backend
- **Desktop**: Can read via API
- **Client**: Can read via API
- **Examples**: estimatedPreparationTime, wait time

### 2.5 Presentation Data Ownership

#### UI State
- **Owner**: Client
- **Desktop**: ❌ No access
- **Backend**: ❌ No access
- **Examples**: isCartOpen, activeCategory, searchQuery, isMobileMenuOpen

#### Temporary Filters
- **Owner**: Client
- **Desktop**: ❌ No access
- **Backend**: ❌ No access
- **Examples**: category filter, search query, sort order

#### Local Preferences
- **Owner**: Client
- **Desktop**: ❌ No access
- **Backend**: ❌ No access
- **Examples: theme, language, notification preferences

---

## 3. Write Permission Matrix

### 3.1 Write Permissions

| Entity       | Desktop | Client | Conditions              |
| ------------ | ------- | ------ | ------------------------ |
| Product     | ✓       | ✗     | Via API only           |
| Menu        | ✓       | ✗     | Via API only           |
| Category    | ✓       | ✗     | Via Menu API only      |
| Table       | ✓       | ✗     | Via API only           |
| Promotion   | ✓       | ✗     | Via API only           |
| Order       | ✓       | ✗     | Status updates only     |
| Reservation | ✓       | ✗     | Status updates only     |
| Payment     | ✓       | ✗     | Via API only           |
| Cart        | ✗       | ✓     | Local only             |
| UI State    | ✗       | ✓     | Local only             |

### 3.2 Read Permissions

| Entity       | Desktop | Client | Conditions              |
| ------------ | ------- | ------ | ------------------------ |
| Product     | ✓       | ✓     | Public data only       |
| Menu        | ✓       | ✓     | Public data only       |
| Category    | ✓       | ✓     | Public data only       |
| Table       | ✓       | ✓     | Public data only       |
| Promotion   | ✓       | ✓     | Public data only       |
| Order       | ✓       | ✓*    | All for desktop, own for client |
| Reservation | ✓       | ✓*    | All for desktop, own for client |
| Payment     | ✓       | ✓*    | All for desktop, own for client |
| Cart        | ✗       | ✓     | Local only             |
| UI State    | ✗       | ✓     | Local only             |

*Client solo lee sus propias transacciones

---

## 4. Validation Authority

### 4.1 Backend Validation Authority

El backend es la autoridad definitiva para:

✓ **Validación de negocio:**
- Precio mínimo/máximo
- Disponibilidad de productos
- Reglas de promociones
- Capacidad de mesas
- Horarios de reservas
- Cantidad mínima/máxima de items

✓ **Validación de datos:**
- Email format
- Phone format
- Date ranges
- Required fields
- Data types

✓ **Validación de permisos:**
- Role-based access
- Resource ownership
- Operation authorization

✓ **Validación de estado:**
- Transiciones de estado válidas
- Reglas de cancelación
- Reglas de modificación

### 4.2 Frontend Validation Authority

El frontend puede validar para:

✓ **UX validation:**
- Form completeness
- Input format pre-submission
- Display warnings

✓ **Immediate feedback:**
- Client-side form validation
- Search input sanitization
- Quantity limits (display only)

❌ **Frontend NO valida:**
- Precio final
- Disponibilidad real
- Aplicación de descuentos
- Estado final de transacción

---

## 5. State Synchronization Rules

### 5.1 State of Truth

```
MongoDB = Backend = API Response
```

### 5.2 Frontend State

Frontend puede mantener estado temporal pero:

✓ Debe considerar que puede estar desactualizado
✓ Debe recargar del backend en operaciones críticas
✓ Debe escuchar Socket.IO events para actualizaciones

❌ Frontend NO debe:
- Considerar su estado más confiable que el backend
- Calcular valores de negocio basados en estado local desactualizado
- Validar reglas de negocio basadas en estado local

### 5.3 Desktop State

Desktop puede mantener estado local pero:

✓ Debe recargar del backend periódicamente
✓ Debe escuchar Socket.IO events para actualizaciones
✓ Debe enviar todas las modificaciones por API

❌ Desktop NO debe:
- Modificar datos sin notificar al backend
- Considerar su estado más confiable que el backend
- Validar reglas de negocio basadas en estado local

---

## 6. Conflict Resolution Rules

### 6.1 Priority of Authority

```
Backend API Response > Desktop State > Client State
```

### 6.2 Conflict Scenarios

#### Scenario: Client shows product as available, backend says unavailable

**Resolution**: Backend wins. Client must show unavailable.

#### Scenario: Desktop has cached price, backend says different price

**Resolution**: Backend wins. Desktop must use backend price.

#### Scenario: Client cart has product at old price, backend has new price

**Resolution**: Backend wins. Order uses backend price at creation time.

#### Scenario: Desktop shows table as available, backend says reserved

**Resolution**: Backend wins. Desktop must show reserved.

---

## 7. Error Responsibility

### 7.1 Backend Errors

Backend es responsable de:

✓ Validar todas las entradas
✓ Enviar códigos de error significativos
✓ Proveer mensajes de error claros
✓ Manejar errores de base de datos
✓ Manejar errores de network de terceros

### 7.2 Frontend Errors

Frontend es responsable de:

✓ Manejar errores de network
✓ Manejar errores de parsing
✓ Mostrar estados de error UI apropiados
✓ Recuperar de errores temporales
✓ Informar al usuario de errores del servidor

❌ Frontend NO debe:
- Inventar respuestas cuando el backend falla
- Asumir éxito cuando el backend falla
- Ocultar errores críticos del backend

---

## 8. Data Integrity Rules

### 8.1 Write Path

```
Write Request
    ↓
Backend Validation
    ↓
Business Rules
    ↓
Database Write
    ↓
Socket.IO Events
    ↓
All Clients Updated
```

### 8.2 Read Path

```
Client Request
    ↓
Backend Read
    ↓
Business Rules
    ↓
DTO Transformation
    ↓
API Response
    ↓
Client Display
```

### 8.3 No Direct Database Access

❌ **PROHIBITED:**
- Desktop accediendo directamente a MongoDB
- Client accediendo directamente a MongoDB
- Cualquier componente modificando MongoDB directamente

✓ **REQUIRED:**
- Todas las modificaciones pasan por API
- Backend maneja toda lógica de persistencia
- Database es responsabilidad exclusiva del backend

---

## 9. Cross-System Consistency

### 9.1 Desktop ↔ Backend

**Sync Method:** REST API + Socket.IO

**Consistency:** Desktop recibe actualizaciones en tiempo real

**Fallback:** Desktop recarga periódicamente si Socket.IO desconecta

### 9.2 Client ↔ Backend

**Sync Method:** REST API + (futuro) Socket.IO

**Consistency:** Client debe recargar en operaciones críticas

**Fallback:** Polling actual (5 minutos para menú)

### 9.3 Desktop ↔ Client

**Sync Method:** NO direct sync required

**Reason:** Desktop y cliente no comparten estado directamente
**Consistency:** Ambos reciben actualizaciones del backend vía Socket.IO

---

## 10. Authentication Authority

### 10.1 Token Management

- **Backend**: Issues and validates tokens
- **Desktop**: Stores tokens, uses in API calls
- **Client**: Stores tokens, uses in API calls

### 10.2 Refresh Logic

- **Backend**: Validates refresh tokens, issues new access tokens
- **Desktop**: Automatic refresh on 401
- **Client**: Automatic refresh on 401

### 10.3 Session Management

- **Backend**: Tracks active sessions, validates tokens
- **Desktop**: Maintains session state locally
- **Client**: Maintains session state locally

### 10.4 Logout

- **Backend**: Invalidates tokens, clears sessions
- **Desktop**: Clears local tokens, redirects to login
- **Client**: Clears local tokens, redirects to login

---

## 11. Authorization Matrix

### 11.1 Role-Based Access

| Role       | Products | Menus | Orders | Reservations | Tables | Promotions | Users |
| ---------- | -------- | ----- | ------ | ----------- | ------ | ---------- | ----- |
| admin      |   ✓    |   ✓  |   ✓   |      ✓      |   ✓   |    ✓  |
| manager    |   ✓    |   ✓  |   ✓   |      ✓      |   ✓   |    ✗  |
| waiter     |   ✗    |   ✗  |   ✓   |      ✗      |   ✗   |    ✗  |
| bartender  |   ✗    |   ✗  |   ✓   |      ✗      |   ✗   |    ✗  |
| customer   |   ✗    |   ✗  |   ✓*  |      ✓*     |   ✗   |    ✗  |

*customer solo puede crear/leer sus propias transacciones

### 11.2 Operation-Based Access

| Operation        | Desktop | Client | Notes |
| -------------- | ------- | ------ | ----- |
| Create Product    |   ✓    |   ✗   | Admin only |
| Update Product    |   ✓    |   ✗   | Admin only |
| Delete Product    |   ✓    |   ✗   | Admin only |
| Create Order     |   ✓    |   ✓   | Both can create |
| Update Order     |   ✓    |   ✗   | Desktop status only |
| Cancel Order     |   ✓    |   ✗   | Desktop only |
| Create Reservation |   ✓    |   ✓   | Both can create |
| Cancel Reservation |   ✓    |   ✗   | Desktop only |
| Open Table       |   ✓    |   ✓   | Both can open |
| Close Table      |   ✓    |   ✗   | Desktop only |

---

## 12. Data Lifecycle

### 12.1 Product Lifecycle

```
Desktop creates
    ↓
API POST /products
    ↓
Backend validates
    ↓
MongoDB saves
    ↓
Socket.IO product:created
    ↓
Desktop & Client updated
```

### 12.2 Order Lifecycle

```
Client creates cart
    ↓
Client checks out
    ↓
API POST /orders
    ↓
Backend validates
    ↓
MongoDB saves order
    ↓
Socket.IO order:created
    ↓
Desktop receives notification
    ↓
Desktop updates status
    ↓
Socket.IO order:updated
    ↓
Client receives status update
```

### 12.3 Reservation Lifecycle

```
Client creates reservation
    ↓
API POST /reservations
    ↓
Backend validates availability
    ↓
MongoDB saves reservation
    ↓
Socket.IO reservation:created
    ↓
Desktop receives notification
    ↓
Desktop confirms reservation
    ↓
Socket.IO reservation:updated
    ↓
Client receives confirmation
```

### 12.4 Table Session Lifecycle

```
Desktop opens table
    ↓
API POST /tables/:id/open
    ↓
Backend validates availability
    ↓
MongoDB creates session
↓
Socket.IO table:updated
    ↓
Desktop receives session
    ↓
Orders are created
    ↓
Desktop closes table
    ↓
API POST /tables/:id/close
    ↓
Backend closes session
    ↓
MongoDB updates table
    ↓
Socket.IO table:updated
    ↓
Client sees table available again
```

---

## 13. Failure Recovery

### 13.1 API Failure

If backend API fails:

- **Desktop**: Show error, allow retry, maintain local state
- **Client**: Show error, allow retry, maintain local state
- **Backend**: Log error, maintain database consistency

### 13.2 Socket.IO Failure

If Socket.IO disconnects:

- **Desktop**: Reconnect automatically, poll API as fallback
- **Client**: Reconnect automatically, poll API as fallback
- **Backend**: Maintain queue of missed events

### 13.3 Database Failure

If database fails:

- **Backend**: Return 500 error, log extensively
- **Desktop**: Show server error, maintain UI available
- **Client**: Show server error, maintain cart local

---

## 14. Concurrency Rules

### 14.1 Order Creation

```
Client A and Client B try to order same table simultaneously
    ↓
Backend checks table session
    ↓
First request wins
    ↓
Second request gets TABLE_ALREADY_OCCUPIED
```

### 14.2 Reservation Creation

```
Client A and Client B try to reserve same time slot
    ↓
Backend checks reservation availability
    ↓
First request wins
    ↓
Second request gets RESERVATION_CONFLICT
```

### 14.3 Product Updates

```
Desktop updates product while client is viewing menu
    ↓
Backend updates database
    ↓
Socket.IO product:updated
    ↓
Client receives update
    ↓
Client reloads menu or shows notification
```

---

## 15. Data Purge Rules

### 15.1 Automatic Purge

- **Expired tokens**: Backend invalidates automatically
- **Old sessions**: Backend closes inactive sessions
- **Expired promotions**: Backend marks as inactive

### 15.2 Manual Purge

- **Desktop**: Can manually clear local cache
- **Client**: Can manually clear cart or logout
- **Backend**: Admin can manually purge data via API

### 15.3 Data Retention

- **Orders**: Retained indefinitely (business record)
- **Reservations**: Retained for 1 year (configurable)
- **Cart**: Not retained by backend (client local only)
- **Audit logs**: Retained for 90 days (configurable)

---

## 16. Backup & Recovery

### 16.1 Backup Responsibility

- **Database backups**: Backend admin (MongoDB backups)
- **Configuration backups**: Backend admin
- **Frontend state**: Not backed up (reconstructible from backend)

### 16.2 Recovery Priority

1. Database (critical)
2. Backend configuration (critical)
3. Desktop state (recreateable from backend)
4. Client state (recreateable from backend)

---

## 17. Audit Trail

### 17.1 Backend Audit

Backend logs:
- All API requests
- All Socket.IO events
- All database writes
- All authentication events
- All authorization failures

### 17.2 Desktop Audit

Desktop logs:
- All API calls made
- All Socket.IO events received
- All user actions
- All state changes

### 17.3 Client Audit

Client logs:
- All API calls made
- All errors encountered
- All user actions
- Cart changes (optional)

---

## 18. Compliance & Security

### 18.1 Data Privacy

- **Backend**: Enforces GDPR compliance
- **Desktop**: No access to personal data without authorization
- **Client**: Can only access own data

### 18.2 Data Encryption

- **Backend**: Encryption at rest (MongoDB), HTTPS in transit
- **Desktop**: HTTPS for API calls, local storage not encrypted
- **Client**: HTTPS for API calls, local storage not encrypted

### 18.3 Access Control

- **Backend**: Role-based access control enforced
- **Desktop**: Enforced by API, not local checks
- **Client**: Enforced by API, token-based

---

## 19. Performance Rules

### 19.1 Backend Performance

- Database queries must be optimized
- Caching must be used for expensive operations
- Indexes must be properly configured
- N+1 queries must be avoided

### 19.2 Desktop Performance

- Must not overload backend with excessive API calls
- Must use Socket.IO for real-time instead of polling
- Must implement local caching where appropriate

### 19.3 Client Performance

- Must implement pagination for large datasets
- Must implement loading states
- Must implement error recovery
- Must implement optimistic UI where appropriate

---

## 20. Monitoring Requirements

### 20.1 Backend Monitoring

- API response times
- Database query performance
- Socket.IO connection health
- Error rates by endpoint
- Active sessions

### 20.2 Desktop Monitoring

- API call success rate
- Socket.IO connection status
- User actions per session
- Error rates by operation

### 20.3 Client Monitoring

- Page load times
- API call success rate
- Cart abandonment rate
- Conversion funnel
- Error rates by page

---

## 21. Disaster Recovery

### 21.1 Backend Failure

If backend is down:

- **Desktop**: Show maintenance mode, disable operations
- **Client**: Show maintenance mode, disable checkout
- **Queue**: Operations queued for when backend recovers

### 21.2 Database Failure

If database is down:

- **Backend**: Return 500, log extensively
- **Desktop**: Show database error, read-only mode if possible
- **Client**: Show database error, disable operations

### 21.3 Network Partition

If network fails:

- **Desktop**: Show offline mode, queue operations
- **Client**: Show offline mode, queue operations
- **Backend**: Continue processing if possible

---

## 22. Version Compatibility

### 22.1 API Versioning

- Backend API version: Current version (v1)
- Desktop API client: Current version
- Client API client: Current version

### 22.2 Breaking Changes

Breaking changes require:
- Backend deprecates old endpoints
- Desktop and Client adapt to new endpoints
- Migration period for compatibility

### 22.3 DTO Versioning

- DTOs include version field
- Multiple DTO versions can coexist
- Frontend requests specific version

---

## 23. Testing Validation

### 23.1 Backend Tests

- Unit tests for controllers
- Integration tests for API endpoints
- Contract tests for DTOs
- Performance tests for critical operations

### 23.2 Desktop Tests

- Integration tests for API calls
- Socket.IO event reception tests
- State synchronization tests
- Error recovery tests

### 23.3 Client Tests

- Integration tests for API calls
- Cart functionality tests
- Error handling tests
- UI state management tests

---

## 24. Documentation Updates

### 24.1 Backend Docs

Must update when:
- New entity added
- New endpoint added
- New DTO added
- Business rule changed
- Enum values changed

### 24.2 Desktop Docs

Must update when:
- New API endpoint used
- New Socket.IO event consumed
- New operation added
- UI flow changed

### 24.3 Client Docs

Must update when:
- New API endpoint used
- New state management pattern
- New error handling pattern
- New UX flow added

---

## 25. Deprecation Policy

### 25.1 Deprecation Warning Period

- API endpoints: 3 months minimum
- DTO fields: 3 months minimum
- Socket.IO events: 3 months minimum
- Business rules: 1 month minimum

### 25.2 Deprecation Process

1. Add deprecation notice to API response
2. Log deprecation warnings
3. Update documentation
4. Monitor usage
5. Remove after deprecation period

### 25.3 Breaking Changes

Breaking changes require:
- Major version bump
- Migration guide
- Email notification to clients
- 6-month migration period minimum

---

## 26. Architecture Evolution Path

### 26.1 Current State

- Models exposed directly as API contracts
- Types incomplete in frontend
- Desktop uses Socket.IO extensively
- Client uses minimal Socket.IO

### 26.26 Target State

- DTOs separate from models
- Complete types in frontend
- Both use Socket.IO for realtime
- Clear separation of concerns

### 26.3 Migration Path

1. Phase 1: Define DTOs (current phase)
2. Phase 2: Implement mappers in backend
3. Phase 3: Update endpoints to use DTOs
4. Phase 4: Update frontend types
5. Phase 5: Add Socket.IO to client
6. Phase 6: Validate all integrations

---

## 27. Success Criteria

The ENTITY_OWNERSHIP phase is complete when:

✓ **Authority matrix defined** - Who owns what
✓ **Write permissions defined** - Who can modify what
✓ **Read permissions defined** - Who can see what
✓ **Validation authority established** - Who validates what
✓ **State synchronization rules** - How systems stay in sync
✓ **Conflict resolution rules** - How conflicts are resolved
✓ **Error responsibility defined** - Who handles what errors
✓ **Data integrity rules** - No direct database access
✓ **Cross-system consistency** - How systems communicate
✓ **Authentication authority** - Who manages sessions
✓ **Authorization matrix** - Who can do what
✓ **Data lifecycle rules** - How data lives and dies
✓ **Failure recovery rules** - What happens when things fail
✓ **Concurrency rules** - How conflicts are handled
✓ **Data purge rules** - What gets deleted when
✓ **Backup strategy** - What gets backed up
✓ **Audit trail requirements** - What gets logged
✓ **Compliance rules** - Security and privacy
✓ **Performance rules** - How fast systems must be
✓ **Monitoring requirements** - What gets tracked
✓ **Disaster recovery** - What happens on failures
✓ **Version compatibility** - How versions evolve
✓ **Testing validation** - What gets tested
✓ **Documentation updates** - When docs change
✓ **Deprecation policy** - How to deprecate
✓ **Evolution path** - How we get from current to target