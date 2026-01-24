import apiClient from "./apiClient";

export const pythonApi = {
  evaluateRisk: (data: any) =>
    apiClient.post("/python/risk/evaluate", data),

  processIngestion: (data: any) =>
    apiClient.post("/python/ingestion/process", data),

  evaluateDecision: (data: any) =>
    apiClient.post("/python/decision/evaluate", data),

  detectAnomaly: (data: any) =>
    apiClient.post("/python/anomaly/detect", data),

  healthCheck: () => apiClient.get("/python/health"),
};
