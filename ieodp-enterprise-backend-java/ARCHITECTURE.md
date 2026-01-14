# IEODP Architecture Documentation

## System Architecture

### Overview

IEODP follows a **Layered Architecture** pattern combined with **Domain-Driven Design (DDD)** principles. This ensures separation of concerns, maintainability, and scalability.

### Architecture Layers

#### 1. Presentation Layer (Controllers)
- **Location**: `com.ieodp.*.controller`
- **Responsibility**: Handle HTTP requests, validate input, delegate to services
- **Key Features**:
  - RESTful API endpoints
  - Request/Response DTOs
  - Input validation
  - Versioned APIs (`/api/v1/`)

#### 2. Service Layer (Business Logic)
- **Location**: `com.ieodp.*.service`
- **Responsibility**: Implement business rules, orchestrate operations
- **Key Features**:
  - Transaction management
  - Business rule enforcement
  - Audit logging
  - Role-based access control

#### 3. Domain Layer (Entities)
- **Location**: `com.ieodp.*.domain`
- **Responsibility**: Represent business entities and rules
- **Key Features**:
  - JPA entities
  - Business logic in entities
  - State machine logic
  - Domain events (via audit)

#### 4. Repository Layer (Data Access)
- **Location**: `com.ieodp.*.repository`
- **Responsibility**: Data persistence and retrieval
- **Key Features**:
  - Spring Data JPA repositories
  - Custom queries
  - Optimized queries (JOIN FETCH)
  - Pagination support

## Security Architecture

### Authentication Flow

1. **Login**: User provides credentials → JWT access token + refresh token generated
2. **Request**: Client sends JWT in `Authorization: Bearer <token>` header
3. **Validation**: `JwtAuthenticationFilter` validates token and sets authentication
4. **Authorization**: `@PreAuthorize` checks role/permissions

### Token Management

- **Access Token**: Short-lived (1 hour), contains user info and role
- **Refresh Token**: Long-lived (24 hours), stored in database, can be revoked
- **Token Rotation**: New refresh token issued on each refresh

### Role-Based Access Control (RBAC)

```
User → Role → Permissions
```

- Users are assigned one role
- Roles have multiple permissions
- Method-level security: `@PreAuthorize("hasRole('Manager')")`
- Permission-based: `@PreAuthorize("hasPermission(null, 'WORKFLOW_APPROVE')")`

## Workflow State Machine

### State Diagram

```
┌─────────┐
│ CREATED │
└────┬────┘
     │ SUBMIT/REVIEW
     ▼
┌──────────┐
│ REVIEWED │
└────┬─────┘
     │ APPROVE      │ REJECT
     ▼              ▼
┌──────────┐    ┌──────────┐
│ APPROVED │    │ REJECTED │
└────┬─────┘    └────┬─────┘
     │ REJECT        │ REOPEN
     ▼               ▼
┌──────────┐    ┌──────────┐
│ REJECTED │    │ REOPENED │
└──────────┘    └────┬─────┘
                      │ SUBMIT
                      ▼
                 ┌─────────┐
                 │ CREATED │
                 └─────────┘
```

### Transition Rules

| From State | Action | To State | Allowed Roles |
|------------|--------|----------|---------------|
| CREATED | SUBMIT | REVIEWED | Viewer, Manager |
| CREATED | REVIEW | REVIEWED | Manager |
| REVIEWED | APPROVE | APPROVED | Manager, Admin |
| REVIEWED | REJECT | REJECTED | Manager, Admin |
| APPROVED | REJECT | REJECTED | Admin |
| REJECTED | REOPEN | REOPENED | Viewer, Manager |
| REOPENED | SUBMIT | CREATED | Viewer |

## Data Flow

### Create Workflow Flow

```
Controller → Service → WorkflowEngine (validate) → Repository → Database
                ↓
            AuditService (log action)
```

### State Transition Flow

```
Controller → Service → WorkflowEngine (validate transition) → Update State → Repository
                ↓
            AuditService (log state change)
```

## Transaction Management

### Transaction Strategy

