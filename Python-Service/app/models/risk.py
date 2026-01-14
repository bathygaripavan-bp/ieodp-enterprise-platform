from pydantic import BaseModel
from typing import List

class RiskRequest(BaseModel):
    amount: float
    user_score: int

class RiskResponse(BaseModel):
    risk_level: str
    confidence: float
    reasons: List[str]
