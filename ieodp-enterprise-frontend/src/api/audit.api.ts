import apiClient from "./apiClient";

export const auditApi = {
  getAll: (params?: any) =>
    apiClient.get("/audit", { params }),

  getByEntity: (
    entityType: string,
    entityId: number,
    page = 0,
    size = 50
  ) =>
    apiClient.get(`/audit/entity/${entityType}/${entityId}`, {
      params: { page, size },
    }),
};
