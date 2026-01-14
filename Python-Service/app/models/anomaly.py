from pydantic import BaseModel

class AnomalyRequest(BaseModel):
    metric: float

class AnomalyResponse(BaseModel):
    anomalous: bool
    score: float
    explanation: list[str]
