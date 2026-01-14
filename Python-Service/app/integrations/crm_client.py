import logging
import httpx
from typing import Dict, Any

from app.config import settings
from app.utils.retries import retry, RetryConfig
from app.utils.exceptions import IntegrationError
from app.observability.metrics import INTEGRATION_CALLS, INTEGRATION_LATENCY

logger = logging.getLogger(__name__)


class CRMClient:
    """
    Client for CRM system integration
    """

    def __init__(self):
        self.base_url = settings.CRM_BASE_URL
        self.timeout = 5.0

    @retry(
        RetryConfig(
            retries=3,
            delay=1,
            backoff=2,
            exceptions=(httpx.RequestError, httpx.TimeoutException),
        )
    )
    def push_customer_event(
        self, customer_id: str, payload: Dict[str, Any]
    ) -> Dict[str, Any]:

        endpoint = f"{self.base_url}/customers/{customer_id}/events"

        logger.info("Sending event to CRM for customer=%s", customer_id)

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(endpoint, json=payload)

            response.raise_for_status()

            INTEGRATION_CALLS.labels(system="crm", status="success").inc()
            return response.json()

        except Exception as exc:
            INTEGRATION_CALLS.labels(system="crm", status="failure").inc()
            logger.exception("CRM integration failed")
            raise IntegrationError("CRM system failure") from exc
