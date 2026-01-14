from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

# Test ingestion endpoint
@patch("app.api.ingestion.ingest_data")
def test_ingestion_triggers_processing(mock_ingest):
    payload = {
        "source": "erp",
        "payload": {"order_id": "O100"}
    }

    response = client.post("/ingestion/process", json=payload)

    assert response.status_code == 200
    mock_ingest.assert_called_once()
