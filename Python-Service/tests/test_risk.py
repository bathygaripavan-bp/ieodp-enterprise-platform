from app.services.rule_engine import evaluate_risk


def test_low_risk():
    assert evaluate_risk(20) == "LOW"


def test_medium_risk():
    assert evaluate_risk(50) == "MEDIUM"


def test_high_risk():
    assert evaluate_risk(80) == "HIGH"
