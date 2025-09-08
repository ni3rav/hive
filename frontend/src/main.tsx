import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client.ts";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import RegisterPage from "./pages/Register";
import LoginPage from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout"; // Renamed for clarity
import { DashboardPage } from "./pages/Dashboard"; // The actual page content
import { ProfilePage } from "./pages/ProfilePage";

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />, // The layout with the sidebar
        children: [
          {
            index: true, // This makes it the default child for /dashboard
            element: <DashboardPage />,
          },
          // Add other nested dashboard routes here in the future
          // { path: "models", element: <ModelsPage /> },
        ],
      },
    ],
  },
  // Redirect root path to the dashboard
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  // Public routes
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard/profile",
    element:  <ProfilePage />, // Placeholder for Profile page
  },
]);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Toaster position="bottom-right" richColors/>
    <RouterProvider router={router} />
  </QueryClientProvider>
);