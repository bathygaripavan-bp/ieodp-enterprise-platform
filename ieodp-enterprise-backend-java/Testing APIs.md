# Testing APIs Documentation

## Overview

This document provides comprehensive testing documentation for the IEODP API, including authentication setup, testing tools, common scenarios, and troubleshooting.

## Base URL
```
http://localhost:8080
```

## Authentication Setup

### Problem: 403 Forbidden Error

When you see:
```
403 Forbidden
{
  "success": false,
  "message": "Access denied",
  "errorCode": "FORBIDDEN"
}
```

This means you're **not authenticated** or your token is invalid/expired.

### Solution: Authenticate First

#### Step 1: Login or Register

**Option A: Login with Default Admin**
```http
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Option B: Register New User**
```http
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123456",
  "firstName": "Test",
  "lastName": "User",
  "role": "Viewer"
}
```

#### Step 2: Copy the Access Token

From the response, copy the `accessToken`:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  ← COPY THIS
    "refreshToken": "...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "username": "admin",
    "role": "Admin"
  }
}
```

#### Step 3: Add Authorization Header

**For Postman:**
1. Go to the "Headers" tab
2. Add a new header:
   - **Key**: `Authorization`
   - **Value**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your token)

**For Swagger UI:**
1. Click the "Authorize" button (🔒 lock icon) at the top
2. Enter: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your token)
3. Click "Authorize"
4. Click "Close"

**For cURL:**
```bash
curl -X GET "http://localhost:8080/api/v1/workflows" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

## Token Management

### Token Refresh

If your token expires, refresh it:

```http
POST http://localhost:8080/api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "NEW_TOKEN_HERE...",
    "refreshToken": "NEW_REFRESH_TOKEN...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

### Token Expiration

- **Access Token**: Expires after 1 hour (3600 seconds)
- **Refresh Token**: Expires after 7 days
- **Token Rotation**: New refresh token issued on each refresh

## Finding User IDs

### What is `assignedToId`?

The `assignedToId` field in workflow creation/update requests refers to the **user ID** of the person the workflow should be assigned to. This field is **optional** - you can omit it or set it to `null`.

### Default Users

When the application starts, **one default user** is automatically created:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `Admin`
- **User ID**: `1` (auto-generated, typically starts at 1)

### How to Find User IDs

#### Method 1: Get All Users (Recommended)

**Request:**
```http
GET http://localhost:8080/api/v1/users
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,                    ← This is the User ID
        "username": "admin",
        "email": "admin@ieodp.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "Admin",
        "enabled": true
      },
      {
        "id": 2,                    ← This is another User ID
        "username": "john_doe",
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "Viewer",
        "enabled": true
      }
    ],
    "totalElements": 2
  }
}
```

**Use the `id` field** from the response as your `assignedToId`.

#### Method 2: Get Users by Role

**Request:**
```http
GET http://localhost:8080/api/v1/users/role/Manager
Authorization: Bearer <your_token>
```

This returns all users with the Manager role and their IDs.

### Examples

#### Create Workflow with Assignment

**If you want to assign to admin user (ID = 1):**
```json
{
  "title": "Process Payment Request",
  "description": "Review and approve payment request",
  "priority": "HIGH",
  "category": "Finance",
  "assignedToId": 1
}
```

#### Create Workflow without Assignment

**If you don't want to assign to anyone:**
```json
{
  "title": "Process Payment Request",
  "description": "Review and approve payment request",
  "priority": "HIGH",
  "category": "Finance"
}
```

*(Just omit `assignedToId`)*

### Common Scenarios

#### Scenario 1: Fresh Database (Only Admin User)

If you just started the application:
- **Only user exists**: admin (ID = 1)
- **Use**: `"assignedToId": 1` or omit the field

#### Scenario 2: After Registering Users

If you've registered users:
1. Call `GET /api/v1/users` to see all users
2. Find the user you want to assign to
3. Use their `id` as `assignedToId`

#### Scenario 3: Invalid User ID Error

**Request:**
```json
{
  "title": "Test Workflow",
  "assignedToId": 999  // Invalid ID
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid user ID: 999",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2026-01-10T20:00:00"
}
```

**Solution:** Use `GET /api/v1/users` to find valid user IDs.

## Testing Tools

### Postman

#### Environment Variables

Create a Postman environment with these variables:

```
base_url: http://localhost:8080
access_token: (will be set after login)
refresh_token: (will be set after login)
```

#### Pre-request Script (for authenticated endpoints)

Add this to your Postman request's "Pre-request Script" tab:

```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('access_token')
});
```

#### Tests Script (to save tokens)

Add this to your Login/Register request's "Tests" tab:

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.accessToken) {
        pm.environment.set("access_token", jsonData.data.accessToken);
        pm.environment.set("refresh_token", jsonData.data.refreshToken);
    }
}
```

#### Collection-Level Authorization

1. Right-click on collection → "Edit"
2. Go to "Authorization" tab
3. Type: "Bearer Token"
4. Token: `{{access_token}}`
5. This applies to all requests in the collection

### Swagger UI

1. **Open Swagger:** http://localhost:8080/swagger-ui.html
2. **Login first:**
   - Find `/api/v1/auth/login` endpoint
   - Click "Try it out"
   - Enter credentials:
     ```json
     {
       "username": "admin",
       "password": "admin123"
     }
     ```
   - Click "Execute"
   - Copy the `accessToken` from response

3. **Authorize:**
   - Click "Authorize" button (🔒) at top
   - Paste: `Bearer <your_access_token>`
   - Click "Authorize"
   - Click "Close"

4. **Now test endpoints:**
   - All endpoints will use your token automatically
   - Green lock icon shows you're authenticated

### cURL

#### Basic Example

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.accessToken')

# 2. Use token in request
curl -X GET http://localhost:8080/api/v1/workflows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

#### Complete Workflow Example

```bash
# Login
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.accessToken')

