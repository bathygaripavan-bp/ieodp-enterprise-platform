from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/decision", tags=["decision"])

class DecisionRequest(BaseModel):
    score: int
    
# Endpoint: http://localhost:8000/decision/evaluate
@router.post("/evaluate")
def evaluate(payload: DecisionRequest):
    if payload.score >= 80:
        risk = "HIGH"
        decision = "REJECT"
    elif payload.score >= 50:
        risk = "MEDIUM"
        decision = "REVIEW"
    else:
        risk = "LOW"
        decision = "APPROVE"

    return {
        "decision": decision,   
        "risk": risk
    }
