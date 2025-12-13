import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export default function RoleGuard({ allowedRoles, children }) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