# Create workflow
curl -X POST http://localhost:8080/api/v1/workflows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review Annual Budget",
    "description": "Review the annual budget proposal",
    "priority": "HIGH",
    "category": "Finance",
    "assignedToId": 1
  }'

# Get workflow by ID
curl -X GET http://localhost:8080/api/v1/workflows/1 \
  -H "Authorization: Bearer $TOKEN"

# Update workflow
curl -X PUT http://localhost:8080/api/v1/workflows/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "priority": "CRITICAL"
  }'

# Transition workflow
curl -X POST http://localhost:8080/api/v1/workflows/1/transition \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "APPROVE",
    "comments": "Approved by manager"
  }'

# Search workflows
curl -X GET "http://localhost:8080/api/v1/workflows/search?state=REVIEWED&search=financial&page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"

# Delete workflow
curl -X DELETE http://localhost:8080/api/v1/workflows/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "errorCode": "UNAUTHORIZED",
  "timestamp": "2026-01-10T20:00:00"
}
```

**Solution:** Login first to get a valid token.

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "errorCode": "FORBIDDEN",
  "timestamp": "2026-01-10T20:00:00"
}
```

**Solution:** 
- Check token format: Must start with `Bearer `
- Verify token is valid and not expired
- Check if endpoint requires specific role (Manager/Admin)
- Verify user is enabled

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2026-01-10T20:00:00"
}
```

**Solution:** Verify the resource ID exists.

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2026-01-10T20:00:00"
}
```

**Solution:** Check request body format and required fields.

### 409 Conflict
```json
{
  "success": false,
  "message": "Username already exists",
  "errorCode": "DATA_ERROR",
  "timestamp": "2026-01-10T20:00:00"
}
```

**Solution:** Use a different username or update existing user.

## Common Mistakes

### ❌ Mistake 1: Missing "Bearer" prefix
```
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Correct:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ❌ Mistake 2: Wrong header name
```
Auth: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Correct:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ❌ Mistake 3: Expired token
Tokens expire after 1 hour. If expired:
1. Use refresh token endpoint, OR
2. Login again to get new token

### ❌ Mistake 4: Not logged in
Trying to access protected endpoints without logging in first.

## Quick Start Testing Flow

1. **Register a new user** → Get access token
2. **Login** → Verify token works
3. **Create a workflow** → Test workflow creation
4. **Get all users** → Find user IDs for assignment
5. **Update workflow** → Test workflow updates
6. **Transition workflow** → Test state transitions
7. **Get audit logs** → Verify audit trail
8. **Test Python service** → Verify integration
9. **Test user management** → (Requires Manager/Admin role)

## Notes

- All timestamps are in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss`
- Pagination uses Spring Data Pageable (0-indexed pages)
- All endpoints return standardized `ApiResponse<T>` wrapper
- JWT tokens expire after 1 hour (3600 seconds)
- Refresh tokens expire after 7 days
- Use correlation IDs for request tracing
- Default admin credentials:
  - Username: `admin`
  - Password: `admin123`
  - Role: `Admin` (full access)

## Troubleshooting

### Still Getting 403?

1. **Check token format:**
   - Must start with `Bearer `
   - No extra spaces
   - Full token copied (can be very long)

2. **Verify token is valid:**
   - Try login again
   - Copy fresh token
   - Use immediately

3. **Check if endpoint requires specific role:**
   - Some endpoints need Manager/Admin role
   - Check API documentation for role requirements

4. **Verify user is enabled:**
   - User account must be enabled
   - Check with admin user

### Verify Authentication

Test if you're authenticated:

```http
GET http://localhost:8080/api/v1/users/1
Authorization: Bearer <your_token>
```

If you get user data → ✅ Authenticated  
If you get 403 → ❌ Not authenticated (check token)

## Pro Tips

1. **Token expires in 1 hour** - Refresh before it expires
2. **Refresh tokens expire in 7 days** - Login again if needed
3. **Use Postman environment variables** - Saves time
4. **Check token in JWT.io** - Decode to see expiration time
5. **Import Postman collection** - `IEODP_API_Collection.postman_collection.json`
6. **Use Swagger UI** - Interactive API documentation at `/swagger-ui.html`
7. **Check correlation IDs** - For request tracing across services

## Frontend Connection

### CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:3000` (React default)
- `http://localhost:*` (Any localhost port, e.g., 5173, 5174, 5175, etc.)

To change this, update `app.cors.allowed-origins` in `application.yaml`.

### API Endpoints for Frontend

#### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/refresh` - Refresh Token
- `POST /api/v1/auth/logout` - Logout

#### Workflows
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow
- `GET /api/v1/workflows/{id}` - Get workflow details
- `PUT /api/v1/workflows/{id}` - Update workflow
- `DELETE /api/v1/workflows/{id}` - Delete workflow
- `POST /api/v1/workflows/{id}/transition` - Transition workflow state

#### Users
- `GET /api/v1/users` - List users
- `GET /api/v1/users/{id}` - Get user details
- `PUT /api/v1/users/{id}` - Update user

#### Audit Logs
- `GET /api/v1/audit` - List audit logs

#### Python Service Integration
- `POST /api/v1/python/anomaly/detect` - Detect anomalies
- `POST /api/v1/python/risk/evaluate` - Evaluate risk
- `POST /api/v1/python/decision/evaluate` - Evaluate decision
- `POST /api/v1/python/ingestion/process` - Process ingestion
- `GET /api/v1/python/health` - Check Python service health
