import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { Role } from "../types/auth";


export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  role: Role | null;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem("accessToken"),
  role: (localStorage.getItem("role") as Role) || null,
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ role: Role; user: User }>) => {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.user = action.payload.user;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("user");
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.role = null;
      state.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
    },
  },
});

export const { login, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
