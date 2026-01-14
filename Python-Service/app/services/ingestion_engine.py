from app.utils.logger import get_logger

logger = get_logger(__name__)

async def ingest_data(payload):
    logger.info(f"Ingesting data from {payload.source}")
    logger.info(f"Payload: {payload.payload}")
