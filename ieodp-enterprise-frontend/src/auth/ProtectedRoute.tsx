import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import type { Role } from "../types/auth";


interface Props {
  allowedRoles: Role[];
  children: ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { isAuthenticated, role } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
