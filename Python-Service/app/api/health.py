from fastapi import APIRouter
from datetime import datetime, UTC

router = APIRouter(prefix="/health", tags=["Health"])

# Endpoint: http://localhost:8000/health/health
@router.get("/health")
def health_check():
    return {
        "status": "UP",
        "timestamp": datetime.now(UTC).isoformat()
    }
