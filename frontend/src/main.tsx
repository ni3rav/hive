import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client.ts";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import RegisterPage from "./pages/Register";
import LoginPage from "./pages/Login";
import { Home } from "./pages/Home";
import { ProtectedRoute } from "./components/ProtectedRoute";

const router = createBrowserRouter([
   {
    element: <ProtectedRoute />, // 👈 2. Use ProtectedRoute as the parent
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/home",
        element: <Home />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Toaster position="bottom-right" richColors/>
    <RouterProvider router={router} />
  </QueryClientProvider>
);