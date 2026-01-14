from fastapi import APIRouter
from app.models.anomaly import AnomalyRequest, AnomalyResponse
from app.services.anomaly_engine import detect_anomaly

router = APIRouter(prefix="/anomaly", tags=["Anomaly"])

# Endpoint: http://localhost:8000/anomaly/detect
@router.post("/detect", response_model=AnomalyResponse)
def detect(payload: AnomalyRequest):
    return detect_anomaly(payload)
