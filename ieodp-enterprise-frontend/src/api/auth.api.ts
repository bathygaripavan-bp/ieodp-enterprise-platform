import apiClient from "./apiClient";
import type { RegisterPayload } from "./types";

export const authApi = {
  login: (data: { username: string; password: string }) =>
    apiClient.post("/auth/login", data),

  register: (data: RegisterPayload) =>
    apiClient.post("/auth/register", data),

  me: () =>
    apiClient.get("/auth/me"),

  refreshToken: (refreshToken: string) =>
    apiClient.post("/auth/refresh", { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post("/auth/logout", { refreshToken }),
};
