import { Navigate, Outlet, useLocation } from "react-router";
import { getStoredUser } from "./auth";

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const user = getStoredUser();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
