# How to Run Python-Service Only

## Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

## Method 1: Using Existing Virtual Environment (Recommended)

### Step 1: Navigate to Python-Service Directory

```bash
cd "Python-Service"
```

### Step 2: Activate Virtual Environment

**On Windows:**
```bash
venv\Scripts\activate
```

**On Linux/Mac:**
```bash
source venv/bin/activate
```

### Step 3: Install/Update Dependencies (if needed)

```bash
pip install -r requirements.txt
```

### Step 4: Run the Service

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag enables auto-reload on code changes (useful for development).

### Step 5: Verify Service is Running

Open your browser or use curl:
```bash
curl http://localhost:8000/health/health
```

You should see:
```json
{
  "status": "UP",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Method 2: Create New Virtual Environment

If the existing venv doesn't work or you want a fresh setup:

### Step 1: Navigate to Python-Service Directory

```bash
cd "Python-Service"
```

### Step 2: Create Virtual Environment

```bash
python -m venv venv
```

### Step 3: Activate Virtual Environment

**On Windows:**
```bash
venv\Scripts\activate
```

**On Linux/Mac:**
```bash
source venv/bin/activate
```

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 5: Run the Service

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Method 3: Run Without Virtual Environment (Not Recommended)

### Step 1: Install Dependencies Globally

```bash
pip install fastapi uvicorn httpx apscheduler prometheus-client pytest
```

### Step 2: Navigate to Python-Service Directory

```bash
cd "Python-Service"
```

### Step 3: Run the Service

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Method 4: Using Docker

### Step 1: Build Docker Image

```bash
cd "Python-Service"
docker build -t python-service .
```

### Step 2: Run Docker Container

```bash
docker run -d -p 8000:8000 --name python-service python-service
```

### Step 3: Check Logs

```bash
docker logs python-service
```

### Step 4: Stop Container

```bash
docker stop python-service
docker rm python-service
```

---

## Service Endpoints

Once running, the service will be available at:

- **Base URL**: `http://localhost:8000`
- **Health Check**: `GET http://localhost:8000/health/health`
- **Anomaly Detection**: `POST http://localhost:8000/anomaly/detect`
- **Risk Evaluation**: `POST http://localhost:8000/risk/evaluate`
- **Decision Support**: `POST http://localhost:8000/decision/evaluate`
- **Data Ingestion**: `POST http://localhost:8000/ingestion/process`

## API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Testing the Service

### Test Health Endpoint

```bash
curl http://localhost:8000/health/health
```

### Test Anomaly Detection

```bash
curl -X POST http://localhost:8000/anomaly/detect \
  -H "Content-Type: application/json" \
  -d '{"metric": 125.5}'
```

### Test Risk Evaluation

```bash
curl -X POST http://localhost:8000/risk/evaluate \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000.0, "user_score": 75}'
```

### Test Decision Support

```bash
curl -X POST http://localhost:8000/decision/evaluate \
  -H "Content-Type: application/json" \
  -d '{"score": 65}'
```

### Test Ingestion

```bash
curl -X POST http://localhost:8000/ingestion/process \
  -H "Content-Type: application/json" \
  -d '{"source": "test", "payload": {"key": "value"}}'
```

## Troubleshooting

### Port Already in Use

If port 8000 is already in use, use a different port:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Module Not Found Errors

Make sure you're in the correct directory and virtual environment is activated:

```bash
# Check current directory
pwd  # Linux/Mac
cd   # Windows

# Verify virtual environment is active
# You should see (venv) in your terminal prompt
```

### Dependencies Not Installed

Reinstall dependencies:

```bash
pip install --upgrade -r requirements.txt
```

### Python Version Issues

Check Python version:

```bash
python --version
# Should be 3.10 or higher
```

## Running in Background (Linux/Mac)

Use `nohup` or `screen`:

```bash
# Using nohup
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > python-service.log 2>&1 &

# Using screen
screen -S python-service
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Press Ctrl+A then D to detach
```

## Running in Background (Windows)

Use PowerShell:

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'Python-Service'; venv\Scripts\activate; uvicorn app.main:app --host 0.0.0.0 --port 8000"
```

## Quick Start Script

Create a `run.bat` (Windows) or `run.sh` (Linux/Mac) file:

**run.bat (Windows):**
```batch
@echo off
cd Python-Service
call venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
```

**run.sh (Linux/Mac):**
```bash
#!/bin/bash
cd Python-Service
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Make it executable (Linux/Mac):
```bash
chmod +x run.sh
```

Then run:
```bash
./run.sh
```
