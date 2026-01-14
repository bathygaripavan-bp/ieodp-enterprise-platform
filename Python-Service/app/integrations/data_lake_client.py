import logging
from typing import Dict, Any

from app.utils.retries import retry, RetryConfig
from app.observability.metrics import INTEGRATION_CALLS

logger = logging.getLogger(__name__)


class DataLakeClient:
    """
    Client responsible for pushing data to enterprise data lake
    """

    def __init__(self):
        pass

    @retry(RetryConfig(retries=2))
    def write_record(self, dataset: str, record: Dict[str, Any]) -> None:
        """
        Simulated data lake ingestion (S3 / ADLS / BigQuery)
        """

        logger.info("Writing record to data lake dataset=%s", dataset)

        # Simulated success
        INTEGRATION_CALLS.labels(system="data_lake", status="success").inc()
