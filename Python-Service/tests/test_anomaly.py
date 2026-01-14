from app.services.processor import detect_anomaly


def test_normal_data():
    data = [10, 12, 11, 10]
    assert detect_anomaly(data) is False


def test_anomalous_data():
    data = [10, 11, 9, 500]
    assert detect_anomaly(data) is True
