import { createRoot } from 'react-dom/client';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client.ts';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ErrorFallback';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { lazyPage } from '@/components/editor/lazy';
import { Suspense } from 'react';
import { Spinner } from './components/ui/spinner';
import CategoriesManager from './components/Category/CategoryManager';

const LandingPage = lazyPage('/src/pages/LandingPage.tsx');
const RegisterPage = lazyPage('/src/pages/Register.tsx');
const LoginPage = lazyPage('/src/pages/Login.tsx');
const Verify = lazyPage('/src/pages/Verify.tsx', 'VerifyPage');
const ForgotPasswordPage = lazyPage('/src/pages/ForgotPassword.tsx');
const ResetPasswordPage = lazyPage('/src/pages/ResetPassword.tsx');
const NotFound = lazyPage<{ className?: string }>('/src/pages/NotFound.tsx');
const DashboardPage = lazyPage('/src/pages/Dashboard.tsx', 'DashboardPage');
const Editor = lazyPage('/src/pages/Editor.tsx');
const AuthorsPage = lazyPage('/src/pages/Author.tsx');
const ProfilePage = lazyPage('/src/pages/ProfilePage.tsx', 'ProfilePage');
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
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset',
    element: <ResetPasswordPage />,
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
          {
            path: 'categories', 
            element: <CategoriesManager />,
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
      <Suspense
        fallback={
          <div className='flex items-center justify-center p-8'>
            <Spinner />
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  </QueryClientProvider>,
);
