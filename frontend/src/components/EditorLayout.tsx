import { Outlet, useParams, Navigate, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function EditorLayout() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const navigate = useNavigate();

  const {
    data: workspace,
    isLoading,
    error,
  } = useWorkspaceVerification(workspaceSlug);

  if (isLoading) {
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Spinner className='size-5' />
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return <Navigate to='/workspaces' replace />;
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '50rem',
        } as React.CSSProperties
      }
    >
      {/* Main content area that should fill the screen height like DashboardLayout */}
      <SidebarInset className='flex flex-col h-screen overflow-hidden'>
        <header className='flex h-16 shrink-0 items-center gap-2'>
          <div className='flex w-full items-center justify-between px-4'>
            {/* Back button (icon-only) */}
            <Button
              variant='ghost'
              size='icon'
              onClick={() => navigate(-1)}
              className='mr-2'
            >
              <ArrowLeft className='size-4' />
              <span className='sr-only'>Back</span>
            </Button>
            {/* Keep the expand/collapse trigger aligned with the right sidebar */}
            <SidebarTrigger />
          </div>
        </header>
        <main className='flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0 overflow-hidden'>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </SidebarInset>

      {/* Right-side sidebar specifically for the editor */}
      <Sidebar side='right' variant='floating' collapsible='offcanvas'>
        <SidebarHeader />
        <SidebarContent></SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}
