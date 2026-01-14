import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.services.integration_engine import IntegrationEngine
from app.services.processor import cleanup_stale_records
from app.observability.metrics import JOB_EXECUTION_TIME, JOB_FAILURES

logger = logging.getLogger(__name__)


class JobScheduler:
    """
    Central scheduler for background & workflow-supporting jobs
    """

    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.integration_engine = IntegrationEngine()

    def start(self):
        logger.info("Starting background job scheduler")

        self.scheduler.add_job(
            self.sync_with_java,
            trigger=IntervalTrigger(minutes=5),
            id="java_sync_job",
            replace_existing=True,
        )

        self.scheduler.add_job(
            self.cleanup_job,
            trigger=IntervalTrigger(hours=1),
            id="cleanup_job",
            replace_existing=True,
        )

        self.scheduler.start()

    def shutdown(self):
        logger.info("Shutting down background job scheduler")
        self.scheduler.shutdown(wait=False)

    def sync_with_java(self):
        """
        Periodic sync job with Java workflow engine
        """
        start_time = datetime.utcnow()
        job_name = "java_sync"

        try:
            logger.info("Running Java sync job")

            self.integration_engine.call_java_workflow(
                workflow_name="periodic_sync",
                payload={"source": "python_scheduler"},
                auth_token="internal-service-token",
            )

            duration = (datetime.utcnow() - start_time).total_seconds()
            JOB_EXECUTION_TIME.labels(job=job_name).observe(duration)

        except Exception as exc:
            logger.exception("Java sync job failed: %s", exc)
            JOB_FAILURES.labels(job=job_name).inc()

    def cleanup_job(self):
        """
        Cleanup stale or expired records
        """
        start_time = datetime.utcnow()
        job_name = "cleanup_job"

        try:
            logger.info("Running cleanup job")
            cleanup_stale_records()

            duration = (datetime.utcnow() - start_time).total_seconds()
            JOB_EXECUTION_TIME.labels(job=job_name).observe(duration)

        except Exception as exc:
            logger.exception("Cleanup job failed: %s", exc)
            JOB_FAILURES.labels(job=job_name).inc()
