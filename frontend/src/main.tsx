import { createRoot } from "react-dom/client";
import "./index.css";
import { Home } from "@/pages/Home";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client.ts";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import Register from "./pages/Register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/auth/register",
    element: <Register/>,
  }
]);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Toaster position="bottom-right" richColors/>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
