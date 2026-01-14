import apiClient from "./apiClient";

export const integrationApi = {
  triggerWorkflow: (data: any) =>
    apiClient.post("/integration/workflows/trigger", data),

  healthCheck: () =>
    apiClient.get("/integration/health"),
};
