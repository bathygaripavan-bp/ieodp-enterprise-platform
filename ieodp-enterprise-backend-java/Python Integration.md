# Python Integration Documentation

## Overview

The IEODP Java backend integrates with Python services in two ways:
1. **Java calls Python** - Java backend exposes endpoints that internally call Python FastAPI service
2. **Python calls Java** - Python service calls Java backend workflow endpoints

## Architecture

### Java Backend → Python Service

```
Java Backend (Port 8080)          Python Service (Port 8000)
┌─────────────────────┐            ┌─────────────────────┐
│ PythonServiceController│───────>│ FastAPI Endpoints   │
│  /api/v1/python/**  │            │  /anomaly/detect   │
└─────────────────────┘            │  /risk/evaluate    │
         │                          │  /decision/evaluate│
         v                          │  /ingestion/process│
┌─────────────────────┐            │  /health/health    │
│ PythonServiceClient │            └─────────────────────┘
│  (RestTemplate)     │
└─────────────────────┘
```

### Python Service → Java Backend

```
Python Service                    Java Backend (Port 8080)
┌─────────────────────┐            ┌─────────────────────┐
│ integration_engine.py│──────────>│ WorkflowController  │
│  (httpx client)     │            │ /api/v1/workflows/  │
└─────────────────────┘            │  {name}/trigger     │
                                   └─────────────────────┘
```

## Java Endpoints Calling Python Service

All endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

### 1. Anomaly Detection

**Java Endpoint:** `POST /api/v1/python/anomaly/detect`  
**Python Endpoint:** `POST http://localhost:8000/anomaly/detect`

**Request:**
```json
{
  "metric": 125.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "anomalous": false,
    "score": 0.12,
    "explanation": ["No deviation detected"]
  },
  "message": "Anomaly detection completed"
}
```

### 2. Risk Evaluation

**Java Endpoint:** `POST /api/v1/python/risk/evaluate`  
**Python Endpoint:** `POST http://localhost:8000/risk/evaluate`

**Request:**
```json
{
  "amount": 50000.0,
  "userScore": 75
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "riskLevel": "LOW",
    "confidence": 0.6,
    "reasons": ["Normal transaction"]
  },
  "message": "Risk evaluation completed"
}
```

### 3. Decision Support

**Java Endpoint:** `POST /api/v1/python/decision/evaluate`  
**Python Endpoint:** `POST http://localhost:8000/decision/evaluate`

**Request:**
```json
{
  "score": 65
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "decision": "REVIEW",
    "risk": "MEDIUM"
  },
  "message": "Decision evaluation completed"
}
```

### 4. Data Ingestion

**Java Endpoint:** `POST /api/v1/python/ingestion/process`  
**Python Endpoint:** `POST http://localhost:8000/ingestion/process`

**Request:**
```json
{
  "source": "external-system",
  "payload": {
    "dataType": "transaction",
    "records": [
      {
        "id": "TXN-001",
        "amount": 1000.00,
        "timestamp": "2026-01-10T20:00:00"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "accepted"
  },
  "message": "Ingestion processed successfully"
}
```

### 5. Health Check

**Java Endpoint:** `GET /api/v1/python/health`  
**Python Endpoint:** `GET http://localhost:8000/health/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "message": "Python service health check completed"
}
```

## Configuration

### application.yaml

```yaml
python:
  service:
    base-url: http://localhost:8000
    connect-timeout: 5000    # milliseconds
    read-timeout: 10000       # milliseconds
```

### Environment Variables

```bash
PYTHON_SERVICE_BASE_URL=http://python-service:8000
PYTHON_SERVICE_CONNECT_TIMEOUT=5000
PYTHON_SERVICE_READ_TIMEOUT=10000
```

## Python Service Calling Java Backend

### Endpoint Used by Python Service

The Python-service (`integration_engine.py`) calls:

