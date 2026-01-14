from fastapi import FastAPI
from app.api import health, risk, anomaly, ingestion, decision_support
from app.api import ingestion

app = FastAPI(title="Python Enterprise Service")

app.include_router(health.router)
app.include_router(risk.router)
app.include_router(anomaly.router)
app.include_router(ingestion.router)
app.include_router(decision_support.router)
