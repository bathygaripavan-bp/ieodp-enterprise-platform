from pydantic import BaseModel

class IngestionRequest(BaseModel):
    source: str
    payload: dict
