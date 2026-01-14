# Java Backend APIs Documentation

## Base URL
```
http://localhost:8080
```

## Authentication

All endpoints (except auth endpoints) require JWT Bearer token authentication:
```
Authorization: Bearer <your_access_token>
```

**Get Token:**
```bash
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

## Authentication Endpoints

### 1. Register User
**POST** `/api/v1/auth/register`

**Request:**
```json
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Viewer"
}
```

**Valid Roles:** `Admin`, `Manager`, `Reviewer`, `Viewer`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "username": "john_doe",
    "role": "Viewer",
    "issuedAt": "2026-01-10T20:00:00"
  },
  "message": "User registered successfully"
}
```

### 2. Login
**POST** `/api/v1/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "username": "admin",
    "role": "Admin"
  },
  "message": "Login successful"
}
```

### 3. Refresh Token
**POST** `/api/v1/auth/refresh`

**Request:**
```json
{
  "refreshToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### 4. Logout
**POST** `/api/v1/auth/logout`

**Request:**
```json
{
  "refreshToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

## User Management Endpoints

**Required Roles:** Manager or Admin (except GET by ID)

### 1. Get All Users
**GET** `/api/v1/users?page=0&size=20&sort=createdAt`

**Query Parameters:**
- `page` (optional, default: 0) - Page number
- `size` (optional, default: 20) - Page size
- `sort` (optional, default: createdAt) - Sort field

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@ieodp.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "Admin",
        "enabled": true,
        "createdAt": "2026-01-10T10:00:00"
      }
    ],
    "totalElements": 1,
    "totalPages": 1
  }
}
```

### 2. Get User by ID
**GET** `/api/v1/users/{id}`

### 3. Search Users
**GET** `/api/v1/users/search?search=john&page=0&size=20`

### 4. Get Users by Role
**GET** `/api/v1/users/role/{roleName}?page=0&size=20`

### 5. Update User
**PUT** `/api/v1/users/{id}`

**Request:**
```json
{
  "email": "john.updated@example.com",
  "firstName": "John",
  "lastName": "Updated",
  "role": "Manager",
  "enabled": true
}
```

### 6. Delete User
**DELETE** `/api/v1/users/{id}`

**Required Role:** Admin only

## Workflow Management Endpoints

### 1. Create Workflow
**POST** `/api/v1/workflows`

**Request:**
```json
{
  "title": "Process Payment Request",
  "description": "Review and approve payment request for vendor invoice",
  "priority": "HIGH",
  "category": "Finance",
  "assignedToId": 1
}
```

**Priority Values:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Process Payment Request",
    "description": "Review and approve payment request for vendor invoice",
    "state": "CREATED",
    "priority": "HIGH",
    "category": "Finance",
    "createdBy": {
      "id": 1,
      "username": "admin"
    },
    "assignedTo": {
      "id": 1,
      "username": "admin"
    },
    "createdAt": "2026-01-10T20:00:00"
  },
  "message": "Workflow created successfully"
}
```

### 2. Get Workflow by ID
**GET** `/api/v1/workflows/{id}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Process Payment Request",
    "description": "Review and approve payment request",
    "state": "CREATED",
    "priority": "HIGH",
    "category": "Finance",
    "createdBy": {
      "id": 1,
      "username": "admin"
    },
    "assignedTo": {
      "id": 2,
      "username": "manager1"
    },
    "createdAt": "2026-01-10T20:00:00",
    "updatedAt": "2026-01-10T20:00:00"
  }
}
```

### 3. Get All Workflows
**GET** `/api/v1/workflows?page=0&size=20&sort=createdAt`

**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 20)
- `sort` (optional, default: createdAt)

### 4. Search Workflows
**GET** `/api/v1/workflows/search?search=payment&state=CREATED&page=0&size=20`

**Query Parameters:**
- `search` (optional) - Search term
- `state` (optional) - Filter by state: `CREATED`, `REVIEWED`, `APPROVED`, `REJECTED`, `REOPENED`
- `priority` (optional) - Filter by priority
- `category` (optional) - Filter by category
- `fromDate` (optional) - Filter from date (ISO 8601)
- `toDate` (optional) - Filter to date (ISO 8601)
- `page` (optional, default: 0)
- `size` (optional, default: 20)
- `sort` (optional, default: createdAt,DESC)

### 5. Update Workflow
**PUT** `/api/v1/workflows/{id}`

**Request:**
```json
{
  "title": "Updated Payment Request",
  "description": "Updated description",
  "priority": "CRITICAL",
  "category": "Finance",
  "assignedToId": 1,
  "comments": "Urgent payment required"
}
```

### 6. Transition Workflow State
**POST** `/api/v1/workflows/{id}/transition`

**Request:**
```json
{
  "action": "SUBMIT",
  "comments": "Ready for review"
}
```

**Valid Actions:** `SUBMIT`, `REVIEW`, `APPROVE`, `REJECT`, `REOPEN`

