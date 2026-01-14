from pydantic import BaseModel
from app.models.risk import RiskRequest, RiskResponse
from app.models.anomaly import AnomalyRequest, AnomalyResponse

class DecisionRequest(BaseModel):
    risk_input: RiskRequest
    anomaly_input: AnomalyRequest

class DecisionResponse(BaseModel):
    risk: RiskResponse
    anomaly: AnomalyResponse
