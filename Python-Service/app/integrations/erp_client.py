import logging
import httpx
from typing import Dict, Any

from app.config import settings
from app.utils.retries import retry, RetryConfig
from app.utils.exceptions import IntegrationError
from app.observability.metrics import INTEGRATION_CALLS

logger = logging.getLogger(__name__)


class ERPClient:
    """
    Client for ERP system integration
    """

    def __init__(self):
        self.base_url = settings.ERP_BASE_URL
        self.timeout = 5.0

    @retry(
        RetryConfig(
            retries=3,
            delay=2,
            exceptions=(httpx.RequestError, httpx.TimeoutException),
        )
    )
    def push_order_update(
        self, order_id: str, payload: Dict[str, Any]
    ) -> Dict[str, Any]:

        endpoint = f"{self.base_url}/orders/{order_id}/update"

        logger.info("Sending order update to ERP order_id=%s", order_id)

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(endpoint, json=payload)

            response.raise_for_status()

            INTEGRATION_CALLS.labels(system="erp", status="success").inc()
            return response.json()

        except Exception as exc:
            INTEGRATION_CALLS.labels(system="erp", status="failure").inc()
            logger.exception("ERP integration failed")
            raise IntegrationError("ERP system failure") from exc
