import { createRoot } from 'react-dom/client';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client.ts';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ErrorFallback';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { lazyPage } from '@/components/editor/lazy';
import { Suspense } from 'react';
import { Spinner } from './components/ui/spinner';
import CategoriesManager from './components/Category/CategoryManager';
import MemberManager from './components/Member/MemberManager';
import InviteMemberPage from './components/Member/InviteMemberPage';
import { ThemeProvider } from '@/contexts/theme-context';

const LandingPage = lazyPage('/src/pages/LandingPage.tsx');
const RegisterPage = lazyPage('/src/pages/Register.tsx');
const LoginPage = lazyPage('/src/pages/Login.tsx');
const Verify = lazyPage('/src/pages/Verify.tsx', 'VerifyPage');
const ForgotPasswordPage = lazyPage('/src/pages/ForgotPassword.tsx');
const ResetPasswordPage = lazyPage('/src/pages/ResetPassword.tsx');
const NotFound = lazyPage<{ className?: string }>('/src/pages/NotFound.tsx');
const DashboardPage = lazyPage('/src/pages/Dashboard.tsx', 'DashboardPage');
const WorkspaceManagementPage = lazyPage(
  '/src/pages/WorkspaceManagement.tsx',
  'WorkspaceManagementPage',
);
const Editor = lazyPage('/src/pages/Editor.tsx');
const EditPost = lazyPage('/src/pages/EditPost.tsx');
const AuthorsPage = lazyPage('/src/pages/Author.tsx');
const TagsPage = lazyPage('/src/pages/Tag.tsx');
const PostPage = lazyPage('/src/pages/Post.tsx');
const ProfilePage = lazyPage('/src/pages/ProfilePage.tsx', 'ProfilePage');
const AcceptInvitePage = lazyPage('/src/pages/AcceptInvitePage.tsx');
const ApiKeysPage = lazyPage('/src/pages/ApiKeys.tsx', 'ApiKeysPage');

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
        path: '/accept-invite',
        element: <AcceptInvitePage />,
      },
      {
        path: '/workspaces',
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <WorkspaceManagementPage />
          </ErrorBoundary>
        ),
      },
      {
        path: '/dashboard',
        element: <Navigate to='/workspaces' replace />,
      },
      {
        path: '/dashboard/:workspaceSlug',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'editor/:postSlug',
            element: <EditPost />,
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
          {
            path: 'tags',
            element: <TagsPage />,
          },
          {
            path: 'posts',
            element: <PostPage />,
          },
          {
            path: 'members/invite',
            element: <InviteMemberPage />,
          },
          {
            path: 'members',
            element: <MemberManager />,
          },
          {
            path: 'keys',
            element: <ApiKeysPage />,
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
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <Toaster position='top-right' richColors />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense
          fallback={
            <div className='flex h-screen w-screen items-center justify-center'>
              <Spinner className='size-5' />
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  </ThemeProvider>,
);