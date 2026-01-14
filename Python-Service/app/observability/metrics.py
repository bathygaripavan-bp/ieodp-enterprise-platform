from prometheus_client import Counter, Histogram, Gauge

"""
Enterprise Metrics for IEODP Python Services
Prometheus-compatible
"""

# ---------------------------
# API Metrics
# ---------------------------

REQUEST_COUNT = Counter(
    "ieodp_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)

REQUEST_LATENCY = Histogram(
    "ieodp_http_request_latency_seconds",
    "HTTP request latency",
    ["endpoint"]
)

# ---------------------------
# Integration Metrics
# ---------------------------

INTEGRATION_CALLS = Counter(
    "ieodp_integration_calls_total",
    "Total external integration calls",
    ["system", "status"]
)

INTEGRATION_LATENCY = Histogram(
    "ieodp_integration_latency_seconds",
    "Latency of integration calls",
    ["system"]
)

# ---------------------------
# AI / Decision Metrics
# ---------------------------

DECISION_OUTCOMES = Counter(
    "ieodp_decision_outcomes_total",
    "AI decision outcomes",
    ["decision"]
)

ANOMALY_DETECTED = Counter(
    "ieodp_anomalies_detected_total",
    "Total anomalies detected"
)

# ---------------------------
# Background Job Metrics
# ---------------------------

JOB_EXECUTION_TIME = Histogram(
    "ieodp_background_job_duration_seconds",
    "Background job execution time",
    ["job"]
)

JOB_FAILURES = Counter(
    "ieodp_background_job_failures_total",
    "Background job failures",
    ["job"]
)


# System Health Metrics
SERVICE_HEALTH = Gauge(
    "ieodp_service_health",
    "Service health status (1=UP, 0=DOWN)"
)
