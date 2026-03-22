import { Navigate, Outlet, useLocation } from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";

const AdminRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Verifying Credentials...</div>;
  }

  // If NO user exists OR user is NOT an admin
  if (!user || user.role !== "admin") {
    console.warn("Unauthorized access attempt to Admin Route.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;

