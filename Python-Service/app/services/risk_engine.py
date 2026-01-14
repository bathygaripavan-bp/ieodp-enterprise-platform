from app.models.risk import RiskRequest, RiskResponse

def evaluate_risk(payload: RiskRequest) -> RiskResponse:
    if payload.amount > 100000:
        return RiskResponse(
            risk_level="HIGH",
            confidence=0.9,
            reasons=["High transaction amount"]
        )

    return RiskResponse(
        risk_level="LOW",
        confidence=0.6,
        reasons=["Normal transaction"]
    )
