import { Outlet, useParams, Navigate } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import { Spinner } from '@/components/ui/spinner';

export function DashboardLayout() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const {
    data: workspace,
    isLoading,
    error,
  } = useWorkspaceVerification(workspaceSlug);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className='flex flex-col h-screen overflow-hidden'>
          <header className='flex h-16 shrink-0 items-center gap-2'>
            <div className='flex items-center gap-2 px-4'>
              <SidebarTrigger />
            </div>
          </header>
          <main className='flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0 overflow-hidden'>
            <div className='flex items-center justify-center h-full'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Spinner className='size-5' />
                <span>Verifying workspace…</span>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !workspace) {
    return <Navigate to='/workspaces' replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='flex flex-col h-screen overflow-hidden'>
        <header className='flex h-16 shrink-0 items-center gap-2'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger />
          </div>
        </header>
        <main className='flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0 overflow-hidden'>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
