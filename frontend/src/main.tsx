import { createRoot } from 'react-dom/client';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client.ts';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardPage } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import { Verify } from './pages/Verify';
import Editor from './pages/Editor';

const router = createBrowserRouter([
  // --- Public Routes ---
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/verify',
    element: <Verify />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // --- Protected Routes ---
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />, // This layout has the sidebar
        children: [
          {
            index: true, // This renders at /dashboard
            element: <DashboardPage />,
          },
          {
            path: 'editor', // This renders at /dashboard/editor
            element: <Editor />,
          },
        ],
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Toaster position='bottom-right' richColors />
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