**State Transitions:**
- `CREATED` → `REVIEWED` (SUBMIT by Viewer/Manager, REVIEW by Manager)
- `REVIEWED` → `APPROVED` (APPROVE by Manager/Admin)
- `REVIEWED` → `REJECTED` (REJECT by Manager/Admin)
- `APPROVED` → `REJECTED` (REJECT by Admin only)
- `REJECTED` → `REOPENED` (REOPEN by Viewer/Manager)
- `REOPENED` → `CREATED` (SUBMIT by Viewer)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Process Payment Request",
    "state": "REVIEWED",
    "comments": "Ready for review",
    "updatedAt": "2026-01-10T20:10:00"
  },
  "message": "Workflow transitioned successfully"
}
```

### 7. Trigger Workflow by Name
**POST** `/api/v1/workflows/{workflowName}/trigger`

**Request:**
```json
{
  "source": "python-integration-service",
  "payload": {
    "invoiceId": "INV-2026-001",
    "amount": 5000.00,
    "vendor": "ABC Corp"
  },
  "action": "SUBMIT",
  "comments": "Automated trigger from Python service",
  "workflowId": null,
  "metadata": {}
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "SUCCESS",
    "workflowId": 2,
    "workflowName": "payment-processing",
    "state": "CREATED",
    "message": "Workflow triggered successfully",
    "correlationId": "abc123-def456-ghi789"
  }
}
```

### 8. Delete Workflow
**DELETE** `/api/v1/workflows/{id}`

**Required Role:** Admin only

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Workflow deleted successfully"
}
```

## Audit Log Endpoints

**Required Roles:** Reviewer, Admin, or Manager (for basic audit logs)  
**Required Roles:** Reviewer or Admin (for entity-specific audit logs)

### 1. Get Audit Logs
**GET** `/api/v1/audit?action=USER_CREATED&entityType=User&page=0&size=50`

**Query Parameters:**
- `action` (optional) - Filter by action: `USER_CREATED`, `WORKFLOW_UPDATED`, etc.
- `entityType` (optional) - Filter by entity type: `User`, `Workflow`
- `entityId` (optional) - Filter by entity ID
- `userId` (optional) - Filter by user ID who performed the action
- `fromDate` (optional) - Start date (ISO 8601 format)
- `toDate` (optional) - End date (ISO 8601 format)
- `correlationId` (optional) - Filter by correlation ID
- `page` (optional, default: 0)
- `size` (optional, default: 50)
- `sort` (optional, default: createdAt)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "action": "USER_CREATED",
        "entityType": "User",
        "entityId": 2,
        "details": "User created: john_doe",
        "performedBy": {
          "id": 1,
          "username": "admin"
        },
        "ipAddress": "192.168.1.100",
        "correlationId": "abc123-def456",
        "createdAt": "2026-01-10T20:00:00"
      }
    ],
    "totalElements": 1,
    "totalPages": 1
  }
}
```

### 2. Get Audit Logs by Entity
**GET** `/api/v1/audit/entity/{entityType}/{entityId}?page=0&size=50`

**Example:** `/api/v1/audit/entity/Workflow/1`

## Integration Endpoints

### 1. Trigger Workflow (Integration)
**POST** `/api/v1/integration/workflows/trigger`

**Request:**
```json
{
  "source": "ai-ml-service",
  "payload": {
    "workflowType": "risk-assessment",
    "data": {
      "transactionId": "TXN-123",
      "amount": 50000.00
    }
  },
  "action": "SUBMIT",
  "comments": "AI-generated workflow trigger"
}
```

### 2. Integration Health Check
**GET** `/api/v1/integration/health`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "service": "IEODP Integration API",
    "version": "v1",
    "timestamp": "2024-01-15T10:30:00"
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "errorCode": "UNAUTHORIZED",
  "timestamp": "2026-01-10T20:00:00"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "errorCode": "FORBIDDEN",
  "timestamp": "2026-01-10T20:00:00"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2026-01-10T20:00:00"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2026-01-10T20:00:00"
}
```

## Role-Based Access Summary

| Endpoint | Viewer | Manager | Reviewer | Admin |
|----------|--------|---------|----------|-------|
| Register/Login | ✅ | ✅ | ✅ | ✅ |
| Get User by ID | ✅ | ✅ | ✅ | ✅ |
| Get All Users | ❌ | ✅ | ❌ | ✅ |
| Search Users | ❌ | ✅ | ❌ | ✅ |
| Update User | ❌ | ✅ | ❌ | ✅ |
| Delete User | ❌ | ❌ | ❌ | ✅ |
| Create Workflow | ✅ | ✅ | ❌ | ✅ |
| Get Workflows | ✅ | ✅ | ✅ | ✅ |
| Update Workflow | ✅ | ✅ | ❌ | ✅ |
| Transition Workflow | ✅* | ✅ | ❌ | ✅ |
| Delete Workflow | ❌ | ❌ | ❌ | ✅ |
| Get Audit Logs | ❌ | ✅ | ✅ | ✅ |
| Get Audit by Entity | ❌ | ❌ | ✅ | ✅ |

*Viewer can only SUBMIT workflows (CREATED → REVIEWED, REOPENED → CREATED)

## Notes

- All timestamps are in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss`
- Pagination uses Spring Data Pageable (0-indexed pages)
- All endpoints return standardized `ApiResponse<T>` wrapper
- JWT tokens expire after 1 hour (3600 seconds)
- Refresh tokens expire after 7 days
- Use correlation IDs for request tracing
- For detailed examples, see `Testing APIs.md`
