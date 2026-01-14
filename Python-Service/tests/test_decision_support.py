from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_decision_support_api():
    payload = {
        "score": 85
    }

    response = client.post("/decision/evaluate", json=payload)

    assert response.status_code == 200
    assert "decision" in response.json()
