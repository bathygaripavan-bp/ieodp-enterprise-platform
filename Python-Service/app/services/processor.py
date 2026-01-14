def detect_anomaly(data: list[int]) -> bool:
    if not data or len(data) < 2:
        return False

    avg = sum(data) / len(data)

    for value in data:
        if value > avg * 3:   
            return True

    return False

def process_data(source: str, payload: dict) -> None:
    # placeholder business logic
    pass
