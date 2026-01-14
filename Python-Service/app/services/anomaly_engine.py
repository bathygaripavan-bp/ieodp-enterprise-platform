from app.models.anomaly import AnomalyRequest, AnomalyResponse

def detect_anomaly(payload: AnomalyRequest) -> AnomalyResponse:
    return AnomalyResponse(
        anomalous=False,
        score=0.12,
        explanation=["No deviation detected"]
    )
