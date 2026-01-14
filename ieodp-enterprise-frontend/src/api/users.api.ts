import apiClient from "./apiClient";

export const usersApi = {
  getAll: (page = 0, size = 20, sort = "createdAt") =>
    apiClient.get("/users", {
      params: { page, size, sort },
    }),

  getById: (id: number) =>
    apiClient.get(`/users/${id}`),

  search: (search: string, page = 0, size = 20) =>
    apiClient.get("/users/search", {
      params: { search, page, size },
    }),

  getByRole: (role: string, page = 0, size = 20) =>
    apiClient.get(`/users/role/${role}`, {
      params: { page, size },
    }),

  update: (id: number, data: any) =>
    apiClient.put(`/users/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),

  // USER ANALYTICS: COUNTS BY ROLE
  getRoleStats: () =>
    apiClient.get("/users/stats/roles"),
};
