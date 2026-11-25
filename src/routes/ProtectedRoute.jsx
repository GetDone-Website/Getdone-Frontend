import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../utils/constants.js";

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
