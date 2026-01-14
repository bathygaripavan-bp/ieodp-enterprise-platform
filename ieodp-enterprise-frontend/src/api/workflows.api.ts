import apiClient from "./apiClient";

export const workflowsApi = {
  // CREATE WORKFLOW
  create: (data: any) =>
    apiClient.post("/workflows", data),

  // GET ALL WORKFLOWS (Paginated)
  getAll: (page = 0, size = 20, sort = "createdAt,DESC") =>
    apiClient.get("/workflows", {
      params: { page, size, sort },
    }),

  // GET WORKFLOW BY ID
  getById: (id: number) =>
    apiClient.get(`/workflows/${id}`),

  // UPDATE WORKFLOW
  update: (id: number, data: any) =>
    apiClient.put(`/workflows/${id}`, data),

  // DELETE WORKFLOW
  delete: (id: number) =>
    apiClient.delete(`/workflows/${id}`),

  // TRANSITION WORKFLOW STATE (Approve, Reject, Submit, Review etc)
  transition: (id: number, data: { action: string; comments?: string }) =>
    apiClient.post(`/workflows/${id}/transition`, data),

  // TRIGGER WORKFLOW BY NAME (Python / Integration)
  triggerByName: (workflowName: string, data: any) =>
    apiClient.post(`/workflows/${workflowName}/trigger`, data),

  // SEARCH WORKFLOWS
  search: (params: {
    state?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }) =>
    apiClient.get("/workflows/search", { params }),
};
