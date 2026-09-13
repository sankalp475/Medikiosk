import { Navigate, Outlet, useLocation } from "react-router";
import { getDashboardPath, getStoredUser } from "./auth";

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const user = getStoredUser();

  const loginPath = allowedRoles?.includes("admin")
    ? "/dashboard/admin/login"
    : "/dashboard/doctor/login";

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
