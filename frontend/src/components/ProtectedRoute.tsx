import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; 
export const ProtectedRoute = () => {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading session...</div>;
  }

  // If a user exists, show the requested page.
  // Otherwise, redirect to the login page.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};