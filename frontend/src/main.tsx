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
import { lazyPage, lazyImport } from '@/components/editor/lazy';
import { Suspense, useEffect } from 'react';
import { Spinner } from './components/ui/spinner';
import { ThemeProvider } from '@/contexts/theme-context';
import { UnheadProvider } from '@unhead/react/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
const ApiKeysPage = lazyPage('/src/pages/ApiKeys.tsx');
const CategoriesPage = lazyPage('/src/pages/Category.tsx');
const MediaPage = lazyPage('/src/pages/Media.tsx');
const MemberPage = lazyPage('/src/pages/Member.tsx');
const InviteMember = lazyPage('/src/pages/InviteMember.tsx');
const DashboardLayout = lazyImport(
  () => import('./components/DashboardLayout'),
  'DashboardLayout',
);
const EditorLayout = lazyImport(
  () => import('./components/EditorLayout'),
  'EditorLayout',
);

// eslint-disable-next-line react-refresh/only-export-components
function RootRedirect() {
  const { data: user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      toast.info('Redirected to your workspaces');
      navigate('/workspaces', { replace: true });
    } else {
      toast.info('Please log in to continue');
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div className='flex h-screen w-screen items-center justify-center'>
      <Spinner className='size-5' />
    </div>
  );
}

const router = createBrowserRouter([
  // --- Public Routes ---
  {
    path: '/',
    element: <RootRedirect />,
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
            path: 'authors',
            element: <AuthorsPage />,
          },
          {
            path: 'categories',
            element: <CategoriesPage />,
          },
          {
            path: 'tags',
            element: <TagsPage />,
          },
          {
            path: 'media',
            element: <MediaPage />,
          },
          {
            path: 'posts',
            element: <PostPage />,
          },
          {
            path: 'members/invite',
            element: <InviteMember />,
          },
          {
            path: 'members',
            element: <MemberPage />,
          },
          {
            path: 'keys',
            element: <ApiKeysPage />,
          },
          { path: '*', element: <NotFound /> },
        ],
      },
      {
        path: '/dashboard/:workspaceSlug/editor',
        element: <EditorLayout />,
        children: [
          {
            index: true,
            element: <Editor />,
          },
          {
            path: ':postSlug',
            element: <EditPost />,
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
  <UnheadProvider>
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
    </ThemeProvider>
  </UnheadProvider>,
);
