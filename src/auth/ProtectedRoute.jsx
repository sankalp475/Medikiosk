import { Navigate, Outlet, useLocation } from "react-router";
import { getDashboardPath, getStoredUser } from "./auth";

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}