```
POST /api/v1/workflows/{workflow_name}/trigger
```

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Source-System: python-integration-service
```

**Request Body:**
```json
{
  "source": "python-integration-service",
  "payload": {
    "source": "python_scheduler"
  },
  "action": "optional_action",
  "comments": "optional_comments",
  "workflowId": null,
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "SUCCESS",
    "success": true,
    "workflowId": null,
    "workflowName": "periodic_sync",
    "state": "TRIGGERED",
    "message": "Workflow trigger processed successfully",
    "timestamp": "2024-01-15T10:30:00",
    "correlationId": "abc123",
    "data": {
      "workflowName": "periodic_sync",
      "source": "python-integration-service",
      "payload": {
        "source": "python_scheduler"
      }
    }
  },
  "message": "Workflow triggered successfully",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Python Service Code Example

**Python Code (`integration_engine.py`):**
```python
def call_java_workflow(
    self,
    workflow_name: str,
    payload: Dict[str, Any],
    auth_token: str,
) -> Dict[str, Any]:
    """
    Notify Java workflow engine of a decision or event
    """
    url = f"{settings.JAVA_SERVICE_URL}/api/v1/workflows/{workflow_name}/trigger"
    
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json",
        "X-Source-System": "python-integration-service",
    }
    
    logger.info("Calling Java workflow [%s]", workflow_name)
    
    try:
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(url, json=payload, headers=headers)
        
        response.raise_for_status()
        logger.info("Java workflow [%s] executed successfully", workflow_name)
        
        return response.json()
    
    except httpx.HTTPStatusError as exc:
        logger.error(
            "Java workflow call failed [%s] - status=%s body=%s",
            workflow_name,
            exc.response.status_code,
            exc.response.text,
        )
        raise IntegrationError("Java workflow call failed") from exc
```

**Scheduler Usage (`scheduler.py`):**
```python
def sync_with_java(self):
    """
    Periodic sync job with Java workflow engine
    """
    try:
        logger.info("Running Java sync job")
        
        self.integration_engine.call_java_workflow(
            workflow_name="periodic_sync",
            payload={"source": "python_scheduler"},
            auth_token="internal-service-token",
        )
    except Exception as exc:
        logger.exception("Java sync job failed: %s", exc)
```

## Authentication

### Getting JWT Token

Python service needs a JWT token to authenticate with Java backend:

