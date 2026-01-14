from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ingestion_engine import ingest_data

router = APIRouter(prefix="/ingestion", tags=["ingestion"])

class IngestionRequest(BaseModel):
    source: str
    payload: dict
    
# Endpoint: http://localhost:8000/ingestion/process
@router.post("/process")
async def ingest(payload: IngestionRequest):
    await ingest_data(payload)
    return {"status": "accepted"}

