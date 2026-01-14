import time
import logging
from typing import Callable, Tuple, Type

logger = logging.getLogger(__name__)


class RetryConfig:
    """
    Central retry configuration for enterprise services
    """
    def __init__(
        self,
        retries: int = 3,
        delay: float = 1.0,
        backoff: float = 2.0,
        exceptions: Tuple[Type[Exception], ...] = (Exception,)
    ):
        self.retries = retries
        self.delay = delay
        self.backoff = backoff
        self.exceptions = exceptions


def retry(config: RetryConfig):
    """
    Retry decorator with exponential backoff

    Usage:
        @retry(RetryConfig(retries=3))
        def call_external_service():
            ...
    """

    def decorator(func: Callable):
        def wrapper(*args, **kwargs):
            attempt = 1
            current_delay = config.delay

            while True:
                try:
                    logger.info(
                        "Attempt %s for function %s",
                        attempt,
                        func.__name__
                    )
                    return func(*args, **kwargs)

                except config.exceptions as exc:
                    logger.warning(
                        "Failure in %s (attempt %s/%s): %s",
                        func.__name__,
                        attempt,
                        config.retries,
                        exc
                    )

                    if attempt >= config.retries:
                        logger.error(
                            "Retries exhausted for %s",
                            func.__name__
                        )
                        raise

                    time.sleep(current_delay)
                    current_delay *= config.backoff
                    attempt += 1

        return wrapper

    return decorator