1. **Login:**
```bash
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

2. **Use the `accessToken` from response:**
```python
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json",
    "X-Source-System": "python-integration-service",
}
```

### Token Management

- **Access Token**: Short-lived (1 hour)
- **Refresh Token**: Long-lived (7 days)
- **Token Rotation**: New refresh token issued on each refresh

## Error Handling

### Java Service Errors

**Python Service Unavailable:**
```json
{
  "success": false,
  "message": "Python service unavailable",
  "errorCode": "BUSINESS_ERROR",
  "timestamp": "2024-01-15T10:30:00"
}
```

**HTTP Errors (4xx/5xx):**
```json
{
  "success": false,
  "message": "Python service error: 400 Bad Request",
  "errorCode": "BUSINESS_ERROR",
  "timestamp": "2024-01-15T10:30:00"
}
```

**Timeout Errors:**
```json
{
  "success": false,
  "message": "Python service unavailable (timeout)",
  "errorCode": "BUSINESS_ERROR",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Python Service Error Handling

**Python Code:**
```python
except httpx.HTTPStatusError as exc:
    logger.error(
        "Java workflow call failed [%s] - status=%s body=%s",
        workflow_name,
        exc.response.status_code,
        exc.response.text,
    )
    raise IntegrationError("Java workflow call failed") from exc
```

## URL Verification

### Python Service URLs

| Python Endpoint | Java Calls | Status |
|----------------|-----------|--------|
| `POST /anomaly/detect` | `{baseUrl}/anomaly/detect` | ✅ |
| `POST /risk/evaluate` | `{baseUrl}/risk/evaluate` | ✅ |
| `POST /decision/evaluate` | `{baseUrl}/decision/evaluate` | ✅ |
| `POST /ingestion/process` | `{baseUrl}/ingestion/process` | ✅ |
| `GET /health/health` | `{baseUrl}/health/health` | ✅ |

**Base URL**: `http://localhost:8000` (configurable via `python.service.base-url`)

### Java Backend URLs

| Java Endpoint | Python Calls | Status |
|--------------|-------------|--------|
| `POST /api/v1/workflows/{name}/trigger` | `{javaUrl}/api/v1/workflows/{name}/trigger` | ✅ |
| `GET /api/v1/integration/health` | `{javaUrl}/api/v1/integration/health` | ✅ |

## Backward Compatibility

The Java backend ensures Python-service code continues working:

### Endpoint Stability
- ✅ Endpoint path `/api/v1/workflows/{workflow_name}/trigger` remains unchanged
- ✅ HTTP method (POST) remains unchanged
- ✅ Request/response structure remains compatible

### Request Compatibility
- ✅ `source` field (required) - Always supported
- ✅ `payload` field (optional) - Always supported as Map/Object
- ✅ New optional fields added without breaking existing code

### Response Compatibility
- ✅ Response structure remains stable
- ✅ Existing fields never removed
- ✅ New fields added as optional

## Testing

### Test Java → Python

```bash
# 1. Get token
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.accessToken')

# 2. Detect anomaly
curl -X POST http://localhost:8080/api/v1/python/anomaly/detect \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"metric": 125.5}'
```

### Test Python → Java

```python
import httpx

# 1. Get token
login_response = httpx.post(
    "http://localhost:8080/api/v1/auth/login",
    json={"username": "admin", "password": "admin123"}
)
token = login_response.json()["data"]["accessToken"]

# 2. Call Java backend
trigger_response = httpx.post(
    "http://localhost:8080/api/v1/workflows/periodic_sync/trigger",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-Source-System": "python-integration-service"
    },
    json={
        "source": "python-integration-service",
        "payload": {"source": "python_scheduler"}
    }
)

print(trigger_response.json())
```

## Troubleshooting

### Python Service Not Available

**Error:** `Python service unavailable`

**Solution:**
1. Verify Python service is running: `curl http://localhost:8000/health/health`
2. Check `python.service.base-url` in `application.yaml`
3. Verify network connectivity between Java and Python services

### Timeout Errors

**Error:** `Python service unavailable (timeout)`

**Solution:**
1. Increase timeout values in `application.yaml`:
   ```yaml
   python:
     service:
       connect-timeout: 10000
       read-timeout: 30000
   ```
2. Check Python service performance
3. Verify network latency

### Authentication Errors

**Error:** `401 Unauthorized` or `403 Forbidden`

**Solution:**
1. Verify JWT token is valid and not expired
2. Check token format: `Bearer <token>`
3. Ensure Python service has valid credentials
4. Refresh token if expired

## Implementation Details

### Java Components

1. **PythonServiceController** (`com.company.platform.python.controller`)
   - Exposes REST endpoints under `/api/v1/python/**`
   - Handles HTTP requests/responses
   - Validates input using Jakarta Validation

2. **PythonServiceIntegrationService** (`com.company.platform.python.service`)
   - Business logic layer
   - Error handling and logging
   - Service orchestration

3. **PythonServiceClient** (`com.company.platform.python.client`)
   - HTTP client using RestTemplate
   - Calls Python FastAPI endpoints
   - Handles HTTP errors and timeouts

4. **DTOs** (`com.company.platform.python.dto`)
   - Request/Response DTOs matching Python service models
   - Validation annotations
   - JSON serialization support

5. **Configuration** (`com.company.platform.python.config`)
   - `PythonServiceConfig` - Configuration properties
   - `RestTemplateConfig` - RestTemplate bean configuration

## Future Enhancements

1. **Retry Logic** - Add retry mechanism for transient failures
2. **Circuit Breaker** - Implement circuit breaker pattern
3. **Caching** - Cache responses for health checks and static data
4. **Metrics** - Add Prometheus metrics for Python service calls
5. **Async Support** - Support async calls for better performance
