import logging
import httpx
from typing import Dict, Any

from app.config import settings
from app.utils.retries import retry, RetryConfig
from app.utils.exceptions import IntegrationError

logger = logging.getLogger(__name__)


class IntegrationEngine:
    """
    Handles all outbound integrations:
    - Java Workflow Engine
    - ERP / CRM systems
    - External decision systems
    """

    def __init__(self):
        self.timeout = 5.0

    @retry(
        RetryConfig(
            retries=3,
            delay=1,
            backoff=2,
            exceptions=(httpx.RequestError, httpx.TimeoutException),
        )
    )
    def call_java_workflow(
        self,
        workflow_name: str,
        payload: Dict[str, Any],
        auth_token: str,
    ) -> Dict[str, Any]:
        """
        Notify Java workflow engine of a decision or event
        """
        url = f"{settings.JAVA_SERVICE_URL}/workflows/{workflow_name}/trigger"

        headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json",
            "X-Source-System": "python-integration-service",
        }

        logger.info("Calling Java workflow [%s]", workflow_name)

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(url, json=payload, headers=headers)

            response.raise_for_status()
            logger.info("Java workflow [%s] executed successfully", workflow_name)

            return response.json()

        except httpx.HTTPStatusError as exc:
            logger.error(
                "Java workflow call failed [%s] - status=%s body=%s",
                workflow_name,
                exc.response.status_code,
                exc.response.text,
            )
            raise IntegrationError("Java workflow call failed") from exc

    @retry(RetryConfig(retries=2, delay=1))
    def call_external_system(
        self,
        system_name: str,
        endpoint: str,
        payload: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generic external system integration
        """
        logger.info("Calling external system [%s]", system_name)

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(endpoint, json=payload)

            response.raise_for_status()
            return response.json()

        except httpx.RequestError as exc:
            logger.error(
                "External system [%s] unavailable: %s",
                system_name,
                exc,
            )
            raise IntegrationError(
                f"External system {system_name} unreachable"
            ) from exc
