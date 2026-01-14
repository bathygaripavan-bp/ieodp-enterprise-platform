from fastapi import APIRouter
from app.models.risk import RiskRequest, RiskResponse
from app.services.risk_engine import evaluate_risk

router = APIRouter(prefix="/risk", tags=["Risk"])

# Endpoint: http://localhost:8000/risk/evaluate
@router.post("/evaluate", response_model=RiskResponse)
def evaluate(payload: RiskRequest):
    return evaluate_risk(payload)
