import { createRoot } from 'react-dom/client';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client.ts';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ErrorFallback';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardPage } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import { Verify } from './pages/Verify';
import Editor from './pages/Editor';
import AuthorsPage from './pages/Author';
import NotFound from './pages/NotFound';
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

  { path: '*', element: <NotFound className='h-screen' /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'editor',
            element: <Editor />,
          },
          {
            path: 'authors',
            element: <AuthorsPage />,
          },
          { path: '*', element: <NotFound /> },
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
    <Toaster position='top-right' richColors />
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </QueryClientProvider>,
);