1. **Service Layer**: All business operations are transactional
2. **Read Operations**: `@Transactional(readOnly = true)` for queries
3. **Write Operations**: `@Transactional` for modifications
4. **Audit Logging**: Always transactional to ensure logs are never lost

### Rollback Strategy

- **Automatic Rollback**: On any unchecked exception
- **No Rollback**: On checked exceptions (none used in this system)
- **Audit Logs**: Always committed, even if business operation fails

## Database Design

### Entity Relationships

```
User ──┐
       ├──> Role ──> Permission
       │
       └──> WorkflowItem (createdBy, assignedTo)
            │
            └──> WorkflowTransition (allowedRole)
                 │
                 └──> Role

AuditLog ──> User (performedBy)
RefreshToken ──> User
```

### Indexing Strategy

**User Table**:
- `username` (unique)
- `email` (unique)

**WorkflowItem Table**:
- `state` (for filtering)
- `created_by_id` (for user queries)
- `assigned_to_id` (for assignment queries)
- `created_at` (for sorting)

**AuditLog Table**:
- `action` (for filtering)
- `performed_by_id` (for user queries)
- `entity_type, entity_id` (composite, for entity queries)
- `created_at` (for sorting)
- `correlation_id` (for request tracing)

## Error Handling Strategy

### Exception Hierarchy

```
BusinessException (base)
├── NotFoundException
├── ValidationException
├── UnauthorizedException
├── ForbiddenException
└── WorkflowException
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00",
  "correlationId": "uuid",
  "fieldErrors": {
    "field": "error message"
  }
}
```

## Logging Strategy

### Log Levels

- **ERROR**: System errors, exceptions
- **WARN**: Business rule violations, authentication failures
- **INFO**: Business operations (create, update, delete)
- **DEBUG**: Detailed flow information, SQL queries

### Correlation IDs

- Generated per request
- Stored in MDC (Mapped Diagnostic Context)
- Included in all log entries
- Returned in error responses
- Enables request tracing across services

## API Versioning

### Strategy

- **Current Version**: `/api/v1/`
- **Future Versions**: `/api/v2/`, `/api/v3/`, etc.
- **Backward Compatibility**: Maintained through DTO versioning
- **Deprecation**: Old versions supported for 1 year

## Performance Considerations

### Query Optimization

1. **JOIN FETCH**: Used to avoid N+1 queries
2. **Pagination**: All list endpoints support pagination
3. **Indexing**: Strategic indexes on frequently queried columns
4. **Connection Pooling**: HikariCP configured for optimal performance

### Caching Strategy

- **No caching** currently implemented
- **Future**: Consider caching for:
  - Roles and permissions
  - Workflow transitions
  - User details (with invalidation)

## Testing Strategy

### Test Types

1. **Unit Tests**: Service layer, business logic
2. **Repository Tests**: Data access layer
3. **Controller Tests**: API endpoints
4. **Integration Tests**: End-to-end workflows

### Test Coverage Goals

- **Services**: 80%+ coverage
- **Controllers**: 70%+ coverage
- **Repositories**: 60%+ coverage

## Deployment Considerations

### Environment Configuration

- **Development**: Auto-create database schema, verbose logging
- **Production**: Manual schema management, optimized logging

### Monitoring

- **Health Checks**: `/actuator/health`
- **Metrics**: `/actuator/metrics`
- **Log Aggregation**: Correlation IDs enable distributed tracing

### Scalability

- **Horizontal Scaling**: Stateless design supports multiple instances
- **Database**: Read replicas for read-heavy operations
- **Caching**: Redis for session/token caching (future)

## Integration Points

### External Systems

1. **Frontend**: REST API with JWT authentication
2. **Python/AI Services**: REST API for data exchange
3. **Power BI**: REST API for analytics data
4. **Microservices**: Versioned APIs for service-to-service communication

### API Contracts

- **OpenAPI/Swagger**: Auto-generated documentation
- **Versioning**: URL-based versioning
- **Backward Compatibility**: Maintained through DTO evolution
